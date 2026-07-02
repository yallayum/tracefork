type IconProps = {
  name: string
  className?: string
  filled?: boolean
  size?: number
}

/** Google Material Symbols — ensures ligatures render as icons, not raw text. */
export function Icon({ name, className = '', filled = false, size = 24 }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined select-none leading-none ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${Math.min(48, size)}`,
      }}
      aria-hidden
    >
      {name}
    </span>
  )
}
