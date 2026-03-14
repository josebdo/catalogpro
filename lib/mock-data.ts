// CatalogPro Mock Data
// All data for development without database

export type UserRole = 'super_admin' | 'admin' | 'owner' | 'editor'
export type BusinessPlan = 'free' | 'basico' | 'pro' | 'founders'
export type SubscriptionStatus = 'active' | 'grace_period' | 'expired' | 'suspended'
export type EventType = 'catalog_view' | 'whatsapp_click' | 'catalog_share_open'
export type PaymentMethod = 'efectivo' | 'transferencia' | 'otro'

export interface User {
  id: string
  email: string
  fullName: string
  role: UserRole
  businessId: string | null
  avatarUrl: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Business {
  id: string
  name: string
  slug: string
  description: string | null
  logoUrl: string | null
  accentColor: string
  whatsappNumber: string | null
  whatsappMessageTemplate: string
  businessCategory: string
  plan: BusinessPlan
  subscriptionStatus: SubscriptionStatus
  subscriptionExpiresAt: Date | null
  isActive: boolean
  ownerId: string
  settings: {
    showPrices: boolean
    showCategories: boolean
    enableSearch: boolean
    gridView: boolean
    currency: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  businessId: string
  name: string
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  businessId: string
  categoryId: string | null
  name: string
  description: string | null
  price: number
  currency: string
  imageUrl: string | null
  isAvailable: boolean
  isFeatured: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface AnalyticsEvent {
  id: string
  businessId: string
  productId: string | null
  eventType: EventType
  referrer: string | null
  createdAt: Date
}

export interface SubscriptionHistory {
  id: string
  businessId: string
  renewedBy: string
  plan: BusinessPlan
  monthsAdded: number
  validFrom: Date
  validUntil: Date | null
  paymentMethod: PaymentMethod
  note: string | null
  createdAt: Date
}

export interface Invitation {
  id: string
  businessId: string
  invitedEmail: string
  role: string
  token: string
  accepted: boolean
  expiresAt: Date
  createdAt: Date
}

export interface SupportNote {
  id: string
  businessId: string
  authorId: string
  note: string
  createdAt: Date
}

// User IDs
const SUPER_ADMIN_ID = '00000000-0000-0000-0000-000000000001'
const ADMIN_ID = '00000000-0000-0000-0000-000000000002'
const OWNER1_ID = '00000000-0000-0000-0000-000000000003'
const OWNER2_ID = '00000000-0000-0000-0000-000000000004'
const OWNER3_ID = '00000000-0000-0000-0000-000000000005'
const EDITOR1_ID = '00000000-0000-0000-0000-000000000006'

// Business IDs
const BUSINESS1_ID = '00000000-0000-0000-0000-000000000010'
const BUSINESS2_ID = '00000000-0000-0000-0000-000000000011'
const BUSINESS3_ID = '00000000-0000-0000-0000-000000000012'

// Category IDs
const CAT_ROPA = '00000000-0000-0000-0000-000000000020'
const CAT_ACCES = '00000000-0000-0000-0000-000000000021'
const CAT_OFERTAS = '00000000-0000-0000-0000-000000000022'
const CAT_ALMUERZO = '00000000-0000-0000-0000-000000000023'
const CAT_GADGETS = '00000000-0000-0000-0000-000000000024'

// Helper to generate dates
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000)
const daysFromNow = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000)

export const users: User[] = [
  {
    id: SUPER_ADMIN_ID,
    email: 'admin@catalogpro.com',
    fullName: 'Super Admin',
    role: 'super_admin',
    businessId: null,
    avatarUrl: null,
    isActive: true,
    createdAt: daysAgo(180),
    updatedAt: daysAgo(1),
  },
  {
    id: ADMIN_ID,
    email: 'soporte@catalogpro.com',
    fullName: 'Carlos Soporte',
    role: 'admin',
    businessId: null,
    avatarUrl: null,
    isActive: true,
    createdAt: daysAgo(150),
    updatedAt: daysAgo(1),
  },
  {
    id: OWNER1_ID,
    email: 'elena@modaelena.com',
    fullName: 'Elena Martínez',
    role: 'owner',
    businessId: BUSINESS1_ID,
    avatarUrl: null,
    isActive: true,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(1),
  },
  {
    id: OWNER2_ID,
    email: 'carlos@saboresdelnorte.com',
    fullName: 'Carlos Díaz',
    role: 'owner',
    businessId: BUSINESS2_ID,
    avatarUrl: null,
    isActive: true,
    createdAt: daysAgo(60),
    updatedAt: daysAgo(1),
  },
  {
    id: OWNER3_ID,
    email: 'founders@test.com',
    fullName: 'María Founders',
    role: 'owner',
    businessId: BUSINESS3_ID,
    avatarUrl: null,
    isActive: true,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(1),
  },
  {
    id: EDITOR1_ID,
    email: 'asistente@modaelena.com',
    fullName: 'Ana Editora',
    role: 'editor',
    businessId: BUSINESS1_ID,
    avatarUrl: null,
    isActive: true,
    createdAt: daysAgo(45),
    updatedAt: daysAgo(1),
  },
]

export const businesses: Business[] = [
  {
    id: BUSINESS1_ID,
    name: 'Moda Elena',
    slug: 'moda-elena',
    description: 'Ropa y accesorios para mujer. Moda actual a precios accesibles.',
    logoUrl: null,
    accentColor: '#E91E8C',
    whatsappNumber: '+18091234567',
    whatsappMessageTemplate: 'Hola! Me interesa este producto: {product_name} - Precio: {product_price}',
    businessCategory: 'ropa',
    plan: 'pro',
    subscriptionStatus: 'active',
    subscriptionExpiresAt: daysFromNow(60),
    isActive: true,
    ownerId: OWNER1_ID,
    settings: {
      showPrices: true,
      showCategories: true,
      enableSearch: true,
      gridView: true,
      currency: 'USD'
    },
    createdAt: daysAgo(90),
    updatedAt: daysAgo(1),
  },
  {
    id: BUSINESS2_ID,
    name: 'Sabores del Norte',
    slug: 'sabores-del-norte',
    description: 'Comida casera dominicana. Almuerzos frescos todos los días.',
    logoUrl: null,
    accentColor: '#FF6B35',
    whatsappNumber: '+18097654321',
    whatsappMessageTemplate: 'Hola! Me interesa este producto: {product_name} - Precio: {product_price}',
    businessCategory: 'comida',
    plan: 'free',
    subscriptionStatus: 'active',
    subscriptionExpiresAt: null,
    isActive: true,
    ownerId: OWNER2_ID,
    settings: {
      showPrices: true,
      showCategories: true,
      enableSearch: false,
      gridView: false,
      currency: 'USD'
    },
    createdAt: daysAgo(60),
    updatedAt: daysAgo(1),
  },
  {
    id: BUSINESS3_ID,
    name: 'Tech Founders Store',
    slug: 'founders-test',
    description: 'Gadgets y tecnología para el hogar y la oficina.',
    logoUrl: null,
    accentColor: '#6366F1',
    whatsappNumber: '+18095559999',
    whatsappMessageTemplate: 'Hola! Me interesa este producto: {product_name} - Precio: {product_price}',
    businessCategory: 'electronica',
    plan: 'founders',
    subscriptionStatus: 'active',
    subscriptionExpiresAt: null,
    isActive: true,
    ownerId: OWNER3_ID,
    settings: {
      showPrices: true,
      showCategories: true,
      enableSearch: true,
      gridView: true,
      currency: 'USD'
    },
    createdAt: daysAgo(30),
    updatedAt: daysAgo(1),
  },
]

export const categories: Category[] = [
  { id: CAT_ROPA, businessId: BUSINESS1_ID, name: 'Ropa de mujer', sortOrder: 1, createdAt: daysAgo(89), updatedAt: daysAgo(1) },
  { id: CAT_ACCES, businessId: BUSINESS1_ID, name: 'Accesorios', sortOrder: 2, createdAt: daysAgo(89), updatedAt: daysAgo(1) },
  { id: CAT_OFERTAS, businessId: BUSINESS1_ID, name: 'Ofertas', sortOrder: 3, createdAt: daysAgo(89), updatedAt: daysAgo(1) },
  { id: CAT_ALMUERZO, businessId: BUSINESS2_ID, name: 'Almuerzos', sortOrder: 1, createdAt: daysAgo(59), updatedAt: daysAgo(1) },
  { id: CAT_GADGETS, businessId: BUSINESS3_ID, name: 'Gadgets', sortOrder: 1, createdAt: daysAgo(29), updatedAt: daysAgo(1) },
]

export const products: Product[] = [
  // Moda Elena Products (9)
  { id: 'p001', businessId: BUSINESS1_ID, categoryId: CAT_ROPA, name: 'Blusa floral manga larga', description: 'Tela liviana, tallas S-M-L.', price: 18.99, currency: 'USD', imageUrl: 'https://picsum.photos/seed/me01/400/400', isAvailable: true, isFeatured: true, sortOrder: 1, createdAt: daysAgo(85), updatedAt: daysAgo(1) },
  { id: 'p002', businessId: BUSINESS1_ID, categoryId: CAT_ROPA, name: 'Vestido casual verano', description: 'Fresco y cómodo para cualquier ocasión.', price: 32.00, currency: 'USD', imageUrl: 'https://picsum.photos/seed/me02/400/400', isAvailable: true, isFeatured: true, sortOrder: 2, createdAt: daysAgo(84), updatedAt: daysAgo(1) },
  { id: 'p003', businessId: BUSINESS1_ID, categoryId: CAT_ROPA, name: 'Jeans tiro alto skinny', description: 'Alta calidad con elástico en cintura.', price: 28.50, currency: 'USD', imageUrl: 'https://picsum.photos/seed/me03/400/400', isAvailable: true, isFeatured: false, sortOrder: 3, createdAt: daysAgo(83), updatedAt: daysAgo(1) },
  { id: 'p004', businessId: BUSINESS1_ID, categoryId: CAT_ROPA, name: 'Conjunto deportivo', description: 'Top y licra a juego, tela transpirable.', price: 24.00, currency: 'USD', imageUrl: 'https://picsum.photos/seed/me04/400/400', isAvailable: false, isFeatured: false, sortOrder: 4, createdAt: daysAgo(82), updatedAt: daysAgo(1) },
  { id: 'p005', businessId: BUSINESS1_ID, categoryId: CAT_ACCES, name: 'Bolso de cuero sintético', description: 'Varios compartimentos, negro y café.', price: 22.99, currency: 'USD', imageUrl: 'https://picsum.photos/seed/me05/400/400', isAvailable: true, isFeatured: true, sortOrder: 5, createdAt: daysAgo(81), updatedAt: daysAgo(1) },
  { id: 'p006', businessId: BUSINESS1_ID, categoryId: CAT_ACCES, name: 'Aretes dorados largos', description: 'Elegantes, bañados en oro 18k.', price: 8.50, currency: 'USD', imageUrl: 'https://picsum.photos/seed/me06/400/400', isAvailable: true, isFeatured: false, sortOrder: 6, createdAt: daysAgo(80), updatedAt: daysAgo(1) },
  { id: 'p007', businessId: BUSINESS1_ID, categoryId: CAT_ACCES, name: 'Pulsera tejida multicolor', description: 'Artesanal, hecha a mano.', price: 5.00, currency: 'USD', imageUrl: 'https://picsum.photos/seed/me07/400/400', isAvailable: true, isFeatured: false, sortOrder: 7, createdAt: daysAgo(79), updatedAt: daysAgo(1) },
  { id: 'p008', businessId: BUSINESS1_ID, categoryId: CAT_OFERTAS, name: 'Blusa básica algodón 2x1', description: 'Lleva 2 blusas por el precio de 1.', price: 12.00, currency: 'USD', imageUrl: 'https://picsum.photos/seed/me08/400/400', isAvailable: true, isFeatured: false, sortOrder: 8, createdAt: daysAgo(78), updatedAt: daysAgo(1) },
  { id: 'p009', businessId: BUSINESS1_ID, categoryId: CAT_OFERTAS, name: 'Falda floral liquidación', description: 'Últimas unidades, descuento 40%.', price: 10.99, currency: 'USD', imageUrl: 'https://picsum.photos/seed/me09/400/400', isAvailable: true, isFeatured: false, sortOrder: 9, createdAt: daysAgo(77), updatedAt: daysAgo(1) },
  
  // Sabores del Norte Products (8)
  { id: 'p010', businessId: BUSINESS2_ID, categoryId: CAT_ALMUERZO, name: 'Pollo guisado con arroz', description: 'Con habichuelas y ensalada.', price: 6.50, currency: 'USD', imageUrl: 'https://picsum.photos/seed/sn01/400/400', isAvailable: true, isFeatured: true, sortOrder: 1, createdAt: daysAgo(55), updatedAt: daysAgo(1) },
  { id: 'p011', businessId: BUSINESS2_ID, categoryId: CAT_ALMUERZO, name: 'Res guisada', description: 'Con papas, arroz y tostones.', price: 7.50, currency: 'USD', imageUrl: 'https://picsum.photos/seed/sn02/400/400', isAvailable: true, isFeatured: true, sortOrder: 2, createdAt: daysAgo(54), updatedAt: daysAgo(1) },
  { id: 'p012', businessId: BUSINESS2_ID, categoryId: CAT_ALMUERZO, name: 'Pescado frito', description: 'Fresco del día, con ensalada.', price: 8.00, currency: 'USD', imageUrl: 'https://picsum.photos/seed/sn03/400/400', isAvailable: true, isFeatured: false, sortOrder: 3, createdAt: daysAgo(53), updatedAt: daysAgo(1) },
  { id: 'p013', businessId: BUSINESS2_ID, categoryId: CAT_ALMUERZO, name: 'Cerdo asado', description: 'Marinado lentamente, con aguacate.', price: 7.00, currency: 'USD', imageUrl: 'https://picsum.photos/seed/sn04/400/400', isAvailable: true, isFeatured: false, sortOrder: 4, createdAt: daysAgo(52), updatedAt: daysAgo(1) },
  { id: 'p014', businessId: BUSINESS2_ID, categoryId: CAT_ALMUERZO, name: 'Sancocho especial', description: 'Tres carnes, solo viernes y sábados.', price: 9.00, currency: 'USD', imageUrl: 'https://picsum.photos/seed/sn05/400/400', isAvailable: true, isFeatured: true, sortOrder: 5, createdAt: daysAgo(51), updatedAt: daysAgo(1) },
  { id: 'p015', businessId: BUSINESS2_ID, categoryId: CAT_ALMUERZO, name: 'Moro de guandules', description: 'Con coco y longaniza.', price: 3.00, currency: 'USD', imageUrl: 'https://picsum.photos/seed/sn06/400/400', isAvailable: true, isFeatured: false, sortOrder: 6, createdAt: daysAgo(50), updatedAt: daysAgo(1) },
  { id: 'p016', businessId: BUSINESS2_ID, categoryId: CAT_ALMUERZO, name: 'Tostones con ajo', description: 'Crujientes con salsa de ajo casera.', price: 2.50, currency: 'USD', imageUrl: 'https://picsum.photos/seed/sn07/400/400', isAvailable: true, isFeatured: false, sortOrder: 7, createdAt: daysAgo(49), updatedAt: daysAgo(1) },
  { id: 'p017', businessId: BUSINESS2_ID, categoryId: CAT_ALMUERZO, name: 'Jugo natural del día', description: 'Chinola, tamarindo o parcha.', price: 1.50, currency: 'USD', imageUrl: 'https://picsum.photos/seed/sn08/400/400', isAvailable: false, isFeatured: false, sortOrder: 8, createdAt: daysAgo(48), updatedAt: daysAgo(1) },
  
  // Tech Founders Products (5)
  { id: 'p018', businessId: BUSINESS3_ID, categoryId: CAT_GADGETS, name: 'Auriculares Bluetooth Pro', description: 'Cancelación de ruido, 20h batería.', price: 45.00, currency: 'USD', imageUrl: 'https://picsum.photos/seed/tf01/400/400', isAvailable: true, isFeatured: true, sortOrder: 1, createdAt: daysAgo(25), updatedAt: daysAgo(1) },
  { id: 'p019', businessId: BUSINESS3_ID, categoryId: CAT_GADGETS, name: 'Cargador Inalámbrico 15W', description: 'Rápido, compatible iPhone y Android.', price: 28.00, currency: 'USD', imageUrl: 'https://picsum.photos/seed/tf02/400/400', isAvailable: true, isFeatured: true, sortOrder: 2, createdAt: daysAgo(24), updatedAt: daysAgo(1) },
  { id: 'p020', businessId: BUSINESS3_ID, categoryId: CAT_GADGETS, name: 'Soporte laptop aluminio', description: 'Ajustable, ergonómico.', price: 35.00, currency: 'USD', imageUrl: 'https://picsum.photos/seed/tf03/400/400', isAvailable: true, isFeatured: false, sortOrder: 3, createdAt: daysAgo(23), updatedAt: daysAgo(1) },
  { id: 'p021', businessId: BUSINESS3_ID, categoryId: CAT_GADGETS, name: 'Hub USB-C 7 en 1', description: 'HDMI 4K, USB-A x3, SD, 100W PD.', price: 55.00, currency: 'USD', imageUrl: 'https://picsum.photos/seed/tf04/400/400', isAvailable: true, isFeatured: false, sortOrder: 4, createdAt: daysAgo(22), updatedAt: daysAgo(1) },
  { id: 'p022', businessId: BUSINESS3_ID, categoryId: CAT_GADGETS, name: 'Webcam Full HD 1080p', description: 'Autofocus, micrófono integrado.', price: 42.00, currency: 'USD', imageUrl: 'https://picsum.photos/seed/tf05/400/400', isAvailable: false, isFeatured: false, sortOrder: 5, createdAt: daysAgo(21), updatedAt: daysAgo(1) },
]

export const subscriptionHistory: SubscriptionHistory[] = [
  {
    id: 'sh001',
    businessId: BUSINESS1_ID,
    renewedBy: ADMIN_ID,
    plan: 'basico',
    monthsAdded: 1,
    validFrom: daysAgo(90),
    validUntil: daysAgo(60),
    paymentMethod: 'efectivo',
    note: 'Primer pago. Plan Básico 1 mes.',
    createdAt: daysAgo(90),
  },
  {
    id: 'sh002',
    businessId: BUSINESS1_ID,
    renewedBy: SUPER_ADMIN_ID,
    plan: 'pro',
    monthsAdded: 2,
    validFrom: daysAgo(60),
    validUntil: daysFromNow(60),
    paymentMethod: 'transferencia',
    note: 'Upgrade a Pro. 2 meses adelantados.',
    createdAt: daysAgo(60),
  },
  {
    id: 'sh003',
    businessId: BUSINESS3_ID,
    renewedBy: SUPER_ADMIN_ID,
    plan: 'founders',
    monthsAdded: 0,
    validFrom: daysAgo(30),
    validUntil: null,
    paymentMethod: 'otro',
    note: 'Plan Founders asignado manualmente. Cliente beta #1.',
    createdAt: daysAgo(30),
  },
]

// Generate analytics events
function generateAnalyticsEvents(): AnalyticsEvent[] {
  const events: AnalyticsEvent[] = []
  let eventId = 1
  
  // Moda Elena - 780 views, 215 clicks, 185 share opens
  for (let i = 0; i < 780; i++) {
    events.push({
      id: `ae${String(eventId++).padStart(6, '0')}`,
      businessId: BUSINESS1_ID,
      productId: null,
      eventType: 'catalog_view',
      referrer: null,
      createdAt: daysAgo(Math.floor(Math.random() * 30)),
    })
  }
  
  const modaProducts = products.filter(p => p.businessId === BUSINESS1_ID)
  for (let i = 0; i < 215; i++) {
    const randomProduct = modaProducts[Math.floor(Math.random() * modaProducts.length)]
    events.push({
      id: `ae${String(eventId++).padStart(6, '0')}`,
      businessId: BUSINESS1_ID,
      productId: randomProduct.id,
      eventType: 'whatsapp_click',
      referrer: null,
      createdAt: daysAgo(Math.floor(Math.random() * 30)),
    })
  }
  
  for (let i = 0; i < 185; i++) {
    events.push({
      id: `ae${String(eventId++).padStart(6, '0')}`,
      businessId: BUSINESS1_ID,
      productId: null,
      eventType: 'catalog_share_open',
      referrer: 'whatsapp',
      createdAt: daysAgo(Math.floor(Math.random() * 30)),
    })
  }
  
  // Sabores del Norte - 270 views, 72 clicks, 48 share opens
  for (let i = 0; i < 270; i++) {
    events.push({
      id: `ae${String(eventId++).padStart(6, '0')}`,
      businessId: BUSINESS2_ID,
      productId: null,
      eventType: 'catalog_view',
      referrer: null,
      createdAt: daysAgo(Math.floor(Math.random() * 30)),
    })
  }
  
  const saboresProducts = products.filter(p => p.businessId === BUSINESS2_ID)
  for (let i = 0; i < 72; i++) {
    const randomProduct = saboresProducts[Math.floor(Math.random() * saboresProducts.length)]
    events.push({
      id: `ae${String(eventId++).padStart(6, '0')}`,
      businessId: BUSINESS2_ID,
      productId: randomProduct.id,
      eventType: 'whatsapp_click',
      referrer: null,
      createdAt: daysAgo(Math.floor(Math.random() * 30)),
    })
  }
  
  for (let i = 0; i < 48; i++) {
    events.push({
      id: `ae${String(eventId++).padStart(6, '0')}`,
      businessId: BUSINESS2_ID,
      productId: null,
      eventType: 'catalog_share_open',
      referrer: 'whatsapp',
      createdAt: daysAgo(Math.floor(Math.random() * 30)),
    })
  }
  
  // Tech Founders - 145 views, 38 clicks
  for (let i = 0; i < 145; i++) {
    events.push({
      id: `ae${String(eventId++).padStart(6, '0')}`,
      businessId: BUSINESS3_ID,
      productId: null,
      eventType: 'catalog_view',
      referrer: null,
      createdAt: daysAgo(Math.floor(Math.random() * 30)),
    })
  }
  
  const techProducts = products.filter(p => p.businessId === BUSINESS3_ID)
  for (let i = 0; i < 38; i++) {
    const randomProduct = techProducts[Math.floor(Math.random() * techProducts.length)]
    events.push({
      id: `ae${String(eventId++).padStart(6, '0')}`,
      businessId: BUSINESS3_ID,
      productId: randomProduct.id,
      eventType: 'whatsapp_click',
      referrer: null,
      createdAt: daysAgo(Math.floor(Math.random() * 30)),
    })
  }
  
  return events
}

export const analyticsEvents = generateAnalyticsEvents()

export const supportNotes: SupportNote[] = [
  {
    id: 'sn001',
    businessId: BUSINESS2_ID,
    authorId: ADMIN_ID,
    note: 'El dueño preguntó cómo agregar más de 10 productos. Se le explicó el plan Básico ($9/mes) que permite hasta 50 productos.',
    createdAt: daysAgo(15),
  },
]

export const mockUsers = users
export const mockCatalogs = businesses
export const mockSubscriptions = subscriptionHistory
export const mockProducts = products
export const mockCategories = categories
export const mockAnalytics = analyticsEvents

export const invitations: Invitation[] = []

// Helper functions
export function getBusinessBySlug(slug: string): Business | undefined {
  return businesses.find(b => b.slug === slug)
}

export function getProductsByBusinessId(businessId: string): Product[] {
  return products.filter(p => p.businessId === businessId)
}

export function getCategoriesByBusinessId(businessId: string): Category[] {
  return categories.filter(c => c.businessId === businessId)
}

export function getUserById(userId: string): User | undefined {
  return users.find(u => u.id === userId)
}

export function getBusinessById(businessId: string): Business | undefined {
  return businesses.find(b => b.id === businessId)
}

export function getAnalyticsByBusinessId(businessId: string, days: number = 30): AnalyticsEvent[] {
  const cutoff = daysAgo(days)
  return analyticsEvents.filter(e => e.businessId === businessId && e.createdAt >= cutoff)
}

export function getSubscriptionHistoryByBusinessId(businessId: string): SubscriptionHistory[] {
  return subscriptionHistory.filter(h => h.businessId === businessId)
}

export function getSupportNotesByBusinessId(businessId: string): SupportNote[] {
  return supportNotes.filter(n => n.businessId === businessId)
}
