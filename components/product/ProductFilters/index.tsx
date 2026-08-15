// components/product/ProductFilters/index.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, X } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
}

interface ProductFiltersProps {
  categories?: Category[]
  platforms?: string[]
}

export function ProductFiltersComponent({ 
  categories = [],
  platforms = ['PC', 'PlayStation', 'Xbox', 'All Platforms']
}: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [search, setSearch] = useState(searchParams?.get('search') || '')
  const [category, setCategory] = useState(searchParams?.get('category') || '')
  const [platform, setPlatform] = useState(searchParams?.get('platform') || '')
  const [sortBy, setSortBy] = useState(searchParams?.get('sort') || '')

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category) params.set('category', category)
    if (platform) params.set('platform', platform)
    if (sortBy) params.set('sort', sortBy)
    router.push(`/products?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearch('')
    setCategory('')
    setPlatform('')
    setSortBy('')
    router.push('/products')
  }

  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category) params.set('category', category)
    if (platform) params.set('platform', platform)
    if (sortBy) params.set('sort', sortBy)
    const newUrl = `/products?${params.toString()}`
    if (window.location.pathname + window.location.search !== newUrl) {
      router.push(newUrl)
    }
  }, [category, platform, sortBy])

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-theme" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            className="pl-9 bg-black/50 border-theme/20 focus:border-theme focus:ring-theme/20 text-white placeholder:text-gray-500"
          />
        </div>
        <Button 
          onClick={applyFilters}
          className="gaming-btn"
        >
          Search
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-4 items-end">
        {categories.length > 0 && (
          <div className="flex-1 min-w-[150px]">
            <Label className="text-sm text-gray-400 mb-1 block">Category</Label>
            <Select 
              value={category} 
              onValueChange={(value) => {
                setCategory(value)
              }}
            >
              <SelectTrigger className="bg-black/50 border-theme/20 text-white focus:border-theme">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="glass border-theme/20">
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.slug}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div className="flex-1 min-w-[150px]">
          <Label className="text-sm text-gray-400 mb-1 block">Platform</Label>
          <Select value={platform} onValueChange={(value) => setPlatform(value)}>
            <SelectTrigger className="bg-black/50 border-theme/20 text-white focus:border-theme">
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent className="glass border-theme/20">
              <SelectItem value="">All Platforms</SelectItem>
              {platforms.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1 min-w-[150px]">
          <Label className="text-sm text-gray-400 mb-1 block">Sort By</Label>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
            <SelectTrigger className="bg-black/50 border-theme/20 text-white focus:border-theme">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent className="glass border-theme/20">
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {(category || platform || sortBy || search) && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="text-gray-400 hover:text-white hover:bg-theme/10"
          >
            <X className="h-4 w-4 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  )
}