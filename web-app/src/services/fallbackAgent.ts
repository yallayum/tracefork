import {
  firestoreListBatches,
  firestoreRecall,
  firestoreTrace,
} from './firestoreService'
import type { TraceResult } from '../api/types'

function extractLot(message: string, contextLot?: string): string {
  const match = message.match(/LOT-\d{4}-\d{4}/i)
  return match?.[0]?.toUpperCase() || contextLot || 'LOT-2026-0421'
}

function formatTraceSummary(trace: TraceResult): string {
  if (!trace.found) {
    return `Batch **${trace.lot_number}** was not found in Firestore.`
  }
  const lines = [
    `## Trace Summary — ${trace.lot_number}`,
    `**Product:** ${trace.product?.name ?? '—'} (${trace.product?.category ?? '—'})`,
    `**Compliance:** ${trace.compliance?.score}% — ${trace.compliance?.grade}`,
    `**Cold Chain:** ${trace.cold_chain?.status} (risk: ${trace.cold_chain?.risk ?? '—'})`,
    `**Integrity:** ${trace.integrity?.valid ? 'Valid hash chain' : 'Tamper detected'}`,
    `**Trace complete:** ${trace.trace_gap ? 'No — gap detected' : 'Yes'}`,
  ]
  if (trace.cold_chain?.violations?.length) {
    lines.push('', '**Violations:**')
    for (const v of trace.cold_chain.violations) {
      lines.push(`- Peak ${v.max_temp_c}°C — ${v.note}`)
    }
  }
  if (trace.timeline?.length) {
    lines.push('', '**Timeline:**')
    for (const ev of trace.timeline.slice(0, 8)) {
      const temp = ev.temperature_c != null ? ` · ${ev.temperature_c}°C` : ''
      lines.push(`- ${ev.event_type} @ ${ev.node_name}${temp}`)
    }
  }
  return lines.join('\n')
}

/** Runs trace/recall tools directly when Gemini API is unavailable. */
export async function runFallbackAgent(message: string, contextLot?: string): Promise<string> {
  const lot = extractLot(message, contextLot)
  const lower = message.toLowerCase()

  if (lower.includes('list') && lower.includes('batch')) {
    const { batches } = await firestoreListBatches()
    const rows = batches.map(
      (b) =>
        `- **${b.lot_number}** — ${b.product_name} · ${b.compliance_score}% · Cold: ${b.cold_chain_status}`,
    )
    return `## Active Batches (${batches.length})\n\n${rows.join('\n')}`
  }

  if (lower.includes('recall') || lower.includes('simulate') || lower.includes('withdraw')) {
    const node = lot.includes('0315')
      ? 'riyadh_transit'
      : lot.includes('0199')
        ? 'istanbul_cannery'
        : 'dubai_plant'
    const recall = await firestoreRecall(lot, node, 'contamination risk')
    if (!recall.allowed) {
      return `## Recall Blocked — ${lot}\n\n${recall.reason_blocked}`
    }
    const retailers = recall.retail_impacts ?? []
    return [
      `## Recall Simulation — ${lot}`,
      `**Severity:** ${recall.severity}`,
      `**Units affected:** ${recall.units_affected}`,
      `**Retailers:** ${retailers.length} locations`,
      '',
      retailers.map((r) => `- ${r.name}: ${r.units} units → **${r.action}**`).join('\n'),
      '',
      recall.requires_human_approval
        ? '⚠️ CRITICAL recall — human approval required before execution.'
        : '',
    ].join('\n')
  }

  if (lower.includes('integrity') || lower.includes('tamper') || lower.includes('hash')) {
    const trace = await firestoreTrace(lot)
    const valid = trace.integrity?.valid
    return [
      `## Integrity Check — ${lot}`,
      valid
        ? `✅ Hash chain **valid** across ${trace.integrity?.events_checked ?? trace.timeline?.length ?? 0} events.`
        : `❌ Integrity **compromised** — missing or invalid hash fields.`,
    ].join('\n')
  }

  if (lower.includes('cold') || lower.includes('temperature') || lower.includes('chain')) {
    const trace = await firestoreTrace(lot)
    if (!trace.found) return `Batch ${lot} not found.`
    const v = trace.cold_chain?.violations ?? []
    return [
      `## Cold Chain — ${lot}`,
      `**Status:** ${trace.cold_chain?.status} · **Risk:** ${trace.cold_chain?.risk}`,
      v.length
        ? v.map((x) => `- Peak **${x.max_temp_c}°C** — ${x.note}`).join('\n')
        : '✅ All shipments within 4°C limit.',
    ].join('\n\n')
  }

  const trace = await firestoreTrace(lot)
  return formatTraceSummary(trace)
}
