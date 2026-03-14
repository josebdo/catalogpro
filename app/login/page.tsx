'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CatalogProLogo } from '@/components/catalog-pro-logo'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Use Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      console.error('Login error:', authError)
      toast.error(`Error: ${authError?.message || 'Credenciales inválidas o correo no registrado'}`)
      setIsLoading(false)
      return
    }

    // Get user role from the public users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', authData.user.id)
      .single()

    if (userError) {
      console.error('Error fetching user role:', userError)
    }

    toast.success('Inicio de sesión exitoso')

    const userRole = userData?.role || 'owner'

    // Redirect based on role
    if (userRole === 'super_admin' || userRole === 'admin') {
      router.push('/admin')
    } else {
      router.push('/dashboard')
    }

    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Form */}
      <div className="flex w-full flex-col justify-center px-4 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="mb-8 inline-block">
            <CatalogProLogo />
          </Link>

          <h1 className="mb-2 text-2xl font-bold text-[#0F172A]">
            Bienvenido de vuelta
          </h1>
          <p className="mb-8 text-muted-foreground">
            Inicia sesión para acceder a tu catálogo
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full bg-[#25D366] text-white hover:bg-[#22C55E]"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{' '}
            <Link href="/registro" className="font-medium text-[#25D366] hover:underline">
              Crear cuenta gratis
            </Link>
          </p>

          {/* Demo Credentials */}
          <div className="mt-8 rounded-lg border border-border bg-muted/50 p-4">
            <p className="mb-2 text-sm font-medium text-[#0F172A]">
              Credenciales de prueba base de datos:
            </p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><strong>Admin:</strong> josebdo91@gmail.com</p>
              <p><strong>Clave:</strong> Jo1991ga</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden bg-[#0F172A] lg:block lg:w-1/2">
        <div className="flex h-full items-center justify-center p-16">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#25D366]">
              <svg
                width="40"
                height="40"
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
            <h2 className="mb-4 text-3xl font-bold text-white">
              Tu catálogo profesional
            </h2>
            <p className="text-lg text-gray-400">
              Gestiona tus productos, analiza tus ventas y crece tu negocio con CatalogPro.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
