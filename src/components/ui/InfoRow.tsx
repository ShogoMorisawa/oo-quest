export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-dashed border-current/25 pb-2">
      <dt className="text-current/70">{label}</dt>
      <dd className="text-right font-bold text-current">{value}</dd>
    </div>
  );
}
