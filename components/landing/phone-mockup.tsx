import { MessageCircle, Star } from 'lucide-react'

export function PhoneMockup() {
  return (
    <div className="relative">
      {/* Phone Frame */}
      <div className="relative h-[580px] w-[290px] overflow-hidden rounded-[3rem] border-[12px] border-gray-800 bg-white shadow-2xl">
        {/* Status Bar */}
        <div className="flex h-6 items-center justify-between bg-white px-5">
          <span className="text-xs font-medium text-gray-900">9:41</span>
          <div className="flex items-center gap-1">
            <div className="h-2.5 w-4 rounded-sm bg-gray-900" />
            <div className="h-3 w-5 rounded-sm border border-gray-900">
              <div className="ml-0.5 mt-0.5 h-2 w-3 rounded-sm bg-[#25D366]" />
            </div>
          </div>
        </div>
        
        {/* Catalog Content */}
        <div className="flex h-full flex-col bg-[#F8FAFC] px-4 pb-20">
          {/* Header */}
          <div className="flex flex-col items-center py-5">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#E91E8C] text-xl font-bold text-white">
              ME
            </div>
            <h2 className="text-lg font-bold text-[#0F172A]">Moda Elena</h2>
            <p className="mt-1 text-center text-xs text-gray-500">
              Ropa y accesorios para mujer
            </p>
            <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] py-2.5 text-sm font-medium text-white">
              <MessageCircle className="h-4 w-4" />
              Contactar por WhatsApp
            </button>
          </div>

          {/* Category Pills */}
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
            <span className="shrink-0 rounded-full bg-[#E91E8C] px-3 py-1 text-xs font-medium text-white">
              Todos
            </span>
            <span className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600">
              Ropa
            </span>
            <span className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600">
              Accesorios
            </span>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 gap-3">
            <ProductCard 
              name="Blusa floral" 
              price="$18.99" 
              image="https://picsum.photos/seed/me01/200/200"
              featured
            />
            <ProductCard 
              name="Vestido casual" 
              price="$32.00" 
              image="https://picsum.photos/seed/me02/200/200"
            />
            <ProductCard 
              name="Jeans skinny" 
              price="$28.50" 
              image="https://picsum.photos/seed/me03/200/200"
            />
            <ProductCard 
              name="Bolso cuero" 
              price="$22.99" 
              image="https://picsum.photos/seed/me05/200/200"
              featured
            />
          </div>
        </div>
      </div>

      {/* Dynamic Island / Notch */}
      <div className="absolute left-1/2 top-3 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />

      {/* Decorative Elements */}
      <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-[#25D366]/30 blur-xl" />
      <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-[#E91E8C]/30 blur-xl" />
    </div>
  )
}

interface ProductCardProps {
  name: string
  price: string
  image: string
  featured?: boolean
}

function ProductCard({ name, price, image, featured }: ProductCardProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
      <div className="relative aspect-square">
        <img 
          src={image} 
          alt={name} 
          className="h-full w-full object-cover"
        />
        {featured && (
          <span className="absolute left-1 top-1 flex items-center gap-0.5 rounded bg-[#F59E0B] px-1.5 py-0.5 text-[10px] font-medium text-white">
            <Star className="h-2.5 w-2.5" />
            Destacado
          </span>
        )}
      </div>
      <div className="p-2">
        <p className="line-clamp-1 text-xs font-medium text-[#0F172A]">{name}</p>
        <p className="mt-0.5 text-sm font-bold text-[#E91E8C]">{price}</p>
        <button className="mt-1.5 flex w-full items-center justify-center gap-1 rounded bg-[#25D366] py-1.5 text-[10px] font-medium text-white">
          <MessageCircle className="h-3 w-3" />
          Pedir
        </button>
      </div>
    </div>
  )
}
