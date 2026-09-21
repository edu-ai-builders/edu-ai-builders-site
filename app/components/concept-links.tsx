"use client";
import Localize from "@/app/i18n/localize";
import Link from "next/link";
import { chineseLabels } from "../atlas/model";

/** Which concepts this thing is connected to — the card's link back into the atlas. */
export default function ConceptLinks({
  conceptIds,
  label = "设计依据",
}: {
  conceptIds: string[];
  label?: string;
}) {
  const entries = conceptIds
    .map((id) => ({ id, label: chineseLabels[id.replace(/^pedagogy:/, "")] }))
    .filter((entry) => Boolean(entry.label))
    .slice(0, 3);
  if (!entries.length) return null;
  return <Localize>{(
    <div className="ea-concept-links">
      <span className="ea-concept-links-label">{label}</span>
      <ul>
        {entries.map((entry) => (
          <li key={entry.id}>
            <Link
              href={`/atlas?concept=${encodeURIComponent(entry.id)}&tab=understand`}
            >
              {entry.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )}</Localize>;
}
