import { getI18n } from "@/app/i18n/server";
import { translateData } from "@/app/i18n/core";
import Localize from "@/app/i18n/server-localize";
import type { Metadata } from "next";
import knowledge from "../../public/learning-sciences/0.2.0/rack.json";
import type { Rack } from "../learning-sciences/knowledge";
import AtlasClient from "./atlas-client";
import { courses as originalCourses } from "../content/courses";
import { localizeCourse } from "../i18n/server";
import "./atlas.css";
const metadata: Metadata = {
  title: "学习科学地图",
  description: "学生看懂却不会用、依赖提示、反馈后不知怎样改？从具体学习问题出发，看见学习科学如何改变练习、提示与反馈设计。",
  alternates: { canonical: "https://edu-ai-builders.dev/atlas" },
};
export default async function AtlasPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const courses=await localizeCourse(originalCourses);
  const params = await searchParams;
  const concept = typeof params.concept === "string" ? params.concept : undefined;
  const topic = typeof params.topic === "string" ? params.topic : undefined;
  const tab = typeof params.tab === "string" ? params.tab : undefined;
  return <Localize>{<AtlasClient key={`${concept || topic || "default"}:${tab || "understand"}`} rack={knowledge as unknown as Rack} courses={courses.map(({slug,title,summary,conceptIds,lessons}) => ({slug,title,summary,conceptIds,lessonCount:lessons.length}))} initialConcept={concept} initialTopic={topic} initialTab={tab} />}</Localize>;
}

export async function generateMetadata() { const {t}=await getI18n(); return translateData(metadata,t); }
