import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-bg px-6 pt-16 pb-24">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span className="inline-flex items-center gap-2 bg-white border border-slate-200 text-sm text-slate-600 px-4 py-1.5 rounded-full mb-6">
            <span className="text-mint text-xs">&#10022;</span>
            No more chasing friends for $2.50
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-[56px] font-bold text-slate-800 leading-[1.1] tracking-tight mb-6"
        >
          Your subscriptions.
          <br />
          Split automatically.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          SubSplit reads your billing emails and settles the math with your group — silently,
          every month, without anyone lifting a finger.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
        >
          <motion.a
            href="#cta"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 bg-mint text-white font-semibold px-8 py-3.5 rounded-full shadow-lg shadow-mint/25 hover:shadow-xl hover:shadow-mint/35 transition-shadow"
          >
            Sign Up Free <ArrowRight size={18} />
          </motion.a>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 border border-slate-800 text-slate-800 font-semibold px-8 py-3.5 rounded-full hover:bg-slate-800 hover:text-white transition-colors"
          >
            See How It Works
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="flex flex-wrap items-center justify-center gap-3 text-sm text-slate-500 mb-16"
        >
          <span className="flex items-center gap-1.5">
            <Check size={14} className="text-mint" />
            0 manual entries
          </span>
          <span className="text-slate-200">&middot;</span>
          <span className="flex items-center gap-1.5">
            <Check size={14} className="text-mint" />
            Works with 50+ services
          </span>
          <span className="text-slate-200">&middot;</span>
          <span className="flex items-center gap-1.5">
            <Check size={14} className="text-mint" />
            Free forever plan
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 max-w-sm mx-auto text-left">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center text-white text-sm font-bold">
                    N
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">Netflix</p>
                    <p className="text-xs text-slate-500">Monthly charge detected</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-slate-800">$15.99</span>
              </div>

              <div className="border-t border-slate-200 pt-4 mb-4">
                <p className="text-xs text-slate-500 mb-2">Splitting with 4 members</p>
                <div className="flex items-center gap-2">
                  {['A', 'J', 'M', 'K'].map((initial, i) => (
                    <div
                      key={initial}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                      style={{
                        backgroundColor:
                          i === 0 ? '#4ADE80' : i === 1 ? '#60A5FA' : i === 2 ? '#FBBF24' : '#F87171',
                      }}
                    >
                      {initial}
                    </div>
                  ))}
                  <span className="ml-2 text-sm font-semibold text-mint">$3.99 each</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-mint text-white text-sm font-semibold py-2.5 rounded-xl hover:shadow-md hover:shadow-mint/25 transition-shadow"
              >
                Settle Up
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
