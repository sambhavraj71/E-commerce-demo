import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import Loader from '../components/common/Loader';

const OrderDetail = () => {
  const { id } = useParams();
  const { token } = useSelector((state) => state.auth);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrder(response.data.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'shipped': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) return <Loader />;
  if (!order) return <div className="text-center py-12">Order not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <Link to="/orders" className="text-black hover:underline mb-4 inline-block">
          ← Back to Orders
        </Link>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Order Header */}
          <div className="bg-gray-50 p-6 border-b">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold">Order #{order._id?.slice(-8)}</h1>
                <p className="text-gray-500 mt-1">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.orderStatus)}`}>
                {order.orderStatus?.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Order Items */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.orderItems?.map((item, index) => (
                  <div key={index} className="flex gap-4 border-b pb-4">
                    <img
                      src={item.image || 'https://via.placeholder.com/100'}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <Link to={`/product/${item.product}`} className="font-semibold hover:text-gray-600">
                        {item.name}
                      </Link>
                      <p className="text-gray-500 text-sm">Quantity: {item.quantity}</p>
                      <p className="text-gray-500 text-sm">Price: ₹{item.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold">{order.shippingAddress?.fullName}</p>
                <p>{order.shippingAddress?.addressLine1}</p>
                {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}</p>
                <p>Phone: {order.shippingAddress?.phone}</p>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Items Total</span>
                  <span>₹{order.itemsPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>₹{order.shippingPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (GST)</span>
                  <span>₹{order.taxPrice}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{order.totalPrice}</span>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Payment Method: {order.paymentMethod?.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Cancel Button (if order is pending) */}
            {order.orderStatus === 'pending' && (
              <button className="btn-secondary w-full md:w-auto bg-red-500 text-white hover:bg-red-600 border-none">
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;