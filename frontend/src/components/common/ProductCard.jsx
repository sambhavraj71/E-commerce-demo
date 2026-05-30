import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingBag, FiEye, FiStar } from 'react-icons/fi';
import { addToCart } from '../../redux/slices/cartSlice';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const dispatch = useDispatch();

  const handleAddToCart = (e) => {
    e.preventDefault();
    dispatch(addToCart({ product, quantity: 1 }));
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="product-card group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product._id}`}>
        <div className="relative overflow-hidden aspect-square">
          <img
            src={product.images?.[0]?.url || 'https://via.placeholder.com/400x400?text=No+Image'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Discount Badge */}
          {discount > 0 && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discount}%
            </span>
          )}
          
          {/* Quick Actions */}
          <div className={`absolute bottom-3 left-0 right-0 flex justify-center space-x-2 transition-all duration-300 ${
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <button
              onClick={handleAddToCart}
              className="bg-black text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              <FiShoppingBag size={18} />
            </button>
            <button
              onClick={handleWishlist}
              className={`bg-white p-2 rounded-full transition-colors ${
                isWishlisted ? 'text-red-500' : 'text-black hover:text-red-500'
              }`}
            >
              <FiHeart size={18} />
            </button>
            <Link
              to={`/product/${product._id}`}
              className="bg-white text-black p-2 rounded-full hover:bg-black hover:text-white transition-colors"
            >
              <FiEye size={18} />
            </Link>
          </div>
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={`/product/${product._id}`}>
          <h3 className="font-semibold text-lg mb-1 line-clamp-1 hover:text-gray-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        {/* Rating */}
        <div className="flex items-center space-x-1 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <FiStar
                key={i}
                size={14}
                className={`${
                  i < Math.floor(product.ratings || 0)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">({product.numReviews || 0})</span>
        </div>
        
        {/* Price */}
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold text-black">₹{product.price}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-sm text-gray-400 line-through">₹{product.comparePrice}</span>
          )}
        </div>
        
        {/* Free Shipping Badge */}
        {product.price > 999 && (
          <span className="inline-block mt-2 text-xs text-green-600 font-semibold">
            Free Shipping
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;