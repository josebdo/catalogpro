'use client'

import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Business } from '@/lib/mock-data'

interface CatalogHeaderProps {
  business: Business
}

export function CatalogHeader({ business }: CatalogHeaderProps) {
  const handleWhatsAppClick = () => {
    if (!business.whatsappNumber) return
    
    const message = encodeURIComponent(
      `Hola! Me interesa saber más sobre ${business.name}`
    )
    const url = `https://wa.me/${business.whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`
    window.open(url, '_blank')
  }

  const initial = business.name.charAt(0).toUpperCase()

  return (
    <header className="mb-6 flex flex-col items-center text-center">
      {/* Logo */}
      {business.logoUrl ? (
        <img
          src={business.logoUrl}
          alt={business.name}
          className="mb-4 h-20 w-20 rounded-full object-cover"
        />
      ) : (
        <div 
          className="mb-4 flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white"
          style={{ backgroundColor: business.accentColor }}
        >
          {initial}
        </div>
      )}

      {/* Business Name */}
      <h1 className="mb-1 text-[22px] font-bold text-[#0F172A]">
        {business.name}
      </h1>

      {/* Description */}
      {business.description && (
        <p className="mb-4 text-sm text-muted-foreground">
          {business.description}
        </p>
      )}

      {/* WhatsApp Button */}
      <Button
        onClick={handleWhatsAppClick}
        disabled={!business.whatsappNumber}
        className="w-full gap-2 bg-[#25D366] text-white hover:bg-[#22C55E] disabled:cursor-not-allowed disabled:opacity-50"
        title={!business.whatsappNumber ? 'WhatsApp no configurado' : undefined}
      >
        <MessageCircle className="h-4 w-4" />
        Contactar por WhatsApp
      </Button>

      {!business.whatsappNumber && (
        <p className="mt-2 text-xs text-muted-foreground">
          WhatsApp no disponible
        </p>
      )}
    </header>
  )
}
