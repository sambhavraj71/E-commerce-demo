import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  FiMinus, FiPlus, FiHeart, FiShare2, FiTruck, FiRefreshCw, FiShield, 
  FiStar, FiCheck, FiCopy
} from 'react-icons/fi';
import { fetchProductById, clearCurrentProduct } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import ProductReviews from '../components/products/ProductReviews';
import RelatedProducts from '../components/products/RelatedProducts';
import Loader from '../components/common/Loader';
import Breadcrumb from '../components/common/Breadcrumb';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentProduct, isLoading } = useSelector((state) => state.products);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    dispatch(fetchProductById(id));
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch, id]);

  const handleAddToCart = () => {
    dispatch(addToCart({
      product: currentProduct,
      quantity,
      variant: selectedVariant,
    }));
  };

  const handleQuantityChange = (type) => {
    if (type === 'increase') {
      setQuantity(prev => Math.min(prev + 1, currentProduct?.stock || 10));
    } else {
      setQuantity(prev => Math.max(prev - 1, 1));
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/product/${currentProduct?._id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentProduct?.name,
          text: `Check out this product: ${currentProduct?.name}`,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Product link copied to clipboard!');
      } catch (err) {
        toast.error('Failed to copy link');
      }
    }
    setShowShareMenu(false);
  };

  const copyLink = async () => {
    const shareUrl = `${window.location.origin}/product/${currentProduct?._id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
    setShowShareMenu(false);
  };

  if (isLoading || !currentProduct) {
    return <Loader />;
  }

  const discount = currentProduct.comparePrice && currentProduct.comparePrice > currentProduct.price
    ? Math.round(((currentProduct.comparePrice - currentProduct.price) / currentProduct.comparePrice) * 100)
    : 0;

  const breadcrumbItems = [
    { name: 'Shop', path: '/shop' },
    { name: currentProduct.category?.name, path: `/shop?category=${currentProduct.category?.name?.toLowerCase().replace(/ /g, '-')}` },
    { name: currentProduct.name },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <Breadcrumb items={breadcrumbItems} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg overflow-hidden">
              <img
                src={currentProduct.images?.[selectedImage]?.url || 'https://via.placeholder.com/600'}
                alt={currentProduct.name}
                className="w-full h-auto object-cover"
              />
            </div>
            {currentProduct.images && currentProduct.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {currentProduct.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`border-2 rounded-lg overflow-hidden ${
                      selectedImage === index ? 'border-black' : 'border-transparent'
                    }`}
                  >
                    <img src={image.url} alt={`${currentProduct.name} ${index + 1}`} className="w-full h-20 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              {discount > 0 && (
                <span className="inline-block bg-red-500 text-white text-xs font-bold px-2 py-1 rounded mb-2">
                  {discount}% OFF
                </span>
              )}
              <h1 className="text-3xl font-bold mb-2">{currentProduct.name}</h1>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(currentProduct.ratings || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  {currentProduct.numReviews || 0} Reviews
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl font-bold">₹{currentProduct.price}</span>
              {currentProduct.comparePrice && currentProduct.comparePrice > currentProduct.price && (
                <span className="text-lg text-gray-400 line-through">₹{currentProduct.comparePrice}</span>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-600">{currentProduct.description}</p>
            </div>

            {/* Variants */}
            {currentProduct.variants && currentProduct.variants.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Variants</h3>
                <div className="flex flex-wrap gap-3">
                  {currentProduct.variants.map((variant) => (
                    <button
                      key={variant.name}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-4 py-2 border rounded-lg ${
                        selectedVariant?.name === variant.name
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-black'
                      }`}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${currentProduct.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">
                {currentProduct.stock > 0 ? `${currentProduct.stock} items in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4">
              <span className="font-semibold">Quantity:</span>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => handleQuantityChange('decrease')}
                  className="px-3 py-2 hover:bg-gray-100"
                >
                  <FiMinus />
                </button>
                <span className="w-12 text-center">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange('increase')}
                  className="px-3 py-2 hover:bg-gray-100"
                >
                  <FiPlus />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={currentProduct.stock === 0}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Cart
              </button>
              <button className="px-6 py-3 border rounded-lg hover:border-black transition-colors">
                <FiHeart size={20} />
              </button>
              
              {/* Share Button with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="px-6 py-3 border rounded-lg hover:border-black transition-colors"
                >
                  <FiShare2 size={20} />
                </button>
                
                {showShareMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                    <button
                      onClick={handleShare}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-t-lg flex items-center gap-2"
                    >
                      <FiShare2 size={16} />
                      Share via...
                    </button>
                    <button
                      onClick={copyLink}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-b-lg flex items-center gap-2"
                    >
                      <FiCopy size={16} />
                      Copy Link
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Info */}
            <div className="border-t pt-6 space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <FiTruck size={20} className="text-gray-600" />
                <span>Free shipping on orders over ₹999</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <FiRefreshCw size={20} className="text-gray-600" />
                <span>30-day easy returns</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <FiShield size={20} className="text-gray-600" />
                <span>2-year warranty on all products</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <ProductReviews productId={currentProduct._id} />

        {/* Related Products */}
        <RelatedProducts 
          productId={currentProduct._id} 
          categoryId={currentProduct.category?._id} 
        />
      </div>
    </div>
  );
};

export default ProductDetail;