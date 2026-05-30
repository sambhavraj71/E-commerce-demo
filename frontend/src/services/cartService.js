import api from './api';

const cartService = {
  async getCart() {
    const response = await api.get('/cart');
    return response.data;
  },

  async addToCart(productId, quantity, variant = null) {
    const response = await api.post('/cart', { productId, quantity, variant });
    return response.data;
  },

  async updateCartItem(itemId, quantity) {
    const response = await api.put(`/cart/${itemId}`, { quantity });
    return response.data;
  },

  async removeFromCart(itemId) {
    const response = await api.delete(`/cart/${itemId}`);
    return response.data;
  },

  async clearCart() {
    const response = await api.delete('/cart');
    return response.data;
  },

  async applyCoupon(code) {
    const response = await api.post('/cart/apply-coupon', { code });
    return response.data;
  },
};

export default cartService;