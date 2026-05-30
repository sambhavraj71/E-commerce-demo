import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiThumbsUp, FiUser, FiClock, FiEdit2, FiX } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/reviews/product/${productId}`);
      setReviews(response.data.data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to submit a review');
      return;
    }
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/reviews',
        { productId, rating, title, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Review submitted successfully!');
      setRating(0);
      setTitle('');
      setComment('');
      setShowForm(false);
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId) => {
    if (!isAuthenticated) {
      toast.error('Please login to mark as helpful');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/reviews/${reviewId}/helpful`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchReviews();
      toast.success('Marked as helpful');
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => Math.floor(r.rating) === star).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { star, count, percentage };
  });

  if (loading) {
    return <div className="text-center py-4">Loading reviews...</div>;
  }

  return (
    <div className="mt-8">
      {/* Reviews Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Customer Reviews</h2>
        {isAuthenticated && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <FiEdit2 size={14} />
            Write a Review
          </button>
        )}
      </div>
      
      {/* Rating Summary - Compact */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold">{calculateAverageRating()}</div>
            <div className="flex items-center mt-1">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(calculateAverageRating())
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-1">{reviews.length} reviews</div>
          </div>
          
          <div className="flex-1 space-y-1">
            {ratingDistribution.map(({ star, percentage }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs w-6">{star}★</span>
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-8">{percentage.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Write Review Form - Animated */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border rounded-lg p-4 mb-4 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Write Your Review</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitReview}>
              <div className="mb-3">
                <label className="block text-xs font-medium mb-1">Your Rating *</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none"
                    >
                      <FiStar
                        className={`w-6 h-6 transition-colors ${
                          star <= (hoverRating || rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-3">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Review title"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                  required
                />
              </div>
              
              <div className="mb-3">
                <textarea
                  rows="3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience..."
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-black text-white py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Reviews List */}
      {reviews.length === 0 && !showForm ? (
        <div className="text-center py-8 text-gray-400 text-sm border rounded-lg bg-gray-50">
          No reviews yet. Be the first to review this product!
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border-b pb-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`w-3 h-3 ${
                            i < review.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-medium text-sm">{review.title}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <FiUser size={12} />
                      {review.user?.name || 'Anonymous'}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiClock size={12} />
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleHelpful(review._id)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-black transition-colors"
                >
                  <FiThumbsUp size={12} />
                  <span>{review.helpful?.length || 0}</span>
                </button>
              </div>
              <p className="text-gray-600 text-sm mt-2">{review.comment}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;