'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    question: '¿Necesito saber programar?',
    answer: 'No, para nada. CatalogPro está diseñado para que cualquier persona pueda crear su catálogo en minutos. Solo necesitas saber subir fotos y escribir descripciones. Es tan fácil como usar WhatsApp.',
  },
  {
    question: '¿Cómo pago mi suscripción?',
    answer: 'El pago es manual y flexible. Puedes pagar por transferencia, efectivo o el método que prefieras. Contactas a nuestro soporte, eliges tu plan y la cantidad de meses, y listo. Sin tarjetas de crédito obligatorias.',
  },
  {
    question: '¿Puedo cancelar en cualquier momento?',
    answer: 'Sí, no hay contratos ni compromisos. Puedes usar el plan Free para siempre o cancelar tu plan de pago cuando quieras. Tu catálogo seguirá visible para tus clientes durante el período que ya pagaste.',
  },
  {
    question: '¿Mi catálogo se ve bien en celulares?',
    answer: 'Absolutamente. CatalogPro está diseñado mobile-first. El 90% de tus clientes abrirá tu catálogo desde WhatsApp en su celular, y se verá perfecto. También funciona en computadoras y tablets.',
  },
  {
    question: '¿Qué pasa si llego al límite de productos?',
    answer: 'Te mostraremos un aviso amigable invitándote a actualizar tu plan. No perderás ningún producto existente. Simplemente no podrás agregar más hasta que actualices o elimines algunos.',
  },
  {
    question: '¿Qué es el plan Founders?',
    answer: 'Es un plan especial permanente y gratuito que damos a nuestros primeros 5 clientes beta. Incluye todo lo del plan Pro sin límites y para siempre. Es nuestra forma de agradecer a quienes confían en nosotros desde el inicio.',
  },
]

export function LandingFAQ() {
  return (
    <section id="faq" className="bg-[#F8FAFC] py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-4">
        <div className="text-center">
          <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wider text-[#25D366]">
            FAQ
          </span>
          <h2 className="text-balance text-3xl font-bold text-[#0F172A] md:text-4xl">
            Preguntas frecuentes
          </h2>
        </div>

        <div className="mt-12">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="rounded-lg border border-border bg-card px-6"
              >
                <AccordionTrigger className="py-4 text-left text-base font-semibold text-[#0F172A] hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
