"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function createProduct(formData: FormData) {
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
      return { error: 'No tienes permisos para crear productos' }
    }

    const name = formData.get('name') as string
    const description = formData.get('description') as string | null
    const price = parseFloat(formData.get('price') as string)
    const categoryId = formData.get('categoryId') as string | null
    const imageUrl = formData.get('imageUrl') as string | null
    
    if (!name || name.trim() === '') {
      return { error: 'El nombre del producto es obligatorio' }
    }

    if (isNaN(price) || price < 0) {
      return { error: 'El precio debe ser un número válido' }
    }

    // Obtener configuración de moneda del negocio
    const { data: business } = await supabase
      .from('businesses')
      .select('settings')
      .eq('id', user.business_id)
      .single()

    const currency = business?.settings?.currency || 'USD'

    // Obtener el sort_order más alto actual
    const { data: lastProduct } = await supabase
      .from('products')
      .select('sort_order')
      .eq('business_id', user.business_id)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single()

    const newSortOrder = lastProduct ? lastProduct.sort_order + 1 : 1

    // Insertar el producto real en la BD
    const { error: insertError } = await supabase
      .from('products')
      .insert({
        business_id: user.business_id,
        category_id: categoryId || null,
        name: name.trim(),
        description: description?.trim() || null,
        price,
        currency,
        image_url: imageUrl || null,
        is_available: true,
        is_featured: false,
        sort_order: newSortOrder
      })

    if (insertError) {
      console.error('Database Error:', insertError)
      return { error: 'Error al guardar el producto en la base de datos' }
    }

    revalidatePath('/dashboard/productos')
    return { success: true }

  } catch (err: any) {
    console.error('Server Action Error:', err)
    return { error: 'Ocurrió un error inesperado en el servidor' }
  }
}

export async function updateProduct(formData: FormData, productId: string) {
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
      return { error: 'No tienes permisos para editar productos' }
    }

    const name = formData.get('name') as string
    const description = formData.get('description') as string | null
    const price = parseFloat(formData.get('price') as string)
    const categoryId = formData.get('categoryId') as string | null
    const imageUrl = formData.get('imageUrl') as string | null
    
    if (!name || name.trim() === '') {
      return { error: 'El nombre del producto es obligatorio' }
    }

    if (isNaN(price) || price < 0) {
      return { error: 'El precio debe ser un número válido' }
    }

    // Preparar campos actualizar
    const updates: any = {
      category_id: categoryId || null,
      name: name.trim(),
      description: description?.trim() || null,
      price,
    }

    if (imageUrl) {
      updates.image_url = imageUrl
    }

    // Actualizar el producto en la BD
    const { error: updateError } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .eq('business_id', user.business_id) // ensure they own it

    if (updateError) {
      console.error('Database Error:', updateError)
      return { error: 'Error al actualizar el producto en la base de datos' }
    }

    revalidatePath('/dashboard/productos')
    return { success: true }

  } catch (err: any) {
    console.error('Server Action Error:', err)
    return { error: 'Ocurrió un error inesperado al actualizar' }
  }
}
