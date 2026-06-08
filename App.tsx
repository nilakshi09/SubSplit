import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Mail,
  Users,
  Zap,
  ChevronDown,
  Check,
  ArrowRight,
} from 'lucide-react';

function FadeInOnScroll({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

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
          <motion.a
            href="#cta"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 bg-mint text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-md shadow-mint/25 hover:shadow-lg hover:shadow-mint/30 transition-shadow"
          >
            Sign Up Free
          </motion.a>
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
              <a
                href="#cta"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center gap-2 bg-mint text-white text-sm font-semibold px-5 py-2.5 rounded-full"
              >
                Sign Up Free
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function Hero() {
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
            No more chasing friends for $3.50
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

function Problem() {
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

function HowItWorks() {
  const steps = [
    {
      num: '1',
      icon: Mail,
      title: 'Connect Gmail',
      desc: 'SubSplit scans incoming billing emails to detect subscription charges automatically.',
    },
    {
      num: '2',
      icon: Users,
      title: 'Assign your group',
      desc: 'Tell us who shares each subscription and how to split it. Takes 30 seconds.',
    },
    {
      num: '3',
      icon: Zap,
      title: 'It runs itself',
      desc: 'Every time a charge lands, balances update and reminders go out with a one-tap payment link.',
    },
  ];

  return (
    <section id="how-it-works" className="bg-[#F1F5F4] py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <FadeInOnScroll className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
            Set it up once. Never think about it again.
          </h2>
        </FadeInOnScroll>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <FadeInOnScroll key={step.num} delay={i * 0.15}>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-mint p-6 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-mint/15 text-mint font-bold text-sm">
                    {step.num}
                  </span>
                  <step.icon size={20} className="text-slate-800" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            </FadeInOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

const SUBSCRIPTIONS = [
  { name: 'Netflix', price: '$15.99', color: '#E50914', members: 4 },
  { name: 'Spotify Family', price: '$16.99', color: '#1DB954', members: 5 },
  { name: 'ChatGPT Plus', price: '$20.00', color: '#10A37F', members: 2 },
  { name: 'Amazon Prime', price: '$14.99', color: '#FF9900', members: 3 },
  { name: 'iCloud 2TB', price: '$9.99', color: '#007AFF', members: 4 },
  { name: 'YouTube Premium', price: '$22.99', color: '#FF0000', members: 4 },
];

function SubscriptionShowcase() {
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

function EmotionalAnchor() {
  return (
    <section className="bg-slate-800 py-24 px-6">
      <FadeInOnScroll className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
          Nobody should feel awkward asking a friend for $3.50.
        </h2>
        <p className="text-mint text-base">SubSplit makes it automatic, so the friendship stays easy.</p>
      </FadeInOnScroll>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/mo',
      features: ['Up to 2 subscriptions', '1 group', 'Email notifications'],
      popular: false,
    },
    {
      name: 'Split',
      price: '$3',
      period: '/mo',
      features: ['Unlimited subscriptions', 'Unlimited groups', 'Auto-reminders', 'Payment links'],
      popular: true,
    },
    {
      name: 'Family',
      price: '$6',
      period: '/mo',
      features: ['Everything in Split', 'Priority support', 'Custom split rules'],
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="bg-bg py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <FadeInOnScroll className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
            Simple pricing. Free to start.
          </h2>
        </FadeInOnScroll>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => (
            <FadeInOnScroll key={plan.name} delay={i * 0.12}>
              <div
                className={`relative bg-white rounded-2xl border p-8 shadow-sm h-full ${
                  plan.popular
                    ? 'border-mint shadow-lg shadow-mint/10 -mt-2'
                    : 'border-slate-200'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-mint text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-semibold text-slate-800 mb-1">{plan.name}</h3>
                <p className="text-3xl font-bold text-slate-800 mb-6">
                  {plan.price}
                  <span className="text-base font-normal text-slate-500">{plan.period}</span>
                </p>
                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check size={16} className="text-mint flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <motion.a
                  href="#cta"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className={`mt-8 block text-center font-semibold text-sm py-3 rounded-xl transition-colors ${
                    plan.popular
                      ? 'bg-mint text-white shadow-md shadow-mint/25 hover:shadow-lg hover:shadow-mint/30'
                      : 'bg-slate-800 text-white hover:bg-slate-600'
                  }`}
                >
                  Get Started
                </motion.a>
              </div>
            </FadeInOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQ_ITEMS = [
  {
    q: 'Does SubSplit read all my emails?',
    a: 'No, only billing confirmation emails matching known subscription patterns.',
  },
  {
    q: 'What payment methods does it support?',
    a: 'SubSplit sends Venmo, PayPal, and UPI links based on your group\'s preferences.',
  },
  {
    q: 'What if the charge amount changes?',
    a: 'It detects the change and flags it to the group before updating balances.',
  },
  {
    q: 'Is my Gmail data stored?',
    a: 'Only the billing line-items are stored, never email content or personal data.',
  },
  {
    q: 'Can I use this without Gmail?',
    a: 'Manual entry is supported, but Gmail sync is the magic.',
  },
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-bg py-24 px-6">
      <div className="max-w-2xl mx-auto">
        <FadeInOnScroll className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
            Questions people actually ask
          </h2>
        </FadeInOnScroll>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <FadeInOnScroll key={i} delay={i * 0.06}>
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left"
                  >
                    <span className="text-sm font-semibold text-slate-800 pr-4">{item.q}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex-shrink-0 text-slate-500"
                    >
                      <ChevronDown size={18} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                      >
                        <p className="px-6 pb-4 text-sm text-slate-500 leading-relaxed">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeInOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
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

function Footer() {
  return (
    <footer className="bg-bg border-t border-slate-200 py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <a href="#" className="flex items-center gap-0.5 text-lg font-bold text-slate-800">
          SubSplit<span className="text-mint">.</span>
        </a>
        <div className="flex items-center gap-6 text-sm text-slate-500">
          <a href="#" className="hover:text-slate-800 transition-colors">Privacy</a>
          <a href="#" className="hover:text-slate-800 transition-colors">Terms</a>
          <a href="#" className="hover:text-slate-800 transition-colors">Contact</a>
        </div>
        <p className="text-xs text-slate-400">Made for friend groups everywhere.</p>
      </div>
    </footer>
  );
}

function App() {
  return (
    <div className="font-inter">
      <Navbar />
      <Hero />
      <Problem />
      <HowItWorks />
      <SubscriptionShowcase />
      <EmotionalAnchor />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}

export default App;
