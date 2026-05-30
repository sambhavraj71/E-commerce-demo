import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiArrowRight } from 'react-icons/fi';
import ProductCard from '../common/ProductCard';
import api from '../../services/api';
import Loader from '../common/Loader';

const TrendingProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingProducts();
  }, []);

  const fetchTrendingProducts = async () => {
  try {
    const response = await api.get('/products?sort=popular&limit=8');
    setProducts(response.data.products || []);
  } catch (error) {
    console.error('Error fetching trending products:', error);
    setProducts([]);
  } finally {
    setLoading(false);
  }
};

  if (loading) return <Loader />;

  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <FiTrendingUp className="text-red-500 text-2xl" />
            <h2 className="section-title">Trending Now</h2>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Most popular products loved by our customers
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="btn-primary inline-flex items-center space-x-2">
            <span>Explore Trending</span>
            <FiArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;