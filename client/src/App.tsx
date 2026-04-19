// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Home from './pages/Home';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth routes (no layout) */}
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* All other routes wrapped in Layout */}
        <Route element={<Layout session={session} />}>
          <Route path="/" element={<Home />} />
          {/* Add more routes here later, e.g.:
              <Route path="/categories" element={<Categories />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/account" element={<Account />} />
          */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;