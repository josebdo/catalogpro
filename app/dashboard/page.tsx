"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Eye, 
  MessageCircle, 
  Package, 
  TrendingUp, 
  ArrowUpRight,
  Share2,
  Copy,
  ExternalLink
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [isLoading, setIsLoading] = useState(true)
  const [userName, setUserName] = useState<string>('')
  const [catalogSlug, setCatalogSlug] = useState<string>('')
  const [accentColor, setAccentColor] = useState('#25D366')
  
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    whatsappClicks: 0,
    productsCount: 0,
  })

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/login')
          return
        }

        // Get user profile
        const { data: userData } = await supabase
          .from('users')
          .select('full_name, business_id')
          .eq('id', session.user.id)
          .single()

        if (userData?.full_name) {
          setUserName(userData.full_name)
        }

        if (userData?.business_id) {
          // Get business details
          const { data: businessData } = await supabase
            .from('businesses')
            .select('slug, accent_color')
            .eq('id', userData.business_id)
            .single()

          if (businessData) {
            setCatalogSlug(businessData.slug)
            if (businessData.accent_color) setAccentColor(businessData.accent_color)
          }

          // Fetch real product count
          const { count: productCount } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('business_id', userData.business_id)

          // Fetch basic analytics 
          const { data: analyticsData } = await supabase
            .from('analytics_events')
            .select('event_type')
            .eq('business_id', userData.business_id)

          const views = analyticsData?.filter(e => e.event_type === 'page_view').length || 0
          const clicks = analyticsData?.filter(e => e.event_type === 'whatsapp_click').length || 0

          setAnalytics({
            productsCount: productCount || 0,
            totalViews: views,
            whatsappClicks: clicks
          })
        }
      } catch (err) {
        console.error('Error loading dashboard:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [supabase, router])

  const catalogUrl = typeof window !== 'undefined' ? `${window.location.host}/${catalogSlug}` : `catalogpro.app/${catalogSlug}`
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(`https://${catalogUrl}`)
    toast.success("Enlace copiado al portapapeles")
  }
  
  const shareToWhatsApp = () => {
    const text = `Mira mi catálogo de productos: https://${catalogUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const conversionRate = analytics.totalViews > 0 
    ? ((analytics.whatsappClicks / analytics.totalViews) * 100).toFixed(1) 
    : "0.0"

  const stats = [
    {
      title: "Visitas totales",
      value: analytics.totalViews.toLocaleString(),
      change: "--",
      icon: Eye,
      description: "Histórico"
    },
    {
      title: "Clics en WhatsApp",
      value: analytics.whatsappClicks.toLocaleString(),
      change: "--",
      icon: MessageCircle,
      description: "Histórico"
    },
    {
      title: "Productos activos",
      value: analytics.productsCount.toString(),
      change: "--",
      icon: Package,
      description: "En tu catálogo"
    },
    {
      title: "Tasa de conversión",
      value: `${conversionRate}%`,
      change: "--",
      icon: TrendingUp,
      description: "visitas a clics"
    }
  ]

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#25D366] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Hola, {userName.split(' ')[0] || 'Gestor'}
        </h1>
        <p className="text-muted-foreground mt-1">
          Aquí tienes un resumen de tu catálogo
        </p>
      </div>

      {/* Catalog Link Card */}
      <Card style={{ borderColor: `${accentColor}40`, backgroundColor: `${accentColor}10` }}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground">Tu catálogo público</p>
              <p className="text-base sm:text-lg font-semibold text-foreground break-all">{catalogUrl}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard} className="flex-1 sm:flex-none h-9">
                <Copy className="mr-2 h-4 w-4" />
                Copiar
              </Button>
              <Button 
                size="sm" 
                className="flex-1 sm:flex-none h-9 text-white hover:opacity-90"
                style={{ backgroundColor: accentColor }}
                onClick={shareToWhatsApp}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Compartir
              </Button>
              <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none h-9">
                <Link href={`/${catalogSlug}`} target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ver
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" suppressHydrationWarning>{stat.value}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                  {stat.change}
                </Badge>
                <span className="text-xs text-muted-foreground">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer group">
          <Link href="/dashboard/productos">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Package className="h-8 w-8" style={{ color: accentColor }} />
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg">Gestionar productos</CardTitle>
              <CardDescription className="mt-1">
                Agrega, edita o elimina productos de tu catálogo
              </CardDescription>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer group">
          <Link href="/dashboard/configuracion">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Eye className="h-8 w-8 text-[#6366F1]" />
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg">Personalizar catálogo</CardTitle>
              <CardDescription className="mt-1">
                Cambia colores, logo y configuración de tu tienda
              </CardDescription>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer group">
          <Link href="/dashboard/analiticas">
            <CardHeader>
              <div className="flex items-center justify-between">
                <TrendingUp className="h-8 w-8 text-[#F59E0B]" />
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg">Ver analíticas</CardTitle>
              <CardDescription className="mt-1">
                Revisa el rendimiento de tu catálogo
              </CardDescription>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad reciente</CardTitle>
          <CardDescription>Estadísticas en tiempo real (Próximamente)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center border-2 border-dashed rounded-lg bg-muted/20">
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Aún no hay suficiente actividad registrada.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
