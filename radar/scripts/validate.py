#!/usr/bin/env python3
"""Focused validation and data-quality reporting for the Radar registry."""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REQUIRED = {
    "schema_version",
    "record_key",
    "verification_status",
    "entity_kind",
    "first_seen",
    "last_seen",
    "provenance",
}
KINDS = {"repo", "dataset", "benchmark", "awesome_index", "unknown"}
STATUSES = {"unverified", "verified", "missing", "error"}


def load_registry(path: Path) -> list[dict]:
    records = []
    with path.open("r", encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, start=1):
            if not line.strip():
                continue
            try:
                records.append(json.loads(line))
            except json.JSONDecodeError as error:
                raise ValueError(f"invalid JSON at line {line_number}: {error}") from error
    return records


def markdown_report(records: list[dict], problems: list[str], generated_at: str) -> str:
    statuses = Counter(record["verification_status"] for record in records)
    kinds = Counter(record["entity_kind"] for record in records)
    verified = [record for record in records if record["verification_status"] == "verified"]
    missing_languages = sum(record.get("languages_status") != "complete" for record in verified)
    pending_releases = sum(record.get("latest_release_status") == "pending" for record in verified)
    missing_license = sum(not record.get("license_spdx") for record in verified)
    probable = sum(record.get("lead_match_status") == "probable" for record in verified)
    unresolved = [
        record.get("name") or record["record_key"]
        for record in records
        if record.get("verification_status") != "verified"
    ]
    lines = [
        "# GitHub Radar data quality report",
        "",
        f"- Generated: `{generated_at}`",
        f"- Total records: **{len(records)}**",
        f"- Verified GitHub repositories: **{len(verified)}**",
        f"- Unverified/error leads: **{len(records) - len(verified)}**",
        f"- Structural validation problems: **{len(problems)}**",
        "",
        "## Distribution",
        "",
        f"- Verification status: `{dict(sorted(statuses.items()))}`",
        f"- Entity kind: `{dict(sorted(kinds.items()))}`",
        "",
        "## Completeness and curator flags",
        "",
        f"- Verified records without complete language-byte metadata: **{missing_languages}**",
        f"- Verified records with release lookup still pending: **{pending_releases}**",
        f"- Verified records without a detected SPDX license: **{missing_license}**",
        f"- API-verified repositories whose user lead identity is only probable: **{probable}**",
        f"- Unresolved/error lead labels: `{unresolved}`",
        "",
        "A missing license or release is a valid observed state, not repaired data. A",
        "`probable` lead match confirms the GitHub repository metadata but still needs",
        "curator confirmation that it is the repository intended by the original lead.",
        "",
        "## Structural problems",
        "",
    ]
    if problems:
        lines.extend(f"- {problem}" for problem in problems)
    else:
        lines.append("- None.")
    lines.append("")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--registry", default=str(ROOT / "data" / "registry.jsonl"))
    parser.add_argument("--report")
    args = parser.parse_args()
    registry_path = Path(args.registry)
    records = load_registry(registry_path)
    problems = []
    keys = set()
    repo_ids = set()
    for index, record in enumerate(records, start=1):
        missing = REQUIRED - record.keys()
        if missing:
            problems.append(f"line {index}: missing {sorted(missing)}")
        key = record.get("record_key")
        if key in keys:
            problems.append(f"line {index}: duplicate record_key {key}")
        keys.add(key)
        if not re.match(r"^(repo:[0-9]+|lead:[a-z0-9-]+)$", key or ""):
            problems.append(f"line {index}: invalid record_key {key}")
        repo_id = record.get("github_repo_id")
        if repo_id is not None:
            if repo_id in repo_ids:
                problems.append(f"line {index}: duplicate github_repo_id {repo_id}")
            repo_ids.add(repo_id)
            if key != f"repo:{repo_id}":
                problems.append(f"line {index}: stable id and record_key disagree")
        if record.get("verification_status") not in STATUSES:
            problems.append(f"line {index}: invalid verification_status")
        if record.get("entity_kind") not in KINDS:
            problems.append(f"line {index}: invalid entity_kind")
        if record.get("verification_status") == "verified":
            for field in ("full_name", "html_url", "api_url", "clone_url", "fetched_at"):
                if not record.get(field):
                    problems.append(f"line {index}: verified record missing {field}")
    generated_at = (
        datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    )
    report = markdown_report(records, problems, generated_at)
    if args.report:
        report_path = Path(args.report)
        report_path.parent.mkdir(parents=True, exist_ok=True)
        temporary = report_path.with_suffix(report_path.suffix + ".tmp")
        temporary.write_text(report, encoding="utf-8")
        temporary.replace(report_path)
    print(report)
    return 1 if problems else 0


if __name__ == "__main__":
    raise SystemExit(main())
