import { User, UserRole } from '@/types/user'

export interface RouteAccessCheck {
  allowed: boolean
  redirectUrl?: string
  reason?: 'unauthenticated' | 'forbidden'
}

export const PORTAL_DASHBOARDS: Record<UserRole, string> = {
  tourist: '/tourist',
  vendor: '/vendor/dashboard',
  support: '/admin/dashboard',
  admin: '/admin/dashboard',
  super_admin: '/admin/dashboard',
}

export function getPostLoginRedirect(role: UserRole): string {
  return PORTAL_DASHBOARDS[role] || '/'
}

export function canAccessRoute(user: User | null, pathname: string): RouteAccessCheck {
  // Public routes always allowed
  const isPublicRoute =
    pathname === '/' ||
    pathname === '/about' ||
    pathname === '/contact' ||
    pathname === '/eco-tourism' ||
    pathname === '/history' ||
    pathname === '/services' ||
    pathname === '/vendors' ||
    pathname === '/reviews' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/verify-email') ||
    pathname.startsWith('/unauthorized') ||
    pathname.startsWith('/forbidden')

  if (isPublicRoute) {
    return { allowed: true }
  }

  // Not authenticated
  if (!user) {
    return {
      allowed: false,
      redirectUrl: `/login?redirect=${encodeURIComponent(pathname)}`,
      reason: 'unauthenticated',
    }
  }

  const role = user.role

  // Admin Portal Routes
  if (pathname.startsWith('/admin')) {
    if (role === 'admin' || role === 'super_admin' || role === 'support') {
      return { allowed: true }
    }
    return { allowed: false, redirectUrl: '/forbidden', reason: 'forbidden' }
  }

  // Vendor Portal Routes
  if (pathname.startsWith('/vendor')) {
    // Note: /vendor/login and /vendor/register are public
    if (pathname === '/vendor/login' || pathname === '/vendor/register') {
      return { allowed: true }
    }
    if (role === 'vendor' || role === 'admin' || role === 'super_admin') {
      return { allowed: true }
    }
    return { allowed: false, redirectUrl: '/forbidden', reason: 'forbidden' }
  }

  // Tourist Portal Routes
  if (pathname.startsWith('/tourist') || pathname.startsWith('/booking')) {
    if (role === 'tourist' || role === 'admin' || role === 'super_admin') {
      return { allowed: true }
    }
    return { allowed: false, redirectUrl: '/forbidden', reason: 'forbidden' }
  }

  return { allowed: true }
}
