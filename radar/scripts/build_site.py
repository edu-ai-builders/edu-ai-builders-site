#!/usr/bin/env python3
"""Export the compact JSONL registry into the dependency-free static site."""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

import crawl
from review_resources import load_policy, review_resource


ROOT = Path(__file__).resolve().parents[1]

# The crawler is deliberately high-recall. The public Radar needs a conservative,
# metadata-only inclusion gate so a transient search match does not become a
# featured education project. This is not source-code or capability analysis.
EDUCATION_SIGNAL = re.compile(
    r"educat|edtech|teach|teacher|classroom|school|student|curriculum|"
    r"courseware|learning management|\blms\b|k[- ]?12|tutor|assessment|quiz|"
    r"exam|homework|textbook|flashcard|spaced repetition|pedagog|literacy|"
    r"教育|教学|学习|课程|课堂|教师|学生|教材|备课|题库|考试|学校|知识图谱",
    re.IGNORECASE,
)


def is_public_radar_record(record: dict) -> bool:
    """Keep a public education-facing view of the wider discovery registry."""
    if record.get("verification_status") in {"missing", "error"}:
        return False
    if any(item.get("lead_id") for item in record.get("provenance", [])):
        return True
    searchable = " ".join(
        filter(
            None,
            [
                record.get("full_name"),
                record.get("description"),
                " ".join(record.get("topics") or []),
            ],
        )
    )
    return bool(EDUCATION_SIGNAL.search(searchable))


def public_record(record: dict) -> dict:
    """Allowlist public fields; never publish local paths or internal source refs."""
    return {
        "github_repo_id": record.get("github_repo_id"),
        "owner": {
            "login": (record.get("owner") or {}).get("login"),
            "html_url": (record.get("owner") or {}).get("html_url"),
        }
        if record.get("owner")
        else None,
        "name": record.get("name"),
        "full_name": record.get("full_name"),
        "html_url": record.get("html_url"),
        "homepage": record.get("homepage"),
        # Filled only by a future scheduled screenshot cache, never by a public
        # page request. Omit it until a provider and retention policy are set.
        "homepage_screenshot_url": record.get("homepage_screenshot_url"),
        "description": record.get("description"),
        "topics": record.get("topics", []),
        "languages": record.get("languages", {}),
        "languages_status": record.get("languages_status"),
        "primary_language": record.get("primary_language"),
        "metrics": record.get("metrics", {}),
        "license_spdx": record.get("license_spdx"),
        "default_branch": record.get("default_branch"),
        "created_at": record.get("created_at"),
        "updated_at": record.get("updated_at"),
        "pushed_at": record.get("pushed_at"),
        "latest_release": record.get("latest_release"),
        "latest_release_status": record.get("latest_release_status"),
        "archived": record.get("archived"),
        "fork": record.get("fork"),
        "is_template": record.get("is_template"),
        "verification_status": record.get("verification_status"),
        "lead_match_status": record.get("lead_match_status"),
        "entity_kind": crawl.infer_kind(record),
        "artifact_kind": crawl.classify_resource(record)["artifact_kind"],
        "review": review_resource(record, load_policy(ROOT)),
        "gold_seed": bool(record.get("gold_seed")),
        "first_seen": record.get("first_seen"),
        "last_seen": record.get("last_seen"),
        "fetched_at": record.get("fetched_at"),
        "discovery_sources": sorted(
            {
                item.get("source")
                for item in record.get("provenance", [])
                if item.get("source")
            }
        ),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--registry", default=str(ROOT / "data" / "registry.jsonl"))
    parser.add_argument("--output", default=str(ROOT / "site" / "data" / "registry.json"))
    args = parser.parse_args()
    registry_path = Path(args.registry)
    records = []
    if registry_path.exists():
        with registry_path.open("r", encoding="utf-8") as handle:
            records = [json.loads(line) for line in handle if line.strip()]
    records.sort(
        key=lambda record: (
            -(record.get("metrics", {}).get("stars") or -1),
            (record.get("full_name") or record.get("name") or "").casefold(),
        )
    )
    policy = load_policy(ROOT)
    visible_records = [record for record in records if is_public_radar_record(record)
                       and review_resource(record, policy)['status'] != 'exclude']
    public_records = [public_record(record) for record in visible_records]
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "generated_at": datetime.now(timezone.utc)
        .replace(microsecond=0)
        .isoformat()
        .replace("+00:00", "Z"),
        "count": len(visible_records),
        "registry_count": len(records),
        "counts": {
            "verification_status": dict(Counter(record["verification_status"] for record in visible_records)),
            "entity_kind": dict(Counter(record["entity_kind"] for record in public_records)),
        },
        "records": public_records,
    }
    temporary = output_path.with_suffix(".json.tmp")
    with temporary.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, separators=(",", ":"))
        handle.write("\n")
    temporary.replace(output_path)
    print(f"wrote {len(visible_records)} public records from {len(records)} registry records to {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
