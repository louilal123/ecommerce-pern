// src/pages/VerifyOTP.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function VerifyOTP() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const sendOTP = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUserEmail(user.email ?? '');

      if (!sent) {
        setSent(true);
        try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
          const res = await fetch(`${API_URL}/api/admin-auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, email: user.email }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to send code');
        } catch (err: any) {
          setError(err.message);
          setSent(false); // allow retry
        }
      }
    };
    sendOTP();
  }, [navigate, sent]);

  const maskedEmail = userEmail
    ? userEmail.replace(/(.{3})(.*)(@.*)/, '$1****$3')
    : '';

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const res = await fetch(`${API_URL}/api/admin-auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, code }),
    });
    const data = await res.json();

    if (data.valid) {
      // OTP verified – remove the flag
      sessionStorage.removeItem('otp_required');

      // Check role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } else {
      setError(data.error || 'Invalid code');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Check your email</h1>
        <p className="text-sm text-gray-600 mb-6">
          We’ve sent a 6‑digit code to{' '}
          <span className="font-medium text-gray-800">{maskedEmail}</span>
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded text-sm">{error}</div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-center text-2xl tracking-widest focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            placeholder="000000"
          />
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-teal-600 text-white py-2 rounded-md font-medium hover:bg-teal-700 transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Verifying…' : 'Verify'}
          </button>
        </form>

        <button
          onClick={() => setSent(false)} // triggers resend
          className="w-full mt-4 text-teal-600 text-sm hover:underline cursor-pointer"
        >
          Resend code
        </button>
      </div>
    </div>
  );
}