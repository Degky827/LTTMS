import { UserRole, User } from '@/types/user'

export const PERMISSIONS = {
  // Services
  SERVICES_CREATE: 'services:create',
  SERVICES_UPDATE: 'services:update',
  SERVICES_DELETE: 'services:delete',
  SERVICES_MANAGE_OWN: 'services:manage_own',

  // Bookings
  BOOKINGS_CREATE: 'bookings:create',
  BOOKINGS_VIEW_OWN: 'bookings:view_own',
  BOOKINGS_MANAGE_VENDOR: 'bookings:manage_vendor',
  BOOKINGS_MANAGE_ALL: 'bookings:manage_all',

  // Reviews
  REVIEWS_CREATE: 'reviews:create',
  REVIEWS_MODERATE: 'reviews:moderate',

  // Finance & Payouts
  FINANCE_VIEW_OWN: 'finance:view_own',
  FINANCE_REQUEST_PAYOUT: 'finance:request_payout',
  FINANCE_MANAGE_ALL: 'finance:manage_all',

  // Vendors
  VENDORS_APPLY: 'vendors:apply',
  VENDORS_APPROVE: 'vendors:approve',
  VENDORS_MANAGE: 'vendors:manage',

  // Administration & Users
  USERS_MANAGE: 'users:manage',
  ROLES_ASSIGN: 'roles:assign',
  AUDIT_LOGS_VIEW: 'audit_logs:view',
  SYSTEM_CONFIG: 'system:config',

  // Support
  SUPPORT_CREATE_TICKET: 'support:create_ticket',
  SUPPORT_HANDLE_TICKETS: 'support:handle_tickets',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

/**
 * Role to Permissions Matrix based on Backend RBAC rules
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  tourist: [
    PERMISSIONS.BOOKINGS_CREATE,
    PERMISSIONS.BOOKINGS_VIEW_OWN,
    PERMISSIONS.REVIEWS_CREATE,
    PERMISSIONS.SUPPORT_CREATE_TICKET,
    PERMISSIONS.VENDORS_APPLY,
  ],
  vendor: [
    PERMISSIONS.SERVICES_CREATE,
    PERMISSIONS.SERVICES_UPDATE,
    PERMISSIONS.SERVICES_DELETE,
    PERMISSIONS.SERVICES_MANAGE_OWN,
    PERMISSIONS.BOOKINGS_MANAGE_VENDOR,
    PERMISSIONS.FINANCE_VIEW_OWN,
    PERMISSIONS.FINANCE_REQUEST_PAYOUT,
    PERMISSIONS.SUPPORT_CREATE_TICKET,
  ],
  support: [
    PERMISSIONS.SUPPORT_HANDLE_TICKETS,
    PERMISSIONS.BOOKINGS_MANAGE_ALL,
    PERMISSIONS.REVIEWS_MODERATE,
    PERMISSIONS.AUDIT_LOGS_VIEW,
  ],
  admin: [
    PERMISSIONS.SERVICES_CREATE,
    PERMISSIONS.SERVICES_UPDATE,
    PERMISSIONS.SERVICES_DELETE,
    PERMISSIONS.BOOKINGS_MANAGE_ALL,
    PERMISSIONS.REVIEWS_MODERATE,
    PERMISSIONS.FINANCE_MANAGE_ALL,
    PERMISSIONS.VENDORS_APPROVE,
    PERMISSIONS.VENDORS_MANAGE,
    PERMISSIONS.USERS_MANAGE,
    PERMISSIONS.AUDIT_LOGS_VIEW,
    PERMISSIONS.SUPPORT_HANDLE_TICKETS,
  ],
  super_admin: [
    // Super admin has every single permission
    ...Object.values(PERMISSIONS),
  ],
}

export function hasPermission(user: User | null | undefined, permission: Permission): boolean {
  if (!user || !user.role) return false
  const granted = ROLE_PERMISSIONS[user.role] || []
  return granted.includes(permission)
}

export function hasAnyPermission(user: User | null | undefined, permissions: Permission[]): boolean {
  if (!user || !user.role) return false
  const granted = ROLE_PERMISSIONS[user.role] || []
  return permissions.some((perm) => granted.includes(perm))
}

export function hasAllPermissions(user: User | null | undefined, permissions: Permission[]): boolean {
  if (!user || !user.role) return false
  const granted = ROLE_PERMISSIONS[user.role] || []
  return permissions.every((perm) => granted.includes(perm))
}
