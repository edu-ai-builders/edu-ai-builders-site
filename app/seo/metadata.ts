import type { Metadata } from "next";

// Keep aligned with the existing production domain; preview hosting is separate.
export const SITE_URL = "https://edu-ai-builders.dev";
export const SITE_NAME = "Edu AI Builders";

const pageTitles: Partial<Record<string, { zh: string; en: string }>> = {
  "/learn": { zh: "免费 AI 编程与学习科学课程", en: "Free AI Coding and Learning Science Courses" },
  "/use": { zh: "免费互动教学工具与数学可视化", en: "Free Interactive Teaching Tools and Math Visualizations" },
  "/build": { zh: "教育 AI Skills、组件与教学设计资源", en: "Education AI Skills, Components and Learning Design Resources" },
  "/atlas": { zh: "学习科学概念地图 Atlas", en: "Learning Science Concept Atlas" },
  "/directory": { zh: "教育 AI 开源项目与工具目录", en: "Open Source Education AI Projects and Tools" },
  "/learning-sciences": { zh: "学习科学知识库：原理、证据与教学设计", en: "Learning Science Knowledge Base: Evidence and Learning Design" },
};

export function withSeo(metadata: Metadata, path: string, locale = "zh"): Metadata {
  const localizedMetadata = { ...metadata, title: pageTitles[path]?.[locale === "en" ? "en" : "zh"] ?? metadata.title };
  const title = typeof localizedMetadata.title === "string" ? localizedMetadata.title
    : localizedMetadata.title && "default" in localizedMetadata.title ? localizedMetadata.title.default
    : localizedMetadata.title && "absolute" in localizedMetadata.title ? localizedMetadata.title.absolute : SITE_NAME;
  const url = new URL(path, SITE_URL).toString();
  return {
    ...localizedMetadata,
    metadataBase: new URL(SITE_URL),
    alternates: { ...metadata.alternates, canonical: url },
    openGraph: {
      type: "website", siteName: SITE_NAME, url, title,
      description: metadata.description ?? undefined,
      locale: locale === "en" ? "en_US" : "zh_CN",
      ...metadata.openGraph,
    },
    twitter: { card: "summary", title, description: metadata.description ?? undefined, ...metadata.twitter },
  };
}
