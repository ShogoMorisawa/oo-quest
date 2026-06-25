import { Panel } from "@/components/ui/Panel";
import { RetroButton } from "@/components/ui/RetroButton";
import { Stat } from "@/components/ui/Stat";
import { modeLabel } from "@/lib/labels";
import type { MistakeRecord, QuizSession } from "@/lib/schemas";

export function HistoryScreen({
  history,
  mistakes,
  onReset,
  onHome,
  onReview
}: {
  history: QuizSession[];
  mistakes: MistakeRecord[];
  onReset: () => void;
  onHome: () => void;
  onReview: () => void;
}) {
  const scores = history.map((session) => session.correctCount * 5);
  const maxClears = history.filter((session) => session.mode === "Max" && session.cleared);
  return (
    <Panel>
      <h1 className="text-3xl font-black">履歴</h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <Stat label="初回" value={scores.length ? `${scores[scores.length - 1]}点` : "-"} />
        <Stat label="最新" value={scores.length ? `${scores[0]}点` : "-"} />
        <Stat label="最高" value={scores.length ? `${Math.max(...scores)}点` : "-"} />
        <Stat label="完全クリア" value={`${maxClears.length}回`} />
      </div>
      {maxClears.length > 0 && <p className="mt-4 border-2 border-emerald-300 bg-emerald-950/30 px-3 py-2">マックスモード クリア済み</p>}
      <div className="mt-6 space-y-2">
        {history.length === 0 ? (
          <p className="text-slate-700">まだ履歴はありません。</p>
        ) : (
          history.map((session) => (
            <div key={session.id} className="grid gap-2 border border-sky-200 bg-white/82 p-3 text-sm shadow-sm sm:grid-cols-[1fr_auto_auto_auto]">
              <span>{new Date(session.finishedAt ?? session.startedAt).toLocaleString("ja-JP")}</span>
              <span>{session.questTitle}</span>
              <span>{modeLabel(session.mode)}</span>
              <span>{session.correctCount * 5}点</span>
            </div>
          ))
        )}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <RetroButton onClick={onHome}>タイトルに戻る</RetroButton>
        <RetroButton disabled={mistakes.filter((m) => !m.resolved).length === 0} onClick={onReview}>
          復習へ進む
        </RetroButton>
        <RetroButton onClick={onReset}>データを全リセット</RetroButton>
      </div>
    </Panel>
  );
}
