import { cn } from '@/lib/utils'

interface CatalogProLogoProps {
  className?: string
  variant?: 'default' | 'white'
  iconOnly?: boolean
}

export function CatalogProLogo({ className, variant = 'default', iconOnly = false }: CatalogProLogoProps) {
  const textColor = variant === 'white' ? 'text-white' : 'text-[#0F172A]'
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#25D366]">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-white"
        >
          <path
            d="M4 6H20M4 12H20M4 18H14"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="19"
            cy="18"
            r="3"
            stroke="currentColor"
            strokeWidth="2"
            fill="currentColor"
          />
        </svg>
      </div>
      {!iconOnly && (
        <span className={cn('text-xl font-bold', textColor)}>
          Catalog<span className="text-[#25D366]">Pro</span>
        </span>
      )}
    </div>
  )
}
