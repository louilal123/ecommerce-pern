// src/pages/admin/Orders.tsx
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

type Order = {
  id: string;
  user_id: string;
  stripe_session_id?: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  total_amount: number;
  created_at: string;
};

const PAGE_SIZE = 10;

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  // Map of order_id → items count
  const [itemsCountMap, setItemsCountMap] = useState<Record<string, number>>({});

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    // Fetch orders newest first
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const orders = data || [];
    setOrders(orders);

    // Fetch item counts for each order
    if (orders.length > 0) {
      const orderIds = orders.map((o) => o.id);
      const { data: itemsData } = await supabase
        .from('order_items')
        .select('order_id, quantity')
        .in('order_id', orderIds);

      const countMap: Record<string, number> = {};
      (itemsData || []).forEach((item) => {
        countMap[item.order_id] = (countMap[item.order_id] || 0) + (item.quantity || 0);
      });
      setItemsCountMap(countMap);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return q
      ? orders.filter(
          (o) =>
            o.id.toLowerCase().includes(q) ||
            o.user_id.toLowerCase().includes(q) ||
            (o.stripe_session_id ?? '').toLowerCase().includes(q)
        )
      : orders;
  }, [orders, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paged = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  useEffect(() => {
    setPage(0);
  }, [search]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount);

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid:
        'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400',
      pending:
        'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      failed:
        'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      refunded:
        'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
    };
    return (
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-sm ${styles[status] || styles.pending}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Orders{' '}
            <span className="text-gray-400 text-xl font-medium">
              ({orders.length} total)
            </span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View and manage customer orders
          </p>
        </div>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID or user…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 pl-9 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" />
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-sm text-center">
          <p>Failed to load orders</p>
          <button
            onClick={fetchOrders}
            className="mt-2 underline text-sm font-medium hover:text-red-800 dark:hover:text-red-300"
          >
            Try again
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-100 dark:border-gray-800 shadow-sm p-12 text-center">
          <EyeIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">No orders yet</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Orders will appear here once customers complete checkout.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                No orders match your search “{search}”
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Try a different order ID or user ID.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                      <th className="py-3.5 px-4 font-medium whitespace-nowrap">Order ID</th>
                      <th className="py-3.5 px-4 font-medium whitespace-nowrap">Customer</th>
                      <th className="py-3.5 px-4 font-medium whitespace-nowrap">Date</th>
                      <th className="py-3.5 px-4 font-medium whitespace-nowrap">Items</th>
                      <th className="py-3.5 px-4 font-medium whitespace-nowrap">Amount</th>
                      <th className="py-3.5 px-4 font-medium whitespace-nowrap">Status</th>
                      <th className="py-3.5 px-4 font-medium text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {paged.map((order) => {
                      const itemsCount = itemsCountMap[order.id] ?? 0;
                      return (
                        <tr
                          key={order.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <td className="py-4 px-4 font-mono text-xs text-gray-600 dark:text-gray-400">
                            {order.id.slice(0, 8)}…
                          </td>
                          <td className="py-4 px-4 text-gray-700 dark:text-gray-300">
                            {/* Display user ID for now; you can later fetch email */}
                            {order.user_id.slice(0, 8)}…
                          </td>
                          <td className="py-4 px-4 text-gray-400 dark:text-gray-500 whitespace-nowrap">
                            {new Date(order.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-4 px-4 text-gray-700 dark:text-gray-300">
                            {itemsCount}
                          </td>
                          <td className="py-4 px-4 text-gray-800 dark:text-gray-300 font-medium whitespace-nowrap">
                            {formatCurrency(order.total_amount)}
                          </td>
                          <td className="py-4 px-4">{statusBadge(order.status)}</td>
                          <td className="py-4 px-4 text-right whitespace-nowrap">
                            <Link
                              to={`/admin/orders/${order.id}`}
                              className="flex flex-col items-center text-gray-400 dark:text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                              title="View details"
                            >
                              <EyeIcon className="w-4 h-4" />
                              <span className="text-[10px] font-medium mt-0.5">View</span>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Page {safePage + 1} of {totalPages}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={safePage === 0}
                      className="p-1.5 rounded-sm text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i)}
                        className={`w-8 h-8 rounded-sm text-xs font-semibold transition-colors ${
                          i === safePage
                            ? 'bg-teal-600 text-white'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={safePage === totalPages - 1}
                      className="p-1.5 rounded-sm text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
                    >
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}