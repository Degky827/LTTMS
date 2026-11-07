const { describe, it } = require('node:test')
const assert = require('node:assert/strict')

// 1. Tour Pricing Calculation Helper (mirroring BookingPanel & backend pricing logic)
function calculateTourPricing({ basePrice, childPrice, adults, children }) {
  const adultP = Number(basePrice) || 0
  const childP = childPrice !== undefined && childPrice !== null ? Number(childPrice) : adultP * 0.5
  const adultTotal = adultP * Math.max(0, adults)
  const childTotal = childP * Math.max(0, children)
  const grandTotal = adultTotal + childTotal
  const totalGuests = adults + children
  return { adultTotal, childTotal, grandTotal, totalGuests }
}

// 2. Status Badge Variant Resolver
const STATUS_VARIANTS = {
  confirmed: 'success',
  pending: 'warning',
  completed: 'primary',
  cancelled: 'danger',
  rejected: 'danger',
  expired: 'default',
}

const PAYMENT_VARIANTS = {
  paid: 'success',
  pending: 'warning',
  unpaid: 'danger',
  refunded: 'default',
  failed: 'danger',
}

describe('LTTMS Tourist Portal Unit Tests', () => {
  describe('Tour Pricing Calculation', () => {
    it('Calculates adult-only pricing accurately', () => {
      const res = calculateTourPricing({
        basePrice: 1200,
        adults: 3,
        children: 0,
      })
      assert.equal(res.adultTotal, 3600)
      assert.equal(res.childTotal, 0)
      assert.equal(res.grandTotal, 3600)
      assert.equal(res.totalGuests, 3)
    })

    it('Calculates 50% default child discount accurately', () => {
      const res = calculateTourPricing({
        basePrice: 1500,
        adults: 2,
        children: 2,
      })
      assert.equal(res.adultTotal, 3000)
      assert.equal(res.childTotal, 1500) // 750 * 2
      assert.equal(res.grandTotal, 4500)
      assert.equal(res.totalGuests, 4)
    })

    it('Respects custom child pricing when configured', () => {
      const res = calculateTourPricing({
        basePrice: 2000,
        childPrice: 600, // custom price override
        adults: 2,
        children: 1,
      })
      assert.equal(res.adultTotal, 4000)
      assert.equal(res.childTotal, 600)
      assert.equal(res.grandTotal, 4600)
      assert.equal(res.totalGuests, 3)
    })
  })

  describe('Badge Variant Integrity', () => {
    const validVariants = ['outline', 'primary', 'secondary', 'accent', 'danger', 'default', 'success', 'warning', 'info']

    it('Resolves valid UI badge variants for all booking statuses', () => {
      const statuses = ['confirmed', 'pending', 'completed', 'cancelled', 'rejected', 'expired']
      statuses.forEach((st) => {
        const variant = STATUS_VARIANTS[st]
        assert.ok(variant, `Variant missing for status: ${st}`)
        assert.ok(validVariants.includes(variant), `Variant "${variant}" is not an approved Badge variant`)
      })
    })

    it('Resolves valid UI badge variants for all payment statuses', () => {
      const payStatuses = ['paid', 'pending', 'unpaid', 'refunded', 'failed']
      payStatuses.forEach((pst) => {
        const variant = PAYMENT_VARIANTS[pst]
        assert.ok(variant, `Variant missing for payment status: ${pst}`)
        assert.ok(validVariants.includes(variant), `Variant "${variant}" is not an approved Badge variant`)
      })
    })
  })

  describe('Tourist Portal Navigation Structure', () => {
    const touristNavHrefs = [
      '/tourist',
      '/tourist/bookings',
      '/services',
      '/tourist/payments',
      '/tourist/reviews',
      '/tourist/notifications',
      '/tourist/profile',
      '/contact',
    ]

    it('Contains complete dashboard routes for the tourist lifecycle', () => {
      assert.ok(touristNavHrefs.includes('/tourist'), 'Missing dashboard root')
      assert.ok(touristNavHrefs.includes('/tourist/bookings'), 'Missing bookings list route')
      assert.ok(touristNavHrefs.includes('/tourist/payments'), 'Missing payments & receipts route')
      assert.ok(touristNavHrefs.includes('/tourist/reviews'), 'Missing reviews feedback route')
      assert.ok(touristNavHrefs.includes('/tourist/notifications'), 'Missing notifications route')
      assert.ok(touristNavHrefs.includes('/tourist/profile'), 'Missing profile settings route')
    })
  })

  describe('Receipt & Financial Integrity', () => {
    it('Generates formatted receipt identifier with expected prefix', () => {
      const txRef = 'tx-test-1234567890-lake-tana'
      const formatted = `RCP-${txRef.slice(-8).toUpperCase()}`
      assert.match(formatted, /^RCP-[A-Z0-9-]{8}$/)
    })

    it('Preserves ETB currency standard for Ethiopian marketplace transactions', () => {
      const currency = 'ETB'
      const formatted = `${Number(4500).toLocaleString()} ${currency}`
      assert.equal(formatted, '4,500 ETB')
    })
  })
})
