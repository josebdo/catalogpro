"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Store, 
  CreditCard, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  UserPlus,
  Loader2
} from "lucide-react"
import { PLAN_ORDER, planConfigs } from "@/lib/plans"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import { createClient } from "@/lib/supabase/client"

const mockRevenueData = [
  { month: "Oct", revenue: 2400 },
  { month: "Nov", revenue: 3200 },
  { month: "Dic", revenue: 4100 },
  { month: "Ene", revenue: 3800 },
  { month: "Feb", revenue: 5200 },
  { month: "Mar", revenue: 6100 },
]

const mockUsersData = [
  { month: "Oct", users: 45 },
  { month: "Nov", users: 72 },
  { month: "Dic", users: 98 },
  { month: "Ene", users: 124 },
  { month: "Feb", users: 156 },
  { month: "Mar", users: 189 },
]

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCatalogs: 0,
    activeSubscriptions: 0,
    mrr: 0,
  })
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [planDistribution, setPlanDistribution] = useState<{name: string, count: number}[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch Users Count
        const { count: usersCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })

        // Fetch Catalogs Count & Plans
        const { data: businesses, count: catalogsCount } = await supabase
          .from('businesses')
          .select('plan', { count: 'exact' })

        // Process Plans
        let mrrAcc = 0
        let activeSubs = 0
        const planCounts: Record<string, number> = {}

        businesses?.forEach(b => {
          const planId = b.plan || 'free'
          planCounts[planId] = (planCounts[planId] || 0) + 1
          
          if (planId !== 'free') {
            activeSubs++
            const currentPlanDetails = planConfigs[planId as keyof typeof planConfigs]
            if (currentPlanDetails) {
              mrrAcc += currentPlanDetails.monthlyPrice
            }
          }
        })

        const formattedPlanDistribution = PLAN_ORDER.map(planKey => ({
          name: planConfigs[planKey].displayName,
          count: planCounts[planKey] || 0,
        }))

        // Fetch Recent Users
        const { data: latestUsers } = await supabase
          .from('users')
          .select('id, full_name, email, role, created_at')
          .order('created_at', { ascending: false })
          .limit(5)

        setStats({
          totalUsers: usersCount || 0,
          totalCatalogs: catalogsCount || 0,
          activeSubscriptions: activeSubs,
          mrr: mrrAcc,
        })
        setPlanDistribution(formattedPlanDistribution)
        setRecentUsers(latestUsers || [])

      } catch (err) {
        console.error("Error fetching admin stats:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [supabase])

  const topStats = [
    {
      title: "Usuarios totales",
      value: stats.totalUsers.toString(),
      change: "+12%",
      trend: "up",
      icon: Users,
      description: "vs mes anterior"
    },
    {
      title: "Catálogos activos",
      value: stats.totalCatalogs.toString(),
      change: "+8%",
      trend: "up",
      icon: Store,
      description: "vs mes anterior"
    },
    {
      title: "Suscripciones activas",
      value: stats.activeSubscriptions.toString(),
      change: "+15%",
      trend: "up",
      icon: CreditCard,
      description: "vs mes anterior"
    },
    {
      title: "MRR Estimado",
      value: `$${stats.mrr.toLocaleString()}`,
      change: "+23%",
      trend: "up",
      icon: DollarSign,
      description: "vs mes anterior"
    },
  ]

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-destructive" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard de Admin</h1>
        <p className="text-muted-foreground mt-1">
          Vista general de la plataforma
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {topStats.map((stat) => (
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
                    : <ArrowDownRight className="h-3 w-3 mr-1" />
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Ingresos mensuales (Demo)
            </CardTitle>
            <CardDescription>
              Evolución de MRR en los últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => [`$${value}`, 'Ingresos']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#25D366" 
                    strokeWidth={2}
                    dot={{ fill: '#25D366', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Crecimiento de usuarios (Demo)
            </CardTitle>
            <CardDescription>
              Usuarios acumulados en los últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockUsersData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
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
                    formatter={(value) => [value, 'Usuarios']}
                  />
                  <Bar 
                    dataKey="users" 
                    fill="#0F172A" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de planes</CardTitle>
            <CardDescription>
              Suscripciones reales de CatalogPro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {planDistribution.map((plan) => (
                <div key={plan.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      plan.name === 'Free' ? 'bg-slate-400' :
                      plan.name === 'Básico' ? 'bg-blue-500' :
                      plan.name === 'Pro' ? 'bg-violet-500' :
                      'bg-amber-500'
                    }`} />
                    <span className="text-sm font-medium">{plan.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{plan.count} usuarios</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Usuarios recientes</CardTitle>
            <CardDescription>
              Últimos usuarios registrados en la base de datos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                      {user.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.full_name || 'Sin Nombre'}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-xs">
                      {user.role}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1" suppressHydrationWarning>
                      {new Date(user.created_at).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                </div>
              ))}
              
              {recentUsers.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">No hay usuarios recientes.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
