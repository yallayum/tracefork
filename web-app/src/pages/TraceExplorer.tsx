import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchTrace, type TraceResult } from '../api/client'
import { useLot } from '../context/LotContext'
import { ComplianceRing } from '../components/ComplianceRing'
import { Icon } from '../components/Icon'
import { LoadingState } from '../components/LoadingState'
import { SupplyChainGraph } from '../components/SupplyChainGraph'

const EVENT_ICONS: Record<string, string> = {
  harvest: 'agriculture',
  process: 'precision_manufacturing',
  pack: 'inventory_2',
  receive: 'local_shipping',
  shelf: 'storefront',
}

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${
        ok
          ? 'text-success bg-success/10 border-success/30'
          : 'text-danger bg-danger/10 border-danger/30'
      }`}
    >
      <Icon name={ok ? 'check_circle' : 'error'} size={14} />
      {label}
    </span>
  )
}

export default function TraceExplorer() {
  const { lot } = useLot()
  const navigate = useNavigate()
  const [data, setData] = useState<TraceResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    fetchTrace(lot)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [lot])

  if (loading) return <LoadingState label={`Tracing ${lot} from Firestore…`} />
  if (error || !data?.found) {
    return (
      <main className="p-10 flex flex-col items-center gap-4 text-center">
        <Icon name="search_off" className="text-danger" size={48} />
        <p className="text-danger font-medium">{error || 'Batch not found'}</p>
        <p className="text-text-muted text-sm font-mono">{lot}</p>
      </main>
    )
  }

  const score = data.compliance?.score ?? 0

  return (
    <div className="flex flex-col xl:flex-row min-h-[calc(100vh-8rem)]">
      <section className="w-full xl:w-[42%] border-r border-border-subtle overflow-y-auto max-h-[50vh] xl:max-h-none">
        <div className="p-6 border-b border-border-subtle bg-surface-container/30">
          <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Active Trace</p>
          <h2 className="text-2xl font-bold text-text-primary font-mono">{lot}</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            {data.product?.name}
            <span className="mx-2 text-border-subtle">•</span>
            <span className="capitalize">{data.product?.category}</span>
          </p>
          {data.trace_gap && (
            <p className="mt-2 text-xs text-warning flex items-center gap-1">
              <Icon name="warning" size={14} />
              Incomplete trace — distributor handoff missing
            </p>
          )}
        </div>
        <div className="p-6 space-y-6">
          <div className="glass-card rounded-xl p-5">
            <p className="text-[10px] text-text-muted uppercase mb-4 tracking-wider">Compliance</p>
            <div className="flex items-center gap-5">
              <ComplianceRing score={score} />
              <div className="space-y-2">
                <p className="text-lg font-bold text-text-primary">{data.compliance?.grade}</p>
                <StatusBadge
                  ok={data.cold_chain?.status === 'PASS'}
                  label={`Cold Chain: ${data.cold_chain?.status}`}
                />
                <StatusBadge
                  ok={!!data.integrity?.valid}
                  label={`Integrity: ${data.integrity?.valid ? 'Valid' : 'Tampered'}`}
                />
              </div>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-text-muted uppercase mb-4 tracking-wider">
              Trace Chronology
            </p>
            <div className="space-y-0">
              {data.timeline?.map((ev, i) => {
                const isCold = ev.temperature_c != null && ev.temperature_c > 4
                return (
                  <div key={i} className="timeline-item relative pl-12 pr-2 py-2">
                    <div className="timeline-line" />
                    <div
                      className={`absolute left-3 top-4 w-7 h-7 rounded-full border-2 bg-surface-container flex items-center justify-center z-10 ${
                        isCold ? 'border-danger pulse-danger' : 'border-outline-variant'
                      }`}
                    >
                      <Icon
                        name={EVENT_ICONS[ev.event_type] || 'circle'}
                        size={14}
                        className={isCold ? 'text-danger' : 'text-primary'}
                      />
                    </div>
                    <div
                      className={`glass-card rounded-lg p-3 text-sm ${
                        isCold ? 'border-l-2 border-l-danger bg-danger/5' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-medium capitalize">{ev.event_type}</span>
                        <span className="font-mono text-[10px] text-text-muted shrink-0">
                          {ev.timestamp?.slice(0, 16).replace('T', ' ')}
                        </span>
                      </div>
                      <p className="text-text-muted text-xs mt-1">{ev.node_name}</p>
                      {ev.temperature_c != null && (
                        <p
                          className={`font-mono text-xs mt-1 ${isCold ? 'text-danger font-bold' : 'text-primary'}`}
                        >
                          {ev.temperature_c}°C
                        </p>
                      )}
                      <p className="font-mono text-[9px] text-text-muted/70 mt-1">{ev.document_ref}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full xl:w-[58%] min-h-[420px] graph-panel relative p-6 xl:p-10 flex flex-col border-t xl:border-t-0 border-border-subtle">
        <div className="absolute inset-0 opacity-[0.35] graph-panel-grid pointer-events-none" />
        <h3 className="relative z-10 text-sm font-semibold text-text-primary uppercase tracking-wider mb-6 flex items-center gap-2">
          <Icon name="account_tree" size={18} />
          Supply Chain Graph
        </h3>
        <div className="relative z-10 flex-1 flex items-center justify-center py-4 min-h-0">
          <SupplyChainGraph nodes={data.graph?.nodes ?? []} />
        </div>
        <div className="relative z-10 flex flex-wrap justify-end gap-2 mt-6">
          <button
            onClick={() => navigate('/monitor')}
            className="bg-primary-container text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 hover:brightness-110 transition shadow-sm"
          >
            <Icon name="ac_unit" size={16} />
            COLD CHAIN
          </button>
          <button
            onClick={() => navigate('/simulator')}
            className="bg-danger text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 hover:brightness-110 transition"
          >
            <Icon name="emergency_home" size={16} />
            SIMULATE RECALL
          </button>
        </div>
      </section>
    </div>
  )
}
