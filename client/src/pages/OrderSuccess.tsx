import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id, total_amount, status, created_at')
        .eq('stripe_session_id', sessionId)
        .single();

      if (!error && data) {
        setOrder(data);
      }
      setLoading(false);
    };

    fetchOrder();
  }, [sessionId]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your order has been placed successfully.
        </p>

        {loading && <p className="text-gray-500">Loading order details…</p>}

        {order && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="font-mono text-gray-800">{order.id}</p>
            <p className="text-sm text-gray-500 mt-2">Amount</p>
            <p className="font-semibold text-teal-600">₱{order.total_amount.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-2">Status</p>
            <span className="inline-block bg-green-100 text-green-800 text-sm px-2 py-1 rounded">
              {order.status}
            </span>
          </div>
        )}

        {!sessionId && (
          <p className="text-red-500 mb-6">No session ID found. Please contact support if your payment was processed.</p>
        )}

        <div className="flex gap-4 justify-center">
          <Link
            to="/orders"
            className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700"
          >
            View My Orders
          </Link>
          <Link
            to="/"
            className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}