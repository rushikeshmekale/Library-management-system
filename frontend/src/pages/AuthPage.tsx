import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { BookOpen } from 'lucide-react'
import api from '../lib/api'
import { setAuth, getUser } from '../lib/auth'

const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

const inp: React.CSSProperties = {
  width: '100%',
  padding: '10px 13px',
  borderRadius: 7,
  border: '1.5px solid #d1d5db',
  background: '#f9fafb',
  fontSize: 14,
  outline: 'none',
  color: '#111',
  transition: 'border-color 0.15s',
}

const lbl: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 5,
  color: '#374151',
}

export default function AuthPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (getUser()) navigate('/dashboard', { replace: true })
  }, [navigate])

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const parsed = loginSchema.safeParse({
      email: fd.get('email'),
      password: fd.get('password'),
    })
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return }
    setLoading(true)
    try {
      const res = await api.post('/auth/login', parsed.data)
      setAuth(res.data.token, res.data.user)
      toast.success(`Welcome back, ${res.data.user.name}!`)
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.')
    } finally { setLoading(false) }
  }

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const parsed = registerSchema.safeParse({
      name: fd.get('name'),
      email: fd.get('email'),
      password: fd.get('password'),
    })
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return }
    setLoading(true)
    try {
      const res = await api.post('/auth/register', parsed.data)
      setAuth(res.data.token, res.data.user)
      toast.success('Account created successfully!')
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed.')
    } finally { setLoading(false) }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, #1a3a5c 0%, #2d6a9f 100%)',
      }}
    >
      {/* Left panel */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 48,
          color: '#fff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 14 }}>
            <BookOpen size={36} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1 }}>LBS Library</div>
            <div style={{ fontSize: 13, opacity: 0.75, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Management System</div>
          </div>
        </div>
        <p style={{ fontSize: 15, opacity: 0.8, maxWidth: 320, textAlign: 'center', lineHeight: 1.6 }}>
          Manage your library's collection, track borrowings, and serve your members — all in one place.
        </p>
        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 280 }}>
          {[
            '📚 Browse & search books',
            '🔖 Borrow & return books',
            '👥 Manage members',
            '📊 Track all loans',
          ].map((f) => (
            <div key={f} style={{ fontSize: 14, opacity: 0.85, display: 'flex', alignItems: 'center', gap: 8 }}>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div
        style={{
          width: 440,
          flexShrink: 0,
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
          boxShadow: '-8px 0 32px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ width: '100%' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, color: '#111' }}>
            {tab === 'signin' ? 'Sign in to your account' : 'Create an account'}
          </h2>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 28 }}>
            {tab === 'signin' ? 'Enter your credentials to continue.' : 'Register as a library member.'}
          </p>

          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              marginBottom: 24,
              background: '#f3f4f6',
              borderRadius: 8,
              padding: 3,
            }}
          >
            {(['signin', 'signup'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: tab === t ? 600 : 400,
                  background: tab === t ? '#fff' : 'transparent',
                  color: tab === t ? '#1a3a5c' : '#6b7280',
                  boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {t === 'signin' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          {/* Sign In */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={lbl}>Email address</label>
                <input name="email" type="email" required style={inp} placeholder="you@example.com" />
              </div>
              <div>
                <label style={lbl}>Password</label>
                <input name="password" type="password" required style={inp} placeholder="••••••••" />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '11px',
                  marginTop: 4,
                  background: loading ? '#93c5fd' : 'linear-gradient(135deg, #1a3a5c, #2d6a9f)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 7,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
              <div style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                Default librarian: <strong>admin@library.com</strong> / <strong>admin123</strong>
              </div>
            </form>
          )}

          {/* Sign Up */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={lbl}>Full name</label>
                <input name="name" required style={inp} placeholder="Your full name" />
              </div>
              <div>
                <label style={lbl}>Email address</label>
                <input name="email" type="email" required style={inp} placeholder="you@example.com" />
              </div>
              <div>
                <label style={lbl}>Password</label>
                <input name="password" type="password" required minLength={6} style={inp} placeholder="Min 6 characters" />
              </div>
              <div
                style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: 7,
                  padding: '10px 12px',
                  fontSize: 12,
                  color: '#1e40af',
                  lineHeight: 1.5,
                }}
              >
                ℹ️ You will be registered as a <strong>Member</strong>. Librarian accounts are created by the administrator directly in the database.
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '11px',
                  background: loading ? '#93c5fd' : 'linear-gradient(135deg, #1a3a5c, #2d6a9f)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 7,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
