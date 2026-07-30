// scripts/seed-admin.ts
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!')
  process.exit(1)
}

console.log('✅ Environment variables loaded!')
console.log(`📡 Using Supabase URL: ${supabaseUrl}`)

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

const ADMIN_EMAIL = 'icesoulmarket@gmail.com'
const ADMIN_PASSWORD = 'Icemrk112&@'
const ADMIN_USERNAME = 'Admin'
const ADMIN_FULL_NAME = 'Admin User'

async function seedAdmin() {
  console.log('🌱 Starting admin account seeding...')

  try {
    // Step 1: Check if admin already exists in profiles
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, username, is_admin')
      .eq('username', ADMIN_USERNAME)
      .maybeSingle()

    if (existingProfile) {
      console.log(`⏭️  Admin profile already exists for: ${existingProfile.username}`)
      
      // Ensure is_admin is true
      if (!existingProfile.is_admin) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ is_admin: true })
          .eq('id', existingProfile.id)
        
        if (updateError) {
          console.error('❌ Error updating admin profile:', updateError.message)
        } else {
          console.log('✅ Admin profile updated!')
        }
      }
      
      console.log('\n📋 Admin Profile Info:')
      console.log('   Username:', existingProfile.username)
      console.log('   Admin Status:', existingProfile.is_admin)
      console.log('   Login Email:', ADMIN_EMAIL)
      
      return
    }

    // Step 2: Check if user exists in auth
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', ADMIN_EMAIL)  // ✅ Now using email
      .maybeSingle()

    let userId = existingUser?.id

    // Step 3: Create user if not exists
    if (!userId) {
      console.log('📝 Creating new admin user...')
      
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        options: {
          data: {
            username: ADMIN_USERNAME,
            full_name: ADMIN_FULL_NAME,
          },
        },
      })

      if (signUpError) {
        console.error('❌ Error creating admin user:', signUpError.message)
        return
      }

      if (!authData.user) {
        console.error('❌ No user data returned')
        return
      }

      userId = authData.user.id
      console.log(`✅ Admin user created with ID: ${userId}`)
    }

    // Step 4: Insert/Update profile with email
    console.log('📝 Inserting profile with email...')
    
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: ADMIN_EMAIL,           // ✅ Added email
        username: ADMIN_USERNAME,
        full_name: ADMIN_FULL_NAME,
        is_admin: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      })

    if (upsertError) {
      console.error('❌ Error upserting profile:', upsertError.message)
    } else {
      console.log('✅ Admin profile upserted successfully!')
    }

    // Step 5: Verify the profile
    const { data: verifyProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (verifyProfile) {
      console.log('\n✅ Profile verified:')
      console.log('   ID:', verifyProfile.id)
      console.log('   Email:', verifyProfile.email)
      console.log('   Username:', verifyProfile.username)
      console.log('   is_admin:', verifyProfile.is_admin)
    }

    console.log('\n🎉 Admin account setup complete!')
    console.log('📋 Admin Credentials:')
    console.log('   Email:', ADMIN_EMAIL)
    console.log('   Password:', ADMIN_PASSWORD)
    console.log('   Username:', ADMIN_USERNAME)
    console.log('\n⚠️  IMPORTANT: Please change the admin password after first login!')
    console.log('🔗 Login URL: http://localhost:3000/login')
    console.log('📱 Admin Dashboard: http://localhost:3000/admin/dashboard')

  } catch (error) {
    console.error('❌ Error seeding admin:', error)
  }
}

// Run the seeding
seedAdmin()
  .catch(console.error)