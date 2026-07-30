// components/product/ReviewList.tsx
import { Star } from 'lucide-react'

interface Review {
  id: string
  rating: number
  comment: string | null
  created_at: string
  profile: { username: string; avatar_url: string | null } | null
}

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <p className="text-gray-400">No reviews yet. Be the first to review this product!</p>
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="p-4 rounded-lg bg-black-light border border-gaming-green/10">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-white">
              {review.profile?.username || 'Anonymous'}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(review.created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="flex gap-0.5 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < review.rating ? 'fill-gaming-green text-gaming-green' : 'text-gray-600'
                }`}
              />
            ))}
          </div>
          {review.comment && <p className="text-gray-300">{review.comment}</p>}
        </div>
      ))}
    </div>
  )
}