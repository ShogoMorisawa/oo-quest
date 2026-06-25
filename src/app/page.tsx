"use client";

import { useEffect, useMemo, useState } from "react";
import { BattleScreen } from "@/components/screens/BattleScreen";
import { HistoryScreen } from "@/components/screens/HistoryScreen";
import { ResultScreen } from "@/components/screens/ResultScreen";
import { ReviewScreen } from "@/components/screens/ReviewScreen";
import { Alert } from "@/components/ui/Alert";
import { InfoRow } from "@/components/ui/InfoRow";
import { Panel } from "@/components/ui/Panel";
import { RetroButton } from "@/components/ui/RetroButton";
import { findDuplicateId, updateMistakeRecords } from "@/lib/game";
import { formatDragonName, formatQuestTitle, modeLabel } from "@/lib/labels";
import {
  QuestIndexSchema,
  QuestionsSchema,
  type AppSettings,
  type MistakeRecord,
  type Mode,
  type Question,
  type QuestMeta,
  type QuizAttempt,
  type QuizSession
} from "@/lib/schemas";
import {
  clearDomainQuestStorage,
  defaultSettings,
  readHistory,
  readMistakes,
  readSettings,
  writeHistory,
  writeMistakes,
  writeSettings
} from "@/lib/storage";
import { formatValidationError, makeId, modeConfig, pickBattleQuestions } from "@/lib/utils";
import type { BattleState, LoadedQuest, View } from "@/types/app";

