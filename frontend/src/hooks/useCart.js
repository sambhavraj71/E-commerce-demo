import { useSelector, useDispatch } from 'react-redux';
import { addToCart, removeFromCart, updateQuantity, clearCart } from '../redux/slices/cartSlice';

const useCart = () => {
  const dispatch = useDispatch();
  const { items, totalQuantity, totalAmount } = useSelector((state) => state.cart);
  
  const addItem = (product, quantity = 1, variant = null) => {
    dispatch(addToCart({ product, quantity, variant }));
  };
  
  const removeItem = (index) => {
    dispatch(removeFromCart(index));
  };
  
  const updateItemQuantity = (index, quantity) => {
    dispatch(updateQuantity({ index, quantity }));
  };
  
  const emptyCart = () => {
    dispatch(clearCart());
  };
  
  return {
    items,
    totalQuantity,
    totalAmount,
    addItem,
    removeItem,
    updateItemQuantity,
    emptyCart,
  };
};

export default useCart;