import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { GeminiLogo } from '@/components/gemini/GeminiLogo'
import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-full items-center justify-center overflow-hidden bg-surface p-6 gemini-glow">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-google-blue/10 blur-[120px]" />
        <div className="absolute -right-32 bottom-20 h-80 w-80 rounded-full bg-google-blue-soft/10 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-[420px]"
      >
        <Link to="/" className="mb-8 flex justify-center">
          <GeminiLogo size="md" />
        </Link>

        <div className="rounded-3xl border border-border-soft bg-surface px-8 py-10 shadow-lg shadow-black/5">
          <h1 className="text-2xl font-normal text-text">{title}</h1>
          <p className="mt-2 text-sm text-text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </motion.div>
    </div>
  )
}
