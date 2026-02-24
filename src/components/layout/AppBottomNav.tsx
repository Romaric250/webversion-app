'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { bottomNavItems, isActive } from '@/lib/nav'
import { cn } from '@/lib/utils'

export function AppBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around py-2 px-4 bg-background-secondary border-t border-background-tertiary safe-area-pb">
      {bottomNavItems.map((item) => {
        const Icon = item.icon
        const active = isActive(pathname, item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors min-w-0 flex-1 max-w-[80px]',
              active ? 'text-primary bg-primary/10' : 'text-white/60 hover:text-white'
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium truncate w-full text-center">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
