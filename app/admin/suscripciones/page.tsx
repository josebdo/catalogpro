"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { 
  Search, 
  MoreVertical, 
  Pencil,
  CreditCard,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Loader2
} from "lucide-react"
import { PLAN_ORDER, planConfigs } from "@/lib/plans"
import { BusinessPlan } from "@/lib/mock-data"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { extendSubscription, cancelSubscription, renewSubscription, changeSubscriptionPlan } from "@/app/actions/admin"

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  active: { label: "Activa", color: "bg-green-100 text-green-800", icon: CheckCircle },
  grace_period: { label: "Período de gracia", color: "bg-amber-100 text-amber-800", icon: Clock },
  expired: { label: "Expirada", color: "bg-red-100 text-red-800", icon: XCircle },
  suspended: { label: "Suspendida", color: "bg-slate-100 text-slate-800", icon: AlertTriangle },
}

const planBadgeColors: Record<string, string> = {
  free: "bg-slate-100 text-slate-800",
  basico: "bg-blue-100 text-blue-800",
  pro: "bg-violet-100 text-violet-800",
  founders: "bg-amber-100 text-amber-800",
}

export default function AdminSuscripcionesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [planFilter, setPlanFilter] = useState<string>("all")
  
  const [isLoading, setIsLoading] = useState(true)
  const [subsList, setSubsList] = useState<any[]>([])
  const [stats, setStats] = useState({
    mrr: 0,
    active: 0,
    grace: 0,
    pro: 0
  })

  const [selectedSubscription, setSelectedSubscription] = useState<any | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editPlanValue, setEditPlanValue] = useState<string>("")
  const [editExpireDate, setEditExpireDate] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)
  
  const [isRenewDialogOpen, setIsRenewDialogOpen] = useState(false)
  const [renewalMonths, setRenewalMonths] = useState(1)

  const supabase = createClient()

  const loadSubscriptions = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          id, name, slug, plan, subscription_status, subscription_expires_at, created_at,
          users!businesses_owner_id_fkey (full_name, email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const mappedData = (data || []).map((b: any) => ({
        ...b,
        user_name: b.users?.full_name || 'Desconocido',
        user_email: b.users?.email || '',
        planKey: planConfigs[b.plan as keyof typeof planConfigs] || planConfigs['free']
      }))
      
      setSubsList(mappedData)

      let mrr = 0
      let active = 0
      let grace = 0
      let pro = 0

      mappedData.forEach(s => {
        if (s.subscription_status === 'active') {
          active++
          if (s.plan !== 'free') mrr += s.planKey.monthlyPrice
        }
        if (s.subscription_status === 'grace_period') grace++
        if (s.plan === 'pro') pro++
      })

      setStats({ mrr, active, grace, pro })
    } catch (err: any) {
      console.error(err)
      toast.error('Error al cargar las suscripciones')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSubscriptions()
  }, [supabase])

  const filteredSubscriptions = subsList.filter(sub => {
    const q = searchQuery.toLowerCase()
    const matchesSearch = 
      (sub.user_name || '').toLowerCase().includes(q) ||
      (sub.user_email || '').toLowerCase().includes(q)
    const matchesStatus = statusFilter === "all" || sub.subscription_status === statusFilter
    const matchesPlan = planFilter === "all" || sub.plan === planFilter
    return matchesSearch && matchesStatus && matchesPlan
  })

  const handleEditSubscription = (sub: any) => {
    setSelectedSubscription(sub)
    setEditPlanValue(sub.plan)
    setEditExpireDate(
      sub.subscription_expires_at 
      ? new Date(sub.subscription_expires_at).toISOString().split('T')[0] 
      : ''
    )
    setIsEditDialogOpen(true)
  }

  const handleOpenRenew = (sub: any) => {
    setSelectedSubscription(sub)
    setRenewalMonths(1)
    setIsRenewDialogOpen(true)
  }

  const handleConfirmRenewal = async () => {
    if (!selectedSubscription) return
    setIsSaving(true)
    try {
      const result = await renewSubscription(selectedSubscription.id, selectedSubscription.plan, renewalMonths)
      if (result.error) throw new Error(result.error)
      toast.success(`Suscripción renovada por ${renewalMonths} meses.`)
      setIsRenewDialogOpen(false)
      loadSubscriptions()
    } catch (e: any) {
      toast.error(e.message || "Error al renovar")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveSubscription = async () => {
    if (!selectedSubscription) return
    setIsSaving(true)
    try {
      const result = await changeSubscriptionPlan(selectedSubscription.id, editPlanValue, editExpireDate || null)
      if (result.error) throw new Error(result.error)
      toast.success("Suscripción actualizada correctamente.")
      setIsEditDialogOpen(false)
      loadSubscriptions()
    } catch (e: any) {
      toast.error(e.message || "Error al modificar plan")
    } finally {
      setIsSaving(false)
    }
  }

  const handleExtendSubscription = async (subId: string) => {
    try {
      const result = await extendSubscription(subId)
      if (result.error) throw new Error(result.error)
      toast.success("Suscripción extendida 30 días.")
      loadSubscriptions()
    } catch (e: any) {
      toast.error(e.message || "Error al extender suscripción")
    }
  }

  const handleCancelSubscription = async (subId: string) => {
    try {
      const result = await cancelSubscription(subId)
      if (result.error) throw new Error(result.error)
      toast.success("Suscripción cancelada permanentemente.")
      loadSubscriptions()
    } catch (e: any) {
      toast.error(e.message || "Error al cancelar la suscripción")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Suscripciones</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona las suscripciones de los negocios
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">${stats.mrr}</p>
                <p className="text-xs text-muted-foreground">MRR Estimado</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.active}
                </p>
                <p className="text-xs text-muted-foreground">Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.grace}
                </p>
                <p className="text-xs text-muted-foreground">En gracia</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.pro}
                </p>
                <p className="text-xs text-muted-foreground">Plan Pro</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por usuario o email..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activa</SelectItem>
                <SelectItem value="grace_period">En gracia</SelectItem>
                <SelectItem value="expired">Expirada</SelectItem>
                <SelectItem value="suspended">Suspendida</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los planes</SelectItem>
                {PLAN_ORDER.map(planKey => {
                  const plan = planConfigs[planKey]
                  return (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.displayName}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>{filteredSubscriptions.length} suscripciones</CardTitle>
          <CardDescription>
            Gestión manual de suscripciones de negocios
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Negocio / Usuario</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha de Alta</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((sub) => {
                  const status = statusConfig[sub.subscription_status] || statusConfig['suspended']
                  const StatusIcon = status.icon
                  
                  return (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{sub.name}</p>
                          <p className="text-sm text-muted-foreground">{sub.user_name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={planBadgeColors[sub.plan] || planBadgeColors['free']}>
                          {sub.planKey?.displayName}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={status.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(sub.created_at).toLocaleDateString('es-MX')}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {sub.subscription_expires_at ? new Date(sub.subscription_expires_at).toLocaleDateString('es-MX') : 'Ilimitado'}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${sub.planKey?.monthlyPrice}/mes
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEditSubscription(sub)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Cambiar plan
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenRenew(sub)}>
                              <Calendar className="mr-2 h-4 w-4" />
                              Renovar suscripción
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExtendSubscription(sub.id)}>
                              <Clock className="mr-2 h-4 w-4" />
                              Extender 30 días
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleCancelSubscription(sub.id)}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancelar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredSubscriptions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                      No se encontraron suscripciones
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Renew Subscription Dialog */}
      <Dialog open={isRenewDialogOpen} onOpenChange={setIsRenewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renovar suscripción</DialogTitle>
            <DialogDescription>
              Añadir tiempo de suscripción al catálogo
            </DialogDescription>
          </DialogHeader>
          {selectedSubscription && (
            <div className="grid gap-4 py-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">{selectedSubscription.user_name} ({selectedSubscription.name})</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{selectedSubscription.planKey?.displayName}</Badge>
                  <span className="text-xs text-muted-foreground">Vence: {selectedSubscription.subscription_expires_at ? new Date(selectedSubscription.subscription_expires_at).toLocaleDateString('es-MX') : 'Perpetuo'}</span>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Meses a renovar</Label>
                <Select 
                  value={renewalMonths.toString()} 
                  onValueChange={(val) => setRenewalMonths(parseInt(val))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                      <SelectItem key={m} value={m.toString()}>
                        {m} {m === 1 ? 'Mes' : 'Meses'} {m === 12 && '(Oferta anual 🎁)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Precio base ({selectedSubscription.planKey?.monthlyPrice}$/mes)</span>
                  <span>${selectedSubscription.planKey?.monthlyPrice * renewalMonths}.00</span>
                </div>
                {renewalMonths === 12 && (
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>Descuento anual (20%)</span>
                    <span>-${(selectedSubscription.planKey?.monthlyPrice * 12 * 0.2).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total a pagar</span>
                  <span>${renewalMonths === 12 
                    ? (selectedSubscription.planKey?.monthlyPrice * 12 * 0.8).toFixed(2)
                    : (selectedSubscription.planKey?.monthlyPrice * renewalMonths).toFixed(2)
                  }</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
                <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Nueva fecha de vencimiento</p>
                  <p className="text-xs text-blue-700">
                    {(() => {
                      const date = new Date(selectedSubscription.subscription_expires_at || Date.now())
                      date.setMonth(date.getMonth() + renewalMonths)
                      return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
                    })()}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenewDialogOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmRenewal} className="bg-green-600 hover:bg-green-700 text-white" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calendar className="mr-2 h-4 w-4" />}
              Confirmar Renovación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subscription Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar plan de suscripción</DialogTitle>
            <DialogDescription>
              Modifica el plan del usuario manualmente
            </DialogDescription>
          </DialogHeader>
          {selectedSubscription && (
            <div className="grid gap-4 py-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">
                  {selectedSubscription.user_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedSubscription.user_email}
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="newPlan">Nuevo plan</Label>
                <Select value={editPlanValue} onValueChange={setEditPlanValue} disabled={isSaving}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[...PLAN_ORDER, 'founders' as BusinessPlan].map(planKey => {
                      const plan = planConfigs[planKey]
                      return (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.displayName} - ${plan.monthlyPrice}/mes
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Estado (Lectura)</Label>
                <div className="flex items-center gap-2 p-2 rounded-md bg-green-50 text-green-800 border border-green-200">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">
                    {statusConfig[selectedSubscription.subscription_status]?.label || 'Desconocido'}
                  </span>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">Fecha de vencimiento</Label>
                <Input 
                  id="endDate" 
                  type="date" 
                  value={editExpireDate}
                  onChange={(e) => setEditExpireDate(e.target.value)}
                  disabled={isSaving}
                />
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  Asegúrate de cambiar también el registro manual en tu pasarela de cobros externos.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSaving}>
              Cerrar
            </Button>
            <Button onClick={handleSaveSubscription} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
