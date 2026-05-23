import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Icon } from '@/components/icons/Icon'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/authStore'

export function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const signup = useAuthStore((s) => s.signup)
  const navigate = useNavigate()

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await signup(name, email, password)
    setLoading(false)
    navigate('/app')
  }

  return (
    <AuthLayout title="Create account" subtitle="Get started with ANC">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">
            Full name
          </label>
          <Input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
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
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-google-blue py-3 text-sm font-medium text-white hover:bg-google-blue-dark transition-colors disabled:opacity-50"
        >
          <Icon name="person_add" size={20} />
          {loading ? 'Creating…' : 'Sign up'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-text-muted">
        Have an account?{' '}
        <Link to="/login" className="font-medium text-google-blue hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
