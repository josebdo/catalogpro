"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { CatalogProLogo } from "@/components/catalog-pro-logo"
import { 
  LayoutDashboard,
  Users,
  Store,
  CreditCard,
  BarChart3,
  Settings,
  Menu,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Shield
} from "lucide-react"
import { cn } from "@/lib/utils"
// import { users as mockUsers } from "@/lib/mock-data"
import { createClient } from "@/lib/supabase/client"
import { useEffect } from "react"

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  { href: "/admin/catalogos", label: "Catálogos", icon: Store },
  { href: "/admin/suscripciones", label: "Suscripciones", icon: CreditCard },
  { href: "/admin/metricas", label: "Métricas", icon: BarChart3 },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
]

function AdminSidebar({ 
  onNavigate, 
  isCollapsed = false, 
  onToggleCollapse,
  onLogout
}: { 
  onNavigate?: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  onLogout?: () => void
}) {
  const pathname = usePathname()
  
  return (
    <div className="flex h-full flex-col">
      <div className="relative flex h-16 items-center justify-center border-b px-4">
        <Link href="/admin" className={cn("transition-all", isCollapsed ? "mx-auto" : "flex items-center gap-2 mr-auto")}>
          <CatalogProLogo variant="default" iconOnly={isCollapsed} />
          {!isCollapsed && (
            <div className="ml-2 flex items-center gap-1.5 rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
              <Shield className="h-3 w-3" />
              Admin
            </div>
          )}
        </Link>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="absolute -right-3 top-5 hidden h-6 w-6 items-center justify-center rounded-full border bg-background text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground z-40 lg:flex"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </div>
      
      <nav className="flex-1 space-y-1 p-4">
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/admin" && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg py-2 text-sm font-medium transition-colors",
                isCollapsed ? "justify-center px-2" : "px-3",
                isActive 
                  ? "bg-destructive/10 text-destructive" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                </>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-4">
        {onLogout && (
          <button
            onClick={onLogout}
            title={isCollapsed ? "Cerrar sesión" : undefined}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10",
              isCollapsed ? "justify-center px-2" : "px-3"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span>Cerrar sesión</span>}
          </button>
        )}
      </div>
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [adminUser, setAdminUser] = useState<{fullName: string, email: string, avatarUrl?: string} | null>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('full_name, email')
          .eq('id', session.user.id)
          .single()
          
        if (userData) {
          setAdminUser({
            fullName: userData.full_name || 'Admin',
            email: userData.email || session.user.email || '',
          })
        }
      } else {
        router.push('/login')
      }
    }
    loadUser()
  }, [supabase, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className={cn("fixed inset-y-0 left-0 z-50 hidden border-r bg-card transition-all duration-300 lg:block", isSidebarCollapsed ? "w-20" : "w-64")}>
        <AdminSidebar 
          isCollapsed={isSidebarCollapsed} 
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onLogout={handleLogout}
        />
      </aside>

      {/* Mobile Header */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center gap-4 border-b bg-card px-4 lg:hidden">
        {mounted && (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">Menú de Navegación Admin</SheetTitle>
              <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
            </SheetContent>
          </Sheet>
        )}
        <CatalogProLogo />
      </header>

      {/* Main Content */}
      <div className={cn("transition-all duration-300", isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64")}>
        {/* Desktop Header */}
        <header className="sticky top-0 z-30 hidden h-16 items-center justify-between border-b bg-card px-6 lg:flex">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold">Panel de Administración</h1>
          </div>
          {mounted && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={adminUser?.avatarUrl || undefined} />
                    <AvatarFallback className="bg-destructive text-destructive-foreground text-xs">
                      {adminUser?.fullName?.split(' ').map((n: string) => n[0]).join('') || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline">{adminUser?.fullName || 'Cargando...'}</span>
                </Button>
              </DropdownMenuTrigger>
              {adminUser && (
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <p>{adminUser.fullName}</p>
                    <p className="font-normal text-muted-foreground text-xs">{adminUser.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard de negocio
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              )}
            </DropdownMenu>
          )}
        </header>

        <main className="p-4 pt-20 lg:p-6 lg:pt-6">
          {children}
        </main>
      </div>
    </div>
  )
}
