"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDragonName, formatQuestTitle } from "@/lib/labels";
import { loadQuestData, loadQuestIndex } from "@/lib/questLoader";
import type { AppSettings, QuestMeta } from "@/lib/schemas";
import { defaultSettings, readSettings, writeSettings } from "@/lib/storage";
import type { LoadedQuest } from "@/types/app";

const emptyCounts = { total: 0, domain: 0, tech: 0 };

export function useQuestController() {
  const [settings, setSettings] = useState<AppSettings>(() => readSettings());
  const [questMetas, setQuestMetas] = useState<QuestMeta[]>([]);
  const [loadedQuest, setLoadedQuest] = useState<LoadedQuest | null>(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  async function loadIndex() {
    setLoading(true);
    setLoadError("");
    try {
      const quests = await loadQuestIndex();
      setQuestMetas(quests);
      const initialId = settings.lastSelectedQuestId ?? quests[0].id;
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
      const quest = await loadQuestData(meta);
      setLoadedQuest(quest);
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

  function resetSettings() {
    setSettings(defaultSettings);
  }

  return {
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
  };
}
