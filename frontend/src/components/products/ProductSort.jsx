import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters, fetchProducts } from '../../redux/slices/productSlice';

const ProductSort = () => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.products);

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' },
  ];

  const handleSortChange = (e) => {
    const sort = e.target.value;
    dispatch(setFilters({ sort }));
    dispatch(fetchProducts({ ...filters, sort, page: 1 }));
  };

  return (
    <select
      value={filters.sort}
      onChange={handleSortChange}
      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
    >
      {sortOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default ProductSort;