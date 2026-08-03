// components/product/ReviewForm.tsx
'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface ReviewFormProps {
  productId: string
  userId: string
  existingReview: { id: string; rating: number; comment: string | null } | null
  onReviewSubmitted?: () => void
}

export function ReviewForm({ productId, userId, existingReview, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState(existingReview?.comment || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // ✅ If user has already reviewed, hide the form completely
  if (existingReview) {
    return null // ✅ No form shown at all
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      toast({ title: 'Please select a rating', variant: 'destructive' })
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from('reviews').upsert(
        {
          product_id: productId,
          user_id: userId,
          rating,
          comment,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'product_id,user_id' }
      )

      if (error) throw error

      toast({
        title: 'Review submitted!',
        description: 'Thanks for your feedback.',
        variant: 'success',
      })

      // ✅ Clear form
      setComment('')
      setRating(0)
      
      // ✅ Refresh and notify parent
      router.refresh()
      onReviewSubmitted?.()
    } catch (error: any) {
      toast({
        title: 'Error submitting review',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded-lg bg-black-light border border-gaming-green/10">
      <h3 className="font-semibold text-white">Write a Review</h3>

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
            disabled={isSubmitting}
          >
            <Star
              className={`h-7 w-7 transition-colors ${
                star <= (hoverRating || rating)
                  ? 'fill-emerald-400 text-emerald-400'
                  : 'text-gray-600'
              }`}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your thoughts about this product..."
        className="w-full px-3 py-2 rounded-lg bg-black/50 border border-emerald-400/20 focus:border-emerald-400 text-white min-h-[80px]"
        disabled={isSubmitting}
      />

      <Button 
        type="submit" 
        disabled={isSubmitting || rating === 0}
        className="gaming-btn w-full"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  )
}