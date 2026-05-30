import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const CategoryGrid = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container-custom text-center">
          <p>Loading categories...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="text-sm uppercase tracking-wider text-gray-500 font-semibold">
              Shop by Category
            </span>
            <h2 className="section-title mt-2">Explore Our Collections</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover products across various categories curated just for you
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <Link to={`/shop?category=${category.name.toLowerCase().replace(/ /g, '-')}`} className="block group">
                <div className="relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300">
                  {/* Category Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={category.image || 'https://via.placeholder.com/300'}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                    
                    {/* Category Icon Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-6xl drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                        {category.icon || '📦'}
                      </span>
                    </div>
                  </div>

                  {/* Category Info */}
                  <div className="p-4 text-center">
                    <h3 className="font-bold text-lg mb-1 group-hover:text-gray-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{category.description}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;