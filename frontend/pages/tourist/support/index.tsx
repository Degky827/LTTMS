import React, { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { TouristLayout } from '@/components/layouts/TouristLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { supportService } from '@/features/support/services/supportService'
import { SupportTicket } from '@/features/support/types'
import { bookingService } from '@/features/bookings/services/bookingService'
import { Booking } from '@/features/bookings/types'
import { useToast } from '@/components/feedback/ToastProvider'
import { useLanguage } from '@/contexts/LanguageContext'

const STATUS_TABS = [
  { id: 'all', labelEn: 'All Tickets', labelAm: 'ሁሉም ጥያቄዎች' },
  { id: 'open', labelEn: 'Open', labelAm: 'ክፍት' },
  { id: 'in_progress', labelEn: 'In Progress', labelAm: 'በሂደት ላይ' },
  { id: 'resolved', labelEn: 'Resolved', labelAm: 'የተፈታ' },
  { id: 'closed', labelEn: 'Closed', labelAm: 'የተዘጋ' },
]

const CATEGORY_OPTIONS = [
  { value: 'booking', labelEn: 'Booking Modification or Issue', labelAm: 'የቦታ ማስያዣ ችግር' },
  { value: 'payment', labelEn: 'Payment & Chapa Checkout', labelAm: 'የክፍያ እና ቻፓ ጉዳይ' },
  { value: 'refund', labelEn: 'Refund Request Inquiry', labelAm: 'የተመላሽ ገንዘብ ጥያቄ' },
  { value: 'service_quality', labelEn: 'Tour Quality & Boat Safety', labelAm: 'የአገልግሎት ጥራት እና ደህንነት' },
  { value: 'vendor', labelEn: 'Operator / Guide Behavior', labelAm: 'የአስጎብኚ ወይም የባለቤት ጉዳይ' },
  { value: 'general', labelEn: 'General Inquiry & Travel Advice', labelAm: 'አጠቃላይ የጉዞ ጥያቄ' },
]

export default function TouristSupportIndexPage() {
  const { language } = useLanguage()
  const isAm = language === 'am'
  const { addToast } = useToast()

  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  // Create Ticket Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [myBookings, setMyBookings] = useState<Booking[]>([])

  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('booking')
  const [priority, setPriority] = useState('medium')
  const [relatedBooking, setRelatedBooking] = useState('')
  const [description, setDescription] = useState('')
  const [formError, setFormError] = useState('')

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true)
      const res = await supportService.getMyTickets({
        status: activeTab !== 'all' ? activeTab : undefined,
      })
      if (res.data) {
        setTickets(res.data)
      }
    } catch (err) {
      console.error('Failed to load support tickets:', err)
      setTickets([])
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    loadTickets()
  }, [loadTickets])

  // Load bookings for selection in the modal
  const handleOpenModal = async () => {
    setModalOpen(true)
    setFormError('')
    try {
      const res = await bookingService.getMyBookings({ limit: 15 })
      if (res.data) {
        setMyBookings(res.data)
      }
    } catch (e) {
      console.warn('Could not load tourist bookings for ticket dropdown:', e)
    }
  }

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (subject.trim().length < 5) {
      setFormError(isAm ? 'ርዕስ ቢያንስ 5 ፊደላት መሆን አለበት።' : 'Subject must be at least 5 characters.')
      return
    }

    if (description.trim().length < 10) {
      setFormError(isAm ? 'ዝርዝር መግለጫ ቢያንስ 10 ፊደላት መሆን አለበት።' : 'Description must be at least 10 characters.')
      return
    }

    try {
      setSubmitting(true)
      await supportService.createTicket({
        subject: subject.trim(),
        category,
        priority,
        relatedBooking: relatedBooking || undefined,
        description: description.trim(),
      })

      addToast({
        type: 'success',
        title: isAm ? 'ጥያቄዎ ተልኳል' : 'Ticket Created',
        message: isAm ? 'የድጋፍ ጥያቄዎ በተሳካ ሁኔታ ተልኳል።' : 'Your support ticket has been submitted to LTTMS staff.',
      })

      // Reset form
      setSubject('')
      setDescription('')
      setRelatedBooking('')
      setModalOpen(false)
      loadTickets()
    } catch (err: any) {
      console.error('Failed to create ticket:', err)
      setFormError(err?.response?.data?.message || 'Failed to submit support ticket.')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'open':
        return 'warning'
      case 'assigned':
      case 'in_progress':
        return 'primary'
      case 'resolved':
        return 'success'
      case 'closed':
        return 'default'
      default:
        return 'secondary'
    }
  }

  return (
    <ProtectedRoute allowedRoles={['tourist', 'admin', 'super_admin']}>
      <Head>
        <title>{isAm ? 'የደንበኞች ድጋፍ | ጣና ቱሪዝም' : 'Customer Support & Helpdesk | LTTMS'}</title>
      </Head>
      <TouristLayout title={isAm ? 'የደንበኞች ድጋፍ' : 'Customer Support'}>
        <PageHeader
          title={isAm ? 'የደንበኞች ድጋፍ ማዕከል' : 'Customer Support & Assistance'}
          subtitle={
            isAm
              ? 'የቦታ ማስያዣ ማስተካከያ፣ የክፍያ ወይም የጣና ሐይቅ ጉዞ ጥያቄ ካለዎት የድጋፍ ባለሙያዎቻችን ዝግጁ ናቸው።'
              : 'Direct communication with Lake Tana tourism support specialists for reservations, payments, and trip safety.'
          }
          breadcrumbs={[
            { label: isAm ? 'ዳሽቦርድ' : 'Dashboard', href: '/tourist' },
            { label: isAm ? 'ድጋፍ' : 'Support' },
          ]}
          actions={
            <Button variant="primary" size="sm" onClick={handleOpenModal} className="shadow-lake-sm">
              + {isAm ? 'አዲስ የድጋፍ ጥያቄ ክፈት' : 'Open Support Ticket'}
            </Button>
          }
        />

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-surface-border pb-3 mb-6 overflow-x-auto scrollbar-none">
          {STATUS_TABS.map((tab) => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  active
                    ? 'bg-primary-600 text-white shadow-lake-sm'
                    : 'text-text-secondary hover:bg-surface-muted'
                }`}
              >
                {isAm ? tab.labelAm : tab.labelEn}
              </button>
            )
          })}
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-32 bg-white rounded-2xl border border-surface-border p-6"></div>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-surface-border space-y-4">
            <div className="w-16 h-16 bg-surface-muted rounded-full flex items-center justify-center text-3xl mx-auto">
              💬
            </div>
            <h3 className="text-lg font-bold text-text-primary font-heading">
              {isAm ? 'ምንም የድጋፍ ጥያቄ አልተገኘም' : 'No Support Tickets Found'}
            </h3>
            <p className="text-text-secondary max-w-md mx-auto text-sm">
              {activeTab === 'all'
                ? isAm
                  ? 'እስካሁን ምንም የከፈቱት የድጋፍ ጥያቄ የለም። እርዳታ ከፈለጉ አዲስ ጥያቄ ይክፈቱ።'
                  : "You don't have any open support inquiries. Need help with a tour or payment? Open a ticket!"
                : isAm
                ? `በ"${activeTab}" ሁኔታ ውስጥ ምንም ጥያቄ የለም።`
                : `No inquiries found under status "${activeTab}".`}
            </p>
            <Button variant="primary" onClick={handleOpenModal}>
              {isAm ? 'አዲስ ጥያቄ ክፈት' : 'Open Ticket Now'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {tickets.map((ticket) => {
              const dateStr = ticket.createdAt
                ? new Date(ticket.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : ''

              return (
                <Card
                  key={ticket._id}
                  bordered
                  className="bg-white hover:border-primary-400 transition-colors duration-200"
                >
                  <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold bg-surface-muted px-2.5 py-0.5 rounded-md border border-surface-border text-text-primary">
                          {ticket.ticketNumber}
                        </span>
                        <Badge variant={getStatusVariant(ticket.status) as any} size="sm" className="capitalize">
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="secondary" size="sm" className="capitalize">
                          {ticket.category.replace('_', ' ')}
                        </Badge>
                        {ticket.priority === 'urgent' && (
                          <Badge variant="danger" size="sm">
                            Urgent
                          </Badge>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-text-primary font-heading pt-1">
                        {ticket.subject}
                      </h3>

                      <p className="text-xs text-text-secondary line-clamp-2">
                        {ticket.description}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-text-muted pt-1">
                        <span>📅 {dateStr}</span>
                        <span>💬 {ticket.messages?.length || 1} {isAm ? 'መልእክት' : 'message(s)'}</span>
                        {ticket.relatedBooking && (
                          <span className="text-primary-600 font-semibold">
                            🔗 {isAm ? 'የተያያዘ ጉዞ' : 'Linked Booking'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center">
                      <Link href={`/tourist/support/${ticket._id}`}>
                        <Button variant="outline" size="sm" className="font-semibold">
                          {isAm ? 'ውይይቱን እይ &rarr;' : 'View Thread &rarr;'}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Create Ticket Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={isAm ? 'አዲስ የድጋፍ ጥያቄ ማቅረቢያ' : 'Submit Support Request'}
        >
          <form onSubmit={handleCreateTicket} className="space-y-4 pt-2">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                {isAm ? 'ርዕስ' : 'Subject'} *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={
                  isAm
                    ? 'ምሳሌ፡ የጀልባ ሰዓት ማስተካከል እፈልጋለሁ'
                    : 'e.g. Schedule adjustment for Zege monastery excursion'
                }
                className="w-full px-3 py-2 rounded-xl border border-surface-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  {isAm ? 'ምድብ' : 'Category'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-surface-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {isAm ? c.labelAm : c.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  {isAm ? 'አስቸኳይነት' : 'Priority'}
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-surface-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                >
                  <option value="low">{isAm ? 'ዝቅተኛ' : 'Low'}</option>
                  <option value="medium">{isAm ? 'መካከለኛ' : 'Medium'}</option>
                  <option value="high">{isAm ? 'ከፍተኛ' : 'High'}</option>
                  <option value="urgent">{isAm ? 'በጣም አስቸኳይ' : 'Urgent'}</option>
                </select>
              </div>
            </div>

            {/* Optional Related Booking Selection */}
            {myBookings.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                  {isAm ? 'የተያያዘ የቦታ ማስያዣ (አስገዳጅ ያልሆነ)' : 'Related Booking (Optional)'}
                </label>
                <select
                  value={relatedBooking}
                  onChange={(e) => setRelatedBooking(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-surface-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">{isAm ? '-- የለም --' : '-- None / General --'}</option>
                  {myBookings.map((b) => (
                    <option key={b._id} value={b._id}>
                      #{b.bookingReference} - {(b.service as any)?.title || 'Lake Tana Tour'} ({b.status})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                {isAm ? 'ዝርዝር መግለጫ' : 'Detailed Description'} *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  isAm
                    ? 'ጉዳይዎን በዝርዝር እዚህ ያብራሩ...'
                    : 'Please explain the issue or question in detail...'
                }
                className="w-full px-3 py-2 rounded-xl border border-surface-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-border">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setModalOpen(false)}
                disabled={submitting}
              >
                {isAm ? 'ሰርዝ' : 'Cancel'}
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? (isAm ? 'በመላክ ላይ...' : 'Submitting...') : (isAm ? 'አቅርብ' : 'Submit Ticket')}
              </Button>
            </div>
          </form>
        </Modal>
      </TouristLayout>
    </ProtectedRoute>
  )
}
