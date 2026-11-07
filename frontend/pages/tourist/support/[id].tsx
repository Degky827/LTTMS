import React, { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { TouristLayout } from '@/components/layouts/TouristLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { supportService } from '@/features/support/services/supportService'
import { SupportTicket } from '@/features/support/types'
import { useToast } from '@/components/feedback/ToastProvider'
import { useLanguage } from '@/contexts/LanguageContext'

export default function TouristSupportTicketDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const { language } = useLanguage()
  const isAm = language === 'am'
  const { addToast } = useToast()

  const [ticket, setTicket] = useState<SupportTicket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [replyMessage, setReplyMessage] = useState('')
  const [sending, setSending] = useState(false)

  const loadTicket = useCallback(async () => {
    if (!id || Array.isArray(id)) return
    try {
      setLoading(true)
      setError(null)
      const res = await supportService.getTicketById(id)
      if (res.data) {
        setTicket(res.data)
      } else {
        setError('Ticket not found.')
      }
    } catch (err: any) {
      console.error('Failed to load support ticket:', err)
      setError(err?.response?.data?.message || 'Could not load ticket.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadTicket()
  }, [loadTicket])

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyMessage.trim() || !id || Array.isArray(id)) return

    try {
      setSending(true)
      const res = await supportService.addMessage(id, replyMessage.trim())
      if (res.data) {
        setTicket(res.data)
      }
      setReplyMessage('')
      addToast({
        type: 'success',
        title: isAm ? 'መልእክት ተልኳል' : 'Reply Sent',
        message: isAm ? 'መልእክትዎ ወደ ድጋፍ ሰጪው ተልኳል።' : 'Your reply has been added to the ticket.',
      })
    } catch (err: any) {
      console.error('Failed to send reply:', err)
      addToast({
        type: 'error',
        title: isAm ? 'ስህተት' : 'Failed to send',
        message: err?.response?.data?.message || 'Could not send message.',
      })
    } finally {
      setSending(false)
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
        <title>{ticket ? `${ticket.ticketNumber} | Support | LTTMS` : 'Ticket Details | LTTMS'}</title>
      </Head>
      <TouristLayout title={isAm ? 'የድጋፍ ዝርዝር' : 'Support Ticket'}>
        <PageHeader
          title={ticket ? `${ticket.ticketNumber}: ${ticket.subject}` : 'Support Request'}
          subtitle={
            isAm
              ? 'የድጋፍ ጥያቄ ዝርዝር እና ከጣና ቱሪዝም ድጋፍ ሰጪዎች ጋር የሚደረግ የደብዳቤ ልውውጥ።'
              : 'Direct communication thread with LTTMS tourism support specialists.'
          }
          breadcrumbs={[
            { label: isAm ? 'ዳሽቦርድ' : 'Dashboard', href: '/tourist' },
            { label: isAm ? 'ድጋፍ' : 'Support', href: '/tourist/support' },
            { label: ticket?.ticketNumber || 'Details' },
          ]}
          actions={
            <Link href="/tourist/support">
              <Button variant="outline" size="sm">
                &larr; {isAm ? 'ወደ ድጋፍ ዝርዝር' : 'Back to Tickets'}
              </Button>
            </Link>
          }
        />

        {loading ? (
          <div className="bg-white rounded-2xl p-8 border border-surface-border animate-pulse space-y-4">
            <div className="h-6 bg-surface-muted rounded w-1/4"></div>
            <div className="h-24 bg-surface-muted rounded"></div>
            <div className="h-48 bg-surface-muted rounded"></div>
          </div>
        ) : error || !ticket ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-surface-border space-y-4">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
              !
            </div>
            <h3 className="text-lg font-bold text-text-primary">{error || 'Ticket Not Found'}</h3>
            <Link href="/tourist/support">
              <Button variant="primary">{isAm ? 'ተመለስ' : 'Return to Support'}</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl">
            {/* Ticket Info Card */}
            <Card bordered className="bg-white">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-surface-border">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold bg-surface-muted px-3 py-1 rounded-md border border-surface-border text-text-primary">
                      {ticket.ticketNumber}
                    </span>
                    <Badge variant={getStatusVariant(ticket.status) as any} size="sm" className="capitalize">
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant="secondary" size="sm" className="capitalize">
                      {ticket.category.replace('_', ' ')}
                    </Badge>
                  </div>

                  <span className="text-xs text-text-muted">
                    {ticket.createdAt && new Date(ticket.createdAt).toLocaleString()}
                  </span>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-text-primary font-heading">
                    {ticket.subject}
                  </h2>
                  <p className="text-sm text-text-secondary mt-2 whitespace-pre-wrap leading-relaxed">
                    {ticket.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Conversation Thread */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-text-primary font-heading flex items-center gap-2">
                <span>💬</span>
                <span>{isAm ? 'የመልእክት ልውውጥ' : 'Conversation History'}</span>
                <span className="text-xs font-normal text-text-muted">
                  ({ticket.messages?.length || 0} {isAm ? 'መልእክቶች' : 'messages'})
                </span>
              </h3>

              {(!ticket.messages || ticket.messages.length === 0) ? (
                <div className="p-6 bg-white rounded-xl border border-surface-border text-center text-text-muted text-xs">
                  {isAm ? 'እስካሁን ምንም መልስ አልተሰጠም።' : 'No follow-up messages yet. Support will reply soon.'}
                </div>
              ) : (
                <div className="space-y-3">
                  {ticket.messages.map((m, idx) => {
                    const isStaff =
                      m.senderRole === 'admin' ||
                      m.senderRole === 'super_admin' ||
                      m.senderRole === 'support'

                    return (
                      <div
                        key={idx}
                        className={`p-5 rounded-2xl border ${
                          isStaff
                            ? 'bg-primary-50/50 border-primary-200 ml-0 sm:ml-8'
                            : 'bg-white border-surface-border mr-0 sm:mr-8'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-text-primary">
                              {isStaff ? (isAm ? 'የጣና ቱሪዝም ድጋፍ ቡድን' : 'LTTMS Support Specialist') : (isAm ? 'እርስዎ (ተጓዥ)' : 'You (Tourist)')}
                            </span>
                            {isStaff ? (
                              <Badge variant="primary" size="sm">Staff</Badge>
                            ) : (
                              <Badge variant="default" size="sm">Tourist</Badge>
                            )}
                          </div>
                          <span className="text-xs text-text-muted">
                            {m.createdAt && new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
                          {m.message}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Reply Input Box */}
            {ticket.status !== 'closed' ? (
              <Card bordered className="bg-white">
                <CardContent className="p-5">
                  <form onSubmit={handleSendReply} className="space-y-3">
                    <label className="block text-xs font-bold text-text-secondary uppercase">
                      {isAm ? 'መልስ ይጻፉ' : 'Add Reply'}
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder={
                        isAm
                          ? 'ተጨማሪ መረጃ ወይም ጥያቄ እዚህ ይጻፉ...'
                          : 'Type your message or response to support staff here...'
                      }
                      className="w-full px-3 py-2 rounded-xl border border-surface-border text-sm text-text-primary focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                    />
                    <div className="flex items-center justify-end">
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        disabled={sending || !replyMessage.trim()}
                        className="shadow-lake-sm"
                      >
                        {sending ? (isAm ? 'በመላክ ላይ...' : 'Sending...') : (isAm ? 'መልስ ላክ' : 'Send Reply')}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <div className="p-4 bg-gray-100 rounded-xl text-center text-xs text-text-muted">
                {isAm ? 'ይህ የድጋፍ ጥያቄ ተዘግቷል።' : 'This ticket has been resolved and closed.'}
              </div>
            )}
          </div>
        )}
      </TouristLayout>
    </ProtectedRoute>
  )
}
