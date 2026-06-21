import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SplitSquareHorizontal, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';

export function LoginPage() {
  const { isAuthenticated, isLoading, fetchUser } = useAuth();
  const navigate = useNavigate();
  const toastShown = useRef(false);

  // On mount, check if user is already authenticated
  useEffect(() => {
    fetchUser();
  }, []);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Show error toast if redirected back from failed OAuth — guard against StrictMode double-fire
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'auth_failed' && !toastShown.current) {
      toastShown.current = true;
      toast.error('Sign in failed. Please try again.');
      // Clean up URL
      window.history.replaceState({}, '', '/login');
    }
  }, []);

  // Show nothing while checking auth to avoid flash
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 600px 400px at 50% 40%, rgba(20, 184, 166, 0.12) 0%, transparent 70%)',
        }}
      />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 shadow-2xl shadow-black/20">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <SplitSquareHorizontal className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              SubSplit
            </span>
          </div>

          {/* Headlines */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
              Split smarter. Together.
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              Connect your Gmail and let SubSplit handle the rest —
              automatically.
            </p>
          </div>

          {/* Google Sign-In Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => api.auth.googleLogin()}
            className="w-full flex items-center justify-center gap-3 bg-white text-[#111] rounded-xl py-3.5 px-6 font-medium text-[15px] hover:shadow-lg hover:shadow-white/10 transition-all duration-200 cursor-pointer"
          >
            {/* Google G Logo SVG */}
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
            Continue with Google
          </motion.button>

          {/* Privacy note */}
          <div className="mt-5 flex items-center justify-center gap-1.5 text-gray-500 text-xs">
            <Shield className="w-3.5 h-3.5" />
            <span>
              We only read billing emails. We never store email content.
            </span>
          </div>
        </div>

        {/* Footer links */}
        <p className="text-center text-gray-600 text-xs mt-6">
          By signing in, you agree to our{' '}
          <a href="/terms" className="text-gray-400 hover:text-white transition-colors underline underline-offset-2">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-gray-400 hover:text-white transition-colors underline underline-offset-2">
            Privacy Policy
          </a>
        </p>
      </motion.div>
    </div>
  );
}
