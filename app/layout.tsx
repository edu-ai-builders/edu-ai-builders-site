import { LocaleProvider } from "./i18n/localize";
import { getI18n } from "./i18n/server";
import { translateData } from "./i18n/core";
import type { Metadata } from "next";
import SiteHeader from "./components/site-header";
import SiteFooter from "./components/site-footer";
import "./globals.css";
import "./site-shell.css";

const metadata: Metadata = {
  title: { default: "Edu AI Builders — 用 AI 做出自己的学习工具", template: "%s · Edu AI Builders" },
  description: "用 AI 把教学想法做成能用的学习工具。免费的 Vibe coding 与学习科学课程，打开就能试的课堂工具，以及可改的构建材料。面向老师、教育产品创造者与想给自己和孩子动手做的人。",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const {locale,messages}=await getI18n();
  return <html data-scroll-behavior="smooth" lang={locale === "en" ? "en" : "zh-CN"}><body><LocaleProvider locale={locale} messages={messages}><SiteHeader /><div id="site-content" tabIndex={-1}>{children}</div><SiteFooter /></LocaleProvider></body></html>;
}

export async function generateMetadata():Promise<Metadata> { const {t}=await getI18n(); return translateData(metadata,t); }
