import { LandingNavbar } from '@/components/landing/navbar'
import { LandingHero } from '@/components/landing/hero'
import { LandingProblem } from '@/components/landing/problem'
import { LandingHowItWorks } from '@/components/landing/how-it-works'
import { LandingFeatures } from '@/components/landing/features'
import { LandingPricing } from '@/components/landing/pricing'
import { LandingTestimonials } from '@/components/landing/testimonials'
import { LandingFAQ } from '@/components/landing/faq'
import { LandingCTA } from '@/components/landing/cta'
import { LandingFooter } from '@/components/landing/footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <main>
        <LandingHero />
        <LandingProblem />
        <LandingHowItWorks />
        <LandingFeatures />
        <LandingPricing />
        <LandingTestimonials />
        <LandingFAQ />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  )
}
