import { z } from "zod";

export const ModeSchema = z.enum(["Normal", "Hard", "Max"]);
export type Mode = z.infer<typeof ModeSchema>;

export const CategorySchema = z.enum(["tech", "domain"]);
export type Category = z.infer<typeof CategorySchema>;

export const QuestionSchema = z.object({
  id: z.string().min(1),
  category: CategorySchema,
  question: z.string().min(1),
  choices: z.array(z.string()).length(4),
  answerIndex: z.number().int().min(0).max(3),
  explanation: z.string(),
  sourceTitle: z.string(),
  sourceSection: z.string(),
  sourceUrl: z.string(),
  sourceQuote: z.string()
});
export const QuestionsSchema = z.array(QuestionSchema);
export type Question = z.infer<typeof QuestionSchema>;

export const QuestMetaSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  file: z.string().startsWith("/quests/")
});
export const QuestIndexSchema = z.array(QuestMetaSchema);
export type QuestMeta = z.infer<typeof QuestMetaSchema>;

export const AppSettingsSchema = z.object({
  playerName: z.string(),
  questTitle: z.string(),
  lastSelectedQuestId: z.string().nullable(),
  preferredMode: ModeSchema
});
export type AppSettings = z.infer<typeof AppSettingsSchema>;

export const QuizAttemptSchema = z.object({
  questionId: z.string(),
  isCorrect: z.boolean(),
  category: CategorySchema,
  answeredAt: z.string().datetime()
});
export type QuizAttempt = z.infer<typeof QuizAttemptSchema>;

export const QuizSessionSchema = z.object({
  id: z.string().uuid(),
  questId: z.string(),
  questTitle: z.string(),
  dragonName: z.string(),
  mode: ModeSchema,
  startedAt: z.string().datetime(),
  finishedAt: z.string().datetime().nullable(),
  totalQuestions: z.number(),
  correctCount: z.number(),
  cleared: z.boolean(),
  gameOver: z.boolean(),
  attempts: z.array(QuizAttemptSchema)
});
export const QuizHistorySchema = z.array(QuizSessionSchema);
export type QuizSession = z.infer<typeof QuizSessionSchema>;

export const MistakeRecordSchema = z.object({
  questionId: z.string(),
  count: z.number(),
  lastMistakenAt: z.string().datetime(),
  resolved: z.boolean()
});
export const MistakeRecordsSchema = z.array(MistakeRecordSchema);
export type MistakeRecord = z.infer<typeof MistakeRecordSchema>;
