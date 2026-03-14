"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderOpen, Plus, MoreVertical, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { CreateCategoryModal } from "@/components/dashboard/create-category-modal"

interface Category {
  id: string
  business_id: string
  name: string
  sort_order: number
  created_at: string
}

export default function CategoriesPage() {
  const router = useRouter()
  const supabase = createClient()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [accentColor, setAccentColor] = useState('#25D366') // Default color
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/login')
          return
        }

        // Get user's business ID
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('business_id')
          .eq('id', session.user.id)
          .single()

        if (userError || !userData?.business_id) {
          throw new Error('No se pudo encontrar el negocio del usuario')
        }

        setBusinessId(userData.business_id)

        // Get business accent color
        const { data: businessData } = await supabase
          .from('businesses')
          .select('accent_color')
          .eq('id', userData.business_id)
          .single()
        
        if (businessData?.accent_color) {
          setAccentColor(businessData.accent_color)
        }

        // Fetch categories for this business
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('business_id', userData.business_id)
          .order('sort_order', { ascending: true })

        if (categoriesError) {
          throw categoriesError
        }

        setCategories(categoriesData || [])
      } catch (err: any) {
        console.error('Error cargando categorías:', err)
        toast.error('Error al cargar las categorías')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [supabase, router, refreshTrigger])

  const handleCreated = () => {
    setRefreshTrigger(prev => prev + 1)
    setEditingCategory(null)
  }

  const deleteCategory = async (categoryId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta categoría?')) return;
    
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);
        
      if (error) throw error;
      
      toast.success('Categoría eliminada con éxito');
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error(err);
      toast.error('Error al eliminar la categoría');
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: accentColor, borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Categorías</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona las categorías de tus productos
          </p>
        </div>
        <CreateCategoryModal accentColor={accentColor} onSuccess={handleCreated} />
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 mb-4" style={{ color: accentColor }}>
            <FolderOpen className="h-6 w-6 opacity-75" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No tienes categorías aún</h2>
          <p className="text-muted-foreground max-w-sm mb-6">
            Las categorías te ayudan a organizar tus productos para que tus clientes los encuentren más fácil.
          </p>
          <CreateCategoryModal 
            accentColor={accentColor} 
            onSuccess={handleCreated}
            trigger={
              <Button className="text-white hover:opacity-90 transition-opacity" style={{ backgroundColor: accentColor }}>
                <Plus className="mr-2 h-4 w-4" />
                Crear mi primera categoría
              </Button>
            } 
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.id} className="group hover:border-border transition-colors relative overflow-hidden">
              {/* Top Accent Strip */}
              <div className="absolute top-0 left-0 right-0 h-1 opacity-50" style={{ backgroundColor: accentColor }} />
              
              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-muted/80">
                    <FolderOpen className="h-5 w-5" style={{ color: accentColor }} />
                  </div>
                  <div>
                    <CardTitle className="text-base line-clamp-1" title={category.name}>{category.name}</CardTitle>
                    <CardDescription>Orden: {category.sort_order}</CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="gap-2" onClick={() => setEditingCategory(category)}>
                      <Edit2 className="h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-destructive" onClick={() => deleteCategory(category.id)}>
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="secondary" className="border-none font-normal" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                    Activa
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Creada el {new Date(category.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <CreateCategoryModal 
            accentColor={accentColor} 
            onSuccess={handleCreated}
            trigger={
              <button className="flex h-full min-h-[140px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted bg-transparent transition-all group hover:bg-muted/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground group-hover:scale-110 transition-transform">
                  <Plus className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">Agregar categoría</span>
              </button>
            } 
          />
        </div>
      )}
      
      {/* Hidden Modal logic for Editing */}
      {editingCategory && (
        <CreateCategoryModal
          accentColor={accentColor}
          onSuccess={handleCreated}
          initialData={{ id: editingCategory.id, name: editingCategory.name }}
          open={!!editingCategory}
          onOpenChange={(open) => !open && setEditingCategory(null)}
        />
      )}
    </div>
  )
}
