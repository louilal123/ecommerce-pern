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
import Signup from './pages/Signup'; 
import SetPassword from './pages/SetPassword';
import AdminGuard from './components/AdminGuard';

function AppRoutes() {
  const { session, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={!session ? <Login /> : <Navigate to="/" replace />} />
      
     <Route path="/signup" element={!session ? <Signup /> : <Navigate to="/" replace />} />
     <Route path="/set-password" element={session ? <SetPassword /> : <Navigate to="/login" />} />
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
        <Route element={<OTPGuard><AdminGuard><AdminLayout /></AdminGuard></OTPGuard>}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/products" element={<Products />} />
          <Route path="/admin/orders" element={<Orders />} />
          <Route path="/admin/categories" element={<Categories />} />   {/* corrected */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
       <Toaster
  position="bottom-right"
  closeButton
  expand={true}
  theme="light"
  toastOptions={{
    className:
      "bg-white text-black border border-gray-200 shadow-2xl rounded-3xl px-5 py-4 text-base font-medium",
    style: {
      minWidth: "320px",
    },
  }}
/>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;