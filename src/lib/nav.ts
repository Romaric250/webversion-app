import { Home, BookOpen, Search, User, FileText, Mic2, Users } from 'lucide-react'

export const navItems = [
  { href: '/app', label: 'Home', icon: Home },
  { href: '/app/transcripts', label: 'Transcripts', icon: Mic2 },
  { href: '/app/notes', label: 'Notes', icon: FileText },
  { href: '/app/groups', label: 'Groups', icon: Users },
  { href: '/app/learning', label: 'Learning', icon: BookOpen },
  { href: '/app/dictionary', label: 'Dictionary', icon: Search },
  { href: '/app/profile', label: 'Profile', icon: User },
] as const

/** Bottom nav shows primary 4; rest in hamburger on mobile */
export const bottomNavItems = [
  { href: '/app', label: 'Home', icon: Home },
  { href: '/app/transcripts', label: 'Transcripts', icon: Mic2 },
  { href: '/app/notes', label: 'Notes', icon: FileText },
  { href: '/app/profile', label: 'Profile', icon: User },
]

export function isActive(pathname: string, href: string): boolean {
  if (href === '/app') return pathname === '/app'
  return pathname === href || pathname.startsWith(href + '/')
}
