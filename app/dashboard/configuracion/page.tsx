"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  User, 
  Bell, 
  Shield, 
  Save,
  Trash2,
  Loader2
} from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { updateBusinessSettings } from "@/app/actions/business"
import { ImageUploader } from "@/components/dashboard/image-uploader"
import { CURRENCY_OPTIONS } from "@/lib/plans"

export default function ConfiguracionPage() {
  const supabase = createClient()
  
  // States
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [accentColor, setAccentColor] = useState('#25D366')

  // Form Fields
  const [fullName, setFullName] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [email, setEmail] = useState("")
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [logoUrl, setLogoUrl] = useState<string>('')
  const [currency, setCurrency] = useState("DOP")

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const { data: userData } = await supabase
          .from('users')
          .select('full_name, email, business_id')
          .eq('id', session.user.id)
          .single()

        if (userData?.business_id) {
          const { data: businessData, error } = await supabase
            .from('businesses')
            .select('*')
            .eq('id', userData.business_id)
            .single()

          if (!error && businessData) {
            setFullName(userData.full_name || '')
            setEmail(userData.email || '')
            setBusinessName(businessData.name || '')
            setWhatsappNumber(businessData.whatsapp_number || '')
            setLogoUrl(businessData.logo_url || '')
            setCurrency(businessData.settings?.currency || 'DOP')
            if (businessData.accent_color) setAccentColor(businessData.accent_color)
          }
        }
      } catch (err) {
        console.error('Error cargando configuración:', err)
        toast.error("Error al cargar la configuración")
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [supabase])

  const handleSave = async () => {
    setIsSaving(true)
    
    const result = await updateBusinessSettings({
      fullName,
      businessName,
      whatsappNumber,
      currency,
      logoUrl
    })

    setIsSaving(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Configuración guardada exitosamente")
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: accentColor }} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
          <p className="text-muted-foreground mt-1">
            Administra tu cuenta y preferencias
          </p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="text-white"
          style={{ backgroundColor: accentColor }}
        >
          {isSaving ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
          ) : (
            <><Save className="mr-2 h-4 w-4" /> Guardar cambios</>
          )}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil del Negocio</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificaciones</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Seguridad</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Identidad del Negocio</CardTitle>
              <CardDescription>
                Actualiza el perfil público de tu negocio en CatalogPro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2 mb-4">
                <Label>Logo del Negocio</Label>
                <div className="sm:max-w-xs">
                  <ImageUploader 
                    bucket="logos"
                    existingUrl={logoUrl}
                    accentColor={accentColor}
                    onUploadSuccess={(url) => setLogoUrl(url)}
                  />
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Sube una imagen cuadrada de preferencia
                  </p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="businessName">Nombre del negocio</Label>
                  <Input 
                    id="businessName" 
                    value={businessName} 
                    onChange={e => setBusinessName(e.target.value)} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="currency">Moneda Base</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="whatsapp">Número de WhatsApp (con código de país ej. +1...)</Label>
                <Input 
                  id="whatsapp" 
                  value={whatsappNumber} 
                  onChange={e => setWhatsappNumber(e.target.value)}
                  placeholder="+18091234567" 
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tu Información Personal</CardTitle>
              <CardDescription>
                Detalles de acceso para el dueño
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input 
                    id="name" 
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Correo electrónico (solo lectura)</Label>
                  <Input id="email" type="email" value={email} disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones por email</CardTitle>
              <CardDescription>
                Elige qué notificaciones quieres recibir
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Resumen diario</Label>
                  <p className="text-xs text-muted-foreground">
                    Recibe un resumen de visitas y clics diarios
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sesiones activas</CardTitle>
              <CardDescription>
                Dispositivos donde has iniciado sesión
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-medium">Navegador Actual</p>
                  <p className="text-sm text-muted-foreground">República Dominicana</p>
                </div>
                <span className="text-sm text-[#25D366] font-medium">Sesión actual</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
