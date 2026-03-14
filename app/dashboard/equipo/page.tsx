"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  UserPlus, 
  MoreVertical, 
  Pencil,
  Trash2,
  Mail,
  Shield,
  Users,
  Crown,
  Clock
} from "lucide-react"
import { mockUsers } from "@/lib/mock-data"
import { toast } from "sonner"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { createEditorUser, deleteTeamMember } from "@/app/actions/team"
import { getPlanConfig, canAddEditor } from "@/lib/plans"

const roleConfig = {
  owner: { 
    label: "Propietario", 
    description: "Control total del catálogo",
    color: "bg-amber-100 text-amber-800",
    icon: Crown
  },
  editor: { 
    label: "Editor", 
    description: "Puede editar productos y categorías",
    color: "bg-blue-100 text-blue-800",
    icon: Pencil
  },
}

export default function EquipoPage() {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteName, setInviteName] = useState("")
  const [invitePassword, setInvitePassword] = useState("")
  const [inviteRole, setInviteRole] = useState("editor")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const [teamMembersList, setTeamMembersList] = useState<any[]>([])
  const [businessPlan, setBusinessPlan] = useState<any>(null)
  
  const supabase = createClient()

  const loadTeam = async () => {
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

      // Load business plan
      const { data: business } = await supabase
        .from('businesses')
        .select('plan')
        .eq('id', profile.business_id)
        .single()
        
      setBusinessPlan(business?.plan || 'free')

      // Load team members
      const { data: team } = await supabase
        .from('users')
        .select('*')
        .eq('business_id', profile.business_id)
        .order('created_at', { ascending: true })

      setTeamMembersList(team || [])
    } catch (e) {
      console.error("Error loading team", e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTeam()
  }, [supabase])

  const planConfig = businessPlan ? getPlanConfig(businessPlan) : null
  const editorsCount = teamMembersList.filter(m => m.role === 'editor').length
  const canAddMore = planConfig ? canAddEditor(businessPlan, editorsCount) : false

  const handleInvite = async () => {
    if (!inviteEmail || !inviteName || !invitePassword) {
      toast.error("Ingresa todos los datos requeridos")
      return
    }
    
    if (!canAddMore) {
      toast.error("Has alcanzado el límite de editores para tu plan")
      return
    }

    setIsSaving(true)
    try {
      const result = await createEditorUser(inviteEmail, inviteName, invitePassword)
      if (result.error) throw new Error(result.error)
      
      toast.success(`Editor ${inviteName} creado correctamente`)
      setIsInviteDialogOpen(false)
      setInviteEmail("")
      setInviteName("")
      setInvitePassword("")
      loadTeam()
    } catch (e: any) {
      toast.error(e.message || "Error al crear editor")
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("¿Estás seguro de eliminar a este miembro del equipo? Perderá el acceso de inmediato.")) return
    
    try {
      const result = await deleteTeamMember(memberId)
      if (result.error) throw new Error(result.error)
      
      toast.success("Miembro eliminado del equipo")
      loadTeam()
    } catch (e: any) {
      toast.error(e.message || "Error al eliminar miembro")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Equipo</h1>
          <p className="text-muted-foreground mt-1">
            Administra quién puede editar tu catálogo
          </p>
        </div>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#25D366] hover:bg-[#22C55E] text-white" disabled={isLoading || !canAddMore}>
              <UserPlus className="mr-2 h-4 w-4" />
              Añadir editor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Añadir miembro al equipo (Acceso Directo)</DialogTitle>
              <DialogDescription>
                Crea una cuenta de editor inmediatamente. Deberás compartirle la contraseña.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input 
                  id="name" 
                  placeholder="Ej. Juan Pérez"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  disabled={isSaving}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Correo electrónico de inicio de sesión</Label>
                <Input 
                  id="email" 
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  disabled={isSaving}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Contraseña inicial (Compártela con él)</Label>
                <Input 
                  id="password" 
                  type="password"
                  placeholder="******"
                  value={invitePassword}
                  onChange={(e) => setInvitePassword(e.target.value)}
                  disabled={isSaving}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Rol</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editor">
                      <div className="flex items-center gap-2">
                        <Pencil className="h-4 w-4" />
                        Editor - Puede editar productos
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Los editores pueden agregar, editar y eliminar productos y categorías. 
                  No tienen acceso a la configuración del catálogo ni a la facturación.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)} disabled={isSaving}>
                Cancelar
              </Button>
              <Button 
                onClick={handleInvite}
                disabled={isSaving}
                className="bg-[#25D366] hover:bg-[#22C55E] text-white"
              >
                {isSaving ? "Creando..." : "Crear editor"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Plan Limit Warning */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-amber-600" />
            <div className="flex-1">
              <p className="font-medium text-amber-800">
                Tienes {editorsCount} de {planConfig?.maxEditors === null ? 'ilimitados' : planConfig?.maxEditors} editores permitidos en tu plan {planConfig?.displayName}
              </p>
              {!canAddMore && (
                <p className="text-sm text-amber-700">
                  Actualiza a un plan superior para agregar más editores
                </p>
              )}
            </div>
            <Button variant="outline" size="sm" className="border-amber-300 text-amber-800 hover:bg-amber-100" asChild>
              <Link href="/dashboard/suscripcion">
                Ver planes
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Miembros del equipo
          </CardTitle>
          <CardDescription>
            Personas con acceso a tu catálogo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-sm text-muted-foreground animate-pulse">Cargando equipo...</p>
            ) : (
              teamMembersList.map((member) => {
              const role = member.role !== 'owner' ? roleConfig.editor : roleConfig.owner
              const RoleIcon = role.icon
              
              return (
                <div 
                  key={member.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={undefined} />
                      <AvatarFallback>
                        {(member.full_name || 'US').substring(0,2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{member.full_name}</p>
                        <Badge className={role.color}>
                          <RoleIcon className="h-3 w-3 mr-1" />
                          {role.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Se unió el {new Date(member.created_at).toLocaleDateString('es-MX')}
                      </p>
                    </div>
                  </div>
                  {member.role !== "owner" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar del equipo
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )
            })
            )}
          </div>
        </CardContent>
      </Card>


      {/* Role Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Permisos por rol</CardTitle>
          <CardDescription>
            Qué puede hacer cada tipo de miembro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="h-5 w-5 text-amber-600" />
                <h4 className="font-semibold">Propietario</h4>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#25D366]" />
                  Acceso completo al catálogo
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#25D366]" />
                  Gestionar productos y categorías
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#25D366]" />
                  Personalizar catálogo
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#25D366]" />
                  Ver analíticas
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#25D366]" />
                  Gestionar equipo
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#25D366]" />
                  Administrar suscripción
                </li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                <Pencil className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold">Editor</h4>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#25D366]" />
                  Gestionar productos y categorías
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#25D366]" />
                  Subir imágenes
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#25D366]" />
                  Ver analíticas básicas
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  <span className="line-through">Personalizar catálogo</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  <span className="line-through">Gestionar equipo</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  <span className="line-through">Administrar suscripción</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
