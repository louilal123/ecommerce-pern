// src/components/layout/Layout.tsx
import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import {
  HomeIcon,
  Squares2X2Icon,
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface LayoutProps {
  session: Session | null;
}

export default function Layout({ session }: LayoutProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [cartItemCount] = useState(3); // Dummy count – replace with real state later

  const displayName = session?.user?.email?.split('@')[0] || 'Guest';

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const closeDrawer = () => setMobileDrawerOpen(false);

  // Navigation items used in both bottom nav and drawer
  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Categories', href: '/categories', icon: Squares2X2Icon },
    { name: 'Cart', href: '/cart', icon: ShoppingCartIcon, badge: cartItemCount },
    { name: 'Orders', href: '/orders', icon: ClipboardDocumentListIcon },
    { name: 'Account', href: '/account', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Sticky Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        {/* Desktop / Tablet Header */}
        <div className="hidden md:block">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-6">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold text-teal-600 shrink-0">
              lecommerce
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for products, brands and more..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-full focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4 shrink-0">
              {session ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Hello, {displayName}!</span>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-teal-600 hover:text-teal-700 transition"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="text-sm font-medium bg-teal-600 text-white px-4 py-2 rounded-full hover:bg-teal-700 transition"
                >
                  Sign In
                </Link>
              )}

              {/* Cart Icon with Badge */}
              <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition">
                <ShoppingCartIcon className="h-6 w-6 text-gray-700" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden">
          <div className="px-4 py-3 flex items-center justify-between">
            {/* Hamburger Menu */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Open menu"
            >
              <Bars3Icon className="h-6 w-6 text-gray-700" />
            </button>

            {/* Logo */}
            <Link to="/" className="text-xl font-bold text-teal-600">
              lecommerce
            </Link>

            {/* Cart Icon */}
            <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-full">
              <ShoppingCartIcon className="h-6 w-6 text-gray-700" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Search Bar */}
          <div className="px-4 pb-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-full focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide‑out Drawer (Amazon‑style) */}
      <div
        className={`fixed inset-0 z-30 md:hidden transition-opacity duration-300 ${
          mobileDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50" onClick={closeDrawer} />

        {/* Drawer Content */}
        <div
          className={`absolute left-0 top-0 h-full w-80 max-w-[85%] bg-white shadow-xl transform transition-transform duration-300 ${
            mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-teal-600 text-white">
            <div>
              <p className="text-sm opacity-90">Hello,</p>
              <p className="font-semibold">{displayName}</p>
            </div>
            <button
              onClick={closeDrawer}
              className="p-1 hover:bg-teal-700 rounded-full"
              aria-label="Close menu"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Drawer Navigation */}
          <nav className="p-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={closeDrawer}
                className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-800">{item.name}</span>
                </div>
                {item.badge && item.badge > 0 && (
                  <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}

            {session ? (
              <button
                onClick={() => {
                  handleLogout();
                  closeDrawer();
                }}
                className="w-full mt-2 px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                Sign Out
              </button>
            ) : (
              <Link
                to="/login"
                onClick={closeDrawer}
                className="block mt-2 px-4 py-3 text-center bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
        <Outlet />
      </main>

      {/* Footer (Desktop only) */}
      <footer className="hidden md:block bg-white border-t border-gray-200 mt-8">
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
                <li><Link to="/help" className="hover:text-teal-600">Help Center</Link></li>
                <li><Link to="/shipping" className="hover:text-teal-600">Shipping Info</Link></li>
                <li><Link to="/returns" className="hover:text-teal-600">Returns</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Contact</h4>
              <p className="text-sm text-gray-600">support@lecommerce.com</p>
              <p className="text-sm text-gray-600">1-800-555-1234</p>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-6 pt-6 text-center text-sm text-gray-500">
            © 2026 lecommerce. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}