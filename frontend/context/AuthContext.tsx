import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import API from '../utils/api'

interface User {
  id: string
  name: string
  email: string
  role: 'tourist' | 'vendor' | 'admin'
  isVerified: boolean
  twoFactorEnabled: boolean
  phone?: string
  lastLogin?: string
  createdAt?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<any>
  register: (data: RegisterData) => Promise<any>
  logout: () => Promise<void>
  updateUser: (user: User) => void
  isAuthenticated: boolean
}

interface RegisterData {
  name: string
  email: string
  password: string
  phone?: string
  role?: 'tourist' | 'vendor'
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }
      const res = await API.get('/auth/me')
      setUser(res.data.data)
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = async (email: string, password: string, rememberMe = false) => {
    const res = await API.post('/auth/login', { email, password, rememberMe })
    if (res.data.requiresTwoFactor) {
      return { requiresTwoFactor: true, twoFactorToken: res.data.twoFactorToken }
    }
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    return { requiresTwoFactor: false, user: res.data.user }
  }

  const register = async (data: RegisterData) => {
    const res = await API.post('/auth/register', data)
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    return res.data.user
  }

  const logout = async () => {
    try {
      await API.post('/auth/logout')
    } catch {
      // Proceed with local logout even if API fails
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('vendorToken')
    setUser(null)
  }

  const updateUser = (updated: User) => {
    setUser(updated)
    localStorage.setItem('user', JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
