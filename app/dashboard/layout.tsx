'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardMobileNav } from '@/components/dashboard/mobile-nav'
import { DashboardHeader } from '@/components/dashboard/header'
import { SubscriptionWarning } from '@/components/dashboard/subscription-warning'
import { SubscriptionExpiredOverlay } from '@/components/dashboard/subscription-expired-overlay'
import { type User, type Business } from '@/lib/mock-data'
import { getPlanConfig, getDaysRemaining } from '@/lib/plans'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  useEffect(() => {
    async function loadSession() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      // Fetch user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (userError || !userData) {
        console.error('Error fetching user:', userError)
        router.push('/login')
        return
      }

      const user = userData

      // Redirect admins to admin panel
      if (user.role === 'super_admin' || user.role === 'admin') {
        router.push('/admin')
        return
      }

      if (!user.business_id) {
        router.push('/registro')
        return
      }

      // Fetch business data
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', user.business_id)
        .single()

      if (businessError || !businessData) {
        console.error('Error fetching business:', businessError)
        router.push('/registro')
        return
      }

      const business = businessData

      // Check subscription status
      if (business.subscription_status === 'suspended') {
        router.push('/suspended')
        return
      }

      // Editors can't access certain pages when expired
      if (user.role === 'editor' && business.subscription_status === 'expired') {
        router.push('/suscripcion-vencida')
        return
      }

      // Map snake_case DB fields to camelCase expected by components
      setCurrentUser({
        ...user,
        fullName: user.full_name,
        businessId: user.business_id
      } as any)
      
      setCurrentBusiness({
        ...business,
        businessCategory: business.business_category,
        whatsappNumber: business.whatsapp_number,
        subscriptionStatus: business.subscription_status,
        subscriptionExpiresAt: business.subscription_expires_at,
        logoUrl: business.logo_url,
        accentColor: business.accent_color,
        whatsappMessageTemplate: business.whatsapp_message_template,
      } as any)
      
      setIsLoading(false)
    }

    loadSession()
  }, [router, pathname])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#25D366] border-t-transparent" />
      </div>
    )
  }

  if (!currentUser || !currentBusiness) {
    return null
  }

  const planConfig = getPlanConfig(currentBusiness.plan)
  const daysRemaining = getDaysRemaining(currentBusiness.subscriptionExpiresAt)
  const showExpiredOverlay = currentBusiness.subscriptionStatus === 'expired' && currentUser.role === 'owner'

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Desktop Sidebar */}
      <DashboardSidebar 
        user={currentUser} 
        business={currentBusiness}
        planConfig={planConfig}
        daysRemaining={daysRemaining}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content */}
      <div className={cn("flex flex-1 flex-col transition-all duration-300", isSidebarCollapsed ? "lg:ml-20" : "lg:ml-60")}>
        <DashboardHeader 
          user={currentUser} 
          business={currentBusiness}
        />
        
        <SubscriptionWarning 
          business={currentBusiness}
          daysRemaining={daysRemaining}
          planConfig={planConfig}
        />

        <main className="flex-1 p-4 pb-24 lg:p-8 lg:pb-8">
          {showExpiredOverlay ? (
            <SubscriptionExpiredOverlay business={currentBusiness} />
          ) : (
            children
          )}
        </main>

        {/* Mobile Bottom Nav */}
        <DashboardMobileNav />
      </div>
    </div>
  )
}
