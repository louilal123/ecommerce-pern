// src/components/CartDropdown.tsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCartIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';

// Format Philippine Peso
const formatPHP = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount);
};

export default function CartDropdown() {
  const { items, count, updateQuantity, removeFromCart, loading } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const subtotal = items.reduce((sum, item) => {
    const price = item.variant?.price ?? item.product.default_price;
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Cart Icon with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition"
        aria-label="Shopping cart"
      >
        <ShoppingCartIcon className="h-6 w-6 text-gray-700 cursor-pointer" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {count}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="p-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Shopping Cart</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
              <XMarkIcon className="h-5 w-5 cursor-pointer" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : items.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <ShoppingCartIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p>Your cart is empty</p>
                <Link
                  to="/"
                  onClick={() => setIsOpen(false)}
                  className="mt-2 inline-block text-teal-600 text-sm hover:underline"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {items.map((item) => {
                  const price = item.variant?.price ?? item.product.default_price;
                  const variantDesc = item.variant?.attributes
                    ? Object.values(item.variant.attributes).join(' / ')
                    : null;

                  return (
                    <li key={item.id} className="p-3 flex gap-3">
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                            🛍️
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/product/${item.product.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="text-sm font-medium text-gray-800 hover:text-teal-600 line-clamp-2"
                        >
                          {item.product.name}
                        </Link>
                        {variantDesc && (
                          <p className="text-xs text-gray-500 mt-0.5">{variantDesc}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 border rounded-md text-gray-600 hover:bg-gray-100 cursor-pointer"
                            >
                              -
                            </button>
                            <span className="text-sm w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 border rounded-md text-gray-600 hover:bg-gray-100 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-teal-600">
                              {formatPHP(price * item.quantity)}
                            </p>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-xs text-red-500 hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {items.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Subtotal:</span>
                <span className="font-bold text-teal-600">{formatPHP(subtotal)}</span>
              </div>
              <Link
                to="/checkout"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700 transition"
              >
                View Cart
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}