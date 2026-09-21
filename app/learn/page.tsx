import { getI18n } from "@/app/i18n/server";
import { translateData } from "@/app/i18n/core";
import Localize from "@/app/i18n/server-localize";
import Link from "next/link";
import type { Metadata } from "next";
import { courses as originalCourses } from "@/app/content/courses";
import { localizeCourse } from "@/app/i18n/server";
import CourseCatalog from "./course-catalog";
import "./course.css";
const metadata: Metadata = {
  title: "学习 · 免费课程，现在就能开始",
  description:
    "面向老师、家长与教育产品创造者的免费课程。用 AI 从第一课开始，做出一个能打开、能给学生用的学习工具。",
};

// The one obvious front door. Everything on the first screen points here.
const START_SLUG = "vibe-coding-basics";

export default async function LearnPage() {
  const courses=await localizeCourse(originalCourses);
  const start = courses.find((course) => course.slug === START_SLUG);
  const firstLesson = start?.lessons[0];
  const lessonCount = courses.reduce((n, c) => n + c.lessons.length, 0);
  return <Localize>{(
    <main id="main-content" className="course-shell course-catalog-shell">
      <header className="course-index-header">
        <div className="course-index-pitch">
          <p className="course-eyebrow">免费 · 无需注册 · 不收费</p>
          <h1>
            {courses.length} 门免费课程，
            <br />
            <span>现在就能开始学。</span>
          </h1>
          <p className="course-lead">
            不用先学语法。每一节都和 AI
            一起做出一点能打开的东西，一节大约十五分钟。
          </p>
          {start && firstLesson && (
            <div className="course-start-actions">
              <Link
                className="course-start-primary"
                href={`/learn/${start.slug}?lesson=${encodeURIComponent(firstLesson.id)}#lesson-content`}
              >
                <b>从第一课开始</b>
                <small>第 1 节 · {firstLesson.title}</small>
              </Link>
              <Link className="course-start-secondary" href="/use">
                我只想找个现成工具 →
              </Link>
            </div>
          )}
          <p className="course-start-note">
            进度只保存在这台浏览器里，随时可以停下来，也随时可以跳到别的一门。
          </p>
        </div>
        <div className="course-index-shelf" aria-hidden="true">
          <div className="course-shelf-card">
            <span>第 1 节</span>
            <svg viewBox="0 0 200 112">
              <rect
                x="12"
                y="8"
                width="176"
                height="96"
                rx="10"
                fill="#fffdf9"
                stroke="#c3cebb"
              />
              <path d="M12 27h176" stroke="#dce3d3" />
              <circle cx="23" cy="18" r="2" fill="#9cae90" />
              <rect x="27" y="41" width="81" height="7" rx="3" fill="#99b399" />
              <rect
                x="27"
                y="56"
                width="132"
                height="5"
                rx="2"
                fill="#d4dfc8"
              />
              <rect
                x="27"
                y="75"
                width="55"
                height="17"
                rx="5"
                fill="#dde8d2"
              />
              <path d="m124 71 5 23 5-8 9-2Z" fill="#897e9f" stroke="#fff" />
            </svg>
            <b>做出一个能打开的工具</b>
            <i>约 15 分钟</i>
          </div>
          <div className="course-shelf-card">
            <span>第 5 节</span>
            <svg viewBox="0 0 200 112">
              <rect
                x="12"
                y="8"
                width="176"
                height="96"
                rx="10"
                fill="#fffdf9"
                stroke="#d3c5da"
              />
              <rect
                x="28"
                y="24"
                width="144"
                height="35"
                rx="7"
                fill="#eee6f4"
              />
              <circle cx="57" cy="41" r="10" fill="#ac96bc" />
              <rect x="78" y="35" width="62" height="5" rx="2" fill="#c4b2d4" />
              <path
                d="M28 82h144"
                stroke="#dacfe2"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M28 82h85"
                stroke="#9b84ad"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <circle
                cx="113"
                cy="82"
                r="8"
                fill="#fffdf9"
                stroke="#947ba8"
                strokeWidth="3"
              />
            </svg>
            <b>让它按你想的那样变化</b>
            <i>约 15 分钟</i>
          </div>
          <div className="course-shelf-card">
            <span>第 10 节</span>
            <svg viewBox="0 0 200 112">
              <rect
                x="61"
                y="3"
                width="78"
                height="107"
                rx="12"
                fill="#fffdf9"
                stroke="#ccb89b"
                strokeWidth="2"
              />
              <rect x="86" y="10" width="27" height="3" rx="2" fill="#d3c6b1" />
              <circle cx="100" cy="43" r="19" fill="#dfe9d6" />
              <path
                d="m90 42 7 7 14-15"
                fill="none"
                stroke="#7e9c6d"
                strokeWidth="3"
              />
              <rect x="74" y="72" width="52" height="5" rx="2" fill="#dfd4bc" />
              <rect
                x="79"
                y="85"
                width="42"
                height="12"
                rx="4"
                fill="#ecdfc8"
              />
            </svg>
            <b>交给学生也能用</b>
            <i>约 15 分钟</i>
          </div>
        </div>
      </header>
      <section className="course-index-band deep" aria-label="每节课怎么上">
        <p className="course-eyebrow">每一节都是同一个节奏</p>
        <div className="course-learning-loop">
          <div>
            <span>01</span>
            <strong>先预测</strong>
            <small>带着一个问题</small>
          </div>
          <i>→</i>
          <div>
            <span>02</span>
            <strong>动手试</strong>
            <small>看见选择带来的变化</small>
          </div>
          <i>→</i>
          <div>
            <span>03</span>
            <strong>说出原因</strong>
            <small>用在自己的作品里</small>
          </div>
        </div>
        <p className="course-band-meta">
          {courses.length} 门课 · {lessonCount} 节 · 全部免费，自定步调
        </p>
      </section>
      <CourseCatalog
        startSlug={START_SLUG}
        courses={courses.map(({ slug, title, summary, audience, lessons }) => ({
          slug,
          title,
          summary,
          audience,
          lessonCount: lessons.length,
        }))}
      />
      <p className="course-footnote">
        课程时间为阅读与初次练习的参考估计。练习记录只保存在当前浏览器；完成记录表示你的自我确认，不是掌握认证。
      </p>
    </main>
  )}</Localize>;
}

export async function generateMetadata() { const {t}=await getI18n(); return translateData(metadata,t); }
