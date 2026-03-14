import Link from 'next/link'
import { CatalogProLogo } from '@/components/catalog-pro-logo'

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-white py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex flex-col items-center md:items-start">
            <CatalogProLogo className="h-8" />
            <p className="mt-4 text-center text-sm text-muted-foreground md:text-left">
              Hecho con amor para pequeños negocios de LATAM
            </p>
          </div>

          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            <Link 
              href="#caracteristicas" 
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Características
            </Link>
            <Link 
              href="#precios" 
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Precios
            </Link>
            <Link 
              href="#faq" 
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              FAQ
            </Link>
            <Link 
              href="/login" 
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Iniciar sesión
            </Link>
          </nav>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CatalogPro. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
