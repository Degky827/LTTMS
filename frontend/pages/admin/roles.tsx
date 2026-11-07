import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { adminUserService } from '@/features/admin/services/adminUserService'

export default function AdminRolesManagementPage() {
  const [roleCounts, setRoleCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  const loadRoleCounts = async () => {
    try {
      setLoading(true)
      const roles = ['tourist', 'vendor', 'support', 'admin', 'super_admin']
      const results = await Promise.allSettled(
        roles.map((r) => adminUserService.getUsers({ role: r, limit: 1 }))
      )

      const counts: Record<string, number> = {}
      roles.forEach((r, idx) => {
        const res = results[idx]
        if (res.status === 'fulfilled' && res.value.success) {
          counts[r] = (res.value as any).total || 0
        } else {
          counts[r] = 0
        }
      })
      setRoleCounts(counts)
    } catch (err) {
      console.error('Failed to load role counts', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRoleCounts()
  }, [])

  const roleDefinitions = [
    {
      role: 'super_admin',
      name: 'Super Administrator',
      badgeVariant: 'danger' as const,
      desc: 'Platform root authority. Can assign administrative roles, modify system commission rules, view immutable audit logs, and oversee all marketplace operations.',
      capabilities: [
        'Assign Admin and Super Admin roles',
        'Configure platform commission policies',
        'View and export full audit logs',
        'Emergency booking overrides & payment reconciliations',
        'All standard Administrator privileges',
      ],
    },
    {
      role: 'admin',
      name: 'Platform Administrator',
      badgeVariant: 'primary' as const,
      desc: 'Operational management staff. Responsible for approving vendors, moderating tour listings, processing refund requests, and issuing settlement transfers.',
      capabilities: [
        'Review and approve vendor KYC trade licenses',
        'Moderate and feature tourism services',
        'Approve customer refund requests',
        'Review and mark vendor payouts transferred',
        'Moderate abusive customer reviews',
        'Export operational reports (CSV)',
      ],
    },
    {
      role: 'support',
      name: 'Customer Support Agent',
      badgeVariant: 'secondary' as const,
      desc: 'Customer help desk specialist. Manages tourist and vendor support tickets, replies to inquiries, and adds private internal notes.',
      capabilities: [
        'View and reply to customer support inquiries',
        'Record confidential internal staff investigation notes',
        'Update ticket triage priority and lifecycle states',
        'Restricted from financial and role modification endpoints',
      ],
    },
    {
      role: 'vendor',
      name: 'Tourism Vendor',
      badgeVariant: 'warning' as const,
      desc: 'Verified tourism service provider (boat operator, eco-lodge, local monastery guide). Manages tour schedules, departure slots, and views earnings.',
      capabilities: [
        'Publish tourism services (once KYC approved)',
        'Manage boat departure schedules & blackout dates',
        'Accept or decline booking reservations',
        'Request settlement withdrawals to CBE / Telebirr',
        'Apply for Lake Tana Biosphere Eco-Badges',
      ],
    },
    {
      role: 'tourist',
      name: 'Tourist / Traveler',
      badgeVariant: 'secondary' as const,
      desc: 'Standard marketplace consumer. Explores Lake Tana destinations, books experiences, pays via secure gateway, and reviews vendors.',
      capabilities: [
        'Browse and filter verified Lake Tana tours',
        'Reserve and pay for experiences via Chapa',
        'Request booking cancellations and refunds',
        'Submit ratings and feedback after tour completion',
      ],
    },
  ]

  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
      <AdminLayout
        title="Role-Based Access Control (RBAC) & Hierarchy"
        subtitle="Authoritative role definitions, assigned member counts, and platform capabilities matrix"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-secondary">
              Authoritative backend roles defined in modular monolith security middleware
            </p>
            <div className="flex items-center gap-2">
              <Link href="/admin/permissions">
                <Button size="sm" variant="outline">
                  Permission Matrix &rarr;
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button size="sm" variant="primary">
                  Manage Users &rarr;
                </Button>
              </Link>
            </div>
          </div>

          {/* Role Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {roleDefinitions.map((rd) => (
              <Card key={rd.role} className="p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={rd.badgeVariant}>{rd.name}</Badge>
                    <span className="text-xs font-mono font-bold text-lake-deep">
                      {loading ? '...' : (roleCounts[rd.role] ?? 0)} accounts
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{rd.desc}</p>
                  <div className="pt-2 border-t border-border">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">
                      Core Privileges:
                    </span>
                    <ul className="text-xs text-text-primary space-y-1">
                      {rd.capabilities.map((c, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-lake-teal shrink-0">✓</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  <Link href={`/admin/users?role=${rd.role}`}>
                    <Button size="sm" variant="outline" className="w-full justify-center">
                      View All {rd.name}s &rarr;
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}
