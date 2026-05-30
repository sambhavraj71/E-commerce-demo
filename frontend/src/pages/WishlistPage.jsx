import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FiHeart, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import api from '../services/api';
import { addToCart } from '../redux/slices/cartSlice';
import toast from 'react-hot-toast';
import Loader from '../components/common/Loader';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState({ products: [] });
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await api.get('/wishlist');
      setWishlist(response.data.data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      toast.success('Removed from wishlist');
      fetchWishlist();
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart({ product, quantity: 1 }));
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>

        {wishlist.products?.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <FiHeart size={60} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500 mb-6">Save your favorite items here</p>
            <Link to="/shop" className="btn-primary inline-block">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.products?.map((item, index) => (
              <motion.div
                key={item.product._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm overflow-hidden group"
              >
                <Link to={`/product/${item.product._id}`}>
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={item.product.images?.[0]?.url || 'https://via.placeholder.com/300'}
                      alt={item.product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveFromWishlist(item.product._id);
                      }}
                      className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </Link>

                <div className="p-4">
                  <Link to={`/product/${item.product._id}`}>
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">{item.product.name}</h3>
                  </Link>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-xl font-bold">₹{item.product.price}</span>
                    {item.product.comparePrice && item.product.comparePrice > item.product.price && (
                      <span className="text-sm text-gray-400 line-through">₹{item.product.comparePrice}</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddToCart(item.product)}
                    className="w-full btn-primary py-2 flex items-center justify-center space-x-2"
                  >
                    <FiShoppingBag size={16} />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;