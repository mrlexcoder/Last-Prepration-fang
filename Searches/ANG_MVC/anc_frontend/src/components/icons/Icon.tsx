import { cn } from '@/lib/utils'

interface IconProps {
  name: string
  className?: string
  size?: number
  filled?: boolean
}

/** Google Material Symbols — no emoji / dummy icons */
export function Icon({ name, className, size = 22, filled = false }: IconProps) {
  return (
    <span
      className={cn('material-symbols-outlined leading-none', className)}
      style={{
        fontSize: size,
        fontVariationSettings: filled
          ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
          : undefined,
      }}
      aria-hidden
    >
      {name}
    </span>
  )
}
