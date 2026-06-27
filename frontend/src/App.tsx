import { Routes, Route, Navigate } from 'react-router-dom'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import MyBooksPage from './pages/MyBooksPage'
import ManagePage from './pages/ManagePage'
import Layout from './components/Layout'
import { getUser } from './lib/auth'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = getUser()
  if (!user) return <Navigate to="/auth" replace />
  return <>{children}</>
}

function RequireLibrarian({ children }: { children: React.ReactNode }) {
  const user = getUser()
  if (!user) return <Navigate to="/auth" replace />
  if (user.role !== 'librarian') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="my-books" element={<MyBooksPage />} />
        <Route
          path="manage"
          element={
            <RequireLibrarian>
              <ManagePage />
            </RequireLibrarian>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
