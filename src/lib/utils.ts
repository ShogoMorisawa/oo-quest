import type { Category, Mode, Question, QuizAttempt } from "@/lib/schemas";

export const modeConfig: Record<Mode, { hp: number; damage: number; misses: string }> = {
  Normal: { hp: 100, damage: 10, misses: "9回まで" },
  Hard: { hp: 100, damage: 25, misses: "3回まで" },
  Max: { hp: 1, damage: 9999, misses: "0回" }
};

export function shuffle<T>(items: T[]): T[] {
  const copied = [...items];
  for (let i = copied.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }
  return copied;
}

export function pickBattleQuestions(questions: Question[]) {
  return shuffle(questions).slice(0, Math.min(20, questions.length));
}

export function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "00000000-0000-4000-8000-" + Math.random().toString(16).slice(2, 14).padEnd(12, "0");
}

export function accuracy(correct: number, total: number) {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

export function categoryStats(attempts: QuizAttempt[], category: Category) {
  const filtered = attempts.filter((attempt) => attempt.category === category);
  const correct = filtered.filter((attempt) => attempt.isCorrect).length;
  return { total: filtered.length, correct, rate: accuracy(correct, filtered.length) };
}

export function formatValidationError(error: unknown) {
  if (error && typeof error === "object" && "issues" in error) {
    const issues = (error as { issues: Array<{ path: Array<string | number>; message: string }> }).issues;
    return issues
      .slice(0, 6)
      .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
      .join(" / ");
  }
  return "JSONの形式を確認してください。";
}
