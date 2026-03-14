import Link from 'next/link'
import { Check, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/mes',
    description: 'Para empezar a vender',
    features: [
      'Hasta 10 productos',
      '1 categoría',
      'Catálogo público',
      'Botón WhatsApp',
      'Marca CatalogPro visible',
    ],
    buttonText: 'Comenzar gratis',
    buttonVariant: 'outline' as const,
    popular: false,
    founders: false,
  },
  {
    name: 'Básico',
    price: '$9',
    period: '/mes',
    description: 'Para negocios en crecimiento',
    features: [
      'Hasta 50 productos',
      'Hasta 5 categorías',
      'Sin marca CatalogPro',
      'Analíticas 30 días',
      'Mensaje personalizado',
      '1 editor asistente',
    ],
    buttonText: 'Elegir Básico',
    buttonVariant: 'outline' as const,
    popular: false,
    founders: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/mes',
    description: 'Para profesionales',
    features: [
      'Productos ilimitados',
      'Categorías ilimitadas',
      'Sin marca CatalogPro',
      'Analíticas 90 días',
      'Seguimiento de compartidos',
      '3 editores asistentes',
    ],
    buttonText: 'Elegir Pro',
    buttonVariant: 'default' as const,
    popular: true,
    founders: false,
  }
]

export function LandingPricing() {
  return (
    <section id="precios" className="bg-[#F8FAFC] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wider text-[#25D366]">
            Precios
          </span>
          <h2 className="text-balance text-3xl font-bold text-[#0F172A] md:text-4xl">
            Planes simples, sin sorpresas
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
            Elige el plan que mejor se adapte a tu negocio. Puedes cambiar en cualquier momento.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3 lg:gap-8 mx-auto max-w-5xl">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={cn(
                'relative flex flex-col rounded-xl border bg-card p-6',
                plan.popular && 'border-[#25D366] ring-2 ring-[#25D366]'
              )}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#25D366] px-3 py-1 text-xs font-semibold text-white">
                  Más popular
                </span>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#0F172A]">
                  {plan.name}
                </h3>
                <div className="mt-2 flex items-baseline">
                  <span className="text-4xl font-bold text-[#0F172A]">
                    {plan.price}
                  </span>
                  <span className="ml-1 text-muted-foreground">{plan.period}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="mb-6 flex-1 space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#25D366]" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                variant={plan.buttonVariant}
                className={cn(
                  'w-full',
                  plan.popular && 'bg-[#25D366] text-white hover:bg-[#22C55E]'
                )}
              >
                <Link href="/registro">
                  {plan.buttonText}
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
