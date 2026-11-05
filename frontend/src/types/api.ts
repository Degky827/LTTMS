/**
 * Global API Response Interfaces
 */

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data: T
  meta?: PaginationMeta
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage?: boolean
  hasPrevPage?: boolean
}

export interface PaginatedResult<T> {
  items: T[]
  meta: PaginationMeta
}

export interface AuthResponseData {
  token?: string
  refreshToken?: string
  accessToken?: string
  user: any
  requiresTwoFactor?: boolean
  twoFactorToken?: string
}
