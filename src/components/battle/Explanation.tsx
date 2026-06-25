import type { Question } from "@/lib/schemas";

export function Explanation({ question, children, variant = "panel" }: { question: Question; children: React.ReactNode; variant?: "panel" | "embedded" }) {
  const className =
    variant === "embedded"
      ? ""
      : "mt-4 border-4 border-double border-sky-700 bg-white/88 p-4";
  return (
    <section className={className}>
      <h2 className="text-lg font-bold text-emerald-700">解説</h2>
      <p className="mt-2 leading-7 text-slate-800">{question.explanation}</p>
      <div className="mt-4 border-t border-dashed border-sky-200 pt-4 text-sm text-slate-700">
        <p>{question.sourceTitle}</p>
        {question.sourceSection && <p>{question.sourceSection}</p>}
        {question.sourceQuote && <blockquote className="mt-3 border-l-4 border-sky-400 bg-sky-50/70 py-2 pl-3 text-slate-700">{question.sourceQuote}</blockquote>}
        {question.sourceUrl && (
          <a className="mt-3 inline-block border border-sky-700 bg-white px-3 py-2 text-sky-800 hover:bg-sky-50" href={question.sourceUrl} target="_blank" rel="noreferrer">
            元資料を開く
          </a>
        )}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
