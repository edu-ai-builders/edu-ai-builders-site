import { withSeo } from "@/app/seo/metadata";
import { getI18n } from "@/app/i18n/server";
import { translateData } from "@/app/i18n/core";
import Localize from "@/app/i18n/server-localize";
import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import DirectoryClient from "./directory-client";
import type { RadarCatalog } from "./model";
import "./directory.css";

const metadata: Metadata = { title: "开源资源", description: "找到可以试用、学习和改造的教育开源项目。按任务浏览工具、Skills、数据与基准，并查看来源和核验时间。" };

export default async function DirectoryPage({searchParams}: {searchParams: Promise<Record<string, string | string[] | undefined>>}) {
  const params = await searchParams;
  const catalog: RadarCatalog = JSON.parse(await readFile(path.join(process.cwd(), "public/data/radar/catalog.json"), "utf8"));
  return <Localize>{<DirectoryClient key={`${typeof params.q === "string" ? params.q : ""}:${typeof params.kind === "string" ? params.kind : ""}`} summary={catalog.summary} initialQuery={typeof params.q === "string" ? params.q : ""} initialKind={typeof params.kind === "string" ? params.kind : ""} />}</Localize>;
}

export async function generateMetadata() { const {t,locale}=await getI18n(); return withSeo(translateData(metadata,t), "/directory", locale); }
