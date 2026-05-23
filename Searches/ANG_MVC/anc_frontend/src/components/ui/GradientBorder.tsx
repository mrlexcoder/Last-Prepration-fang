import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface GradientBorderProps {
  children: ReactNode
  className?: string
  innerClassName?: string
  animated?: boolean
}

/** Animated gradient border wrapper (Google blue accent) */
export function GradientBorder({
  children,
  className,
  innerClassName,
  animated = true,
}: GradientBorderProps) {
  return (
    <div
      className={cn(
        'relative rounded-2xl p-[1px]',
        animated &&
          'bg-gradient-to-r from-google-blue via-google-blue-light to-google-blue-dark animate-border-flow',
        !animated && 'bg-gradient-to-r from-google-blue/80 to-google-blue-dark/80',
        className
      )}
    >
      <div
        className={cn(
          'relative rounded-[15px] bg-surface-elevated',
          innerClassName
        )}
      >
        {children}
      </div>
    </div>
  )
}
