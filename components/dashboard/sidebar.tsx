'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  Package,
  FolderOpen,
  Eye,
  BarChart3,
  Users,
  Settings,
  CreditCard,
  LogOut,
  Lock,
  Star,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CatalogProLogo } from '@/components/catalog-pro-logo'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { User, Business } from '@/lib/mock-data'
import type { PlanConfig } from '@/lib/plans'
import { signOut } from '@/app/actions/auth'
import { toast } from 'sonner'

interface DashboardSidebarProps {
  user: User
  business: Business
  planConfig: PlanConfig
  daysRemaining: number | null
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function DashboardSidebar({ 
  user, 
  business, 
  planConfig,
  daysRemaining,
  isCollapsed = false,
  onToggleCollapse
}: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

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

  const handleLogout = async () => {
    try {
      // Clear legacy mock data just in case
      localStorage.removeItem('currentUser')
      localStorage.removeItem('currentBusiness')
      
      // Call Supabase server action to clear cookies and session
      await signOut()
    } catch (error) {
      toast.error('Error al cerrar sesión')
    }
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

  const isLocked = (item: typeof navItems[0]) => {
    if (!item.requiresPlan) return false
    const planOrder = ['free', 'basico', 'pro', 'founders']
    const currentIndex = planOrder.indexOf(business.plan)
    const requiredIndex = planOrder.indexOf(item.requiresPlan)
    return currentIndex < requiredIndex
  }

  const getDaysColor = () => {
    if (planConfig.isPermanent) return 'text-[#D97706]'
    if (daysRemaining === null) return 'text-muted-foreground'
    if (daysRemaining <= 7) return 'text-red-500'
    if (daysRemaining <= 15) return 'text-amber-500'
    return 'text-green-500'
  }

  const getDaysText = () => {
    if (planConfig.isPermanent) return 'Permanente'
    if (daysRemaining === null) return ''
    if (daysRemaining <= 0) return 'Vencido'
    return `${daysRemaining} días`
  }

  return (
    <aside 
      className={cn(
        "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 lg:flex",
        isCollapsed ? "w-20" : "w-60"
      )}
    >
      {/* Header */}
      <div className="relative flex h-16 items-center justify-center border-b border-sidebar-border px-4">
        <Link href="/dashboard" className={cn("transition-all", isCollapsed ? "mx-auto" : "mr-auto")}>
          <CatalogProLogo variant="white" iconOnly={isCollapsed} />
        </Link>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="absolute -right-3 top-5 flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground z-40"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Business Info */}
      <div className="border-b border-sidebar-border p-4">
        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
          <div 
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white transition-all"
            style={{ backgroundColor: business.accentColor }}
            title={business.name}
          >
            {business.name.charAt(0)}
          </div>
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden transition-all duration-300 opacity-100">
              <p className="truncate text-sm font-semibold text-sidebar-foreground">
                {business.name}
              </p>
              <div className="flex items-center gap-2">
                <Badge 
                  className={cn(
                    'text-[10px]',
                    planConfig.badgeClass
                  )}
                >
                  {business.plan === 'founders' && <Star className="mr-1 h-3 w-3" />}
                  {planConfig.displayName}
                </Badge>
                {getDaysText() && (
                  <span className={cn('text-xs', getDaysColor())}>
                    {getDaysText()}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const locked = isLocked(item)
            const isActive = pathname === item.href
            
            return (
              <li key={item.href}>
                <Link
                  href={locked ? '#' : item.href}
                  target={item.external ? '_blank' : undefined}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-lg py-2 text-sm transition-colors',
                    isCollapsed ? 'justify-center px-2' : 'px-3',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    locked && 'cursor-not-allowed opacity-50'
                  )}
                  onClick={(e) => {
                    if (locked) {
                      e.preventDefault()
                      router.push('/dashboard/billing')
                    }
                  }}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {locked && <Lock className="h-3 w-3" />}
                    </>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="border-t border-sidebar-border p-4">
        <div className={cn("flex items-center gap-3", isCollapsed && "flex-col justify-center gap-2")}>
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="bg-sidebar-accent text-xs text-sidebar-accent-foreground">
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden transition-all duration-300 opacity-100">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {user.fullName}
              </p>
              <p className="truncate text-xs text-sidebar-foreground/60">
                {user.role === 'owner' ? 'Propietario' : 'Editor'}
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={cn("rounded-lg p-2 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground", isCollapsed && "mt-1")}
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
