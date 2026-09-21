import { localizeCourse } from "@/app/i18n/server";
import Localize from "@/app/i18n/server-localize";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { courses } from "@/app/content/courses";
import CourseClient from "../course-client";
import "../course.css";

export function generateStaticParams() {
  return courses.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const source = courses.find((item) => item.slug === slug);
  const course = source ? await localizeCourse(source) : undefined;
  return {
    title: course ? course.title : "课程未找到",
    description: course?.summary,
  };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const source = courses.find((item) => item.slug === slug);
  const course = source ? await localizeCourse(source) : undefined;
  if (!course) notFound();
  return <Localize>{(
    <Suspense
      fallback={
        <main id="main-content" className="course-shell">
          <h1>{course.title}</h1>
          <p>正在打开课程路线…</p>
        </main>
      }
    >
      <CourseClient
        course={course}
        validLessons={Object.fromEntries(
          courses.map((item) => [
            item.slug,
            item.lessons.map((lesson) => lesson.id),
          ]),
        )}
      />
    </Suspense>
  )}</Localize>;
}
