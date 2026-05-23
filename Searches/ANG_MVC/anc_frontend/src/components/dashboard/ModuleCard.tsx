import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/icons/Icon'
import { GradientBorder } from '@/components/ui/GradientBorder'
import { cn } from '@/lib/utils'

interface ModuleCardProps {
  title: string
  description: string
  icon: string
  href: string
  delay?: number
  featured?: boolean
}

export function ModuleCard({
  title,
  description,
  icon,
  href,
  delay = 0,
  featured,
}: ModuleCardProps) {
  const inner = (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 400 }}
      className={cn(
        'flex h-full flex-col p-6',
        featured && 'bg-gradient-to-br from-google-blue/10 to-transparent'
      )}
    >
      <div
        className={cn(
          'mb-4 flex h-12 w-12 items-center justify-center rounded-xl',
          featured
            ? 'bg-gradient-to-br from-google-blue to-google-blue-dark text-white shadow-lg shadow-google-blue/30'
            : 'bg-surface-muted border border-border text-google-blue'
        )}
      >
        <Icon name={icon} size={26} filled={featured} />
      </div>
      <h3 className="text-lg font-semibold text-text">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-text-muted">
        {description}
      </p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-google-blue">
        Open
        <Icon name="arrow_forward" size={18} />
      </span>
    </motion.div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Link to={href} className="block h-full">
        {featured ? (
          <GradientBorder animated>{inner}</GradientBorder>
        ) : (
          <div className="h-full rounded-2xl border border-border bg-surface-elevated transition-colors hover:border-google-blue/40">
            {inner}
          </div>
        )}
      </Link>
    </motion.div>
  )
}
