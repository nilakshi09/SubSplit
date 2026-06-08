import { motion } from 'framer-motion';
import FadeInOnScroll from './FadeInOnScroll';
import { SUBSCRIPTIONS } from '../data/constants';

export default function SubscriptionShowcase() {
  return (
    <section className="bg-bg py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <FadeInOnScroll className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
            Recognizes every recurring charge
          </h2>
          <p className="text-base text-slate-500 max-w-xl mx-auto">
            Netflix on the 14th. Spotify on the 3rd. SubSplit learns the pattern and never asks
            twice.
          </p>
        </FadeInOnScroll>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SUBSCRIPTIONS.map((sub, i) => (
            <FadeInOnScroll key={sub.name} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: sub.color }}
                    >
                      {sub.name[0]}
                    </div>
                    <span className="font-semibold text-slate-800 text-sm">{sub.name}</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-mint" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-slate-800">{sub.price}</span>
                  <span className="text-xs text-slate-500 bg-slate-200/60 px-2.5 py-1 rounded-full">
                    &divide; {sub.members} members
                  </span>
                </div>
                <p className="text-xs text-mint font-medium mt-2">Active</p>
              </motion.div>
            </FadeInOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
