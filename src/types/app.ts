import type { Mode, Question, QuestMeta, QuizAttempt } from "@/lib/schemas";

export type View = "home" | "mode" | "battle" | "result" | "history" | "review";

export type LoadedQuest = {
  meta: QuestMeta;
  questions: Question[];
};

export type BattleState = {
  mode: Mode;
  questions: Question[];
  index: number;
  playerHp: number;
  enemyHp: number;
  maxEnemyHp: number;
  attempts: QuizAttempt[];
  wrongQuestionIds: string[];
  selectedChoice: number | null;
  log: string[];
  finished: boolean;
};
