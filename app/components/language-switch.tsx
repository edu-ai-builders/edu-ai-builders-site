"use client";
import { useState } from "react";
import { useLocale } from "../i18n/localize";
import { LANGUAGE_COOKIE, type Locale } from "../i18n/core";
export default function LanguageSwitch() {
  const { locale } = useLocale();
  const [pending, setPending] = useState(false);
  function switchTo(next: Locale) {
    if (next === locale || pending) return;
    setPending(true);
    document.cookie = `${LANGUAGE_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    // A fresh request updates HTML language, metadata, server text and figures.
    // The full URL (including lesson/concept selection and hash) is retained.
    window.location.reload();
  }
  return (
    <div
      className="ea-language-switch"
      role="group"
      aria-label="Language / 语言"
      translate="no"
    >
      <button
        type="button"
        lang="zh-CN"
        aria-pressed={locale === "zh"}
        disabled={pending}
        onClick={() => switchTo("zh")}
      >
        中文
      </button>
      <button
        type="button"
        lang="en"
        aria-pressed={locale === "en"}
        disabled={pending}
        onClick={() => switchTo("en")}
      >
        EN
      </button>
    </div>
  );
}
