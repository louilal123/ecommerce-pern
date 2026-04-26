// src/components/layout/Layout.tsx
import { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import {
  HomeIcon,
  Squares2X2Icon,
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  BellIcon,
  Bars3Icon,
  ShoppingBagIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { useCart } from '../../context/CartContext';
import CartDropdown from '../CartDopdown';

interface LayoutProps {
  session: Session | null;
}

export default function Layout({ session }: LayoutProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { count: cartItemCount } = useCart();  // still used for the drawer badge
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  const displayName = session?.user?.email?.split('@')[0] || 'Guest';

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const closeDrawer = () => setMobileDrawerOpen(false);

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Categories', href: '/categories', icon: Squares2X2Icon },
    { name: 'Cart', href: '/cart', icon: ShoppingCartIcon, badge: cartItemCount },
    { name: 'Orders', href: '/orders', icon: ClipboardDocumentListIcon },
    { name: 'Account', href: '/account', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Sticky Header Container */}
      <header className="sticky top-0 z-40">
        {/* Top Utility Bar  */}
        <div className="bg-gray-50  text-sm">
          <div className="container mx-auto px-4 py-2 flex items-center justify-between">
            {/* Desktop links (hidden on mobile) */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/sell" className="text-gray-700 hover:text-teal-600 transition">
                Sell on lecommerce
              </Link>
              <Link to="/download" className="text-gray-700 hover:text-teal-600 transition">
                Download App
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-gray-500">Follow Us:</span>
                <a href="#" className="text-gray-700 hover:text-teal-600 transition" aria-label="Facebook">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.988h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-700 hover:text-teal-600 transition" aria-label="Instagram">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.336 3.608 1.311.975.975 1.249 2.242 1.311 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.336 2.633-1.311 3.608-.975.975-2.242 1.249-3.608 1.311-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.336-3.608-1.311-.975-.975-1.249-2.242-1.311-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.336-2.633 1.311-3.608.975-.975 2.242-1.249 3.608-1.311 1.266-.058 1.646-.07 4.85-.07zM12 0C8.741 0 8.332.014 7.052.072 5.768.13 4.377.38 3.133 1.623 1.89 2.867 1.64 4.258 1.582 5.542 1.524 6.822 1.51 7.231 1.51 10.49c0 3.259.014 3.668.072 4.948.058 1.284.308 2.675 1.551 3.919 1.243 1.244 2.635 1.493 3.919 1.551 1.28.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 1.284-.058 2.675-.307 3.919-1.551 1.244-1.244 1.493-2.635 1.551-3.919.058-1.28.072-1.689.072-4.948 0-3.259-.014-3.668-.072-4.948-.058-1.284-.307-2.675-1.551-3.919C19.225 1.38 17.834 1.13 16.55 1.072 15.27 1.014 14.861 1 11.602 1 8.343 1 7.935.014 6.655.072 5.371.13 3.98.38 2.736 1.623 1.493 2.867 1.243 4.258 1.185 5.542 1.127 6.822 1.113 7.231 1.113 10.49c0 3.259.014 3.668.072 4.948.058 1.284.308 2.675 1.551 3.919 1.243 1.244 2.635 1.493 3.919 1.551 1.28.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 1.284-.058 2.675-.307 3.919-1.551 1.244-1.244 1.493-2.635 1.551-3.919.058-1.28.072-1.689.072-4.948 0-3.259-.014-3.668-.072-4.948-.058-1.284-.307-2.675-1.551-3.919C19.225.38 17.834.13 16.55.072 15.27.014 14.861 0 11.602 0 8.343 0 7.935.014 6.655.072z" />
                    <path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162S8.597 18.162 12 18.162 18.162 15.403 18.162 12 15.403 5.838 12 5.838zm0 10.162c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4z" />
                    <circle cx="18.406" cy="5.594" r="1.44" />
                  </svg>
                </a>
              </div>
            </div>
            {/* Mobile top bar content */}
            <div className="flex md:hidden items-center gap-4 text-gray-700">
              <Link to="/sell" className="hover:text-teal-600 transition">Sell</Link>
              <Link to="/download" className="hover:text-teal-600 transition">Download</Link>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1 text-gray-700 hover:text-teal-600 transition">
                <BellIcon className="h-4 w-4" />
                <span className="hidden md:inline">Notifications</span>
              </button>
              <Link to="/help" className="text-gray-700 hover:text-teal-600 transition">
                Help
              </Link>
              <div className="flex items-center gap-1 text-gray-700">
                <GlobeAltIcon className="h-4 w-4" />
                <span className="hidden md:inline">English</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="bg-white ">
          {/* Desktop / Tablet Header */}
          <div className="hidden md:block">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-6">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2 shrink-0 group">
                <div className="relative">
                  <ShoppingBagIcon className="h-7 w-7 text-teal-600 group-hover:text-teal-700 transition" />
                  <span className="absolute -top-1 -right-1 bg-orange-500 w-3 h-3 rounded-full border-2 border-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-extrabold tracking-tight text-teal-600 group-hover:text-teal-700 transition leading-tight">
                    lecommerce
                  </span>
                  <span className="text-[10px] font-medium text-gray-500 tracking-wider -mt-1">
                    SHOP SMARTER
                  </span>
                </div>
              </Link>

              {/* Search Bar with Category Dropdown */}
              <div className="flex-1 max-w-4xl">
                <div className="flex rounded-sm border border-gray-300 overflow-hidden">
                  <select
                    className="bg-gray-50 border-r border-gray-300 px-2 py-2 text-sm text-gray-700 outline-none cursor-pointer hover:bg-gray-100 transition"
                    defaultValue="all"
                  >
                    <option value="all">All Departments</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Search for products, brands and more..."
                    className="flex-1 px-4 py-2 outline-none"
                  />
                  <button className="bg-teal-600 hover:bg-teal-700 transition px-5 flex items-center justify-center">
                    <MagnifyingGlassIcon className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <CartDropdown />  

                {session ? (
                  <div className="relative group">
                    <button className="w-8 h-8 rounded-full bg-teal-600 text-white font-medium flex items-center justify-center text-sm uppercase hover:bg-teal-700 transition">
                      {displayName.charAt(0)}
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-800 truncate">{displayName}</p>
                        <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-teal-50 hover:text-teal-600 transition border border-gray-200"
                    title="Sign In"
                  >
                    <UserIcon className="h-5 w-5" />
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="md:hidden">
            <div className="px-4 py-3 flex items-center justify-between">
              <button
                onClick={() => setMobileDrawerOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-full"
                aria-label="Open menu"
              >
                <Bars3Icon className="h-6 w-6 text-gray-700" />
              </button>

              <Link to="/" className="flex items-center gap-1.5">
                <ShoppingBagIcon className="h-6 w-6 text-teal-600" />
                <span className="text-xl font-extrabold text-teal-600">lecommerce</span>
              </Link>

              <div className="flex items-center gap-2">
                <CartDropdown />   {/* 👈 also use dropdown here */}

                {session ? (
                  <Link to="/account" className="w-8 h-8 rounded-full bg-teal-600 text-white font-medium flex items-center justify-center text-sm uppercase">
                    {displayName.charAt(0)}
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center"
                  >
                    <UserIcon className="h-5 w-5" />
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Search Bar with Dropdown */}
            <div className="px-4 pb-3">
              <div className="flex rounded-sm border border-gray-300 focus-within:ring-2 focus-within:ring-teal-500 overflow-hidden">
                <select className="bg-gray-50 border-r border-gray-300 px-2 py-2 text-xs text-gray-700 outline-none max-w-[100px]">
                  <option>All</option>
                  {categories.slice(0, 5).map((cat) => (
                    <option key={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Search..."
                  className="flex-1 px-3 py-2 text-sm outline-none"
                />
                <button className="bg-teal-600 px-4 flex items-center justify-center">
                  <MagnifyingGlassIcon className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide‑out Drawer (Amazon‑style) */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          mobileDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-black/50" onClick={closeDrawer} />
        <div
          className={`absolute left-0 top-0 h-full w-80 max-w-[85%] bg-white shadow-xl transform transition-transform duration-300 ${
            mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
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