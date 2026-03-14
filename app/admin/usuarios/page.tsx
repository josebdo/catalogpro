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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Search, 
  MoreVertical, 
  Eye,
  Pencil,
  Ban,
  UserCog,
  Users,
  Download,
  Plus,
  Loader2
} from "lucide-react"
import { PLAN_ORDER, planConfigs } from "@/lib/plans"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { toggleUserStatus, createAdminHelper, createBusinessAdmin } from "@/app/actions/admin"
import { BusinessPlan } from "@/lib/mock-data"

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Administrador",
  owner: "Propietario",
  editor: "Editor"
}

const roleBadgeColors: Record<string, string> = {
  super_admin: "bg-destructive/10 text-destructive",
  admin: "bg-amber-100 text-amber-800",
  owner: "bg-blue-100 text-blue-800",
  editor: "bg-slate-100 text-slate-800"
}

export default function AdminUsuariosPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  
  const [isLoading, setIsLoading] = useState(true)
  const [usersList, setUsersList] = useState<any[]>([])
  const [stats, setStats] = useState({
    total: 0,
    owners: 0,
    admins: 0,
    editors: 0
  })

  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [newAdminEmail, setNewAdminEmail] = useState("")
  const [newAdminFullName, setNewAdminFullName] = useState("")
  const [newAdminPassword, setNewAdminPassword] = useState("")

  const [isCreateBusinessDialogOpen, setIsCreateBusinessDialogOpen] = useState(false)
  const [newBusinessName, setNewBusinessName] = useState("")
  const [newBusinessSlug, setNewBusinessSlug] = useState("")
  const [newBusinessEmail, setNewBusinessEmail] = useState("")
  const [newBusinessFullName, setNewBusinessFullName] = useState("")
  const [newBusinessPassword, setNewBusinessPassword] = useState("")
  const [newBusinessPlan, setNewBusinessPlan] = useState("basico")

  const supabase = createClient()

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      // We do a join with businesses to get the plan
      const { data, error } = await supabase
        .from('users')
        .select(`
          id, 
          full_name, 
          email, 
          role, 
          created_at, 
          is_active,
          business_id,
          businesses!users_business_id_fkey ( plan )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setUsersList(data || [])
      
      const st = { total: 0, owners: 0, admins: 0, editors: 0 }
      data?.forEach(u => {
        st.total++
        if (u.role === 'owner') st.owners++
        else if (u.role === 'admin' || u.role === 'super_admin') st.admins++
        else if (u.role === 'editor') st.editors++
      })
      setStats(st)

    } catch (err: any) {
      console.error(err)
      toast.error('Error al cargar la lista de usuarios')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [supabase])

  const filteredUsers = usersList.filter(user => {
    const term = searchQuery.toLowerCase()
    const matchesSearch = 
      (user.full_name || '').toLowerCase().includes(term) ||
      (user.email || '').toLowerCase().includes(term)
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  // Simulated actions for now:

  const handleSuspendUser = async (user: any) => {
    try {
      const result = await toggleUserStatus(user.id, user.business_id, user.is_active)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(`Usuario ${user.is_active ? 'suspendido' : 'reactivado'} correctamente`)
        loadUsers()
      }
    } catch (e: any) {
      toast.error('Error al cambiar el estado del usuario')
    }
  }

  const handleEditUser = (user: any) => {
    setSelectedUser(user)
    toast.info("Funcionalidad para editar usuario en desarrollo")
  }

  const handleCreateAdmin = async () => {
    if (!newAdminEmail || !newAdminFullName || !newAdminPassword) {
      toast.error('Por favor, completa todos los campos requeridos')
      return
    }

    setIsSaving(true)
    try {
      const result = await createAdminHelper(newAdminEmail, newAdminFullName, newAdminPassword)
      if (result.error) throw new Error(result.error)

      toast.success('Administrador creado correctamente')
      setIsCreateDialogOpen(false)
      setNewAdminEmail("")
      setNewAdminFullName("")
      setNewAdminPassword("")
      loadUsers()
    } catch (e: any) {
      toast.error(e.message || 'Error al crear administrador')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateBusiness = async () => {
    if (!newBusinessName || !newBusinessSlug || !newBusinessEmail || !newBusinessFullName || !newBusinessPassword) {
      toast.error('Por favor, completa todos los campos requeridos')
      return
    }

    setIsSaving(true)
    try {
      const result = await createBusinessAdmin(
        newBusinessName, 
        newBusinessSlug, 
        newBusinessEmail, 
        newBusinessFullName, 
        newBusinessPassword, 
        newBusinessPlan
      )
      if (result.error) throw new Error(result.error)

      toast.success('Negocio y propietario creados correctamente')
      setIsCreateBusinessDialogOpen(false)
      setNewBusinessName("")
      setNewBusinessSlug("")
      setNewBusinessEmail("")
      setNewBusinessFullName("")
      setNewBusinessPassword("")
      loadUsers()
    } catch (e: any) {
      toast.error(e.message || 'Error al crear negocio')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveUser = () => {
    setIsEditDialogOpen(false)
    toast.info("Actualización pronto disponible")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Usuarios</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona todos los usuarios de la plataforma
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Button onClick={() => setIsCreateBusinessDialogOpen(true)} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Negocio
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-[#25D366] hover:bg-[#22C55E] text-white">
            <UserCog className="mr-2 h-4 w-4" />
            Añadir Administrador
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total usuarios</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <UserCog className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.owners}
                </p>
                <p className="text-xs text-muted-foreground">Propietarios</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <UserCog className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.admins}
                </p>
                <p className="text-xs text-muted-foreground">Administradores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <UserCog className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.editors}
                </p>
                <p className="text-xs text-muted-foreground">Editores</p>
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
                placeholder="Buscar por nombre o email..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="owner">Propietario</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>{filteredUsers.length} usuarios</CardTitle>
          <CardDescription>
            Lista de todos los usuarios registrados
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
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const planId = user.businesses?.plan || 'free'
                  const plan = planConfigs[planId as keyof typeof planConfigs]
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="text-xs">
                              {user.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.full_name || 'Sin nombre'}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={roleBadgeColors[user.role] || "bg-secondary"}>
                          {roleLabels[user.role] || user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {plan?.displayName || 'Desconocido'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary"
                          className={user.is_active !== false
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                          }
                        >
                          {user.is_active !== false ? 'Activo' : 'Suspendido'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString('es-MX')}
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
                            <DropdownMenuItem onClick={() => { setSelectedUser(user); setIsDetailsOpen(true); }}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleSuspendUser(user)}
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              {user.is_active !== false ? 'Suspender' : 'Reactivar'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                      No se encontraron resultados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
            <DialogDescription>
              Modifica la información del usuario
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="editName">Nombre</Label>
                <Input id="editName" defaultValue={selectedUser.full_name} disabled />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editEmail">Email</Label>
                <Input id="editEmail" type="email" defaultValue={selectedUser.email} disabled />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editRole">Rol (Lectura)</Label>
                <Select defaultValue={selectedUser.role} disabled>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="owner">Propietario</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editPlan">Plan (Lectura)</Label>
                <Select defaultValue={selectedUser.businesses?.plan || 'free'} disabled>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PLAN_ORDER.map(planKey => {
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
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveUser}>
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Business Dialog */}
      <Dialog open={isCreateBusinessDialogOpen} onOpenChange={setIsCreateBusinessDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Añadir Nuevo Negocio</DialogTitle>
            <DialogDescription>
              Crea un negocio y su usuario propietario en un solo paso.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bizName">Nombre del Negocio</Label>
              <Input
                id="bizName"
                placeholder="Ej. Mi Tiendita"
                value={newBusinessName}
                onChange={(e) => {
                  setNewBusinessName(e.target.value)
                  // Auto-generate slug suggestion
                  if (!newBusinessSlug) {
                    setNewBusinessSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
                  }
                }}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bizSlug">Enlace del Catálogo (Slug)</Label>
              <div className="flex items-center">
                <span className="text-muted-foreground text-sm flex-none mr-2">catalogpro.app/</span>
                <Input
                  id="bizSlug"
                  placeholder="mi-tiendita"
                  value={newBusinessSlug}
                  onChange={(e) => setNewBusinessSlug(e.target.value)}
                  disabled={isSaving}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bizPlan">Plan de Suscripción</Label>
              <Select value={newBusinessPlan} onValueChange={setNewBusinessPlan} disabled={isSaving}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLAN_ORDER.map(planKey => {
                    const plan = planConfigs[planKey]
                    return (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.displayName}
                      </SelectItem>
                    )
                  })}
                  <SelectItem value="founders">Founders</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="relative mt-2 border-t pt-4">
              <span className="absolute -top-3 left-2 bg-background px-2 text-xs text-muted-foreground">Datos del Propietario</span>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ownerName">Nombre Completo</Label>
              <Input
                id="ownerName"
                placeholder="Ej. María López"
                value={newBusinessFullName}
                onChange={(e) => setNewBusinessFullName(e.target.value)}
                disabled={isSaving}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ownerEmail">Correo Electrónico</Label>
              <Input
                id="ownerEmail"
                type="email"
                placeholder="maria@correo.com"
                value={newBusinessEmail}
                onChange={(e) => setNewBusinessEmail(e.target.value)}
                disabled={isSaving}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ownerPassword">Contraseña Inicial</Label>
              <Input
                id="ownerPassword"
                type="password"
                placeholder="******"
                value={newBusinessPassword}
                onChange={(e) => setNewBusinessPassword(e.target.value)}
                disabled={isSaving}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateBusinessDialogOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleCreateBusiness} disabled={isSaving} className="bg-[#25D366] hover:bg-[#22C55E] text-white">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Negocio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir Nuevo Administrador</DialogTitle>
            <DialogDescription>
              Crea un sub-usuario con privilegios para ayudarte a administrar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="adminName">Nombre completo</Label>
              <Input
                id="adminName"
                placeholder="Ej. Carlos Asistente"
                value={newAdminFullName}
                onChange={(e) => setNewAdminFullName(e.target.value)}
                disabled={isSaving}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="adminEmail">Correo Electrónico</Label>
              <Input
                id="adminEmail"
                type="email"
                placeholder="admin@tuempresa.com"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                disabled={isSaving}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="adminPassword">Contraseña temporal</Label>
              <Input
                id="adminPassword"
                type="password"
                placeholder="******"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                disabled={isSaving}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleCreateAdmin} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Añadir administrador
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* View Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles del Usuario</DialogTitle>
            <DialogDescription>
              Información de la base de datos
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="flex flex-col gap-2 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm text-muted-foreground">ID Interno:</span>
                  <span className="text-xs font-mono">{selectedUser.id}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm text-muted-foreground">Nombre:</span>
                  <span className="text-sm font-medium">{selectedUser.full_name}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <span className="text-sm">{selectedUser.email}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm text-muted-foreground">Fecha registro:</span>
                  <span className="text-sm">{new Date(selectedUser.created_at).toLocaleString('es-MX')}</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm text-muted-foreground">Rol Administrativo:</span>
                  <Badge className={roleBadgeColors[selectedUser.role] || "bg-secondary"}>{roleLabels[selectedUser.role] || selectedUser.role}</Badge>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm text-muted-foreground">Estado Cuenta:</span>
                  <Badge variant={selectedUser.is_active ? 'default' : 'destructive'} className={selectedUser.is_active ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}>
                    {selectedUser.is_active ? 'Activa' : 'Suspendida'}
                  </Badge>
                </div>
                
                {selectedUser.businesses && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Plan Comercial:</span>
                    <span className="text-sm font-medium text-primary">{planConfigs[selectedUser.businesses.plan as BusinessPlan]?.displayName || selectedUser.businesses.plan}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
