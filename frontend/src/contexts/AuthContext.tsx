import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { User, UserRole } from '@/types/user'
import { PERMISSIONS, Permission, hasPermission as checkPermission } from '@/lib/auth/permissions'
import {
  connectSocket,
  disconnectSocket,
  joinUserRoom,
  joinVendorRoom,
  joinAdminRoom,
} from '@/utils/socket'

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
  phone?: string
  role?: 'tourist' | 'vendor'
  businessName?: string
  businessType?: string
  location?: string
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  loading: boolean
  role: UserRole | null
  login: (
    emailOrCredentials: string | LoginCredentials,
    password?: string,
    rememberMe?: boolean
  ) => Promise<{ requiresTwoFactor?: boolean; twoFactorToken?: string; user?: User }>
  register: (credentials: RegisterCredentials) => Promise<{ user?: User; requiresVerification?: boolean }>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  updateUser: (data: Partial<User>) => void
  hasPermission: (permission: Permission) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const setupRealtime = useCallback((token: string, currentUser: User) => {
    try {
      connectSocket(token)
      const uId = currentUser.id || currentUser._id
      if (uId) {
        joinUserRoom(uId)
      }
      if (currentUser.role === 'vendor' && currentUser.vendorProfileId) {
        joinVendorRoom(currentUser.vendorProfileId)
      }
      if (currentUser.role === 'admin' || currentUser.role === 'super_admin') {
        joinAdminRoom()
      }
    } catch (err) {
      console.warn('[Realtime] Socket connection error:', err)
    }
  }, [])

  const loadUser = useCallback(async () => {
    try {
      if (typeof window === 'undefined') return

      const token = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch {
          localStorage.removeItem('user')
        }
      }

      if (!token) {
        setIsLoading(false)
        return
      }

      // Fetch fresh profile from API
      const res = await apiClient.get<any>(API_ENDPOINTS.AUTH.ME)
      const userData: User = res.data?.user || res.data || res.user

      if (userData) {
        // Normalize id
        userData.id = userData.id || userData._id || ''
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        setupRealtime(token, userData)
      }
    } catch {
      console.warn('[Auth] Session check failed, clearing state')
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      disconnectSocket()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [setupRealtime])

  useEffect(() => {
    loadUser()

    const handleSessionExpired = () => {
      disconnectSocket()
      setUser(null)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('lttms:auth:session_expired', handleSessionExpired)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('lttms:auth:session_expired', handleSessionExpired)
      }
    }
  }, [loadUser])

  const login = async (
    emailOrCredentials: string | LoginCredentials,
    passwordParam?: string,
    rememberMeParam?: boolean
  ) => {
    setIsLoading(true)
    try {
      const payload: LoginCredentials =
        typeof emailOrCredentials === 'string'
          ? { email: emailOrCredentials, password: passwordParam || '', rememberMe: rememberMeParam }
          : emailOrCredentials

      const res = await apiClient.post<any>(API_ENDPOINTS.AUTH.LOGIN, payload)

      if (res.requiresTwoFactor) {
        setIsLoading(false)
        return {
          requiresTwoFactor: true,
          twoFactorToken: res.twoFactorToken,
        }
      }

      const token = res.token || res.data?.accessToken
      const refreshToken = res.refreshToken || res.data?.refreshToken
      const userData: User = res.user || res.data?.user

      if (userData) {
        userData.id = userData.id || userData._id || ''
      }

      if (typeof window !== 'undefined') {
        if (token) localStorage.setItem('token', token)
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
        if (userData) localStorage.setItem('user', JSON.stringify(userData))
      }

      setUser(userData)

      if (token && userData) {
        setupRealtime(token, userData)
      }

      return { requiresTwoFactor: false, user: userData }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (credentials: RegisterCredentials) => {
    setIsLoading(true)
    try {
      const res = await apiClient.post<any>(API_ENDPOINTS.AUTH.REGISTER, credentials)

      const token = res.token || res.data?.accessToken
      const refreshToken = res.refreshToken || res.data?.refreshToken
      const userData: User = res.user || res.data?.user

      if (userData) {
        userData.id = userData.id || userData._id || ''
      }

      if (typeof window !== 'undefined') {
        if (token) localStorage.setItem('token', token)
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
        if (userData) localStorage.setItem('user', JSON.stringify(userData))
      }

      setUser(userData)

      if (token && userData) {
        setupRealtime(token, userData)
      }

      return {
        user: userData,
        requiresVerification: !userData?.isVerified,
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT).catch(() => {})
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      }
      disconnectSocket()
      setUser(null)
      setIsLoading(false)
    }
  }

  const refreshSession = async () => {
    try {
      const storedRefreshToken =
        typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null
      const res = await apiClient.post<any>(API_ENDPOINTS.AUTH.REFRESH, {
        refreshToken: storedRefreshToken,
      })

      const token = res.token || res.data?.accessToken
      const refreshToken = res.refreshToken || res.data?.refreshToken

      if (token && typeof window !== 'undefined') {
        localStorage.setItem('token', token)
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
      }

      await loadUser()
    } catch (err) {
      await logout()
      throw err
    }
  }

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null
      const updated = { ...prev, ...data }
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(updated))
      }
      return updated
    })
  }

  const hasPermission = (permission: Permission): boolean => {
    return checkPermission(user, permission)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loading: isLoading,
        role: user?.role || null,
        login,
        register,
        logout,
        refreshSession,
        updateUser,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Re-export permissions for quick access
export { PERMISSIONS }
