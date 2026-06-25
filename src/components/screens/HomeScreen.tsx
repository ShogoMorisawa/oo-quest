import { Alert } from "@/components/ui/Alert";
import { InfoRow } from "@/components/ui/InfoRow";
import { Panel } from "@/components/ui/Panel";
import { RetroButton } from "@/components/ui/RetroButton";
import type { AppSettings, MistakeRecord, QuestMeta } from "@/lib/schemas";
import type { LoadedQuest } from "@/types/app";

export type QuestCounts = {
  total: number;
  domain: number;
  tech: number;
};

export function HomeScreen({
  settings,
  questMetas,
  loadedQuest,
  counts,
  loadError,
  loading,
  displayQuestTitle,
  mistakes,
  onUpdateSettings,
  onLoadQuest,
  onStartModeSelect,
  onStartReview
}: {
  settings: AppSettings;
  questMetas: QuestMeta[];
  loadedQuest: LoadedQuest | null;
  counts: QuestCounts;
  loadError: string;
  loading: boolean;
  displayQuestTitle: string;
  mistakes: MistakeRecord[];
  onUpdateSettings: (next: Partial<AppSettings>) => void;
  onLoadQuest: (meta: QuestMeta) => void;
  onStartModeSelect: () => void;
  onStartReview: () => void;
}) {
  const unresolvedMistakes = mistakes.filter((mistake) => !mistake.resolved).length;

  return (
    <Panel>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-5">
          <div>
            <h1 className="mt-2 text-4xl font-black text-sky-950 sm:text-6xl">{displayQuestTitle}</h1>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">プレイヤー名</span>
            <input
              className="w-full border-2 border-sky-700 bg-white px-3 py-3 text-slate-950 outline-none focus:border-emerald-500"
              value={settings.playerName}
              onChange={(event) => onUpdateSettings({ playerName: event.target.value })}
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">クエスト</span>
              <select
                className="w-full border-2 border-sky-700 bg-white px-3 py-3 text-slate-950 outline-none focus:border-emerald-500"
                value={loadedQuest?.meta.id ?? settings.lastSelectedQuestId ?? ""}
                onChange={(event) => {
                  const meta = questMetas.find((quest) => quest.id === event.target.value);
                  if (meta) {
                    onUpdateSettings({ lastSelectedQuestId: meta.id, questTitle: meta.title });
                    onLoadQuest(meta);
                  }
                }}
              >
                {questMetas.map((quest) => (
                  <option key={quest.id} value={quest.id}>
                    {quest.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">クエスト名</span>
              <input
                className="w-full border-2 border-sky-700 bg-white px-3 py-3 text-slate-950 outline-none focus:border-emerald-500"
                value={settings.questTitle}
                onChange={(event) => onUpdateSettings({ questTitle: event.target.value })}
              />
            </label>
          </div>

          {loadError && <Alert>{loadError}</Alert>}
          {counts.total > 0 && counts.total < 20 && (
            <p className="border-l-4 border-amber-300 bg-amber-950/40 px-3 py-2 text-sm text-amber-100">
              問題数が20問未満です。全{counts.total}問でバトルを開始します。
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <RetroButton disabled={!loadedQuest || loading} onClick={onStartModeSelect}>
              冒険を始める
            </RetroButton>
            <RetroButton disabled={!loadedQuest || unresolvedMistakes === 0} onClick={onStartReview}>
              復習へ進む
            </RetroButton>
          </div>
        </section>

        <aside className="dq-window p-4">
          <h2 className="text-xl font-bold text-white">クエスト情報</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <InfoRow label="問題数" value={`${counts.total}問`} />
            <InfoRow label="ドメイン" value={`${counts.domain}問`} />
            <InfoRow label="技術" value={`${counts.tech}問`} />
            <InfoRow label="未復習" value={`${unresolvedMistakes}件`} />
          </dl>
          <p className="mt-6 border-t border-dashed border-sky-200/70 pt-4 text-xs leading-6 text-sky-50">
            クエストを追加するには public/quests/ にJSONファイルを置き、index.jsonに追記してください。
          </p>
        </aside>
      </div>
    </Panel>
  );
}
