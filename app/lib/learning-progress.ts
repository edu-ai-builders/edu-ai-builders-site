"use client";
import { useCallback, useEffect, useState } from "react";
import rack from "../../public/learning-sciences/0.2.0/rack.json";
import { createProgressStore, MAX_EVENTS, PROGRESS_KEY, safeProjectUrl, stageOf, validLearningEvent, type LearningEvent, type ProgressSnapshot } from "./learning-progress-core";
export type { LearningEvent } from "./learning-progress-core";
const UPDATE = "edu-ai-learning-events-updated";
const conceptIds = new Set(rack.entries.map(entry => entry.id));
const store = createProgressStore(() => window.localStorage, conceptIds, snapshot => {
  window.dispatchEvent(new CustomEvent(UPDATE, { detail: snapshot }));
});
export function useLearningProgress() {
  const [events, setEvents] = useState<LearningEvent[]>([]);
  const [ready, setReady] = useState(false);
  const [persistent, setPersistent] = useState(true);
  useEffect(() => {
    const sync = () => { const next = store.read(); setEvents(next.events); setPersistent(next.persistent); setReady(true); };
    const local = (event: Event) => { const detail = (event as CustomEvent<ProgressSnapshot>).detail; setEvents(detail.events); setPersistent(detail.persistent); };
    const storage = (event: StorageEvent) => { if (event.key === PROGRESS_KEY || event.key === null) sync(); };
    sync(); window.addEventListener(UPDATE, local); window.addEventListener("storage", storage);
    return () => { window.removeEventListener(UPDATE, local); window.removeEventListener("storage", storage); };
  }, []);
  const addEvent = useCallback((conceptId: string, kind: LearningEvent["kind"], text = "", projectUrl?: string) => {
    try {
      const event: LearningEvent = { id: typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `event-${Date.now()}-${Math.random().toString(36).slice(2)}`, conceptId, kind, text: text.trim(), ...(projectUrl?.trim() ? { projectUrl: safeProjectUrl(projectUrl) } : {}), createdAt: new Date().toISOString() };
      if (!validLearningEvent(event, conceptIds)) return false;
      const previous = store.read().events;
      if (kind === "encounter" && previous.some(e => e.conceptId === conceptId && e.kind === "encounter")) return true;
      if (previous.length >= MAX_EVENTS) return false;
      store.save([...previous, event]); return true;
    } catch { return false; }
  }, []);
  const removeEvent = useCallback((id: string) => { store.save(store.read().events.filter(e => e.id !== id)); }, []);
  const stageFor = useCallback((conceptId: string) => stageOf(events, conceptId), [events]);
  return { ready, events, persistent, addEvent, removeEvent, stageFor };
}
