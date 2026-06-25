export function Panel({ children }: { children: React.ReactNode }) {
  return <section className="flex-1 border-4 border-double border-sky-700 bg-white/86 p-4 text-slate-900 shadow-retro backdrop-blur sm:p-6">{children}</section>;
}
