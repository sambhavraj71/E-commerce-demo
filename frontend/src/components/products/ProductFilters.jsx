import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import axios from 'axios';
import { setFilters, fetchProducts } from '../../redux/slices/productSlice';

const ProductFilters = () => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.products);
  const [categories, setCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000 });
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  const handleCategoryChange = (categoryName) => {
    const categorySlug = categoryName.toLowerCase().replace(/ /g, '-');
    const newCategory = filters.category === categorySlug ? '' : categorySlug;
    dispatch(setFilters({ category: newCategory }));
    dispatch(fetchProducts({ ...filters, category: newCategory, page: 1 }));
  };

  const handlePriceChange = (type, value) => {
    const newValue = parseInt(value) || 0;
    if (type === 'min') {
      setPriceRange(prev => ({ ...prev, min: newValue }));
    } else {
      setPriceRange(prev => ({ ...prev, max: newValue }));
    }
  };

  const applyPriceFilter = () => {
    if (priceRange.min < 0 || priceRange.max < 0) return;
    dispatch(setFilters({ minPrice: priceRange.min, maxPrice: priceRange.max }));
    dispatch(fetchProducts({ ...filters, minPrice: priceRange.min, maxPrice: priceRange.max, page: 1 }));
  };

  const clearAllFilters = () => {
    setPriceRange({ min: 0, max: 50000 });
    dispatch(setFilters({
      category: '',
      minPrice: 0,
      maxPrice: 100000,
    }));
    dispatch(fetchProducts({ page: 1 }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold">Filters</h3>
        <button
          onClick={clearAllFilters}
          className="text-sm text-red-500 hover:text-red-600"
        >
          Clear All
        </button>
      </div>

      {/* Categories Section */}
      <div className="mb-6 border-b pb-4">
        <button
          onClick={() => toggleSection('categories')}
          className="flex justify-between items-center w-full font-semibold mb-3"
        >
          <span>Categories</span>
          {expandedSections.categories ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {expandedSections.categories && (
          <div className="space-y-2">
            {categories.map((category) => (
              <label key={category._id} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.category === category.name.toLowerCase().replace(/ /g, '-')}
                  onChange={() => handleCategoryChange(category.name)}
                  className="w-4 h-4 rounded border-gray-300 focus:ring-black"
                />
                <span className="flex-1 text-gray-700">{category.name}</span>
                <span className="text-2xl">{category.icon || '📦'}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range Section */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('price')}
          className="flex justify-between items-center w-full font-semibold mb-3"
        >
          <span>Price Range</span>
          {expandedSections.price ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {expandedSections.price && (
          <div>
            <div className="flex gap-3 mt-3">
              <input
                type="number"
                placeholder="Min Price"
                value={priceRange.min}
                onChange={(e) => handlePriceChange('min', e.target.value)}
                className="w-1/2 px-3 py-2 border rounded text-sm"
              />
              <input
                type="number"
                placeholder="Max Price"
                value={priceRange.max}
                onChange={(e) => handlePriceChange('max', e.target.value)}
                className="w-1/2 px-3 py-2 border rounded text-sm"
              />
            </div>
            <button
              onClick={applyPriceFilter}
              className="w-full mt-3 bg-black text-white py-2 rounded-lg text-sm hover:bg-gray-800"
            >
              Apply Price Filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductFilters;