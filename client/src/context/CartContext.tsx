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

    if (error) console.error(error);
    else setItems(data as any);
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();

    // Optional: subscribe to realtime changes for this user
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

    // Upsert: if exists, add quantity; else insert
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
    await fetchCart(); // refresh
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