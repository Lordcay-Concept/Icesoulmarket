// app/admin/reviews/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { DatabaseService } from '@/lib/services/database.service'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Star, Search, Trash2, MessageSquare } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

interface ReviewRow {
  id: string
  rating: number
  comment: string | null
  created_at: string
  product: { name: string; slug: string } | null
  profile: { username: string } | null
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
      setLoading(true)
      const supabase = DatabaseService.getSupabaseClient()
      const { data, error } = await supabase
        .from('reviews')
        .select('*, product:products(name, slug), profile:profiles(username)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setReviews(data || [])
    } catch (error) {
      console.error('Error loading reviews:', error)
      toast({
        title: 'Error',
        description: 'Failed to load reviews',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review?')) return

    try {
      const supabase = DatabaseService.getSupabaseClient()
      const { error } = await supabase.from('reviews').delete().eq('id', id)
      if (error) throw error

      toast({ title: 'Review deleted', variant: 'success' })
      loadReviews()
    } catch (error) {
      console.error('Error deleting review:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete review',
        variant: 'destructive',
      })
    }
  }

  const filteredReviews = reviews.filter(
    (r) =>
      r.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.profile?.username?.toLowerCase().includes(search.toLowerCase()) ||
      r.comment?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading reviews...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          <span className="text-emerald-400 neon-glow">Reviews</span>
        </h1>
        <p className="text-gray-400 mt-1">Moderate customer reviews and ratings</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by product, user, or comment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-black/50 border-emerald-400/20 focus:border-emerald-400 text-white"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredReviews.map((review) => (
          <Card key={review.id} className="glass border-emerald-400/10 rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">
                      {review.product?.name || 'Unknown Product'}
                    </span>
                    <span className="text-xs text-gray-500">
                      by {review.profile?.username || 'Anonymous'}
                    </span>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating ? 'fill-emerald-400 text-emerald-400' : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  {review.comment && (
                    <p className="text-gray-300 text-sm">{review.comment}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-400/20 text-red-400 hover:bg-red-400/10 flex-shrink-0"
                  onClick={() => handleDelete(review.id)}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No reviews found</p>
        </div>
      )}
    </div>
  )
}