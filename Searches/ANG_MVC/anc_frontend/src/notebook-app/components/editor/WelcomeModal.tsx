import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@/components/icons/Icon'
import { useNotebookEditorStore } from '@/notebook-app/store/editorStore'
import { useState } from 'react'

export function WelcomeModal() {
  const open = useNotebookEditorStore((s) => s.welcomeModalOpen)
  const dismissWelcome = useNotebookEditorStore((s) => s.dismissWelcome)
  const [optIn, setOptIn] = useState(false)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 p-6"
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="relative max-w-lg w-full rounded-2xl border border-border-soft bg-surface p-6 shadow-2xl"
          >
            <h2 className="text-xl font-medium text-text">
              👋 Welcome to ANC Notebook!
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              Your sources stay private to this notebook. ANC uses your uploads
              and chat only to answer within this workspace — not to train public
              models.
            </p>
            <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={optIn}
                onChange={(e) => setOptIn(e.target.checked)}
                className="mt-1 rounded border-border-soft"
              />
              <span>
                Keep me up to date about ANC Notebook. We may send product emails
                you can unsubscribe from anytime.
              </span>
            </label>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={dismissWelcome}
                className="rounded-full bg-google-blue px-6 py-2.5 text-sm font-medium text-white hover:bg-google-blue-dark transition-colors"
              >
                OK
              </button>
            </div>
            <button
              type="button"
              onClick={dismissWelcome}
              className="absolute top-4 right-4 rounded-full p-1 text-text-muted hover:bg-sidebar"
              aria-label="Close"
            >
              <Icon name="close" size={22} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
