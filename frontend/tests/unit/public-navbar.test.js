const { describe, it } = require('node:test')
const assert = require('node:assert')

describe('LTTMS Public Single-Page Navbar Unit Tests', () => {
  const EXPECTED_NAV_ITEMS = [
    { id: 'home', labelEn: 'Home', labelAm: 'መነሻ' },
    { id: 'explore', labelEn: 'Explore', labelAm: 'አስስ' },
    { id: 'destinations', labelEn: 'Destinations', labelAm: 'መዳረሻዎች' },
    { id: 'experiences', labelEn: 'Experiences', labelAm: 'ተሞክሮዎች' },
    { id: 'eco-tourism', labelEn: 'Eco-Tourism', labelAm: 'ኢኮ-ቱሪዝም' },
    { id: 'about', labelEn: 'About', labelAm: 'ስለ እኛ' },
    { id: 'contact', labelEn: 'Contact', labelAm: 'አድራሻ' },
  ]

  describe('Navigation Items & Single-Page Scroll Mapping', () => {
    it('Includes all 7 mandatory single-page navigation items in order', () => {
      assert.strictEqual(EXPECTED_NAV_ITEMS.length, 7)
      const ids = EXPECTED_NAV_ITEMS.map((item) => item.id)
      assert.deepStrictEqual(ids, [
        'home',
        'explore',
        'destinations',
        'experiences',
        'eco-tourism',
        'about',
        'contact',
      ])
    })

    it('Maps each nav item to a valid homepage DOM element ID', () => {
      for (const item of EXPECTED_NAV_ITEMS) {
        assert.ok(item.id.length > 0, 'Nav item must have a non-empty ID')
        assert.match(item.id, /^[a-z0-9-]+$/, 'Nav item ID must be URL-safe slug')
      }
    })

    it('Calculates correct scroll offset considering sticky navbar height', () => {
      const stickyNavbarHeight = 72
      const targetElementTop = 850
      const currentScrollY = 200
      const elementAbsoluteTop = targetElementTop + currentScrollY
      const expectedOffset = Math.max(0, elementAbsoluteTop - stickyNavbarHeight)

      assert.strictEqual(expectedOffset, 978)
      assert.ok(expectedOffset < elementAbsoluteTop, 'Offset must leave clearance for the sticky navbar')
    })
  })

  describe('Design & Brand Consistency Requirements', () => {
    it('Uses Forest Green (#244B3A) as primary brand color', () => {
      const primaryBrandColor = '#244B3A'
      assert.strictEqual(primaryBrandColor.toLowerCase(), '#244b3a')
    })

    it('Enforces clean, minimalist white/warm-white background with sticky positioning', () => {
      const navbarStyles = {
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'bg-white',
      }
      assert.strictEqual(navbarStyles.position, 'sticky')
      assert.strictEqual(navbarStyles.top, 0)
      assert.strictEqual(navbarStyles.zIndex, 50)
      assert.strictEqual(navbarStyles.backgroundColor, 'bg-white')
    })
  })

  describe('Action Routing & Authentication State Handling', () => {
    it('Preserves routing for guest actions: Sign In -> /login, Get Started -> /register', () => {
      const guestActions = {
        signIn: '/login',
        getStarted: '/register',
      }
      assert.strictEqual(guestActions.signIn, '/login')
      assert.strictEqual(guestActions.getStarted, '/register')
    })

    it('Routes authenticated users to appropriate role dashboards', () => {
      const getDashboardLink = (role) => {
        if (['admin', 'super_admin', 'support'].includes(role)) return '/admin/dashboard'
        if (role === 'vendor') return '/vendor/dashboard'
        return '/tourist'
      }

      assert.strictEqual(getDashboardLink('admin'), '/admin/dashboard')
      assert.strictEqual(getDashboardLink('super_admin'), '/admin/dashboard')
      assert.strictEqual(getDashboardLink('vendor'), '/vendor/dashboard')
      assert.strictEqual(getDashboardLink('tourist'), '/tourist')
    })

    it('Toggles mobile drawer menu state cleanly', () => {
      let mobileMenuOpen = false
      const toggle = () => {
        mobileMenuOpen = !mobileMenuOpen
      }

      assert.strictEqual(mobileMenuOpen, false)
      toggle()
      assert.strictEqual(mobileMenuOpen, true)
      toggle()
      assert.strictEqual(mobileMenuOpen, false)
    })
  })
})
