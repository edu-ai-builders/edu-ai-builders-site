"use client";

import Localize, {useLocale} from "@/app/i18n/localize";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { chineseLabels } from "@/app/atlas/model";
import type { Course, CourseLesson } from "@/app/content/courses";
import TeachableFigure from "./teachable-figure";
import { useLearningProgress } from "@/app/lib/learning-progress";

const PROGRESS_KEY = "edu-ai-builders:course-practice:v1";
const PROGRESS_EVENT = "edu-course-progress";
// Courses that were merged away. Their stored lesson IDs were kept, so records
// saved under the old slug still belong to a real lesson of the new course.
const MERGED_COURSE_SLUGS: Record<string, string> = {
  "git-first-checkpoint": "github-starter",
};

function readSnapshot() {
  try {
    return window.localStorage.getItem(PROGRESS_KEY) || "{}";
  } catch {
    return "{}";
  }
}
function subscribe(callback: () => void) {
  const listener = (event: StorageEvent) => {
    if (!event.key || event.key === PROGRESS_KEY) callback();
  };
  window.addEventListener("storage", listener);
  window.addEventListener(PROGRESS_EVENT, callback);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(PROGRESS_EVENT, callback);
  };
}
function parseSnapshot(
  raw: string,
  validLessons: Record<string, string[]>,
): Record<string, string[]> {
  if (raw.length > 20000) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return {};
    const safe: Record<string, string[]> = Object.create(null);
    const courseSlugs = new Set(Object.keys(validLessons));
    for (const [storedKey, value] of Object.entries(parsed).slice(0, 20)) {
      const key = courseSlugs.has(storedKey)
        ? storedKey
        : MERGED_COURSE_SLUGS[storedKey];
      if (key && courseSlugs.has(key) && Array.isArray(value)) {
        const knownIds = new Set(validLessons[key]);
        safe[key] = [
          ...new Set([
            ...(safe[key] || []),
            ...value
              .slice(0, 100)
              .filter(
                (id): id is string =>
                  typeof id === "string" && knownIds.has(id),
              ),
          ]),
        ];
      }
    }
    return safe;
  } catch {
    return {};
  }
}

