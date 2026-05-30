import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFilter, FiGrid, FiList } from 'react-icons/fi';
import ProductCard from '../components/products/ProductCard';
import ProductFilters from '../components/products/ProductFilters';
import ProductSort from '../components/products/ProductSort';
import Pagination from '../components/common/Pagination';
import Loader from '../components/common/Loader';
import { fetchProducts, setFilters } from '../redux/slices/productSlice';

const Shop = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { products, totalPages, currentPage, isLoading, filters } = useSelector(
    (state) => state.products
  );
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');
    
    if (category) {
      dispatch(setFilters({ category }));
    }
    if (search) dispatch(setFilters({ search }));
    if (sort) dispatch(setFilters({ sort }));
    
    // Fetch products only once on initial load
    dispatch(fetchProducts({ ...filters, page: 1 }));
  }, []); // Empty dependency array to run only once

  const handlePageChange = (page) => {
    dispatch(fetchProducts({ ...filters, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading && products.length === 0) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {filters.category ? filters.category.replace(/-/g, ' ').toUpperCase() : 'Shop Collection'}
          </h1>
          <p className="text-gray-600">
            {products.length} {products.length === 1 ? 'product' : 'products'} found
          </p>
        </div>

        {/* Mobile Filter Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden w-full mb-4 flex items-center justify-center space-x-2 bg-white border border-gray-300 rounded-lg py-2"
        >
          <FiFilter />
          <span>Filters & Sort</span>
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:block ${showFilters ? 'block' : 'hidden'} w-80 flex-shrink-0`}>
            <ProductFilters />
          </div>

          {/* Products Section */}
          <div className="flex-1">
            {/* Sort and View Options */}
            <div className="flex justify-between items-center mb-6">
              <ProductSort />
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-black text-white' : 'bg-white text-gray-600'}`}
                >
                  <FiGrid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-black text-white' : 'bg-white text-gray-600'}`}
                >
                  <FiList size={20} />
                </button>
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <Loader />
            ) : products.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500 text-lg">No products found in this category</p>
                <button 
                  onClick={() => {
                    dispatch(setFilters({ category: '' }));
                    dispatch(fetchProducts({ page: 1 }));
                  }}
                  className="mt-4 text-black underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className={`grid ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
                  : 'grid-cols-1 gap-4'
              }`}>
                {products.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination totalPages={totalPages} currentPage={currentPage} onPageChange={handlePageChange} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;