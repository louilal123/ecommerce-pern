// src/pages/admin/Products.tsx
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CubeIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  brand?: string;
  category_id?: string;
  default_price: number;
  default_compare_at_price?: number;
  is_active: boolean;
  is_featured?: boolean;
};

const PAGE_SIZE = 8;

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const [imageMap, setImageMap] = useState<Record<string, string>>({});
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const [quantityMap, setQuantityMap] = useState<Record<string, number>>({});

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    // 1. Products
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (productError) {
      setError(productError.message);
      setLoading(false);
      return;
    }

    const products = productData || [];
    setProducts(products);

    // 2. Categories
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name');

    const catMap: Record<string, string> = {};
    (categories || []).forEach((c) => {
      catMap[c.id] = c.name;
    });
    setCategoryMap(catMap);

    // 3. Variants → inventory totals
    const productIds = products.map((p) => p.id);
    if (productIds.length > 0) {
      const { data: variants } = await supabase
        .from('product_variants')
        .select('product_id, inventory_quantity')
        .in('product_id', productIds);

      const qtyMap: Record<string, number> = {};
      (variants || []).forEach((v) => {
        qtyMap[v.product_id] = (qtyMap[v.product_id] || 0) + (v.inventory_quantity || 0);
      });
      setQuantityMap(qtyMap);

      // 4. Primary images
      const { data: images } = await supabase
        .from('product_images')
        .select('product_id, image_url')
        .in('product_id', productIds)
        .eq('is_primary', true);

      const imgMap: Record<string, string> = {};
      (images || []).forEach((img) => {
        if (img.image_url) imgMap[img.product_id] = img.image_url;
      });
      setImageMap(imgMap);
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

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return q
      ? products.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.slug.toLowerCase().includes(q) ||
            (p.brand ?? '').toLowerCase().includes(q)
        )
      : products;
  }, [products, search]);

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

  const statusBadge = (isActive: boolean) =>
    isActive ? (
      <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400">
        active
      </span>
    ) : (
      <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
        archived
      </span>
    );

  return (
    <div className="space-y-6">
      {/* Header + Search + Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Products{' '}
            <span className="text-gray-400 text-xl font-medium">
              ({products.length} total)
            </span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your product catalog
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-72 pl-9 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none"
            />
          </div>

          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-sm text-sm font-semibold shadow-sm transition-colors whitespace-nowrap"
          >
            <PlusIcon className="w-5 h-5" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Table content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" />
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-sm text-center">
          <p>Failed to load products</p>
          <button
            onClick={fetchProducts}
            className="mt-2 underline text-sm font-medium hover:text-red-800 dark:hover:text-red-300"
          >
            Try again
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-100 dark:border-gray-800 shadow-sm p-12 text-center">
          <CubeIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">No products yet</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Start building your catalog by adding your first product.
          </p>
          <Link
            to="/admin/products/new"
            className="mt-6 inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-sm text-sm font-semibold transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Add Product
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            /* No search results inside existing products */
            <div className="p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                No products match your search “{search}”
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Try a different name, slug or brand.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                      <th className="py-3.5 px-4 font-medium whitespace-nowrap">Product</th>
                      <th className="py-3.5 px-4 font-medium whitespace-nowrap">Category</th>
                      <th className="py-3.5 px-4 font-medium whitespace-nowrap">Brand</th>
                      <th className="py-3.5 px-4 font-medium whitespace-nowrap">Status</th>
                      <th className="py-3.5 px-4 font-medium whitespace-nowrap">Price</th>
                      <th className="py-3.5 px-4 font-medium whitespace-nowrap">Quantity</th>
                      <th className="py-3.5 px-4 font-medium text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {paged.map((product) => {
                      const imgSrc = imageMap[product.id];
                      const categoryName = product.category_id ? (categoryMap[product.category_id] || '—') : '—';
                      const brand = product.brand ?? '—';
                      const quantity = quantityMap[product.id] ?? 0;

                      return (
                        <tr
                          key={product.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3 min-w-[220px]">
                              <div className="w-10 h-10 rounded-sm bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex-shrink-0 overflow-hidden">
                                {imgSrc ? (
                                  <img
                                    src={imgSrc}
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
                          <td className="py-4 px-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            {categoryName}
                          </td>
                          <td className="py-4 px-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            {brand}
                          </td>
                          <td className="py-4 px-4">{statusBadge(product.is_active)}</td>
                          <td className="py-4 px-4 text-gray-800 dark:text-gray-300 font-medium whitespace-nowrap">
                            {formatCurrency(product.default_price)}
                          </td>
                          <td className="py-4 px-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            {quantity}
                          </td>
                          <td className="py-4 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-3">
                              {/* Edit button */}
                              <Link
                                to={`/admin/products/${product.id}/edit`}
                                className="flex flex-col items-center text-gray-400 dark:text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                                title="Edit"
                              >
                                <PencilSquareIcon className="w-4 h-4" />
                                <span className="text-[10px] font-medium mt-0.5">Edit</span>
                              </Link>

                              {/* Delete button */}
                              <button
                                onClick={() => handleDelete(product.id)}
                                disabled={deleteId === product.id}
                                className="flex flex-col items-center text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                                title="Delete"
                              >
                                {deleteId === product.id ? (
                                  <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <TrashIcon className="w-4 h-4" />
                                )}
                                <span className="text-[10px] font-medium mt-0.5">Delete</span>
                              </button>
                            </div>
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