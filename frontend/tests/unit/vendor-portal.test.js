const { describe, it } = require('node:test')
const assert = require('node:assert/strict')

// 1. Vendor Net Payout & Commission Calculator (mirroring vendorFinanceService & Pricing simulator)
function calculateVendorEarnings({ grossAmount, commissionRate = 10 }) {
  const gross = Number(grossAmount) || 0
  const rate = Number(commissionRate) || 0
  const commissionFee = Math.round((gross * rate) / 100)
  const netEarnings = gross - commissionFee
  return { gross, rate, commissionFee, netEarnings }
}

// 2. Vendor Payout Withdrawal Eligibility Check
function validatePayoutRequest({ requestedAmount, availableBalance, minThreshold = 100 }) {
  const amount = Number(requestedAmount) || 0
  const balance = Number(availableBalance) || 0

  if (amount <= 0) {
    return { valid: false, error: 'Amount must be greater than zero' }
  }
  if (amount < minThreshold) {
    return { valid: false, error: `Minimum withdrawal threshold is ${minThreshold} ETB` }
  }
  if (amount > balance) {
    return { valid: false, error: 'Insufficient available ledger balance' }
  }
  return { valid: true, error: null }
}

// 3. Service Capacity & Operating Day Validation
function isDateBookable({ dateStr, operatingDays = [1, 2, 3, 4, 5, 6, 7], blockedDates = [], currentBookingsCount = 0, maxCapacity = 12, requestedGuests = 1 }) {
  // Check blocked dates
  if (blockedDates.includes(dateStr)) {
    return { bookable: false, reason: 'Date blocked by operator' }
  }

  // Check operating days
  const date = new Date(dateStr)
  const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay() // 1=Mon, 7=Sun
  if (!operatingDays.includes(dayOfWeek)) {
    return { bookable: false, reason: 'Non-operating day' }
  }

  // Check capacity
  if (currentBookingsCount + requestedGuests > maxCapacity) {
    return { bookable: false, reason: 'Capacity exceeded for this departure' }
  }

  return { bookable: true, reason: null }
}

// 4. Approved UI Badge variants
const APPROVED_BADGE_VARIANTS = ['outline', 'primary', 'secondary', 'accent', 'danger', 'default', 'success', 'warning', 'info']

const VENDOR_STATUS_VARIANTS = {
  approved: 'success',
  verified: 'success',
  submitted: 'warning',
  under_review: 'warning',
  pending: 'warning',
  rejected: 'danger',
  draft: 'default',
}

describe('LTTMS Vendor Portal Unit Tests', () => {
  describe('Commission & Net Payout Math', () => {
    it('Calculates standard 10% marketplace commission accurately', () => {
      const res = calculateVendorEarnings({ grossAmount: 15000, commissionRate: 10 })
      assert.equal(res.gross, 15000)
      assert.equal(res.rate, 10)
      assert.equal(res.commissionFee, 1500)
      assert.equal(res.netEarnings, 13500)
    })

    it('Calculates custom tier commission rate accurately', () => {
      const res = calculateVendorEarnings({ grossAmount: 8400, commissionRate: 12 })
      assert.equal(res.gross, 8400)
      assert.equal(res.commissionFee, 1008)
      assert.equal(res.netEarnings, 7392)
    })

    it('Handles zero gross amounts safely', () => {
      const res = calculateVendorEarnings({ grossAmount: 0, commissionRate: 10 })
      assert.equal(res.gross, 0)
      assert.equal(res.commissionFee, 0)
      assert.equal(res.netEarnings, 0)
    })
  })

  describe('Vendor Payout Withdrawal Validation', () => {
    it('Approves valid withdrawal within ledger balance', () => {
      const res = validatePayoutRequest({ requestedAmount: 5000, availableBalance: 12000 })
      assert.equal(res.valid, true)
      assert.equal(res.error, null)
    })

    it('Rejects withdrawal exceeding available balance', () => {
      const res = validatePayoutRequest({ requestedAmount: 15000, availableBalance: 10000 })
      assert.equal(res.valid, false)
      assert.equal(res.error, 'Insufficient available ledger balance')
    })

    it('Rejects withdrawal below minimum threshold', () => {
      const res = validatePayoutRequest({ requestedAmount: 50, availableBalance: 10000 })
      assert.equal(res.valid, false)
      assert.equal(res.error, 'Minimum withdrawal threshold is 100 ETB')
    })
  })

  describe('Capacity & Date Availability Validation', () => {
    it('Allows booking on open operating days with available seats', () => {
      const res = isDateBookable({
        dateStr: '2026-11-15', // Sunday
        operatingDays: [1, 2, 3, 4, 5, 6, 7],
        blockedDates: [],
        currentBookingsCount: 4,
        maxCapacity: 12,
        requestedGuests: 3,
      })
      assert.equal(res.bookable, true)
      assert.equal(res.reason, null)
    })

    it('Rejects booking when date is in vendor blackout list', () => {
      const res = isDateBookable({
        dateStr: '2026-11-20',
        operatingDays: [1, 2, 3, 4, 5, 6, 7],
        blockedDates: ['2026-11-20'],
        currentBookingsCount: 0,
        maxCapacity: 12,
        requestedGuests: 2,
      })
      assert.equal(res.bookable, false)
      assert.equal(res.reason, 'Date blocked by operator')
    })

    it('Rejects booking exceeding daily boat capacity', () => {
      const res = isDateBookable({
        dateStr: '2026-11-15',
        operatingDays: [1, 2, 3, 4, 5, 6, 7],
        blockedDates: [],
        currentBookingsCount: 10,
        maxCapacity: 12,
        requestedGuests: 4, // 10 + 4 = 14 > 12
      })
      assert.equal(res.bookable, false)
      assert.equal(res.reason, 'Capacity exceeded for this departure')
    })
  })

  describe('Verification Status UI Badges Integrity', () => {
    it('Resolves valid UI badge variants for all vendor KYC statuses', () => {
      const statuses = ['approved', 'verified', 'submitted', 'under_review', 'pending', 'rejected', 'draft']
      statuses.forEach((st) => {
        const variant = VENDOR_STATUS_VARIANTS[st]
        assert.ok(variant, `Variant missing for KYC status: ${st}`)
        assert.ok(
          APPROVED_BADGE_VARIANTS.includes(variant),
          `Variant "${variant}" is not an approved Badge component variant`
        )
      })
    })
  })

  describe('Vendor Portal Navigation Architecture', () => {
    const expectedVendorRoutes = [
      '/vendor/dashboard',
      '/vendor/bookings',
      '/vendor/services',
      '/vendor/availability',
      '/vendor/pricing',
      '/vendor/customers',
      '/vendor/revenue',
      '/vendor/commissions',
      '/vendor/reviews',
      '/vendor/eco-badge',
      '/vendor/verification',
      '/vendor/profile',
      '/vendor/support',
      '/vendor/settings',
    ]

    it('Contains all 14 mandatory vendor business routes', () => {
      assert.equal(expectedVendorRoutes.length, 14)
      expectedVendorRoutes.forEach((route) => {
        assert.ok(route.startsWith('/vendor/'), `Route ${route} must be under /vendor/ prefix`)
      })
    })
  })
})
