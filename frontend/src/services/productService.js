import api from './api';

const productService = {
  async getProducts(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/products${queryParams ? `?${queryParams}` : ''}`);
    return response.data;
  },

  async getProductById(id) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  async getProductBySlug(slug) {
    const response = await api.get(`/products/slug/${slug}`);
    return response.data;
  },

  async getFeaturedProducts() {
    const response = await api.get('/products/featured');
    return response.data;
  },

  async getRelatedProducts(id) {
    const response = await api.get(`/products/${id}/related`);
    return response.data;
  },

  async createProduct(productData) {
    const response = await api.post('/products', productData);
    return response.data;
  },

  async updateProduct(id, productData) {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  async deleteProduct(id) {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

export default productService;