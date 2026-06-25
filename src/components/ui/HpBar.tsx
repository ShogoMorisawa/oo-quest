export function HpBar({ label, value, max, tone }: { label: string; value: number; max: number; tone: "enemy" | "player" }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span>{label}</span>
        <span>
          {value}/{max}
        </span>
      </div>
      <div className="h-5 border-2 border-white/80 bg-sky-950/60">
        <div className={`h-full ${tone === "enemy" ? "bg-rose-500" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
