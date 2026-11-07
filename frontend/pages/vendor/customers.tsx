import React, { useState, useEffect } from 'react'
import { VendorLayout } from '@/components/layouts/VendorLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { vendorBookingService } from '@/features/vendors/services/vendorBookingService'
import { VendorBooking } from '@/features/vendors/types'

interface CustomerRecord {
  id: string
  name: string
  email: string
  phone: string
  bookingCount: number
  totalSpent: number
  currency: string
  lastBookingDate: string
  recentTour: string
}

export default function VendorCustomersPage() {
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState<CustomerRecord[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadGuests() {
      try {
        setLoading(true)
        const res = await vendorBookingService.getAll({ limit: 100 })
        if (res.success && res.data) {
          const map = new Map<string, CustomerRecord>()

          res.data.forEach((b: VendorBooking) => {
            const userId = (b.user as any)?._id || b.user?.email || b._id
            const existing = map.get(userId)

            if (existing) {
              existing.bookingCount += 1
              existing.totalSpent += b.totalAmount || 0
              if (new Date(b.date) > new Date(existing.lastBookingDate)) {
                existing.lastBookingDate = b.date
                existing.recentTour = b.service?.title || existing.recentTour
              }
            } else {
              map.set(userId, {
                id: userId,
                name: b.user?.name || 'Guest Traveler',
                email: b.user?.email || b.contactEmail || 'N/A',
                phone: b.user?.phone || b.contactPhone || 'N/A',
                bookingCount: 1,
                totalSpent: b.totalAmount || 0,
                currency: b.currency || 'ETB',
                lastBookingDate: b.date,
                recentTour: b.service?.title || 'Tour',
              })
            }
          })

          setCustomers(Array.from(map.values()))
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadGuests()
  }, [])

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <VendorLayout title="Guest Directory & CRM">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                Customer & Traveler Roster
              </h2>
              <p className="text-sm text-text-secondary">
                View past travelers, contact credentials, repeat guest frequency, and total patronage.
              </p>
            </div>

            <div className="w-full sm:w-72">
              <Input
                placeholder="Search by name, phone, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <Card className="overflow-hidden p-0">
            {loading ? (
              <div className="py-20 text-center text-text-secondary">
                <div className="w-8 h-8 border-3 border-secondary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs">Loading travelers...</p>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm font-semibold text-text-primary">No guests found.</p>
                <p className="text-xs text-text-muted mt-1">
                  Once travelers reserve your boat tours or services, their contact profiles will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase bg-surface-muted/60 text-text-secondary border-b border-border">
                    <tr>
                      <th className="py-3.5 px-4">Traveler Name</th>
                      <th className="py-3.5 px-4">Phone Number</th>
                      <th className="py-3.5 px-4">Email</th>
                      <th className="py-3.5 px-4">Trips Booked</th>
                      <th className="py-3.5 px-4">Total Spent</th>
                      <th className="py-3.5 px-4">Most Recent Tour</th>
                      <th className="py-3.5 px-4 text-right">Last Visit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredCustomers.map((c) => (
                      <tr key={c.id} className="hover:bg-surface-muted/30 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-text-primary">
                          {c.name}
                          {c.bookingCount > 1 && (
                            <span className="ml-2 py-0.5 px-1.5 rounded-full bg-secondary-100 text-secondary-800 text-[10px] font-bold">
                              Repeat Guest
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-text-secondary">{c.phone}</td>
                        <td className="py-3.5 px-4 text-xs text-text-secondary">{c.email}</td>
                        <td className="py-3.5 px-4 text-xs font-bold text-text-primary">
                          {c.bookingCount} {c.bookingCount === 1 ? 'trip' : 'trips'}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-bold text-secondary-600">
                          {c.totalSpent.toLocaleString()} {c.currency}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-text-secondary">
                          <span className="line-clamp-1 max-w-[180px]">{c.recentTour}</span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-text-muted text-right">
                          {new Date(c.lastBookingDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </VendorLayout>
    </ProtectedRoute>
  )
}
