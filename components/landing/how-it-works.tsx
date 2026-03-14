import { PlusCircle, Share2, MessageCircle } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: PlusCircle,
    title: 'Crea tu catálogo',
    description: 'Agrega tus productos con fotos, precios y descripciones. En minutos tendrás tu catálogo listo.',
  },
  {
    number: '02',
    icon: Share2,
    title: 'Comparte el link',
    description: 'Envía tu link único por WhatsApp, Instagram o donde quieras. Tus clientes lo abren al instante.',
  },
  {
    number: '03',
    icon: MessageCircle,
    title: 'Recibe pedidos',
    description: 'Cada producto tiene un botón de WhatsApp. Tu cliente hace clic y te llega el pedido directamente.',
  },
]

export function LandingHowItWorks() {
  return (
    <section className="bg-[#F8FAFC] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wider text-[#25D366]">
            Cómo funciona
          </span>
          <h2 className="text-balance text-3xl font-bold text-[#0F172A] md:text-4xl">
            Tu catálogo en 3 simples pasos
          </h2>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={index} className="relative text-center">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-12 hidden h-0.5 w-full bg-[#25D366]/20 md:block" />
              )}
              
              <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
                {/* Circle Background */}
                <div className="absolute inset-0 rounded-full bg-[#25D366]/10" />
                {/* Number Badge */}
                <span className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366] text-sm font-bold text-white">
                  {step.number}
                </span>
                {/* Icon */}
                <step.icon className="relative h-10 w-10 text-[#25D366]" />
              </div>

              <h3 className="mb-2 text-xl font-semibold text-[#0F172A]">
                {step.title}
              </h3>
              <p className="mx-auto max-w-xs text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
