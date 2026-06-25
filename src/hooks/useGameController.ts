"use client";

import { useState } from "react";
import { updateMistakeRecords } from "@/lib/game";
import { formatQuestTitle } from "@/lib/labels";
import type { AppSettings, MistakeRecord, Mode, Question, QuizAttempt, QuizSession } from "@/lib/schemas";
import { readHistory, readMistakes, writeHistory, writeMistakes } from "@/lib/storage";
import { makeId, modeConfig, pickBattleQuestions } from "@/lib/utils";
import type { BattleState, LoadedQuest, View } from "@/types/app";

export function useGameController({
  loadedQuest,
  settings,
  displayDragonName,
  setView
}: {
  loadedQuest: LoadedQuest | null;
  settings: AppSettings;
  displayDragonName: string;
  setView: (view: View) => void;
}) {
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [result, setResult] = useState<QuizSession | null>(null);
  const [history, setHistory] = useState<QuizSession[]>(() => readHistory());
  const [mistakes, setMistakes] = useState<MistakeRecord[]>(() => readMistakes());
  const [reviewQuestions, setReviewQuestions] = useState<Question[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewAnswered, setReviewAnswered] = useState(false);

  function startBattle(mode: Mode) {
    if (!loadedQuest) return;
    const questions = pickBattleQuestions(loadedQuest.questions);
    const maxEnemyHp = Math.max(questions.length * 5, 5);
    setBattle({
      mode,
      questions,
      index: 0,
      playerHp: modeConfig[mode].hp,
      enemyHp: maxEnemyHp,
      maxEnemyHp,
      attempts: [],
      wrongQuestionIds: [],
      selectedChoice: null,
      log: [`${displayDragonName}が あらわれた！`],
      finished: false
    });
    setResult(null);
    setView("battle");
  }

  function answerBattle(choiceIndex: number) {
    if (!battle || !loadedQuest || battle.selectedChoice !== null || battle.finished) return;
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
      ? ["正解！", `${settings.playerName}のこうげき！`, `${displayDragonName}に 5 のダメージ！`]
      : battle.mode === "Max"
        ? [
            "ミス！",
            "敵の攻撃力が100倍になった！",
            `${displayDragonName}のこうげき！`,
            `${settings.playerName}は 9999 のダメージをうけた！`,
            "ちからつきた..."
          ]
        : [
            "ミス！",
            `${displayDragonName}のこうげき！`,
            `${settings.playerName}は ${damage} のダメージをうけた！`
          ];
    setBattle({
      ...battle,
      enemyHp: nextEnemyHp,
      playerHp: nextPlayerHp,
      attempts: [...battle.attempts, attempt],
      wrongQuestionIds: isCorrect ? battle.wrongQuestionIds : [...battle.wrongQuestionIds, question.id],
      selectedChoice: choiceIndex,
      log,
      finished: nextEnemyHp <= 0 || nextPlayerHp <= 0
    });
  }

  function nextBattleQuestion() {
    if (!battle || !loadedQuest || battle.selectedChoice === null) return;
    const isLast = battle.index >= battle.questions.length - 1;
    if (battle.finished || isLast) {
      finishBattle(battle);
      return;
    }
    setBattle({
      ...battle,
      index: battle.index + 1,
      selectedChoice: null,
      log: [`${battle.index + 2}問目。コマンドを選べ！`]
    });
  }

  function finishBattle(finalBattle: BattleState) {
    if (!loadedQuest) return;
    const correctCount = finalBattle.attempts.filter((attempt) => attempt.isCorrect).length;
    const cleared = finalBattle.enemyHp <= 0;
    const session: QuizSession = {
      id: makeId(),
      questId: loadedQuest.meta.id,
      questTitle: formatQuestTitle(settings.questTitle || loadedQuest.meta.title),
      dragonName: displayDragonName,
      mode: finalBattle.mode,
      startedAt: new Date(Date.now() - finalBattle.attempts.length * 30000).toISOString(),
      finishedAt: new Date().toISOString(),
      totalQuestions: finalBattle.questions.length,
      correctCount,
      cleared,
      gameOver: !cleared,
      attempts: finalBattle.attempts
    };
    const nextHistory = [session, ...history].slice(0, 200);
    const nextMistakes = updateMistakeRecords(mistakes, finalBattle.attempts);
    setHistory(nextHistory);
    setMistakes(nextMistakes);
    writeHistory(nextHistory);
    writeMistakes(nextMistakes);
    setResult(session);
    setView("result");
  }

  function startReview() {
    if (!loadedQuest) return;
    const unresolved = new Set(mistakes.filter((record) => !record.resolved).map((record) => record.questionId));
    const questions = loadedQuest.questions.filter((question) => unresolved.has(question.id));
    setReviewQuestions(questions);
    setReviewIndex(0);
    setReviewAnswered(false);
    setView("review");
  }

  function answerReview(choiceIndex: number) {
    if (!loadedQuest || reviewAnswered) return;
    const question = reviewQuestions[reviewIndex];
    const isCorrect = choiceIndex === question.answerIndex;
    const nextMistakes = mistakes.map((record) =>
      record.questionId === question.id ? { ...record, resolved: isCorrect ? true : false } : record
    );
    setMistakes(nextMistakes);
    writeMistakes(nextMistakes);
    setReviewAnswered(true);
  }

  function nextReviewQuestion() {
    if (reviewIndex >= reviewQuestions.length - 1) {
      setView("home");
      return;
    }
    setReviewIndex((current) => current + 1);
    setReviewAnswered(false);
  }

  function resetProgress() {
    setHistory([]);
    setMistakes([]);
    setBattle(null);
    setResult(null);
    setReviewQuestions([]);
    setReviewIndex(0);
    setReviewAnswered(false);
  }

  return {
    battle,
    result,
    history,
    mistakes,
    reviewQuestions,
    reviewIndex,
    reviewAnswered,
    startBattle,
    answerBattle,
    nextBattleQuestion,
    startReview,
    answerReview,
    nextReviewQuestion,
    resetProgress
  };
}
