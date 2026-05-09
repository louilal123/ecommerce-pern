// src/pages/admin/AdminDashboard.tsx
import { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import {
  CubeIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  FireIcon,
} from '@heroicons/react/24/outline';

type Period = 'daily' | 'weekly' | 'monthly';

const statsData = {
  daily: {
    totalProducts: 120,
    totalOrders: 35,
    revenue: 12_450,
    conversionRate: 3.2,
    trends: { products: +2, orders: +12, revenue: +8.4, conversion: -0.3 },
  },
  weekly: {
    totalProducts: 120,
    totalOrders: 210,
    revenue: 78_300,
    conversionRate: 4.1,
    trends: { products: 0, orders: +5, revenue: +14.2, conversion: +0.8 },
  },
  monthly: {
    totalProducts: 120,
    totalOrders: 850,
    revenue: 312_900,
    conversionRate: 3.8,
    trends: { products: +10, orders: +22, revenue: +31.7, conversion: +1.2 },
  },
};

const recentOrders = [
  { id: '1042', customer: 'John Doe',     total: 1250, status: 'paid',     date: 'May 8' },
  { id: '1041', customer: 'Jane Smith',   total: 3400, status: 'pending',  date: 'May 7' },
  { id: '1040', customer: 'Bob Johnson',  total: 920,  status: 'paid',     date: 'May 7' },
  { id: '1039', customer: 'Alice Brown',  total: 2150, status: 'refunded', date: 'May 6' },
  { id: '1038', customer: 'Carlos Reyes', total: 780,  status: 'paid',     date: 'May 6' },
];

const lowStockProducts = [
  { id: 'P01', name: 'Wireless Headphones Pro',   stock: 3,  threshold: 10 },
  { id: 'P02', name: 'USB-C Hub 7-in-1',          stock: 6,  threshold: 10 },
  { id: 'P03', name: 'Mechanical Keyboard TKL',   stock: 2,  threshold: 10 },
];

const topProducts = [
  { id: 'T01', name: 'Smart Watch Series X', sales: 142, revenue: 213_000, trend: +18 },
  { id: 'T02', name: 'Noise-Cancel Earbuds',  sales: 98,  revenue: 88_200,  trend: +7  },
  { id: 'T03', name: 'Portable SSD 1TB',      sales: 74,  revenue: 51_800,  trend: -3  },
  { id: 'T04', name: 'LED Desk Lamp Pro',     sales: 61,  revenue: 30_500,  trend: +21 },
];

const salesBars = [65, 42, 88, 55, 73, 91, 47, 68, 84, 59, 77, 95, 38, 62];

export default function AdminDashboard() {
  const [period, setPeriod] = useState<Period>('daily');
  const stats = statsData[period];

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(n);

  return (
    <>
      {/* Performance‑enhancing styles for this component */}
      <style>{`
        .content-visibility-auto {
          content-visibility: auto;
          contain-intrinsic-size: 0 500px;
        }
        .card-contained {
          contain: layout style paint;
        }
      `}</style>

      {/* Whole dashboard wrapped in a virtualized section */}
      <section className="content-visibility-auto space-y-8 font-sans">

        {/* Header + period toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-widest text-orange-500 uppercase mb-1">
              Welcome Admin
            </p>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
              Dashboard 
            </h1>
          </div>

          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-sm -xl p-1.5 self-start sm:self-auto border border-gray-200 dark:border-gray-700">
            {(['daily', 'weekly', 'monthly'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-5 py-2 rounded-sm -lg text-sm font-semibold transition-all duration-200 ${
                  period === p
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-200 dark:shadow-teal-900/30'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <KpiCard
            icon={<CubeIcon className="w-6 h-6" />}
            label="Total Products"
            value={stats.totalProducts.toString()}
            trend={stats.trends.products}
            accent="teal"
          />
          <KpiCard
            icon={<ShoppingBagIcon className="w-6 h-6" />}
            label="Total Orders"
            value={stats.totalOrders.toString()}
            trend={stats.trends.orders}
            accent="orange"
          />
          <KpiCard
            icon={<CurrencyDollarIcon className="w-6 h-6" />}
            label="Revenue"
            value={fmt(stats.revenue)}
            trend={stats.trends.revenue}
            accent="teal"
          />
          <KpiCard
            icon={<ChartBarIcon className="w-6 h-6" />}
            label="Conversion Rate"
            value={`${stats.conversionRate}%`}
            trend={stats.trends.conversion}
            
            accent="orange"
          />
        </div>
      </section>

      {/* Chart + Orders */}
      <section className="content-visibility-auto space-y-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-sm -2xl border border-gray-100 dark:border-gray-700 shadow-sm p-7 card-contained">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-50 dark:bg-teal-900/30 rounded-sm -xl">
                  <ChartBarIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Sales Overview</h2>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Last 14 days performance</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-teal-600 dark:text-teal-400 font-semibold bg-teal-50 dark:bg-teal-900/30 px-3 py-1.5 rounded-sm -lg">
                <ArrowTrendingUpIcon className="w-4 h-4" />
                +14.2%
              </div>
            </div>

            <div className="flex items-end gap-2 h-48">
              {salesBars.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div
                    className="w-full rounded-sm -t-md transition-all"
                    style={{
                      height: `${h}%`,
                      background:
                        i === salesBars.length - 1
                          ? 'linear-gradient(180deg, #f97316, #fb923c)'
                          : i % 3 === 0
                          ? 'linear-gradient(180deg, #0d9488, #14b8a6)'
                          : '#e2f8f7',
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3 text-xs text-gray-400 dark:text-gray-500 font-medium">
              <span>Apr 25</span>
              <span>Apr 29</span>
              <span>May 3</span>
              <span>May 8</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-sm -2xl border border-gray-100 dark:border-gray-700 shadow-sm p-7 flex flex-col card-contained">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-sm -xl">
                  <ShoppingBagIcon className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Orders</h2>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Latest transactions</p>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-700 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-sm -full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {order.customer.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">
                        {order.customer}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">#{order.id} · {order.date}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{fmt(order.total)}</span>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/admin/orders"
              className="mt-5 flex items-center justify-center gap-2 py-2.5 rounded-sm -xl border-2 border-teal-100 dark:border-teal-800 text-teal-700 dark:text-teal-400 text-sm font-semibold hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
            >
              View all orders →
            </Link>
          </div>
        </div>
      </section>

      {/* Low Stock + Top Products */}
      <section className="content-visibility-auto space-y-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="bg-white dark:bg-gray-800 rounded-sm -2xl border border-orange-100 dark:border-orange-900 shadow-sm p-7 card-contained">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-sm -xl">
                <ExclamationTriangleIcon className="w-5 h-5 text-orange-500 dark:text-orange-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Low Stock Alerts</h2>
                <p className="text-sm text-gray-400 dark:text-gray-500">Items needing restock</p>
              </div>
              <span className="ml-auto text-xs font-bold bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-sm -full">
                {lowStockProducts.length} items
              </span>
            </div>

            <div className="space-y-4">
              {lowStockProducts.map((p) => {
                const pct = Math.round((p.stock / p.threshold) * 100);
                return (
                  <div key={p.id} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{p.name}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-sm -md ${
                        p.stock <= 3
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                      }`}>
                        {p.stock} left
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-sm -full overflow-hidden">
                      <div
                        className={`h-full rounded-sm -full transition-all ${
                          p.stock <= 3 ? 'bg-red-500' : 'bg-orange-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{pct}% of reorder threshold</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-sm -2xl border border-gray-100 dark:border-gray-700 shadow-sm p-7 card-contained">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-teal-50 dark:bg-teal-900/30 rounded-sm -xl">
                <FireIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Top Products</h2>
                <p className="text-sm text-gray-400 dark:text-gray-500">Best performers this period</p>
              </div>
            </div>

            <div className="space-y-1">
              {topProducts.map((p, i) => (
                <div
                  key={p.id}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-sm -xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <span className="text-2xl font-black text-gray-100 dark:text-gray-700 w-7 text-center leading-none select-none">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{p.sales} units sold</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{fmt(p.revenue)}</p>
                    <p className={`text-xs font-semibold flex items-center justify-end gap-0.5 ${
                      p.trend >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-red-500 dark:text-red-400'
                    }`}>
                      {p.trend >= 0
                        ? <ArrowTrendingUpIcon className="w-3.5 h-3.5" />
                        : <ArrowTrendingDownIcon className="w-3.5 h-3.5" />}
                      {p.trend >= 0 ? '+' : ''}{p.trend}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// Memoised components
const KpiCard = memo(function KpiCard({
  icon,
  label,
  value,
  trend,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: number;
  accent: 'teal' | 'orange';
}) {
  const isPositive = trend >= 0;
  const accentStyles = {
    teal:   { icon: 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400', border: 'border-teal-100 dark:border-teal-900' },
    orange: { icon: 'bg-orange-50 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400', border: 'border-orange-100 dark:border-orange-900' },
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-sm -2xl border ${accentStyles[accent].border} shadow-sm p-6 flex flex-col gap-4 card-contained`}>
      <div className="flex items-center justify-between">
        <div className={`p-2.5 rounded-sm -xl ${accentStyles[accent].icon}`}>{icon}</div>
        <span
          className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-sm -lg ${
            isPositive
              ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400'
              : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
          }`}
        >
          {isPositive
            ? <ArrowTrendingUpIcon className="w-3.5 h-3.5" />
            : <ArrowTrendingDownIcon className="w-3.5 h-3.5" />}
          {isPositive ? '+' : ''}{trend}{typeof trend === 'number' && Math.abs(trend) < 50 && label !== 'Total Products' && label !== 'Total Orders' ? '%' : ''}
        </span>
      </div>
      <div>
        <p className="text-4xl font-black text-gray-900 dark:text-white leading-none tracking-tight mb-1.5">
          {value}
        </p>
        <p className="text-sm font-medium text-gray-400 dark:text-gray-500">{label}</p>
      </div>
    </div>
  );
});

const StatusBadge = memo(function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid:     'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400',
    pending:  'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    refunded: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-sm -md ${map[status] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
      {status}
    </span>
  );
});