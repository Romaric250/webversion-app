'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NewChatPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/app/chats')
  }, [router])

  return (
    <div className="flex justify-center py-12">
      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  )
}
