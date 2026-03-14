'use client'

import Link from 'next/link'
import { AlertTriangle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Business } from '@/lib/mock-data'
import type { PlanConfig } from '@/lib/plans'

interface SubscriptionWarningProps {
  business: Business
  daysRemaining: number | null
  planConfig: PlanConfig
}

export function SubscriptionWarning({ 
  business, 
  daysRemaining,
  planConfig 
}: SubscriptionWarningProps) {
  // Don't show for permanent plans (Free and Founders)
  if (planConfig.isPermanent) return null
  
  // Don't show if more than 15 days remaining
  if (daysRemaining !== null && daysRemaining > 15) return null

  const isGracePeriod = business.subscriptionStatus === 'grace_period'
  const isWarning = daysRemaining !== null && daysRemaining <= 15 && daysRemaining > 7
  const isCritical = daysRemaining !== null && daysRemaining <= 7

  if (!isGracePeriod && !isWarning && !isCritical) return null

  return (
    <div 
      className={cn(
        'flex items-center justify-between gap-4 px-4 py-3 text-sm lg:px-8',
        isGracePeriod || isCritical 
          ? 'bg-red-50 text-red-700' 
          : 'bg-amber-50 text-amber-700'
      )}
    >
      <div className="flex items-center gap-2">
        {isGracePeriod ? (
          <>
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              Tu suscripción venció. Tienes{' '}
              <strong>{3 + (daysRemaining || 0)} días</strong> para renovar.
            </span>
          </>
        ) : (
          <>
            <Clock className="h-4 w-4 shrink-0" />
            <span>
              Tu suscripción vence en <strong>{daysRemaining} días</strong>.
            </span>
          </>
        )}
      </div>
      <Link 
        href="/dashboard/billing"
        className="shrink-0 font-medium underline hover:no-underline"
      >
        Renovar ahora
      </Link>
    </div>
  )
}
