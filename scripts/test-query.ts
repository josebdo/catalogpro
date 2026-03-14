import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  console.log('Testing users query...')
  const res1 = await supabase
    .from('users')
    .select(`
      id, full_name, role, business_id,
      businesses ( plan )
    `)
    .limit(1)
  
  if (res1.error) {
    console.error('Error 1 JSON:', JSON.stringify(res1.error, null, 2))
  } else {
    console.log('Success 1:', res1.data)
  }

  console.log('Testing users with explicit fk...')
  const res1ext = await supabase
    .from('users')
    .select(`
      id, full_name, role, business_id,
      businesses!users_business_id_fkey ( plan )
    `)
    .limit(1)
  
  if (res1ext.error) {
    console.error('Error 1ext JSON:', JSON.stringify(res1ext.error, null, 2))
  } else {
    console.log('Success 1ext:', res1ext.data)
  }

  console.log('Testing businesses query...')
  const res2 = await supabase
    .from('businesses')
    .select(`
      id, plan,
      users ( full_name )
    `)
    .limit(1)

  if (res2.error) {
    console.error('Error 2 JSON:', JSON.stringify(res2.error, null, 2))
  } else {
    console.log('Success 2:', res2.data)
  }
}

run()
