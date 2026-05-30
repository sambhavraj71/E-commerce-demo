import api from './api';

const orderService = {
  async createOrder(orderData) {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  async getMyOrders() {
    const response = await api.get('/orders/my-orders');
    return response.data;
  },

  async getOrderById(id) {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  async cancelOrder(id, reason) {
    const response = await api.put(`/orders/${id}/cancel`, { reason });
    return response.data;
  },
};

export default orderService;