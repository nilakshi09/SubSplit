import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import FadeInOnScroll from './FadeInOnScroll';

export default function Problem() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="bg-bg py-24 px-6">
      <div ref={ref} className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <FadeInOnScroll>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 leading-tight mb-6">
            The invisible tab that never closes
          </h2>
          <p className="text-lg text-slate-800 font-medium mb-4">
            Someone in your group is quietly subsidizing everyone else. Every month. Without saying
            a word.
          </p>
          <p className="text-base text-slate-500 leading-relaxed">
            Splitwise needs you to log it. Group chats get ignored. Venmo reminders feel awkward. So
            nothing happens — and the imbalance compounds.
          </p>
        </FadeInOnScroll>

        <FadeInOnScroll delay={0.2}>
          <div className="space-y-4">
            {[
              { name: 'You', msg: 'Hey, Netflix is $15.99 this month. Can you Venmo me $3.99?', time: '2:34 PM' },
              { name: 'Jake', msg: 'Hey, Netflix is $15.99 this month. Can you Venmo me $3.99?', time: '2:34 PM' },
              { name: 'Maria', msg: 'Hey, Netflix is $15.99 this month. Can you Venmo me $3.99?', time: '2:34 PM' },
            ].map((reminder, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.2 }}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-500">
                    {reminder.name[0]}
                  </div>
                  <span className="text-sm font-medium text-slate-800">{reminder.name}</span>
                  <span className="text-xs text-slate-400 ml-auto">{reminder.time}</span>
                </div>
                <p className="text-sm text-slate-500 pl-9">{reminder.msg}</p>
                <div className="flex items-center gap-1 mt-2 pl-9">
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                  <span className="text-xs text-slate-400">No response</span>
                </div>
              </motion.div>
            ))}
          </div>
        </FadeInOnScroll>
      </div>
    </section>
  );
}
