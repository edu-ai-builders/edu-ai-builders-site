"use client";
import Localize from "@/app/i18n/localize";
import Link from "next/link";
import { useState } from "react";
import type { Course } from "@/app/content/courses";
export type CatalogCourse = Pick<
  Course,
  "slug" | "title" | "summary" | "audience"
> & { lessonCount: number };

const buildsOnAWebpage = (slug: string) =>
  ["web-interactions", "refactor-with-ai"].includes(slug);
const goals = [
  "全部课程",
  "设计学习活动",
  "用 AI 做出工具",
  "管理项目与协作",
] as const;
function goal(slug: string) {
  return slug === "learning-sciences-starter" ||
    slug === "personal-learning-assistant"
    ? goals[1]
    : ["github-starter", "refactor-with-ai"].includes(slug)
      ? goals[3]
      : goals[2];
}
export function CourseCover({ slug }: { slug: string }) {
  const type =
    slug === "learning-sciences-starter"
      ? "learning"
      : slug === "personal-learning-assistant"
        ? "assistant"
        : slug === "github-starter"
          ? "github"
          : slug === "refactor-with-ai"
            ? "refactor"
            : slug === "landing-page"
              ? "landing"
              : "web";
  return <Localize>{(
    <div className={`course-cover course-cover-${type}`} aria-hidden="true">
      {type === "learning" ? (
        <>
          <div className="cover-note">学生：“我看懂了。”</div>
          <div className="cover-switch">让学习看得见 ↓</div>
          <div className="cover-card">
            <b>换一道题，你会怎么解释？</b>
            <span>先尝试 → 看提示 → 再说明</span>
            <i>留下学习的证据</i>
          </div>
        </>
      ) : type === "assistant" ? (
        <>
          <div className="cover-bubble">能帮我理解这道题吗？</div>
          <div className="cover-bubble reply">先说说你已经知道什么。</div>
          <div className="cover-bubble">我试着解释一下……</div>
        </>
      ) : type === "github" ? (
        <>
          <div className="cover-git-title">改坏了，也能回去。</div>
          <div className="cover-git-line">
            <i>编辑</i>
            <span>→</span>
            <i>提交</i>
            <span>→</span>
            <i>推送</i>
          </div>
          <div className="cover-note">
            本地留住每一版 · 远端交给下一个人
          </div>
        </>
      ) : type === "refactor" ? (
        <>
          <div className="cover-code">{"function toggleHint() { … }"}</div>
          <div className="cover-tests">
            <span>✓ 首次打开</span>
            <span>✓ 再次收起</span>
            <span>✓ 键盘操作</span>
          </div>
          <div className="cover-note">整理实现，保留行为。</div>
        </>
      ) : (
        <>
          <div className="cover-browser">
            <div className="cover-browser-bar">
              ● ● ● <span>你的第一个作品</span>
            </div>
            <div className="cover-site">
              <b>
                {type === "landing"
                  ? "让学生说出理由。"
                  : "这段话的证据在哪里？"}
              </b>
              <div>
                <span>
                  {type === "landing"
                    ? "一眼看懂给谁用"
                    : "先想一想，再打开提示"}
                </span>
                <i>{type === "landing" ? "开始体验 →" : "查看线索 ＋"}</i>
              </div>
            </div>
          </div>
          <div className="cover-tags">
            <span>HTML</span>
            <span>CSS</span>
            <span>JavaScript</span>
          </div>
        </>
      )}
    </div>
  )}</Localize>;
}
export default function CourseCatalog({
  courses,
  startSlug,
}: {
  courses: CatalogCourse[];
  startSlug?: string;
}) {
  const [filter, setFilter] = useState<string>(goals[0]);
  const [level, setLevel] = useState("all");
  const visible = courses.filter(
    (c) =>
      (filter === goals[0] || goal(c.slug) === filter) &&
      (level === "all" ||
        (level === "beginner"
          ? !buildsOnAWebpage(c.slug)
          : buildsOnAWebpage(c.slug))),
  );
  return <Localize>{(
    <>
      <div className="course-catalog-filter" aria-label="按学习目标筛选">
        {goals.map((g) => (
          <button
            type="button"
            aria-pressed={filter === g}
            onClick={() => setFilter(g)}
            key={g}
          >
            {g}
          </button>
        ))}
      </div>
      <label className="course-level-filter">
        我的起点{" "}
        <select
          value={level}
          onChange={(event) => setLevel(event.target.value)}
        >
          <option value="all">所有起点</option>
          <option value="beginner">从基础开始</option>
          <option value="project">已经做出过一个</option>
        </select>
      </label>
      <p className="course-catalog-count" role="status">
        {visible.length} 门免费课程 · 每一门都做出一个能打开的东西
      </p>
      {visible.length === 0 && (
        <p className="course-no-results">
          这个组合还没有课程。试试其他学习目标或起点。
        </p>
      )}
      <section className="course-card-grid" aria-label="课程路线">
        {visible.map((course) => (
          <article className="course-card" key={course.slug}>
            <Link
              className="course-cover-link"
              href={`/learn/${course.slug}`}
              tabIndex={-1}
              aria-hidden="true"
            >
              <CourseCover slug={course.slug} />
            </Link>
            <div className="course-card-top">
              <span className="course-level">
                {course.slug === startSlug
                  ? "推荐起点 · 从这里开始"
                  : buildsOnAWebpage(course.slug)
                    ? "已经做出过一个 · 继续实践"
                    : "从基础开始"}
              </span>
              <span>{course.lessonCount} 节</span>
            </div>
            <div className="course-card-audience">
              <p className="course-who">写给：{course.audience.who}</p>
              <blockquote className="course-pain">
                “{course.audience.pain}”
              </blockquote>
            </div>
            <h2>
              <Link href={`/learn/${course.slug}`}>{course.title}</Link>
            </h2>
            <p>{course.summary}</p>
            <dl>
              <dt>学完你手里会有</dt>
              <dd>{course.audience.win}</dd>
            </dl>
            <div className="course-card-bottom">
              <span>免费 · 自定步调</span>
              <Link href={`/learn/${course.slug}`}>查看课程与练习 →</Link>
            </div>
          </article>
        ))}
      </section>
    </>
  )}</Localize>;
}
