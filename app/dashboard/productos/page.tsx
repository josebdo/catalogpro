"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Search, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  Eye, 
  EyeOff,
  GripVertical,
  Package
} from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { CreateProductModal } from "@/components/dashboard/create-product-modal"

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  currency: string
  image_url: string | null
  is_available: boolean
  is_featured: boolean
  category_id: string | null
  categories?: { name: string } | null
}

interface Category {
  id: string
  name: string
}

export default function ProductosPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [accentColor, setAccentColor] = useState('#25D366')
  const [currency, setCurrency] = useState('USD')

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

        // Get business accent color and currency
        const { data: businessData } = await supabase
          .from('businesses')
          .select('accent_color, settings')
          .eq('id', userData.business_id)
          .single()
        
        if (businessData) {
          if (businessData.accent_color) setAccentColor(businessData.accent_color)
          if (businessData.settings?.currency) setCurrency(businessData.settings.currency)
        }

        // Fetch categories for the filter and modal
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('id, name')
          .eq('business_id', userData.business_id)
          .order('sort_order', { ascending: true })

        if (categoriesData) {
          setCategories(categoriesData)
        }

        // Fetch products with their category names
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            categories(name)
          `)
          .eq('business_id', userData.business_id)
          .order('sort_order', { ascending: true })

        if (productsError) {
          throw productsError
        }

        setProducts(productsData || [])
      } catch (err: any) {
        console.error('Error cargando productos:', err)
        toast.error('Error al cargar los productos')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [supabase, router, refreshTrigger])

  const handleCreated = () => {
    setRefreshTrigger(prev => prev + 1)
    setEditingProduct(null)
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (product.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category_id === selectedCategory
    return matchesSearch && matchesCategory
  })

  const toggleProductVisibility = async (product: Product) => {
    try {
      // Optimistic update
      setProducts(prev => prev.map(p => 
        p.id === product.id ? { ...p, is_available: !p.is_available } : p
      ))

      const { error } = await supabase
        .from('products')
        .update({ is_available: !product.is_available })
        .eq('id', product.id)

      if (error) throw error
      toast.success(product.is_available ? "Producto ocultado" : "Producto visible")
    } catch (err) {
      // Revert on error
      setProducts(prev => prev.map(p => 
        p.id === product.id ? { ...p, is_available: product.is_available } : p
      ))
      toast.error("Error al actualizar visibilidad")
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto lógico?')) return;
    
    try {
      // Optimistic update
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, is_available: false } : p
      ))

      const { error } = await supabase
        .from('products')
        .update({ is_available: false })
        .eq('id', productId)

      if (error) throw error
      
      toast.success("Producto ocultado/eliminado lógicamente")
    } catch (err) {
      toast.error("Error al eliminar el producto")
      setRefreshTrigger(prev => prev + 1)
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
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Productos</h1>
          <p className="text-muted-foreground text-sm">
            Gestiona los productos de tu catálogo
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <CreateProductModal 
            categories={categories} 
            accentColor={accentColor} 
            currency={currency} 
            onSuccess={handleCreated}
          />
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar productos..."
                  className="pl-9 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
        </CardContent>
      </Card>

      {/* Products List */}
      <div className="space-y-4">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <Package className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
            <h3 className="mt-4 text-lg font-medium text-foreground">No se encontraron productos</h3>
            <p className="text-muted-foreground">
              {products.length === 0 ? "Empieza agregando tu primer producto." : "Prueba ajustando tu búsqueda o filtros."}
            </p>
            {products.length === 0 && (
              <div className="mt-6">
                <CreateProductModal 
                  categories={categories} 
                  accentColor={accentColor} 
                  currency={currency} 
                  onSuccess={handleCreated}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <div 
                key={product.id}
                className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border transition-colors ${
                  product.is_available !== false ? 'bg-card' : 'bg-muted/50 opacity-60'
                }`}
              >
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab hidden lg:block" />
                
                <div className="relative h-12 w-12 sm:h-16 sm:w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium truncate">{product.name}</h3>
                    {product.is_featured && (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-[10px] h-4 border-none">
                        Destacado
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {product.categories?.name || 'Sin categoría'} • ${product.price} {product.currency}
                  </p>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => toggleProductVisibility(product)}
                    title={product.is_available !== false ? "Ocultar" : "Mostrar"}
                  >
                    {product.is_available !== false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setEditingProduct(product)}
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        className="text-destructive gap-2"
                        onClick={() => deleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingProduct && (
        <CreateProductModal
          categories={categories}
          accentColor={accentColor}
          currency={currency}
          onSuccess={handleCreated}
          initialData={{
            id: editingProduct.id,
            name: editingProduct.name,
            description: editingProduct.description,
            price: editingProduct.price,
            currency: editingProduct.currency,
            image_url: editingProduct.image_url,
            category_id: editingProduct.category_id
          }}
          open={!!editingProduct}
          onOpenChange={(open) => !open && setEditingProduct(null)}
        />
      )}
    </div>
  )
}
