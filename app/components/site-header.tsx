"use client";

import Localize from "@/app/i18n/localize";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LanguageSwitch from "./language-switch";
import { useLocale } from "../i18n/localize";

const destinations = [
  { href: "/learn", label: "学习", english: "Learn it" },
  { href: "/use", label: "使用", english: "Use it" },
  { href: "/build", label: "构建", english: "Build with it" },
  { href: "/atlas", label: "地图", english: "Atlas" },
  { href: "/directory", label: "开源资源", english: "Open source" },
  { href: "/changelog", label: "更新日志", english: "Changelog" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const {locale}=useLocale();
  const [open, setOpen] = useState(false);
  return <Localize>{(
    <>
      <a className="skip-link" href="#site-content">
        跳到主要内容
      </a>
      <div className="ea-topline">
        <span>EDU AI BUILDERS</span>
        <span>LEARN · MAKE · UNDERSTAND</span>
        <span>BUILDING IN PUBLIC</span>
      </div>
      <header className="ea-header">
        <Link
          className="brand ea-brand"
          href="/"
          onClick={() => setOpen(false)}
          aria-label="Edu AI Builders 首页"
        >
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
            <b>e</b>
          </span>
          <span>Edu AI Builders</span>
        </Link>
        <button
          className="ea-menu-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="ea-main-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? "关闭菜单 ×" : "浏览菜单 ☰"}
        </button>
        <nav
          id="ea-main-nav"
          className={`ea-nav ${open ? "is-open" : ""}`}
          aria-label="主要导航"
        >
          {destinations.map((item) => {
            const active =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`) ||
              (item.href === "/atlas" &&
                pathname.startsWith("/learning-sciences")) ||
              (item.href === "/changelog" && pathname.startsWith("/updates"));
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                <span>{locale === "en" ? item.english : item.label}</span>
                {locale === "zh" && <small>{item.english}</small>}
              </Link>
            );
          })}
        </nav>
        <div className="ea-header-actions"><LanguageSwitch /><a
          className="ea-github"
          href="https://github.com/edu-ai-builders"
          target="_blank"
          rel="noreferrer"
        >
          GitHub ↗
        </a></div>
      </header>
    </>
  )}</Localize>;
}
