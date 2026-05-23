import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@/components/icons/Icon'
import { useNotebookEditorStore } from '@/notebook-app/store/editorStore'

export function AddSourcesModal() {
  const open = useNotebookEditorStore((s) => s.addSourcesOpen)
  const setOpen = useNotebookEditorStore((s) => s.setAddSourcesOpen)
  const addSource = useNotebookEditorStore((s) => s.addSource)

  const actions = [
    { label: 'Upload files', icon: 'upload_file', type: 'pdf' as const },
    { label: 'Websites', icon: 'language', type: 'website' as const },
    { label: 'Drive', icon: 'add_to_drive', type: 'drive' as const },
    { label: 'Copied text', icon: 'content_paste', type: 'text' as const },
  ]

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 12 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full rounded-3xl border border-border-soft bg-surface p-8 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 rounded-full p-2 hover:bg-sidebar"
            >
              <Icon name="close" size={24} />
            </button>

            <h2 className="text-center text-2xl font-normal leading-snug text-text">
              Create Audio and Video Overviews from{' '}
              <span className="bg-gradient-to-r from-google-blue via-[#34a853] to-[#4285f4] bg-clip-text text-transparent font-medium">
                your documents
              </span>
            </h2>

            <div className="mt-8 rounded-2xl border-2 border-dashed border-border-soft bg-surface-subtle px-6 py-12 text-center">
              <p className="text-text-secondary">or drop your files</p>
              <p className="mt-2 text-sm text-text-muted">
                pdf, images, docs, audio, and more
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {actions.map((a) => (
                  <button
                    key={a.label}
                    type="button"
                    onClick={() => addSource(a.label, a.type)}
                    className="flex items-center gap-2 rounded-full border border-border-soft bg-surface px-5 py-2.5 text-sm text-text hover:bg-sidebar hover:border-google-blue/30 transition-colors"
                  >
                    <Icon name={a.icon} size={20} className="text-text-secondary" />
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
