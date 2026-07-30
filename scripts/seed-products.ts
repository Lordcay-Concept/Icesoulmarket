// scripts/seed-products.ts
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

// Create Supabase client for Node.js
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

interface ProductInput {
  name: string
  slug: string
  category_id: string
  description: string
  price: number
  discount_price: number | null
  stock_quantity: number
  images: string[]
  platform: string[]
  features: Record<string, any>
  is_active: boolean
  is_featured: boolean
  meta_title: string
  meta_description: string
}

const products: ProductInput[] = [
  // Themes Category
  {
    name: 'Call of Duty: Black Ops 6 - Dark Ops Theme',
    slug: 'dark-ops-theme',
    category_id: 'cat-2',
    description: 'Premium dark ops theme with animated backgrounds, custom sound effects, and exclusive operator skins. Transform your gaming experience with this immersive dark theme.',
    price: 24.99,
    discount_price: 19.99,
    stock_quantity: 50,
    images: ['/images/themes/theme-1.png'],
    platform: ['PC', 'PlayStation', 'Xbox'],
    features: {
      type: 'Theme',
      includes: ['Animated Background', 'Custom Sound Effects', 'Exclusive Operator Skins'],
      compatibility: 'All Platforms',
      rarity: 'Epic'
    },
    is_active: true,
    is_featured: true,
    meta_title: 'Dark Ops Theme - Premium COD Gaming Theme',
    meta_description: 'Transform your gaming experience with this exclusive dark ops theme.',
  },
  {
    name: 'Call of Duty: Modern Warfare - Digital Warfare Theme',
    slug: 'digital-warfare-theme',
    category_id: 'cat-2',
    description: 'Digital warfare theme with futuristic neon aesthetics, animated UI elements, and exclusive weapon camos. Perfect for the modern gamer.',
    price: 19.99,
    discount_price: null,
    stock_quantity: 45,
    images: ['/images/themes/theme-2.png'],
    platform: ['PC', 'PlayStation', 'Xbox'],
    features: {
      type: 'Theme',
      includes: ['Neon UI Elements', 'Animated Backgrounds', 'Exclusive Camos'],
      compatibility: 'All Platforms',
      rarity: 'Rare'
    },
    is_active: true,
    is_featured: false,
    meta_title: 'Digital Warfare Theme - COD Gaming Theme',
    meta_description: 'Futuristic neon theme with animated UI elements and exclusive camos.',
  },

  // Skins Category
  {
    name: 'Neon Cyberpunk Weapon Skin Pack',
    slug: 'neon-cyberpunk-skin-pack',
    category_id: 'cat-2',
    description: 'Exclusive neon cyberpunk weapon skins with animated glow effects. Includes skins for AR, SMG, and Sniper rifles with custom sound design.',
    price: 29.99,
    discount_price: 24.99,
    stock_quantity: 30,
    images: ['/images/skins/skin-1.png'],
    platform: ['PC', 'PlayStation', 'Xbox'],
    features: {
      type: 'Skin Pack',
      includes: ['AR Skin', 'SMG Skin', 'Sniper Skin', 'Custom Sound Effects'],
      effects: ['Animated Glow', 'Neon Tracers'],
      rarity: 'Legendary'
    },
    is_active: true,
    is_featured: true,
    meta_title: 'Neon Cyberpunk Skin Pack - COD Weapon Skins',
    meta_description: 'Legendary neon cyberpunk weapon skins with animated effects.',
  },
  {
    name: 'Gold Camo Collection - Legendary Weapon Skins',
    slug: 'gold-camo-collection',
    category_id: 'cat-2',
    description: 'Premium gold camouflage collection for all weapon types. Includes gold camo for AR, SMG, Shotgun, and Sniper with exclusive gold tracer effects.',
    price: 34.99,
    discount_price: 29.99,
    stock_quantity: 25,
    images: ['/images/skins/skin-2.png'],
    platform: ['PC', 'PlayStation', 'Xbox'],
    features: {
      type: 'Skin Collection',
      includes: ['Gold AR Camo', 'Gold SMG Camo', 'Gold Shotgun Camo', 'Gold Sniper Camo'],
      effects: ['Gold Glow', 'Gold Tracers'],
      rarity: 'Legendary'
    },
    is_active: true,
    is_featured: false,
    meta_title: 'Gold Camo Collection - Legendary Weapon Skins',
    meta_description: 'Premium gold camouflage collection for all weapon types.',
  },

  // Coins/Currency Category
  {
    name: 'COD Points - 2400 CP + Bonus',
    slug: 'cod-points-2400-bonus',
    category_id: 'cat-3',
    description: 'Get 2400 Call of Duty Points with an exclusive bonus of 200 CP. Perfect for battle passes, bundles, and exclusive items. Instant delivery to your account.',
    price: 29.99,
    discount_price: null,
    stock_quantity: 100,
    images: ['/images/coins/coin-1.png'],
    platform: ['All Platforms'],
    features: {
      amount: 2600,
      type: 'COD Points',
      bonus: '200 Free CP',
      delivery: 'Instant'
    },
    is_active: true,
    is_featured: true,
    meta_title: 'Buy COD Points 2400 + Bonus - Icesoulmarket',
    meta_description: 'Purchase 2400 COD Points with 200 bonus CP. Instant delivery.',
  },
  {
    name: 'COD Points - 5000 CP Mega Pack',
    slug: 'cod-points-5000-mega',
    category_id: 'cat-3',
    description: 'Mega pack of 5000 Call of Duty Points with 500 bonus CP. Best value for serious gamers who want to unlock everything.',
    price: 49.99,
    discount_price: 44.99,
    stock_quantity: 75,
    images: ['/images/coins/coin-2.png'],
    platform: ['All Platforms'],
    features: {
      amount: 5500,
      type: 'COD Points',
      bonus: '500 Free CP',
      delivery: 'Instant',
      value: 'Best Value'
    },
    is_active: true,
    is_featured: true,
    meta_title: 'Buy COD Points 5000 Mega Pack - Icesoulmarket',
    meta_description: 'Mega pack of 5000 COD Points with 500 bonus CP. Best value!',
  },
]

async function seedProducts() {
  console.log('🌱 Starting product seeding...')

  for (const product of products) {
    try {
      // Check if product already exists
      const { data: existing } = await supabase
        .from('products')
        .select('id')
        .eq('slug', product.slug)
        .maybeSingle()

      if (existing) {
        console.log(`⏭️  Product "${product.name}" already exists, skipping...`)
        continue
      }

      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single()

      if (error) {
        console.error(`❌ Error inserting product "${product.name}":`, error.message)
      } else {
        console.log(`✅ Inserted product: ${product.name}`)
      }
    } catch (error) {
      console.error(`❌ Error with product "${product.name}":`, error)
    }
  }

  console.log('🎉 Product seeding complete!')
}

// Run the seeding
seedProducts()
  .catch(console.error)