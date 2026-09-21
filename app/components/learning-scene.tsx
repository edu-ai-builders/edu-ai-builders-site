"use client";

import Localize from "@/app/i18n/localize";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, LazyMotion, domMax, m } from "motion/react";
import useReducedMotionPreference from "../lib/use-reduced-motion";
import { productScenes, ProductSceneVisual } from "./product-scenes";

export default function LearningScene() {
  const [active, setActive] = useState(0);
  const [phase, setPhase] = useState(0);
  const [direction, setDirection] = useState(1);
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(true);
  const reduced = useReducedMotionPreference();
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.25 },
    );
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!playing || reduced || !visible) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setPhase((value) => (value + 1) % 3);
    }, 3100);
    return () => window.clearInterval(timer);
  }, [playing, reduced, visible, active]);
  useEffect(() => {
    if (!playing || reduced || !visible) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setDirection(1);
      setActive((value) => (value + 1) % productScenes.length);
      setPhase(0);
    }, 9300);
    return () => window.clearInterval(timer);
  }, [playing, reduced, visible, active]);
  function select(index: number, nextDirection = index > active ? 1 : -1) {
    setDirection(nextDirection);
    setActive((index + productScenes.length) % productScenes.length);
    setPhase(0);
    setPlaying(false);
  }
  const scene = productScenes[active];
  return <Localize>{(
    <LazyMotion features={domMax}>
      <div
        className="product-deck"
        ref={root}
        role="region"
        aria-roledescription="轮播"
        aria-label="学习产品案例"
        tabIndex={0}
        onFocusCapture={(event) => {
          if (!(event.target as HTMLElement).closest("[data-deck-playback]"))
            setPlaying(false);
        }}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            select(
              active + (event.key === "ArrowRight" ? 1 : -1),
              event.key === "ArrowRight" ? 1 : -1,
            );
          }
        }}
      >
        <div className="deck-stack">
          <div className="deck-paper deck-paper-back" aria-hidden="true" />
          <div className="deck-paper deck-paper-middle" aria-hidden="true" />
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <m.article
              key={scene.id}
              className={`learning-scene deck-card deck-${scene.id}`}
              custom={direction}
              variants={{
                enter: (way: number) => ({
                  x: reduced ? 0 : way * 75,
                  rotate: reduced ? 0 : way * 3,
                  opacity: 0,
                  scale: reduced ? 1 : 0.97,
                }),
                center: { x: 0, rotate: 0, opacity: 1, scale: 1 },
                exit: (way: number) => ({
                  x: reduced ? 0 : -way * 100,
                  rotate: reduced ? 0 : -way * 5,
                  opacity: 0,
                  scale: reduced ? 1 : 0.96,
                }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                duration: reduced ? 0 : 0.42,
                ease: [0.22, 1, 0.36, 1],
              }}
              drag={reduced ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.16}
              onDragStart={() => setPlaying(false)}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) > 45)
                  select(
                    active + (info.offset.x < 0 ? 1 : -1),
                    info.offset.x < 0 ? 1 : -1,
                  );
              }}
              aria-label={`${active + 1} / ${productScenes.length}：${scene.label}`}
            >
              <div className="scene-context">
                <span>
                  <i />
                  {scene.audience}
                </span>
                <span>产品情境演示 · {active + 1}/4</span>
              </div>
              <div className="scene-question">
                <span className="scene-avatar" aria-hidden="true">
                  {["Aa", "↻", "▤", "↗"][active]}
                </span>
                <div>
                  <small>{scene.title}</small>
                  <h2>{scene.question}</h2>
                </div>
              </div>
              <ProductSceneVisual kind={scene.id} phase={phase} />
              <div className="scene-story">
                <div
                  className="scene-steps"
                  aria-label="查看这个产品怎样帮助学习者"
                >
                  {scene.steps.map((step, index) => (
                    <button
                      key={step}
                      type="button"
                      aria-pressed={phase === index}
                      onClick={() => {
                        setPlaying(false);
                        setPhase(index);
                      }}
                    >
                      <span>{index + 1}</span>
                      {step}
                    </button>
                  ))}
                </div>
                <div className="scene-explanation">
                  <p>{scene.notes[phase]}</p>
                </div>
                <Link className="deck-build-link" href={scene.href}>
                  了解怎样构建 <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </m.article>
          </AnimatePresence>
        </div>
        <div className="deck-navigation">
          <button
            type="button"
            className="deck-arrow"
            onClick={() => select(active - 1, -1)}
            aria-label="上一个产品案例"
          >
            ←
          </button>
          <div className="deck-tabs" aria-label="选择产品案例">
            {productScenes.map((item, index) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={active === index}
                onClick={() => select(index)}
              >
                <i aria-hidden="true" />
                {item.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="deck-arrow"
            onClick={() => select(active + 1, 1)}
            aria-label="下一个产品案例"
          >
            →
          </button>
        </div>
        <div className="deck-playback">
          <span>
            {reduced
              ? "选择卡片，查看不同场景"
              : "自动展示 · 左右滑动，也可以点选卡片"}
          </span>
          {!reduced && (
            <button
              type="button"
              data-deck-playback
              aria-pressed={playing}
              onClick={() => setPlaying(!playing)}
            >
              {playing ? "暂停 Ⅱ" : "继续播放 ▷"}
            </button>
          )}
        </div>
      </div>
    </LazyMotion>
  )}</Localize>;
}
