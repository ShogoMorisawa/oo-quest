import type { MistakeRecord, Question, QuizAttempt } from "@/lib/schemas";

export function findDuplicateId(questions: Question[]) {
  const seen = new Set<string>();
  for (const question of questions) {
    if (seen.has(question.id)) return question.id;
    seen.add(question.id);
  }
  return null;
}

export function updateMistakeRecords(records: MistakeRecord[], attempts: QuizAttempt[]) {
  const map = new Map(records.map((record) => [record.questionId, record]));
  for (const attempt of attempts) {
    const current = map.get(attempt.questionId);
    if (!attempt.isCorrect) {
      map.set(attempt.questionId, {
        questionId: attempt.questionId,
        count: (current?.count ?? 0) + 1,
        lastMistakenAt: attempt.answeredAt,
        resolved: false
      });
    } else if (current) {
      map.set(attempt.questionId, { ...current, resolved: true });
    }
  }
  return Array.from(map.values());
}
