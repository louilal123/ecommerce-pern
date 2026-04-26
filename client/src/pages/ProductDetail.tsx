// src/pages/ProductDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import ProductReviews from '../components/ProductReviews';
interface Variant {
  id: string;
  sku: string;
  attributes: Record<string, string>;
  price: number;
  compare_at_price: number | null;
  inventory_quantity: number;
  is_active: boolean;
}

interface ProductImage {
  id: string;
  image_url: string;
  alt_text: string | null;
  is_primary: boolean;
  variant_id: string | null;
  position: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string | null;
  default_price: number;
  default_compare_at_price: number | null;
  is_active: boolean;
  variants: Variant[];
  images: ProductImage[];
}

// Helper to format Philippine Peso
const formatPHP = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount);
};

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart } = useCart();

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;

      const { data, error } = await supabase
        .from('products')
        .select(`
          id, name, slug, description, brand, default_price, default_compare_at_price, is_active,
          variants:product_variants(id, sku, attributes, price, compare_at_price, inventory_quantity, is_active),
          images:product_images(id, image_url, alt_text, is_primary, variant_id, position)
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      // Filter active variants only
      const activeVariants = data.variants?.filter((v: Variant) => v.is_active) || [];
      // Sort images by position & primary flag
      const sortedImages = (data.images || []).sort((a: ProductImage, b: ProductImage) => {
        if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
        return (a.position || 0) - (b.position || 0);
      });

      const productData: Product = {
        ...data,
        variants: activeVariants,
        images: sortedImages,
      };
      setProduct(productData);

      // Set first variant as selected (if any), else null (product without variants)
      if (activeVariants.length > 0) {
        setSelectedVariant(activeVariants[0]);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [slug]);

  // Reset quantity when variant changes
  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!selectedVariant && product.variants.length > 0) {
      toast.error('Please select an option');
      return;
    }
    if (selectedVariant && selectedVariant.inventory_quantity < quantity) {
      toast.error('Not enough stock');
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart(product.id, selectedVariant?.id || null, quantity);
      toast.success(`Added ${product.name} to cart!`);
    } catch (error) {
      toast.error('Please log in to add items to cart.');
    } finally {
      setAddingToCart(false);
    }
  };

  // Group variant attributes (e.g., color, size) for easier selection UI
  const getUniqueAttributes = () => {
    if (!product || product.variants.length === 0) return {};
    const attributesMap: Record<string, Set<string>> = {};
    product.variants.forEach(variant => {
      Object.entries(variant.attributes).forEach(([key, value]) => {
        if (!attributesMap[key]) attributesMap[key] = new Set();
        attributesMap[key].add(value);
      });
    });
    // Convert sets to arrays
    const result: Record<string, string[]> = {};
    Object.keys(attributesMap).forEach(key => {
      result[key] = Array.from(attributesMap[key]);
    });
    return result;
  };

  const attributeOptions = getUniqueAttributes();
  const attributeKeys = Object.keys(attributeOptions);

  // Check if a variant matches selected attributes
  const findVariantByAttributes = (attrs: Record<string, string>) => {
    return product?.variants.find(v =>
      Object.keys(attrs).every(key => v.attributes[key] === attrs[key])
    );
  };

  const handleAttributeChange = (attrKey: string, attrValue: string) => {
    if (!selectedVariant) return;
    const newAttributes = { ...selectedVariant.attributes, [attrKey]: attrValue };
    const matched = findVariantByAttributes(newAttributes);
    if (matched) setSelectedVariant(matched);
  };

  // Determine current price and compare price
  const currentPrice = selectedVariant?.price ?? product?.default_price ?? 0;
  const comparePrice = selectedVariant?.compare_at_price ?? product?.default_compare_at_price ?? null;
  const inStock = selectedVariant ? selectedVariant.inventory_quantity > 0 : (product?.variants.length === 0 ? true : false);

  // Get images for the selected variant (if any) or product-level images
  const imagesToShow = () => {
    if (!product) return [];
    if (selectedVariant) {
      const variantSpecific = product.images.filter(img => img.variant_id === selectedVariant.id);
      if (variantSpecific.length) return variantSpecific;
    }
    return product.images.filter(img => !img.variant_id);
  };

  const currentImages = imagesToShow();

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % currentImages.length);
  };
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-24 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-700">Product not found</h2>
        <Link to="/" className="mt-4 inline-block bg-teal-600 text-white px-6 py-2 rounded-md">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Image Gallery */}
        <div className="md:w-1/2">
          <div className="relative bg-gray-50 rounded-lg overflow-hidden aspect-square">
            {currentImages.length > 0 ? (
              <img
                src={currentImages[currentImageIndex]?.image_url}
                alt={currentImages[currentImageIndex]?.alt_text || product.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">🛍️</div>
            )}
            {currentImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow hover:bg-white"
                >
                  <ChevronLeftIcon className="h-6 w-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow hover:bg-white"
                >
                  <ChevronRightIcon className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
          {currentImages.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {currentImages.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-16 h-16 rounded-md overflow-hidden border-2 ${idx === currentImageIndex ? 'border-teal-600' : 'border-gray-200'}`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div className="md:w-1/2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{product.name}</h1>
          {product.brand && <p className="text-gray-500 text-sm mt-1">{product.brand}</p>}

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-teal-600">{formatPHP(currentPrice)}</span>
            {comparePrice && comparePrice > currentPrice && (
              <span className="text-gray-400 line-through text-lg">{formatPHP(comparePrice)}</span>
            )}
          </div>

          {/* Variant Selectors */}
          {attributeKeys.length > 0 && (
            <div className="mt-6 space-y-4">
              {attributeKeys.map(attrKey => (
                <div key={attrKey}>
                  <label className="block text-sm font-medium text-gray-700 capitalize mb-2">{attrKey}</label>
                  <div className="flex flex-wrap gap-2">
                    {attributeOptions[attrKey].map(value => {
                      const currentAttrs = selectedVariant?.attributes || {};
                      const testAttrs = { ...currentAttrs, [attrKey]: value };
                      const variantForOption = findVariantByAttributes(testAttrs);
                      const isAvailable = variantForOption && variantForOption.inventory_quantity > 0;
                      const isSelected = selectedVariant?.attributes[attrKey] === value;
                      return (
                        <button
                          key={value}
                          onClick={() => handleAttributeChange(attrKey, value)}
                          disabled={!isAvailable}
                          className={`px-3 py-1 border rounded-md text-sm transition
                            ${isSelected ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-300 hover:border-teal-300'}
                            ${!isAvailable ? 'opacity-50 cursor-not-allowed line-through' : ''}
                          `}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stock & Quantity */}
          <div className="mt-6">
            {selectedVariant ? (
              <p className="text-sm text-gray-600">
                Stock: {selectedVariant.inventory_quantity > 0 ? `${selectedVariant.inventory_quantity} available` : 'Out of stock'}
              </p>
            ) : product.variants.length === 0 ? (
              <p className="text-sm text-gray-600">In stock</p>
            ) : null}
          </div>

          {inStock && (
            <div className="mt-4 flex items-center gap-4">
              <div className="flex border border-gray-300 rounded-md">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 border-r hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-4 py-1">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(selectedVariant?.inventory_quantity || 999, quantity + 1))}
                  className="px-3 py-1 border-l hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className={`flex-1 bg-teal-600 text-white py-2 rounded-md font-semibold transition
                  ${addingToCart ? 'opacity-50 cursor-not-allowed' : 'hover:bg-teal-300'}
                `}
              >
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          )}

          {/* Description */}
          <div className="mt-6 border-t pt-6">
            <h3 className="font-semibold text-gray-800 mb-2">Product Description</h3>
            <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
          </div>
        </div>
      </div>
        <div className="mt-12">
            <ProductReviews />
        </div>
    </div>
  );
}