// src/pages/Signup.tsx
import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Turnstile } from 'react-turnstile';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const onTurnstileVerify = useCallback((token: string) => {
    setCaptchaToken(token);
    setError(null);
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!captchaToken) {
      setError('Please complete the captcha verification.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    // 1. Create the account (email confirmation must be off)
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { captchaToken },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // 2. If no session, something went wrong
    if (!data.session) {
      setError('Account created, but you’re not signed in. Please try logging in.');
      setLoading(false);
      return;
    }

    // 3. OTP flow: user is logged in → set flag → go to verification
    sessionStorage.setItem('otp_required', 'true');
    navigate('/verify');
  };

  // ── JSX (same as before) ──────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-teal-600">Lecommerce</h1>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Create Account
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex justify-center">
                <Turnstile
                  sitekey={TURNSTILE_SITE_KEY}
                  onVerify={onTurnstileVerify}
                  onError={() => {
                    setError('Captcha verification failed. Please try again.');
                    setCaptchaToken(null);
                  }}
                  onExpire={() => {
                    setCaptchaToken(null);
                    setError('Captcha expired. Please complete again.');
                  }}
                  theme="light"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !captchaToken}
                className="w-full bg-teal-600 text-white py-2 rounded-md font-medium hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-teal-600 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500 space-x-4">
            <a href="#" className="hover:underline cursor-pointer">Terms of Use</a>
            <a href="#" className="hover:underline cursor-pointer">Privacy Policy</a>
            <a href="#" className="hover:underline cursor-pointer">Help Center</a>
          </div>
        </div>
      </main>
    </div>
  );
}