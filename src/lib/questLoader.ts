import { findDuplicateId } from "@/lib/game";
import { QuestIndexSchema, QuestionsSchema, type QuestMeta } from "@/lib/schemas";
import { formatValidationError } from "@/lib/utils";
import type { LoadedQuest } from "@/types/app";

async function fetchJson(path: string) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error(`${path} の読み込みに失敗しました。`);
  return response.json();
}

export async function loadQuestIndex() {
  let raw: unknown;
  try {
    raw = await fetchJson("/quests/index.json");
  } catch {
    raw = await fetchJson("/quests/index.sample.json");
  }
  const parsed = QuestIndexSchema.safeParse(raw);
  if (!parsed.success) throw new Error(formatValidationError(parsed.error));
  if (parsed.data.length === 0) throw new Error("クエストが登録されていません。index.jsonを確認してください。");
  return parsed.data;
}

export async function loadQuestData(meta: QuestMeta): Promise<LoadedQuest> {
  const raw = await fetchJson(meta.file);
  const parsed = QuestionsSchema.safeParse(raw);
  if (!parsed.success) throw new Error(formatValidationError(parsed.error));
  const duplicated = findDuplicateId(parsed.data);
  if (duplicated) throw new Error(`問題ID '${duplicated}' が複数回使われています。`);
  return { meta, questions: parsed.data };
}
