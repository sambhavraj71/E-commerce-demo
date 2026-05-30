import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { closeCart, updateQuantity, removeFromCart } from '../../redux/slices/cartSlice';

const CartSidebar = () => {
  const dispatch = useDispatch();
  const { isCartOpen, items, totalQuantity, totalAmount } = useSelector((state) => state.cart);

  const updateItemQuantity = (index, quantity) => {
    if (quantity < 1) return;
    dispatch(updateQuantity({ index, quantity }));
  };

  const removeItem = (index) => {
    dispatch(removeFromCart(index));
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(closeCart())}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween' }}
            className="fixed right-0 top-0 w-full max-w-md h-full bg-white shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Shopping Cart ({totalQuantity})</h2>
              <button onClick={() => dispatch(closeCart())} className="p-2 hover:bg-gray-100 rounded-full">
                <FiX size={20} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Your cart is empty</p>
                  <Link
                    to="/shop"
                    onClick={() => dispatch(closeCart())}
                    className="btn-primary inline-block mt-4"
                  >
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="flex space-x-4 border-b pb-4">
                      <img
                        src={item.product.images?.[0]?.url || 'https://via.placeholder.com/80'}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.product.name}</h4>
                        <p className="text-sm text-gray-500">₹{item.price}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() => updateItemQuantity(index, item.quantity - 1)}
                            className="w-8 h-8 border rounded-full flex items-center justify-center hover:border-black"
                          >
                            <FiMinus size={12} />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateItemQuantity(index, item.quantity + 1)}
                            className="w-8 h-8 border rounded-full flex items-center justify-center hover:border-black"
                          >
                            <FiPlus size={12} />
                          </button>
                          <button
                            onClick={() => removeItem(index)}
                            className="ml-auto text-red-500 hover:text-red-600"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t p-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Shipping</span>
                    <span>{totalAmount > 999 ? 'Free' : '₹50'}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>₹{totalAmount + (totalAmount > 999 ? 0 : 50)}</span>
                  </div>
                </div>
                <Link
                  to="/cart"
                  onClick={() => dispatch(closeCart())}
                  className="btn-primary w-full text-center block"
                >
                  View Cart
                </Link>
                <Link
                  to="/checkout"
                  onClick={() => dispatch(closeCart())}
                  className="btn-secondary w-full text-center block"
                >
                  Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;