'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowRight, ArrowLeft, Check, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { CatalogProLogo } from '@/components/catalog-pro-logo'
import { BUSINESS_CATEGORIES, planConfigs } from '@/lib/plans'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { registerBusiness } from '@/app/actions/auth'

const COUNTRY_CODES = [
  { code: '+1', country: 'RD/USA/CA' },
  { code: '+52', country: 'MX' },
  { code: '+57', country: 'CO' },
  { code: '+58', country: 'VE' },
  { code: '+56', country: 'CL' },
  { code: '+54', country: 'AR' },
  { code: '+51', country: 'PE' },
]

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export default function RegistroPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Step 1 fields
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Step 2 fields
  const [businessName, setBusinessName] = useState('')
  const [countryCode, setCountryCode] = useState('+1')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [businessCategory, setBusinessCategory] = useState('')
  const [description, setDescription] = useState('')

  const slug = generateSlug(businessName)
  const catalogUrl = `catalogpro.com/${slug || 'tu-negocio'}`

  const validateStep1 = () => {
    if (!fullName.trim()) {
      toast.error('Ingresa tu nombre completo')
      return false
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('Ingresa un email válido')
      return false
    }
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return false
    }
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!businessName.trim()) {
      toast.error('Ingresa el nombre de tu negocio')
      return false
    }
    if (!whatsappNumber.trim()) {
      toast.error('Ingresa tu número de WhatsApp')
      return false
    }
    if (!businessCategory) {
      toast.error('Selecciona una categoría')
      return false
    }
    return true
  }

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      handleCreateAccount()
    }
  }

  const handleCreateAccount = async () => {
    setIsLoading(true)

    try {
      // 1. Sign up the user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (authError) {
        if (authError.message.includes("User already registered") || authError.status === 422) {
          toast.error("Este correo ya está registrado. Por favor, intenta iniciar sesión.")
        } else {
          toast.error(`Error al crear cuenta: ${authError.message}`)
        }
        setIsLoading(false)
        return
      }

      if (!authData.user) {
        toast.error('No se pudo crear el usuario')
        setIsLoading(false)
        return
      }

      const userId = authData.user.id

      // 2. Insert the Business via Server Action (Bypasses RLS permission errors on initial signup)
      const fullPhoneNumber = `${countryCode}${whatsappNumber}`
      
      const result = await registerBusiness({
        userId: userId,
        businessName: businessName,
        slug: slug || `${businessName.toLowerCase().replace(/\s+/g, '-')}-${Math.floor(Math.random() * 1000)}`,
        description,
        fullPhoneNumber,
        businessCategory,
      })

      if (!result.success) {
        console.error('Error in Server Action creating business:', result.error)
        toast.error(`Error: ${result.error}`)
        setIsLoading(false)
        return
      }

      if (!authData.session) {
        toast.success('¡Registro exitoso! Por favor verifica tu correo para iniciar sesión.')
        setStep(3)
        setIsLoading(false)
        return
      }

      toast.success('¡Catálogo creado con éxito!')
      setStep(3)
    } catch (err: any) {
      console.error("Critical error during registration:", err)
      toast.error(`Error inesperado: ${err.message || 'Inténtalo de nuevo'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinish = () => {
    router.push('/dashboard')
  }

  const progress = (step / 3) * 100

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <Link href="/">
            <CatalogProLogo />
          </Link>
          <Link 
            href="/login" 
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="mx-auto max-w-2xl px-4 pt-8">
        <Progress value={progress} className="h-2" />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span className={step >= 1 ? 'text-[#25D366]' : ''}>1. Tu cuenta</span>
          <span className={step >= 2 ? 'text-[#25D366]' : ''}>2. Tu negocio</span>
          <span className={step >= 3 ? 'text-[#25D366]' : ''}>3. Listo</span>
        </div>
      </div>

      {/* Form Content */}
      <div className="mx-auto max-w-md px-4 py-12">
        {/* Step 1: Account Info */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-[#0F172A]">Crea tu cuenta</h1>
              <p className="mt-2 text-muted-foreground">
                Comienza gratis, sin tarjeta de crédito
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre completo</Label>
                <Input
                  id="fullName"
                  placeholder="Tu nombre"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repite tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <Button
              onClick={handleNextStep}
              className="h-11 w-full gap-2 bg-[#25D366] text-white hover:bg-[#22C55E]"
            >
              Continuar
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 2: Business Info */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-[#0F172A]">Tu negocio</h1>
              <p className="mt-2 text-muted-foreground">
                Cuéntanos sobre tu negocio
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Nombre del negocio</Label>
                <Input
                  id="businessName"
                  placeholder="Ej: Moda Elena"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Tu catálogo estará en: <span className="font-medium text-[#25D366]">{catalogUrl}</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label>Número de WhatsApp</Label>
                <div className="flex gap-2">
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger className="h-11 w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRY_CODES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.code} {c.country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="tel"
                    placeholder="8091234567"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                    className="h-11 flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría del negocio</Label>
                <Select value={businessCategory} onValueChange={setBusinessCategory}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Ej: Ropa y accesorios para mujer a precios accesibles"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-20 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="h-11 flex-1 gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Atrás
              </Button>
              <Button
                onClick={handleNextStep}
                disabled={isLoading}
                className="h-11 flex-1 gap-2 bg-[#25D366] text-white hover:bg-[#22C55E]"
              >
                {isLoading ? 'Creando...' : 'Crear catálogo'}
                {!isLoading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="space-y-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#25D366]">
              <Check className="h-10 w-10 text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-[#0F172A]">
                ¡Tu catálogo está listo!
              </h1>
              <p className="mt-2 text-muted-foreground">
                Ya puedes empezar a agregar productos
              </p>
            </div>

            <div className="rounded-lg border border-border bg-white p-4">
              <p className="mb-2 text-sm text-muted-foreground">Tu catálogo está en:</p>
              <div className="flex items-center justify-center gap-2">
                <code className="rounded bg-muted px-3 py-2 text-sm font-medium">
                  {catalogUrl}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(`https://${catalogUrl}`)
                    toast.success('Link copiado')
                  }}
                >
                  Copiar
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleFinish}
                className="h-11 w-full gap-2 bg-[#25D366] text-white hover:bg-[#22C55E]"
              >
                Agregar productos
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-11 w-full gap-2"
                asChild
              >
                <Link href={`/${slug}`} target="_blank">
                  Ver catálogo
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Plan Info */}
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <h3 className="mb-3 text-sm font-semibold text-[#0F172A]">
                Empiezas con el plan Free
              </h3>
              <ul className="space-y-2 text-left text-sm text-muted-foreground">
                {planConfigs.free.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-[#25D366]" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
