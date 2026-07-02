import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchTrace, type TraceResult } from '../api/client'
import { useLot } from '../context/LotContext'
import { Icon } from '../components/Icon'
import { LoadingState } from '../components/LoadingState'
import { ChartCard } from '../components/charts/ChartCard'
import { TemperatureAreaChart } from '../components/charts/TemperatureAreaChart'
import { buildTemperatureSeries } from '../utils/chartData'

export default function ColdChainMonitor() {
  const { lot } = useLot()
  const navigate = useNavigate()
  const [data, setData] = useState<TraceResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchTrace(lot)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [lot])

  if (loading) return <LoadingState label="Loading cold chain telemetry…" />

  const violations = data?.cold_chain?.violations ?? []
  const peak = Math.max(...violations.map((v) => v.max_temp_c), 0)
  const hasViolation = violations.length > 0
  const tempSeries = buildTemperatureSeries(data, lot)
  const latest = tempSeries[tempSeries.length - 1]?.temp ?? 0

  return (
    <main className="p-6 md:p-10 flex flex-col gap-6 pb-24 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Icon name="ac_unit" className="text-primary" />
            Cold Chain Analytics
          </h2>
          <p className="text-sm text-text-muted mt-2">
            Monitoring batch{' '}
            <span className="font-mono bg-surface-container px-2 py-1 rounded text-primary border border-border-subtle">
              {lot}
            </span>
            {data?.product?.name && (
              <span className="ml-2 text-on-surface-variant">— {data.product.name}</span>
            )}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full border ${
            hasViolation
              ? 'text-danger bg-danger/10 border-danger/30'
              : 'text-success bg-success/10 border-success/30'
          }`}
        >
          <Icon name={hasViolation ? 'warning' : 'verified'} size={16} />
          {data?.cold_chain?.status ?? '—'}
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ChartCard
            title="Temperature Telemetry"
            value={`${latest}°C`}
            subtitle="Live trace + shipment sensor fusion"
            trend={hasViolation ? `Peak ${peak}°C` : 'Within safe zone'}
            trendUp={!hasViolation}
            icon="device_thermostat"
            iconColor="text-primary bg-primary/10 border-primary/20"
            className="min-h-[420px]"
          >
            <TemperatureAreaChart data={tempSeries} limit={4} />
          </ChartCard>
        </div>

        <div
          className={`glass-card rounded-2xl p-6 border ${
            hasViolation ? 'border-danger/40 shadow-[0_4px_24px_rgba(248,113,113,0.12)]' : 'border-border-subtle'
          }`}
        >
          {hasViolation ? (
            <>
              <div className="flex items-center gap-3 mb-4 border-b border-danger/20 pb-3">
                <Icon name="warning" className="text-danger" size={32} />
                <div>
                  <h3 className="text-lg text-danger font-semibold">Critical Violation</h3>
                  <p className="text-[9px] text-text-muted uppercase">From Firestore shipments</p>
                </div>
              </div>
              {violations.map((v, i) => (
                <div key={i} className="space-y-3 text-xs mb-4">
                  <div className="flex justify-between p-2.5 rounded-lg border border-border-subtle bg-surface-dim">
                    <span className="text-text-muted">Peak Temp</span>
                    <span className="font-mono text-danger font-bold">{v.max_temp_c}°C</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-lg border border-border-subtle bg-surface-dim">
                    <span className="text-text-muted">Route</span>
                    <span className="font-mono text-[10px] text-right max-w-[60%]">{v.note}</span>
                  </div>
                </div>
              ))}
              <div className="bg-danger/10 p-3 rounded-lg border border-danger/30 mb-4">
                <p className="text-danger font-bold text-[10px] uppercase">
                  Risk: {data?.cold_chain?.risk}
                </p>
              </div>
              <button
                onClick={() => navigate('/simulator')}
                className="w-full bg-danger text-white text-xs py-3 rounded-lg font-bold hover:brightness-110 flex items-center justify-center gap-2"
              >
                <Icon name="block" size={16} />
                INITIATE QUARANTINE
              </button>
            </>
          ) : (
            <div className="text-center py-8">
              <Icon name="verified" className="text-success mx-auto mb-3" size={48} />
              <p className="text-success font-semibold">Cold Chain PASS</p>
              <p className="text-text-muted text-xs mt-2">All shipments within 4°C limit</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
