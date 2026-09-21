"use client";
import { translateTree } from "./tree";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createTranslator, type Locale, type Messages } from "./core";

const Context = createContext({
  locale: "zh" as Locale,
  t: (text: string) => text,
});
export function LocaleProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({ locale, t: createTranslator(locale, messages) }),
    [locale, messages],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export const useLocale = () => useContext(Context);

export default function Localize({ children }: { children: ReactNode }) {
  const { locale, t } = useLocale();
  return locale === "zh" ? children : translateTree(children, t);
}
