// CatalogPro Plan Configuration
// Single source of truth for all plan limits and features

import type { BusinessPlan } from './mock-data'
export type PlanId = BusinessPlan

export interface PlanConfig {
  id: BusinessPlan
  displayName: string
  monthlyPrice: number
  maxProducts: number | null // null = unlimited
  maxCategories: number | null // null = unlimited
  maxEditors: number | null // null = unlimited
  hasAnalytics: boolean
  analyticsDays: number | null // null = unlimited
  hasShareTracking: boolean
  hasCustomTemplate: boolean
  showBranding: boolean
  isPermanent: boolean
  features: string[]
  color: string
  textColor: string
  badgeClass: string
}

export const planConfigs: Record<BusinessPlan, PlanConfig> = {
  free: {
    id: 'free',
    displayName: 'Free',
    monthlyPrice: 0,
    maxProducts: 10,
    maxCategories: 1,
    maxEditors: 0,
    hasAnalytics: false,
    analyticsDays: null,
    hasShareTracking: false,
    hasCustomTemplate: false,
    showBranding: true,
    isPermanent: true,
    features: [
      'Hasta 10 productos',
      '1 categoría',
      'Catálogo público',
      'Botón de WhatsApp',
    ],
    color: '#F1F5F9',
    textColor: '#475569',
    badgeClass: 'bg-[#F1F5F9] text-[#475569]',
  },
  basico: {
    id: 'basico',
    displayName: 'Básico',
    monthlyPrice: 9,
    maxProducts: 50,
    maxCategories: 5,
    maxEditors: 1,
    hasAnalytics: true,
    analyticsDays: 30,
    hasShareTracking: false,
    hasCustomTemplate: true,
    showBranding: false,
    isPermanent: false,
    features: [
      'Hasta 50 productos',
      'Hasta 5 categorías',
      'Sin marca CatalogPro',
      'Analíticas básicas (30 días)',
      '1 editor asistente',
      'Mensaje WhatsApp personalizado',
    ],
    color: '#DBEAFE',
    textColor: '#1D4ED8',
    badgeClass: 'bg-[#DBEAFE] text-[#1D4ED8]',
  },
  pro: {
    id: 'pro',
    displayName: 'Pro',
    monthlyPrice: 19,
    maxProducts: null,
    maxCategories: null,
    maxEditors: 3,
    hasAnalytics: true,
    analyticsDays: 90,
    hasShareTracking: true,
    hasCustomTemplate: true,
    showBranding: false,
    isPermanent: false,
    features: [
      'Productos ilimitados',
      'Categorías ilimitadas',
      'Sin marca CatalogPro',
      'Analíticas completas (90 días)',
      'Seguimiento de compartidos',
      '3 editores asistentes',
      'Mensaje WhatsApp personalizado',
    ],
    color: '#EDE9FE',
    textColor: '#6D28D9',
    badgeClass: 'bg-[#EDE9FE] text-[#6D28D9]',
  },
  founders: {
    id: 'founders',
    displayName: 'Founders',
    monthlyPrice: 0,
    maxProducts: null,
    maxCategories: null,
    maxEditors: null,
    hasAnalytics: true,
    analyticsDays: null,
    hasShareTracking: true,
    hasCustomTemplate: true,
    showBranding: false,
    isPermanent: true,
    features: [
      'Todo en Pro',
      'Permanente y gratis',
      'Editores ilimitados',
      'Analíticas sin límite',
      'Insignia Founder exclusiva',
      'Soporte prioritario',
    ],
    color: '#FEF3C7',
    textColor: '#D97706',
    badgeClass: 'bg-[#FEF3C7] text-[#D97706]',
  },
}

export function getPlanConfig(plan: BusinessPlan): PlanConfig {
  return planConfigs[plan]
}

export function canAddProduct(plan: BusinessPlan, currentCount: number): boolean {
  const config = planConfigs[plan]
  return config.maxProducts === null || currentCount < config.maxProducts
}

export function canAddCategory(plan: BusinessPlan, currentCount: number): boolean {
  const config = planConfigs[plan]
  return config.maxCategories === null || currentCount < config.maxCategories
}

export function canAddEditor(plan: BusinessPlan, currentCount: number): boolean {
  const config = planConfigs[plan]
  if (config.maxEditors === null) return true
  if (config.maxEditors === 0) return false
  return currentCount < config.maxEditors
}

export function getUpgradePlan(currentPlan: BusinessPlan): BusinessPlan | null {
  switch (currentPlan) {
    case 'free':
      return 'basico'
    case 'basico':
      return 'pro'
    case 'pro':
    case 'founders':
      return null
  }
}

export function formatPrice(price: number): string {
  if (price === 0) return '$0'
  return `$${price}`
}

export function getDaysRemaining(expiresAt: Date | null): number | null {
  if (!expiresAt) return null
  const now = new Date()
  const diff = expiresAt.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getSubscriptionStatusColor(daysRemaining: number | null, isPermanent: boolean): string {
  if (isPermanent) return 'text-[#D97706]' // Gold for founders/permanent
  if (daysRemaining === null) return 'text-muted-foreground'
  if (daysRemaining <= 0) return 'text-[#EF4444]' // Red - expired
  if (daysRemaining <= 7) return 'text-[#EF4444]' // Red - critical
  if (daysRemaining <= 15) return 'text-[#F59E0B]' // Amber - warning
  return 'text-[#22C55E]' // Green - healthy
}

export function getSubscriptionStatusBgColor(daysRemaining: number | null, isPermanent: boolean): string {
  if (isPermanent) return 'bg-[#FEF3C7]'
  if (daysRemaining === null) return 'bg-muted'
  if (daysRemaining <= 0) return 'bg-red-50'
  if (daysRemaining <= 7) return 'bg-red-50'
  if (daysRemaining <= 15) return 'bg-amber-50'
  return 'bg-green-50'
}

export const PLAN_ORDER: BusinessPlan[] = ['free', 'basico', 'pro']

export const MONTHS_OPTIONS = [1, 2, 3, 4, 5, 6, 9, 12]

export const PAYMENT_METHODS = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'otro', label: 'Otro' },
]

export const BUSINESS_CATEGORIES = [
  { value: 'ropa', label: 'Ropa y Moda' },
  { value: 'comida', label: 'Comida y Restaurantes' },
  { value: 'electronica', label: 'Electrónica' },
  { value: 'belleza', label: 'Belleza y Cuidado Personal' },
  { value: 'hogar', label: 'Hogar y Decoración' },
  { value: 'servicios', label: 'Servicios' },
  { value: 'otro', label: 'Otro' },
]

export const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'DOP', label: 'DOP (RD$)', symbol: 'RD$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'MXN', label: 'MXN ($)', symbol: '$' },
  { value: 'COP', label: 'COP ($)', symbol: '$' },
]

export function formatCurrency(amount: number, currency: string): string {
  const currencyConfig = CURRENCY_OPTIONS.find(c => c.value === currency)
  const symbol = currencyConfig?.symbol || '$'
  return `${symbol}${amount.toFixed(2)}`
}
