import React, { useState, useEffect } from 'react'
import { marketplaceService } from '../services/marketplaceService'
import { Spinner } from '@/components/ui/Spinner'

export interface AvailabilityCalendarProps {
  serviceId: string
  selectedDate: string
  onSelectDate: (date: string) => void
  operatingDays?: number[]
  unavailableDates?: string[]
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  serviceId,
  selectedDate,
  onSelectDate,
  operatingDays = [0, 1, 2, 3, 4, 5, 6],
  unavailableDates = [],
}) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })
  const [calendarData, setCalendarData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  // Format month name
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  // Days in month
  const firstDayIndex = new Date(year, month, 1).getDay()
  const totalDays = new Date(year, month + 1, 0).getDate()

  const todayStr = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (!serviceId) return

    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(totalDays).padStart(2, '0')}`

    let isMounted = true
    setLoading(true)

    marketplaceService
      .getCalendar(serviceId, startDate, endDate)
      .then((res) => {
        if (!isMounted) return
        const map: Record<string, any> = {}
        if (Array.isArray(res?.data)) {
          res.data.forEach((item: any) => {
            const dateKey = item.date?.slice(0, 10)
            if (dateKey) map[dateKey] = item
          })
        }
        setCalendarData(map)
      })
      .catch(() => {
        // Fallback to client-side operating days check if calendar endpoint fails
        setCalendarData({})
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [serviceId, year, month, totalDays])

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const prevMonth = () => {
    const now = new Date()
    if (year > now.getFullYear() || (year === now.getFullYear() && month > now.getMonth())) {
      setCurrentMonth(new Date(year, month - 1, 1))
    }
  }

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  const isDateDisabled = (dateStr: string, dayOfWeek: number) => {
    if (dateStr < todayStr) return true
    if (unavailableDates.includes(dateStr)) return true
    if (operatingDays && !operatingDays.includes(dayOfWeek)) return true

    // If backend calendar returned explicit false availability
    if (calendarData[dateStr] && calendarData[dateStr].available === false) return true

    return false
  }

  return (
    <div className="bg-surface rounded-xl border border-border-light p-4 shadow-sm select-none">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold font-heading text-text-primary">{monthName}</h4>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-text-secondary transition-colors disabled:opacity-30"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-text-secondary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {daysOfWeek.map((d, i) => (
          <span key={i} className="text-[11px] font-semibold text-text-muted py-1">
            {d}
          </span>
        ))}
      </div>

      {loading ? (
        <div className="py-12 flex justify-center items-center">
          <Spinner size="md" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-8" />
          ))}

          {Array.from({ length: totalDays }).map((_, i) => {
            const dayNum = i + 1
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
            const dayOfWeek = new Date(year, month, dayNum).getDay()
            const disabled = isDateDisabled(dateStr, dayOfWeek)
            const isSelected = selectedDate === dateStr
            const isToday = todayStr === dateStr

            return (
              <button
                key={dateStr}
                type="button"
                disabled={disabled}
                onClick={() => onSelectDate(dateStr)}
                className={`h-8 rounded-lg text-xs font-medium transition-all flex flex-col items-center justify-center relative ${
                  isSelected
                    ? 'bg-primary-700 text-white font-bold shadow-md scale-105'
                    : disabled
                    ? 'text-gray-300 dark:text-gray-600 line-through cursor-not-allowed bg-transparent'
                    : 'text-text-primary hover:bg-primary-50 dark:hover:bg-primary-950/40 hover:text-primary-700 font-semibold'
                } ${isToday && !isSelected ? 'border border-primary-500' : ''}`}
              >
                <span>{dayNum}</span>
              </button>
            )
          })}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-border-light flex items-center justify-between text-[11px] text-text-muted">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-primary-700" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full border border-primary-500" />
          <span>Today</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-gray-700" />
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  )
}
