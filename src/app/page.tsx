"use client";

import { useState } from "react";
import { BattleScreen } from "@/components/screens/BattleScreen";
import { HistoryScreen } from "@/components/screens/HistoryScreen";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { ModeSelectScreen } from "@/components/screens/ModeSelectScreen";
import { ResultScreen } from "@/components/screens/ResultScreen";
import { ReviewScreen } from "@/components/screens/ReviewScreen";
import { RetroButton } from "@/components/ui/RetroButton";
import { useGameController } from "@/hooks/useGameController";
import { useQuestController } from "@/hooks/useQuestController";
import { clearDomainQuestStorage } from "@/lib/storage";
import type { Mode } from "@/lib/schemas";
import type { View } from "@/types/app";

export default function Home() {
  const [view, setView] = useState<View>("home");
  const {
    settings,
    questMetas,
    loadedQuest,
    loadError,
    loading,
    counts,
    displayQuestTitle,
    displayDragonName,
    updateSettings,
    loadQuest,
    resetSettings
  } = useQuestController();
  const {
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
  } = useGameController({ loadedQuest, settings, displayDragonName, setView });

  function startBattleMode(mode: Mode) {
    updateSettings({ preferredMode: mode });
    startBattle(mode);
  }

  function resetData() {
    const ok = window.confirm("oo-questの設定、履歴、誤答記録をすべて削除します。よろしいですか？");
    if (!ok) return;
    clearDomainQuestStorage();
    resetSettings();
    resetProgress();
  }

  return (
    <main className="min-h-screen px-4 py-6 font-mono text-slate-900 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col gap-4">
        <header className="flex flex-wrap items-center justify-between gap-3 border-4 border-double border-sky-700 bg-white/88 px-4 py-3 shadow-retro backdrop-blur">
          <button className="text-left text-2xl font-black tracking-normal text-sky-950" onClick={() => setView("home")}>
            oo-quest
          </button>
          <nav className="flex gap-2">
            <RetroButton onClick={() => setView("home")}>ホーム</RetroButton>
            <RetroButton onClick={() => setView("history")}>履歴</RetroButton>
          </nav>
        </header>

        {view === "home" && (
          <HomeScreen
            settings={settings}
            questMetas={questMetas}
            loadedQuest={loadedQuest}
            counts={counts}
            loadError={loadError}
            loading={loading}
            displayQuestTitle={displayQuestTitle}
            mistakes={mistakes}
            onUpdateSettings={updateSettings}
            onLoadQuest={(meta) => void loadQuest(meta)}
            onStartModeSelect={() => setView("mode")}
            onStartReview={startReview}
          />
        )}

        {view === "mode" && loadedQuest && (
          <ModeSelectScreen preferredMode={settings.preferredMode} onStartBattle={startBattleMode} />
        )}

        {view === "battle" && battle && loadedQuest && (
          <BattleScreen
            battle={battle}
            dragonName={displayDragonName}
            playerName={settings.playerName}
            onAnswer={answerBattle}
            onNext={nextBattleQuestion}
          />
        )}

        {view === "result" && result && loadedQuest && (
          <ResultScreen
            session={result}
            questions={loadedQuest.questions}
            history={history}
            onHome={() => setView("home")}
            onReview={startReview}
          />
        )}

        {view === "history" && (
          <HistoryScreen history={history} mistakes={mistakes} onReset={resetData} onHome={() => setView("home")} onReview={startReview} />
        )}

        {view === "review" && (
          <ReviewScreen
            questions={reviewQuestions}
            index={reviewIndex}
            answered={reviewAnswered}
            onAnswer={answerReview}
            onNext={nextReviewQuestion}
            onHome={() => setView("home")}
          />
        )}
      </div>
    </main>
  );
}
