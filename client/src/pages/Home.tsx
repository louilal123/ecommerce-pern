// src/pages/Home.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  slug: string;
}

interface HomeProps {
  session: Session | null;
}

export default function Home({ session }: HomeProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        setCategories(data || []);
      }
      setLoading(false);
    };

    fetchCategories();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const displayName = session?.user?.email?.split('@')[0] || 'Guest';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-teal-600">lecommerce</h1>

          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <input
                type="text"
                placeholder="Search products..."
                className="w-80 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              {session ? (
                <>
                  <span className="text-sm text-gray-600 hidden sm:inline">
                    Hello, {displayName}!
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="text-sm bg-teal-600 text-white px-4 py-2 rounded-full font-medium hover:bg-teal-700 transition"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="md:hidden px-4 pb-3">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
          />
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {session ? `Welcome back, ${displayName}!` : 'Shop the Latest Trends'}
            </h2>
            <p className="text-lg md:text-xl mb-6 text-teal-50">
              Discover amazing products at unbeatable prices. Free shipping on orders over $50.
            </p>
            <button className="bg-white text-teal-600 px-8 py-3 rounded-full font-semibold hover:bg-teal-50 transition shadow-lg">
              Shop Now
            </button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-12">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Shop by Category</h3>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 shadow-sm animate-pulse">
                <div className="h-32 bg-gray-200 rounded-md mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition cursor-pointer border border-gray-100"
              >
                <div className="h-32 bg-teal-50 rounded-md mb-3 flex items-center justify-center text-teal-600">
                  {category.image_url ? (
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="h-full w-full object-cover rounded-md"
                    />
                  ) : (
                    <span className="text-4xl">🛍️</span>
                  )}
                </div>
                <h4 className="font-medium text-gray-800">{category.name}</h4>
                {category.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {category.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">About lecommerce</h4>
              <p className="text-sm text-gray-600">
                Your one-stop shop for everything trendy and essential.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-teal-600">Help Center</a></li>
                <li><a href="#" className="hover:text-teal-600">Shipping Info</a></li>
                <li><a href="#" className="hover:text-teal-600">Returns</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Contact</h4>
              <p className="text-sm text-gray-600">support@lecommerce.com</p>
              <p className="text-sm text-gray-600">1-800-555-1234</p>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-6 pt-6 text-center text-sm text-gray-500">
            © 2024 lecommerce. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}