const emptyCounts = { total: 0, domain: 0, tech: 0 };

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [questMetas, setQuestMetas] = useState<QuestMeta[]>([]);
  const [loadedQuest, setLoadedQuest] = useState<LoadedQuest | null>(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [result, setResult] = useState<QuizSession | null>(null);
  const [history, setHistory] = useState<QuizSession[]>([]);
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [reviewQuestions, setReviewQuestions] = useState<Question[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewAnswered, setReviewAnswered] = useState(false);

  useEffect(() => {
    setSettings(readSettings());
    setHistory(readHistory());
    setMistakes(readMistakes());
    void loadIndex();
  }, []);

  useEffect(() => {
    writeSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (questMetas.length === 0 || settings.lastSelectedQuestId === null) return;
    const selected = questMetas.find((quest) => quest.id === settings.lastSelectedQuestId) ?? questMetas[0];
    void loadQuest(selected);
  }, [questMetas, settings.lastSelectedQuestId]);

  const counts = useMemo(() => {
    if (!loadedQuest) return emptyCounts;
    return loadedQuest.questions.reduce(
      (acc, question) => ({ ...acc, total: acc.total + 1, [question.category]: acc[question.category] + 1 }),
      emptyCounts
    );
  }, [loadedQuest]);
  const displayQuestTitle = formatQuestTitle(settings.questTitle || loadedQuest?.meta.title || "oo");
  const displayDragonName = formatDragonName(settings.questTitle || loadedQuest?.meta.title || "oo");

  async function fetchJson(path: string) {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(`${path} の読み込みに失敗しました。`);
    return response.json();
  }

  async function loadIndex() {
    setLoading(true);
    setLoadError("");
    try {
      let raw: unknown;
      try {
        raw = await fetchJson("/quests/index.json");
      } catch {
        raw = await fetchJson("/quests/index.sample.json");
      }
      const parsed = QuestIndexSchema.safeParse(raw);
      if (!parsed.success) throw new Error(formatValidationError(parsed.error));
      if (parsed.data.length === 0) throw new Error("クエストが登録されていません。index.jsonを確認してください。");
      setQuestMetas(parsed.data);
      const initialId = settings.lastSelectedQuestId ?? parsed.data[0].id;
      setSettings((current) => ({ ...current, lastSelectedQuestId: initialId }));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "クエスト一覧の読み込みに失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  async function loadQuest(meta: QuestMeta) {
    setLoading(true);
    setLoadError("");
    try {
      const raw = await fetchJson(meta.file);
      const parsed = QuestionsSchema.safeParse(raw);
      if (!parsed.success) throw new Error(formatValidationError(parsed.error));
      const duplicated = findDuplicateId(parsed.data);
      if (duplicated) throw new Error(`問題ID '${duplicated}' が複数回使われています。`);
      setLoadedQuest({ meta, questions: parsed.data });
      setSettings((current) => ({
        ...current,
        questTitle: current.questTitle || meta.title,
        lastSelectedQuestId: meta.id
      }));
    } catch (error) {
      setLoadedQuest(null);
      setLoadError(error instanceof Error ? error.message : `${meta.file} の読み込みに失敗しました。`);
    } finally {
      setLoading(false);
    }
  }

  function updateSettings(next: Partial<AppSettings>) {
    setSettings((current) => ({ ...current, ...next }));
  }

  function startBattle(mode: Mode) {
    if (!loadedQuest) return;
    const questions = pickBattleQuestions(loadedQuest.questions);
    const maxEnemyHp = Math.max(questions.length * 5, 5);
    setSettings((current) => ({ ...current, preferredMode: mode }));
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

  function resetData() {
    const ok = window.confirm("oo-questの設定、履歴、誤答記録をすべて削除します。よろしいですか？");
    if (!ok) return;
    clearDomainQuestStorage();
    setSettings(defaultSettings);
    setHistory([]);
    setMistakes([]);
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
          <Panel>
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <section className="space-y-5">
                <div>
                  <h1 className="mt-2 text-4xl font-black text-sky-950 sm:text-6xl">{displayQuestTitle}</h1>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">プレイヤー名</span>
                  <input
                    className="w-full border-2 border-sky-700 bg-white px-3 py-3 text-slate-950 outline-none focus:border-emerald-500"
                    value={settings.playerName}
                    onChange={(event) => updateSettings({ playerName: event.target.value })}
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-slate-700">クエスト</span>
                    <select
                      className="w-full border-2 border-sky-700 bg-white px-3 py-3 text-slate-950 outline-none focus:border-emerald-500"
                      value={loadedQuest?.meta.id ?? settings.lastSelectedQuestId ?? ""}
                      onChange={(event) => {
                        const meta = questMetas.find((quest) => quest.id === event.target.value);
                        if (meta) {
                          updateSettings({ lastSelectedQuestId: meta.id, questTitle: meta.title });
                          void loadQuest(meta);
                        }
                      }}
                    >
                      {questMetas.map((quest) => (
                        <option key={quest.id} value={quest.id}>
                          {quest.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-slate-700">クエスト名</span>
                    <input
                      className="w-full border-2 border-sky-700 bg-white px-3 py-3 text-slate-950 outline-none focus:border-emerald-500"
                      value={settings.questTitle}
                      onChange={(event) => updateSettings({ questTitle: event.target.value })}
                    />
                  </label>
                </div>

                {loadError && <Alert>{loadError}</Alert>}
                {counts.total > 0 && counts.total < 20 && (
                  <p className="border-l-4 border-amber-300 bg-amber-950/40 px-3 py-2 text-sm text-amber-100">
                    問題数が20問未満です。全{counts.total}問でバトルを開始します。
                  </p>
                )}

                <div className="flex flex-wrap gap-3">
                  <RetroButton disabled={!loadedQuest || loading} onClick={() => setView("mode")}>
                    冒険を始める
                  </RetroButton>
                  <RetroButton disabled={!loadedQuest || mistakes.filter((m) => !m.resolved).length === 0} onClick={startReview}>
                    復習へ進む
                  </RetroButton>
                </div>
              </section>

              <aside className="dq-window p-4">
                <h2 className="text-xl font-bold text-white">クエスト情報</h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <InfoRow label="問題数" value={`${counts.total}問`} />
                  <InfoRow label="ドメイン" value={`${counts.domain}問`} />
                  <InfoRow label="技術" value={`${counts.tech}問`} />
                  <InfoRow label="未復習" value={`${mistakes.filter((m) => !m.resolved).length}件`} />
                </dl>
                <p className="mt-6 border-t border-dashed border-sky-200/70 pt-4 text-xs leading-6 text-sky-50">
                  クエストを追加するには public/quests/ にJSONファイルを置き、index.jsonに追記してください。
                </p>
              </aside>
            </div>
          </Panel>
        )}

        {view === "mode" && loadedQuest && (
          <Panel>
            <h1 className="text-3xl font-black">モードを選べ</h1>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {(["Normal", "Hard", "Max"] as Mode[]).map((mode) => (
                <button
                  key={mode}
                  className={`border-4 border-double p-5 text-left shadow-retro transition hover:-translate-y-1 hover:bg-sky-50 ${
                    settings.preferredMode === mode ? "border-emerald-500 bg-emerald-50" : "border-sky-700 bg-white/90"
                  }`}
                  onClick={() => startBattle(mode)}
                >
                  <h2 className="text-2xl font-bold">{modeLabel(mode)}</h2>
                  <div className="mt-5 space-y-2 text-sm">
                    <InfoRow label="体力" value={String(modeConfig[mode].hp)} />
                    <InfoRow label="被ダメージ" value={String(modeConfig[mode].damage)} />
                    <InfoRow label="許容ミス" value={modeConfig[mode].misses} />
                  </div>
                </button>
              ))}
            </div>
          </Panel>
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
