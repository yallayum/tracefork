import type { ReactNode } from 'react'
import { Icon } from '../Icon'

type Props = {
  title: string
  value?: string
  subtitle?: string
  trend?: string
  trendUp?: boolean
  icon: string
  iconColor?: string
  children: ReactNode
  className?: string
}

export function ChartCard({
  title,
  value,
  subtitle,
  trend,
  trendUp = true,
  icon,
  iconColor = 'text-primary bg-primary/10 border-primary/20',
  children,
  className = '',
}: Props) {
  return (
    <div className={`glass-card rounded-2xl p-5 md:p-6 shadow-lg shadow-black/5 ${className}`}>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 ${iconColor}`}
          >
            <Icon name={icon} size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-text-muted uppercase tracking-wider">{title}</p>
            {value && <p className="text-2xl md:text-3xl font-bold text-text-primary mt-0.5">{value}</p>}
            {subtitle && <p className="text-xs text-text-muted mt-1">{subtitle}</p>}
          </div>
        </div>
        {trend && (
          <span
            className={`text-xs font-mono font-semibold px-2 py-1 rounded-full shrink-0 ${
              trendUp ? 'text-success bg-success/10' : 'text-danger bg-danger/10'
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      <div className="h-[220px] w-full">{children}</div>
    </div>
  )
}
