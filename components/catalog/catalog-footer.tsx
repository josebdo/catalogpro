import Link from 'next/link'

export function CatalogFooter() {
  return (
    <footer className="mt-12 border-t border-border pt-6 text-center">
      <p className="text-xs text-muted-foreground">
        Catálogo digital creado con{' '}
        <Link 
          href="/" 
          className="font-medium text-[#25D366] hover:underline"
          target="_blank"
        >
          CatalogPro
        </Link>
      </p>
    </footer>
  )
}
