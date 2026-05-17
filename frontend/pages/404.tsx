import Link from 'next/link'
import { FaLeaf, FaHome } from 'react-icons/fa'

export default function Custom404() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center">
          <FaLeaf className="text-4xl text-primary/40" />
        </div>
        <h1 className="text-8xl font-black text-gray-200 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link href="/" className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300">
          <FaHome /> Back to Home
        </Link>
      </div>
    </div>
  )
}
