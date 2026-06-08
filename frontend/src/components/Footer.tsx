export default function Footer() {
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
