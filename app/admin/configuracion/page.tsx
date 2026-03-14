"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

export default function AdminConfiguracionPage() {
  const handleSave = () => {
    toast.success("Configuración guardada correctamente")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configuración del Sistema</h1>
        <p className="text-muted-foreground mt-1">
          Ajustes globales de la plataforma CatalogPro
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuración General</CardTitle>
            <CardDescription>Ajustes básicos del nombre y mantenimiento.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="siteName">Nombre del Sitio</Label>
              <Input id="siteName" defaultValue="CatalogPro" />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Modo Mantenimiento</Label>
                <p className="text-sm text-muted-foreground">
                  Desactivar el acceso público a todos los catálogos.
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Nuevos Registros</Label>
                <p className="text-sm text-muted-foreground">
                  Permitir que nuevos usuarios se registren en la plataforma.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Límites Globales</CardTitle>
            <CardDescription>Configuración por defecto para nuevos negocios.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="maxProductsFree">Productos Máximos (Free)</Label>
                <Input id="maxProductsFree" type="number" defaultValue={10} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="trialDays">Días de Prueba (Pro)</Label>
                <Input id="trialDays" type="number" defaultValue={14} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-destructive hover:bg-destructive/90 text-white">
            Guardar Cambios
          </Button>
        </div>
      </div>
    </div>
  )
}
