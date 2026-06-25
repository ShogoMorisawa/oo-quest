"use client";

import { useState } from "react";
import {
  advanceBattleState,
  answerBattleState,
  createBattleState,
  createQuizSession,
  resolveReviewMistake,
  selectReviewQuestions,
  updateMistakeRecords
} from "@/lib/game";
import type { AppSettings, MistakeRecord, Mode, Question, QuizSession } from "@/lib/schemas";
import { readHistory, readMistakes, writeHistory, writeMistakes } from "@/lib/storage";
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
    setBattle(createBattleState({ mode, questions: loadedQuest.questions, dragonName: displayDragonName }));
    setResult(null);
    setView("battle");
  }

  function answerBattle(choiceIndex: number) {
    if (!battle || !loadedQuest || battle.selectedChoice !== null || battle.finished) return;
    setBattle(answerBattleState({ battle, choiceIndex, playerName: settings.playerName, dragonName: displayDragonName }));
  }

  function nextBattleQuestion() {
    if (!battle || !loadedQuest || battle.selectedChoice === null) return;
    const isLast = battle.index >= battle.questions.length - 1;
    if (battle.finished || isLast) {
      finishBattle(battle);
      return;
    }
    setBattle(advanceBattleState(battle));
  }

  function finishBattle(finalBattle: BattleState) {
    if (!loadedQuest) return;
    const session = createQuizSession({ battle: finalBattle, loadedQuest, settings, dragonName: displayDragonName });
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
    setReviewQuestions(selectReviewQuestions(loadedQuest.questions, mistakes));
    setReviewIndex(0);
    setReviewAnswered(false);
    setView("review");
  }

  function answerReview(choiceIndex: number) {
    if (!loadedQuest || reviewAnswered) return;
    const question = reviewQuestions[reviewIndex];
    const isCorrect = choiceIndex === question.answerIndex;
    const nextMistakes = resolveReviewMistake(mistakes, question.id, isCorrect);
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
