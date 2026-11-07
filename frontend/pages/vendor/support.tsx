import React, { useState, useEffect } from 'react'
import { VendorLayout } from '@/components/layouts/VendorLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { vendorSupportService } from '@/features/vendors/services/vendorSupportService'
import { SupportTicket } from '@/features/vendors/types'
import { useToast } from '@/contexts/ToastContext'

export default function VendorSupportPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)

  // Create Ticket Modal
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [newSubject, setNewSubject] = useState('')
  const [newCategory, setNewCategory] = useState('booking')
  const [newPriority, setNewPriority] = useState('medium')
  const [newDescription, setNewDescription] = useState('')
  const [creating, setCreating] = useState(false)

  // Reply
  const [replyMessage, setReplyMessage] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  const loadTickets = async () => {
    try {
      setLoading(true)
      const res = await vendorSupportService.getTickets()
      if (res.success && res.data) {
        setTickets(res.data)
        if (selectedTicket) {
          const updated = res.data.find((t) => t._id === selectedTicket._id)
          if (updated) setSelectedTicket(updated)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTickets()
  }, [])

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubject.trim() || !newDescription.trim()) {
      toast.error('Please fill in both subject and description.')
      return
    }

    setCreating(true)
    try {
      const res = await vendorSupportService.createTicket({
        subject: newSubject.trim(),
        category: newCategory,
        priority: newPriority,
        description: newDescription.trim(),
      })

      if (res.success) {
        toast.success('Support ticket created. Our team will review shortly.')
        setCreateModalOpen(false)
        setNewSubject('')
        setNewDescription('')
        loadTickets()
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to create ticket.'
      toast.error(msg)
    } finally {
      setCreating(false)
    }
  }

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTicket || !replyMessage.trim()) return

    setSendingReply(true)
    try {
      const res = await vendorSupportService.addMessage(selectedTicket._id, replyMessage.trim())
      if (res.success && res.data) {
        setReplyMessage('')
        setSelectedTicket(res.data)
        loadTickets()
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to send reply.'
      toast.error(msg)
    } finally {
      setSendingReply(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return <Badge variant="success">{status.toUpperCase()}</Badge>
      case 'in_progress':
        return <Badge variant="info">IN PROGRESS</Badge>
      case 'waiting_user':
        return <Badge variant="warning">ACTION NEEDED</Badge>
      default:
        return <Badge variant="default">OPEN</Badge>
    }
  }

  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <VendorLayout title="Help & Support Desk">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                Vendor Support & Grievances
              </h2>
              <p className="text-sm text-text-secondary">
                Direct communication channel with Lake Tana Marketplace Operations & Maritime Coordinators.
              </p>
            </div>

            <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
              + Open Support Ticket
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tickets Roster */}
            <div className="lg:col-span-1 space-y-3">
              <Card className="p-0 overflow-hidden divide-y divide-border">
                <div className="p-4 bg-surface-muted/50 font-bold text-xs uppercase tracking-wider text-text-secondary">
                  My Tickets ({tickets.length})
                </div>

                {loading ? (
                  <div className="py-12 text-center text-xs text-text-secondary">
                    Loading tickets...
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="p-6 text-center text-xs text-text-muted">
                    No support tickets submitted yet.
                  </div>
                ) : (
                  tickets.map((t) => {
                    const isSelected = selectedTicket?._id === t._id
                    return (
                      <div
                        key={t._id}
                        onClick={() => setSelectedTicket(t)}
                        className={`p-4 cursor-pointer transition-colors ${
                          isSelected ? 'bg-primary-50/80 border-l-4 border-secondary-600' : 'hover:bg-surface-muted/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-mono text-secondary-600 font-bold">
                            {t.ticketNumber || `#${t._id.slice(-6)}`}
                          </span>
                          {getStatusBadge(t.status)}
                        </div>
                        <h4 className="text-xs font-bold text-text-primary line-clamp-1">{t.subject}</h4>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-text-muted capitalize">
                          <span>{t.category}</span>
                          <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )
                  })
                )}
              </Card>
            </div>

            {/* Conversation Thread */}
            <div className="lg:col-span-2">
              {selectedTicket ? (
                <Card className="p-6 flex flex-col h-[600px] justify-between">
                  {/* Thread Header */}
                  <div className="border-b border-border pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-secondary-600">
                          {selectedTicket.ticketNumber || `#${selectedTicket._id.slice(-6)}`}
                        </span>
                        <h3 className="text-base font-bold text-text-primary truncate">
                          {selectedTicket.subject}
                        </h3>
                      </div>
                      {getStatusBadge(selectedTicket.status)}
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                      Category: <span className="capitalize font-semibold text-text-primary">{selectedTicket.category}</span> • Priority: <span className="capitalize font-semibold text-text-primary">{selectedTicket.priority}</span>
                    </p>
                  </div>

                  {/* Messages Feed */}
                  <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                    {/* Original ticket description */}
                    <div className="p-3 rounded-xl bg-surface-muted text-xs leading-relaxed">
                      <span className="font-bold text-text-primary block mb-1">Issue Description:</span>
                      <p className="text-text-secondary">{selectedTicket.description}</p>
                    </div>

                    {selectedTicket.messages && selectedTicket.messages.map((m, idx) => {
                      const isVendor = m.sender?.role === 'vendor'
                      return (
                        <div
                          key={idx}
                          className={`flex flex-col ${isVendor ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                              isVendor
                                ? 'bg-secondary-600 text-white rounded-br-none'
                                : 'bg-surface-elevated border border-border text-text-primary rounded-bl-none shadow-xs'
                            }`}
                          >
                            <span className="font-bold text-[10px] block opacity-80 mb-1">
                              {m.sender?.name || (isVendor ? 'You' : 'Lake Tana Support')}
                            </span>
                            <p>{m.message}</p>
                          </div>
                          <span className="text-[10px] text-text-muted mt-1 px-1">
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Reply Input */}
                  <form onSubmit={handleSendReply} className="pt-4 border-t border-border flex gap-2">
                    <Input
                      placeholder="Type your message to support..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="text-xs"
                      disabled={selectedTicket.status === 'closed'}
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={sendingReply}
                      disabled={!replyMessage.trim() || selectedTicket.status === 'closed'}
                    >
                      Send
                    </Button>
                  </form>
                </Card>
              ) : (
                <Card className="p-12 text-center h-[400px] flex flex-col items-center justify-center">
                  <svg className="w-12 h-12 text-text-muted mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <h3 className="text-base font-bold text-text-primary">No Ticket Selected</h3>
                  <p className="text-xs text-text-muted mt-1">
                    Select a ticket from the left column to view the message history or reply.
                  </p>
                </Card>
              )}
            </div>
          </div>

          {/* Create Ticket Modal */}
          <Modal
            isOpen={createModalOpen}
            onClose={() => setCreateModalOpen(false)}
            title="Open Support Ticket"
          >
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <Input
                label="Ticket Subject"
                required
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="e.g. Inconsistency in CBE Birr payout settlement"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  >
                    <option value="booking">Reservation & Booking</option>
                    <option value="payment">Payouts & Payments</option>
                    <option value="verification">KYC & Licensing Verification</option>
                    <option value="technical">Technical / Website Issue</option>
                    <option value="service">Service Listing Question</option>
                    <option value="other">General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <Textarea
                label="Detailed Description"
                rows={4}
                required
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Provide booking references, payment dates, or issue details..."
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateModalOpen(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={creating}
                >
                  Submit Ticket
                </Button>
              </div>
            </form>
          </Modal>
        </div>
      </VendorLayout>
    </ProtectedRoute>
  )
}
