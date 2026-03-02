import { Home, BookOpen, Search, User, FileText, Mic2, Users, Hand, MessageCircle, MessageSquare } from 'lucide-react'

export const navItems = [
  { href: '/app', label: 'Home', icon: Home },
  { href: '/app/transcripts', label: 'Transcripts', icon: Mic2 },
  { href: '/app/notes', label: 'Notes', icon: FileText },
  { href: '/app/groups', label: 'Groups', icon: Users },
  { href: '/app/chats', label: 'Chats', icon: MessageCircle },
  { href: '/app/sign-to-text', label: 'Sign to Text', icon: Hand },
  { href: '/app/learning', label: 'Learning', icon: BookOpen },
  { href: '/app/dictionary', label: 'Dictionary', icon: Search },
  { href: '/app/profile', label: 'Profile', icon: User },
] as const

/** Feedback + Admin section (pushed down from main nav) */
export const footerNavItems = [
  { href: '/app/profile?feedback=1', label: 'Feedback', icon: MessageSquare },
]

/** Bottom nav on mobile: removed - use dropdown menu instead */
export const bottomNavItems: { href: string; label: string; icon: typeof Home }[] = []

export function isActive(pathname: string, href: string): boolean {
  if (href === '/app') return pathname === '/app'
  return pathname === href || pathname.startsWith(href + '/')
}
