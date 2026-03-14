import Link from 'next/link'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PhoneMockup } from '@/components/landing/phone-mockup'

export function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-[#0F172A] py-20 md:py-28">
      {/* Grid Pattern Background */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* Gradient Accent */}
      <div className="absolute right-0 top-0 h-[500px] w-[500px] -translate-y-1/2 translate-x-1/2 rounded-full bg-[#25D366]/20 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#25D366]/30 bg-[#25D366]/10 px-4 py-1.5 text-sm text-[#25D366]">
              <MessageCircle className="h-4 w-4" />
              <span>Integrado con WhatsApp</span>
            </div>
            
            <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
              Tu catálogo profesional, compartido por{' '}
              <span className="text-[#25D366]">WhatsApp</span>
            </h1>
            
            <p className="mx-auto mb-8 max-w-xl text-pretty text-lg text-gray-400 lg:mx-0">
              Deja de enviar fotos sueltas y PDFs. Crea tu catálogo digital en minutos 
              y recibe pedidos directamente por WhatsApp.
            </p>
            
            <div className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
              <Button 
                asChild 
                size="lg" 
                className="h-12 gap-2 bg-[#25D366] px-8 text-base text-white hover:bg-[#22C55E]"
              >
                <Link href="/registro">
                  Crear mi catálogo gratis
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="h-12 border-gray-700 bg-transparent px-8 text-base text-white hover:bg-gray-800 hover:text-white"
              >
                <Link href="/moda-elena">Ver ejemplo</Link>
              </Button>
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-8 lg:justify-start">
              <div className="text-center lg:text-left">
                <p className="text-2xl font-bold text-white">100+</p>
                <p className="text-sm text-gray-500">Negocios activos</p>
              </div>
              <div className="h-8 w-px bg-gray-700" />
              <div className="text-center lg:text-left">
                <p className="text-2xl font-bold text-white">5,000+</p>
                <p className="text-sm text-gray-500">Pedidos por mes</p>
              </div>
              <div className="h-8 w-px bg-gray-700" />
              <div className="text-center lg:text-left">
                <p className="text-2xl font-bold text-white">$0</p>
                <p className="text-sm text-gray-500">Para empezar</p>
              </div>
            </div>
          </div>

          {/* Right Content - Phone Mockup */}
          <div className="flex justify-center lg:justify-end">
            <PhoneMockup />
          </div>
        </div>
      </div>
    </section>
  )
}
