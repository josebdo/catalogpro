'use client'

import { MessageCircle, Star, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/plans'
import type { Business, Product } from '@/lib/mock-data'
import { trackAnalyticsEvent } from '@/app/actions/analytics'

interface CatalogProductsProps {
  products: Product[]
  business: Business
}

export function CatalogProducts({ products, business }: CatalogProductsProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="mb-2 text-lg font-semibold text-[#0F172A]">
          No hay productos
        </h2>
        <p className="text-sm text-muted-foreground">
          Este catálogo aún no tiene productos disponibles.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          business={business}
        />
      ))}
    </div>
  )
}

interface ProductCardProps {
  product: Product
  business: Business
}

function ProductCard({ product, business }: ProductCardProps) {
  const handleWhatsAppOrder = () => {
    if (!business.whatsappNumber || !product.isAvailable) return
    
    const price = formatCurrency(product.price, product.currency)
    const template = business.whatsappMessageTemplate || 'Hola! Me interesa este producto: {product_name}'
    const message = template
      .replace('{product_name}', product.name)
      .replace('{product_price}', price)
    const encodedMessage = encodeURIComponent(message)
    const url = `https://wa.me/${business.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`
    
    // Track click without waiting
    trackAnalyticsEvent(business.id, 'whatsapp_click', product.id).catch(console.error)
    
    window.open(url, '_blank')
  }

  const isDisabled = !product.isAvailable || !business.whatsappNumber

  return (
    <div 
      className={`group overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-all duration-200 ${
        product.isAvailable ? 'hover:-translate-y-0.5 hover:shadow-md' : 'opacity-60'
      }`}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        
        {/* Featured Badge */}
        {product.isFeatured && product.isAvailable && (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-[#F59E0B] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            <Star className="h-3 w-3 fill-current" />
            Destacado
          </span>
        )}
        
        {/* Sold Out Badge */}
        {!product.isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#0F172A]">
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-[#0F172A]">
          {product.name}
        </h3>
        
        <p 
          className="mt-1 text-base font-bold"
          style={{ color: business.accentColor }}
        >
          {formatCurrency(product.price, product.currency)}
        </p>

        {/* WhatsApp Button */}
        <Button
          onClick={handleWhatsAppOrder}
          disabled={!product.isAvailable}
          className="mt-3 w-full gap-2 text-xs font-semibold text-white transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 h-10 rounded-lg shadow-sm"
          style={{ 
            backgroundColor: product.isAvailable ? business.accentColor : '#94A3B8',
            opacity: product.isAvailable ? 1 : 0.5 
          }}
        >
          <MessageCircle className="h-4 w-4" />
          {product.isAvailable ? 'Ordenar ahora' : 'No disponible'}
        </Button>
      </div>
    </div>
  )
}
