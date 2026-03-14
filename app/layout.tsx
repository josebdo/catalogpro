import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CatalogPro — Tu catálogo profesional por WhatsApp',
  description: 'Crea tu catálogo digital profesional y compártelo por WhatsApp. Ideal para pequeños negocios en LATAM.',
  generator: 'CatalogPro',
  keywords: ['catálogo digital', 'WhatsApp', 'pequeños negocios', 'LATAM', 'tienda online'],
  authors: [{ name: 'CatalogPro' }],
  openGraph: {
    title: 'CatalogPro — Tu catálogo profesional por WhatsApp',
    description: 'Crea tu catálogo digital profesional y compártelo por WhatsApp. Ideal para pequeños negocios en LATAM.',
    type: 'website',
    locale: 'es_LA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CatalogPro — Tu catálogo profesional por WhatsApp',
    description: 'Crea tu catálogo digital profesional y compártelo por WhatsApp.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0F172A',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={plusJakartaSans.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        {children}
        <Toaster position="bottom-right" />
        <Analytics />
      </body>
    </html>
  )
}
