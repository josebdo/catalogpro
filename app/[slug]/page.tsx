import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPlanConfig } from '@/lib/plans'
import { CatalogHeader } from '@/components/catalog/catalog-header'
import { CatalogCategories } from '@/components/catalog/catalog-categories'
import { CatalogProducts } from '@/components/catalog/catalog-products'
import { CatalogFooter } from '@/components/catalog/catalog-footer'
import { CatalogAnalytics } from '@/components/catalog/catalog-analytics'
import { createClient } from '@/lib/supabase/server'
import { Product, Category } from '@/lib/mock-data'

interface CatalogPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ ref?: string; category?: string }>
}

export async function generateMetadata({ params }: CatalogPageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: business } = await supabase
    .from('businesses')
    .select('name, description, logo_url')
    .eq('slug', slug)
    .single()
  
  if (!business) {
    return {
      title: 'Catálogo no encontrado',
    }
  }

  return {
    title: `${business.name} — Catálogo`,
    description: business.description || `Catálogo de productos de ${business.name}`,
    openGraph: {
      title: `${business.name} — Catálogo`,
      description: business.description || `Catálogo de productos de ${business.name}`,
      type: 'website',
      images: business.logo_url ? [business.logo_url] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${business.name} — Catálogo`,
      description: business.description || `Catálogo de productos de ${business.name}`,
    },
  }
}

export default async function CatalogPage({ params, searchParams }: CatalogPageProps) {
  const { slug } = await params
  const { ref, category } = await searchParams
  
  const supabase = await createClient()

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (!business || !business.is_active) {
    notFound()
  }

  // Check if subscription is valid (active or grace period)
  // Assuming in realistic DB setups this is checked. Will assume true for simplified flow right now or read from 'status' if we added it.
  const planConfig = getPlanConfig(business.plan)

  const { data: products } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('business_id', business.id)
    .eq('is_available', true)
    
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('business_id', business.id)
    .order('sort_order', { ascending: true })

  // Transform db records to match the component interfaces
  const formattedProducts: Product[] = (products || []).map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    currency: p.currency,
    imageUrl: p.image_url,
    categoryId: p.category_id,
    isFeatured: p.is_featured,
    isAvailable: p.is_available,
    sortOrder: p.sort_order,
    categoryName: p.categories?.name,
    businessId: p.business_id,
    createdAt: new Date(p.created_at || Date.now()),
    updatedAt: new Date(p.created_at || Date.now())
  }))

  const formattedCategories: Category[] = (categories || []).map(c => ({
    id: c.id,
    name: c.name,
    businessId: c.business_id,
    sortOrder: c.sort_order,
    createdAt: new Date(c.created_at || Date.now()),
    updatedAt: new Date(c.created_at || Date.now())
  }))

  const finalBusiness = {
    ...business,
    accentColor: business.accent_color,
    logoUrl: business.logo_url,
    coverUrl: business.cover_url,
    whatsappNumber: business.whatsapp_number
  }

  // Filter products by category if specified
  const filteredProducts = category 
    ? formattedProducts.filter(p => p.categoryId === category)
    : formattedProducts

  // Sort products: featured first, then by sort order
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1
    if (!a.isFeatured && b.isFeatured) return 1
    return a.sortOrder - b.sortOrder
  })

  return (
    <div 
      className="min-h-screen bg-[#F8FAFC]"
      style={{ '--accent-color': finalBusiness.accentColor || '#25D366' } as React.CSSProperties}
    >
      <CatalogAnalytics 
        businessId={finalBusiness.id} 
        referrer={ref || null} 
      />
      
      <div className="mx-auto max-w-[480px] px-4 py-6">
        <CatalogHeader business={finalBusiness} />
        
        <CatalogCategories 
          categories={formattedCategories} 
          selectedCategory={category || null}
          accentColor={finalBusiness.accentColor || '#25D366'}
          slug={finalBusiness.slug}
        />
        
        <CatalogProducts 
          products={sortedProducts}
          business={finalBusiness}
        />
        
        {planConfig.showBranding && <CatalogFooter />}
      </div>
    </div>
  )
}
