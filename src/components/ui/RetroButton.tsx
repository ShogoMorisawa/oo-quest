export function RetroButton({ children, disabled, onClick }: { children: React.ReactNode; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="border-2 border-sky-800 bg-sky-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-600 hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
