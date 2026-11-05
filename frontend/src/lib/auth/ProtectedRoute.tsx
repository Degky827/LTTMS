import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/types/user'
import { Permission } from './permissions'
import { LoadingScreen } from '@/components/shared/LoadingScreen'

export interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  requiredPermissions?: Permission[]
  redirectTo?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requiredPermissions,
  redirectTo,
}) => {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, hasPermission } = useAuth()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      const redirect = redirectTo || `/login?redirect=${encodeURIComponent(router.asPath)}`
      router.replace(redirect)
      return
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.replace('/forbidden')
      return
    }

    if (requiredPermissions && user) {
      const allMet = requiredPermissions.every((perm) => hasPermission(perm))
      if (!allMet) {
        router.replace('/forbidden')
        return
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, requiredPermissions, redirectTo, router, hasPermission])

  if (isLoading) {
    return <LoadingScreen fullScreen message="Verifying Platform Authorization..." />
  }

  if (!isAuthenticated) {
    return null
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null
  }

  if (requiredPermissions && user) {
    const allMet = requiredPermissions.every((perm) => hasPermission(perm))
    if (!allMet) return null
  }

  return <>{children}</>
}

export default ProtectedRoute
