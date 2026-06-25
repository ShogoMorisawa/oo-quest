export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-4 border-double border-sky-700 bg-white/88 p-4 shadow-sm">
      <p className="text-xs uppercase text-slate-600">{label}</p>
      <p className="mt-2 text-2xl font-black text-sky-950">{value}</p>
    </div>
  );
}
