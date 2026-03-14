"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Store, 
  Palette, 
  MessageCircle, 
  Settings2, 
  Upload,
  ExternalLink,
  Save
} from "lucide-react"
import { mockCatalogs } from "@/lib/mock-data"
import { toast } from "sonner"
import Link from "next/link"

const themeColors = [
  { name: "Verde WhatsApp", primary: "#25D366", bg: "#F0FDF4" },
  { name: "Azul Profesional", primary: "#3B82F6", bg: "#EFF6FF" },
  { name: "Morado Elegante", primary: "#8B5CF6", bg: "#F5F3FF" },
  { name: "Rosa Moderno", primary: "#EC4899", bg: "#FDF2F8" },
  { name: "Naranja Cálido", primary: "#F97316", bg: "#FFF7ED" },
  { name: "Oscuro Premium", primary: "#0F172A", bg: "#F8FAFC" },
]

export default function CatalogoPage() {
  const catalog = mockCatalogs[0]
  const [selectedTheme, setSelectedTheme] = useState(0)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    toast.success("Cambios guardados correctamente")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Personalizar catálogo</h1>
          <p className="text-muted-foreground mt-1">
            Configura la apariencia y ajustes de tu tienda
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/${catalog.slug}`} target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" />
              Ver catálogo
            </Link>
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#25D366] hover:bg-[#22C55E] text-white"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="general" className="gap-2">
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Apariencia</span>
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="gap-2">
            <Settings2 className="h-4 w-4" />
            <span className="hidden sm:inline">Avanzado</span>
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información básica</CardTitle>
              <CardDescription>
                Datos principales de tu negocio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="businessName">Nombre del negocio</Label>
                <Input id="businessName" defaultValue={catalog.name} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">URL del catálogo</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-sm text-muted-foreground">
                    catalogpro.app/
                  </span>
                  <Input 
                    id="slug" 
                    defaultValue={catalog.slug} 
                    className="rounded-l-none"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea 
                  id="description" 
                  defaultValue={catalog.description ?? ''}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logo y portada</CardTitle>
              <CardDescription>
                Imágenes de tu negocio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center border-2 border-dashed">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <Button variant="outline" size="sm">
                      Subir logo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG o JPG, máximo 1MB
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Imagen de portada</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Arrastra una imagen o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Recomendado: 1200x400px
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tema de colores</CardTitle>
              <CardDescription>
                Elige un esquema de colores para tu catálogo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {themeColors.map((theme, index) => (
                  <button
                    key={theme.name}
                    onClick={() => setSelectedTheme(index)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedTheme === index 
                        ? 'border-[#25D366] ring-2 ring-[#25D366]/20' 
                        : 'border-border hover:border-muted-foreground/50'
                    }`}
                  >
                    <div className="flex gap-2 mb-2">
                      <div 
                        className="h-6 w-6 rounded-full"
                        style={{ backgroundColor: theme.primary }}
                      />
                      <div 
                        className="h-6 w-6 rounded-full border"
                        style={{ backgroundColor: theme.bg }}
                      />
                    </div>
                    <p className="text-sm font-medium">{theme.name}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tipografía</CardTitle>
              <CardDescription>
                Personaliza las fuentes de tu catálogo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Fuente de títulos</Label>
                <select className="w-full p-2 border rounded-md">
                  <option>Plus Jakarta Sans</option>
                  <option>Inter</option>
                  <option>Poppins</option>
                  <option>Montserrat</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Fuente de cuerpo</Label>
                <select className="w-full p-2 border rounded-md">
                  <option>Plus Jakarta Sans</option>
                  <option>Inter</option>
                  <option>Open Sans</option>
                  <option>Roboto</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WhatsApp Tab */}
        <TabsContent value="whatsapp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de WhatsApp</CardTitle>
              <CardDescription>
                Personaliza cómo los clientes te contactan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="whatsapp">Número de WhatsApp</Label>
                <Input 
                  id="whatsapp" 
                  defaultValue={catalog.whatsappNumber ?? ''}
                  placeholder="+52 55 1234 5678"
                />
                <p className="text-xs text-muted-foreground">
                  Incluye el código de país
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="defaultMessage">Mensaje predeterminado</Label>
                <Textarea 
                  id="defaultMessage"
                  defaultValue="¡Hola! Me interesa el producto {{producto}}. ¿Podrían darme más información?"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Usa {"{{producto}}"} para incluir el nombre del producto automáticamente
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ctaText">Texto del botón</Label>
                <Input 
                  id="ctaText" 
                  defaultValue="Pedir por WhatsApp"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Horario de atención</CardTitle>
              <CardDescription>
                Informa a tus clientes cuándo pueden contactarte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mostrar horario</Label>
                  <p className="text-xs text-muted-foreground">
                    Se mostrará en tu catálogo
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Abre a las</Label>
                  <Input type="time" defaultValue="09:00" />
                </div>
                <div className="grid gap-2">
                  <Label>Cierra a las</Label>
                  <Input type="time" defaultValue="18:00" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración avanzada</CardTitle>
              <CardDescription>
                Ajustes adicionales de tu catálogo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mostrar precios</Label>
                  <p className="text-xs text-muted-foreground">
                    Los clientes verán los precios de los productos
                  </p>
                </div>
                <Switch defaultChecked={catalog.settings.showPrices} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mostrar categorías</Label>
                  <p className="text-xs text-muted-foreground">
                    Organiza productos por categorías
                  </p>
                </div>
                <Switch defaultChecked={catalog.settings.showCategories} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Búsqueda de productos</Label>
                  <p className="text-xs text-muted-foreground">
                    Permite a los clientes buscar productos
                  </p>
                </div>
                <Switch defaultChecked={catalog.settings.enableSearch} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Vista de cuadrícula</Label>
                  <p className="text-xs text-muted-foreground">
                    Mostrar productos en cuadrícula (vs lista)
                  </p>
                </div>
                <Switch defaultChecked={catalog.settings.gridView} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Moneda</CardTitle>
              <CardDescription>
                Configura la moneda para los precios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <Label>Moneda predeterminada</Label>
                <select className="w-full p-2 border rounded-md" defaultValue={catalog.settings.currency}>
                  <option value="MXN">Peso Mexicano (MXN)</option>
                  <option value="USD">Dólar Estadounidense (USD)</option>
                  <option value="COP">Peso Colombiano (COP)</option>
                  <option value="ARS">Peso Argentino (ARS)</option>
                  <option value="PEN">Sol Peruano (PEN)</option>
                  <option value="CLP">Peso Chileno (CLP)</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
