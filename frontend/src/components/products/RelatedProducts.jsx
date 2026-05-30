import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import ProductCard from './ProductCard';
import Loader from '../common/Loader';

const RelatedProducts = ({ productId, categoryId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (categoryId) {
      fetchRelatedProducts();
    }
  }, [categoryId, productId]);

  const fetchRelatedProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/products');
      let allProducts = response.data.data || [];
      
      console.log('All products:', allProducts);
      console.log('Current product ID:', productId);
      console.log('Category ID:', categoryId);
      
      // Filter products from same category, exclude current product
      let related = allProducts.filter(
        p => p.category?._id === categoryId && p._id !== productId
      );
      
      console.log('Related products:', related);
      
      // Shuffle and take first 5
      related = related.sort(() => 0.5 - Math.random()).slice(0, 5);
      setProducts(related);
    } catch (error) {
      console.error('Error fetching related products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">You May Also Like</h2>
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }
  
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold mb-4">You May Also Like</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {products.map((product, index) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;