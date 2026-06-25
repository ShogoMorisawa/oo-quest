import { Explanation } from "@/components/battle/Explanation";
import { Panel } from "@/components/ui/Panel";
import { RetroButton } from "@/components/ui/RetroButton";
import { categoryLabel } from "@/lib/labels";
import type { Question } from "@/lib/schemas";

export function ReviewScreen({
  questions,
  index,
  answered,
  onAnswer,
  onNext,
  onHome
}: {
  questions: Question[];
  index: number;
  answered: boolean;
  onAnswer: (choiceIndex: number) => void;
  onNext: () => void;
  onHome: () => void;
}) {
  if (questions.length === 0) {
    return (
      <Panel>
        <h1 className="text-3xl font-black">復習</h1>
        <p className="mt-4 text-slate-700">未解決の誤答はありません。</p>
        <div className="mt-6">
          <RetroButton onClick={onHome}>タイトルに戻る</RetroButton>
        </div>
      </Panel>
    );
  }
  const question = questions[index];
  return (
    <Panel>
      <h1 className="text-3xl font-black">復習 {index + 1}/{questions.length}</h1>
      <section className="mt-4 border-4 border-double border-sky-700 bg-white/88 p-5">
        <p className="text-xs text-emerald-700">{categoryLabel(question.category)}</p>
        <h2 className="mt-3 text-2xl font-bold leading-relaxed">{question.question}</h2>
        <div className="mt-6 grid gap-3">
          {question.choices.map((choice, choiceIndex) => (
            <button
              key={choice}
              disabled={answered}
              onClick={() => onAnswer(choiceIndex)}
              className="min-h-14 border-2 border-sky-700 bg-white px-4 py-3 text-left transition hover:bg-sky-50 disabled:cursor-default"
            >
              {choice}
            </button>
          ))}
        </div>
      </section>
      {answered && (
        <Explanation question={question}>
          <RetroButton onClick={onNext}>{index >= questions.length - 1 ? "復習を終える" : "次へ"}</RetroButton>
        </Explanation>
      )}
    </Panel>
  );
}
