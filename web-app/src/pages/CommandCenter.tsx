import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchBatches, type BatchSummary } from '../api/client'
import { useLot } from '../context/LotContext'
import { Icon } from '../components/Icon'
import { LoadingState } from '../components/LoadingState'
import { ChartCard } from '../components/charts/ChartCard'
import { ComplianceBarChart } from '../components/charts/ComplianceBarChart'
import { ActivityDotChart } from '../components/charts/ActivityDotChart'

const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function CommandCenter() {
  const navigate = useNavigate()
  const { lot, setLot } = useLot()
  const [search, setSearch] = useState(lot)
  const [batches, setBatches] = useState<BatchSummary[]>([])
  const [demoLots, setDemoLots] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBatches()
      .then((d) => {
        setBatches(d.batches)
        setDemoLots(d.demo_lots)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const goTrace = (l: string) => {
    setLot(l)
    setSearch(l)
    navigate('/explorer')
  }

  const alerts = batches.filter((b) => b.cold_chain_status === 'FAIL').length
  const avgCompliance =
    batches.length > 0
      ? (batches.reduce((s, b) => s + (b.compliance_score || 0), 0) / batches.length).toFixed(1)
      : '—'

  const complianceChart = batches.map((b) => ({
    lot: b.lot_number,
    score: b.compliance_score ?? 0,
    cold: b.cold_chain_status ?? 'PASS',
  }))

  const activityChart = WEEK.map((day, i) => ({
    day,
    events: 3 + i,
    compliance: 88 + i * 2 + (alerts > 0 ? -5 : 5),
  }))

  if (loading) return <LoadingState label="Connecting to Firestore…" />

  return (
    <main className="p-6 md:p-10 max-w-7xl mx-auto">
      <section className="mb-10">
        <div className="flex items-center gap-2 text-primary text-xs font-mono mb-3">
          <Icon name="verified" size={16} />
          Enterprise Traceability Platform
        </div>
        <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-2 tracking-tight">
          Supply Chain Command Center
        </h2>
        <p className="text-lg text-on-surface-variant max-w-2xl">
          Real-time batch intelligence — Firestore data plane, Gemini AI control plane.
        </p>
      </section>

      <section className="mb-10 max-w-3xl">
        <div className="glass-panel rounded-2xl p-5 shadow-lg">
          <div className="relative flex items-center">
            <Icon name="search" className="absolute left-4 text-on-surface-variant" size={24} />
            <input
              className="w-full bg-surface-dim rounded-xl py-4 pl-14 pr-14 font-mono text-text-primary text-lg border border-border-subtle focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
              placeholder="Enter Lot Number (e.g. LOT-2026-0421)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && goTrace(search)}
            />
            <button
              onClick={() => goTrace(search)}
              className="absolute right-3 p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition"
              aria-label="Trace batch"
            >
              <Icon name="arrow_forward" size={24} />
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 items-center">
            <span className="text-[10px] text-text-muted uppercase tracking-wider mr-1">Quick select:</span>
            {demoLots.map((l) => {
              const warn = l.includes('0199')
              const alert = l.includes('0315')
              return (
                <button
                  key={l}
                  onClick={() => goTrace(l)}
                  className="px-3 py-1.5 rounded-full bg-surface-container-high border border-border-subtle font-mono text-[11px] hover:border-primary hover:text-primary flex items-center gap-1.5 transition"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${warn ? 'bg-warning' : alert ? 'bg-danger' : 'bg-success'}`}
                  />
                  {l}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard icon="package_2" label="Active Batches" value={String(batches.length)} badge="LIVE" />
        <KpiCard icon="shield_lock" label="Avg Compliance" value={`${avgCompliance}%`} trend="+1.2%" />
        <KpiCard
          icon="device_thermostat"
          label="Cold-Chain Alerts"
          value={String(alerts)}
          onClick={() => {
            setLot('LOT-2026-0315')
            navigate('/monitor')
          }}
          danger
        />
        <KpiCard
          icon="emergency_home"
          label="Recall Simulator"
          value="Ready"
          onClick={() => navigate('/simulator')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        <div className="lg:col-span-7">
          <ChartCard
            title="Batch Compliance"
            value={`${avgCompliance}%`}
            subtitle="Per-lot traceability score"
            trend="+2.4% vs last week"
            trendUp
            icon="analytics"
            iconColor="text-violet-400 bg-violet-400/10 border-violet-400/20"
          >
            <ComplianceBarChart data={complianceChart} />
          </ChartCard>
        </div>
        <div className="lg:col-span-5">
          <ChartCard
            title="Trace Activity"
            value="7 days"
            subtitle="Compliance trend index"
            trend="+13% momentum"
            trendUp
            icon="timeline"
            iconColor="text-warning bg-warning/10 border-warning/20"
          >
            <ActivityDotChart data={activityChart} />
          </ChartCard>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border-subtle flex justify-between items-center">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Icon name="history" size={18} className="text-primary" />
            Live Batch Registry
          </h3>
          <span className="text-[10px] text-success font-mono">Firestore · Real-time</span>
        </div>
        <ul className="divide-y divide-border-subtle/50 text-sm">
          {batches.map((b) => (
            <li
              key={b.lot_number}
              onClick={() => goTrace(b.lot_number)}
              className="p-4 hover:bg-surface-container-high cursor-pointer transition flex justify-between items-center gap-2"
            >
              <div>
                <p className="text-text-primary font-medium">{b.product_name}</p>
                <p className="font-mono text-[10px] text-text-muted">{b.lot_number}</p>
              </div>
              <span
                className={`text-[9px] px-2 py-0.5 rounded font-mono shrink-0 ${
                  b.cold_chain_status === 'FAIL'
                    ? 'bg-danger/10 text-danger'
                    : 'bg-success/10 text-success'
                }`}
              >
                {b.compliance_score}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}

function KpiCard({
  icon,
  label,
  value,
  badge,
  trend,
  onClick,
  danger,
}: {
  icon: string
  label: string
  value: string
  badge?: string
  trend?: string
  onClick?: () => void
  danger?: boolean
}) {
  return (
    <div
      onClick={onClick}
      className={`glass-card rounded-2xl p-6 transition-colors ${
        onClick ? 'cursor-pointer hover:bg-surface-container-high' : ''
      } ${danger ? 'border border-danger/30' : ''}`}
    >
      <div className="flex justify-between mb-4">
        <Icon name={icon} className={danger ? 'text-danger' : 'text-on-surface-variant'} size={28} />
        {badge && (
          <span className="text-[10px] text-success bg-success/10 px-2 py-0.5 rounded-full border border-success/20">
            {badge}
          </span>
        )}
      </div>
      <p className="text-xs text-on-surface-variant uppercase tracking-wide">{label}</p>
      <div className="flex items-baseline gap-2">
        <h3 className={`text-3xl font-bold ${danger ? 'text-danger' : 'text-text-primary'}`}>{value}</h3>
        {trend && <span className="font-mono text-xs text-success">{trend}</span>}
      </div>
    </div>
  )
}
