import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

const loadCartFromStorage = () => {
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : { items: [], totalQuantity: 0, totalAmount: 0 };
};

const saveCartToStorage = (state) => {
  localStorage.setItem('cart', JSON.stringify({
    items: state.items,
    totalQuantity: state.totalQuantity,
    totalAmount: state.totalAmount,
  }));
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: loadCartFromStorage(),
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1, variant = null } = action.payload;
      const existingItem = state.items.find(
        item => item.product._id === product._id && 
        JSON.stringify(item.variant) === JSON.stringify(variant)
      );
      
      if (existingItem) {
        existingItem.quantity += quantity;
        toast.success(`Added another ${product.name} to cart`);
      } else {
        state.items.push({
          product,
          quantity,
          variant,
          price: variant?.price || product.price,
        });
        toast.success(`${product.name} added to cart`);
      }
      
      state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalAmount = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      saveCartToStorage(state);
    },
    
    removeFromCart: (state, action) => {
      const index = action.payload;
      const removedItem = state.items[index];
      state.items.splice(index, 1);
      state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalAmount = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      toast.success(`${removedItem.product.name} removed from cart`);
      saveCartToStorage(state);
    },
    
    updateQuantity: (state, action) => {
      const { index, quantity } = action.payload;
      if (quantity <= 0) {
        state.items.splice(index, 1);
      } else {
        state.items[index].quantity = quantity;
      }
      state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalAmount = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      saveCartToStorage(state);
    },
    
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
      localStorage.removeItem('cart');
      toast.success('Cart cleared');
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;