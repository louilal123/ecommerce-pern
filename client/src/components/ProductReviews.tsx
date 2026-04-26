// src/components/ProductReviews.tsx
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

interface Review {
  id: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
}

// Static reviews data
const staticReviews: Review[] = [
  {
    id: '1',
    userName: 'Maria Santos',
    rating: 5,
    title: 'Amazing quality!',
    comment: 'This product exceeded my expectations. The material is premium and it looks exactly as pictured. Highly recommended!',
    date: '2025-03-15',
    verifiedPurchase: true,
  },
  {
    id: '2',
    userName: 'John Dela Cruz',
    rating: 4,
    title: 'Very good, but could improve',
    comment: 'Works well and feels sturdy. Shipping was fast. One small issue: the instructions were a bit unclear.',
    date: '2025-03-10',
    verifiedPurchase: true,
  },
  {
    id: '3',
    userName: 'Lea Salonga',
    rating: 5,
    title: 'Excellent customer service',
    comment: 'Had a question about sizing and support replied within minutes. Product itself is perfect. Will buy again.',
    date: '2025-03-05',
    verifiedPurchase: true,
  },
  {
    id: '4',
    userName: 'Ramon Bautista',
    rating: 3,
    title: 'Okay for the price',
    comment: 'Decent product but not exceptional. The packaging could be better. Still works fine.',
    date: '2025-02-28',
    verifiedPurchase: false,
  },
];

// Helper: render stars based on rating (1-5)
const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(fullStars)].map((_, i) => (
        <StarIcon key={`full-${i}`} className="h-4 w-4 text-yellow-400" />
      ))}
      {hasHalfStar && (
        <div className="relative">
          <StarOutlineIcon className="h-4 w-4 text-yellow-400" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <StarIcon className="h-4 w-4 text-yellow-400" />
          </div>
        </div>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <StarOutlineIcon key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      ))}
    </div>
  );
};

// Calculate average rating and count
const calculateStats = (reviews: Review[]) => {
  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const average = totalRating / reviews.length;
  const count = reviews.length;
  return { average, count };
};

export default function ProductReviews() {
  const { average, count } = calculateStats(staticReviews);

  return (
    <div className="mt-12 border-t border-gray-200 pt-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Customer Reviews</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              {renderStars(average)}
              <span className="text-sm text-gray-600 ml-1">{average.toFixed(1)} out of 5</span>
            </div>
            <span className="text-sm text-gray-500">({count} reviews)</span>
          </div>
        </div>
        <button className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-700 transition">
          Write a Review
        </button>
      </div>

      <div className="space-y-6">
        {staticReviews.map((review) => (
          <div key={review.id} className="border-b border-gray-100 pb-5 last:border-0">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {/* Avatar placeholder */}
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-medium">
                  {review.userName.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{review.userName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {renderStars(review.rating)}
                    <span className="text-xs text-gray-400">{review.date}</span>
                    {review.verifiedPurchase && (
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-2 ml-13 pl-0 sm:ml-11">
              <h4 className="font-medium text-gray-800">{review.title}</h4>
              <p className="text-gray-600 text-sm mt-1">{review.comment}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <button className="text-teal-600 text-sm hover:underline">
          Load More Reviews
        </button>
      </div>
    </div>
  );
}