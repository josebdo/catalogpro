"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function createCategory(formData: FormData) {
  const supabase = await createClient()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { error: 'No Autorizado: Debes iniciar sesión' }
    }

    // Obtener negocio del usuario
    const { data: user } = await supabase
      .from('users')
      .select('business_id, role')
      .eq('id', session.user.id)
      .single()

    if (!user?.business_id) {
      return { error: 'No se encontró un negocio asociado a tu cuenta' }
    }

    if (user.role !== 'owner' && user.role !== 'super_admin' && user.role !== 'admin') {
      return { error: 'No tienes permisos para crear categorías' }
    }

    const name = formData.get('name') as string
    
    if (!name || name.trim() === '') {
      return { error: 'El nombre de la categoría es obligatorio' }
    }

    // Obtener el sort_order más alto actual para poner esta nueva de última
    const { data: lastCategory } = await supabase
      .from('categories')
      .select('sort_order')
      .eq('business_id', user.business_id)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single()

    const newSortOrder = lastCategory ? lastCategory.sort_order + 1 : 1

    // Insertar la categoría real en la BD
    const { error: insertError } = await supabase
      .from('categories')
      .insert({
        business_id: user.business_id,
        name: name.trim(),
        sort_order: newSortOrder
      })

    if (insertError) {
      console.error('Database Error:', insertError)
      return { error: 'Error al guardar la categoría en la base de datos' }
    }

    revalidatePath('/dashboard/categories')
    return { success: true }

  } catch (err: any) {
    console.error('Server Action Error:', err)
    return { error: 'Ocurrió un error inesperado en el servidor' }
  }
}

export async function updateCategory(formData: FormData, categoryId: string) {
  const supabase = await createClient()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { error: 'No Autorizado: Debes iniciar sesión' }
    }

    // Obtener negocio del usuario
    const { data: user } = await supabase
      .from('users')
      .select('business_id, role')
      .eq('id', session.user.id)
      .single()

    if (!user?.business_id) {
      return { error: 'No se encontró un negocio asociado a tu cuenta' }
    }

    if (user.role !== 'owner' && user.role !== 'super_admin' && user.role !== 'admin') {
      return { error: 'No tienes permisos para editar categorías' }
    }

    const name = formData.get('name') as string
    
    if (!name || name.trim() === '') {
      return { error: 'El nombre de la categoría es obligatorio' }
    }

    // Actualizar la categoría real en la BD
    const { error: updateError } = await supabase
      .from('categories')
      .update({
        name: name.trim()
      })
      .eq('id', categoryId)
      .eq('business_id', user.business_id) // ensure they own it

    if (updateError) {
      console.error('Database Error:', updateError)
      return { error: 'Error al actualizar la categoría en la base de datos' }
    }

    revalidatePath('/dashboard/categories')
    return { success: true }

  } catch (err: any) {
    console.error('Server Action Error:', err)
    return { error: 'Ocurrió un error inesperado al actualizar' }
  }
}
