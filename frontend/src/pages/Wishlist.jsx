import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiHeart, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { addToCart } from '../redux/slices/cartSlice';
import { fetchWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';
import toast from 'react-hot-toast';
import Loader from '../components/common/Loader';

const Wishlist = () => {
  const dispatch = useDispatch();
  const { items, isLoading } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  const handleRemoveFromWishlist = async (productId) => {
    await dispatch(removeFromWishlist(productId));
    dispatch(fetchWishlist()); // Refresh wishlist after removal
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart({ product, quantity: 1 }));
  };

  if (isLoading) return <Loader />;

  // Extract products from the wishlist items
  const wishlistProducts = items?.products || items || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>

        {wishlistProducts.length === 0 ? (
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
            {wishlistProducts.map((item, index) => {
              // Handle both formats: item.product or direct product
              const product = item.product || item;
              if (!product) return null;
              
              return (
                <motion.div
                  key={product._id || index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm overflow-hidden group"
                >
                  <Link to={`/product/${product._id}`}>
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={product.images?.[0]?.url || 'https://via.placeholder.com/300'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveFromWishlist(product._id);
                        }}
                        className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </Link>

                  <div className="p-4">
                    <Link to={`/product/${product._id}`}>
                      <h3 className="font-semibold text-lg mb-1 line-clamp-1 hover:text-gray-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-xl font-bold">₹{product.price}</span>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <span className="text-sm text-gray-400 line-through">₹{product.comparePrice}</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full btn-primary py-2 flex items-center justify-center space-x-2"
                    >
                      <FiShoppingBag size={16} />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;