'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Category } from '@/lib/mock-data'

interface CatalogCategoriesProps {
  categories: Category[]
  selectedCategory: string | null
  accentColor: string
  slug: string
}

export function CatalogCategories({ 
  categories, 
  selectedCategory, 
  accentColor,
  slug 
}: CatalogCategoriesProps) {
  if (categories.length === 0) return null

  return (
    <nav className="sticky top-0 z-10 -mx-4 mb-6 bg-[#F8FAFC] px-4 py-3">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <Link
          href={`/${slug}`}
          className={cn(
            'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
            !selectedCategory
              ? 'text-white'
              : 'border border-border bg-white text-muted-foreground hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]'
          )}
          style={!selectedCategory ? { backgroundColor: accentColor } : undefined}
        >
          Todos
        </Link>
        
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/${slug}?category=${category.id}`}
            className={cn(
              'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
              selectedCategory === category.id
                ? 'text-white'
                : 'border border-border bg-white text-muted-foreground hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]'
            )}
            style={selectedCategory === category.id ? { backgroundColor: accentColor } : undefined}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </nav>
  )
}
