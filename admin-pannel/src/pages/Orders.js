import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('https://ecommerce-backend-sambhav.onrender.com/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(
        `https://ecommerce-backend-sambhav.onrender.com/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders(); // Refresh the list
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return '#10b981';
      case 'shipped': return '#3b82f6';
      case 'processing': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading orders...</div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>Orders</h1>
      
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        overflow: 'auto', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead style={{ background: '#f9fafb' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left' }}>Order ID</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Customer</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Amount</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id} style={{ borderTop: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px' }}>#{order._id?.slice(-8)}</td>
                  <td style={{ padding: '12px' }}>{order.user?.name || 'N/A'}</td>
                  <td style={{ padding: '12px' }}>₹{order.totalPrice}</td>
                  <td style={{ padding: '12px' }}>
                    <select
                      value={order.orderStatus}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      disabled={updating === order._id}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                        background: getStatusColor(order.orderStatus),
                        color: 'white',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status} style={{ background: 'white', color: 'black' }}>
                          {status.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '12px' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '12px' }}>
                    <button
                      onClick={() => window.open(`http://localhost:3000/order/${order._id}`, '_blank')}
                      style={{
                        padding: '4px 12px',
                        cursor: 'pointer',
                        background: '#000',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px'
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
