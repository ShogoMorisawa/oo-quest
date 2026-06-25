"use client";

import { useEffect, useMemo, useState } from "react";
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
import { accuracy, categoryStats, formatValidationError, makeId, modeConfig, pickBattleQuestions } from "@/lib/utils";

type View = "home" | "mode" | "battle" | "result" | "history" | "review";

type LoadedQuest = {
  meta: QuestMeta;
  questions: Question[];
};

type BattleState = {
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
          <BattleView
            battle={battle}
            dragonName={displayDragonName}
            playerName={settings.playerName}
            onAnswer={answerBattle}
            onNext={nextBattleQuestion}
          />
        )}

        {view === "result" && result && loadedQuest && (
          <ResultView
            session={result}
            questions={loadedQuest.questions}
            history={history}
            onHome={() => setView("home")}
            onReview={startReview}
          />
        )}

        {view === "history" && (
          <HistoryView history={history} mistakes={mistakes} onReset={resetData} onHome={() => setView("home")} onReview={startReview} />
        )}

        {view === "review" && (
          <ReviewView
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

function BattleView({
  battle,
  dragonName,
  playerName,
  onAnswer,
  onNext
}: {
  battle: BattleState;
  dragonName: string;
  playerName: string;
  onAnswer: (choiceIndex: number) => void;
  onNext: () => void;
}) {
  const question = battle.questions[battle.index];
  const selected = battle.selectedChoice;
  const answeredCorrect = selected !== null && question.answerIndex === selected;
  const answeredWrong = selected !== null && question.answerIndex !== selected;
  return (
    <section
      className={`battle-screen flex-1 border-4 border-double border-sky-700 p-3 shadow-retro sm:p-5 ${
        answeredCorrect ? "battle-screen-correct" : ""
      } ${answeredWrong ? "battle-screen-wrong" : ""} ${answeredWrong && battle.mode === "Max" ? "battle-screen-max" : ""}`}
    >
      <div className="battle-status-grid">
        <div className="dq-window">
          <p className="text-xs text-slate-200">てき</p>
          <HpBar label={dragonName} value={battle.enemyHp} max={battle.maxEnemyHp} tone="enemy" />
        </div>
        <div className="dq-window">
          <p className="text-xs text-slate-200">プレイヤー</p>
          <HpBar label={playerName} value={battle.playerHp} max={modeConfig[battle.mode].hp} tone="player" />
        </div>
        <div className="dq-window battle-counter">
          <p>{modeLabel(battle.mode)}</p>
          <p>
            {battle.index + 1}/{battle.questions.length}
          </p>
        </div>
      </div>

      <CssDragon
        name={dragonName}
        damaged={answeredCorrect}
        attacking={answeredWrong}
        defeated={battle.enemyHp <= 0}
        maxDanger={battle.mode === "Max" && answeredWrong}
      />

      <div className="battle-command-grid">
        <section className="dq-window battle-question-window">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-cyan-200">{categoryLabel(question.category)}</p>
            <p className="text-xs text-slate-200">もんだい</p>
          </div>
          <h1 className="mt-3 text-xl font-bold leading-relaxed sm:text-2xl">{question.question}</h1>
        </section>

        <section className="dq-window battle-choice-window">
          <p className="mb-3 text-xs text-slate-200">コマンド</p>
          <div className="grid gap-2">
            {question.choices.map((choice, index) => {
              const correct = index === question.answerIndex;
              const chosen = selected === index;
              const answered = selected !== null;
              const tone = answered && correct ? "dq-choice-correct" : answered && chosen ? "dq-choice-wrong" : "";
              return (
                <button key={choice} disabled={answered} onClick={() => onAnswer(index)} className={`dq-choice ${tone}`}>
                  <span className="dq-cursor">▶</span>
                  <span>{choice}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="dq-window battle-log-window">
          <p className="mb-2 text-xs text-slate-200">メッセージ</p>
          <div className="space-y-1 text-sm text-white">
            {battle.log.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </section>
      </div>

      {selected !== null && (
        <div className="dq-window dq-explanation-window mt-4">
          <Explanation question={question} variant="embedded">
            <RetroButton onClick={onNext}>{battle.finished || battle.index === battle.questions.length - 1 ? "結果を見る" : "次の問題へ"}</RetroButton>
          </Explanation>
        </div>
      )}
    </section>
  );
}

function ResultView({
  session,
  questions,
  history,
  onHome,
  onReview
}: {
  session: QuizSession;
  questions: Question[];
  history: QuizSession[];
  onHome: () => void;
  onReview: () => void;
}) {
  const score = session.correctCount * 5;
  const first = [...history].reverse().find((item) => item.questId === session.questId);
  const best = Math.max(...history.filter((item) => item.questId === session.questId).map((item) => item.correctCount * 5), score);
  const domain = categoryStats(session.attempts, "domain");
  const tech = categoryStats(session.attempts, "tech");
  const wrongIds = new Set(session.attempts.filter((attempt) => !attempt.isCorrect).map((attempt) => attempt.questionId));
  const wrongQuestions = questions.filter((question) => wrongIds.has(question.id));
  return (
    <Panel>
      <h1 className={`text-4xl font-black sm:text-6xl ${session.cleared ? "text-emerald-300" : "text-rose-300"}`}>
        {session.cleared ? `${session.dragonName}を討伐した！` : "ちからつきた"}
      </h1>
      {session.cleared && <p className="mt-3 text-lg">称号を獲得しました：{session.questTitle} 見習い卒業</p>}
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <Stat label="スコア" value={`${score}点`} />
        <Stat label="正答率" value={`${accuracy(session.correctCount, session.totalQuestions)}%`} />
        <Stat label="最高点" value={`${best}点`} />
        <Stat label="初回差分" value={`${score - (first ? first.correctCount * 5 : score)}点`} />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Stat label="ドメイン" value={`${domain.correct}/${domain.total} (${domain.rate}%)`} />
        <Stat label="技術" value={`${tech.correct}/${tech.total} (${tech.rate}%)`} />
      </div>
      <section className="mt-6 border-4 border-double border-sky-700 bg-white/88 p-4">
        <h2 className="text-xl font-bold">今回のミス</h2>
        {wrongQuestions.length === 0 ? (
          <p className="mt-3 text-emerald-300">ミスはありません。</p>
        ) : (
          <div className="mt-3 space-y-3">
            {wrongQuestions.map((question) => (
              <details key={question.id} className="border border-sky-200 bg-sky-50/70 p-3">
                <summary className="cursor-pointer">{question.question}</summary>
                <p className="mt-3 text-sm text-slate-700">{question.explanation}</p>
              </details>
            ))}
          </div>
        )}
      </section>
      <div className="mt-6 flex flex-wrap gap-3">
        <RetroButton onClick={onHome}>タイトルに戻る</RetroButton>
        <RetroButton disabled={wrongQuestions.length === 0} onClick={onReview}>
          復習へ進む
        </RetroButton>
      </div>
    </Panel>
  );
}

function HistoryView({
  history,
  mistakes,
  onReset,
  onHome,
  onReview
}: {
  history: QuizSession[];
  mistakes: MistakeRecord[];
  onReset: () => void;
  onHome: () => void;
  onReview: () => void;
}) {
  const scores = history.map((session) => session.correctCount * 5);
  const maxClears = history.filter((session) => session.mode === "Max" && session.cleared);
  return (
    <Panel>
      <h1 className="text-3xl font-black">履歴</h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <Stat label="初回" value={scores.length ? `${scores[scores.length - 1]}点` : "-"} />
        <Stat label="最新" value={scores.length ? `${scores[0]}点` : "-"} />
        <Stat label="最高" value={scores.length ? `${Math.max(...scores)}点` : "-"} />
        <Stat label="完全クリア" value={`${maxClears.length}回`} />
      </div>
      {maxClears.length > 0 && <p className="mt-4 border-2 border-emerald-300 bg-emerald-950/30 px-3 py-2">マックスモード クリア済み</p>}
      <div className="mt-6 space-y-2">
        {history.length === 0 ? (
          <p className="text-slate-700">まだ履歴はありません。</p>
        ) : (
          history.map((session) => (
            <div key={session.id} className="grid gap-2 border border-sky-200 bg-white/82 p-3 text-sm shadow-sm sm:grid-cols-[1fr_auto_auto_auto]">
              <span>{new Date(session.finishedAt ?? session.startedAt).toLocaleString("ja-JP")}</span>
              <span>{session.questTitle}</span>
              <span>{modeLabel(session.mode)}</span>
              <span>{session.correctCount * 5}点</span>
            </div>
          ))
        )}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <RetroButton onClick={onHome}>タイトルに戻る</RetroButton>
        <RetroButton disabled={mistakes.filter((m) => !m.resolved).length === 0} onClick={onReview}>
          復習へ進む
        </RetroButton>
        <RetroButton onClick={onReset}>データを全リセット</RetroButton>
      </div>
    </Panel>
  );
}

function ReviewView({
  questions,
  index,
  answered,
  onAnswer,
  onNext,
  onHome
}: {
  questions: Question[];
  index: number;
  answered: boolean;
  onAnswer: (choiceIndex: number) => void;
  onNext: () => void;
  onHome: () => void;
}) {
  if (questions.length === 0) {
    return (
      <Panel>
        <h1 className="text-3xl font-black">復習</h1>
        <p className="mt-4 text-slate-700">未解決の誤答はありません。</p>
        <div className="mt-6">
          <RetroButton onClick={onHome}>タイトルに戻る</RetroButton>
        </div>
      </Panel>
    );
  }
  const question = questions[index];
  return (
    <Panel>
      <h1 className="text-3xl font-black">復習 {index + 1}/{questions.length}</h1>
      <section className="mt-4 border-4 border-double border-sky-700 bg-white/88 p-5">
        <p className="text-xs text-emerald-700">{categoryLabel(question.category)}</p>
        <h2 className="mt-3 text-2xl font-bold leading-relaxed">{question.question}</h2>
        <div className="mt-6 grid gap-3">
          {question.choices.map((choice, choiceIndex) => (
            <button
              key={choice}
              disabled={answered}
              onClick={() => onAnswer(choiceIndex)}
              className="min-h-14 border-2 border-sky-700 bg-white px-4 py-3 text-left transition hover:bg-sky-50 disabled:cursor-default"
            >
              {choice}
            </button>
          ))}
        </div>
      </section>
      {answered && (
        <Explanation question={question}>
          <RetroButton onClick={onNext}>{index >= questions.length - 1 ? "復習を終える" : "次へ"}</RetroButton>
        </Explanation>
      )}
    </Panel>
  );
}

function Explanation({ question, children, variant = "panel" }: { question: Question; children: React.ReactNode; variant?: "panel" | "embedded" }) {
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

function Panel({ children }: { children: React.ReactNode }) {
  return <section className="flex-1 border-4 border-double border-sky-700 bg-white/86 p-4 text-slate-900 shadow-retro backdrop-blur sm:p-6">{children}</section>;
}

function RetroButton({ children, disabled, onClick }: { children: React.ReactNode; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="border-2 border-sky-800 bg-sky-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-600 hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function Alert({ children }: { children: React.ReactNode }) {
  return <div className="border-2 border-rose-400 bg-rose-50 px-4 py-3 text-rose-900">{children}</div>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-dashed border-current/25 pb-2">
      <dt className="text-current/70">{label}</dt>
      <dd className="text-right font-bold text-current">{value}</dd>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-4 border-double border-sky-700 bg-white/88 p-4 shadow-sm">
      <p className="text-xs uppercase text-slate-600">{label}</p>
      <p className="mt-2 text-2xl font-black text-sky-950">{value}</p>
    </div>
  );
}

function HpBar({ label, value, max, tone }: { label: string; value: number; max: number; tone: "enemy" | "player" }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span>{label}</span>
        <span>
          {value}/{max}
        </span>
      </div>
      <div className="h-5 border-2 border-white/80 bg-sky-950/60">
        <div className={`h-full ${tone === "enemy" ? "bg-rose-500" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function CssDragon({
  name,
  damaged,
  attacking,
  defeated,
  maxDanger
}: {
  name: string;
  damaged: boolean;
  attacking: boolean;
  defeated: boolean;
  maxDanger: boolean;
}) {
  return (
    <section
      className={`dragon-stage mt-4 border-4 border-double border-sky-700 ${
        damaged ? "dragon-stage-hit" : ""
      } ${attacking ? "dragon-stage-attack" : ""} ${maxDanger ? "dragon-stage-max" : ""} ${defeated ? "dragon-stage-defeated" : ""}`}
      aria-label={`${name}の姿`}
    >
      <div className="battle-sun" />
      <div className="battle-cloud battle-cloud-left" />
      <div className="battle-cloud battle-cloud-right" />
      <div className="battle-hills" />
      <div className="battle-ground" />
      {attacking && <div className="dragon-breath" />}
      <div className="dragon-shadow" />
      <svg className="dragon-sprite" viewBox="0 0 360 260" role="img" aria-hidden="true">
        <g className="dragon-sprite-inner" shapeRendering="crispEdges">
          <polygon className="dragon-wing-back" points="114,106 72,40 28,78 48,146 98,170 136,148" />
          <polygon className="dragon-wing-membrane" points="98,96 74,68 58,118 98,148 120,136" />
          <polygon className="dragon-wing-front" points="220,104 282,34 334,74 318,150 264,184 226,150" />
          <polygon className="dragon-wing-membrane" points="238,104 282,64 304,118 264,158 236,140" />
          <polygon className="dragon-tail-svg" points="124,154 78,138 34,154 16,186 54,196 94,182 126,198" />
          <polygon className="dragon-tail-tip-svg" points="14,186 2,166 26,170" />
          <polygon className="dragon-leg-svg" points="112,188 146,188 152,230 100,230 106,208" />
          <polygon className="dragon-leg-svg" points="192,188 228,188 238,230 184,230 190,208" />
          <polygon className="dragon-claw-svg" points="94,230 158,230 150,244 98,244" />
          <polygon className="dragon-claw-svg" points="178,230 244,230 238,244 184,244" />
          <polygon className="dragon-body-svg" points="114,126 146,104 210,104 244,128 240,190 210,210 132,210 104,188" />
          <polygon className="dragon-belly-svg" points="146,134 204,134 224,156 210,194 146,194 126,160" />
          <polygon className="dragon-neck-svg" points="220,116 244,72 274,82 260,140 230,154" />
          <polygon className="dragon-head-svg" points="246,50 306,42 334,66 330,110 304,130 252,118 234,88" />
          <polygon className="dragon-snout-svg" points="306,70 352,82 342,112 304,108" />
          <polygon className="dragon-horn-svg" points="254,52 258,14 280,48" />
          <polygon className="dragon-horn-svg" points="292,48 306,10 320,56" />
          <polygon className="dragon-fang-svg" points="314,110 324,132 334,110" />
          <polygon className="dragon-fang-svg" points="336,106 344,126 352,108" />
          <rect className="dragon-eye-svg" x="286" y="66" width="16" height="16" />
          <rect className="dragon-eye-dot-svg" x="296" y="70" width="6" height="7" />
          <rect className="dragon-mouth-svg" x="314" y="102" width="30" height="7" />
          <polygon className="dragon-scale-svg" points="132,116 144,94 156,116" />
          <polygon className="dragon-scale-svg" points="164,108 178,84 192,108" />
          <polygon className="dragon-scale-svg" points="202,116 214,94 226,116" />
          <rect className="dragon-highlight-svg" x="130" y="134" width="54" height="10" />
          <rect className="dragon-highlight-svg" x="252" y="62" width="42" height="8" />
          <rect className="dragon-highlight-svg" x="236" y="92" width="12" height="34" />
        </g>
      </svg>
      <div className="enemy-nameplate">{defeated ? `${name}は たおれた！` : `${name}が あらわれた！`}</div>
    </section>
  );
}

function findDuplicateId(questions: Question[]) {
  const seen = new Set<string>();
  for (const question of questions) {
    if (seen.has(question.id)) return question.id;
    seen.add(question.id);
  }
  return null;
}

function formatQuestTitle(value: string) {
  const base = value.trim().replace(/(?:クエスト|Quest)$/i, "").trim();
  return `${base || "oo"}クエスト`;
}

function formatDragonName(value: string) {
  const base = value.trim().replace(/(?:クエスト|ドラゴン|Quest|Dragon)$/i, "").trim();
  return `${base || "oo"}ドラゴン`;
}

function modeLabel(mode: Mode) {
  return {
    Normal: "ノーマルモード",
    Hard: "ハードモード",
    Max: "マックスモード"
  }[mode];
}

function categoryLabel(category: Question["category"]) {
  return category === "domain" ? "ドメイン" : "技術";
}

function updateMistakeRecords(records: MistakeRecord[], attempts: QuizAttempt[]) {
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
