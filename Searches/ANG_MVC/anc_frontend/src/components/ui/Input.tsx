import { cn } from '@/lib/utils'
import type { InputHTMLAttributes } from 'react'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-xl border border-border-soft bg-surface-subtle px-4 text-sm text-text placeholder:text-text-muted transition-colors',
        'focus:border-google-blue/50 focus:outline-none focus:ring-2 focus:ring-google-blue/15',
        className
      )}
      {...props}
    />
  )
}
