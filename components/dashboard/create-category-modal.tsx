"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { createCategory } from "@/app/actions/categories"
import { updateCategory } from "@/app/actions/categories"

export interface CategoryData {
  id: string
  name: string
}

interface CreateCategoryModalProps {
  accentColor?: string
  trigger?: React.ReactNode
  onSuccess?: () => void
  initialData?: CategoryData
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateCategoryModal({ 
  accentColor = '#25D366', 
  trigger, 
  onSuccess, 
  initialData,
  open: controlledOpen,
  onOpenChange: setControlledOpen
}: CreateCategoryModalProps) {
  const router = useRouter()
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const isOpen = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
  const setIsOpen = setControlledOpen !== undefined ? setControlledOpen : setUncontrolledOpen
  
  const isEditing = !!initialData

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    
    let result;
    if (isEditing && initialData) {
      result = await updateCategory(formData, initialData.id);
    } else {
      result = await createCategory(formData);
    }

    if (result.error) {
      toast.error(result.error)
      setIsLoading(false)
      return
    }

    toast.success(isEditing ? 'Categoría actualizada' : 'Categoría creada con éxito')
    setIsOpen(false)
    setIsLoading(false)
    
    // Refresh the current route to fetch new data from the database
    router.refresh()
    
    // Call the success callback to bypass client-side cache
    if (onSuccess) {
      onSuccess()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger ? trigger : !isEditing ? (
          <Button 
            className="text-white gap-2 hover:opacity-90 transition-opacity" 
            style={{ backgroundColor: accentColor }}
          >
            <Plus className="h-4 w-4" />
            Nueva Categoría
          </Button>
        ) : <></>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar categoría' : 'Crear categoría'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Modifica el nombre de tu categoría.' 
              : 'Añade una nueva sección a tu catálogo (ej. "Laptops", "Almuerzos", "Ofertas").'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la categoría</Label>
            <Input
              id="name"
              name="name"
              placeholder="Ej. Ropa de Invierno"
              defaultValue={initialData?.name}
              required
              autoFocus
              disabled={isLoading}
              className="h-11"
            />
          </div>

          <DialogFooter className="pt-4">
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
                isEditing ? 'Guardar cambios' : 'Crear categoría'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
