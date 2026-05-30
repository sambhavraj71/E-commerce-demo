import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowLeft } from 'react-icons/fi';
import { updateQuantity, removeFromCart, clearCart } from '../redux/slices/cartSlice';

const Cart = () => {
  const dispatch = useDispatch();
  const { items, totalQuantity, totalAmount } = useSelector((state) => state.cart);
  const shippingCost = totalAmount > 999 ? 0 : 50;
  const taxAmount = totalAmount * 0.18;
  const finalAmount = totalAmount + shippingCost + taxAmount;

  const updateItemQuantity = (index, quantity) => {
    if (quantity < 1) return;
    dispatch(updateQuantity({ index, quantity }));
  };

  const removeItem = (index) => {
    dispatch(removeFromCart(index));
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FiShoppingBag size={80} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added any items yet</p>
          <Link to="/shop" className="btn-primary inline-block">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-100 font-semibold">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              
              {items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border-b items-center"
                >
                  {/* Product Info */}
                  <div className="md:col-span-6 flex space-x-4">
                    <img
                      src={item.product.images?.[0]?.url || 'https://via.placeholder.com/100'}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div>
                      <Link to={`/product/${item.product._id}`} className="font-semibold hover:text-gray-600">
                        {item.product.name}
                      </Link>
                      {item.variant && (
                        <p className="text-sm text-gray-500">Variant: {item.variant.name}</p>
                      )}
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-500 text-sm mt-2 flex items-center space-x-1 hover:text-red-600"
                      >
                        <FiTrash2 size={14} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Price */}
                  <div className="md:col-span-2 text-center">
                    <span className="md:hidden font-semibold mr-2">Price:</span>
                    ₹{item.price}
                  </div>
                  
                  {/* Quantity */}
                  <div className="md:col-span-2 flex justify-center">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateItemQuantity(index, item.quantity - 1)}
                        className="w-8 h-8 border rounded-full flex items-center justify-center hover:border-black transition-colors"
                      >
                        <FiMinus size={14} />
                      </button>
                      <span className="w-12 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateItemQuantity(index, item.quantity + 1)}
                        className="w-8 h-8 border rounded-full flex items-center justify-center hover:border-black transition-colors"
                      >
                        <FiPlus size={14} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Total */}
                  <div className="md:col-span-2 text-right">
                    <span className="md:hidden font-semibold mr-2">Total:</span>
                    <span className="font-bold">₹{item.price * item.quantity}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-between">
              <Link to="/shop" className="flex items-center space-x-2 text-gray-600 hover:text-black">
                <FiArrowLeft size={18} />
                <span>Continue Shopping</span>
              </Link>
              <button
                onClick={() => dispatch(clearCart())}
                className="text-red-500 hover:text-red-600"
              >
                Clear Cart
              </button>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:w-96">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal ({totalQuantity} items)</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{finalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              {totalAmount < 999 && (
                <div className="bg-orange-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-orange-600">
                    Add ₹{ (999 - totalAmount).toFixed(2) } more to get free shipping!
                  </p>
                </div>
              )}
              
              <Link to="/checkout" className="btn-primary w-full text-center block">
                Proceed to Checkout
              </Link>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                Shipping and taxes calculated at checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;