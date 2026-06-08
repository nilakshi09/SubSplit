import { Mail, Users, Zap } from 'lucide-react';
import FadeInOnScroll from './FadeInOnScroll';

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

export default function HowItWorks() {
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
