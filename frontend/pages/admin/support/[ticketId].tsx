import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { adminSupportService } from '@/features/admin/services/adminSupportService'
import { AdminSupportTicket } from '@/features/admin/types'
import { useToast } from '@/contexts/ToastContext'

export default function AdminTicketDetailPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { ticketId } = router.query as { ticketId: string }

  const [ticket, setTicket] = useState<AdminSupportTicket | null>(null)
  const [loading, setLoading] = useState(true)

  // Message Sending State
  const [replyText, setReplyText] = useState('')
  const [internalNoteText, setInternalNoteText] = useState('')
  const [activeTab, setActiveTab] = useState<'reply' | 'note'>('reply')
  const [sending, setSending] = useState(false)

  const loadTicket = async () => {
    if (!ticketId) return
    try {
      setLoading(true)
      const res = await adminSupportService.getTicketDetail(ticketId)
      if (res.success && res.data) {
        setTicket(res.data)
      } else {
        toast.error('Ticket not found')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load ticket details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTicket()
  }, [ticketId])

  const handleSendPublicReply = async () => {
    if (!ticketId || !replyText.trim()) {
      toast.error('Reply message cannot be empty')
      return
    }

    setSending(true)
    try {
      const res = await adminSupportService.reply(ticketId, replyText)
      if (res.success) {
        toast.success('Public reply dispatched to customer')
        setReplyText('')
        loadTicket()
      } else {
        toast.error(res.message || 'Failed to send reply')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to send reply')
    } finally {
      setSending(false)
    }
  }

  const handleAddInternalNote = async () => {
    if (!ticketId || !internalNoteText.trim()) {
      toast.error('Internal note text cannot be empty')
      return
    }

    setSending(true)
    try {
      const res = await adminSupportService.addInternalNote(ticketId, internalNoteText)
      if (res.success) {
        toast.success('Internal note recorded (strictly hidden from customer)')
        setInternalNoteText('')
        loadTicket()
      } else {
        toast.error(res.message || 'Failed to save note')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save note')
    } finally {
      setSending(false)
    }
  }

  const handleStatusChange = async (st: string) => {
    if (!ticketId) return
    try {
      const res = await adminSupportService.updateStatus(ticketId, st)
      if (res.success) {
        toast.success(`Ticket status updated to ${st}`)
        loadTicket()
      }
    } catch (err) {
      toast.error('Failed to change status')
    }
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin', 'support']}>
      <AdminLayout
        title="Support Ticket Dossier & Staff Conversation"
        subtitle={`Ticket Number: ${ticket?.ticketNumber || ticketId || ''}`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/admin/support">
              <Button size="sm" variant="outline">
                &larr; Back to Help Desk
              </Button>
            </Link>

            {ticket && (
              <div className="flex items-center gap-2">
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="text-xs rounded-lg border border-border p-2 bg-white text-text-primary font-semibold"
                >
                  <option value="open">Open</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="waiting_for_user">Waiting for User</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            )}
          </div>

          {loading ? (
            <div className="py-24 text-center text-xs text-text-muted">Loading ticket thread...</div>
          ) : !ticket ? (
            <Card className="p-8 text-center text-xs text-text-secondary">Ticket not found.</Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Messages Thread and Composer */}
              <div className="lg:col-span-2 space-y-5">
                {/* Subject Header */}
                <Card className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h2 className="text-lg font-bold text-lake-deep">{ticket.subject}</h2>
                    <Badge variant={ticket.priority === 'urgent' || ticket.priority === 'high' ? 'danger' : 'secondary'}>
                      {ticket.priority} priority
                    </Badge>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Created on {new Date(ticket.createdAt).toLocaleString()} &bull; Category: <span className="font-semibold capitalize text-lake-teal">{ticket.category}</span>
                  </p>
                </Card>

                {/* Conversation History */}
                <div className="space-y-3">
                  {ticket.messages.map((msg, idx) => {
                    const isInternal = msg.visibility === 'internal'
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border text-xs ${
                          isInternal
                            ? 'bg-amber-50/70 border-amber-200'
                            : 'bg-white border-border shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lake-deep">
                              {msg.sender?.name || 'Staff Member'}
                            </span>
                            <Badge variant={isInternal ? 'warning' : 'secondary'}>
                              {isInternal ? '🔒 Staff Internal Note' : msg.senderRole || msg.sender?.role || 'User'}
                            </Badge>
                          </div>
                          <span className="text-[11px] text-text-muted">
                            {new Date(msg.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-text-primary whitespace-pre-line leading-relaxed">
                          {msg.message}
                        </p>
                      </div>
                    )
                  })}
                </div>

                {/* Reply / Internal Note Composer */}
                <Card className="p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <Button
                      size="sm"
                      variant={activeTab === 'reply' ? 'primary' : 'outline'}
                      onClick={() => setActiveTab('reply')}
                    >
                      Public Customer Reply
                    </Button>
                    <Button
                      size="sm"
                      variant={activeTab === 'note' ? 'warning' : 'outline'}
                      onClick={() => setActiveTab('note')}
                    >
                      🔒 Add Private Internal Staff Note
                    </Button>
                  </div>

                  {activeTab === 'reply' ? (
                    <div className="space-y-3">
                      <p className="text-[11px] text-text-secondary">
                        This response will be sent directly to the customer&apos;s support dashboard and registered email address.
                      </p>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={4}
                        className="w-full text-xs rounded-lg border border-border p-3 bg-white text-text-primary focus:ring-1 focus:ring-lake-deep"
                        placeholder="Write a clear, helpful response to the customer..."
                      />
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={handleSendPublicReply}
                          disabled={sending}
                        >
                          {sending ? 'Sending...' : 'Send Public Reply'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
                        🔒 Internal notes are strictly visible to administrators and support agents. They are completely stripped from all public customer API responses.
                      </p>
                      <textarea
                        value={internalNoteText}
                        onChange={(e) => setInternalNoteText(e.target.value)}
                        rows={3}
                        className="w-full text-xs rounded-lg border border-border p-3 bg-white text-text-primary focus:ring-1 focus:ring-amber-500"
                        placeholder="Record private staff investigation notes, vendor phone call outcomes, etc..."
                      />
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          variant="warning"
                          onClick={handleAddInternalNote}
                          disabled={sending}
                        >
                          {sending ? 'Saving...' : 'Save Internal Note'}
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </div>

              {/* Right Column: User & Metadata File */}
              <div className="space-y-5">
                <Card className="p-5 space-y-4">
                  <h3 className="text-sm font-bold text-lake-deep border-b border-border pb-2">
                    Requester Dossier
                  </h3>
                  <div>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                      Name
                    </span>
                    <p className="text-xs font-bold text-lake-deep mt-0.5">{ticket.user?.name}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                      Email
                    </span>
                    <p className="text-xs text-text-secondary font-mono mt-0.5">{ticket.user?.email}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                      Account Role
                    </span>
                    <Badge variant="primary" className="mt-1">
                      {ticket.user?.role || 'tourist'}
                    </Badge>
                  </div>
                  {ticket.user?.phone && (
                    <div>
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                        Phone
                      </span>
                      <p className="text-xs text-text-secondary mt-0.5">📞 {ticket.user.phone}</p>
                    </div>
                  )}
                </Card>

                <Card className="p-5 space-y-4">
                  <h3 className="text-sm font-bold text-lake-deep border-b border-border pb-2">
                    Assignment & Triage
                  </h3>
                  <div>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                      Assigned Agent
                    </span>
                    <p className="text-xs font-semibold text-lake-deep mt-0.5">
                      {ticket.assignedTo?.name || 'Unassigned'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                      Status
                    </span>
                    <Badge variant="secondary" className="mt-1">
                      {ticket.status}
                    </Badge>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}
