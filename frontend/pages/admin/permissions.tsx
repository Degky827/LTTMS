import React from 'react'
import Link from 'next/link'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function AdminPermissionsMatrixPage() {
  const permissionsMatrix = [
    {
      module: 'User Management',
      superAdmin: 'Full (View, Update, Role Assign)',
      admin: 'View, Suspend, Activate',
      support: 'Read Profile (For Tickets)',
      vendor: 'Self Profile Only',
      tourist: 'Self Profile Only',
    },
    {
      module: 'Vendor Approvals (KYC)',
      superAdmin: 'Full (Approve, Reject, Suspend)',
      admin: 'Full (Approve, Reject, Suspend)',
      support: 'Read (View Status)',
      vendor: 'Submit Dossier (Self)',
      tourist: 'None',
    },
    {
      module: 'Tourism Services',
      superAdmin: 'Full (Approve, Reject, Feature)',
      admin: 'Full (Approve, Reject, Feature)',
      support: 'Read Only',
      vendor: 'CRUD (Own Services)',
      tourist: 'Read Public Marketplace',
    },
    {
      module: 'Bookings Oversight',
      superAdmin: 'Full (Override, Cancel, Audit)',
      admin: 'Full (Status Transition, Cancel)',
      support: 'View Linked Bookings',
      vendor: 'Accept, Decline (Own Bookings)',
      tourist: 'Create, Cancel (Own Bookings)',
    },
    {
      module: 'Payments & Gateway',
      superAdmin: 'Full (Audit, Transactions)',
      admin: 'Full (Audit, Transactions)',
      support: 'Read Linked Transactions',
      vendor: 'View Own Ledger',
      tourist: 'Pay, View Own Receipts',
    },
    {
      module: 'Customer Refunds',
      superAdmin: 'Full (Approve, Execute Rollback)',
      admin: 'Full (Approve, Execute Rollback)',
      support: 'Read Claims',
      vendor: 'View Debited Claims',
      tourist: 'Request Claim (Own Booking)',
    },
    {
      module: 'Commissions & Fees',
      superAdmin: 'Full (Create & Modify Rules)',
      admin: 'View Rules, View Ledger',
      support: 'None',
      vendor: 'View Deductions (Own)',
      tourist: 'None',
    },
    {
      module: 'Vendor Settlements',
      superAdmin: 'Full (Approve, Mark Complete)',
      admin: 'Full (Approve, Mark Complete)',
      support: 'None',
      vendor: 'Request Payout (Own Balance)',
      tourist: 'None',
    },
    {
      module: 'Customer Reviews',
      superAdmin: 'Full (Moderate, Hide, Delete)',
      admin: 'Full (Moderate, Hide, Delete)',
      support: 'Read Feedback',
      vendor: 'Official Reply, Report Abuse',
      tourist: 'Create Review (After Tour)',
    },
    {
      module: 'Customer Support Desk',
      superAdmin: 'Full (Assign, Notes, Replies)',
      admin: 'Full (Assign, Notes, Replies)',
      support: 'Full (Reply, Internal Notes)',
      vendor: 'Reply (Own Inquiries)',
      tourist: 'Create, Reply (Own Tickets)',
    },
    {
      module: 'Reports & CSV Export',
      superAdmin: 'Full (All 8 CSV Endpoints)',
      admin: 'Full (All 8 CSV Endpoints)',
      support: 'None',
      vendor: 'None',
      tourist: 'None',
    },
    {
      module: 'Audit Activity Logs',
      superAdmin: 'Read Full Immutable Audit Stream',
      admin: 'Read Recent Activity Feed',
      support: 'None',
      vendor: 'None',
      tourist: 'None',
    },
  ]

  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
      <AdminLayout
        title="Authoritative Permissions Matrix"
        subtitle="Role-based functional capabilities enforced across the LTTMS Express.js REST API"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/admin/roles">
              <Button size="sm" variant="outline">
                &larr; Back to Roles
              </Button>
            </Link>
          </div>

          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-bold text-lake-deep">
                Enterprise Module Capabilities Matrix
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAF9] text-text-secondary uppercase text-[10px] tracking-wider border-b border-border">
                  <tr>
                    <th className="py-3 px-4">Business Module</th>
                    <th className="py-3 px-4 text-red-800">Super Admin</th>
                    <th className="py-3 px-4 text-emerald-800">Administrator</th>
                    <th className="py-3 px-4 text-blue-800">Support Agent</th>
                    <th className="py-3 px-4 text-amber-800">Vendor</th>
                    <th className="py-3 px-4 text-gray-700">Tourist</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {permissionsMatrix.map((pm, idx) => (
                    <tr key={idx} className="hover:bg-surface-elevated transition-colors">
                      <td className="py-3 px-4 font-bold text-lake-deep">{pm.module}</td>
                      <td className="py-3 px-4 font-semibold text-red-900 bg-red-50/20">{pm.superAdmin}</td>
                      <td className="py-3 px-4 font-semibold text-emerald-900 bg-emerald-50/20">{pm.admin}</td>
                      <td className="py-3 px-4 text-blue-900">{pm.support}</td>
                      <td className="py-3 px-4 text-amber-900">{pm.vendor}</td>
                      <td className="py-3 px-4 text-text-muted">{pm.tourist}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}
