import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import API from '../utils/api'
import { connectSocket, disconnectSocket, joinUserRoom, joinAdminRoom } from '../utils/socket'

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

  const setupSocketConnection = useCallback((token: string, userData: User) => {
    try {
      connectSocket(token)
      if (userData?.id) {
        joinUserRoom(userData.id)
      }
      if (userData?.role === 'admin') {
        joinAdminRoom()
      }
    } catch (err) {
      console.warn('[Socket] Could not connect realtime socket:', err)
    }
  }, [])

  const loadUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }
      const res = await API.get('/auth/me')
      const userData = res.data?.data || res.data?.user
      if (userData) {
        setUser(userData)
        setupSocketConnection(token, userData)
      }
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      disconnectSocket()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [setupSocketConnection])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = async (email: string, password: string, rememberMe = false) => {
    const res = await API.post('/auth/login', { email, password, rememberMe })
    if (res.data.requiresTwoFactor) {
      return { requiresTwoFactor: true, twoFactorToken: res.data.twoFactorToken }
    }
    const token = res.data.token || res.data.data?.accessToken
    const userData = res.data.user || res.data.data?.user

    if (token) localStorage.setItem('token', token)
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      if (token) setupSocketConnection(token, userData)
    }
    return { requiresTwoFactor: false, user: userData }
  }

  const register = async (data: RegisterData) => {
    const res = await API.post('/auth/register', data)
    const token = res.data.token || res.data.data?.accessToken
    const userData = res.data.user || res.data.data?.user

    if (token) localStorage.setItem('token', token)
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      if (token) setupSocketConnection(token, userData)
    }
    return userData
  }

  const logout = async () => {
    try {
      await API.post('/auth/logout')
    } catch {
      // Proceed with local logout even if API fails
    }
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    localStorage.removeItem('vendorToken')
    disconnectSocket()
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
