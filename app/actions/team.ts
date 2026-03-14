"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Check if user is owner
async function checkOwnerStatus() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  const { data: profile } = await supabase
    .from('users')
    .select('role, business_id')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'owner' && profile.role !== 'super_admin' && profile.role !== 'admin')) {
    throw new Error("No tienes permisos para administrar el equipo")
  }

  return { supabase, user, businessId: profile.business_id }
}

export async function createEditorUser(email: string, fullName: string, password: string) {
  try {
    const { businessId } = await checkOwnerStatus()
    if (!businessId) throw new Error("No tienes un negocio asignado")
    
    // We need the service role key to bypass email confirmation and create users directly
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    
    if (!supabaseServiceKey) {
      throw new Error("No existe la llave SUPABASE_SERVICE_ROLE_KEY en las variables de entorno para crear usuarios de forma administrativa.")
    }

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
    // Update role and business_id
    const { error: dbError } = await adminSupabase
      .from('users')
      .update({
        full_name: fullName,
        role: 'editor',
        business_id: businessId
      })
      .eq('id', authData.user.id)

    if (dbError) throw dbError

    revalidatePath('/dashboard/equipo')
    return { success: true, userId: authData.user.id }
  } catch (error: any) {
    console.error("Error creating editor:", error)
    return { error: error.message }
  }
}

export async function deleteTeamMember(targetUserId: string) {
  try {
    const { businessId } = await checkOwnerStatus()
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    
    if (!supabaseServiceKey) {
      throw new Error("No existe la llave SUPABASE_SERVICE_ROLE_KEY")
    }

    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
    const adminSupabase = createSupabaseClient(supabaseUrl, supabaseServiceKey)

    // Security check: ensure target user belongs to the same business
    const { data: targetUser } = await adminSupabase
      .from('users')
      .select('business_id, role')
      .eq('id', targetUserId)
      .single()

    if (!targetUser) throw new Error("Usuario no encontrado")
    if (targetUser.business_id !== businessId) throw new Error("El usuario no pertenece a tu negocio")
    if (targetUser.role === 'owner') throw new Error("No puedes eliminar al propietario del negocio")

    // Delete from Supabase Auth (this cascades to public.users if configured, but we can do both)
    const { error: deleteAuthError } = await adminSupabase.auth.admin.deleteUser(targetUserId)
    if (deleteAuthError) throw deleteAuthError

    // Also delete from public table just in case there's no cascade
    await adminSupabase.from('users').delete().eq('id', targetUserId)

    revalidatePath('/dashboard/equipo')
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting member:", error)
    return { error: error.message }
  }
}
