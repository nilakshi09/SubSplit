import { useState } from 'react';
import { motion } from 'framer-motion';
import FadeInOnScroll from './FadeInOnScroll';

export default function FinalCTA() {
  const [email, setEmail] = useState('');

  return (
    <section id="cta" className="bg-bg py-24 px-6">
      <FadeInOnScroll className="max-w-xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
          Stop being the one who fronts it.
        </h2>
        <p className="text-base text-slate-500 mb-8">
          Join thousands of friend groups who've made subscription splitting invisible.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="flex-1 px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-mint/40 focus:border-mint transition"
          />
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 8px 30px rgba(74,222,128,0.35)' }}
            whileTap={{ scale: 0.98 }}
            className="bg-mint text-white font-semibold text-sm px-6 py-3.5 rounded-xl shadow-md shadow-mint/25 whitespace-nowrap"
          >
            Create Free Account
          </motion.button>
        </div>
        <p className="text-xs text-slate-400">No credit card. No catch. Takes 2 minutes.</p>
      </FadeInOnScroll>
    </section>
  );
}
