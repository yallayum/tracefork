import type { GraphNode } from '../api/types'
import { Icon } from './Icon'
import { useTheme } from '../context/ThemeContext'

const NODE_ICONS: Record<string, string> = {
  farm: 'agriculture',
  plant: 'factory',
  warehouse: 'warehouse',
  retail: 'storefront',
}

const NODE_COLORS: Record<string, string> = {
  farm: 'border-success text-success',
  plant: 'border-primary text-primary',
  warehouse: 'border-violet-400 text-violet-400',
  retail: 'border-warning text-warning',
}

type Props = {
  nodes: GraphNode[]
  highlightNodeId?: string
}

export function SupplyChainGraph({ nodes, highlightNodeId }: Props) {
  const { theme } = useTheme()
  const lineColor = theme === 'dark' ? '#475569' : '#94a3b8'
  const arrowColor = theme === 'dark' ? '#2dd4bf' : '#0d9488'

  if (!nodes.length) {
    return (
      <p className="text-text-muted text-sm text-center">No supply chain nodes in trace data.</p>
    )
  }

  const nodeW = 88
  const gap = 48
  const width = nodes.length * nodeW + (nodes.length - 1) * gap + 40

  return (
    <div className="w-full pb-4">
      <div className="overflow-x-auto">
        <div className="relative mx-auto px-5 py-4" style={{ width: Math.max(width, 320), minHeight: 200 }}>
          <svg
            className="absolute inset-x-0 top-[4.25rem] pointer-events-none"
            width={width}
            height={80}
            style={{ zIndex: 0 }}
          >
          {nodes.slice(0, -1).map((_, i) => {
            const x1 = 20 + i * (nodeW + gap) + nodeW / 2
            const x2 = x1 + gap + nodeW / 2
            const y = 40
            return (
              <g key={i}>
                <line
                  x1={x1}
                  y1={y}
                  x2={x2}
                  y2={y}
                  stroke={lineColor}
                  strokeWidth={2}
                  strokeDasharray="6 4"
                />
                <polygon
                  points={`${x2 - 6},${y - 4} ${x2},${y} ${x2 - 6},${y + 4}`}
                  fill={arrowColor}
                />
              </g>
            )
          })}
        </svg>
        <div className="relative z-10 flex items-start justify-start gap-12">
          {nodes.map((node) => {
            const isHighlight = node.id === highlightNodeId
            const color = NODE_COLORS[node.type] || 'border-primary text-primary'
            return (
              <div key={node.id} className="flex flex-col items-center gap-2 shrink-0 w-[88px]">
                <div
                  className={`w-16 h-16 rounded-xl bg-surface-container border-2 flex items-center justify-center shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg hover:z-20 relative ${color} ${
                    isHighlight ? 'pulse-danger border-danger' : ''
                  }`}
                >
                  <Icon name={NODE_ICONS[node.type] || 'circle'} size={28} className={color.split(' ')[1]} />
                </div>
                <p className="text-[10px] uppercase text-center text-text-primary font-medium leading-tight">
                  {node.name}
                </p>
                <p className="text-[9px] text-text-muted font-mono">{node.type}</p>
                {node.city && (
                  <p className="text-[8px] text-text-muted">{node.city}</p>
                )}
              </div>
            )
          })}
        </div>
        </div>
      </div>
      <div className="flex justify-center gap-6 mt-4 text-[10px] text-text-muted">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-success" /> Farm
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-primary" /> Plant
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-violet-400" /> Warehouse
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-warning" /> Retail
        </span>
      </div>
    </div>
  )
}
