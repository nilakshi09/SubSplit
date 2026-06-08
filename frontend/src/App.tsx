import {
  Navbar,
  Hero,
  Problem,
  HowItWorks,
  SubscriptionShowcase,
  EmotionalAnchor,
  Pricing,
  FAQ,
  FinalCTA,
  Footer,
} from './components';

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
