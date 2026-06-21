import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FadeInOnScroll from './FadeInOnScroll';

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

export default function Pricing() {
  const navigate = useNavigate();
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
                <motion.button
                  onClick={() => navigate('/login')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className={`mt-8 w-full block text-center font-semibold text-sm py-3 rounded-xl transition-colors ${
                    plan.popular
                      ? 'bg-mint text-white shadow-md shadow-mint/25 hover:shadow-lg hover:shadow-mint/30'
                      : 'bg-slate-800 text-white hover:bg-slate-600'
                  }`}
                >
                  Get Started
                </motion.button>
              </div>
            </FadeInOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
