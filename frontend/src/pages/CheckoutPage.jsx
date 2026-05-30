import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { FiTruck, FiShield, FiCreditCard, FiDollarSign, FiArrowLeft } from 'react-icons/fi';
import { clearCart } from '../redux/slices/cartSlice';
import api from '../services/api';
import toast from 'react-hot-toast';
import Loader from '../components/common/Loader';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, totalAmount } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/users/addresses');
      setAddresses(response.data.data);
      const defaultAddress = response.data.data.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const shippingCost = totalAmount > 999 ? 0 : 50;
  const taxAmount = (totalAmount * 0.18);
  const finalAmount = totalAmount + shippingCost + taxAmount;

  const addressSchema = Yup.object({
    fullName: Yup.string().required('Full name is required'),
    addressLine1: Yup.string().required('Address is required'),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State is required'),
    postalCode: Yup.string().matches(/^[0-9]{6}$/, 'Invalid postal code').required('Postal code is required'),
    phone: Yup.string().matches(/^[0-9]{10}$/, 'Invalid phone number').required('Phone is required'),
  });

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a shipping address');
      return;
    }

    setIsProcessing(true);

    const orderData = {
      orderItems: items.map(item => ({
        product: item.product._id,
        name: item.product.name,
        image: item.product.images?.[0]?.url,
        price: item.price,
        quantity: item.quantity,
        variant: item.variant,
      })),
      shippingAddress: selectedAddress,
      paymentMethod,
      itemsPrice: totalAmount,
      taxPrice: taxAmount,
      shippingPrice: shippingCost,
      totalPrice: finalAmount,
    };

    try {
      const response = await api.post('/orders', orderData);
      toast.success('Order placed successfully!');
      dispatch(clearCart());
      navigate(`/orders`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddAddress = async (values, { resetForm }) => {
    try {
      const response = await api.post('/users/addresses', values);
      setAddresses([...addresses, response.data.data]);
      setSelectedAddress(response.data.data);
      setShowAddressForm(false);
      resetForm();
      toast.success('Address added successfully');
    } catch (error) {
      toast.error('Failed to add address');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center space-x-2 text-gray-600 hover:text-black mb-6"
        >
          <FiArrowLeft size={18} />
          <span>Back to Cart</span>
        </button>

        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Shipping & Payment */}
          <div className="flex-1 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
              
              {addresses.length > 0 && !showAddressForm && (
                <div className="space-y-3 mb-4">
                  {addresses.map((address) => (
                    <label
                      key={address._id}
                      className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedAddress?._id === address._id
                          ? 'border-black bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddress?._id === address._id}
                        onChange={() => setSelectedAddress(address)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">{address.fullName}</p>
                        <p className="text-sm text-gray-600">{address.addressLine1}</p>
                        {address.addressLine2 && <p className="text-sm text-gray-600">{address.addressLine2}</p>}
                        <p className="text-sm text-gray-600">
                          {address.city}, {address.state} - {address.postalCode}
                        </p>
                        <p className="text-sm text-gray-600">Phone: {address.phone}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {!showAddressForm ? (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="text-black hover:text-gray-600 text-sm"
                >
                  + Add New Address
                </button>
              ) : (
                <Formik
                  initialValues={{
                    fullName: user?.name || '',
                    addressLine1: '',
                    addressLine2: '',
                    city: '',
                    state: '',
                    postalCode: '',
                    phone: user?.phone || '',
                    addressType: 'home',
                  }}
                  validationSchema={addressSchema}
                  onSubmit={handleAddAddress}
                >
                  {({ values, errors, touched, handleChange, handleBlur, isSubmitting, resetForm }) => (
                    <Form className="space-y-3 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <input
                            type="text"
                            name="fullName"
                            placeholder="Full Name"
                            value={values.fullName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="input-field"
                          />
                          {errors.fullName && touched.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
                        </div>
                        <div>
                          <input
                            type="tel"
                            name="phone"
                            placeholder="Phone Number"
                            value={values.phone}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="input-field"
                          />
                          {errors.phone && touched.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                        </div>
                        <div className="md:col-span-2">
                          <input
                            type="text"
                            name="addressLine1"
                            placeholder="Address Line 1"
                            value={values.addressLine1}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="input-field"
                          />
                          {errors.addressLine1 && touched.addressLine1 && <p className="text-sm text-red-500">{errors.addressLine1}</p>}
                        </div>
                        <div className="md:col-span-2">
                          <input
                            type="text"
                            name="addressLine2"
                            placeholder="Address Line 2 (Optional)"
                            value={values.addressLine2}
                            onChange={handleChange}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            name="city"
                            placeholder="City"
                            value={values.city}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="input-field"
                          />
                          {errors.city && touched.city && <p className="text-sm text-red-500">{errors.city}</p>}
                        </div>
                        <div>
                          <input
                            type="text"
                            name="state"
                            placeholder="State"
                            value={values.state}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="input-field"
                          />
                          {errors.state && touched.state && <p className="text-sm text-red-500">{errors.state}</p>}
                        </div>
                        <div>
                          <input
                            type="text"
                            name="postalCode"
                            placeholder="Postal Code"
                            value={values.postalCode}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="input-field"
                          />
                          {errors.postalCode && touched.postalCode && <p className="text-sm text-red-500">{errors.postalCode}</p>}
                        </div>
                        <div>
                          <select
                            name="addressType"
                            value={values.addressType}
                            onChange={handleChange}
                            className="input-field"
                          >
                            <option value="home">Home</option>
                            <option value="work">Work</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button type="submit" disabled={isSubmitting} className="btn-primary">
                          Save Address
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddressForm(false)}
                          className="px-4 py-2 border rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:border-gray-300">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <FiDollarSign size={24} />
                  <div>
                    <p className="font-semibold">Cash on Delivery</p>
                    <p className="text-sm text-gray-500">Pay when you receive the order</p>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:border-gray-300">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    disabled
                  />
                  <FiCreditCard size={24} />
                  <div>
                    <p className="font-semibold">Credit/Debit Card</p>
                    <p className="text-sm text-gray-500">Coming soon</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-blue-50 rounded-lg p-4 flex items-start space-x-3">
              <FiTruck className="text-blue-600 mt-1" size={20} />
              <div>
                <p className="font-semibold text-blue-900">Free Delivery on orders above ₹999</p>
                <p className="text-sm text-blue-700">Estimated delivery: 3-5 business days</p>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-96">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                {items.map((item, index) => (
                  <div key={index} className="flex space-x-3">
                    <img
                      src={item.product.images?.[0]?.url || 'https://via.placeholder.com/60'}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.product.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>GST (18%)</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>₹{finalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-sm text-green-600 mt-4 p-2 bg-green-50 rounded">
                <FiShield />
                <span>Safe & Secure Payment</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing || !selectedAddress}
                className="btn-primary w-full mt-6 disabled:opacity-50"
              >
                {isProcessing ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;