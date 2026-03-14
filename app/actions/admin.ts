"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { BusinessPlan } from "@/lib/mock-data"

async function checkAdminStatus() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.user) {
    throw new Error("No autenticado")
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (error || !user || (user.role !== 'super_admin' && user.role !== 'admin')) {
    throw new Error("No tienes permisos de administrador")
  }

  return { supabase, user: session.user }
}

export async function toggleUserStatus(userId: string, businessId: string, currentStatus: boolean) {
  try {
    const { supabase } = await checkAdminStatus()
    const newStatus = !currentStatus

    // Update user status
    const { error: userError } = await supabase
      .from('users')
      .update({ is_active: newStatus })
      .eq('id', userId)

    if (userError) throw userError

    // If user has a business, update business status too
    if (businessId) {
      const { error: businessError } = await supabase
        .from('businesses')
        .update({ is_active: newStatus })
        .eq('id', businessId)

      if (businessError) throw businessError
    }

    revalidatePath('/admin/usuarios')
    return { success: true, newStatus }
  } catch (error: any) {
    console.error("Error toggling user status:", error)
    return { error: error.message }
  }
}

export async function toggleCatalogStatus(businessId: string, currentStatus: boolean) {
  try {
    const { supabase } = await checkAdminStatus()
    const newStatus = !currentStatus

    const { error } = await supabase
      .from('businesses')
      .update({ is_active: newStatus })
      .eq('id', businessId)

    if (error) throw error

    revalidatePath('/admin/catalogos')
    return { success: true, newStatus }
  } catch (error: any) {
    console.error("Error toggling catalog status:", error)
    return { error: error.message }
  }
}

export async function changeSubscriptionPlan(businessId: string, newPlan: string, endDateStr: string | null) {
  try {
    const { supabase } = await checkAdminStatus()

    let expiresAt = null
    if (endDateStr) {
      const date = new Date(endDateStr)
      if (!isNaN(date.getTime())) {
        expiresAt = date.toISOString()
      }
    }

    const { error } = await supabase
      .from('businesses')
      .update({ 
        plan: newPlan as any,
        subscription_expires_at: expiresAt,
        subscription_status: 'active'
      })
      .eq('id', businessId)

    if (error) throw error

    revalidatePath('/admin/suscripciones')
    return { success: true }
  } catch (error: any) {
    console.error("Error changing plan:", error)
    return { error: error.message }
  }
}

export async function renewSubscription(businessId: string, plan: string, months: number) {
  try {
    const { supabase, user } = await checkAdminStatus()

    // Llama al procedimiento almacenado de renovación
    const { data, error } = await supabase.rpc('renew_subscription', {
      p_business_id: businessId,
      p_plan: plan,
      p_months: months,
      p_payment_method: 'efectivo', // O default
      p_note: `Renovación manual via Admin Dashboard por ${months} meses.`,
      p_renewed_by: user.id
    })

    if (error) throw error
    if (data && data.error) throw new Error(data.error)

    revalidatePath('/admin/suscripciones')
    return { success: true, data }
  } catch (error: any) {
    console.error("Error renewing subscription:", error)
    return { error: error.message }
  }
}

export async function extendSubscription(businessId: string) {
  try {
    const { supabase } = await checkAdminStatus()

    // Obtenemos la fecha actual
    const { data: business, error: fetchError } = await supabase
      .from('businesses')
      .select('subscription_expires_at, plan')
      .eq('id', businessId)
      .single()

    if (fetchError) throw fetchError

    let currentExpiry = new Date()
    if (business.subscription_expires_at && new Date(business.subscription_expires_at) > currentExpiry) {
      currentExpiry = new Date(business.subscription_expires_at)
    }

    // Le sumamos 30 dias
    currentExpiry.setDate(currentExpiry.getDate() + 30)

    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        subscription_expires_at: currentExpiry.toISOString(),
        subscription_status: 'active' // reactivate if suspended
      })
      .eq('id', businessId)

    if (updateError) throw updateError

    revalidatePath('/admin/suscripciones')
    return { success: true }
  } catch (error: any) {
    console.error("Error extending subscription:", error)
    return { error: error.message }
  }
}

export async function cancelSubscription(businessId: string) {
  try {
    const { supabase } = await checkAdminStatus()

    const { error } = await supabase
      .from('businesses')
      .update({
        subscription_status: 'suspended',
        subscription_expires_at: new Date().toISOString() // Expira ahora
      })
      .eq('id', businessId)

    if (error) throw error

    revalidatePath('/admin/suscripciones')
    return { success: true }
  } catch (error: any) {
    console.error("Error canceling subscription:", error)
    return { error: error.message }
  }
}

