import { getI18n } from "@/app/i18n/server";
import { translateData } from "@/app/i18n/core";
import Localize from "@/app/i18n/server-localize";
import type { Metadata } from "next";
import knowledge from "../../public/learning-sciences/0.2.0/rack.json";
import Explorer from "./explorer";
import type { Rack } from "./knowledge";
import "./styles.css";

const metadata: Metadata = {
  title: "Learning Sciences",
  description: "Explore 180 learning science concepts, instructional methods and design principles, with evidence, conditions, risks and source references.",
  alternates: { canonical: "https://edu-ai-builders.dev/learning-sciences" },
};

export default async function LearningSciences({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const initial = Object.fromEntries(Object.entries(params).filter(([, value]) => typeof value === "string")) as Record<string, string>;
  return <Localize>{<Explorer rack={knowledge as unknown as Rack} initial={initial} />}</Localize>;
}

export async function generateMetadata() { const {t}=await getI18n(); return translateData(metadata,t); }
