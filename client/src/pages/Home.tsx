// src/pages/Home.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  default_price: number;
  default_compare_at_price: number | null;
  images: { image_url: string }[];
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const { addToCart } = useCart();

  const handleAddToCart = async (product: Product) => {
    if (addingProductId === product.id) return; // prevent double-click

    setAddingProductId(product.id);
    try {
      await addToCart(product.id, null, 1);
      toast.success(`Added ${product.name} to cart!`);
      // Show "Added!" on button for 1.5 seconds
      setAddedProductId(product.id);
      setTimeout(() => setAddedProductId(null), 1500);
    } catch (error) {
      toast.error('Please log in to add items to cart.');
    } finally {
      setAddingProductId(null);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: catData } = await supabase
        .from('categories')
        .select('id, name, slug, image_url')
        .order('name');

      const { data: prodData } = await supabase
        .from('products')
        .select(`
          id, name, slug, default_price, default_compare_at_price,
          images:product_images(image_url, is_primary)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (catData) setCategories(catData);
      if (prodData) {
        const productsWithImage = prodData.map((p: any) => ({
          ...p,
          images: p.images?.filter((img: any) => img.is_primary) || p.images?.slice(0, 1) || [],
        }));
        setProducts(productsWithImage);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <>
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-sm overflow-hidden mb-6 md:mb-8">
        <div className="px-4 py-8 md:py-12">
          <h2 className="text-2xl md:text-4xl font-bold mb-2">Shop the Latest Trends</h2>
          <p className="text-sm md:text-base mb-4">Free shipping on orders over ₱2,500</p>
          <Link to="/products" className="inline-block bg-white text-teal-600 px-5 py-2 rounded-full text-sm font-semibold">
            Shop Now
          </Link>
        </div>
      </section>

      <section className="mb-10">
        <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">Shop by Category</h3>
        {loading ? (
          <div className="grid grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                onClick={() => toast.info(`Browsing ${cat.name}`)}  // 👈 added toast
                className="bg-white rounded-lg border border-gray-100 p-2 text-center hover:shadow-sm transition"
              >
                <div className="h-16 w-16 mx-auto rounded-full bg-teal-50 flex items-center justify-center overflow-hidden">
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl">📦</span>
                  )}
                </div>
                <p className="text-xs font-medium text-gray-700 mt-1 truncate">{cat.name}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* All Products Grid */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg md:text-xl font-semibold text-gray-800">All Products</h3>
          {products.length > 12 && (
            <Link to="/products" className="text-teal-600 text-sm hover:underline">View All →</Link>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-4">
            {[...Array(16)].map((_, i) => <div key={i} className="h-64 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : products.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No products found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-4">
            {products.slice(0, 24).map((product) => (
              <div key={product.id} className="bg-white rounded-lg border border-gray-100 p-2 hover:shadow-md transition flex flex-col">
                <Link to={`/product/${product.slug}`} className="block">
                  <div className="aspect-square bg-gray-50 rounded-md overflow-hidden mb-2">
                    {product.images?.[0]?.image_url ? (
                      <img
                        src={product.images[0].image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">🛍️</div>
                    )}
                  </div>
                  <h4 className="font-medium text-gray-800 text-sm line-clamp-2">{product.name}</h4>
                  <div className="mt-1">
                    <span className="text-teal-600 font-bold text-sm">
                      {new Intl.NumberFormat("en-PH", {
                        style: "currency",
                        currency: "PHP",
                      }).format(product.default_price)}
                    </span>

                    {product.default_compare_at_price && (
                      <span className="text-gray-400 line-through text-xs ml-2">
                        {new Intl.NumberFormat("en-PH", {
                          style: "currency",
                          currency: "PHP",
                        }).format(product.default_compare_at_price)}
                      </span>
                    )}
                  </div>
                </Link>

                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={addingProductId === product.id}
                  className={`mt-3 w-full text-xs font-medium py-2 rounded-md transition
                    ${addingProductId === product.id
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : addedProductId === product.id
                        ? 'bg-green-600 text-white'
                        : 'bg-teal-600 text-white hover:bg-teal-700'
                    }`}
                >
                  {addingProductId === product.id
                    ? 'Adding...'
                    : addedProductId === product.id
                      ? '✓ Added!'
                      : 'Add to Cart'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}