// src/pages/CartList.tsx
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import LoadingSpinner from '../components/LoadingSpinner';
// Helper: format Philippine Peso
const formatPHP = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount);
};

const proceedtoCheckout = () => {
  toast.error('Checkout button clicked.');
};

export default function Checkout() {
  const { items, updateQuantity, removeFromCart, loading } = useCart();

  const subtotal = items.reduce((sum, item) => {
    const price = item.variant?.price || item.product.default_price;
    return sum + price * item.quantity;
  }, 0);
  

  if (loading) {
     return <LoadingSpinner />;
   }
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
          const variantDesc = variant?.attributes ? Object.values(variant.attributes).join(' / ') : null;

          return (
            <div key={item.id} className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow border">
              <div className="flex-1">
                <Link to={`/product/${product.slug}`} className="font-medium text-gray-800 hover:text-teal-600">
                  {product.name}
                </Link>
                {variantDesc && <p className="text-sm text-gray-500">{variantDesc}</p>}
                <p className="text-teal-600 font-bold">{formatPHP(price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 border rounded-md"
                >
                  -
                </button>
                <span className="w-12 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 border rounded-md"
                >
                  +
                </button>
              </div>
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
      <div className="mt-6 border-t pt-4 text-right">
        <p className="text-xl font-bold">Subtotal: {formatPHP(subtotal)}</p>
        <button  onClick={() => proceedtoCheckout()} className="mt-4 bg-red-600 text-white px-6 cursor-pointer py-2 rounded-md font-semibold">
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}