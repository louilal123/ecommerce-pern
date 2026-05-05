// src/pages/Checkout.tsx
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import LoadingSpinner from '../components/LoadingSpinner';
import { supabase } from '../lib/supabase';
import { useState } from 'react';

// Helper: format Philippine Peso
const formatPHP = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount);
};

export default function Checkout() {
  const { items, updateQuantity, removeFromCart, loading } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const navigate = useNavigate();

  const subtotal = items.reduce((sum, item) => {
    const price = item.variant?.price || item.product.default_price;
    return sum + price * item.quantity;
  }, 0);

  const handleProceedToCheckout = async () => {
    setCheckingOut(true);
    try {
      // 1. Get current user session and token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        toast.error('You must be logged in to checkout.');
        navigate('/login');
        return;
      }

      const token = session.access_token;

      // 2. Prepare cart items payload
      const cartPayload = items.map((item) => ({
        product_name: item.product.name,
        variant_description: item.variant?.attributes
          ? Object.values(item.variant.attributes).join(' / ')
          : '',
        price: item.variant?.price || item.product.default_price,
        quantity: item.quantity,
      }));

      // 3. Call backend
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: cartPayload }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      // 4. Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err: any) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-700">Your cart is empty</h2>
        <Link to="/" className="mt-4 inline-block bg-teal-600 text-white px-6 py-2 rounded-md">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
      <div className="space-y-4">
        {items.map((item) => {
          const product = item.product;
          const variant = item.variant;
          const price = variant?.price || product.default_price;
          const variantDesc = variant?.attributes
            ? Object.values(variant.attributes).join(' / ')
            : null;

          return (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow border"
            >
              {/* Product Image */}
              <div className="w-20 h-20 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                    🛍️
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1">
                <Link
                  to={`/product/${product.slug}`}
                  className="font-medium text-gray-800 hover:text-teal-600"
                >
                  {product.name}
                </Link>
                {variantDesc && <p className="text-sm text-gray-500">{variantDesc}</p>}
                <p className="text-teal-600 font-bold">{formatPHP(price)}</p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 border rounded-md hover:bg-gray-100"
                >
                  −
                </button>
                <span className="w-12 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 border rounded-md hover:bg-gray-100"
                >
                  +
                </button>
              </div>

              {/* Item Total & Remove */}
              <div className="text-right">
                <p className="font-semibold">{formatPHP(price * item.quantity)}</p>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Subtotal & Checkout Button */}
      <div className="mt-6 border-t pt-4 text-right">
        <p className="text-xl font-bold">Subtotal: {formatPHP(subtotal)}</p>
        <button
          onClick={handleProceedToCheckout}
          disabled={checkingOut}
          className="mt-4 bg-red-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-red-700 disabled:opacity-50"
        >
          {checkingOut ? 'Redirecting...' : 'Proceed to Checkout'}
        </button>
      </div>
    </div>
  );
}