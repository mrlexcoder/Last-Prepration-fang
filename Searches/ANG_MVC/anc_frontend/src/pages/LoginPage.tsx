import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Icon } from '@/components/icons/Icon'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/authStore'

export function LoginPage() {
  const [email, setEmail] = useState('tekkivo@gmail.com')
  const [password, setPassword] = useState('tekkivo@gmail.com')
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((s) => s.login)
  const error = useAuthStore((s) => s.error)
  const navigate = useNavigate()

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const ok = await login(email, password)
    setLoading(false)
    if (ok) navigate('/app')
  }

  return (
    <AuthLayout title="Sign in" subtitle="Continue to ANC AI workspace">
      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">
            Email
          </label>
          <Input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">
            Password
          </label>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-google-blue py-3 text-sm font-medium text-white hover:bg-google-blue-dark transition-colors disabled:opacity-50"
        >
          <Icon name="login" size={20} />
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-text-muted">
        No account?{' '}
        <Link to="/signup" className="font-medium text-google-blue hover:underline">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  )
}
