// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Home from './pages/Home';
import LoadingSpinner from './components/LoadingSpinner';
import { CartProvider } from './context/CartContext';
import ProductDetail from './pages/ProductDetail';
import { Toaster } from 'sonner';
import Checkout from './pages/Checkout';
import { AuthProvider, useAuth } from './context/AuthContext';

// Component that protects routes
function AppRoutes() {
  const { session, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      <Route path="/login" element={!session ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="product/:slug" element={<ProductDetail />} />
        <Route path="/checkout" element={<Checkout />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Toaster position="top-right" richColors />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;