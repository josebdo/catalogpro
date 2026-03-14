'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function registerBusiness(data: {
  userId: string
  businessName: string
  slug: string
  description: string
  fullPhoneNumber: string
  businessCategory: string
}) {
  try {
    const supabaseAdmin = createAdminClient()

    // 1. Damos de alta el negocio usando la llave maestra
    // que se salta cualquier restricción RLS de que el usuario no esté logueado
    const { data: businessData, error: businessError } = await supabaseAdmin
      .from('businesses')
      .insert({
        name: data.businessName,
        slug: data.slug,
        description: data.description,
        whatsapp_number: data.fullPhoneNumber,
        business_category: data.businessCategory,
        plan: 'free',
        owner_id: data.userId,
        is_active: true,
      })
      .select('id')
      .single()

    if (businessError) {
      console.error('Error Admin API creating business:', businessError)
      return { 
        success: false, 
        error: businessError.message || 'No se pudo crear el negocio. Intenta con otro nombre único.' 
      }
    }

    // 2. Asociamos el negocio al usuario en la tabla pública
    const { error: userUpdateError } = await supabaseAdmin
      .from('users')
      .update({ business_id: businessData.id })
      .eq('id', data.userId)

    if (userUpdateError) {
      console.error('Error Admin API linking user to business:', userUpdateError)
      // No rompemos acá porque el negocio ya existe, pero dejamos constancia
    }

    return { success: true }
  } catch (error: any) {
    console.error('Action error creating business:', error)
    return { success: false, error: error.message || 'Error interno del servidor.' }
  }
}

export async function signOut() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Error signing out:', error)
    return { error: 'Error al cerrar sesión' }
  }

  // Next.js redirect must be outside try/catch
  revalidatePath('/', 'layout')
  redirect('/login')
}
