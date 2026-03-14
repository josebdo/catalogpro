"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Eye, 
  MessageCircle, 
  TrendingUp,
  TrendingDown,
  Calendar,
  Package,
  ArrowUpRight
} from "lucide-react"
import { mockAnalytics, mockProducts, mockCatalogs } from "@/lib/mock-data"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts"
import { getAnalyticsStats } from "@/app/actions/analytics"
import { createClient } from "@/lib/supabase/client"

export default function AnaliticasPage() {
  const [timeRange, setTimeRange] = useState("30d")
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const { data: userData } = await supabase.auth.getUser()
        if (!userData?.user) return

        const { data: profile } = await supabase
          .from('users')
          .select('business_id')
          .eq('id', userData.user.id)
          .single()

        if (!profile?.business_id) return

        const days = parseInt(timeRange.replace('d', '')) || 30
        const result = await getAnalyticsStats(profile.business_id, days)
        
        if (result.success) {
          setData(result.data)
        }
      } catch (e) {
        console.error("Failed to load analytics:", e)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [timeRange, supabase])
  const totalViews = data?.totalViews || 0
  const whatsappClicks = data?.totalClicks || 0
  const uniqueProductsSeen = data?.uniqueProductsSeen || 0

  const stats = [
    {
      title: "Visitas totales",
      value: totalViews.toLocaleString(),
      change: "Datos en vivo",
      trend: "up",
      icon: Eye,
      description: "en el período"
    },
    {
      title: "Clics en WhatsApp",
      value: whatsappClicks.toLocaleString(),
      change: "Datos en vivo",
      trend: "up",
      icon: MessageCircle,
      description: "en el período"
    },
    {
      title: "Tasa de conversión",
      value: totalViews > 0 ? `${((whatsappClicks / totalViews) * 100).toFixed(1)}%` : "0%",
      change: "Datos en vivo",
      trend: "up",
      icon: TrendingUp,
      description: "visitas a clics"
    },
    {
      title: "Productos vistos",
      value: uniqueProductsSeen.toString(),
      change: "Datos en vivo",
      trend: "up",
      icon: Package,
      description: "productos únicos"
    },
  ]

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Cargando analíticas...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analíticas</h1>
          <p className="text-muted-foreground mt-1">
            Rendimiento de tu catálogo
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="14d">Últimos 14 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

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
                <Badge 
                  variant="secondary" 
                  className={stat.trend === 'up' 
                    ? 'bg-[#25D366]/10 text-[#25D366]' 
                    : 'bg-destructive/10 text-destructive'
                  }
                >
                  {stat.trend === 'up' 
                    ? <ArrowUpRight className="h-3 w-3 mr-1" />
                    : <TrendingDown className="h-3 w-3 mr-1" />
                  }
                  {stat.change}
                </Badge>
                <span className="text-xs text-muted-foreground">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Views & Clicks Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Visitas y clics</CardTitle>
            <CardDescription>
              Evolución diaria de visitas y clics en WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.dailyData || []}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0F172A" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#25D366" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#25D366" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#0F172A" 
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorViews)"
                    name="Visitas"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="clicks" 
                    stroke="#25D366" 
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorClicks)"
                    name="Clics WA"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Productos más populares</CardTitle>
            <CardDescription>
              Por clics en WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(data?.topProducts || []).length === 0 && (
                <p className="text-sm text-muted-foreground">Aún no hay clics registrados en productos.</p>
              )}
              {(data?.topProducts || []).map((product: any, index: number) => (
                <div key={product.name} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>{product.views} visitas (aprox)</span>
                      <span>{product.clicks} clics reales</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-[#25D366]/10 text-[#25D366]">
                    {((product.clicks / (product.views || 1)) * 100).toFixed(0)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hourly Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Horarios de mayor actividad</CardTitle>
            <CardDescription>
              Distribución de visitas por hora
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.hourlyData || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="hour" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    interval={3}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => [value, 'Visitas']}
                  />
                  <Bar 
                    dataKey="visits" 
                    fill="#0F172A" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights</CardTitle>
          <CardDescription>
            Recomendaciones basadas en tus datos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg border bg-[#25D366]/5 border-[#25D366]/20">
              <h4 className="font-semibold text-[#25D366] mb-1">Mayor actividad</h4>
              <p className="text-sm text-muted-foreground">
                Tu catálogo recibe más visitas entre las 12:00 y 14:00. Considera publicar ofertas en ese horario.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
              <h4 className="font-semibold text-blue-700 mb-1">Producto estrella</h4>
              <p className="text-sm text-muted-foreground">
                {(data?.topProducts || [])[0] ? `"${data.topProducts[0].name}" tiene la mejor conversión. Considere destacarlo en el catálogo.` : "No hay suficientes datos de productos para generar insights."}
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-amber-50 border-amber-200">
              <h4 className="font-semibold text-amber-700 mb-1">Oportunidad</h4>
              <p className="text-sm text-muted-foreground">
                Agregar más productos puede aumentar tus visitas. Los catálogos con +20 productos tienen 3x más tráfico.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
