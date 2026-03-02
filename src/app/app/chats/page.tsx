'use client'

import { MessageCircle } from 'lucide-react'

export default function ChatsPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center">
        <MessageCircle className="h-16 w-16 text-white/20 mx-auto mb-4" />
        <p className="text-white/60 font-medium">Select a chat to start messaging</p>
        <p className="text-white/40 text-sm mt-1">Or start a new conversation from the list</p>
      </div>
    </div>
  )
}
