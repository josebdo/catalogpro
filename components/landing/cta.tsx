import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LandingCTA() {
  return (
    <section className="bg-[#0F172A] py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <h2 className="text-balance text-3xl font-bold text-white md:text-4xl">
          Empieza hoy. Tu primer catálogo en menos de 5 minutos.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-gray-400">
          Crea tu cuenta gratis y comienza a recibir pedidos por WhatsApp. 
          Sin tarjeta de crédito, sin compromisos.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button 
            asChild 
            size="lg" 
            className="h-14 gap-2 bg-[#25D366] px-10 text-lg text-white hover:bg-[#22C55E]"
          >
            <Link href="/registro">
              Crear mi catálogo gratis
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
