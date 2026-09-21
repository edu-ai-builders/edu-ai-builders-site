export type LearningEvent = { id: string; conceptId: string; kind: "encounter" | "explanation" | "application"; text: string; projectUrl?: string; createdAt: string };
export const PROGRESS_KEY = "edu-ai-learning-events-v1";
export const MAX_EVENTS = 3000;
export function safeProjectUrl(value: string): string | undefined {
  if (!value.trim()) return undefined;
  if (value.length > 2000) throw new Error("链接太长");
  const url = new URL(value);
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) throw new Error("请使用 http 或 https 链接");
  return url.href;
}
export function validLearningEvent(value: unknown, validConceptIds: ReadonlySet<string>): value is LearningEvent {
  if (!value || typeof value !== "object") return false;
  const event = value as LearningEvent;
  if (typeof event.id !== "string" || !/^[a-zA-Z0-9-]{8,100}$/.test(event.id) || typeof event.conceptId !== "string" || !validConceptIds.has(event.conceptId)) return false;
  if (!["encounter", "explanation", "application"].includes(event.kind) || typeof event.text !== "string" || event.text.length > 3000) return false;
  if (event.kind !== "encounter" && event.text.trim().length < 8) return false;
  if (typeof event.createdAt !== "string" || event.createdAt.length > 40 || !Number.isFinite(Date.parse(event.createdAt))) return false;
  try { if (event.projectUrl !== undefined && (typeof event.projectUrl !== "string" || !safeProjectUrl(event.projectUrl))) return false; } catch { return false; }
  return true;
}
export function parseLearningEvents(raw: string | null, validConceptIds: ReadonlySet<string>): LearningEvent[] {
  if (!raw || raw.length > 12000000) return [];
  try {
    const data: unknown = JSON.parse(raw); if (!Array.isArray(data)) return [];
    const unique = new Map<string, LearningEvent>();
    for (const event of data.filter(e => validLearningEvent(e, validConceptIds)).slice(-MAX_EVENTS)) unique.set(event.id, event);
    return [...unique.values()];
  } catch { return []; }
}
export function stageOf(events: LearningEvent[], conceptId: string): 0 | 1 | 2 | 3 {
  const relevant = events.filter(event => event.conceptId === conceptId);
  return relevant.some(e => e.kind === "application") ? 3 : relevant.some(e => e.kind === "explanation") ? 2 : relevant.length ? 1 : 0;
}
export type ProgressSnapshot = { events: LearningEvent[]; persistent: boolean };
// Sticky session mode avoids losing unsaved notes if setItem throws but getItem still works.
export function createProgressStore(storage: () => Pick<Storage, "getItem" | "setItem">, validConceptIds: ReadonlySet<string>, onChange: (snapshot: ProgressSnapshot) => void) {
  let session: LearningEvent[] = [];
  let persistent = true;
  const read = (): ProgressSnapshot => {
    if (persistent) {
      try { session = parseLearningEvents(storage().getItem(PROGRESS_KEY), validConceptIds); }
      catch { persistent = false; }
    }
    return { events: session, persistent };
  };
  const save = (events: LearningEvent[]): ProgressSnapshot => {
    session = events;
    if (persistent) { try { storage().setItem(PROGRESS_KEY, JSON.stringify(events)); } catch { persistent = false; } }
    const snapshot = { events: session, persistent }; onChange(snapshot); return snapshot;
  };
  return { read, save };
}
