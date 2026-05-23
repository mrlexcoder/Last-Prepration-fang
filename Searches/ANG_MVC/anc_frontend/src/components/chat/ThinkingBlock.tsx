import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@/components/icons/Icon'
import { cn } from '@/lib/utils'
import type { ThinkingBlock as ThinkingBlockType } from '@/types/thread'

interface ThinkingBlockProps {
  thinking: ThinkingBlockType
  onToggle: () => void
  isActive?: boolean
  variant?: 'default' | 'gemini'
}

export function ThinkingBlock({
  thinking,
  onToggle,
  isActive,
  variant = 'default',
}: ThinkingBlockProps) {
  const { collapsed, steps, durationMs } = thinking
  const isGemini = variant === 'gemini'

  return (
    <div className={cn('mb-3', isGemini && 'mb-4')}>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-all',
          isGemini ? 'hover:bg-surface text-text-muted' : 'hover:bg-sidebar'
        )}
      >
        {/* Advanced Google-style Thinking Indicator */}
        <div className="relative flex h-7 w-7 items-center justify-center">
          {/* Outer pulsing circle (Google style) */}
          <motion.div
            animate={isActive ? { scale: [1, 1.4, 1], opacity: [0.3, 0.1, 0.3] } : {}}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className={cn(
              'absolute h-7 w-7 rounded-full',
              isActive ? 'bg-google-blue/20' : 'bg-transparent'
            )}
          />

          {/* Inner spinning ring for active state */}
          {isActive && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              className="absolute h-5 w-5 rounded-full border-2 border-google-blue/30 border-t-google-blue"
            />
          )}

          {/* Center icon */}
          <div
            className={cn(
              'relative z-10 flex h-6 w-6 items-center justify-center rounded-full transition-colors',
              isActive
                ? 'bg-google-blue/10 text-google-blue'
                : 'bg-surface text-text-muted'
            )}
          >
            <Icon
              name="psychology"
              size={16}
              className={isActive ? 'text-google-blue' : 'text-text-muted'}
            />
          </div>
        </div>

        <span className="font-medium text-text-muted group-hover:text-text-secondary">
          {isActive ? 'Thinking…' : 'Show thinking'}
        </span>

        {durationMs && collapsed && (
          <span className="ml-1 rounded-full bg-surface px-2 py-0.5 text-[10px] text-text-muted">
            {(durationMs / 1000).toFixed(1)}s
          </span>
        )}

        <Icon
          name={collapsed ? 'expand_more' : 'expand_less'}
          size={18}
          className="ml-auto text-text-muted transition-transform group-hover:text-text-secondary"
        />
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="ml-3 mt-3 space-y-2.5 pl-2">
              {steps.map((step, index) => {
                const isActiveStep = step.status === 'active'
                const isDone = step.status === 'done'

                // Special styling for real AgentScope agents
                const isAgentScopeStep = ['Planner', 'Executor', 'Critic', 'Synthesizer'].includes(step.label)

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    className={cn(
                      "flex items-start gap-3 rounded-lg px-3 py-2 transition-all",
                      isActiveStep && "bg-surface",
                      isDone && "bg-elevated"
                    )}
                  >
                    {/* Pro circular indicator */}
                    <div className="relative mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center">
                      {isDone && (
                        <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center ring-1 ring-emerald-500/30">
                          <Icon name="check_circle" size={13} className="text-emerald-400" />
                        </div>
                      )}

                      {isActiveStep && (
                        <div className="relative">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
                            className="absolute h-5 w-5 rounded-full border-2 border-google-blue/25 border-t-google-blue"
                          />
                          <div className="h-2.5 w-2.5 rounded-full bg-google-blue mt-[5px] ml-[5px]" />
                        </div>
                      )}

                      {!isDone && !isActiveStep && (
                        <div className="h-2 w-2 rounded-full bg-zinc-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pt-px">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-sm font-semibold tracking-tight",
                            isActiveStep && "text-google-blue",
                            isDone && "text-zinc-300",
                            !isActiveStep && !isDone && "text-zinc-400"
                          )}
                        >
                          {step.label}
                        </span>
                        {isAgentScopeStep && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 font-mono">
                            AGENT
                          </span>
                        )}
                      </div>

                      {(isActiveStep || isDone) && step.content && (
                        <div className="mt-1 text-sm text-zinc-400 leading-relaxed">
                          {step.content}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
