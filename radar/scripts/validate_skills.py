#!/usr/bin/env python3
"""Validate the metadata-only Skills registry and emit a compact quality report."""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REQUIRED = {"schema_version", "skill_key", "verification_status", "source_repository", "skill_path", "manifest_url", "first_seen", "last_seen", "fetched_at", "provenance"}


def load(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def report(records: list[dict], problems: list[str], timestamp: str) -> str:
    source_counts = Counter(record["source_repository"]["full_name"] for record in records)
    ecosystems = Counter(ecosystem for record in records for ecosystem in record.get("ecosystems", []))
    confidence = Counter(record.get("compatibility_confidence") for record in records)
    hints = {hint: sum(bool(record.get("resource_hints", {}).get(hint)) for record in records) for hint in ("scripts", "references", "assets")}
    return "\n".join([
        "# Education Skills Radar data quality report",
        "",
        f"- Generated: `{timestamp}`",
        f"- Total metadata records: **{len(records)}**",
        f"- Structural validation problems: **{len(problems)}**",
        "",
        "## Source distribution",
        "",
        f"- Source repositories: `{dict(sorted(source_counts.items()))}`",
        f"- Ecosystem labels: `{dict(sorted(ecosystems.items()))}`",
        f"- Compatibility confidence: `{dict(sorted(confidence.items()))}`",
        f"- Resource hints: `{hints}`",
        "",
        "## Collection boundary",
        "",
        "Records contain only public SKILL.md frontmatter, source-repository metadata,",
        "and directory-structure hints. They do not store a skill body, scripts, assets,",
        "or references. `inferred` compatibility comes from public path/query context and",
        "is not a guarantee that a skill works in an agent runtime.",
        "",
        "## Structural problems",
        "",
        *(problems or ["- None."]),
        "",
    ])


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--registry", default=str(ROOT / "data" / "skills.jsonl"))
    parser.add_argument("--report")
    args = parser.parse_args()
    records = load(Path(args.registry))
    problems: list[str] = []
    seen: set[str] = set()
    for index, record in enumerate(records, start=1):
        missing = REQUIRED - record.keys()
        if missing:
            problems.append(f"line {index}: missing {sorted(missing)}")
        key = record.get("skill_key", "")
        if key in seen:
            problems.append(f"line {index}: duplicate skill_key {key}")
        seen.add(key)
        if not re.match(r"^github-skill:[0-9]+:(?:.+/)?skill\.md$", key, re.IGNORECASE):
            problems.append(f"line {index}: invalid skill_key {key}")
        source = record.get("source_repository") or {}
        if not isinstance(source.get("github_repo_id"), int) or not source.get("full_name"):
            problems.append(f"line {index}: invalid source repository")
        for field in ("manifest_url", "raw_manifest_url"):
            value = record.get(field, "")
            if not value.startswith("https://"):
                problems.append(f"line {index}: missing secure {field}")
        if record.get("verification_status") != "verified":
            problems.append(f"line {index}: non-verified record retained without a review state")
        description = record.get("description") or ""
        if len(description) > 4000:
            problems.append(f"line {index}: description exceeds frontmatter safety bound")
        forbidden = {"instruction_body", "skill_body", "script_contents", "asset_contents"} & record.keys()
        if forbidden:
            problems.append(f"line {index}: prohibited content fields {sorted(forbidden)}")
    timestamp = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    output = report(records, problems, timestamp)
    if args.report:
        report_path = Path(args.report)
        report_path.parent.mkdir(parents=True, exist_ok=True)
        report_path.write_text(output, encoding="utf-8")
    print(output)
    return 1 if problems else 0


if __name__ == "__main__":
    raise SystemExit(main())
