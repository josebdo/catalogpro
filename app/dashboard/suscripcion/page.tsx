"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Check, 
  Crown, 
  CreditCard, 
  Calendar, 
  AlertCircle,
  ArrowRight,
  Sparkles,
  Loader2
} from "lucide-react"
import { PLAN_ORDER, planConfigs, type PlanId } from "@/lib/plans"
import { getBillingDetails, cancelMySubscription } from "@/app/actions/billing"
import { toast } from "sonner"

export default function SuscripcionPage() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCanceling, setIsCanceling] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const res = await getBillingDetails()
      if (res.success) {
        setData(res.data)
      } else {
        toast.error(res.error || "Error al cargar datos de facturación")
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground animate-pulse">Cargando detalles de suscripción...</p>
      </div>
    )
  }

  const business = data?.business
  const planId = (business?.plan as PlanId) || 'free'
  const currentPlan = planConfigs[planId]

  const usageStats = {
    products: { used: data?.usage?.products || 0, limit: currentPlan.maxProducts },
    categories: { used: data?.usage?.categories || 0, limit: currentPlan.maxCategories },
    teamMembers: { used: data?.usage?.editors || 0, limit: currentPlan.maxEditors },
  }

  const planBadgeColors: Record<PlanId, string> = {
    free: "bg-slate-100 text-slate-600",
    basico: "bg-blue-100 text-blue-600",
    pro: "bg-purple-100 text-purple-600",
    founders: "bg-amber-100 text-amber-600",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Suscripción</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona tu plan y facturación
        </p>
      </div>

      {/* Current Plan Card */}
      <Card className="border-2 border-[#25D366]/30">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-[#25D366]/10 flex items-center justify-center">
                <Crown className="h-6 w-6 text-[#25D366]" />
              </div>
                  <div>
                <div className="flex items-center gap-2">
                  <CardTitle>Plan {currentPlan.displayName}</CardTitle>
                  <Badge className={planBadgeColors[currentPlan.id]}>
                    Activo
                  </Badge>
                </div>
                <CardDescription>
                  {business?.subscription_status === 'suspended' ? (
                    'Suscripción cancelada/suspendida'
                  ) : business?.subscription_expires_at ? (
                    `Renueva el ${new Date(business.subscription_expires_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}`
                  ) : (
                    "Plan gratuito sin vencimiento"
                  )}
                </CardDescription>
              </div>
            </div>
            <div className="text-left md:text-right">
              <p className="text-3xl font-bold">
                {currentPlan.monthlyPrice === 0 ? 'Gratis' : `$${currentPlan.monthlyPrice}`}
                {currentPlan.monthlyPrice > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">/mes</span>
                )}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Productos</span>
                <span className="font-medium">
                  {usageStats.products.used} / {usageStats.products.limit === -1 ? '∞' : usageStats.products.limit}
                </span>
              </div>
              <Progress 
                value={usageStats.products.limit === null ? 10 : (usageStats.products.used / usageStats.products.limit) * 100} 
                className="h-2"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Categorías</span>
                <span className="font-medium">
                  {usageStats.categories.used} / {usageStats.categories.limit === -1 ? '∞' : usageStats.categories.limit}
                </span>
              </div>
              <Progress 
                value={usageStats.categories.limit === null ? 10 : (usageStats.categories.used / usageStats.categories.limit) * 100} 
                className="h-2"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Miembros del equipo</span>
                <span className="font-medium">
                  {usageStats.teamMembers.used} / {usageStats.teamMembers.limit === -1 ? '∞' : usageStats.teamMembers.limit}
                </span>
              </div>
              <Progress 
                value={usageStats.teamMembers.limit === null ? 10 : (usageStats.teamMembers.used / usageStats.teamMembers.limit) * 100} 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Planes disponibles</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {PLAN_ORDER.map((id) => {
            const plan = planConfigs[id]
            const isCurrentPlan = plan.id === currentPlan.id
            const isPopular = plan.id === 'pro'
            
            return (
              <Card 
                key={plan.id}
                className={`relative ${isCurrentPlan ? 'border-2 border-[#25D366]' : ''} ${isPopular ? 'ring-2 ring-[#6366F1]' : ''}`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-[#6366F1] text-white">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-lg">{plan.displayName}</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">
                      {plan.monthlyPrice === 0 ? 'Gratis' : `$${plan.monthlyPrice}`}
                    </span>
                    {plan.monthlyPrice > 0 && (
                      <span className="text-muted-foreground">/mes</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-[#25D366] mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${
                      isCurrentPlan 
                        ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                        : 'bg-[#25D366] hover:bg-[#22C55E] text-white'
                    }`}
                    disabled={isCurrentPlan}
                  >
                    {isCurrentPlan ? 'Plan actual' : 'Contactar soporte'}
                    {!isCurrentPlan && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Billing Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Método de pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-14 bg-muted rounded flex items-center justify-center text-xs font-bold">
                  VISA
                </div>
                <div>
                  <p className="font-medium">**** **** **** 4242</p>
                  <p className="text-sm text-muted-foreground">Vence 12/25</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Cambiar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Historial de pagos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(data?.history || []).length === 0 && (
                <p className="text-sm text-muted-foreground">No hay historial de pagos disponible.</p>
              )}
              {(data?.history || []).map((payment: any) => (
                <div key={payment.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">${payment.amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{new Date(payment.created_at).toLocaleDateString('es-MX')}</p>
                  </div>
                  <Badge variant="secondary" className="bg-[#25D366]/10 text-[#25D366]">
                    Completado
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cancel Subscription */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Cancelar suscripción
          </CardTitle>
          <CardDescription>
            Si cancelas, tu plan seguirá activo hasta el final del período de facturación actual.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            className="text-destructive border-destructive hover:bg-destructive/10"
            disabled={isCanceling || business?.subscription_status === 'suspended'}
            onClick={async () => {
              if(!confirm("¿Estás seguro de que quieres cancelar tu suscripción?")) return
              setIsCanceling(true)
              const res = await cancelMySubscription()
              if(res.error) toast.error(res.error)
              else {
                toast.success("Suscripción cancelada correctamente")
                loadData()
              }
              setIsCanceling(false)
            }}
          >
            {isCanceling && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
            {business?.subscription_status === 'suspended' ? 'Suscripción Cancelada' : 'Cancelar suscripción'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
