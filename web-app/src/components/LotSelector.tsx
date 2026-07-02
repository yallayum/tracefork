import { useLot } from '../context/LotContext'

const DEMO_LOTS = ['LOT-2026-0421', 'LOT-2026-0315', 'LOT-2026-0199']

export function LotSelector({ className = '' }: { className?: string }) {
  const { lot, setLot } = useLot()
  return (
    <select
      value={lot}
      onChange={(e) => setLot(e.target.value)}
      className={`bg-surface-container border border-border-subtle rounded-lg px-3 py-2 font-mono text-sm text-primary focus:ring-2 focus:ring-primary outline-none ${className}`}
      aria-label="Select batch lot"
    >
      {DEMO_LOTS.map((l) => (
        <option key={l} value={l}>
          {l}
        </option>
      ))}
    </select>
  )
}
