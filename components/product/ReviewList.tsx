// components/product/ReviewList.tsx
'use client'

import { useState } from 'react'
import { Star, Edit, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Review {
  id: string
  rating: number
  comment: string | null
  created_at: string
  user_id?: string
  profile: { username: string; avatar_url: string | null } | null
}

interface ReviewListProps {
  reviews: Review[]
  currentUserId?: string
}

export function ReviewList({ reviews, currentUserId }: ReviewListProps) {
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  const [editRating, setEditRating] = useState(0)
  const [editComment, setEditComment] = useState('')
  const [hoverRating, setHoverRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const startEditing = (review: Review) => {
    setEditingReviewId(review.id)
    setEditRating(review.rating)
    setEditComment(review.comment || '')
  }

  const cancelEditing = () => {
    setEditingReviewId(null)
    setEditRating(0)
    setEditComment('')
  }

  const handleUpdateReview = async (reviewId: string) => {
    if (editRating === 0) {
      toast({ title: 'Please select a rating', variant: 'destructive' })
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('reviews')
        .update({
          rating: editRating,
          comment: editComment,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reviewId)

      if (error) throw error

      toast({
        title: 'Review updated!',
        description: 'Your review has been updated successfully.',
        variant: 'success',
      })

      setEditingReviewId(null)
      router.refresh()
    } catch (error: any) {
      toast({
        title: 'Error updating review',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (reviews.length === 0) {
    return <p className="text-gray-400">No reviews yet. Be the first to review this product!</p>
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const isEditing = editingReviewId === review.id
        const isOwnReview = currentUserId && review.user_id === currentUserId

        return (
          <div 
            key={review.id} 
            className={`p-4 rounded-lg bg-black-light border ${
              isEditing ? 'border-emerald-400/40' : 'border-emerald-400/10'
            } transition-all`}
          >
            {isEditing ? (
              // Edit Mode - Inline editing
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">
                    Editing Your Review
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                    onClick={cancelEditing}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setEditRating(star)}
                    >
                      <Star
                        className={`h-6 w-6 transition-colors ${
                          star <= (hoverRating || editRating)
                            ? 'fill-emerald-400 text-emerald-400'
                            : 'text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  placeholder="Update your review..."
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-emerald-400/20 focus:border-emerald-400 text-white min-h-[80px]"
                />

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-emerald-400 text-black hover:bg-emerald-400/80"
                    onClick={() => handleUpdateReview(review.id)}
                    disabled={isSubmitting || editRating === 0}
                  >
                    <Check className="h-3 w-3 mr-1" />
                    {isSubmitting ? 'Updating...' : 'Update Review'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-600 text-gray-400 hover:text-white"
                    onClick={cancelEditing}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              // View Mode - Normal review display
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">
                    {review.profile?.username || 'Anonymous'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                    {/* Show Edit button only for user's own review */}
                    {isOwnReview && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-emerald-400 h-6 px-2"
                        onClick={() => startEditing(review)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
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
                {review.comment && <p className="text-gray-300">{review.comment}</p>}
                {isOwnReview && !review.comment && (
                  <p className="text-xs text-gray-500 italic">No comment provided</p>
                )}
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}