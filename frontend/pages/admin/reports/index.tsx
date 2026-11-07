import React, { useState } from 'react'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { adminReportExportService } from '@/features/admin/services/adminReportExportService'
import { useToast } from '@/contexts/ToastContext'

export default function AdminReportsExportPage() {
  const { toast } = useToast()
  const [downloading, setDownloading] = useState<string | null>(null)

  const exportCategories = [
    {
      id: 'bookings',
      title: 'Platform Bookings & Reservations',
      desc: 'All customer tour bookings, participant counts, booking statuses, dates, and amounts.',
      filename: 'lttms_bookings_export.csv',
      icon: '📅',
    },
    {
      id: 'payments',
      title: 'Payment Gateway Transactions',
      desc: 'Verified transactions, transaction references, amounts in ETB, payment methods, and timestamps.',
      filename: 'lttms_payments_export.csv',
      icon: '💳',
    },
    {
      id: 'commissions',
      title: 'Marketplace Commissions Ledger',
      desc: 'Platform fee deductions per transaction, calculated commission rates, and net vendor distributions.',
      filename: 'lttms_commissions_export.csv',
      icon: '💰',
    },
    {
      id: 'refunds',
      title: 'Customer Refund Claims',
      desc: 'Claim references, claimant accounts, debited vendors, requested amounts, and resolution status.',
      filename: 'lttms_refunds_export.csv',
      icon: '↩️',
    },
    {
      id: 'settlements',
      title: 'Vendor Settlement Payouts',
      desc: 'Completed and pending bank payout transfers, bank wire reference codes, and balances.',
      filename: 'lttms_settlements_export.csv',
      icon: '🏦',
    },
    {
      id: 'vendors',
      title: 'Vendors Directory & Compliance',
      desc: 'Complete list of registered tourism operators, trade licenses, verification status, and ratings.',
      filename: 'lttms_vendors_export.csv',
      icon: '⛵',
    },
    {
      id: 'reviews',
      title: 'Customer Reviews & Feedback',
      desc: 'All traveler reviews, star ratings, service associations, and community flag reports.',
      filename: 'lttms_reviews_export.csv',
      icon: '⭐',
    },
    {
      id: 'support',
      title: 'Support Tickets & Inquiries',
      desc: 'Customer help desk inquiries, ticket numbers, priorities, assigned staff, and resolution states.',
      filename: 'lttms_support_tickets_export.csv',
      icon: '🎧',
    },
  ]

  const handleDownload = async (id: string, filename: string) => {
    setDownloading(id)
    try {
      const res = await adminReportExportService.downloadCsv(id, filename)
      if (res.success) {
        toast.success(`Export file "${filename}" downloaded successfully`)
      } else {
        toast.error(res.message || 'Download failed')
      }
    } catch (err: any) {
      toast.error('Failed to export dataset')
    } finally {
      setDownloading(null)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
      <AdminLayout
        title="Reports & RFC 4180 CSV Data Export"
        subtitle="Download auditable platform datasets formatted for external accounting, audits, and Ethiopian regulatory reporting"
      >
        <div className="space-y-6">
          <Card className="p-4 bg-lake-deep/5 border-lake-teal/30 text-xs text-lake-deep space-y-1">
            <p className="font-bold">Compliance & Data Portability Standard:</p>
            <p>
              Exports are generated directly by the backend controller adhering strictly to RFC 4180 standard CSV format. Data fields containing private passwords, token hashes, and internal server secrets are strictly excluded.
            </p>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {exportCategories.map((cat) => (
              <Card key={cat.id} className="p-5 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{cat.icon}</span>
                    <h3 className="text-sm font-bold text-lake-deep">{cat.title}</h3>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{cat.desc}</p>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] font-mono text-text-muted">{cat.filename}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(cat.id, cat.filename)}
                    disabled={downloading === cat.id}
                  >
                    {downloading === cat.id ? 'Exporting...' : '📥 Download CSV'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}
