// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Home from './pages/Home';
import LoadingSpinner from './components/LoadingSpinner';
import { CartProvider } from './context/CartContext';
import ProductDetail from './pages/ProductDetail';
import { Toaster } from 'sonner';
import Checkout from './pages/Checkout';
import { AuthProvider, useAuth } from './context/AuthContext';
import OrderSuccess from './pages/OrderSuccess';
import Products from './pages/admin/Products';
import Orders from './pages/admin/Orders';
import Categories from './pages/admin/Categories';
import VerifyOTP from './pages/VerifyOTP';
import OTPGuard from './components/OTPGuard';

function AppRoutes() {
  const { session, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={!session ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* OTP verification page – accessible only when logged in, not guarded by OTPGuard */}
      <Route
        path="/verify"
        element={session ? <VerifyOTP /> : <Navigate to="/login" replace />}
      />

      {/* All other routes are wrapped with OTPGuard */}
      <Route element={<OTPGuard><Layout /></OTPGuard>}>
        <Route path="/" element={<Home />} />
        <Route path="product/:slug" element={<ProductDetail />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order/success" element={<OrderSuccess />} />
      </Route>

      {/* Admin routes */}
      <Route element={<OTPGuard><AdminLayout /></OTPGuard>}>
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/products" element={<Products />} />
        <Route path="/admin/orders" element={<Orders />} />
        <Route path="/admin/category" element={<Categories />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Toaster position="bottom-center" richColors />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;