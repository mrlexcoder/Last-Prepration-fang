import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { AdminRoute } from '@/routes/AdminRoute'
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'
import { GeminiAppPage } from '@/pages/GeminiAppPage'
import { AdminPage } from '@/pages/AdminPage'
import { NotebookApp } from '@/notebook-app/routes/NotebookApp'
import { ProAGIDashboard } from '@/pages/ProAGIDashboard'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app" replace />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <GeminiAppPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notebook/*"
        element={
          <ProtectedRoute>
            <NotebookApp />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        }
      />

      <Route
        path="/pro-agi"
        element={
          <ProtectedRoute>
            <ProAGIDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/dashboard" element={<Navigate to="/app" replace />} />
      <Route path="/workspace" element={<Navigate to="/app" replace />} />
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  )
}
