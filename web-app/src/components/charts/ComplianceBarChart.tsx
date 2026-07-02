import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useTheme } from '../../context/ThemeContext'

export type ComplianceBar = {
  lot: string
  score: number
  cold: string
}

type Props = {
  data: ComplianceBar[]
}

function barColor(score: number, cold: string) {
  if (cold === 'FAIL') return '#f87171'
  if (score >= 90) return '#2dd4bf'
  if (score >= 75) return '#a78bfa'
  return '#fbbf24'
}

export function ComplianceBarChart({ data }: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const grid = isDark ? '#334155' : '#e2e8f0'
  const text = isDark ? '#94a3b8' : '#64748b'

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }} barCategoryGap="20%">
        <defs>
          <pattern id="stripe" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
            <rect width="3" height="6" fill="rgba(255,255,255,0.15)" />
          </pattern>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
        <XAxis
          dataKey="lot"
          tick={{ fill: text, fontSize: 9 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: string) => v.replace('LOT-2026-', '')}
        />
        <YAxis
          tick={{ fill: text, fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          domain={[0, 100]}
          unit="%"
        />
        <Tooltip
          cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}
          contentStyle={{
            background: isDark ? '#1b2025' : '#fff',
            border: `1px solid ${grid}`,
            borderRadius: 12,
            fontSize: 12,
          }}
          formatter={(value) => [`${Number(value ?? 0)}%`, 'Compliance']}
        />
        <Bar dataKey="score" radius={[8, 8, 0, 0]} maxBarSize={48}>
          {data.map((entry, i) => (
            <Cell key={i} fill={barColor(entry.score, entry.cold)} fillOpacity={0.9} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
