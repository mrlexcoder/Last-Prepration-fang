import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
}

// Hardcoded admin credentials
const ADMIN_EMAIL = 'tekkivo@gmail.com'
const ADMIN_PASSWORD = 'tekkivo@gmail.com'

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      error: null,

      login: async (email, password) => {
        await new Promise((r) => setTimeout(r, 500))
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          set({
            user: { id: 'admin-1', email, name: 'Tekkivo Admin', role: 'admin' },
            isAuthenticated: true,
            error: null,
          })
          return true
        }
        // Allow any other email/password for demo users
        if (email && password.length >= 6) {
          set({
            user: { id: `u-${Date.now()}`, email, name: email.split('@')[0] ?? 'User', role: 'user' },
            isAuthenticated: true,
            error: null,
          })
          return true
        }
        set({ error: 'Invalid credentials. Use tekkivo@gmail.com / tekkivo@gmail.com' })
        return false
      },

       signup: async (name, email) => {
         await new Promise((r) => setTimeout(r, 600))
         set({
           user: { id: `u-${Date.now()}`, email, name, role: 'user' },
           isAuthenticated: true,
           error: null,
         })
         return true
       },

      logout: () => set({ user: null, isAuthenticated: false, error: null }),
    }),
    { name: 'anc-auth' }
  )
)
