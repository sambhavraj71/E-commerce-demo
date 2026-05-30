import React from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';

const CartItem = ({ item, index, onUpdateQuantity, onRemove }) => {
  return (
    <div className="flex space-x-4 py-4 border-b">
      <Link to={`/product/${item.product._id}`} className="w-24 h-24 flex-shrink-0">
        <img
          src={item.product.images?.[0]?.url || 'https://via.placeholder.com/100'}
          alt={item.product.name}
          className="w-full h-full object-cover rounded"
        />
      </Link>
      
      <div className="flex-1">
        <Link to={`/product/${item.product._id}`}>
          <h3 className="font-semibold hover:text-gray-600 transition-colors">
            {item.product.name}
          </h3>
        </Link>
        {item.variant && (
          <p className="text-sm text-gray-500">Variant: {item.variant.name}</p>
        )}
        <p className="text-lg font-bold mt-1">₹{item.price}</p>
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onUpdateQuantity(index, item.quantity - 1)}
              className="w-8 h-8 border rounded-full flex items-center justify-center hover:border-black transition-colors"
            >
              <FiMinus size={12} />
            </button>
            <span className="w-8 text-center font-medium">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(index, item.quantity + 1)}
              className="w-8 h-8 border rounded-full flex items-center justify-center hover:border-black transition-colors"
            >
              <FiPlus size={12} />
            </button>
          </div>
          
          <button
            onClick={() => onRemove(index)}
            className="text-red-500 hover:text-red-600"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      </div>
      
      <div className="text-right">
        <p className="font-bold text-lg">₹{item.price * item.quantity}</p>
      </div>
    </div>
  );
};

export default CartItem;