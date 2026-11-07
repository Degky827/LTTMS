import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function AdminIndexPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/admin/dashboard')
  }, [router])

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-lake-deep border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
