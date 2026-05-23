import { motion } from 'framer-motion'
import { GeminiPromptBar } from '@/components/gemini/GeminiPromptBar'
import { useAuthStore } from '@/store/authStore'

export function GeminiHome() {
  const user = useAuthStore((s) => s.user)
  const firstName = user?.name?.split(' ')[0] ?? 'there'

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 pb-8">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10 text-center text-[2rem] font-normal text-text md:text-[2.75rem] tracking-tight"
      >
        What&apos;s next, {firstName}?
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
        className="w-full"
      >
        <GeminiPromptBar centered />
      </motion.div>
    </div>
  )
}
