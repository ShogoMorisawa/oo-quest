import { CssDragon } from "@/components/battle/CssDragon";
import { Explanation } from "@/components/battle/Explanation";
import { HpBar } from "@/components/ui/HpBar";
import { RetroButton } from "@/components/ui/RetroButton";
import { categoryLabel, modeLabel } from "@/lib/labels";
import { modeConfig } from "@/lib/utils";
import type { BattleState } from "@/types/app";

export function BattleScreen({
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
