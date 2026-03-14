"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function updateBusinessSettings(data: {
  fullName: string
  businessName: string
  currency: string
  whatsappNumber: string
  logoUrl?: string | null
}) {
  const supabase = await createClient()

  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { error: 'No Autorizado: Debes iniciar sesión' }
    }

    // 1. Get user and business info
    const { data: user } = await supabase
      .from('users')
      .select('business_id, role, full_name')
      .eq('id', session.user.id)
      .single()

    if (!user?.business_id) {
      return { error: 'No tienes un negocio asignado' }
    }

    if (user.role !== 'owner' && user.role !== 'super_admin' && user.role !== 'admin') {
      return { error: 'No tienes permisos para configurar este negocio' }
    }

    // 2. Update user name if changed
    if (data.fullName && data.fullName !== user.full_name) {
      await supabase
        .from('users')
        .update({ full_name: data.fullName })
        .eq('id', session.user.id)
    }

    // 3. Update Custom Settings JSON & Core Business attributes
    const { data: currentBusiness } = await supabase
      .from('businesses')
      .select('settings, logo_url')
      .eq('id', user.business_id)
      .single()

    const newSettings = {
      ...(currentBusiness?.settings || {}),
      currency: data.currency
    }

    // Prepare fields
    const businessUpdates: any = {
      name: data.businessName,
      whatsapp_number: data.whatsappNumber,
      settings: newSettings
    }

    if (data.logoUrl !== undefined) {
      businessUpdates.logo_url = data.logoUrl
    }

    const { error: updateError } = await supabase
      .from('businesses')
      .update(businessUpdates)
      .eq('id', user.business_id)

    if (updateError) {
      console.error('Database Error:', updateError)
      return { error: 'Error al actualizar la configuración' }
    }

    // Revalidate paths that use these settings
    revalidatePath('/dashboard/configuracion')
    revalidatePath('/dashboard/productos')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (err: any) {
    console.error('Server Action Error:', err)
    return { error: 'Ocurrió un error en el servidor' }
  }
}
