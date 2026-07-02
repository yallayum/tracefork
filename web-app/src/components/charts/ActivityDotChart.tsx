import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useTheme } from '../../context/ThemeContext'

export type ActivityPoint = { day: string; events: number; compliance: number }

type Props = { data: ActivityPoint[] }

export function ActivityDotChart({ data }: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const grid = isDark ? '#334155' : '#e2e8f0'
  const text = isDark ? '#94a3b8' : '#64748b'
  const orange = '#fb923c'

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} />
        <XAxis dataKey="day" tick={{ fill: text, fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: text, fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            background: isDark ? '#1b2025' : '#fff',
            border: `1px solid ${grid}`,
            borderRadius: 12,
            fontSize: 12,
          }}
        />
        <Line
          type="monotone"
          dataKey="compliance"
          stroke={orange}
          strokeWidth={2}
          dot={{ r: 4, fill: orange, strokeWidth: 0 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
