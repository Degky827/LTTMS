import React, { useState, useEffect } from 'react'
import { VendorLayout } from '@/components/layouts/VendorLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { vendorService } from '@/features/vendors/services/vendorService'
import { vendorServiceManagement } from '@/features/vendors/services/vendorServiceManagement'
import { Service } from '@/features/services/types'
import { useToast } from '@/contexts/ToastContext'

export default function VendorPricingPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState<Service[]>([])

  // Calculator State
  const [calcTicketPrice, setCalcTicketPrice] = useState<number>(1500)
  const [calcGuests, setCalcGuests] = useState<number>(6)
  const [commissionRate] = useState<number>(10) // 10% standard baseline

  // Edit Pricing Modal State
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [formPrice, setFormPrice] = useState<number>(0)
  const [formChildPrice, setFormChildPrice] = useState<number>(0)
  const [formCurrency, setFormCurrency] = useState<string>('ETB')
  const [saving, setSaving] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const pRes = await vendorService.getMyProfile()
      if (pRes.success && pRes.data) {
        const sRes = await vendorServiceManagement.getMyServices(pRes.data._id)
        if (sRes.success) {
          setServices(sRes.data || [])
          if (sRes.data?.length > 0 && sRes.data[0].price) {
            setCalcTicketPrice(sRes.data[0].price)
          }
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const openEditModal = (service: Service) => {
    setSelectedService(service)
    setFormPrice(service.price || 0)
    setFormChildPrice(service.childPrice || 0)
    setFormCurrency(service.currency || 'ETB')
    setEditModalOpen(true)
  }

  const handleSavePrice = async () => {
    if (!selectedService) return
    setSaving(true)
    try {
      await vendorServiceManagement.updatePricing(selectedService._id, {
        price: Number(formPrice),
        childPrice: Number(formChildPrice),
        currency: formCurrency,
      })
      toast.success(`Pricing updated for "${selectedService.title}".`)
      setEditModalOpen(false)
      loadData()
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to update pricing.'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  // Calculator math
  const grossTotal = calcTicketPrice * calcGuests
  const commissionFee = Math.round((grossTotal * commissionRate) / 100)
  const netEarnings = grossTotal - commissionFee

  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <VendorLayout title="Pricing & Tier Management">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                Service Rates & Commission Structure
              </h2>
              <p className="text-sm text-text-secondary">
                Configure adult and child fares for your offerings and simulate your net payouts.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Services Pricing Table */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="p-6">
                <h3 className="text-base font-bold text-text-primary mb-4">
                  Active Tourism Offerings Rates
                </h3>

                {loading ? (
                  <div className="py-12 text-center text-text-secondary">
                    <div className="w-8 h-8 border-3 border-secondary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs">Loading rates...</p>
                  </div>
                ) : services.length === 0 ? (
                  <p className="text-xs text-text-muted py-6 text-center">
                    No services found. Add a service to configure pricing.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-xs uppercase bg-surface-muted/60 text-text-secondary border-b border-border">
                        <tr>
                          <th className="py-3 px-4">Service Offering</th>
                          <th className="py-3 px-4">Adult Base Price</th>
                          <th className="py-3 px-4">Child Rate</th>
                          <th className="py-3 px-4">Pricing Type</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {services.map((s) => (
                          <tr key={s._id} className="hover:bg-surface-muted/30 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-text-primary">
                              {s.title}
                              <span className="block text-xs text-text-muted font-normal capitalize">
                                {s.category?.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-secondary-600">
                              {s.price?.toLocaleString()} {s.currency || 'ETB'}
                            </td>
                            <td className="py-3.5 px-4 text-text-secondary">
                              {s.childPrice ? `${s.childPrice.toLocaleString()} ${s.currency || 'ETB'}` : '—'}
                            </td>
                            <td className="py-3.5 px-4 text-text-secondary capitalize">
                              {s.pricingType ? s.pricingType.replace('_', ' ') : 'Per Person'}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditModal(s)}
                              >
                                Edit Rate
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>

            {/* Payout Simulator Card */}
            <div className="lg:col-span-1">
              <Card className="p-6 bg-gradient-to-br from-surface to-secondary-50/30 border-secondary-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-secondary-100 text-secondary-800 rounded-lg">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-text-primary">Net Earnings Simulator</h3>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Ticket Price (ETB)"
                    type="number"
                    value={calcTicketPrice}
                    onChange={(e) => setCalcTicketPrice(Number(e.target.value))}
                  />

                  <Input
                    label="Expected Passengers / Guests"
                    type="number"
                    value={calcGuests}
                    onChange={(e) => setCalcGuests(Number(e.target.value))}
                  />

                  <div className="p-4 bg-surface rounded-xl border border-border space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Gross Fare Collected:</span>
                      <span className="font-bold text-text-primary">{grossTotal.toLocaleString()} ETB</span>
                    </div>
                    <div className="flex justify-between text-danger-600">
                      <span>Platform Service Fee ({commissionRate}%):</span>
                      <span>- {commissionFee.toLocaleString()} ETB</span>
                    </div>
                    <div className="border-t border-border pt-2 flex justify-between text-sm font-extrabold text-secondary-600">
                      <span>Your Net Payout:</span>
                      <span>{netEarnings.toLocaleString()} ETB</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-text-muted leading-relaxed">
                    * Net payouts are settled directly into your linked bank account or Telebirr upon completion of the boat tour or booking date.
                  </p>
                </div>
              </Card>
            </div>
          </div>

          {/* Edit Pricing Modal */}
          <Modal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            title={`Update Rates: ${selectedService?.title || ''}`}
          >
            <div className="space-y-4">
              <Input
                label="Adult Base Rate"
                type="number"
                required
                value={formPrice}
                onChange={(e) => setFormPrice(Number(e.target.value))}
              />

              <Input
                label="Child / Youth Rate"
                type="number"
                value={formChildPrice}
                onChange={(e) => setFormChildPrice(Number(e.target.value))}
              />

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Currency</label>
                <select
                  value={formCurrency}
                  onChange={(e) => setFormCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500"
                >
                  <option value="ETB">ETB (Ethiopian Birr)</option>
                  <option value="USD">USD (US Dollar)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setEditModalOpen(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSavePrice} isLoading={saving}>
                  Save Pricing
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      </VendorLayout>
    </ProtectedRoute>
  )
}
