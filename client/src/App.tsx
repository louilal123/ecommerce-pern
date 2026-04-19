// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate  } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';
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
        {/* Home page - always accessible */}
        <Route path="/" element={<Home session={session} />} />
        {/* Login page - only accessible when logged out */}
        <Route
          path="/login"
          element={!session ? <Login /> : <Navigate to="/" replace />}
        />
        {/* OAuth callback handler */}
        <Route path="/auth/callback" element={<AuthCallback />} />
        {/* Future protected routes go here */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;