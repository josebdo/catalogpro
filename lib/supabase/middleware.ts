import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with cross-request state pollution.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthRoute = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/registro'
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard')
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')

  // Prevent users from accessing dashboard or admin pages if not logged in
  if (!user && (isDashboardRoute || isAdminRoute)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user is already logged in and tries to access login/register, route them to dashboard
  if (user && isAuthRoute) {
    // If user is already logged in, you can route them based on their role
    // For now, redirect to /dashboard
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
