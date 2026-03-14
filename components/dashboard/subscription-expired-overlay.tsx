'use client'

import { AlertTriangle, CreditCard, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type Business } from '@/lib/mock-data'

interface SubscriptionExpiredOverlayProps {
  business: Business
}

export function SubscriptionExpiredOverlay({ business }: SubscriptionExpiredOverlayProps) {
  return (
    <div className="flex h-[calc(100vh-140px)] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
        <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-500" />
      </div>
      
      <h2 className="mb-2 text-2xl font-bold text-foreground">
        Tu suscripción ha vencido
      </h2>
      <p className="mb-8 max-w-md text-muted-foreground">
        El acceso a la gestión de tu catálogo para el negocio <span className="font-semibold text-foreground">"{business.name}"</span> ha sido restringido. Renueva tu plan para continuar agregando productos y viendo tus analíticas.
      </p>
      
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button className="h-11 bg-[#25D366] text-white hover:bg-[#22C55E]">
          <CreditCard className="mr-2 h-4 w-4" />
          Renovar Suscripción
        </Button>
        <Button variant="outline" className="h-11" asChild>
          <a href={`/${business.slug}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Ver Catálogo Público
          </a>
        </Button>
      </div>
      
      <p className="mt-8 text-sm text-muted-foreground">
        ¿Necesitas ayuda? Contacta a <a href="#" className="font-medium text-[#25D366] hover:underline">soporte técnico</a>.
      </p>
    </div>
  )
}
