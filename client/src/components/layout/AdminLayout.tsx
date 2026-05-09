// src/components/layout/AdminLayout.tsx
import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  HomeIcon,
  ShoppingBagIcon,
  CubeIcon,
  ChartBarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Bars3Icon,
  BellIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useTheme, type Theme } from '../ThemeContext';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: HomeIcon },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBagIcon },
  { to: '/admin/products', label: 'Products', icon: CubeIcon },
  { to: '/admin/reports', label: 'Reports', icon: ChartBarIcon },
];

const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <SunIcon className="w-4 h-4" /> },
  { value: 'dark', label: 'Dark', icon: <MoonIcon className="w-4 h-4" /> },
  { value: 'system', label: 'System', icon: <ComputerDesktopIcon className="w-4 h-4" /> },
];

const sampleNotifications = [
  {
    id: 1,
    text: 'New order #1042 placed by John Doe',
    time: '2 min ago',
    highlight: true,
  },
  {
    id: 2,
    text: 'Low stock: Wireless Headphones Pro (3 left)',
    time: '10 min ago',
    highlight: true,
  },
  {
    id: 3,
    text: 'New 5-star review on Smart Watch Series X',
    time: '1 hour ago',
    highlight: false,
  },
];

function LecommerceLogo({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 group cursor-default select-none">
      <div className="relative flex-shrink-0">
        <ShoppingBagIcon className="h-7 w-7 text-teal-600" />
        <span className="absolute -top-1 -right-1 bg-orange-500 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900" />
      </div>
      {!collapsed && (
        <div className="flex flex-col leading-none">
          <span className="text-[17px] font-extrabold tracking-tight text-teal-600 whitespace-nowrap">
            LECOMMERCE
          </span>
          <span className="text-[10px] font-semibold tracking-[0.18em] text-orange-500 uppercase mt-0.5">
            Admin Panel
          </span>
        </div>
      )}
    </div>
  );
}

