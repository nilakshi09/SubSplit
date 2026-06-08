import FadeInOnScroll from './FadeInOnScroll';

export default function EmotionalAnchor() {
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
