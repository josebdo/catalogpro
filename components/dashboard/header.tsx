'use client'

import { useRouter } from 'next/navigation'
import { Menu, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { CatalogProLogo } from '@/components/catalog-pro-logo'
import type { User, Business } from '@/lib/mock-data'

interface DashboardHeaderProps {
  user: User
  business: Business
}

export function DashboardHeader({ user, business }: DashboardHeaderProps) {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    localStorage.removeItem('currentBusiness')
    router.push('/login')
  }

  const getInitials = (name?: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-white px-4 lg:justify-end lg:px-8">
      {/* Mobile Menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 bg-sidebar p-0">
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
            {/* Additional mobile links could go here if needed */}
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
