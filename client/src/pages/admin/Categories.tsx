// src/pages/admin/Categories.tsx
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  TagIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
};

const PAGE_SIZE = 8;

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Map of category_id → product count
  const [productCountMap, setProductCountMap] = useState<Record<string, number>>({});

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);

    // Fetch categories
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const cats = data || [];
    setCategories(cats);

    // Fetch product counts per category
    if (cats.length > 0) {
      const categoryIds = cats.map((c) => c.id);
      const { data: products } = await supabase
        .from('products')
        .select('category_id')
        .in('category_id', categoryIds);

      const countMap: Record<string, number> = {};
      (products || []).forEach((p) => {
        countMap[p.category_id] = (countMap[p.category_id] || 0) + 1;
      });
      setProductCountMap(countMap);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this category? It must be empty of products.')) return;
    setDeleteId(id);
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      alert(`Delete failed: ${error.message}`);
    } else {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
    setDeleteId(null);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return q
      ? categories.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.slug.toLowerCase().includes(q)
        )
      : categories;
  }, [categories, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paged = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  useEffect(() => {
    setPage(0);
  }, [search]);

  return (
    <div className="space-y-6">
      {/* Header + Search + Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Categories{' '}
            <span className="text-gray-400 text-xl font-medium">
              ({categories.length} total)
            </span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Organize your product catalog
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
            to="/admin/categories/new"
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-sm text-sm font-semibold shadow-sm transition-colors whitespace-nowrap"
          >
            <PlusIcon className="w-5 h-5" />
            Add Category
          </Link>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" />
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-sm text-center">
          <p>Failed to load categories</p>
          <button
            onClick={fetchCategories}
            className="mt-2 underline text-sm font-medium hover:text-red-800 dark:hover:text-red-300"
          >
            Try again
          </button>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-100 dark:border-gray-800 shadow-sm p-12 text-center">
          <TagIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">No categories yet</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Create categories to organize your products.
          </p>
          <Link
            to="/admin/categories/new"
            className="mt-6 inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-sm text-sm font-semibold transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Add Category
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                No categories match your search “{search}”
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Try a different name or slug.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                      <th className="py-3.5 px-4 font-medium whitespace-nowrap">Category</th>
                      <th className="py-3.5 px-4 font-medium whitespace-nowrap">Slug</th>
                      <th className="py-3.5 px-4 font-medium whitespace-nowrap">Description</th>
                      <th className="py-3.5 px-4 font-medium whitespace-nowrap">Products</th>
                      <th className="py-3.5 px-4 font-medium text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {paged.map((category) => {
                      const productCount = productCountMap[category.id] ?? 0;
                      const truncatedDesc =
                        category.description && category.description.length > 60
                          ? category.description.slice(0, 60) + '…'
                          : category.description || '—';

                      return (
                        <tr
                          key={category.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3 min-w-[200px]">
                              <div className="w-10 h-10 rounded-sm bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex-shrink-0 overflow-hidden">
                                {category.image_url ? (
                                  <img
                                    src={category.image_url}
                                    alt={category.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                                    <TagIcon className="w-5 h-5" />
                                  </div>
                                )}
                              </div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {category.name}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-xs font-mono text-gray-500 dark:text-gray-400">
                            {category.slug}
                          </td>
                          <td className="py-4 px-4 text-gray-600 dark:text-gray-300 max-w-[300px] truncate">
                            {truncatedDesc}
                          </td>
                          <td className="py-4 px-4 text-gray-700 dark:text-gray-300">
                            {productCount}
                          </td>
                          <td className="py-4 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-3">
                              <Link
                                to={`/admin/categories/${category.id}/edit`}
                                className="flex flex-col items-center text-gray-400 dark:text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                                title="Edit"
                              >
                                <PencilSquareIcon className="w-4 h-4" />
                                <span className="text-[10px] font-medium mt-0.5">Edit</span>
                              </Link>
                              <button
                                onClick={() => handleDelete(category.id)}
                                disabled={deleteId === category.id}
                                className="flex flex-col items-center text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                                title="Delete"
                              >
                                {deleteId === category.id ? (
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