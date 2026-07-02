export interface TraceResult {
  found: boolean
  lot_number: string
  batch?: Record<string, unknown>
  product?: { name?: string; category?: string }
  timeline?: TimelineEvent[]
  graph?: { nodes: GraphNode[]; edges: unknown[] }
  compliance?: { score: number; grade: string; trace_complete: boolean }
  cold_chain?: { status: string; risk: string; violations: Violation[] }
  integrity?: { valid: boolean; events_checked?: number }
  trace_gap?: boolean
  error?: string
}

export interface TimelineEvent {
  sequence: number
  event_type: string
  node_name: string
  node_id: string
  timestamp: string
  temperature_c: number | null
  document_ref: string
  metadata?: Record<string, unknown>
}

export interface GraphNode {
  id: string
  name: string
  type: string
  city?: string
}

export interface Violation {
  shipment_id: string
  from_node_id: string
  to_node_id: string
  max_temp_c: number
  limit_c: number
  note: string
}

export interface RecallResult {
  allowed: boolean
  severity?: string
  requires_human_approval?: boolean
  retail_impacts?: { name: string; units: number; action: string; node_id: string }[]
  units_affected?: number
  stakeholder_notices?: { to: string; subject: string; body: string }[]
  reason_blocked?: string
}

export interface BatchSummary {
  lot_number: string
  product_name: string
  compliance_score?: number
  cold_chain_status?: string
  trace_gap?: boolean
}
