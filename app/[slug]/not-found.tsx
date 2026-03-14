import Link from 'next/link'
import { Store } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CatalogNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Store className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-[#0F172A]">
          Catálogo no encontrado
        </h1>
        <p className="mb-8 text-muted-foreground">
          Este catálogo no existe o ya no está disponible.
        </p>
        <Button asChild>
          <Link href="/">Ir al inicio</Link>
        </Button>
      </div>
    </div>
  )
}