function ThemeDropdown() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = themeOptions.find((t) => t.value === theme)!;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="cursor-pointer flex items-center gap-1.5 p-2 rounded-xl
          text-gray-400 dark:text-gray-500
          hover:bg-gray-100 dark:hover:bg-gray-800
          hover:text-gray-700 dark:hover:text-gray-300
          transition-colors duration-200"
      >
        {current.icon}
        <ChevronDownIcon className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50">
          <div className="p-1.5">
            {themeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setTheme(opt.value);
                  setOpen(false);
                }}
                className={`cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 ${
                  theme === opt.value
                    ? 'bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {opt.icon}
                <span>{opt.label}</span>
                {theme === opt.value && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = sampleNotifications.filter((n) => n.highlight).length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="cursor-pointer relative p-2.5 rounded-xl
          text-gray-400 dark:text-gray-500
          hover:bg-gray-50 dark:hover:bg-gray-800
          hover:text-gray-700 dark:hover:text-gray-300
          transition-colors duration-200"
      >
        <BellIcon className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white dark:ring-gray-900" />
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 dark:border-gray-800">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Notifications</h3>
            <span className="text-xs font-semibold bg-orange-50 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-lg">
              {unreadCount} new
            </span>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {sampleNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`flex items-start gap-3 px-5 py-3.5 border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${
                  notif.highlight ? 'bg-teal-50/30 dark:bg-teal-900/10' : ''
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    notif.highlight ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">{notif.text}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{notif.time}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/admin/notifications"
            onClick={() => setOpen(false)}
            className="block text-center py-3 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:bg-gray-50 dark:hover:bg-gray-800 border-t border-gray-50 dark:border-gray-800 transition-colors"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}

function ProfileDropdown({ align = 'right' }: { align?: 'right' | 'left' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="cursor-pointer flex items-center gap-2 px-2 py-1.5 rounded-xl
          hover:bg-gray-100 dark:hover:bg-gray-800
          transition-colors duration-200"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-black shadow-sm flex-shrink-0">
          JD
        </div>
        <ChevronDownIcon
          className={`w-3.5 h-3.5 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div
          className={`absolute top-full mt-2 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 dark:border-gray-800">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-black flex-shrink-0">
              JD
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">John Doe</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate">john@lecommerce.io</p>
            </div>
          </div>
          <div className="p-1.5">
            <button
              onClick={() => setOpen(false)}
              className="cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
                text-gray-700 dark:text-gray-300
                hover:bg-gray-50 dark:hover:bg-gray-800
                transition-colors duration-200"
            >
              <UserCircleIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              Profile
            </button>
            <div className="my-1 h-px bg-gray-50 dark:bg-gray-800" />
            <button
              onClick={() => setOpen(false)}
              className="cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
                text-red-600 dark:text-red-400
                hover:bg-red-50 dark:hover:bg-red-950/40
                transition-colors duration-200"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarProfileDropdown({ collapsed }: { collapsed: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`cursor-pointer w-full flex items-center gap-3 p-2.5 rounded-xl
          hover:bg-gray-50 dark:hover:bg-gray-800
          transition-colors duration-200 ${collapsed ? 'justify-center' : ''}`}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
          JD
        </div>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-tight truncate">
                John Doe
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate">Super Admin</p>
            </div>
            <ChevronDownIcon
              className={`w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0 transition-transform duration-200 ${
                open ? 'rotate-180' : ''
              }`}
            />
          </>
        )}
      </button>

      {open && (
        <div
          className={`absolute bottom-full mb-2 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50 ${
            collapsed ? 'left-full ml-3 w-52' : 'left-0 right-0'
          }`}
        >
          {!collapsed && (
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 dark:border-gray-800">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-black flex-shrink-0">
                JD
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">John Doe</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">john@lecommerce.io</p>
              </div>
            </div>
          )}
          <div className="p-1.5">
            <button
              onClick={() => setOpen(false)}
              className="cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
                text-gray-700 dark:text-gray-300
                hover:bg-gray-50 dark:hover:bg-gray-800
                transition-colors duration-200"
            >
              <UserCircleIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              Profile
            </button>
            <div className="my-1 h-px bg-gray-50 dark:bg-gray-800" />
            <button
              onClick={() => setOpen(false)}
              className="cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
                text-red-600 dark:text-red-400
                hover:bg-red-50 dark:hover:bg-red-950/40
                transition-colors duration-200"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const currentPage = navItems.find((n) => n.to === location.pathname)?.label ?? 'Dashboard';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 font-sans transition-colors duration-200">
      {/* ── Desktop Sidebar (no theme picker) ── */}
      <aside
        className={`${
          collapsed ? 'w-20' : 'w-64'
        } hidden lg:flex flex-col bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-all duration-300 ease-in-out shadow-sm`}
      >
        {/* Logo area */}
        <div
          className={`flex items-center px-5 py-5 border-b border-gray-50 dark:border-gray-800 ${
            collapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <LecommerceLogo collapsed={collapsed} />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pt-5 space-y-1 overflow-y-auto">
          {!collapsed && (
            <p className="text-[10px] font-bold text-gray-300 dark:text-gray-600 tracking-[0.2em] uppercase px-3 mb-3">
              Menu
            </p>
          )}
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                title={collapsed ? item.label : ''}
                className={`cursor-pointer flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-900/30'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-100'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: profile only */}
        <div className="px-3 py-4 border-t border-gray-50 dark:border-gray-800">
          <SidebarProfileDropdown collapsed={collapsed} />
        </div>
      </aside>

      {/* ── Mobile Slide-Over (unchanged) ── */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'visible' : 'invisible'}`}
        onClick={() => setSidebarOpen(false)}
      >
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <aside
          className={`absolute left-0 top-0 h-full w-72 bg-white dark:bg-gray-900 shadow-2xl flex flex-col transform transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-5 border-b border-gray-50 dark:border-gray-800">
            <LecommerceLogo />
            <button
              onClick={() => setSidebarOpen(false)}
              className="cursor-pointer p-1.5 rounded-lg
                text-gray-400 dark:text-gray-500
                hover:bg-gray-100 dark:hover:bg-gray-800
                hover:text-gray-700 dark:hover:text-gray-300
                transition-colors duration-200"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
          </div>

          <nav className="flex-1 px-3 pt-5 space-y-1 overflow-y-auto">
            <p className="text-[10px] font-bold text-gray-300 dark:text-gray-600 tracking-[0.2em] uppercase px-3 mb-3">
              Menu
            </p>
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`cursor-pointer flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    active
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-900/30'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400" />}
                </Link>
              );
            })}
          </nav>

          <div className="px-3 py-4 border-t border-gray-50 dark:border-gray-800">
            <SidebarProfileDropdown collapsed={false} />
          </div>
        </aside>
      </div>

      {/* ── Main Content ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="cursor-pointer lg:hidden p-2 rounded-lg
              text-gray-500 dark:text-gray-400
              hover:bg-gray-100 dark:hover:bg-gray-800
              transition-colors duration-200"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>

          {/* Desktop sidebar collapse/expand */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="cursor-pointer hidden lg:flex p-2 rounded-lg
              text-gray-500 dark:text-gray-400
              hover:bg-gray-100 dark:hover:bg-gray-800
              transition-colors duration-200"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRightIcon className="w-5 h-5" />
            ) : (
              <ChevronLeftIcon className="w-5 h-5" />
            )}
          </button>

          <div className="flex-1 min-w-0">
           
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
              {new Date().toLocaleDateString('en-PH', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button className="cursor-pointer p-2.5 rounded-xl
              text-gray-400 dark:text-gray-500
              hover:bg-gray-50 dark:hover:bg-gray-800
              hover:text-gray-700 dark:hover:text-gray-300
              transition-colors duration-200"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>

            <NotificationDropdown />

            <ThemeDropdown />

            <div className="h-6 w-px bg-gray-100 dark:bg-gray-800 mx-1" />
            <ProfileDropdown align="right" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}