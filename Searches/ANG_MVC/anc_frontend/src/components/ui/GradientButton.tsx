import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  className?: string
}

/** Google-style gradient button with animated shine */
export function GradientButton({
  children,
  className,
  disabled,
  ...props
}: GradientButtonProps) {
  return (
    <button
      disabled={disabled}
      className={cn(
        'relative overflow-hidden rounded-xl px-6 py-3 text-sm font-semibold text-white',
        'bg-gradient-to-r from-google-blue via-google-blue-dark to-google-blue',
        'shadow-lg shadow-google-blue/30 transition-transform',
        'hover:scale-[1.02] active:scale-[0.98]',
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
        'before:translate-x-[-100%] hover:before:animate-shimmer before:transition-transform',
        'disabled:opacity-50 disabled:pointer-events-none disabled:hover:scale-100',
        className
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  )
}
