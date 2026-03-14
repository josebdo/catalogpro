import { ImageOff, FileX, TrendingDown } from 'lucide-react'

const problems = [
  {
    icon: ImageOff,
    title: 'Fotos desordenadas',
    description: 'Tus clientes reciben fotos sueltas sin precios ni descripciones. Se confunden y se van.',
  },
  {
    icon: FileX,
    title: 'PDFs que nadie abre',
    description: 'Envías catálogos en PDF pesados que tardan en cargar y nadie termina de ver.',
  },
  {
    icon: TrendingDown,
    title: 'Pierdes ventas',
    description: 'Sin un proceso claro, los clientes abandonan antes de hacer su pedido.',
  },
]

export function LandingProblem() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="text-balance text-3xl font-bold text-[#0F172A] md:text-4xl">
            ¿Aún envías tus productos así?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
            La mayoría de pequeños negocios pierden clientes por no tener un catálogo profesional.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {problems.map((problem, index) => (
            <div 
              key={index}
              className="group rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-red-50">
                <problem.icon className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-[#0F172A]">
                {problem.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
