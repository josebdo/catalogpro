"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

async function checkOwnerStatus() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  const { data: profile } = await supabase
    .from('users')
    .select('role, business_id')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'owner') {
    throw new Error("Solo el propietario puede administrar la facturación")
  }

  return { supabase, user, businessId: profile.business_id }
}

export async function cancelMySubscription() {
  try {
    const { supabase, businessId } = await checkOwnerStatus()

    if(!businessId) throw new Error("No tienes un negocio asignado")

    const { error } = await supabase
      .from('businesses')
      .update({
        subscription_status: 'suspended', 
        subscription_expires_at: new Date().toISOString()
      })
      .eq('id', businessId)

    if (error) throw error

    revalidatePath('/dashboard/suscripcion')
    return { success: true }
  } catch (error: any) {
    console.error("Error canceling my subscription:", error)
    return { error: error.message }
  }
}

export async function getBillingDetails() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autenticado" }

    const { data: profile } = await supabase
      .from('users')
      .select('business_id, role')
      .eq('id', user.id)
      .single()

    if (!profile?.business_id) return { error: "Sin negocio asignado" }

    const { data: business } = await supabase
      .from('businesses')
      .select('plan, subscription_status, subscription_expires_at, is_active')
      .eq('id', profile.business_id)
      .single()

    const [{ count: productsCount }, { count: categoriesCount }, { count: editorsCount }, { data: subHistory }] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('business_id', profile.business_id),
      supabase.from('categories').select('*', { count: 'exact', head: true }).eq('business_id', profile.business_id),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('business_id', profile.business_id).eq('role', 'editor'),
      supabase.from('subscription_history').select('*').eq('business_id', profile.business_id).order('created_at', { ascending: false }).limit(5)
    ])

    return { 
      success: true, 
      data: {
        business,
        role: profile.role,
        usage: {
          products: productsCount || 0,
          categories: categoriesCount || 0,
          editors: editorsCount || 0
        },
        history: subHistory || []
      } 
    }
  } catch (error: any) {
    console.error("Error getting billing details:", error)
    return { error: error.message }
  }
}
