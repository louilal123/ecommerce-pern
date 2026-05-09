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

      {/* Public shop pages */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="product/:slug" element={<ProductDetail />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order/success" element={<OrderSuccess />} />
      </Route>

      {/* Admin routes – no auth guard for now */}
      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<Dashboard />} />
        {/* Optional: catch /admin and redirect to dashboard */}
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