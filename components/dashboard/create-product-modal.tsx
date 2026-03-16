"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { createProduct, updateProduct } from "@/app/actions/products"
import { ImageUploader } from "@/components/dashboard/image-uploader"

export interface ProductData {
  id: string
  name: string
  description?: string | null
  price: number
  currency: string
  image_url?: string | null
  category_id?: string | null
}

interface Category {
  id: string
  name: string
}

interface CreateProductModalProps {
  categories: Category[]
  accentColor?: string
  currency?: string
  trigger?: React.ReactNode
  onSuccess?: () => void
  initialData?: ProductData
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateProductModal({ 
  categories, 
  accentColor = '#25D366', 
  currency = 'USD',
  trigger,
  onSuccess,
  initialData,
  open: controlledOpen,
  onOpenChange: setControlledOpen
}: CreateProductModalProps) {
  const router = useRouter()
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string>(initialData?.image_url || '')
  
  const isOpen = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
  const setIsOpen = setControlledOpen !== undefined ? setControlledOpen : setUncontrolledOpen
  
  const isEditing = !!initialData

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    
    // Inject the uploaded image URL into the form data
    if (imageUrl) {
      formData.append('imageUrl', imageUrl)
    }
    
    let result;
    if (isEditing && initialData) {
      result = await updateProduct(formData, initialData.id);
    } else {
      result = await createProduct(formData);
    }

    if (result.error) {
      toast.error(result.error)
      setIsLoading(false)
      return
    }

    toast.success(isEditing ? 'Producto actualizado' : 'Producto creado con éxito')
    setIsOpen(false)
    setIsLoading(false)
    if (!isEditing) setImageUrl('') // Reset image state only if strictly creating
    
    // Refresh the current route to fetch new data
    router.refresh()
    
    // Bypass client cache
    if (onSuccess) {
      onSuccess()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger ? trigger : !isEditing ? (
          <Button 
            className="w-full sm:w-auto text-white gap-2 hover:opacity-90 transition-opacity" 
            style={{ backgroundColor: accentColor }}
          >
            <Plus className="h-4 w-4" />
            Agregar producto
          </Button>
        ) : <></>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Actualiza los detalles de tu producto.' : 'Completa la información del nuevo producto para tu catálogo.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre del producto *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Ej: Pastel de Chocolate"
              defaultValue={initialData?.name}
              required
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea 
              id="description"
              name="description"
              placeholder="Describe los detalles, medidas o ingredientes de tu producto..."
              defaultValue={initialData?.description || ''}
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price">Precio ({currency}) *</Label>
              <Input 
                id="price"
                name="price"
                type="number" 
                step="0.01"
                min="0"
                placeholder="0.00"
                defaultValue={initialData?.price}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="categoryId">Categoría</Label>
              <Select name="categoryId" defaultValue={initialData?.category_id || undefined} disabled={isLoading || categories.length === 0}>
                <SelectTrigger>
                  <SelectValue placeholder={categories.length === 0 ? "Crea una categoría primero" : "Seleccionar"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Imagen del producto</Label>
            <ImageUploader 
              onUploadSuccess={(url) => setImageUrl(url)}
              accentColor={accentColor}
            />
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="text-white"
              style={{ backgroundColor: accentColor }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                isEditing ? 'Guardar cambios' : 'Crear producto'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
