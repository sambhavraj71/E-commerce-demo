import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingBag, FiEye, FiStar } from 'react-icons/fi';
import { addToCart } from '../../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../redux/slices/wishlistSlice';
import toast from 'react-hot-toast';
import api from '../../services/api';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!isAuthenticated) return;
      try {
        const response = await api.get('/wishlist');
        const wishlistData = response.data?.data?.products || [];
        const exists = wishlistData.some(item => item.product?._id === product._id);
        setIsWishlisted(exists);
      } catch (error) {
        console.error('Error checking wishlist status:', error);
      }
    };
    checkWishlistStatus();
  }, [product._id, isAuthenticated]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({ product, quantity: 1 }));
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      navigate('/login');
      return;
    }
    
    if (isWishlisted) {
      await dispatch(removeFromWishlist(product._id));
      setIsWishlisted(false);
    } else {
      await dispatch(addToWishlist(product._id));
      setIsWishlisted(true);
    }
  };

  const handleProductClick = () => {
    navigate(`/product/${product._id}`);
  };

  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  if (!product) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleProductClick}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-square bg-gray-100">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
          </div>
        )}
        <img
          src={product.images?.[0]?.url || 'https://via.placeholder.com/400x400?text=No+Image'}
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {discount > 0 && (
          <div className="absolute top-3 left-3">
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
              {discount}% OFF
            </span>
          </div>
        )}
        
        {/* Quick Action Buttons */}
        <div className={`absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center gap-3 transition-all duration-500 ${
          isHovered ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}>
          <button
            onClick={handleAddToCart}
            className="bg-white text-gray-900 p-3 rounded-full hover:bg-gray-900 hover:text-white transition-all duration-300 transform hover:scale-110"
          >
            <FiShoppingBag size={20} />
          </button>
          <button
            onClick={handleWishlist}
            className={`bg-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${
              isWishlisted ? 'text-red-500' : 'text-gray-900 hover:text-red-500'
            }`}
          >
            <FiHeart size={20} />
          </button>
          <Link
            to={`/product/${product._id}`}
            onClick={(e) => e.stopPropagation()}
            className="bg-white text-gray-900 p-3 rounded-full hover:bg-gray-900 hover:text-white transition-all duration-300 transform hover:scale-110"
          >
            <FiEye size={20} />
          </Link>
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-1">
          {product.name}
        </h3>
        
        <div className="flex items-center gap-2 mb-2">
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
          <span className="text-xs text-gray-400">({product.numReviews || 0})</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-sm text-gray-400 line-through">₹{product.comparePrice}</span>
          )}
        </div>
        
        {product.price > 999 && (
          <div className="mt-2">
            <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
              Free Shipping
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;