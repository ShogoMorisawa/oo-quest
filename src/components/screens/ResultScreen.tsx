import { Panel } from "@/components/ui/Panel";
import { RetroButton } from "@/components/ui/RetroButton";
import { Stat } from "@/components/ui/Stat";
import { accuracy, categoryStats } from "@/lib/utils";
import type { Question, QuizSession } from "@/lib/schemas";

export function ResultScreen({
  session,
  questions,
  history,
  onHome,
  onReview
}: {
  session: QuizSession;
  questions: Question[];
  history: QuizSession[];
  onHome: () => void;
  onReview: () => void;
}) {
  const score = session.correctCount * 5;
  const first = [...history].reverse().find((item) => item.questId === session.questId);
  const best = Math.max(...history.filter((item) => item.questId === session.questId).map((item) => item.correctCount * 5), score);
  const domain = categoryStats(session.attempts, "domain");
  const tech = categoryStats(session.attempts, "tech");
  const wrongIds = new Set(session.attempts.filter((attempt) => !attempt.isCorrect).map((attempt) => attempt.questionId));
  const wrongQuestions = questions.filter((question) => wrongIds.has(question.id));
  return (
    <Panel>
      <h1 className={`text-4xl font-black sm:text-6xl ${session.cleared ? "text-emerald-300" : "text-rose-300"}`}>
        {session.cleared ? `${session.dragonName}を討伐した！` : "ちからつきた"}
      </h1>
      {session.cleared && <p className="mt-3 text-lg">称号を獲得しました：{session.questTitle} 見習い卒業</p>}
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <Stat label="スコア" value={`${score}点`} />
        <Stat label="正答率" value={`${accuracy(session.correctCount, session.totalQuestions)}%`} />
        <Stat label="最高点" value={`${best}点`} />
        <Stat label="初回差分" value={`${score - (first ? first.correctCount * 5 : score)}点`} />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Stat label="ドメイン" value={`${domain.correct}/${domain.total} (${domain.rate}%)`} />
        <Stat label="技術" value={`${tech.correct}/${tech.total} (${tech.rate}%)`} />
      </div>
      <section className="mt-6 border-4 border-double border-sky-700 bg-white/88 p-4">
        <h2 className="text-xl font-bold">今回のミス</h2>
        {wrongQuestions.length === 0 ? (
          <p className="mt-3 text-emerald-300">ミスはありません。</p>
        ) : (
          <div className="mt-3 space-y-3">
            {wrongQuestions.map((question) => (
              <details key={question.id} className="border border-sky-200 bg-sky-50/70 p-3">
                <summary className="cursor-pointer">{question.question}</summary>
                <p className="mt-3 text-sm text-slate-700">{question.explanation}</p>
              </details>
            ))}
          </div>
        )}
      </section>
      <div className="mt-6 flex flex-wrap gap-3">
        <RetroButton onClick={onHome}>タイトルに戻る</RetroButton>
        <RetroButton disabled={wrongQuestions.length === 0} onClick={onReview}>
          復習へ進む
        </RetroButton>
      </div>
    </Panel>
  );
}
