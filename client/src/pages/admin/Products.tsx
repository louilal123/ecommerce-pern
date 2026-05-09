// src/pages/admin/Products.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';

type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  compare_at_price?: number;
  quantity: number;
  status: 'draft' | 'active' | 'archived';
  image_url?: string;
  created_at: string;
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setDeleteId(id);
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      alert(`Delete failed: ${error.message}`);
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
    setDeleteId(null);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount);

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active:
        'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400',
      draft:
        'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      archived:
        'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
    };
    return (
      <span
        className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
          styles[status] || styles.archived
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your product catalog
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      {/* Main content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" />
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-2xl text-center">
          <p>Failed to load products</p>
          <button
            onClick={fetchProducts}
            className="mt-2 underline text-sm font-medium hover:text-red-800 dark:hover:text-red-300"
          >
            Try again
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-12 text-center">
          <CubeIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">No products yet</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Start building your catalog by adding your first product.
          </p>
          <Link
            to="/admin/products/new"
            className="mt-6 inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Add Product
          </Link>
        </div>
      ) : (
        <div className=" dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                  <th className="py-3.5 px-4 font-medium whitespace-nowrap">Product</th>
                  <th className="py-3.5 px-4 font-medium whitespace-nowrap">Status</th>
                  <th className="py-3.5 px-4 font-medium whitespace-nowrap">Price</th>
                  <th className="py-3.5 px-4 font-medium whitespace-nowrap">Quantity</th>
                  <th className="py-3.5 px-4 font-medium whitespace-nowrap">Created</th>
                  <th className="py-3.5 px-4 font-medium text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3 min-w-[240px]">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 flex-shrink-0 overflow-hidden">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                              <CubeIcon className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            /{product.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">{statusBadge(product.status)}</td>
                    <td className="py-4 px-4 text-gray-800 dark:text-gray-300 font-medium whitespace-nowrap">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="py-4 px-4 text-gray-800 dark:text-gray-300 whitespace-nowrap">
                      {product.quantity}
                    </td>
                    <td className="py-4 px-4 text-gray-400 dark:text-gray-500 whitespace-nowrap">
                      {new Date(product.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors"
                          title="Edit"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deleteId === product.id}
                          className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deleteId === product.id ? (
                            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <TrashIcon className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}