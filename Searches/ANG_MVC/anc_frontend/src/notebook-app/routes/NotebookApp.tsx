import { Routes, Route, Navigate } from 'react-router-dom'
import { NotebookHomePage } from '@/notebook-app/pages/NotebookHomePage'
import { NotebookEditorPage } from '@/notebook-app/pages/NotebookEditorPage'

/**
 * Separate product routes — like notebooklm.google.com vs gemini.google.com
 * /notebook       → library home
 * /notebook/n/:id → notebook workspace
 */
export function NotebookApp() {
  return (
    <Routes>
      <Route index element={<NotebookHomePage />} />
      <Route path="n/:notebookId" element={<NotebookEditorPage />} />
      <Route path="*" element={<Navigate to="/notebook" replace />} />
    </Routes>
  )
}
