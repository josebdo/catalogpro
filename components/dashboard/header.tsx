'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Home, Package, FolderOpen, Eye, BarChart3, Users, Settings, CreditCard, LogOut, Lock, Star, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { CatalogProLogo } from '@/components/catalog-pro-logo'
import { type User, type Business, getBusinessById } from '@/lib/mock-data'
import { getPlanConfig } from '@/lib/plans'
import { cn } from '@/lib/utils'
import { signOut } from '@/app/actions/auth'
import { toast } from 'sonner'

interface DashboardHeaderProps {
  user: User
  business: Business
}

export function DashboardHeader({ user, business }: DashboardHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const handleLogout = async () => {
    setIsSheetOpen(false)
    try {
      localStorage.removeItem('currentUser')
      localStorage.removeItem('currentBusiness')
      await signOut()
    } catch (error) {
      toast.error('Error al cerrar sesión')
    }
  }

  const getInitials = (name?: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const navItems = [
    { href: '/dashboard', label: 'Inicio', icon: Home },
    { href: '/dashboard/productos', label: 'Productos', icon: Package },
    { href: '/dashboard/categories', label: 'Categorías', icon: FolderOpen },
    { href: `/${business.slug}`, label: 'Vista Previa', icon: Eye, external: true },
    { href: '/dashboard/analiticas', label: 'Analíticas', icon: BarChart3, requiresPlan: 'basico' },
    { href: '/dashboard/equipo', label: 'Mi Equipo', icon: Users, requiresPlan: 'pro' },
    { href: '/dashboard/configuracion', label: 'Configuración', icon: Settings },
    { href: '/dashboard/suscripcion', label: 'Suscripción', icon: CreditCard },
  ]

  const isLocked = (item: typeof navItems[0]) => {
    if (!item.requiresPlan) return false
    const planOrder = ['free', 'basico', 'pro', 'founders']
    const currentIndex = planOrder.indexOf(business.plan)
    const requiredIndex = planOrder.indexOf(item.requiresPlan)
    return currentIndex < requiredIndex
  }

  const planConfig = getPlanConfig(business.plan)

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-white px-4 lg:justify-end lg:px-8">
      {/* Mobile Menu */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setIsSheetOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex w-72 flex-col bg-sidebar p-0">
          <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>
          <div className="flex h-16 items-center border-b border-sidebar-border px-4">
            <CatalogProLogo variant="white" />
          </div>
          <div className="border-b border-sidebar-border p-4">
            <div className="flex items-center gap-3">
              <div 
                className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: business.accentColor }}
              >
                {business.name.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-semibold text-sidebar-foreground">
                  {business.name}
                </p>
                <p className="text-xs text-sidebar-foreground/60">
                  {business.slug}
                </p>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const locked = isLocked(item)
                const isActive = pathname === item.href

                return (
                  <button
                    key={item.href}
                    onClick={() => {
                      setIsSheetOpen(false)
                      if (locked) {
                        router.push('/dashboard/suscripcion')
                      } else if (item.external) {
                        window.open(item.href, '_blank')
                      } else {
                        router.push(item.href)
                      }
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      locked && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {locked && <Lock className="h-3 w-3" />}
                  </button>
                )
              })}
            </nav>
          </div>
          <div className="border-t border-sidebar-border p-4">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span>Cerrar sesión</span>
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile Logo */}
      <div className="lg:hidden">
        <CatalogProLogo className="h-6" />
      </div>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-muted text-xs">
                {getInitials(user.fullName)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium lg:block">{user.fullName}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{user.fullName}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
