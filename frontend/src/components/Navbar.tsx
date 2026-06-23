import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-bg/80 backdrop-blur-lg border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-0.5 text-xl font-bold text-slate-800">
          SubSplit<span className="text-mint">.</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
            How it Works
          </a>
          <a href="#pricing" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
            Pricing
          </a>
          <a href="#faq" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
            FAQ
          </a>
        </div>

        <div className="hidden md:block">
          <motion.button
            onClick={() => navigate('/login')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 bg-mint text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-md shadow-mint/25 hover:shadow-lg hover:shadow-mint/30 transition-shadow"
          >
            Sign Up Free
          </motion.button>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-slate-800 p-2"
          aria-label="Toggle menu"
        >
          <div className="space-y-1.5">
            <motion.span
              animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              className="block w-5 h-0.5 bg-slate-800"
            />
            <motion.span
              animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
              className="block w-5 h-0.5 bg-slate-800"
            />
            <motion.span
              animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              className="block w-5 h-0.5 bg-slate-800"
            />
          </div>
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden border-t border-slate-200 bg-bg"
          >
            <div className="px-6 py-4 space-y-3">
              <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="block text-sm text-slate-500 hover:text-slate-800">
                How it Works
              </a>
              <a href="#pricing" onClick={() => setMobileOpen(false)} className="block text-sm text-slate-500 hover:text-slate-800">
                Pricing
              </a>
              <a href="#faq" onClick={() => setMobileOpen(false)} className="block text-sm text-slate-500 hover:text-slate-800">
                FAQ
              </a>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center gap-2 bg-mint text-white text-sm font-semibold px-5 py-2.5 rounded-full"
              >
                Sign Up Free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
