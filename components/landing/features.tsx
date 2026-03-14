import { Palette, MessageCircle, Eye, Users, BarChart3, Smartphone } from 'lucide-react'

const features = [
  {
    icon: Palette,
    title: 'Tu marca, tu estilo',
    description: 'Personaliza colores, logo y mensajes. Tu catálogo refleja la identidad de tu negocio.',
  },
  {
    icon: MessageCircle,
    title: 'Botón WhatsApp en cada producto',
    description: 'Un clic y tu cliente te contacta con el pedido listo. Sin formularios complicados.',
  },
  {
    icon: Eye,
    title: 'Ve quién abrió tu catálogo',
    description: 'Rastrea cuántas personas abren tu link compartido por WhatsApp y qué productos ven.',
  },
  {
    icon: Users,
    title: 'Gestiona tu equipo',
    description: 'Invita a un asistente para que te ayude a mantener el catálogo actualizado.',
  },
  {
    icon: BarChart3,
    title: 'Analíticas simples',
    description: 'Conoce qué productos son los más populares y cuántos clics de WhatsApp recibes.',
  },
  {
    icon: Smartphone,
    title: 'Perfecto en móvil',
    description: 'Diseñado mobile-first. Se ve increíble en el celular de tus clientes.',
  },
]

export function LandingFeatures() {
  return (
    <section id="caracteristicas" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wider text-[#25D366]">
            Características
          </span>
          <h2 className="text-balance text-3xl font-bold text-[#0F172A] md:text-4xl">
            Todo lo que necesitas para vender más
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
            Herramientas sencillas pero poderosas para pequeños negocios que venden por WhatsApp.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#25D366]/10">
                <feature.icon className="h-6 w-6 text-[#25D366]" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-[#0F172A]">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
