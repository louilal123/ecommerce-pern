// client/src/components/AdminGuard.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Check role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        navigate('/');
        return;
      }

      // Check OTP verification (skip if already on the OTP page in case of reload)
      const otpVerified = sessionStorage.getItem('admin_otp_verified');
      if (!otpVerified && window.location.pathname !== '/admin/otp') {
        navigate('/admin/otp');
        return;
      }

      setAuthorized(true);
      setLoading(false);
    };

    check();
  }, [navigate]);

  if (loading) return <div className="p-8 text-center">Checking permissions…</div>;
  if (!authorized) return null;
  return <>{children}</>;
}