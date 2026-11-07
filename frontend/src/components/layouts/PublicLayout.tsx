import React from 'react'
import { PublicNavbar } from '@/components/public-home/PublicNavbar'
import { PublicFooter } from '@/components/public-home/PublicFooter'

export interface PublicLayoutProps {
  children: React.ReactNode
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B1613] text-slate-900 dark:text-slate-100 selection:bg-[#244B3A] selection:text-white transition-colors duration-200">
      {/* 1. Public Sticky Airbnb-Style Navbar */}
      <PublicNavbar />

      {/* 2. Main Page Content */}
      <main className="flex-1">{children}</main>

      {/* 3. High-Contrast Legible Public Footer */}
      <PublicFooter />
    </div>
  )
}

export default PublicLayout
