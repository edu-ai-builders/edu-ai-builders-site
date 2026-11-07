#!/usr/bin/env python3
"""Build a public, metadata-only Skills snapshot for the Radar website."""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

from review_resources import load_policy, review_resource


ROOT = Path(__file__).resolve().parents[1]

# Discovery intentionally keeps a high-recall private/local registry. The public
# Skills shelf is education-oriented, not a general-purpose skill marketplace.
# This gate is a transparent metadata match, not a claim that a skill produces
# learning outcomes or is pedagogically aligned.
EDUCATION_SKILL_SIGNAL = re.compile(
    r"educat|learn|teach|teacher|student|pedagog|curriculum|course|study|"
    r"research|academic|school|classroom|tutorial|explain|visuali[sz]|"
    r"web-artifact|vibecod|document|slide|presentation|pdf|spreadsheet|"
    r"教育|学习|教学|教师|学生|课程|课堂|研究|学术|可视化",
    re.IGNORECASE,
)


def is_public_education_skill(record: dict) -> bool:
    if review_resource(record, load_policy(ROOT))['status'] == 'exclude':
        return False
    searchable = " ".join(
        filter(
            None,
            [record.get("skill_name"), record.get("description"), record.get("skill_path")],
        )
    )
    return bool(EDUCATION_SKILL_SIGNAL.search(searchable))


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--registry", default=str(ROOT / "data" / "skills.jsonl"))
    parser.add_argument("--output", default=str(ROOT / "site" / "data" / "skills.json"))
    args = parser.parse_args()
    records = []
    registry = Path(args.registry)
    if registry.exists():
        records = [json.loads(line) for line in registry.read_text(encoding="utf-8").splitlines() if line.strip()]
    policy = load_policy(ROOT)
    visible_records = [{**record, 'review': review_resource(record, policy)}
                       for record in records if is_public_education_skill(record)]
    visible_records.sort(key=lambda item: (item.get("source_repository", {}).get("full_name", "").casefold(), (item.get("skill_name") or "").casefold()))
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "generated_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "count": len(visible_records),
        "registry_count": len(records),
        "counts": {
            "ecosystems": dict(Counter(ecosystem for record in visible_records for ecosystem in record.get("ecosystems", []))),
            "sources": dict(Counter(record.get("source_repository", {}).get("full_name") for record in visible_records)),
        },
        "collection_note": "Education and builder discovery metadata: public SKILL.md frontmatter and repository metadata. Query facets are hints, not verified capabilities or teaching quality. No instruction bodies, scripts, or skill packages are stored.",
        "records": visible_records,
    }
    temporary = output.with_suffix(".json.tmp")
    temporary.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    temporary.replace(output)
    print(f"wrote {len(visible_records)} public education Skill records from {len(records)} registry records to {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
