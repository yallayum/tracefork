import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

initializeApp()
export const db = getFirestore()

type Dict = Record<string, unknown>

export async function traceBatch(lot: string) {
  const batchRef = await db.collection('batches').doc(lot).get()
  if (!batchRef.exists) return { found: false, lot_number: lot }
  const batch = { id: batchRef.id, ...batchRef.data() } as Dict
  const productRef = await db.collection('products').doc(batch.product_id as string).get()
  const eventsSnap = await db
    .collection('batches')
    .doc(lot)
    .collection('events')
    .orderBy('sequence')
    .get()
  const events = eventsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Dict))
  const shipmentsSnap = await db.collection('shipments').where('batch_id', '==', lot).get()
  const shipments = shipmentsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Dict))
  const nodesSnap = await db.collection('nodes').get()
  const nodes: Record<string, Dict> = {}
  nodesSnap.forEach((d) => {
    nodes[d.id] = { id: d.id, ...d.data() }
  })
  const traceGap = events.some((e) => (e.metadata as Dict)?.trace_gap)
  let score = 100
  if (!events.length) score -= 30
  if (!shipments.length) score -= 10
  if (traceGap) score -= 25
  const violations = shipments
    .filter((s) => {
      const limit = (s.cold_chain_limit_c as number) ?? 4
      const max = s.max_temp_c as number | undefined
      return max != null && max > limit
    })
    .map((s) => ({ max_temp_c: s.max_temp_c, note: s.violation_note }))
  return {
    found: true,
    lot_number: lot,
    product: productRef.data(),
    compliance: { score, grade: score >= 90 ? 'EXCELLENT' : 'GOOD', trace_complete: !traceGap },
    cold_chain: { status: violations.length ? 'FAIL' : 'PASS', violations },
    integrity: { valid: events.every((e) => e.event_hash && e.prev_event_hash) },
    trace_gap: traceGap,
    timeline_count: events.length,
  }
}

export async function simulateRecall(lot: string, nodeId: string, reason: string) {
  const trace = await traceBatch(lot)
  if (!trace.found) return { allowed: false, reason_blocked: 'Batch not found' }
  if (trace.trace_gap) {
    return { allowed: false, reason_blocked: 'Trace incomplete — recall blocked.' }
  }
  const eventsSnap = await db
    .collection('batches')
    .doc(lot)
    .collection('events')
    .orderBy('sequence')
    .get()
  const events = eventsSnap.docs.map((d) => d.data() as Dict)
  const nodesSnap = await db.collection('nodes').get()
  const nodes: Record<string, Dict> = {}
  nodesSnap.forEach((d) => {
    nodes[d.id] = { id: d.id, ...d.data() }
  })
  const ordered = [...events].sort((a, b) => (a.sequence as number) - (b.sequence as number))
  let found = false
  const downstream: string[] = []
  for (const e of ordered) {
    const nid = e.node_id as string
    if (found && !downstream.includes(nid)) downstream.push(nid)
    if (nid === nodeId) found = true
  }
  const retail = downstream
    .filter((id) => nodes[id]?.type === 'retail')
    .map((id) => ({
      node_id: id,
      name: nodes[id]?.name || id,
      units: 100,
      action: 'WITHDRAW',
    }))
  return {
    allowed: true,
    severity: 'CRITICAL',
    retail_impacts: retail,
    units_affected: retail.length * 100,
    reason,
  }
}

export async function listBatches() {
  const snap = await db.collection('batches').get()
  return { batches: snap.docs.map((d) => d.id) }
}

export async function executeTool(name: string, args: Record<string, string>): Promise<string> {
  if (name === 'trace_batch') return JSON.stringify(await traceBatch(args.lot_number))
  if (name === 'simulate_recall') {
    return JSON.stringify(
      await simulateRecall(args.lot_number, args.contamination_node_id, args.reason || 'contamination'),
    )
  }
  if (name === 'verify_integrity') {
    const t = await traceBatch(args.lot_number)
    return JSON.stringify({ integrity: t.integrity })
  }
  if (name === 'list_batches') return JSON.stringify(await listBatches())
  return JSON.stringify({ error: `Unknown tool: ${name}` })
}
