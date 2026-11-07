#!/usr/bin/env python3
"""Collect public SKILL.md manifest metadata without downloading skill packages.

The crawler reads only source repository metadata, the recursive Git tree, and
the YAML frontmatter of each public SKILL.md. It deliberately never stores the
instruction body, bundled scripts, assets, or references.
"""

from __future__ import annotations

import argparse
import base64
import json
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import quote
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
API_ROOT = "https://api.github.com"
USER_AGENT = "eduos-github-radar-skill-registry/0.1"


def now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def request_json(path: str, token: str | None) -> dict:
    headers = {"Accept": "application/vnd.github+json", "User-Agent": USER_AGENT}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    request = Request(f"{API_ROOT}{path}", headers=headers)
    try:
        with urlopen(request, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        body = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"GitHub API {error.code} for {path}: {body[:300]}") from error


def parse_frontmatter(markdown: str) -> tuple[str | None, str | None]:
    """Read only name and description from a conservative YAML frontmatter subset."""
    if not markdown.startswith("---"):
        return None, None
    closing = re.search(r"^---\s*$", markdown[3:], re.MULTILINE)
    if not closing:
        return None, None
    frontmatter = markdown[3 : 3 + closing.start()]
    fields: dict[str, str] = {}
    active: str | None = None
    for raw_line in frontmatter.splitlines():
        if re.match(r"^\s", raw_line) and active in {"description"}:
            fields[active] = f"{fields[active]} {raw_line.strip()}".strip()
            continue
        match = re.match(r"^(name|description):\s*(.*)$", raw_line)
        if not match:
            active = None
            continue
        active, value = match.groups()
        value = value.strip()
        fields[active] = '' if active == 'description' and value in {'|', '|-', '|+', '>', '>-', '>+'} else value.strip("\"'")
    return fields.get("name") or None, fields.get("description") or None


def manifest_text(owner: str, repo: str, path: str, ref: str, token: str | None) -> str:
    payload = request_json(
        f"/repos/{owner}/{repo}/contents/{quote(path, safe='/')}?ref={quote(ref, safe='')}", token
    )
    encoded = payload.get("content", "")
    if payload.get("encoding") != "base64" or not encoded:
        raise RuntimeError(f"missing base64 manifest content: {owner}/{repo}:{path}")
    return base64.b64decode(encoded).decode("utf-8", errors="replace")


def load_jsonl(path: Path) -> dict[str, dict]:
    if not path.exists():
        return {}
    records: dict[str, dict] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.strip():
            record = json.loads(line)
            records[record["skill_key"]] = record
    return records


def skill_record(source: dict, repo: dict, tree: list[dict], path: str, timestamp: str, token: str | None, prior: dict | None) -> dict:
    owner, repository = source["owner"], source["repo"]
    manifest = manifest_text(owner, repository, path, repo["default_branch"], token)
    skill_name, description = parse_frontmatter(manifest)
    directory = path.rsplit("/", 1)[0]
    descendants = [item["path"] for item in tree if item.get("path", "").startswith(f"{directory}/")]
    repo_id = repo["id"]
    key = f"github-skill:{repo_id}:{path}"
    encoded_path = quote(path, safe="/")
    return {
        "schema_version": "0.1",
        "skill_key": key,
        "verification_status": "verified",
        "source_repository": {
            "github_repo_id": repo_id,
            "full_name": repo["full_name"],
            "html_url": repo["html_url"],
            "api_url": repo["url"],
            "default_branch": repo["default_branch"],
            "license_spdx": (repo.get("license") or {}).get("spdx_id"),
            "stars": repo.get("stargazers_count"),
            "forks": repo.get("forks_count"),
            "updated_at": repo.get("updated_at"),
            "pushed_at": repo.get("pushed_at"),
        },
        "skill_name": skill_name or Path(directory).name,
        "description": description,
        "skill_path": path,
        "manifest_url": f"https://github.com/{repo['full_name']}/blob/{repo['default_branch']}/{encoded_path}",
        "raw_manifest_url": f"https://raw.githubusercontent.com/{repo['full_name']}/{repo['default_branch']}/{encoded_path}",
        "ecosystems": source["ecosystems"],
        "compatibility_confidence": source["compatibility_confidence"],
        "source_type": source["source_type"],
        "resource_hints": {
            "scripts": any(item.startswith(f"{directory}/scripts/") for item in descendants),
            "references": any(item.startswith(f"{directory}/references/") for item in descendants),
            "assets": any(item.startswith(f"{directory}/assets/") for item in descendants),
        },
        "first_seen": (prior or {}).get("first_seen", timestamp),
        "last_seen": timestamp,
        "fetched_at": timestamp,
        "provenance": [
            {
                "source": source["source_id"],
                "method": "github-rest-tree-plus-skill-frontmatter",
                "source_url": f"https://github.com/{repo['full_name']}",
                "observed_at": timestamp,
            }
        ],
    }


