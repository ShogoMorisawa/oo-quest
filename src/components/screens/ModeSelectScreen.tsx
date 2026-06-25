import { InfoRow } from "@/components/ui/InfoRow";
import { Panel } from "@/components/ui/Panel";
import { modeLabel } from "@/lib/labels";
import type { Mode } from "@/lib/schemas";
import { modeConfig } from "@/lib/utils";

export function ModeSelectScreen({ preferredMode, onStartBattle }: { preferredMode: Mode; onStartBattle: (mode: Mode) => void }) {
  return (
    <Panel>
      <h1 className="text-3xl font-black">モードを選べ</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {(["Normal", "Hard", "Max"] as Mode[]).map((mode) => (
          <button
            key={mode}
            className={`border-4 border-double p-5 text-left shadow-retro transition hover:-translate-y-1 hover:bg-sky-50 ${
              preferredMode === mode ? "border-emerald-500 bg-emerald-50" : "border-sky-700 bg-white/90"
            }`}
            onClick={() => onStartBattle(mode)}
          >
            <h2 className="text-2xl font-bold">{modeLabel(mode)}</h2>
            <div className="mt-5 space-y-2 text-sm">
              <InfoRow label="体力" value={String(modeConfig[mode].hp)} />
              <InfoRow label="被ダメージ" value={String(modeConfig[mode].damage)} />
              <InfoRow label="許容ミス" value={modeConfig[mode].misses} />
            </div>
          </button>
        ))}
      </div>
    </Panel>
  );
}
