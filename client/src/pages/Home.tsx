// src/pages/Home.tsx (updated)
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  slug: string;
}

export default function Home() {
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

  return (
    <>
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-2xl overflow-hidden mb-8">
        <div className="px-4 py-12 md:py-20">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Shop the Latest Trends
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
      <section>
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
    </>
  );
}