// src/components/OTPGuard.tsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OTPGuard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && session) {
      const otpRequired = sessionStorage.getItem('otp_required');
      // If OTP is required and we're not already on the verify page, redirect
      if (otpRequired && location.pathname !== '/verify') {
        navigate('/verify', { replace: true });
      }
    }
  }, [session, loading, navigate, location.pathname]);

  if (loading) return null; // or a spinner
  return <>{children}</>;
}