import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { TouristLayout } from '@/components/layouts/TouristLayout'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { bookingService } from '@/features/bookings/services/bookingService'
import { Booking } from '@/features/bookings/types'
import { BookingCard } from '@/features/bookings/components/BookingCard'
import { CancelBookingModal } from '@/features/bookings/components/CancelBookingModal'
import { RefundRequestModal } from '@/features/bookings/components/RefundRequestModal'

export default function TouristOverviewDashboard() {
  const { user } = useAuth()
  const { language } = useLanguage()
  const isAm = language === 'am'

  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<Booking | null>(null)
  const [selectedBookingForRefund, setSelectedBookingForRefund] = useState<Booking | null>(null)

  const loadMyBookings = async () => {
    try {
      setLoading(true)
      const res = await bookingService.getMyBookings({ limit: 20 })
      if (res.data) {
        setBookings(res.data)
      }
    } catch (err) {
      console.error('Failed to load tourist bookings:', err)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMyBookings()
  }, [])

  // Derived real backend metrics
  const activeCount = bookings.filter((b) => b.status === 'confirmed').length
  const pendingCount = bookings.filter((b) => b.status === 'pending').length
  const completedCount = bookings.filter((b) => b.status === 'completed').length
  const totalSpent = bookings
    .filter((b) => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + (b.totalAmount || b.totalPrice || 0), 0)

  return (
    <ProtectedRoute allowedRoles={['tourist', 'admin', 'super_admin']}>
      <Head>
        <title>{isAm ? 'የቱሪስት ዳሽቦርድ | ጣና ቱሪዝም' : 'Tourist Dashboard | LTTMS'}</title>
      </Head>
      <TouristLayout title={isAm ? 'የቱሪስት መቆጣጠሪያ' : 'Tourist Portal'}>
        <PageHeader
          title={
            isAm
              ? `እንኳን ደህና መጡ፣ ${user?.name || 'ተጓዥ'}!`
              : `Welcome back, ${user?.name || 'Explorer'}!`
          }
          subtitle={
            isAm
              ? 'የጣና ሐይቅ ጉዞዎችዎን፣ የጀልባ ቦታ ማስያዣዎችን፣ ደረሰኞችን እና የጉዞ መርሐግብርዎን ያስተዳድሩ።'
              : 'Manage your Lake Tana tour reservations, boat excursions, official receipts, and travel itinerary.'
          }
          breadcrumbs={[
            { label: isAm ? 'መነሻ' : 'Home', href: '/' },
            { label: isAm ? 'የቱሪስት ዳሽቦርድ' : 'Tourist Dashboard' },
          ]}
          actions={
            <Link href="/tourist/marketplace">
              <Button variant="primary" size="sm" className="shadow-lake-sm">
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {isAm ? 'ተሞክሮዎችን ፈልግ' : 'Explore Experiences'}
              </Button>
            </Link>
          }
        />

        {/* Real Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <Card bordered className="bg-white border-surface-border hover:shadow-lake-sm transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-text-muted">
                {isAm ? 'ቀጣይና የተረጋገጡ' : 'Active & Upcoming'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-primary-600 font-heading">
                  {activeCount}
                </span>
                <Badge variant="success" size="sm">
                  {isAm ? 'የተረጋገጠ' : 'Confirmed'}
                </Badge>
              </div>
              <p className="text-xs text-text-secondary mt-2">
                {isAm ? 'ለጉዞዎ ዝግጁ የሆኑ የጀልባ እና የገዳማት ጉብኝቶች።' : 'Confirmed boat tours & island guides ready for you.'}
              </p>
            </CardContent>
          </Card>

          <Card bordered className="bg-white border-surface-border hover:shadow-lake-sm transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-text-muted">
                {isAm ? 'ክፍያ የሚጠብቁ' : 'Awaiting Payment'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-amber-600 font-heading">
                  {pendingCount}
                </span>
                <Badge variant="warning" size="sm">
                  {isAm ? 'በመጠባበቅ ላይ' : 'Awaiting'}
                </Badge>
              </div>
              <p className="text-xs text-text-secondary mt-2">
                {isAm ? 'የቻፓ ክፍያ ማረጋገጫ የሚጠብቁ ቦታዎች።' : 'Reservations waiting for secure Chapa checkout.'}
              </p>
            </CardContent>
          </Card>

          <Card bordered className="bg-white border-surface-border hover:shadow-lake-sm transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-text-muted">
                {isAm ? 'የተጠናቀቁ ጉዞዎች' : 'Completed Trips'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-text-primary font-heading">
                  {completedCount}
                </span>
                <Badge variant="primary" size="sm">
                  {isAm ? 'ትውስታዎች' : 'Memories'}
                </Badge>
              </div>
              <p className="text-xs text-text-secondary mt-2">
                {isAm ? 'ያጠናቀቋቸው የደሴት ገዳማትና የፏፏቴ ጉብኝቶች።' : 'Past monastery visits & waterfall expeditions.'}
              </p>
            </CardContent>
          </Card>

          <Card bordered className="bg-white border-surface-border hover:shadow-lake-sm transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-text-muted">
                {isAm ? 'ጠቅላላ ወጪ የተደረገ' : 'Total Trips Invested'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-primary-700 font-heading">
                  {totalSpent.toLocaleString()} <span className="text-xs font-normal">ETB</span>
                </span>
                <Badge variant="default" size="sm">
                  {isAm ? 'የተከፈለ' : 'Paid'}
                </Badge>
              </div>
              <p className="text-xs text-text-secondary mt-2">
                {isAm ? 'በጣና ሐይቅ የተረጋገጡ አገልግሎቶች ላይ የተደረገ ክፍያ።' : 'Verified local eco-tourism investments.'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reservations Section */}
        <div className="space-y-5 mb-8">
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-text-primary font-heading">
                {isAm ? 'የቅርብ ጊዜ የተያዙ ቦታዎች' : 'My Recent Reservations'}
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                {isAm
                  ? 'የጉዞ መርሐግብርዎን ይመልከቱ፣ ደረሰኝ ያውርዱ ወይም ቦታዎን ያስተዳድሩ።'
                  : 'Check schedule, download official receipts, or manage your bookings.'}
              </p>
            </div>
            {bookings.length > 0 && (
              <Link href="/tourist/bookings">
                <Button variant="outline" size="sm">
                  {isAm ? `ሁሉንም ይመልከቱ (${bookings.length}) →` : `View All (${bookings.length}) →`}
                </Button>
              </Link>
            )}
          </div>

          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2].map((n) => (
                <div key={n} className="h-44 bg-white rounded-2xl border border-surface-border p-6"></div>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-surface-border space-y-4">
              <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center text-3xl mx-auto">
                ⛵
              </div>
              <h3 className="text-lg font-bold text-text-primary font-heading">
                {isAm ? 'እስካሁን ምንም ጉዞ አልያዙም' : 'No Reservations Yet'}
              </h3>
              <p className="text-text-secondary max-w-md mx-auto text-sm">
                {isAm
                  ? 'እስካሁን ምንም የጣና ሐይቅ የጀልባ ጉዞ ወይም የገዳም አስጎብኚ አልያዙም። የተረጋገጡ ጉብኝቶችን ያስሱና ጉዞዎን ይጀምሩ!'
                  : "You haven't booked any Lake Tana boat excursions or monastery guides yet. Explore verified tours and start your journey!"}
              </p>
              <Link href="/tourist/marketplace">
                <Button variant="primary">
                  {isAm ? 'ጉብኝቶችን እና ተሞክሮዎችን ያስሱ' : 'Browse Tours & Experiences'}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.slice(0, 5).map((b) => (
                <BookingCard
                  key={b._id}
                  booking={b}
                  onCancelClick={(booking) => setSelectedBookingForCancel(booking)}
                  onRefundClick={(booking) => setSelectedBookingForRefund(booking)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Links & Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <Card bordered className="bg-white hover:border-primary-400 transition-colors">
            <CardContent className="p-5 space-y-2">
              <span className="text-2xl block mb-1">🧭</span>
              <h3 className="font-bold text-text-primary text-sm font-heading">
                {isAm ? 'ገበያውን ያስሱ' : 'Explore Marketplace'}
              </h3>
              <p className="text-xs text-text-secondary">
                {isAm ? 'የጀልባ ጉዞዎችን፣ ደሴቶችን እና ማረፊያዎችን ያግኙ።' : 'Find certified boat operators, island monasteries, and eco-lodges.'}
              </p>
              <Link href="/tourist/marketplace" className="inline-block text-xs font-semibold text-primary-600 hover:underline pt-2">
                {isAm ? 'ወደ ገበያ ሂድ &rarr;' : 'Open Marketplace &rarr;'}
              </Link>
            </CardContent>
          </Card>

          <Card bordered className="bg-white hover:border-primary-400 transition-colors">
            <CardContent className="p-5 space-y-2">
              <span className="text-2xl block mb-1">💳</span>
              <h3 className="font-bold text-text-primary text-sm font-heading">
                {isAm ? 'ክፍያዎች እና ደረሰኞች' : 'Payments & Receipts'}
              </h3>
              <p className="text-xs text-text-secondary">
                {isAm ? 'የቻፓ የክፍያ ታሪክዎንና የተረጋገጡ ደረሰኞችን ይመልከቱ።' : 'View transaction records, verified timestamps, and printable receipts.'}
              </p>
              <Link href="/tourist/payments" className="inline-block text-xs font-semibold text-primary-600 hover:underline pt-2">
                {isAm ? 'ደረሰኞችን ክፈት &rarr;' : 'Open Transactions &rarr;'}
              </Link>
            </CardContent>
          </Card>

          <Card bordered className="bg-white hover:border-primary-400 transition-colors">
            <CardContent className="p-5 space-y-2">
              <span className="text-2xl block mb-1">❤️</span>
              <h3 className="font-bold text-text-primary text-sm font-heading">
                {isAm ? 'የተቀመጡ ተሞክሮዎች' : 'Saved Experiences'}
              </h3>
              <p className="text-xs text-text-secondary">
                {isAm ? 'ለወደፊት ጉዞዎ ያስቀመጧቸውን ተሞክሮዎች ይመልከቱ።' : 'View experiences you have bookmarked for upcoming trips.'}
              </p>
              <Link href="/tourist/saved" className="inline-block text-xs font-semibold text-primary-600 hover:underline pt-2">
                {isAm ? 'የተቀመጡትን ክፈት &rarr;' : 'View Saved &rarr;'}
              </Link>
            </CardContent>
          </Card>

          <Card bordered className="bg-white hover:border-primary-400 transition-colors">
            <CardContent className="p-5 space-y-2">
              <span className="text-2xl block mb-1">💬</span>
              <h3 className="font-bold text-text-primary text-sm font-heading">
                {isAm ? 'የደንበኞች ድጋፍ' : 'Customer Support'}
              </h3>
              <p className="text-xs text-text-secondary">
                {isAm ? 'ጥያቄ ወይም የጉዞ ችግር ካጋጠመዎት ፈጣን እርዳታ ያግኙ።' : 'Direct ticket assistance for booking modifications or travel questions.'}
              </p>
              <Link href="/tourist/support" className="inline-block text-xs font-semibold text-primary-600 hover:underline pt-2">
                {isAm ? 'ድጋፍ ጠይቅ &rarr;' : 'Get Help &rarr;'}
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Cancellation Modal */}
        <CancelBookingModal
          booking={selectedBookingForCancel}
          isOpen={!!selectedBookingForCancel}
          onClose={() => setSelectedBookingForCancel(null)}
          onSuccess={loadMyBookings}
        />

        {/* Refund Request Modal */}
        <RefundRequestModal
          booking={selectedBookingForRefund}
          isOpen={!!selectedBookingForRefund}
          onClose={() => setSelectedBookingForRefund(null)}
          onSuccess={loadMyBookings}
        />
      </TouristLayout>
    </ProtectedRoute>
  )
}
