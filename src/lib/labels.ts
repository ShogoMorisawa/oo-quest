import type { Mode, Question } from "@/lib/schemas";

export function formatQuestTitle(value: string) {
  const base = value.trim().replace(/(?:クエスト|Quest)$/i, "").trim();
  return `${base || "oo"}クエスト`;
}

export function formatDragonName(value: string) {
  const base = value.trim().replace(/(?:クエスト|ドラゴン|Quest|Dragon)$/i, "").trim();
  return `${base || "oo"}ドラゴン`;
}

export function modeLabel(mode: Mode) {
  return {
    Normal: "ノーマルモード",
    Hard: "ハードモード",
    Max: "マックスモード"
  }[mode];
}

export function categoryLabel(category: Question["category"]) {
  return category === "domain" ? "ドメイン" : "技術";
}
