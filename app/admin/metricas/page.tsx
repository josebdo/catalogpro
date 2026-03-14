"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, Users, MousePointer2, Loader2, Store } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getAdminEventsChartData } from "@/app/actions/admin"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"

export default function AdminMetricasPage() {
  const [stats, setStats] = useState({
    users: 0,
    activeCatalogs: 0,
    totalCatalogs: 0,
    waClicksToday: 0
  })
  const [chartData, setChartData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadMetrics() {
      try {
        setIsLoading(true)

        // Count users
        const { count: userCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })

        // Get global metrics from our custom RPC
        const { data: globalMetrics, error } = await supabase.rpc('get_global_metrics')

        if (!error && globalMetrics) {
          setStats({
            users: userCount || 0,
            activeCatalogs: globalMetrics.active_businesses || 0,
            totalCatalogs: globalMetrics.total_businesses || 0,
            waClicksToday: globalMetrics.wa_clicks_today || 0
          })
        } else {
          // Fallback if RPC fails
          const { count: totalB } = await supabase.from('businesses').select('*', { count: 'exact', head: true })
          const { count: activeB } = await supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('is_active', true)
          
          setStats({
            users: userCount || 0,
            activeCatalogs: activeB || 0,
            totalCatalogs: totalB || 0,
            waClicksToday: 0
          })
        }

        // Get chart data for the last 30 days
        const chartResult = await getAdminEventsChartData(30)
        if (chartResult.success) {
          setChartData(chartResult.data)
        }

      } catch (err) {
        console.error("Error loading metrics", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadMetrics()
  }, [supabase])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Métricas Globales</h1>
        <p className="text-muted-foreground mt-1">
          Rendimiento general de la plataforma
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Registrados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Usuarios en la base de datos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Catálogos Activos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCatalogs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">De {stats.totalCatalogs} catálogos totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clics WhatsApp (Hoy)</CardTitle>
            <MousePointer2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.waClicksToday.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Intenciones de compra detectadas hoy</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visitas</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.totalCatalogs * 142).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Visitas estimadas (Demo)</p>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Actividad Detallada (Últimos 30 días)</CardTitle>
          <CardDescription>
            Tráfico global de eventos en toda la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] border-t pt-6 pb-2">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorGlobalViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F172A" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorGlobalClicks" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#colorGlobalViews)"
                  name="Visitas Totales"
                />
                <Area 
                  type="monotone" 
                  dataKey="clicks" 
                  stroke="#25D366" 
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorGlobalClicks)"
                  name="Clics WA"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground text-sm italic">Sin datos suficientes para graficar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
