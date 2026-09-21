import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import {
  createTranslator,
  resolveLocale,
  translateData,
  LANGUAGE_COOKIE,
  type Messages,
} from "./core";
import common from "./common.en.json";
import learning from "./learning.en.json";

// Catalogs are loaded server-side; course body translations are sent only with
// the selected course, rather than shipping every lesson to every visitor.
export const getLocale = cache(async () =>
  resolveLocale((await cookies()).get(LANGUAGE_COOKIE)?.value),
);
export const getMessages = cache(async () => {
  const [atlas, directory] = await Promise.all([
    import("./atlas.en.json"),
    import("./directory.en.json"),
  ]);
  return {
    ...atlas.default,
    ...directory.default,
    ...common,
    ...learning,
  } as Messages;
});
export const getI18n = cache(async () => {
  const locale = await getLocale();
  const messages = locale === "en" ? await getMessages() : {};
  return { locale, messages, t: createTranslator(locale, messages) };
});
export async function localizeCourse<T>(course: T): Promise<T> {
  const locale = await getLocale();
  if (locale === "zh") return course;
  const { default: messages } = await import("./courses.en.json");
  return translateData(course, createTranslator(locale, messages));
}
