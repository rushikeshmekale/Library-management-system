export type User = {
  id: string
  name: string
  email: string
  role: 'member' | 'librarian'
}

export const getUser = (): User | null => {
  try {
    const s = localStorage.getItem('user')
    return s ? JSON.parse(s) : null
  } catch {
    return null
  }
}

export const getToken = () => localStorage.getItem('token')

export const setAuth = (token: string, user: User) => {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

export const clearAuth = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}
