'use client'

import { useEffect } from 'react'
import { trackAnalyticsEvent } from '@/app/actions/analytics'

interface CatalogAnalyticsProps {
  businessId: string
  referrer: string | null
}

export function CatalogAnalytics({ businessId, referrer }: CatalogAnalyticsProps) {
  useEffect(() => {
    // Check if we've already tracked this view in this session
    const sessionKey = `catalog_view_${businessId}`
    const hasTracked = sessionStorage.getItem(sessionKey)
    
    if (!hasTracked) {
      // Track catalog view
      trackAnalyticsEvent(businessId, 'catalog_view')
      sessionStorage.setItem(sessionKey, 'true')
      
      // If referred from WhatsApp, also track that
      if (referrer === 'whatsapp') {
        trackAnalyticsEvent(businessId, 'catalog_share_open', undefined, 'whatsapp')
      }
    }
  }, [businessId, referrer])

  // This component doesn't render anything
  return null
}
