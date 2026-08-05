import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function VendorRegister() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/register')
  }, [router])
  return null
}
