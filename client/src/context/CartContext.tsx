// src/context/CartContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface CartItem {
  id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  product: {
    name: string;
    slug: string;
    default_price: number;
  };
  variant?: {
    attributes: Record<string, any>;
    price: number;
  };
  image_url?: string; // 👈 add image URL
}

interface CartContextType {
  items: CartItem[];
  count: number;
  addToCart: (productId: string, variantId: string | null, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    // Fetch cart items with product, variant, and **primary image**
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        product_id,
        variant_id,
        quantity,
        product:products(id, name, slug, default_price),
        variant:product_variants(attributes, price)
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    // For each cart item, fetch its primary product image (or variant-specific image)
    const enrichedItems = await Promise.all(
      (data || []).map(async (item: any) => {
        let imageUrl: string | undefined;

        // 1. Try variant-specific image first
        if (item.variant_id) {
          const { data: variantImg } = await supabase
            .from('product_images')
            .select('image_url')
            .eq('variant_id', item.variant_id)
            .eq('is_primary', true)
            .maybeSingle();

          if (variantImg) {
            imageUrl = variantImg.image_url;
          }
        }

        // 2. If no variant image, get product-level primary image
        if (!imageUrl) {
          const { data: productImg } = await supabase
            .from('product_images')
            .select('image_url')
            .eq('product_id', item.product_id)
            .eq('is_primary', true)
            .maybeSingle();

          if (productImg) {
            imageUrl = productImg.image_url;
          }
        }

        // 3. Fallback: any image (not primary) for the product
        if (!imageUrl) {
          const { data: anyImg } = await supabase
            .from('product_images')
            .select('image_url')
            .eq('product_id', item.product_id)
            .limit(1)
            .maybeSingle();

          if (anyImg) imageUrl = anyImg.image_url;
        }

        return {
          ...item,
          image_url: imageUrl,
        };
      })
    );

    setItems(enrichedItems as any);
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();

    const channel = supabase
      .channel('cart-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cart_items' }, () => {
        fetchCart();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const addToCart = async (productId: string, variantId: string | null, quantity: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in');

    const existing = items.find(i => i.product_id === productId && i.variant_id === variantId);
    if (existing) {
      await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('cart_items')
        .insert({ user_id: user.id, product_id: productId, variant_id: variantId, quantity });
    }
    await fetchCart();
  };

  const removeFromCart = async (itemId: string) => {
    await supabase.from('cart_items').delete().eq('id', itemId);
    await fetchCart();
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(itemId);
    await supabase.from('cart_items').update({ quantity }).eq('id', itemId);
    await fetchCart();
  };

  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, count, addToCart, removeFromCart, updateQuantity, loading }}>
      {children}
    </CartContext.Provider>
  );
};