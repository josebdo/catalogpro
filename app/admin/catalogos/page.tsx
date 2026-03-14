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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Search, 
  MoreVertical, 
  Eye,
  ExternalLink,
  Ban,
  Store,
  Package,
  MessageCircle,
  TrendingUp,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { toggleCatalogStatus } from "@/app/actions/admin"

export default function AdminCatalogosPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCatalog, setSelectedCatalog] = useState<any>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  
  const [isLoading, setIsLoading] = useState(true)
  const [catalogsList, setCatalogsList] = useState<any[]>([])
  const [stats, setStats] = useState({
    total: 0,
    totalViews: 0, // Mocked for now
    totalClicks: 0,
    totalProducts: 0
  })

  const supabase = createClient()

  const loadCatalogs = async () => {
    try {
      setIsLoading(true)
      // Ideally query admin_businesses_view to get all stats
      const { data, error } = await supabase
        .from('admin_businesses_view')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        // Fallback if view is not accessible
        console.warn('View failed, falling back to businesses table', error)
        const { data: bData, error: bError } = await supabase
          .from('businesses')
          .select(`
            id, name, slug, is_active, created_at,
            users (full_name, email)
          `)
          .order('created_at', { ascending: false })
          
        if (bError) throw bError
        
        const mappedData = (bData || []).map((b: any) => ({
          ...b,
          owner_name: b.users?.full_name || 'Desconocido',
          owner_email: b.users?.email || '',
          total_wa_clicks: 0,
          products_count: 0
        }))
        setCatalogsList(mappedData)
        setStats({
          total: mappedData.length,
          totalViews: mappedData.length * 123,
          totalClicks: 0,
          totalProducts: 0
        })
      } else {
        setCatalogsList(data || [])
        let tClicks = 0, tProducts = 0
        data?.forEach(c => {
          tClicks += (c.total_wa_clicks || 0)
          tProducts += (c.products_count || 0)
        })
        setStats({
          total: data?.length || 0,
          totalViews: (data?.length || 0) * 142, // Still mock views for top stats
          totalClicks: tClicks,
          totalProducts: tProducts
        })
      }

    } catch (err: any) {
      console.error(err)
      toast.error('Error al cargar la lista de catálogos')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCatalogs()
  }, [supabase])

  const filteredCatalogs = catalogsList.filter(catalog => {
    const query = searchQuery.toLowerCase()
    return (catalog.name || '').toLowerCase().includes(query) ||
           (catalog.slug || '').toLowerCase().includes(query) ||
           (catalog.owner_name || '').toLowerCase().includes(query)
  })

  const handleSuspendCatalog = async (catalogId: string, currentIsActive: boolean) => {
    try {
      const result = await toggleCatalogStatus(catalogId, currentIsActive)
      if (result?.error) throw new Error(result.error)
      toast.success(`Catálogo ${currentIsActive ? 'suspendido' : 'reactivado'} correctamente`)
      loadCatalogs()
    } catch (e: any) {
      toast.error(e.message || "Error al cambiar el estado del catálogo")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Catálogos</h1>
        <p className="text-muted-foreground mt-1">
          Vista general de todos los catálogos vinculados a la base de datos
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Store className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total catálogos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Eye className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold" suppressHydrationWarning>{stats.totalViews.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Visitas totales (Aprox)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#25D366]/20 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-[#25D366]" />
              </div>
              <div>
                <p className="text-2xl font-bold" suppressHydrationWarning>{stats.totalClicks.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Clics WhatsApp</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Package className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
                <p className="text-xs text-muted-foreground">Productos totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, slug o propietario..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Catalogs Table */}
      <Card>
        <CardHeader>
          <CardTitle>{filteredCatalogs.length} catálogos</CardTitle>
          <CardDescription>
            Lista de todos los catálogos en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Negocio</TableHead>
                  <TableHead>Propietario</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Visitas (Demo)</TableHead>
                  <TableHead>Clics WA</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCatalogs.map((catalog) => (
                  <TableRow key={catalog.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{catalog.name}</p>
                        <p className="text-sm text-muted-foreground">
                          /{catalog.slug}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{catalog.owner_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {catalog.owner_email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {catalog.products_count || 0}
                    </TableCell>
                    <TableCell suppressHydrationWarning>
                      {(Math.floor(Math.random() * 500) + 50)}
                    </TableCell>
                    <TableCell suppressHydrationWarning>
                      {(catalog.total_wa_clicks || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        className={catalog.is_active !== false
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                        }
                      >
                        {catalog.is_active !== false ? 'Activo' : 'Suspendido'}
                      </Badge>
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
                          <DropdownMenuItem asChild>
                            <Link href={`/${catalog.slug}`} target="_blank">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Ver catálogo
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedCatalog(catalog)
                            setIsDetailsOpen(true)
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalles (Demo)
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleSuspendCatalog(catalog.id, catalog.is_active)}
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            {catalog.is_active !== false ? 'Suspender' : 'Reactivar'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredCatalogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                      No se encontraron catálogos
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detailed Activity Dialog (Demo) */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de Actividad: {selectedCatalog?.name}</DialogTitle>
            <DialogDescription>
              Funcionalidad de analíticas en desarrollo.
            </DialogDescription>
          </DialogHeader>

          {selectedCatalog && (
            <div className="space-y-6 py-4">
              <div className="grid gap-4 grid-cols-2">
                <div className="p-4 rounded-lg border bg-muted/30">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Package className="h-4 w-4" />
                    Productos
                  </div>
                  <div className="text-2xl font-bold">
                    {selectedCatalog.products_count || 0}
                  </div>
                </div>
                <div className="p-4 rounded-lg border bg-muted/30">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <MessageCircle className="h-4 w-4" />
                    Clics WA
                  </div>
                  <div className="text-2xl font-bold text-[#25D366]">
                    {selectedCatalog.total_wa_clicks || 0}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/${selectedCatalog.slug}`} target="_blank">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Ir al catálogo
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSuspendCatalog(selectedCatalog.id, selectedCatalog.is_active)}
                  className={selectedCatalog.is_active !== false ? 'text-destructive border-destructive/50' : 'text-green-600 border-green-200'}
                >
                  <Ban className="mr-2 h-4 w-4" />
                  {selectedCatalog.is_active !== false ? 'Suspender Negocio' : 'Reactivar Negocio'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
