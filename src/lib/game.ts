import { formatQuestTitle } from "@/lib/labels";
import type { AppSettings, MistakeRecord, Mode, Question, QuizAttempt, QuizSession } from "@/lib/schemas";
import { makeId, modeConfig, pickBattleQuestions } from "@/lib/utils";
import type { BattleState, LoadedQuest } from "@/types/app";

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

export function createBattleState({
  mode,
  questions,
  dragonName
}: {
  mode: Mode;
  questions: Question[];
  dragonName: string;
}): BattleState {
  const battleQuestions = pickBattleQuestions(questions);
  const maxEnemyHp = Math.max(battleQuestions.length * 5, 5);
  return {
    mode,
    questions: battleQuestions,
    index: 0,
    playerHp: modeConfig[mode].hp,
    enemyHp: maxEnemyHp,
    maxEnemyHp,
    attempts: [],
    wrongQuestionIds: [],
    selectedChoice: null,
    log: [`${dragonName}が あらわれた！`],
    finished: false
  };
}

export function answerBattleState({
  battle,
  choiceIndex,
  playerName,
  dragonName
}: {
  battle: BattleState;
  choiceIndex: number;
  playerName: string;
  dragonName: string;
}): BattleState {
  const question = battle.questions[battle.index];
  const isCorrect = choiceIndex === question.answerIndex;
  const now = new Date().toISOString();
  const attempt: QuizAttempt = {
    questionId: question.id,
    category: question.category,
    isCorrect,
    answeredAt: now
  };
  const damage = modeConfig[battle.mode].damage;
  const nextEnemyHp = isCorrect ? Math.max(0, battle.enemyHp - 5) : battle.enemyHp;
  const nextPlayerHp = isCorrect ? battle.playerHp : Math.max(0, battle.playerHp - damage);
  const log = isCorrect
    ? ["正解！", `${playerName}のこうげき！`, `${dragonName}に 5 のダメージ！`]
    : battle.mode === "Max"
      ? [
          "ミス！",
          "敵の攻撃力が100倍になった！",
          `${dragonName}のこうげき！`,
          `${playerName}は 9999 のダメージをうけた！`,
          "ちからつきた..."
        ]
      : [
          "ミス！",
          `${dragonName}のこうげき！`,
          `${playerName}は ${damage} のダメージをうけた！`
        ];

  return {
    ...battle,
    enemyHp: nextEnemyHp,
    playerHp: nextPlayerHp,
    attempts: [...battle.attempts, attempt],
    wrongQuestionIds: isCorrect ? battle.wrongQuestionIds : [...battle.wrongQuestionIds, question.id],
    selectedChoice: choiceIndex,
    log,
    finished: nextEnemyHp <= 0 || nextPlayerHp <= 0
  };
}

export function advanceBattleState(battle: BattleState): BattleState {
  return {
    ...battle,
    index: battle.index + 1,
    selectedChoice: null,
    log: [`${battle.index + 2}問目。コマンドを選べ！`]
  };
}

export function createQuizSession({
  battle,
  loadedQuest,
  settings,
  dragonName
}: {
  battle: BattleState;
  loadedQuest: LoadedQuest;
  settings: AppSettings;
  dragonName: string;
}): QuizSession {
  const correctCount = battle.attempts.filter((attempt) => attempt.isCorrect).length;
  const cleared = battle.enemyHp <= 0;
  return {
    id: makeId(),
    questId: loadedQuest.meta.id,
    questTitle: formatQuestTitle(settings.questTitle || loadedQuest.meta.title),
    dragonName,
    mode: battle.mode,
    startedAt: new Date(Date.now() - battle.attempts.length * 30000).toISOString(),
    finishedAt: new Date().toISOString(),
    totalQuestions: battle.questions.length,
    correctCount,
    cleared,
    gameOver: !cleared,
    attempts: battle.attempts
  };
}

export function selectReviewQuestions(questions: Question[], mistakes: MistakeRecord[]) {
  const unresolved = new Set(mistakes.filter((record) => !record.resolved).map((record) => record.questionId));
  return questions.filter((question) => unresolved.has(question.id));
}

export function resolveReviewMistake(records: MistakeRecord[], questionId: string, isCorrect: boolean) {
  return records.map((record) =>
    record.questionId === questionId ? { ...record, resolved: isCorrect ? true : false } : record
  );
}
