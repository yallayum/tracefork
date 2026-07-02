import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useTheme } from '../../context/ThemeContext'

export type TempPoint = {
  label: string
  temp: number
  event?: string
  violation?: boolean
}

type Props = {
  data: TempPoint[]
  limit?: number
}

export function TemperatureAreaChart({ data, limit = 4 }: Props) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const grid = isDark ? '#334155' : '#e2e8f0'
  const text = isDark ? '#94a3b8' : '#64748b'
  const stroke = isDark ? '#2dd4bf' : '#0d9488'
  const fillId = 'tempGradient'

  if (!data.length) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-text-muted">
        No temperature readings in trace timeline
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.45} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
        <XAxis dataKey="label" tick={{ fill: text, fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fill: text, fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          domain={['dataMin - 2', 'auto']}
          unit="°C"
        />
        <ReferenceLine
          y={limit}
          stroke="#34d399"
          strokeDasharray="4 4"
          label={{ value: `Safe ≤${limit}°C`, fill: '#34d399', fontSize: 10, position: 'insideTopRight' }}
        />
        <Tooltip
          contentStyle={{
            background: isDark ? '#1b2025' : '#fff',
            border: `1px solid ${grid}`,
            borderRadius: 12,
            fontSize: 12,
          }}
          formatter={(value, _name, item) => [
            `${Number(value ?? 0)}°C`,
            (item?.payload as TempPoint)?.event || 'Temperature',
          ]}
        />
        <Area
          type="monotone"
          dataKey="temp"
          stroke={stroke}
          strokeWidth={2.5}
          fill={`url(#${fillId})`}
          dot={(props) => {
            const { cx, cy, payload } = props
            const color = payload.violation ? '#f87171' : stroke
            return (
              <circle
                key={`${cx}-${cy}`}
                cx={cx}
                cy={cy}
                r={payload.violation ? 5 : 3}
                fill={color}
                stroke={isDark ? '#0f1419' : '#fff'}
                strokeWidth={2}
              />
            )
          }}
          activeDot={{ r: 6, fill: stroke }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
