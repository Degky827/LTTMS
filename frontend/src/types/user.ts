/**
 * User and Identity Types for LTTMS v2
 */

export type UserRole = 'tourist' | 'vendor' | 'admin' | 'super_admin' | 'support'

export interface User {
  id: string
  _id?: string
  name: string
  email: string
  phone?: string
  role: UserRole
  avatar?: string | null
  bio?: string | null
  languagePreference?: 'en' | 'am' | 'fr'
  isVerified: boolean
  twoFactorEnabled?: boolean
  isActive?: boolean
  isSuspended?: boolean
  vendorProfileId?: string
  lastLogin?: string
  createdAt?: string
  updatedAt?: string
}

export interface VendorProfile {
  id: string
  _id?: string
  userId: string
  businessName: string
  businessType: 'boat_tour' | 'hotel' | 'monastery_guide' | 'cultural_craft' | 'transport' | 'other'
  description?: string
  location?: string
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  commissionRate?: number
  isVerified: boolean
  contactPhone?: string
  contactEmail?: string
  licenseNumber?: string
  rating?: number
  reviewsCount?: number
}
