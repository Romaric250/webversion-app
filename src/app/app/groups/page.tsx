'use client'

import { Users } from 'lucide-react'
import Link from 'next/link'

export default function GroupsPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] sm:h-[calc(100vh-8rem)] min-h-0 items-center justify-center text-center px-6">
      <Users className="h-14 w-14 text-white/30 mb-4" />
      <h2 className="text-lg font-semibold text-white mb-1">Select a group</h2>
      <p className="text-white/50 text-sm max-w-xs">
        Choose a group from the list to view and participate in the conversation.
      </p>
    </div>
  )
}
