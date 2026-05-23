import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default:
          'bg-google-blue text-white hover:bg-google-blue-dark shadow-sm',
        ghost:
          'bg-transparent text-text-secondary hover:bg-sidebar hover:text-text',
        outline:
          'border border-border-soft bg-surface hover:bg-sidebar text-text',
      },
      size: {
        default: 'h-10 px-5 text-sm',
        sm: 'h-9 px-3 text-xs',
        lg: 'h-11 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}
