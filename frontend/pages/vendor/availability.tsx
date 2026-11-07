import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { VendorLayout } from '@/components/layouts/VendorLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { vendorService } from '@/features/vendors/services/vendorService'
import { vendorServiceManagement } from '@/features/vendors/services/vendorServiceManagement'
import { Service } from '@/features/services/types'
import { useToast } from '@/contexts/ToastContext'

export default function VendorAvailabilityPage() {
  const router = useRouter()
  const { toast } = useToast()
  const queryServiceId = router.query.service as string | undefined

  const [services, setServices] = useState<Service[]>([])
  const [selectedServiceId, setSelectedServiceId] = useState<string>('')
  const [loadingServices, setLoadingServices] = useState(true)
  const [saving, setSaving] = useState(false)

  // Availability Configuration
  const [operatingDays, setOperatingDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 7])
  const [timeSlots, setTimeSlots] = useState<string[]>([
    '08:30 AM (Morning Departure)',
    '01:30 PM (Afternoon Excursion)',
    '04:45 PM (Sunset Lake Cruise)',
  ])
  const [newSlot, setNewSlot] = useState('')
  const [dailyCapacity, setDailyCapacity] = useState<number>(12)
  const [blockedDates, setBlockedDates] = useState<string[]>([])
  const [newBlockedDate, setNewBlockedDate] = useState('')

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  // Fetch Vendor Services
  useEffect(() => {
    async function init() {
      try {
        setLoadingServices(true)
        const profileRes = await vendorService.getMyProfile()
        if (profileRes.success && profileRes.data) {
          const sRes = await vendorServiceManagement.getMyServices(profileRes.data._id)
          if (sRes.success && sRes.data?.length > 0) {
            setServices(sRes.data)
            const targetId = queryServiceId && sRes.data.some((s) => s._id === queryServiceId)
              ? queryServiceId
              : sRes.data[0]._id
            setSelectedServiceId(targetId)
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingServices(false)
      }
    }
    init()
  }, [queryServiceId])

  // Fetch Availability for Selected Service
  useEffect(() => {
    if (!selectedServiceId) return

    async function loadAvailability() {
      try {
        const res = await vendorServiceManagement.getAvailability(selectedServiceId)
        if (res?.success && res.data) {
          const d = res.data
          if (d.operatingDays) setOperatingDays(d.operatingDays)
          if (d.timeSlots) setTimeSlots(d.timeSlots)
          if (d.dailyCapacity) setDailyCapacity(d.dailyCapacity)
          if (d.unavailableDates) setBlockedDates(d.unavailableDates)
        }
      } catch (err) {
        console.error('Failed to load availability', err)
      }
    }
    loadAvailability()
  }, [selectedServiceId, currentMonth, currentYear])

  const toggleDay = (day: number) => {
    if (operatingDays.includes(day)) {
      setOperatingDays(operatingDays.filter((d) => d !== day))
    } else {
      setOperatingDays([...operatingDays, day].sort())
    }
  }

  const addTimeSlot = () => {
    if (!newSlot.trim()) return
    setTimeSlots([...timeSlots, newSlot.trim()])
    setNewSlot('')
  }

  const removeTimeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index))
  }

  const addBlockedDate = () => {
    if (!newBlockedDate) return
    if (!blockedDates.includes(newBlockedDate)) {
      setBlockedDates([...blockedDates, newBlockedDate])
    }
    setNewBlockedDate('')
  }

  const removeBlockedDate = (dateStr: string) => {
    setBlockedDates(blockedDates.filter((d) => d !== dateStr))
  }

  const handleSaveAvailability = async () => {
    if (!selectedServiceId) return
    setSaving(true)
    try {
      await vendorServiceManagement.updateAvailability(selectedServiceId, {
        operatingDays,
        timeSlots,
        dailyCapacity,
        unavailableDates: blockedDates,
      })
      toast.success('Availability and departure schedule updated successfully!')
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to update schedule.'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  // Calendar Day Generator
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const daysCount = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <VendorLayout title="Availability & Scheduling">
        <div className="space-y-6">
          {/* Service Selector Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                Departure Schedules & Slots
              </h2>
              <p className="text-sm text-text-secondary">
                Control departure times, maximum daily guest capacity, and blackout dates.
              </p>
            </div>

            {services.length > 0 && (
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-text-secondary shrink-0">
                  Select Offering:
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg bg-surface text-text-primary text-sm font-medium focus:outline-none focus:ring-2 focus:ring-secondary-500"
                >
                  {services.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.title} ({s.price} {s.currency})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {loadingServices ? (
            <div className="py-16 text-center text-text-secondary">
              <div className="w-8 h-8 border-3 border-secondary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium">Loading schedule...</p>
            </div>
          ) : services.length === 0 ? (
            <Card className="p-12 text-center">
              <h3 className="text-lg font-bold text-text-primary">No Services Available</h3>
              <p className="text-sm text-text-secondary mt-1 mb-4">
                You must list at least one tourism service before configuring availability.
              </p>
              <Button variant="primary" onClick={() => router.push('/vendor/services/new')}>
                Add First Service
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Configuration Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="p-6 space-y-4">
                  <h3 className="text-base font-bold text-text-primary">
                    Operating Days
                  </h3>
                  <div className="grid grid-cols-7 gap-1">
                    {[
                      { num: 1, label: 'M' },
                      { num: 2, label: 'T' },
                      { num: 3, label: 'W' },
                      { num: 4, label: 'T' },
                      { num: 5, label: 'F' },
                      { num: 6, label: 'S' },
                      { num: 7, label: 'S' },
                    ].map((d) => {
                      const selected = operatingDays.includes(d.num)
                      return (
                        <button
                          key={d.num}
                          type="button"
                          onClick={() => toggleDay(d.num)}
                          className={`h-9 rounded-md text-xs font-bold transition-colors ${
                            selected
                              ? 'bg-secondary-600 text-white'
                              : 'bg-surface-muted text-text-muted hover:bg-surface-muted/80'
                          }`}
                        >
                          {d.label}
                        </button>
                      )
                    })}
                  </div>

                  <div>
                    <Input
                      label="Daily Passenger Capacity Limit"
                      type="number"
                      value={dailyCapacity}
                      onChange={(e) => setDailyCapacity(Number(e.target.value))}
                    />
                  </div>

                  {/* Departure Slots */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Departure Time Slots
                    </label>
                    <div className="space-y-1.5 mb-2">
                      {timeSlots.map((slot, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between px-3 py-1.5 bg-surface-muted rounded-lg text-xs"
                        >
                          <span className="font-medium text-text-primary">{slot}</span>
                          <button
                            type="button"
                            onClick={() => removeTimeSlot(idx)}
                            className="text-danger-500 hover:text-danger-700 font-bold ml-2"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g. 10:00 AM"
                        value={newSlot}
                        onChange={(e) => setNewSlot(e.target.value)}
                        className="text-xs"
                      />
                      <Button size="sm" variant="outline" type="button" onClick={addTimeSlot}>
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Blackout Dates */}
                  <div className="pt-2 border-t border-border">
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Blackout / Blocked Dates
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {blockedDates.map((d) => (
                        <span
                          key={d}
                          className="inline-flex items-center gap-1 py-0.5 px-2 rounded bg-danger-50 text-danger-700 text-xs font-semibold border border-danger-200"
                        >
                          {d}
                          <button
                            type="button"
                            onClick={() => removeBlockedDate(d)}
                            className="hover:text-danger-900"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={newBlockedDate}
                        onChange={(e) => setNewBlockedDate(e.target.value)}
                        className="px-2 py-1.5 border border-border rounded-lg bg-surface text-text-primary text-xs w-full"
                      />
                      <Button size="sm" variant="outline" type="button" onClick={addBlockedDate}>
                        Block
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      variant="primary"
                      className="w-full justify-center"
                      onClick={handleSaveAvailability}
                      isLoading={saving}
                    >
                      Save Schedule & Rules
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Interactive Calendar View */}
              <div className="lg:col-span-2">
                <Card className="p-6">
                  {/* Calendar Month Navigation */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-bold text-text-primary">
                      {monthNames[currentMonth]} {currentYear}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={handlePrevMonth}>
                        ‹ Prev
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleNextMonth}>
                        Next ›
                      </Button>
                    </div>
                  </div>

                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-text-secondary uppercase">
                    {daysOfWeek.map((d) => (
                      <div key={d}>{d}</div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {/* Empty cells before month start */}
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <div key={`empty-${i}`} className="h-24 bg-surface-muted/30 rounded-lg" />
                    ))}

                    {/* Day Cells */}
                    {Array.from({ length: daysCount }).map((_, i) => {
                      const dayNumber = i + 1
                      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`
                      const isBlocked = blockedDates.includes(dateStr)
                      const dayOfWeek = new Date(currentYear, currentMonth, dayNumber).getDay()
                      const backendDayNum = dayOfWeek === 0 ? 7 : dayOfWeek
                      const isOperatingDay = operatingDays.includes(backendDayNum)

                      return (
                        <div
                          key={dateStr}
                          className={`h-24 p-2 rounded-xl border flex flex-col justify-between transition-colors ${
                            isBlocked
                              ? 'bg-danger-50/50 border-danger-200'
                              : !isOperatingDay
                              ? 'bg-surface-muted/50 border-border/50 text-text-muted'
                              : 'bg-surface border-border hover:border-secondary-400'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-text-primary">{dayNumber}</span>
                            {isBlocked ? (
                              <span className="text-[10px] text-danger-600 font-bold">Closed</span>
                            ) : !isOperatingDay ? (
                              <span className="text-[10px] text-text-muted">Off</span>
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-success-500" />
                            )}
                          </div>

                          <div className="text-[11px] text-text-secondary">
                            {!isBlocked && isOperatingDay && (
                              <div>
                                <span className="text-[10px] text-text-muted block">{timeSlots.length} departures</span>
                                <span className="font-semibold text-secondary-600">Cap: {dailyCapacity}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-6 flex items-center justify-end gap-6 text-xs text-text-secondary border-t border-border pt-4">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-success-500" /> Operating & Bookable
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-danger-500" /> Blocked Date
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-gray-400" /> Non-Operating Day
                    </span>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </VendorLayout>
    </ProtectedRoute>
  )
}
