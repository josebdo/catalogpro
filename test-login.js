import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

const envContent = fs.readFileSync('.env.local', 'utf8')
const envUrlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)
const envAnonMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)
const envServiceMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)

const supabaseUrl = envUrlMatch ? envUrlMatch[1].trim() : null
const supabaseKey = (envServiceMatch ? envServiceMatch[1].trim() : null) || (envAnonMatch ? envAnonMatch[1].trim() : null)

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testLogin() {
    console.log(`\nProbando Login con josebdo91@gmail.com...`)
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'josebdo91@gmail.com',
      password: 'Jo1991ga',
    })

    if (authError) {
      console.error('❌ Error general de login:')
      console.error(authError)
      return
    }

    console.log('✅ Login exitoso:')
    console.log('User ID:', authData.user.id)
}

testLogin();
