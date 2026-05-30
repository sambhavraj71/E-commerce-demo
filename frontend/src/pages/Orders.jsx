import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPackage, FiTruck, FiCheckCircle, FiClock, FiEye } from 'react-icons/fi';
import api from '../services/api';
import Loader from '../components/common/Loader';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/my-orders');
      setOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewOrderDetails = async (orderId) => {
  try {
    // ✅ API instance automatically sahi URL use karega
    const response = await api.get(`/orders/${orderId}`);
    setSelectedOrder(response.data.data);
    setShowModal(true);
  } catch (error) {
    console.error('Error fetching order details:', error);
    toast.error('Could not fetch order details');
  }
};

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <FiCheckCircle className="text-green-500" size={20} />;
      case 'shipped':
        return <FiTruck className="text-blue-500" size={20} />;
      case 'processing':
        return <FiPackage className="text-yellow-500" size={20} />;
      default:
        return <FiClock className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'shipped':
        return 'bg-blue-100 text-blue-700';
      case 'processing':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <FiPackage size={60} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6">Looks like you haven't placed any orders</p>
            <Link to="/shop" className="btn-primary inline-block">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                {/* Order Header */}
                <div className="bg-gray-50 p-4 border-b flex flex-wrap justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Order #{order._id.slice(-8)}</p>
                    <p className="text-sm text-gray-500">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.orderStatus)}`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(order.orderStatus)}
                        <span className="capitalize">{order.orderStatus}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => viewOrderDetails(order._id)}
                      className="text-black hover:text-gray-600 flex items-center space-x-1"
                    >
                      <FiEye size={16} />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4">
                  <div className="space-y-4">
                    {order.orderItems.slice(0, 2).map((item) => (
                      <div key={item._id} className="flex space-x-4">
                        <img
                          src={item.image || 'https://via.placeholder.com/80'}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          <p className="text-sm font-medium">₹{item.price?.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                    {order.orderItems.length > 2 && (
                      <p className="text-sm text-gray-500">
                        + {order.orderItems.length - 2} more items
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="text-xl font-bold">₹{order.totalPrice?.toFixed(2)}</p>
                    </div>
                    {order.orderStatus === 'delivered' && (
                      <button className="text-sm text-black border px-4 py-2 rounded-lg hover:bg-black hover:text-white transition-colors">
                        Write a Review
                      </button>
                    )}
                    {order.orderStatus === 'pending' && (
                      <button className="text-sm text-red-500 border border-red-500 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-auto">
            <h2 className="text-xl font-bold mb-4">Order Details</h2>
            
            <div className="space-y-3">
              <p><strong>Order ID:</strong> {selectedOrder._id}</p>
              <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {selectedOrder.orderStatus}</p>
              <p><strong>Payment:</strong> {selectedOrder.paymentStatus}</p>
              
              <div className="border-t pt-3">
                <p className="font-semibold mb-2">Items:</p>
                {selectedOrder.orderItems?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm mb-1">
                    <span>{item.name} x {item.quantity}</span>
                    <span>₹{item.price?.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between font-bold mt-2">
                  <span>Total:</span>
                  <span>₹{selectedOrder.totalPrice?.toFixed(2)}</span>
                </div>
              </div>
              
              {selectedOrder.shippingAddress && (
                <div className="border-t pt-3">
                  <p className="font-semibold">Shipping Address:</p>
                  <p className="text-sm">{selectedOrder.shippingAddress.fullName}</p>
                  <p className="text-sm">{selectedOrder.shippingAddress.addressLine1}</p>
                  <p className="text-sm">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                  <p className="text-sm">Phone: {selectedOrder.shippingAddress.phone}</p>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setShowModal(false)}
              className="mt-6 w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
