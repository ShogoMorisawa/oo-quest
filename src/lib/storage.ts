"use client";

import { z } from "zod";
import {
  AppSettingsSchema,
  MistakeRecordsSchema,
  QuizHistorySchema,
  type AppSettings,
  type MistakeRecord,
  type QuizSession
} from "@/lib/schemas";

export const storageKeys = {
  settings: "dq_app_settings",
  history: "dq_quiz_history",
  mistakes: "dq_mistake_records"
} as const;

export const defaultSettings: AppSettings = {
  playerName: "プレイヤー",
  questTitle: "",
  lastSelectedQuestId: null,
  preferredMode: "Normal"
};

function readSafe<T>(key: string, schema: z.ZodType<T>, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = schema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : fallback;
  } catch {
    return fallback;
  }
}

function writeSafe<T>(key: string, schema: z.ZodType<T>, value: T) {
  if (typeof window === "undefined") return;
  const parsed = schema.safeParse(value);
  if (!parsed.success) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(parsed.data));
  } catch {
    // localStorage can be unavailable in private browsing or constrained environments.
  }
}

export function readSettings() {
  const settings = readSafe(storageKeys.settings, AppSettingsSchema, defaultSettings);
  return settings.playerName === "勇者" ? { ...settings, playerName: "プレイヤー" } : settings;
}

export function writeSettings(settings: AppSettings) {
  writeSafe(storageKeys.settings, AppSettingsSchema, settings);
}

export function readHistory() {
  return readSafe<QuizSession[]>(storageKeys.history, QuizHistorySchema, []);
}

export function writeHistory(history: QuizSession[]) {
  writeSafe(storageKeys.history, QuizHistorySchema, history);
}

export function readMistakes() {
  return readSafe<MistakeRecord[]>(storageKeys.mistakes, MistakeRecordsSchema, []);
}

export function writeMistakes(records: MistakeRecord[]) {
  writeSafe(storageKeys.mistakes, MistakeRecordsSchema, records);
}

export function clearDomainQuestStorage() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(storageKeys.settings);
  window.localStorage.removeItem(storageKeys.history);
  window.localStorage.removeItem(storageKeys.mistakes);
}