export default function CourseClient({
  course,
  validLessons,
}: {
  course: Course;
  validLessons: Record<string, string[]>;
}) {
  const params = useSearchParams();
  const router = useRouter();
  const requested = params.get("lesson");
  const index = Math.max(
    0,
    course.lessons.findIndex((lesson) => lesson.id === requested),
  );
  const lesson = course.lessons[index];
  const raw = useSyncExternalStore(subscribe, readSnapshot, () => "{}");
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const completed = (
    parseSnapshot(raw, validLessons)[course.slug] || []
  ).filter((id) => course.lessons.some((item) => item.id === id));
  const [storageMessage, setStorageMessage] = useState("");

  function moveTo(next: number) {
    const target = course.lessons[next];
    if (!target) return;
    router.push(
      `/learn/${course.slug}?lesson=${encodeURIComponent(target.id)}#lesson-content`,
      { scroll: true },
    );
    setStorageMessage("");
  }
  function saveCompletion(id: string, done: boolean) {
    try {
      const current = parseSnapshot(readSnapshot(), validLessons);
      const previous = current[course.slug] || [];
      current[course.slug] = done
        ? [...new Set([...previous, id])]
        : previous.filter((item) => item !== id);
      window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(current));
      window.dispatchEvent(new Event(PROGRESS_EVENT));
      setStorageMessage(
        done
          ? "已记录这节的练习自检，仅保存在此浏览器。"
          : "已撤销本节练习记录。Atlas 中的独立记录不受影响。",
      );
      return true;
    } catch {
      setStorageMessage(
        "浏览器未能保存记录。仍可继续学习，请将练习结果保留到自己的笔记中。",
      );
      return false;
    }
  }
  return <Localize>{(
    <main id="main-content" className="course-shell course-detail">
      <Link className="course-back" href="/learn">
        ← 全部课程
      </Link>
      <header className="course-detail-header">
        <p className="course-eyebrow">免费课程 · 阅读 + 交互实验 + 实践</p>
        <h1>{course.title}</h1>
        <div className="course-detail-audience">
          <p className="course-who">写给：{course.audience.who}</p>
          <blockquote className="course-pain">
            “{course.audience.pain}”
          </blockquote>
        </div>
        <p className="course-lead">{course.summary}</p>
        <div className="course-outcome">
          <span>学完你手里会有</span>
          <p>{course.audience.win}</p>
        </div>
      </header>
      <div className="course-workspace">
        <aside className="course-sidebar" aria-label="课程路线">
          <div className="course-sidebar-heading">
            <strong>你的学习路线</strong>
            <span>
              {ready ? completed.length : "—"} / {course.lessons.length}
            </span>
          </div>
          <progress
            max={course.lessons.length}
            value={ready ? completed.length : 0}
            aria-label="已自检的课程练习"
          />
          <details className="course-curriculum" open>
            <summary>课程目录 · 可以跳到需要的一节</summary>
            <ol>
              {course.lessons.map((item, i) => {
                const moduleLabel =
                  (item as CourseLesson & { module?: string }).module ||
                  (i < 3 ? "认识与起步" : i < 7 ? "动手与理解" : "检查与迁移");
                const previousModule =
                  i > 0
                    ? (
                        course.lessons[i - 1] as CourseLesson & {
                          module?: string;
                        }
                      ).module ||
                      (i - 1 < 3
                        ? "认识与起步"
                        : i - 1 < 7
                          ? "动手与理解"
                          : "检查与迁移")
                    : "";
                return (
                  <li key={item.id}>
                    {moduleLabel !== previousModule && (
                      <h3 className="course-module-label">{moduleLabel}</h3>
                    )}
                    <button
                      type="button"
                      aria-current={item.id === lesson.id ? "step" : undefined}
                      onClick={() => moveTo(i)}
                    >
                      <span className="course-step-number">
                        {completed.includes(item.id)
                          ? "✓"
                          : String(i + 1).padStart(2, "0")}
                      </span>
                      <span>
                        <strong>{item.title}</strong>
                        <small>
                          约 {item.minutes} 分钟
                          {completed.includes(item.id) ? " · 已记录练习" : ""}
                        </small>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </details>
          <p className="course-storage-note">
            仅保存在此浏览器。清除站点数据或更换设备不会保留进度。勾选代表你的自我确认，不是系统评定的掌握程度。
          </p>
          <details className="course-preparation">
            <summary>开始前需要什么？</summary>
            <p>{course.prerequisite}</p>
          </details>
          <details className="course-preparation">
            <summary>走完这条路线会交付什么？</summary>
            <p>{course.outcome}</p>
          </details>
          <Link
            className="course-atlas-link"
            href={
              course.conceptIds[0]
                ? `/atlas?concept=${encodeURIComponent(course.conceptIds[0])}`
                : "/atlas"
            }
          >
            在 Atlas 中探索相关设计依据 ↗
          </Link>
        </aside>
        <div id="lesson-content" className="course-reading" tabIndex={-1}>
          <LessonBody
            key={lesson.id}
            courseSlug={course.slug}
            lesson={lesson}
            number={index + 1}
            completed={completed.includes(lesson.id)}
            ready={ready}
            onComplete={(done) => saveCompletion(lesson.id, done)}
          />
          {storageMessage && (
            <p className="course-status" role="status">
              {storageMessage}
            </p>
          )}
          <nav className="course-lesson-nav" aria-label="上下节课程">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => moveTo(index - 1)}
            >
              ← 上一节
            </button>
            {index < course.lessons.length - 1 ? (
              <button
                className="course-primary"
                type="button"
                onClick={() => moveTo(index + 1)}
              >
                下一节 →
              </button>
            ) : (
              <Link className="course-button course-primary" href="/learn">
                选择下一条路线 →
              </Link>
            )}
          </nav>
        </div>
      </div>
    </main>
  )}</Localize>;
}

function LessonBody({
  courseSlug,
  lesson,
  number,
  completed,
  ready,
  onComplete,
}: {
  courseSlug: string;
  lesson: CourseLesson;
  number: number;
  completed: boolean;
  ready: boolean;
  onComplete: (done: boolean) => boolean;
}) {
  const {t}=useLocale();
  const hasFigure =
    Boolean((lesson as CourseLesson & { figureKey?: string }).figureKey) ||
    [
      "retrieve",
      "scaffold",
      "feedback",
      "snapshot",
      "review",
      "three-layers",
      "debug",
      "structure",
      "test",
      "learning-loop",
      "local-prototype",
    ].includes(lesson.id);
  const [checked, setChecked] = useState<string[]>([]);
  const [answer, setAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const [atlasMessage, setAtlasMessage] = useState("");
  const { ready: atlasReady, persistent, addEvent } = useLearningProgress();
  const allChecked = checked.length === lesson.checklist.length;
  const correct =
    showFeedback && answer !== null && lesson.question.options[answer].correct;
  async function copyCode() {
    if (!lesson.example.code) return;
    try {
      await navigator.clipboard.writeText(lesson.example.code);
      setCopyMessage("代码已复制。");
    } catch {
      setCopyMessage("未能自动复制，请在代码框中选择并复制。");
    }
  }
  function recordEncounter() {
    const success = lesson.conceptIds
      .map((id) => addEvent(id, "encounter", t(`读过并练习：${lesson.title}`)))
      .every(Boolean);
    setAtlasMessage(
      success
        ? "已在 Atlas 登记“接触过”。你可以在那里留下自己的解释或实践记录。"
        : "部分记录可能未保存，请前往 Atlas 检查浏览器中的记录。",
    );
  }
  return <Localize>{(
    <article>
      <header className="course-lesson-heading">
        <p className="course-eyebrow">
          第 {number} 节 · 约 {lesson.minutes} 分钟
        </p>
        <h2>{lesson.title}</h2>
        <p>{lesson.objective}</p>
      </header>
      <nav className="course-inpage-nav" aria-label="本节环节">
        <a href="#lesson-explanation">读懂概念</a>
        {hasFigure && <a href="#lesson-figure">动手观察</a>}
        <a href="#lesson-example">具体例子</a>
        <a href="#lesson-practice">自己试试</a>
        <a href="#lesson-check">检查理解</a>
      </nav>
      <div id="lesson-explanation" className="course-prose">
        {lesson.paragraphs.slice(0, 2).map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      {hasFigure && (
        <div id="lesson-figure">
          <TeachableFigure course={courseSlug} lesson={lesson} />
        </div>
      )}
      <div className="course-prose">
        {lesson.paragraphs.slice(2).map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <section
        id="lesson-example"
        className="course-example"
        aria-label="具体例子"
      >
        <p className="course-section-label">看一个例子</p>
        <h3>{lesson.example.title}</h3>
        <p>{lesson.example.text}</p>
        {lesson.example.code && (
          <>
            <div className="course-code-actions">
              <button type="button" onClick={copyCode}>
                复制代码
              </button>
              <span role="status">{copyMessage}</span>
            </div>
            <pre tabIndex={0} aria-label="示例代码">
              <code>{lesson.example.code}</code>
            </pre>
          </>
        )}
      </section>
      <section id="lesson-practice" className="course-practice">
        <p className="course-section-label">现在动手</p>
        <h3>留下一份自己的结果</h3>
        <p>{lesson.task}</p>
        <p className="course-practice-note">
          在自己的编辑器或笔记中完成。这里不会上传或自动评判你的作品。
        </p>
      </section>
      <section
        id="lesson-check"
        className="course-quiz"
        aria-labelledby={`quiz-${lesson.id}`}
      >
        <p className="course-section-label">检查理解</p>
        <fieldset>
          <legend id={`quiz-${lesson.id}`}>{lesson.question.prompt}</legend>
          {lesson.question.options.map((option, i) => (
            <label
              key={option.text}
              className={answer === i ? "is-selected" : ""}
            >
              <input
                type="radio"
                name={`quiz-${lesson.id}`}
                checked={answer === i}
                onChange={() => {
                  setAnswer(i);
                  setShowFeedback(false);
                }}
              />
              <span>{option.text}</span>
            </label>
          ))}
        </fieldset>
        <button
          type="button"
          disabled={answer === null}
          onClick={() => setShowFeedback(true)}
        >
          查看反馈
        </button>
        {showFeedback && answer !== null && (
          <p
            className={`course-answer-feedback ${correct ? "is-correct" : ""}`}
            role="status"
          >
            <strong>
              {correct ? "这个判断有依据。" : "再看一下这个区别。"}
            </strong>{" "}
            {lesson.question.options[answer].feedback}
          </p>
        )}
      </section>
      <section className="course-checklist">
        <p className="course-section-label">对照你的作品</p>
        <h3>完成实践后，逐项自检</h3>
        {lesson.checklist.map((item) => (
          <label key={item}>
            <input
              type="checkbox"
              checked={checked.includes(item)}
              onChange={(event) =>
                setChecked((previous) =>
                  event.target.checked
                    ? [...previous, item]
                    : previous.filter((value) => value !== item),
                )
              }
            />
            <span>{item}</span>
          </label>
        ))}
        {completed ? (
          <div className="course-recorded">
            <strong>✓ 已记录本节练习</strong>
            <button type="button" onClick={() => onComplete(false)}>
              撤销记录
            </button>
          </div>
        ) : (
          <>
            <button
              className="course-primary"
              type="button"
              disabled={!ready || !allChecked || !correct}
              onClick={() => onComplete(true)}
            >
              我已实践并完成自检
            </button>
            <p className="course-practice-note">
              完成上面的理解检查与所有自检后，可记录进度。阅读或点击下一节不会自动完成课程。
            </p>
          </>
        )}
      </section>
      {lesson.conceptIds.length > 0 && (
        <section className="course-concepts">
          <p className="course-section-label">连接到 Atlas</p>
          <h3>沿着概念继续探索</h3>
          <div>
            {lesson.conceptIds.map((id) => (
              <Link href={`/atlas?concept=${encodeURIComponent(id)}`} key={id}>
                {conceptLabel(id)} <span aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
          <button
            type="button"
            disabled={!atlasReady || !completed}
            onClick={recordEncounter}
          >
            在 Atlas 记录我已接触这些概念
          </button>
          <p className="course-practice-note">
            完成本节练习后可主动记录。它不代表掌握，也不会替你填写解释或应用证据。
          </p>
          {atlasMessage && (
            <p role="status">
              {atlasMessage}{" "}
              {!persistent && (
                <strong>当前只能保留在本次页面会话中，刷新后可能丢失。</strong>
              )}
            </p>
          )}
        </section>
      )}
      <section className="course-sources">
        <h3>来源与延伸阅读</h3>
        <p>
          课程中的例子与练习为本站编写；下面的原始资料用于核对概念和技术细节。
        </p>
        <ul>
          {lesson.sources.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                target={source.url.startsWith("http") ? "_blank" : undefined}
                rel={source.url.startsWith("http") ? "noreferrer" : undefined}
              >
                {source.title} <span aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  )}</Localize>;
}

function conceptLabel(id: string) {
  return chineseLabels[id.replace(/^pedagogy:/, "")] || id;
}
