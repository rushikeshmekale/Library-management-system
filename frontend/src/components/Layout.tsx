import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { BookOpen, LogOut, Users, BookMarked } from 'lucide-react'
import { getUser, clearAuth } from '../lib/auth'

export default function Layout() {
  const user = getUser()
  const navigate = useNavigate()
  const location = useLocation()

  function signOut() {
    clearAuth()
    navigate('/auth', { replace: true })
  }

  const navLink = (to: string, label: string) => {
    const active = location.pathname === to
    return (
      <Link
        to={to}
        style={{
          padding: '6px 14px',
          borderRadius: 6,
          textDecoration: 'none',
          fontSize: 14,
          fontWeight: active ? 600 : 400,
          color: active ? 'var(--primary-foreground)' : 'rgba(255,255,255,0.75)',
          background: active ? 'rgba(255,255,255,0.18)' : 'transparent',
          transition: 'all 0.15s',
        }}
      >
        {label}
      </Link>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      {/* Header */}
      <header
        style={{
          background: 'linear-gradient(135deg, #1a3a5c 0%, #2d6a9f 100%)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 24px',
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          {/* Logo */}
          <Link
            to="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              textDecoration: 'none',
              color: '#fff',
              flexShrink: 0,
            }}
          >
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 8,
              padding: '6px 8px',
              display: 'flex',
              alignItems: 'center',
            }}>
              <BookOpen size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>LBS Library</div>
              <div style={{ fontSize: 10, opacity: 0.75, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Management System</div>
            </div>
          </Link>

          {/* Nav */}
          <nav style={{ display: 'flex', gap: 4 }}>
            {navLink('/dashboard', 'Books Catalog')}
            {user?.role === 'member' && navLink('/my-books', 'My Books')}
            {user?.role === 'librarian' && navLink('/manage', 'Manage')}
          </nav>

          {/* User info + sign out */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>{user?.email}</div>
            </div>
            <span
              style={{
                background: user?.role === 'librarian' ? 'rgba(255,215,0,0.25)' : 'rgba(255,255,255,0.15)',
                color: user?.role === 'librarian' ? '#ffd700' : 'rgba(255,255,255,0.9)',
                padding: '3px 9px',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                border: `1px solid ${user?.role === 'librarian' ? 'rgba(255,215,0,0.4)' : 'rgba(255,255,255,0.2)'}`,
              }}
            >
              {user?.role}
            </span>
            <button
              onClick={signOut}
              title="Sign out"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 12px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 6,
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.85)',
                fontSize: 13,
              }}
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <Outlet />
      </main>
    </div>
  )
}
