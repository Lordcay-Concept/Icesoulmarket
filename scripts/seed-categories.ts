// scripts/seed-categories.ts
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!')
  console.error('Please ensure .env.local has:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL=your_url')
  console.error('  SUPABASE_SERVICE_ROLE_KEY=your_key')
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

const categories = [
  {
    id: 'cat-1',
    name: 'Game Accounts',
    slug: 'game-accounts',
    description: 'Premium Call of Duty accounts with exclusive content',
    icon: '👾',
  },
  {
    id: 'cat-2',
    name: 'Themes & Skins',
    slug: 'themes-skins',
    description: 'Custom themes and weapon skins',
    icon: '🎨',
  },
  {
    id: 'cat-3',
    name: 'In-Game Currency',
    slug: 'in-game-currency',
    description: 'COD Points and in-game currency',
    icon: '💰',
  },
  {
    id: 'cat-4',
    name: 'Bundles',
    slug: 'bundles',
    description: 'Complete gaming bundles with exclusive items',
    icon: '📦',
  },
]

async function seedCategories() {
  console.log('🌱 Starting category seeding...')

  for (const category of categories) {
    try {
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('id', category.id)
        .maybeSingle()

      if (existing) {
        console.log(`⏭️  Category "${category.name}" already exists, skipping...`)
        continue
      }

      const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single()

      if (error) {
        console.error(`❌ Error inserting category "${category.name}":`, error.message)
      } else {
        console.log(`✅ Inserted category: ${category.name}`)
      }
    } catch (error) {
      console.error(`❌ Error with category "${category.name}":`, error)
    }
  }

  console.log('🎉 Category seeding complete!')
}

seedCategories()
  .catch(console.error)