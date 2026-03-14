'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CatalogProLogo } from '@/components/catalog-pro-logo'

export function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <CatalogProLogo className="h-8 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          <Link 
            href="#caracteristicas" 
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Características
          </Link>
          <Link 
            href="#precios" 
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Precios
          </Link>
          <Link 
            href="#faq" 
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            FAQ
          </Link>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" asChild>
            <Link href="/login">Iniciar sesión</Link>
          </Button>
          <Button asChild className="bg-[#25D366] text-white hover:bg-[#22C55E]">
            <Link href="/registro">Crear cuenta gratis</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-foreground md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link 
              href="#caracteristicas" 
              className="text-sm font-medium text-muted-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Características
            </Link>
            <Link 
              href="#precios" 
              className="text-sm font-medium text-muted-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Precios
            </Link>
            <Link 
              href="#faq" 
              className="text-sm font-medium text-muted-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </Link>
            <div className="flex flex-col gap-2 pt-4">
              <Button variant="outline" asChild className="w-full">
                <Link href="/login">Iniciar sesión</Link>
              </Button>
              <Button asChild className="w-full bg-[#25D366] text-white hover:bg-[#22C55E]">
                <Link href="/registro">Crear cuenta gratis</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
