export type Locale = "zh" | "en";
export type Messages = Record<string, string>;
export const LANGUAGE_COOKIE = "edu-language";
export const normalize = (text: string) => text.replace(/\s+/g, " ").trim();
export const resolveLocale = (value?: string | null): Locale =>
  value === "en" ? "en" : "zh";

export function createTranslator(locale: Locale, messages: Messages) {
  const templates = Object.entries(messages)
    .filter(([key]) => /\{\d+\}/.test(key))
    .map(([key, value]) => ({
      pattern: new RegExp(
        "^" +
          key
            .split(/(\{\d+\})/)
            .map((part) =>
              /^\{\d+\}$/.test(part)
                ? "(.*?)"
                : part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            )
            .join("") +
          "$",
      ),
      value,
    }));
  function t(text: string): string {
    if (locale === "zh" || !/[\u3400-\u9fff]/.test(text)) return text;
    const key = normalize(text);
    const direct = messages[key];
    if (direct !== undefined)
      return (
        (text.match(/^\s*/)?.[0] || "") +
        direct +
        (text.match(/\s*$/)?.[0] || "")
      );
    for (const { pattern, value } of templates) {
      const match = key.match(pattern);
      if (match)
        return value.replace(/\{(\d+)\}/g, (_, index) =>
          t(match[Number(index) + 1] ?? ""),
        );
    }
    return text;
  }
  return t;
}

/** Localize authored content values while preserving keys, identifiers and code shape. */
export function translateData<T>(value: T, t: (text: string) => string): T {
  if (typeof value === "string") return t(value) as T;
  if (Array.isArray(value))
    return value.map((item) => translateData(item, t)) as T;
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, translateData(item, t)]),
    ) as T;
  return value;
}
