import { useEffect, useState } from 'react'
import { fetchRecall, fetchTrace, type RecallResult } from '../api/client'
import { useLot } from '../context/LotContext'
import { Icon } from '../components/Icon'
import { LoadingState } from '../components/LoadingState'

const DEFAULT_NODES: Record<string, string> = {
  'LOT-2026-0421': 'dubai_plant',
  'LOT-2026-0315': 'riyadh_transit',
  'LOT-2026-0199': 'istanbul_cannery',
}

export default function RecallSimulator() {
  const { lot } = useLot()
  const [recall, setRecall] = useState<RecallResult | null>(null)
  const [approved, setApproved] = useState(false)
  const [traceGap, setTraceGap] = useState(false)
  const [loading, setLoading] = useState(true)
  const [reason, setReason] = useState('listeria risk at pasteurization')

  useEffect(() => {
    setLoading(true)
    const node = DEFAULT_NODES[lot] || 'dubai_plant'
    Promise.all([
      fetchTrace(lot).then((t) => setTraceGap(!!t.trace_gap)),
      fetchRecall(lot, node, reason).then(setRecall),
    ])
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [lot, reason])

  if (loading) return <LoadingState label="Simulating recall impact…" />

  const blocked = recall && !recall.allowed

  return (
    <main className="p-6 xl:p-10 max-w-7xl mx-auto">
      <div className="mb-8">
        {recall?.severity === 'CRITICAL' && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-danger/20 border border-danger/30 text-danger text-[10px] animate-pulse mb-2">
            <Icon name="warning" size={14} />
            CRITICAL SEVERITY
          </span>
        )}
        <h2 className="text-3xl font-bold text-text-primary flex items-center gap-2">
          <Icon name="emergency_home" className="text-danger" />
          Impact Preview
        </h2>
        <p className="text-sm text-text-muted mt-2 font-mono">{lot}</p>
        <input
          className="mt-4 w-full max-w-md bg-surface-container border border-border-subtle rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Recall reason"
        />
      </div>

      {blocked && (
        <div className="mb-6 p-4 rounded-lg border border-warning/50 bg-warning/10 text-warning text-sm flex items-start gap-2">
          <Icon name="block" size={20} className="shrink-0 mt-0.5" />
          {recall.reason_blocked}
        </div>
      )}

      {traceGap && (
        <div className="mb-6 p-4 rounded-lg border border-warning/50 bg-warning/10 text-warning text-sm flex items-start gap-2">
          <Icon name="warning" size={20} className="shrink-0 mt-0.5" />
          Trace incomplete — recall simulation blocked until distributor handoff is recorded.
        </div>
      )}

      {!blocked && recall?.allowed && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8 glass-panel rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Icon name="storefront" size={20} />
                Affected Retailers
              </h3>
              <span className="text-[10px] bg-surface-variant px-2 py-1 rounded font-mono">
                {recall.retail_impacts?.length ?? 0} IDENTIFIED
              </span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-[10px] text-text-muted uppercase">
                  <th className="px-6 py-3 text-left">Store</th>
                  <th className="px-6 py-3 text-left">Units</th>
                  <th className="px-6 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {recall.retail_impacts?.map((r) => (
                  <tr
                    key={r.node_id}
                    className="border-b border-border-subtle/50 hover:bg-surface-container-high/50"
                  >
                    <td className="px-6 py-4 font-medium">{r.name}</td>
                    <td className="px-6 py-4 font-mono">{r.units}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 rounded bg-danger/10 text-danger text-[9px] border border-danger/20 font-bold">
                        {r.action}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-6 border-t border-border-subtle">
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {recall.stakeholder_notices?.[0]?.body}
              </p>
            </div>
          </div>
          <div className="xl:col-span-4 glass-panel rounded-xl p-6 border-t-4 border-t-danger">
            <h4 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
              <Icon name="gavel" size={20} className="text-danger" />
              Execution Authority
            </h4>
            <p className="text-[11px] text-text-muted mb-4">
              Units affected:{' '}
              <span className="font-mono text-danger font-bold">{recall.units_affected}</span>
            </p>
            {recall.requires_human_approval && (
              <label className="flex items-start gap-3 mb-4 p-3 rounded-lg border border-border-subtle cursor-pointer hover:bg-surface-container-high/50">
                <input
                  type="checkbox"
                  checked={approved}
                  onChange={(e) => setApproved(e.target.checked)}
                  className="mt-1 accent-primary"
                />
                <span className="text-[11px]">I formally approve the recall plan for {lot}.</span>
              </label>
            )}
            <button
              disabled={recall.requires_human_approval && !approved}
              className="w-full bg-danger text-white py-4 rounded-lg font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2 hover:brightness-110 transition"
              onClick={() => alert('Recall protocol activated (demo)')}
            >
              <Icon name="warning" size={20} />
              ACTIVATE RECALL
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
