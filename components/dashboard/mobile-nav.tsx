'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Package, Eye, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/dashboard/products', label: 'Productos', icon: Package },
  { href: '/dashboard/preview', label: 'Vista Previa', icon: Eye },
  { href: '/dashboard/settings', label: 'Config', icon: Settings },
]

export function DashboardMobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white lg:hidden">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2',
                isActive ? 'text-[#25D366]' : 'text-muted-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
