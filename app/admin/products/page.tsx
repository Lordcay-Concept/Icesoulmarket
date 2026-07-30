// app/admin/products/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { DatabaseService } from '@/lib/services/database.service'
import { Product } from '@/types/product.types'
import { MultiImageUpload } from '@/components/admin/MultiImageUpload'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Package,
  X,
  Check,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import Image from 'next/image'
import { ImageUpload } from '@/components/admin/ImageUpload'

const PAGE_SIZE = 12

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category_id: '',
    description: '',
    price: '',
    discount_price: '',
    stock_quantity: '',
    platform: '',
    images: [] as string[],
    is_active: true,
    is_featured: false,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [productsData, categoriesData] = await Promise.all([
        DatabaseService.getProducts(),
        DatabaseService.getCategories(),
      ])
      setProducts(productsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const categoryId = formData.category_id || null
      
      const productData = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        category_id: categoryId,
        description: formData.description,
        price: parseFloat(formData.price),
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        stock_quantity: parseInt(formData.stock_quantity),
        platform: formData.platform.split(',').map(p => p.trim()).filter(p => p),
        images: formData.images,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
      }

      const supabase = DatabaseService.getSupabaseClient()
      
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)
        
        if (error) throw error
        toast({
          title: 'Success!',
          description: 'Product updated successfully',
          variant: 'success',
        })
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData)
        
        if (error) throw error
        toast({
          title: 'Success!',
          description: 'Product created successfully',
          variant: 'success',
        })
      }

      // Keep customer-facing pages in sync immediately after admin changes
      await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/products' }),
      })
      await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/categories' }),
      })

      setIsModalOpen(false)
      setEditingProduct(null)
      resetForm()
      loadData()
    } catch (error) {
      console.error('Error saving product:', error)
      toast({
        title: 'Error',
        description: 'Failed to save product',
        variant: 'destructive',
      })
    }
  }

  const handleRemoveImage = (indexToRemove: number) => {
  setFormData((prev) => ({
    ...prev,
    images: prev.images.filter((_, index) => index !== indexToRemove)
  }))
}

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      const supabase = DatabaseService.getSupabaseClient()
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      toast({
        title: 'Success!',
        description: 'Product deleted successfully',
        variant: 'success',
      })
      loadData()
    } catch (error) {
      console.error('Error deleting product:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      category_id: '',
      description: '',
      price: '',
      discount_price: '',
      stock_quantity: '',
      platform: '',
      images: [],
      is_active: true,
      is_featured: false,
    })
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      slug: product.slug,
      category_id: product.category_id || '', 
      description: product.description,
      price: product.price.toString(),
      discount_price: product.discount_price?.toString() || '',
      stock_quantity: product.stock_quantity.toString(),
      platform: product.platform.join(', '),
      images: product.images || [],
      is_active: product.is_active,
      is_featured: product.is_featured,
    })
    setIsModalOpen(true)
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  )

  // Reset to page 1 whenever the search term changes, so you're never
  // stuck on a page number that no longer has results
  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading products...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">
            <span className="text-emerald-400 neon-glow">Products</span>
          </h1>
          <p className="text-gray-400 mt-1">Manage your game products</p>
        </div>
        <Button 
          className="gaming-btn"
          onClick={() => {
            resetForm()
            setEditingProduct(null)
            setIsModalOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-black/50 border-emerald-400/20 focus:border-emerald-400 text-white"
          />
        </div>
        <p className="text-sm text-gray-400 whitespace-nowrap">
          {filteredProducts.length} product{filteredProducts.length === 1 ? '' : 's'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedProducts.map((product) => (
          <Card key={product.id} className="glass border-emerald-400/10 rounded-2xl hover:border-emerald-400/30 transition-all">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-black/50 border border-emerald-400/10">
                  <Image
                    src={product.images[0] || '/images/placeholder.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate">{product.name}</h3>
                  <p className="text-sm text-gray-400">{product.category?.name || 'Uncategorized'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-emerald-400 font-bold">${product.price}</span>
                    <span className="text-xs text-gray-400">Stock: {product.stock_quantity}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      product.is_active ? 'bg-emerald-400/20 text-emerald-400' : 'bg-red-400/20 text-red-400'
                    }`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {product.is_featured && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-400/20 text-yellow-400">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-emerald-400/10">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-emerald-400/20 text-emerald-400 hover:bg-emerald-400/10"
                  onClick={() => openEditModal(product)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-red-400/20 text-red-400 hover:bg-red-400/10"
                  onClick={() => handleDelete(product.id)}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No products found</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="icon"
            className="border-emerald-400/20"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant="ghost"
              className={`px-3 ${
                page === currentPage
                  ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/30'
                  : 'text-gray-300 hover:text-emerald-400'
              }`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            size="icon"
            className="border-emerald-400/20"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass rounded-2xl border border-emerald-400/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Product Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-black/50 border-emerald-400/20 focus:border-emerald-400 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Category</Label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-emerald-400/20 focus:border-emerald-400 text-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Description</Label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-emerald-400/20 focus:border-emerald-400 text-white min-h-[100px]"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="bg-black/50 border-emerald-400/20 focus:border-emerald-400 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Discount Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.discount_price}
                    onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                    className="bg-black/50 border-emerald-400/20 focus:border-emerald-400 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Stock</Label>
                  <Input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    className="bg-black/50 border-emerald-400/20 focus:border-emerald-400 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Platforms (comma separated)</Label>
                  <Input
                    placeholder="PC, PlayStation, Xbox"
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="bg-black/50 border-emerald-400/20 focus:border-emerald-400 text-white"
                  />
                </div>
                </div>

               <div className="space-y-2 col-span-2">
                <Label className="text-gray-300">Product Images</Label>
                <MultiImageUpload
                    value={formData.images}
                    onChange={(urls: string[]) => setFormData({ ...formData, images: urls })}
                    maxImages={20}
                />
                </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-emerald-400/20 bg-black/50"
                  />
                  <Label className="text-gray-300">Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="rounded border-emerald-400/20 bg-black/50"
                  />
                  <Label className="text-gray-300">Featured</Label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 gaming-btn">
                  <Check className="mr-2 h-4 w-4" />
                  {editingProduct ? 'Update' : 'Create'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-emerald-400/20 text-white hover:bg-emerald-400/10"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}