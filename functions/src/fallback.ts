import { executeTool } from './tools.js'

function extractLot(message: string, contextLot?: string): string {
  const match = message.match(/LOT-\d{4}-\d{4}/i)
  return match?.[0]?.toUpperCase() || contextLot || 'LOT-2026-0421'
}

export async function runFallbackAgent(message: string, contextLot?: string): Promise<string> {
  const lot = extractLot(message, contextLot)
  const lower = message.toLowerCase()

  if (lower.includes('list') && lower.includes('batch')) {
    const data = JSON.parse(await executeTool('list_batches', {}))
    return `Active batches: ${(data.batches as string[]).join(', ')}`
  }

  if (lower.includes('recall') || lower.includes('simulate')) {
    const node = lot.includes('0199') ? 'istanbul_cannery' : 'dubai_plant'
    const data = JSON.parse(await executeTool('simulate_recall', { lot_number: lot, contamination_node_id: node, reason: 'risk' }))
    if (!data.allowed) return `Recall blocked for ${lot}: ${data.reason_blocked}`
    return `Recall simulation ${lot}: ${data.retail_impacts?.length ?? 0} retailers, ${data.units_affected} units. Severity: ${data.severity}.`
  }

  const trace = JSON.parse(await executeTool('trace_batch', { lot_number: lot }))
  if (!trace.found) return `Batch ${lot} not found.`

  return [
    `Trace ${lot} — ${trace.product?.name ?? 'product'}`,
    `Compliance: ${trace.compliance?.score}% (${trace.compliance?.grade})`,
    `Cold chain: ${trace.cold_chain?.status}, risk ${trace.cold_chain?.risk}`,
    `Integrity: ${trace.integrity?.valid ? 'valid' : 'invalid'}`,
    trace.trace_gap ? 'Warning: incomplete trace gap detected.' : 'Trace chain complete.',
  ].join('\n')
}
