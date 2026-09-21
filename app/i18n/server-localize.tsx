import { type ReactNode } from "react";
import { getI18n } from "./server";
import { translateTree } from "./tree";
export default async function ServerLocalize({
  children,
}: {
  children: ReactNode;
}) {
  const { locale, t } = await getI18n();
  return locale === "zh" ? children : translateTree(children, t);
}
