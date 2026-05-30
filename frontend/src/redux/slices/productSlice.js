import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

let activeRequests = 0;

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async ({ page = 1, limit = 12, category, search, sort, minPrice, maxPrice } = {}, { rejectWithValue }) => {
    try {
      activeRequests++;
      console.log(`Fetching products (Request ${activeRequests})`);
      
      let url = `/products?page=${page}&limit=${limit}`;
      if (category && category !== '') url += `&category=${category}`;
      if (search) url += `&search=${search}`;
      if (sort) url += `&sort=${sort}`;
      if (minPrice && minPrice > 0) url += `&minPrice=${minPrice}`;
      if (maxPrice && maxPrice < 100000) url += `&maxPrice=${maxPrice}`;
      
      const response = await api.get(url);
      activeRequests--;
      return response.data;
    } catch (error) {
      activeRequests--;
      return rejectWithValue(error.response?.data);
    }
  }
);

// Rest of your productSlice remains the same...

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/products/featured');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    featuredProducts: [],
    currentProduct: null,
    totalPages: 1,
    currentPage: 1,
    totalProducts: 0,
    isLoading: false,
    error: null,
    filters: {
      category: '',
      sort: 'newest',
      minPrice: 0,
      maxPrice: 100000,
      search: '',
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        category: '',
        sort: 'newest',
        minPrice: 0,
        maxPrice: 100000,
        search: '',
      };
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.data;
        state.totalPages = action.payload.pagination?.pages || 1;
        state.currentPage = action.payload.pagination?.page || 1;
        state.totalProducts = action.payload.pagination?.total || 0;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error('Failed to fetch products');
      })
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload.data;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error('Failed to fetch product details');
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featuredProducts = action.payload.data;
      });
  },
});

export const { setFilters, clearFilters, clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;