def inferred_ecosystems(path: str, fallback: list[str]) -> list[str]:
    """Infer only from a public folder convention; never assert runtime support."""
    normalized = path.casefold()
    ecosystems = set(fallback)
    if ".claude/" in normalized or "claude" in normalized:
        ecosystems.add("claude")
    if ".codex/" in normalized or "codex" in normalized:
        ecosystems.add("codex")
    return sorted(ecosystems)


def repository_and_tree(full_name: str, token: str | None, cache: dict[str, tuple[dict, list[dict]]]) -> tuple[dict, list[dict]]:
    if full_name in cache:
        return cache[full_name]
    owner, repository = full_name.split("/", 1)
    repo = request_json(f"/repos/{owner}/{repository}", token)
    tree = request_json(f"/repos/{owner}/{repository}/git/trees/{repo['default_branch']}?recursive=1", token).get("tree", [])
    cache[full_name] = (repo, tree)
    return repo, tree


def discover_from_queries(
    query_config: dict,
    selected_ids: set[str],
    query_limit: int | None,
    per_page: int,
    token: str | None,
    timestamp: str,
    prior: dict[str, dict],
) -> tuple[dict[str, dict], list[str]]:
    """Discover public community manifests through bounded GitHub code search."""
    discovered: dict[str, dict] = {}
    failures: list[str] = []
    cache: dict[str, tuple[dict, list[dict]]] = {}
    queries = [item for item in query_config["queries"] if not selected_ids or item["query_id"] in selected_ids]
    unknown = selected_ids - {item["query_id"] for item in queries}
    if unknown:
        raise ValueError(f"unknown query id(s): {sorted(unknown)}")
    for item in queries:
        if query_limit is not None and len(discovered) >= query_limit:
            break
        search_path = f"/search/code?q={quote(item['query'], safe=':')}&per_page={per_page}&page=1"
        try:
            results = request_json(search_path, token).get("items", [])
        except RuntimeError as error:
            failures.append(str(error))
            continue
        for result in results:
            if query_limit is not None and len(discovered) >= query_limit:
                break
            path = result.get("path", "")
            full_name = (result.get("repository") or {}).get("full_name")
            if not full_name or path.casefold() != "skill.md" and not path.casefold().endswith("/skill.md"):
                continue
            try:
                repo, tree = repository_and_tree(full_name, token, cache)
                source = {
                    "source_id": f"github-code-search:{item['query_id']}",
                    "owner": full_name.split("/", 1)[0],
                    "repo": full_name.split("/", 1)[1],
                    "ecosystems": inferred_ecosystems(path, item["ecosystems"]),
                    "compatibility_confidence": "inferred",
                    "source_type": "single_skill",
                }
                key = f"github-skill:{repo['id']}:{path}"
                record = skill_record(source, repo, tree, path, timestamp, token, prior.get(key))
                discovered[record["skill_key"]] = record
            except RuntimeError as error:
                failures.append(str(error))
    return discovered, failures


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sources", default=str(ROOT / "config" / "skill-sources.json"))
    parser.add_argument("--query-matrix", default=str(ROOT / "config" / "skill-query-matrix.json"))
    parser.add_argument("--registry", default=str(ROOT / "data" / "skills.jsonl"))
    parser.add_argument("--source", action="append", help="source_id to fetch; repeatable")
    parser.add_argument("--limit", type=int, help="maximum manifests fetched across selected sources")
    parser.add_argument("--delay", type=float, default=0.0, help="seconds between manifest requests")
    parser.add_argument("--discover", action="store_true", help="discover public community SKILL.md manifests with the query matrix")
    parser.add_argument("--query-id", action="append", help="query_id to use with --discover; repeatable")
    parser.add_argument("--query-limit", type=int, default=40, help="maximum community manifests fetched with --discover")
    parser.add_argument("--per-page", type=int, default=20, help="GitHub code-search results per query (1-100)")
    args = parser.parse_args()

    source_config = json.loads(Path(args.sources).read_text(encoding="utf-8"))
    wanted = set(args.source or [])
    sources = [item for item in source_config["sources"] if not wanted or item["source_id"] in wanted]
    missing_sources = wanted - {item["source_id"] for item in sources}
    if missing_sources:
        parser.error(f"unknown source id(s): {sorted(missing_sources)}")
    if not 1 <= args.per_page <= 100:
        parser.error("--per-page must be between 1 and 100")

    token = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN")
    registry_path = Path(args.registry)
    prior = load_jsonl(registry_path)
    refreshed: dict[str, dict] = {}
    timestamp = now()
    failures: list[str] = []

    for source in sources:
        owner, repository = source["owner"], source["repo"]
        try:
            repo = request_json(f"/repos/{owner}/{repository}", token)
            tree = request_json(f"/repos/{owner}/{repository}/git/trees/{repo['default_branch']}?recursive=1", token).get("tree", [])
        except RuntimeError as error:
            failures.append(str(error))
            continue
        prefix = f"{source['skill_root'].strip('/')}/"
        paths = [item["path"] for item in tree if item.get("type") == "blob" and item.get("path", "").startswith(prefix) and item["path"].lower().endswith("/skill.md")]
        for path in sorted(paths):
            if args.limit is not None and len(refreshed) >= args.limit:
                break
            try:
                record = skill_record(source, repo, tree, path, timestamp, token, prior.get(f"github-skill:{repo['id']}:{path}"))
                refreshed[record["skill_key"]] = record
            except RuntimeError as error:
                failures.append(str(error))
            if args.delay:
                time.sleep(args.delay)
        if args.limit is not None and len(refreshed) >= args.limit:
            break

    if args.discover:
        try:
            query_config = json.loads(Path(args.query_matrix).read_text(encoding="utf-8"))
            community_records, community_failures = discover_from_queries(
                query_config,
                set(args.query_id or []),
                args.query_limit,
                args.per_page,
                token,
                timestamp,
                prior,
            )
            refreshed.update(community_records)
            failures.extend(community_failures)
        except (OSError, ValueError, json.JSONDecodeError) as error:
            failures.append(str(error))

    retained = {key: record for key, record in prior.items() if key not in refreshed}
    merged = {**retained, **refreshed}
    registry_path.parent.mkdir(parents=True, exist_ok=True)
    temporary = registry_path.with_suffix(".jsonl.tmp")
    with temporary.open("w", encoding="utf-8") as handle:
        for record in sorted(merged.values(), key=lambda item: (item["source_repository"]["full_name"], item["skill_path"])):
            handle.write(json.dumps(record, ensure_ascii=False, separators=(",", ":")) + "\n")
    temporary.replace(registry_path)

    summary = {"records": len(merged), "refreshed": len(refreshed), "failures": failures, "authenticated": bool(token)}
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
