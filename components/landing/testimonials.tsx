import { Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Elena Martínez',
    business: 'Moda Elena',
    category: 'Ropa y Accesorios',
    quote: 'Antes perdía clientes porque no encontraban lo que buscaban en mis fotos. Ahora todo está organizado y recibo pedidos directos por WhatsApp. ¡Las ventas subieron un 40%!',
    initials: 'EM',
    color: '#E91E8C',
  },
  {
    name: 'Carlos Díaz',
    business: 'Sabores del Norte',
    category: 'Restaurante',
    quote: 'El catálogo carga rápido y mis clientes pueden ver el menú completo en segundos. Ya no tengo que enviar el mismo PDF 50 veces al día.',
    initials: 'CD',
    color: '#FF6B35',
  },
  {
    name: 'María López',
    business: 'Tech Store RD',
    category: 'Electrónica',
    quote: 'Como Founder, tengo acceso a todo sin límites. El seguimiento de compartidos me ayuda a saber cuántos clientes llegan por WhatsApp vs Instagram.',
    initials: 'ML',
    color: '#6366F1',
  },
]

export function LandingTestimonials() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wider text-[#25D366]">
            Testimonios
          </span>
          <h2 className="text-balance text-3xl font-bold text-[#0F172A] md:text-4xl">
            Lo que dicen nuestros clientes
          </h2>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="relative rounded-xl border border-border bg-card p-6"
            >
              <Quote className="absolute right-6 top-6 h-8 w-8 text-[#25D366]/20" />
              
              <div className="mb-6 flex items-center gap-4">
                <div 
                  className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white"
                  style={{ backgroundColor: testimonial.color }}
                >
                  {testimonial.initials}
                </div>
                <div>
                  <p className="font-semibold text-[#0F172A]">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.business}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.category}</p>
                </div>
              </div>

              <p className="text-sm italic leading-relaxed text-muted-foreground">
                &quot;{testimonial.quote}&quot;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
