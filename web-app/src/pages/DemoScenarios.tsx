import { useState } from 'react'
import { runAllScenarios } from '../api/client'
import { Icon } from '../components/Icon'

const SCENARIOS = [
  { id: '01', name: 'Happy Trace', lot: 'LOT-2026-0421', expect: 'Compliance ≥ 90, Cold PASS', icon: 'verified' },
  { id: '02', name: 'Recall Simulation', lot: 'LOT-2026-0421', expect: '3 retailers WITHDRAW', icon: 'emergency_home' },
  { id: '03', name: 'Cold Chain Alert', lot: 'LOT-2026-0315', expect: 'Violation detected', icon: 'device_thermostat' },
  { id: '04', name: 'Incomplete Trace', lot: 'LOT-2026-0199', expect: 'Recall blocked', icon: 'block' },
  { id: '05', name: 'Tamper Detection', lot: 'LOT-2026-0421', expect: 'Hash chain valid', icon: 'shield_lock' },
]

export default function DemoScenarios() {
  const [output, setOutput] = useState('')
  const [passed, setPassed] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)

  const runAll = async () => {
    setLoading(true)
    try {
      const result = await runAllScenarios()
      setPassed(result.passed)
      setOutput(result.output)
    } catch (e) {
      setOutput(String(e))
      setPassed(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-primary text-xs font-mono mb-2">
          <Icon name="science" size={16} />
          Judge Mode
        </div>
        <h2 className="text-3xl font-bold text-text-primary mb-2">Demo Scenarios</h2>
        <p className="text-text-muted">
          Run all capstone test scenarios against live Firestore — no local API required.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {SCENARIOS.map((s) => (
          <div key={s.id} className="glass-card rounded-lg p-5 hover:border-primary/30 transition">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Icon name={s.icon} size={18} className="text-primary" />
                {s.name}
              </h3>
              <span className="font-mono text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded">
                {s.lot}
              </span>
            </div>
            <p className="text-xs text-text-muted">{s.expect}</p>
          </div>
        ))}
      </div>

      <button
        onClick={runAll}
        disabled={loading}
        className="bg-primary-container text-surface-dim font-bold px-6 py-3 rounded-lg mb-6 disabled:opacity-50 flex items-center gap-2 hover:brightness-110 transition"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-surface-dim/30 border-t-surface-dim rounded-full animate-spin" />
            Running…
          </>
        ) : (
          <>
            <Icon name="play_arrow" size={20} />
            Run All Scenarios (5/5)
          </>
        )}
      </button>

      {passed !== null && (
        <div
          className={`p-4 rounded-lg mb-4 text-sm font-semibold flex items-center gap-2 ${
            passed ? 'bg-success/10 text-success border border-success/30' : 'bg-danger/10 text-danger border border-danger/30'
          }`}
        >
          <Icon name={passed ? 'check_circle' : 'cancel'} size={20} />
          {passed ? '5/5 scenarios passed' : 'Some scenarios failed'}
        </div>
      )}

      {output && (
        <pre className="glass-card rounded-lg p-4 text-xs font-mono overflow-x-auto text-text-muted whitespace-pre-wrap border border-border-subtle">
          {output}
        </pre>
      )}
    </main>
  )
}