export async function createAdminHelper(email: string, fullName: string, password: string) {
  try {
    const { supabase: userClient } = await checkAdminStatus()
    
    // We need the service role key to bypass email confirmation and create users directly
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    
    if (!supabaseServiceKey) {
      throw new Error("No existe la llave SUPABASE_SERVICE_ROLE_KEY en las variables de entorno para crear usuarios de forma administrativa.")
    }

    // Bypass Next auth and use pure Supabase JS Client with Service Role Key
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
    const adminSupabase = createSupabaseClient(supabaseUrl, supabaseServiceKey)

    // 1. Create the Auth User
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      }
    })

    if (authError) throw authError
    if (!authData.user) throw new Error("Fallo al crear usuario en Supabase Auth")

    // The Trigger handle_new_user should have created a row in public.users automatically.
    // We just need to update their role to 'admin'
    
    const { error: dbError } = await adminSupabase
      .from('users')
      .update({
        full_name: fullName,
        role: 'admin'
      })
      .eq('id', authData.user.id)

    if (dbError) throw dbError

    revalidatePath('/admin/usuarios')
    return { success: true, userId: authData.user.id }
  } catch (error: any) {
    console.error("Error creating admin helper:", error)
    return { error: error.message }
  }
}

export async function createBusinessAdmin(
  businessName: string,
  businessSlug: string,
  email: string,
  fullName: string,
  password: string,
  plan: string
) {
  try {
    const { supabase: userClient } = await checkAdminStatus()
    
    // We need the service role key to bypass email confirmation and create users directly
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    
    if (!supabaseServiceKey) {
      throw new Error("No existe la llave SUPABASE_SERVICE_ROLE_KEY en las variables de entorno para crear negocios de forma administrativa.")
    }

    // Bypass Next auth and use pure Supabase JS Client with Service Role Key
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
    const adminSupabase = createSupabaseClient(supabaseUrl, supabaseServiceKey)

    // 1. Create the Auth User
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      }
    })

    if (authError) throw authError
    if (!authData.user) throw new Error("Fallo al crear el propietario en Supabase Auth")

    // The Trigger handle_new_user should have created a row in public.users automatically.
    // 2. Create the business
    const { data: newBusiness, error: businessError } = await adminSupabase
      .from('businesses')
      .insert({
        name: businessName,
        slug: businessSlug,
        plan: plan,
        subscription_status: 'active'
      })
      .select('id')
      .single()

    if (businessError) throw businessError

    // 3. Update the user with the new role and business_id
    const { error: dbError } = await adminSupabase
      .from('users')
      .update({
        full_name: fullName,
        role: 'owner',
        business_id: newBusiness.id
      })
      .eq('id', authData.user.id)

    if (dbError) throw dbError

    revalidatePath('/admin/usuarios')
    revalidatePath('/admin/catalogos')
    return { success: true, businessId: newBusiness.id, userId: authData.user.id }
  } catch (error: any) {
    console.error("Error creating business from admin:", error)
    return { error: error.message }
  }
}

export async function getAdminEventsChartData(days: number = 7) {
  try {
    const { supabase } = await checkAdminStatus()
    
    // Calculate the start date
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const { data: events, error } = await supabase
      .from('analytics_events')
      .select('event_type, created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    if (error) throw error

    // Initialize daily aggregations
    const dailyStats: Record<string, { date: string, views: number, clicks: number, shares: number }> = {}
    
    // Prepare the last X days entries
    for (let i = 0; i < days; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateString = d.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })
      let sortKey = d.toISOString().split('T')[0]
      dailyStats[sortKey] = { date: dateString, views: 0, clicks: 0, shares: 0 }
    }

    // Populate data
    events?.forEach(evt => {
      const dbDate = new Date(evt.created_at)
      const ds = dbDate.toISOString().split('T')[0]
      if (dailyStats[ds]) {
        if (evt.event_type === 'catalog_view') dailyStats[ds].views++
        else if (evt.event_type === 'whatsapp_click') dailyStats[ds].clicks++
        else if (evt.event_type === 'catalog_share_open') dailyStats[ds].shares++
      }
    })

    // Convert Record into sorted array
    const chartData = Object.keys(dailyStats)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .map(key => dailyStats[key])

    return { success: true, data: chartData }
  } catch (error: any) {
    console.error("Error getting admin chart data", error)
    return { error: error.message }
  }
}
