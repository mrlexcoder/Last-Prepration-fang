import { cn } from '@/lib/utils'

interface GeminiLogoProps {
  showText?: boolean
  size?: 'sm' | 'md'
}

export function GeminiLogo({ showText = true, size = 'md' }: GeminiLogoProps) {
  const iconSize = size === 'sm' ? 22 : 28
  return (
    <div className={cn('flex items-center gap-2', showText && 'font-medium')}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden
      >
        <path
          d="M14 2L16.5 11.5L26 14L16.5 16.5L14 26L11.5 16.5L2 14L11.5 11.5L14 2Z"
          fill="url(#anc-star)"
        />
        <defs>
          <linearGradient id="anc-star" x1="2" y1="2" x2="26" y2="26">
            <stop stopColor="#4285F4" />
            <stop offset="0.5" stopColor="#9B72CB" />
            <stop offset="1" stopColor="#D96570" />
          </linearGradient>
        </defs>
      </svg>
      {showText && (
        <span className={cn('text-text', size === 'sm' ? 'text-sm' : 'text-base')}>
          ANC
        </span>
      )}
    </div>
  )
}
