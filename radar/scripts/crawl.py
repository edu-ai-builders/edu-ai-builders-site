#!/usr/bin/env python3
"""Metadata-only GitHub Radar crawler.

Uses GitHub REST endpoints only. It never clones repositories and never writes
to the eduos substrate corpus.
"""

from __future__ import annotations

import argparse
import json
import os
import random
import re
import shutil
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_REGISTRY = ROOT / "data" / "registry.jsonl"
DEFAULT_CACHE = ROOT / "state" / "http-cache.json"
API_ROOT = "https://api.github.com"
SCHEMA_VERSION = "github-radar.registry.v1"


class GitHubAPIError(RuntimeError):
    """Carry HTTP status without interpreting 404 as proof of deletion."""
    def __init__(self, status: int, url: str, message: str):
        self.status = status
        super().__init__(f"GitHub API {status} for {url}: {message[:500]}")


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def read_json(path: Path):
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def write_json(path: Path, value) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    with temporary.open("w", encoding="utf-8") as handle:
        json.dump(value, handle, ensure_ascii=False, indent=2, sort_keys=True)
        handle.write("\n")
    temporary.replace(path)


def append_unique(items: list[dict], item: dict) -> list[dict]:
    identity = (
        item.get("source"),
        item.get("source_ref"),
        item.get("query_id"),
        item.get("lead_id"),
    )
    for existing in items:
        existing_identity = (
            existing.get("source"),
            existing.get("source_ref"),
            existing.get("query_id"),
            existing.get("lead_id"),
        )
        if identity == existing_identity:
            existing["last_seen"] = item.get("last_seen", existing.get("last_seen"))
            return items
    items.append(item)
    return items


class Registry:
    def __init__(self, path: Path):
        self.path = path
        self.records: dict[str, dict] = {}
        if path.exists():
            with path.open("r", encoding="utf-8") as handle:
                for line_number, line in enumerate(handle, start=1):
                    if not line.strip():
                        continue
                    record = json.loads(line)
                    key = record["record_key"]
                    if key in self.records:
                        raise ValueError(f"duplicate record_key {key} at line {line_number}")
                    self.records[key] = record

    def ensure_lead(self, seed: dict, now: str) -> dict:
        key = f"lead:{seed['lead_id']}"
        record = self.records.get(key)
        provenance = {
            "source": seed["source"],
            "source_ref": seed.get("source_ref"),
            "lead_id": seed["lead_id"],
            "query_id": None,
            "first_seen": record.get("first_seen", now) if record else now,
            "last_seen": now,
        }
        if record is None:
            record = {
                "schema_version": SCHEMA_VERSION,
                "record_key": key,
                "github_repo_id": None,
                "github_node_id": None,
                "owner": None,
                "name": seed["label"],
                "full_name": seed.get("full_name"),
                "html_url": None,
                "api_url": None,
                "clone_url": None,
                "homepage": None,
                "description": None,
                "topics": [],
                "languages": {},
                "languages_status": "pending",
                "metrics": {},
                "license_spdx": None,
                "default_branch": None,
                "created_at": None,
                "updated_at": None,
                "pushed_at": None,
                "latest_release": None,
                "latest_release_status": "pending",
                "archived": None,
                "fork": None,
                "is_template": None,
                "verification_status": "unverified",
                "lead_match_status": "unresolved",
                "entity_kind": seed.get("kind_hint", "unknown"),
                "gold_seed": bool(seed.get("gold_seed")),
                "first_seen": now,
                "last_seen": now,
                "fetched_at": None,
                "checked_at": None,
                "provenance": [provenance],
                "notes": seed.get("notes"),
            }
            self.records[key] = record
        else:
            record["last_seen"] = now
            record["provenance"] = append_unique(record.get("provenance", []), provenance)
        return record

    def upsert_repo(self, incoming: dict, provenance: dict, lead_key: str | None = None) -> dict:
        key = incoming["record_key"]
        previous = self.records.get(key, {})
        if previous.get("languages_status") == "complete" and incoming.get(
            "languages_status"
        ) != "complete":
            incoming["languages"] = previous.get("languages", {})
            incoming["languages_status"] = "complete"
        if previous.get("latest_release_status") in {"complete", "none"} and incoming.get(
            "latest_release_status"
        ) not in {"complete", "none"}:
            incoming["latest_release"] = previous.get("latest_release")
            incoming["latest_release_status"] = previous["latest_release_status"]
        if previous.get("metrics", {}).get("subscribers_count") is not None:
            incoming.setdefault("metrics", {})["subscribers_count"] = previous["metrics"][
                "subscribers_count"
            ]
        if lead_key and lead_key in self.records:
            lead = self.records.pop(lead_key)
            previous_provenance = lead.get("provenance", []) + previous.get("provenance", [])
            incoming["first_seen"] = min(
                lead.get("first_seen", incoming["first_seen"]),
                previous.get("first_seen", incoming["first_seen"]),
            )
            incoming["gold_seed"] = bool(lead.get("gold_seed") or previous.get("gold_seed"))
            incoming["notes"] = lead.get("notes") or previous.get("notes")
        else:
            previous_provenance = previous.get("provenance", [])
            incoming["first_seen"] = previous.get("first_seen", incoming["first_seen"])
            incoming["gold_seed"] = bool(previous.get("gold_seed", incoming.get("gold_seed")))
            incoming["notes"] = previous.get("notes", incoming.get("notes"))
        incoming["provenance"] = previous_provenance
        incoming["provenance"] = append_unique(incoming["provenance"], provenance)
        self.records[key] = incoming
        return incoming

    def save(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        temporary = self.path.with_suffix(".jsonl.tmp")

        def sort_key(record: dict):
            repo_id = record.get("github_repo_id")
            return (0, repo_id) if repo_id else (1, record["record_key"])

        with temporary.open("w", encoding="utf-8") as handle:
            for record in sorted(self.records.values(), key=sort_key):
                handle.write(json.dumps(record, ensure_ascii=False, sort_keys=True))
                handle.write("\n")
        temporary.replace(self.path)


class GitHubClient:
    def __init__(self, args):
        self.token = os.getenv("GITHUB_TOKEN") or os.getenv("GH_TOKEN")
        self.version = os.getenv("GITHUB_API_VERSION", "2026-03-10")
        self.user_agent = os.getenv("GITHUB_USER_AGENT", "eduos-github-radar/0.1")
        self.cache_path = Path(args.cache)
        self.cache = read_json(self.cache_path) if self.cache_path.exists() else {}
        self.max_retries = args.max_retries
        self.max_wait = args.max_wait
        self.request_interval = args.request_interval
        self.search_interval = args.search_interval
        if self.search_interval is None:
            self.search_interval = 2.1 if self.token else 6.2
        self.last_request_at = 0.0
        self.last_search_at = 0.0
        self.request_count = 0
        self.not_modified_count = 0

    def _headers(self, url: str, conditional: bool) -> dict[str, str]:
        headers = {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": self.version,
            "User-Agent": self.user_agent,
        }
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        if conditional:
            cached = self.cache.get(url, {})
            if cached.get("etag"):
                headers["If-None-Match"] = cached["etag"]
            elif cached.get("last_modified"):
                headers["If-Modified-Since"] = cached["last_modified"]
        return headers

    def _throttle(self, is_search: bool) -> None:
        now = time.monotonic()
        minimum = self.request_interval - (now - self.last_request_at)
        if minimum > 0:
            time.sleep(minimum)
        if is_search:
            now = time.monotonic()
            search_wait = self.search_interval - (now - self.last_search_at)
            if search_wait > 0:
                time.sleep(search_wait)

    def request_json(
        self,
        path_or_url: str,
        *,
        conditional: bool = False,
        expected_404: bool = False,
    ):
        url = path_or_url if path_or_url.startswith("http") else API_ROOT + path_or_url
        is_search = urllib.parse.urlsplit(url).path.startswith("/search/")
        for attempt in range(self.max_retries + 1):
            self._throttle(is_search)
            request = urllib.request.Request(url, headers=self._headers(url, conditional))
            self.last_request_at = time.monotonic()
            if is_search:
                self.last_search_at = self.last_request_at
            try:
                with urllib.request.urlopen(request, timeout=30) as response:
                    self.request_count += 1
                    raw = response.read()
                    headers = {key.lower(): value for key, value in response.headers.items()}
                    self.cache[url] = {
                        "etag": headers.get("etag"),
                        "last_modified": headers.get("last-modified"),
                        "checked_at": utc_now(),
                    }
                    write_json(self.cache_path, self.cache)
                    return json.loads(raw) if raw else None, headers, response.status
            except urllib.error.HTTPError as error:
                self.request_count += 1
                headers = {key.lower(): value for key, value in error.headers.items()}
                if error.code == 304:
                    self.not_modified_count += 1
                    self.cache.setdefault(url, {})["checked_at"] = utc_now()
                    write_json(self.cache_path, self.cache)
                    return None, headers, 304
                if error.code == 404 and expected_404:
                    return None, headers, 404
                if error.code not in (403, 429, 500, 502, 503, 504) or attempt >= self.max_retries:
                    message = error.read().decode("utf-8", errors="replace")
                    raise GitHubAPIError(error.code, url, message) from error
                wait_seconds = self._retry_wait(headers, attempt)
                if wait_seconds > self.max_wait:
                    raise RuntimeError(
                        f"GitHub API asked to wait {wait_seconds:.1f}s for {url}; "
                        f"max allowed is {self.max_wait:.1f}s"
                    ) from error
                time.sleep(wait_seconds)
            except urllib.error.URLError as error:
                if attempt >= self.max_retries:
                    raise RuntimeError(f"GitHub API network error for {url}: {error}") from error
                time.sleep(min(self.max_wait, (2**attempt) + random.random()))
        raise AssertionError("unreachable")

    def _retry_wait(self, headers: dict[str, str], attempt: int) -> float:
        if headers.get("retry-after"):
            return max(0.0, float(headers["retry-after"]))
        if headers.get("x-ratelimit-remaining") == "0" and headers.get("x-ratelimit-reset"):
            return max(0.0, float(headers["x-ratelimit-reset"]) - time.time() + 1.0)
        if headers.get("date"):
            try:
                parsedate_to_datetime(headers["date"])
            except (TypeError, ValueError):
                pass
        return max(60.0, (2**attempt) + random.random())


def infer_kind(repo: dict, kind_hint: str | None = None) -> str:
    # Query hints describe how we found a repository, not what it contains.
    name = (repo.get("name") or "").casefold()
    description = (repo.get("description") or "").casefold()
    topics = {topic.casefold() for topic in repo.get("topics", [])}
    if name.startswith("awesome-") or "awesome-list" in topics or re.search(r"\b(?:collective|curated) list of\b", description):
        return "awesome_index"
    if re.search(r"(?:^|[-_ ])(?:benchmark|bench)(?:$|[-_ ])", name) or {"benchmark", "benchmarks"} & topics:
        return "benchmark"
    if re.search(r"(?:^|[-_ ])(?:datasets?|corpus|corpora)(?:$|[-_ ])", name) or {"dataset", "datasets", "corpus"} & topics:
        return "dataset"
    if re.search(r"\b(?:application|app|platform|framework|library|toolkit|sdk|server|system)\b|管理系统|应用平台", description):
        return "repo"
    if re.search(r"\bbenchmarks?\b|评测基准", description):
        return "benchmark"
    if re.search(r"\bdatasets?\b|\bcorpus\b|数据集|语料库", description):
        return "dataset"
    return "repo"


def classify_resource(record: dict, selected: dict | None = None) -> dict:
    selected = selected or {}
    kind = "skill" if record.get("skill_key") else infer_kind(record)
    evidence = ["manifest:SKILL.md-frontmatter" if kind == "skill" else "metadata:name-description-topics"]
    if selected.get("kind") in {"dataset", "benchmark", "skill"}:
        kind = selected["kind"]
        evidence = ["curated:" + selected["resource_key"]]
    artifact = {"skill": "skill", "dataset": "dataset", "benchmark": "benchmark", "awesome_index": "index"}.get(kind)
    if artifact is None:
        mode = selected.get("quick_start", {}).get("mode")
        name = (record.get("name") or record.get("full_name") or "").casefold()
        description = (record.get("description") or "").casefold()
        topics = set(record.get("topics") or [])
        if mode in {"course", "library"}:
            artifact = "knowledge" if mode == "course" else "library"
            evidence = ["curated:" + selected["resource_key"] + ":quick_start.mode"]
        elif re.search(r"\b(?:framework|library|sdk|toolkit)\b", description):
            artifact = "library"
        elif re.search(r"\b(?:application|app|platform|server|system)\b|管理系统|应用平台", description):
            artifact = "application"
        elif re.search(r"(?:^|[-_ ])(?:books?|textbooks?|courses?|tutorials?|lessons?|curriculum)(?:$|[-_ ])", name) or re.search(r"\b(?:open book|textbook|course on|lessons?[, :]|tutorials? for)\b|开源教材|开放教材|课程教材|知识图谱资源", description) or topics & {"textbook", "open-textbook", "course", "ebook", "book"}:
            artifact = "knowledge"
        else:
            artifact = "repository"
    return {"kind": "knowledge" if artifact == "knowledge" else kind,
            "artifact_kind": artifact, "classification_evidence": evidence}


def release_record(release: dict | None):
    if not release:
        return None
    return {
        "id": release.get("id"),
        "tag_name": release.get("tag_name"),
        "name": release.get("name"),
        "html_url": release.get("html_url"),
        "created_at": release.get("created_at"),
        "published_at": release.get("published_at"),
    }


def record_from_repo(
    repo: dict,
    *,
    now: str,
    languages: dict | None,
    languages_status: str,
    release: dict | None,
    release_status: str,
    kind_hint: str | None,
    lead_match_status: str = "not_applicable",
) -> dict:
    owner = repo.get("owner") or {}
    license_data = repo.get("license") or {}
    return {
        "schema_version": SCHEMA_VERSION,
        "record_key": f"repo:{repo['id']}",
        "github_repo_id": repo["id"],
        "github_node_id": repo.get("node_id"),
        "owner": {
            "github_owner_id": owner.get("id"),
            "login": owner.get("login"),
            "type": owner.get("type"),
            "html_url": owner.get("html_url"),
        },
        "name": repo.get("name"),
        "full_name": repo.get("full_name"),
        "html_url": repo.get("html_url"),
        "api_url": repo.get("url"),
        "clone_url": repo.get("clone_url"),
        "homepage": repo.get("homepage") or None,
        "description": repo.get("description"),
        "topics": sorted(repo.get("topics") or []),
        "languages": languages or {},
        "languages_status": languages_status,
        "primary_language": repo.get("language"),
        "metrics": {
            "stars": repo.get("stargazers_count"),
            "forks": repo.get("forks_count"),
            "github_watchers_count": repo.get("watchers_count"),
            "subscribers_count": repo.get("subscribers_count"),
            "open_issues": repo.get("open_issues_count"),
        },
        "license_spdx": license_data.get("spdx_id") if license_data else None,
        "default_branch": repo.get("default_branch"),
        "created_at": repo.get("created_at"),
        "updated_at": repo.get("updated_at"),
        "pushed_at": repo.get("pushed_at"),
        "latest_release": release_record(release),
        "latest_release_status": release_status,
        "archived": repo.get("archived"),
        "fork": repo.get("fork"),
        "is_template": repo.get("is_template"),
        "verification_status": "verified",
        "lead_match_status": lead_match_status,
        "entity_kind": infer_kind(repo, kind_hint),
        "gold_seed": False,
        "first_seen": now,
        "last_seen": now,
        "fetched_at": now,
        "checked_at": now,
        "provenance": [],
        "notes": None,
    }


def hydrate_repo(
    client: GitHubClient,
    full_name: str,
    *,
    kind_hint: str | None,
    lead_match_status: str,
    conditional: bool = False,
):
    encoded_name = "/".join(urllib.parse.quote(part, safe="") for part in full_name.split("/", 1))
    repo, _, status = client.request_json(f"/repos/{encoded_name}", conditional=conditional)
    if status == 304:
        return None
    languages, _, language_status_code = client.request_json(
        f"/repos/{encoded_name}/languages",
        conditional=conditional,
    )
    release, _, release_status_code = client.request_json(
        f"/repos/{encoded_name}/releases/latest",
        conditional=conditional,
        expected_404=True,
    )
    return record_from_repo(
        repo,
        now=utc_now(),
        languages=languages,
        languages_status="complete" if language_status_code == 200 else "error",
        release=release,
        release_status="complete" if release_status_code == 200 else "none",
        kind_hint=kind_hint,
        lead_match_status=lead_match_status,
    )


def make_provenance(
    *,
    source: str,
    source_ref: str | None,
    query_id: str | None = None,
    lead_id: str | None = None,
    first_seen: str,
    last_seen: str,
) -> dict:
    return {
        "source": source,
        "source_ref": source_ref,
        "query_id": query_id,
        "lead_id": lead_id,
        "first_seen": first_seen,
        "last_seen": last_seen,
    }


def command_seed(args, registry: Registry, client: GitHubClient) -> dict:
    all_seeds = read_json(Path(args.seeds))
    seeds = all_seeds
    if args.only:
        requested = set(args.only.split(","))
        seeds = [seed for seed in seeds if seed["lead_id"] in requested]
    if args.limit is not None:
        seeds = seeds[: args.limit]
    now = utc_now()
    verified_by_full_name = {
        (record.get("full_name") or "").casefold(): record
        for record in registry.records.values()
        if record.get("verification_status") == "verified" and record.get("full_name")
    }
    for seed in all_seeds:
        full_name = (seed.get("full_name") or "").casefold()
        existing = verified_by_full_name.get(full_name) if full_name else None
        if existing is None:
            registry.ensure_lead(seed, now)
            continue
        lead_key = f"lead:{seed['lead_id']}"
        placeholder = registry.records.pop(lead_key, None)
        provenance = make_provenance(
            source=seed["source"],
            source_ref=seed.get("source_ref") or seed["label"],
            lead_id=seed["lead_id"],
            first_seen=(placeholder or existing).get("first_seen", now),
            last_seen=now,
        )
        existing["provenance"] = append_unique(existing.get("provenance", []), provenance)
        existing["first_seen"] = min(
            existing.get("first_seen", now), (placeholder or existing).get("first_seen", now)
        )
        existing["last_seen"] = now
        existing["gold_seed"] = bool(existing.get("gold_seed") or seed.get("gold_seed"))
        existing["notes"] = existing.get("notes") or seed.get("notes")
    registry.save()
    verified = 0
    unresolved = 0
    errors = []
    for seed in seeds:
        lead_key = f"lead:{seed['lead_id']}"
        try:
            match_status = "exact" if seed.get("full_name") else "probable"
            full_name = seed.get("full_name")
            search_match = None
            candidate_matches = []
            if not full_name:
                query = f"{seed['label']} in:name fork:true"
                params = urllib.parse.urlencode(
                    {"q": query, "sort": "stars", "order": "desc", "per_page": 20}
                )
                response, _, _ = client.request_json(f"/search/repositories?{params}")
                exact_matches = [
                    item
                    for item in response.get("items", [])
                    if (item.get("name") or "").casefold() == seed["label"].casefold()
                ]
                if not exact_matches:
                    registry.records[lead_key]["lead_match_status"] = "unresolved"
                    registry.records[lead_key]["checked_at"] = utc_now()
                    unresolved += 1
                    continue
                exact_matches.sort(key=lambda item: item.get("stargazers_count") or 0, reverse=True)
                search_match = exact_matches[0]
                full_name = search_match["full_name"]
                if len(exact_matches) > 1:
                    candidate_matches = [
                        {
                            "github_repo_id": item.get("id"),
                            "full_name": item.get("full_name"),
                            "stars": item.get("stargazers_count"),
                        }
                        for item in exact_matches[:5]
                    ]
            if args.summary_only and search_match:
                incoming = record_from_repo(
                    search_match,
                    now=utc_now(),
                    languages=None,
                    languages_status="pending",
                    release=None,
                    release_status="pending",
                    kind_hint=seed.get("kind_hint"),
                    lead_match_status=match_status,
                )
            elif args.summary_only:
                encoded_name = "/".join(
                    urllib.parse.quote(part, safe="") for part in full_name.split("/", 1)
                )
                repo, _, _ = client.request_json(f"/repos/{encoded_name}")
                incoming = record_from_repo(
                    repo,
                    now=utc_now(),
                    languages=None,
                    languages_status="pending",
                    release=None,
                    release_status="pending",
                    kind_hint=seed.get("kind_hint"),
                    lead_match_status=match_status,
                )
            else:
                incoming = hydrate_repo(
                    client,
                    full_name,
                    kind_hint=seed.get("kind_hint"),
                    lead_match_status=match_status,
                )
            if candidate_matches:
                incoming["candidate_matches"] = candidate_matches
            seen = utc_now()
            provenance = make_provenance(
                source=seed["source"],
                source_ref=seed.get("source_ref") or seed["label"],
                lead_id=seed["lead_id"],
                first_seen=seen,
                last_seen=seen,
            )
            registry.upsert_repo(incoming, provenance, lead_key=lead_key)
            verified += 1
        except Exception as error:  # preserve other leads and a usable partial run
            failed = registry.records.get(lead_key)
            if failed is None:
                prior_key = verified_by_full_name[seed["full_name"].casefold()]["record_key"]
                failed = registry.records[prior_key]
            else:
                failed["verification_status"] = "error"
            failed["checked_at"] = utc_now()
            failed["last_check_status"] = "error"
            failed["last_error"] = str(error)
            errors.append({"lead_id": seed["lead_id"], "error": str(error)})
        finally:
            registry.save()
    return {
        "command": "seed",
        "selected": len(seeds),
        "verified": verified,
        "unresolved": unresolved,
        "errors": errors,
    }


def parse_next_link(link_header: str | None) -> str | None:
    if not link_header:
        return None
    for part in link_header.split(","):
        match = re.match(r'\s*<([^>]+)>;\s*rel="([^"]+)"', part)
        if match and match.group(2) == "next":
            return match.group(1)
    return None


def command_discover(args, registry: Registry, client: GitHubClient) -> dict:
    matrix = read_json(Path(args.matrix))
    selected = [
        query
        for query in matrix
        if query.get("enabled", True)
        and (not args.family or query["family"] in set(args.family.split(",")))
        and (not args.query_id or query["id"] in set(args.query_id.split(",")))
    ]
    if args.query_limit is not None:
        selected = selected[: args.query_limit]
    discovered_ids: set[int] = set()
    errors = []
    for query_config in selected:
        params = urllib.parse.urlencode(
            {
                "q": query_config["query"],
                "sort": args.sort,
                "order": args.order,
                "per_page": args.per_page,
                "page": 1,
            }
        )
        next_url = f"{API_ROOT}/search/repositories?{params}"
        page = 0
        while next_url and page < args.pages:
            page += 1
            try:
                response, headers, _ = client.request_json(next_url)
                now = utc_now()
                for repo in response.get("items", []):
                    discovered_ids.add(repo["id"])
                    incoming = record_from_repo(
                        repo,
                        now=now,
                        languages=None,
                        languages_status="pending",
                        release=None,
                        release_status="pending",
                        kind_hint=query_config.get("kind_hint"),
                    )
                    provenance = make_provenance(
                        source="github-search",
                        source_ref=query_config["query"],
                        query_id=query_config["id"],
                        first_seen=now,
                        last_seen=now,
                    )
                    registry.upsert_repo(incoming, provenance)
                registry.save()
                if response.get("incomplete_results"):
                    errors.append(
                        {
                            "query_id": query_config["id"],
                            "warning": "GitHub returned incomplete_results=true",
                        }
                    )
                next_url = parse_next_link(headers.get("link"))
            except Exception as error:
                errors.append({"query_id": query_config["id"], "page": page, "error": str(error)})
                break
    hydrated = 0
    if args.hydrate_limit:
        candidates = [
            registry.records[f"repo:{repo_id}"]
            for repo_id in discovered_ids
            if registry.records[f"repo:{repo_id}"].get("languages_status") != "complete"
        ]
        candidates.sort(key=lambda record: record.get("metrics", {}).get("stars") or 0, reverse=True)
        for existing in candidates[: args.hydrate_limit]:
            try:
                incoming = hydrate_repo(
                    client,
                    existing["full_name"],
                    kind_hint=existing.get("entity_kind"),
                    lead_match_status=existing.get("lead_match_status", "not_applicable"),
                )
                provenance = make_provenance(
                    source="metadata-hydration",
                    source_ref=existing["api_url"],
                    first_seen=existing["first_seen"],
                    last_seen=utc_now(),
                )
                registry.upsert_repo(incoming, provenance)
                registry.save()
                hydrated += 1
            except Exception as error:
                errors.append({"full_name": existing["full_name"], "error": str(error)})
    return {
        "command": "discover",
        "queries": len(selected),
        "unique_repositories_seen": len(discovered_ids),
        "hydrated": hydrated,
        "errors": errors,
    }


def command_refresh(args, registry: Registry, client: GitHubClient) -> dict:
    records = [
        record
        for record in registry.records.values()
        if record.get("verification_status") in {"verified", "missing", "error"}
        and record.get("github_repo_id") and record.get("full_name")
    ]
    records.sort(key=lambda record: record.get("checked_at") or "")
    if args.limit is not None:
        records = records[: args.limit]
    updated = 0
    unchanged = 0
    errors = []
    for existing in records:
        try:
            incoming = hydrate_repo(
                client,
                existing["full_name"],
                kind_hint=existing.get("entity_kind"),
                lead_match_status=existing.get("lead_match_status", "not_applicable"),
                conditional=True,
            )
            if incoming is None:
                existing["checked_at"] = utc_now()
                existing["last_seen"] = existing["checked_at"]
                # A conditional 304 also proves a previously unavailable repo is accessible again.
                existing["verification_status"] = "verified"
                existing["last_check_status"] = "ok"
                existing.pop("last_error", None)
                unchanged += 1
            else:
                provenance = make_provenance(
                    source="incremental-refresh",
                    source_ref=existing["api_url"],
                    first_seen=existing["first_seen"],
                    last_seen=utc_now(),
                )
                registry.upsert_repo(incoming, provenance)
                updated += 1
        except Exception as error:
            existing["last_error"] = str(error)
            existing["checked_at"] = utc_now()
            existing["last_check_status"] = "error"
            if isinstance(error, GitHubAPIError) and error.status == 404:
                existing["verification_status"] = "missing"
                existing["last_check_status"] = "unavailable"
            errors.append({"full_name": existing["full_name"], "error": str(error)})
        finally:
            registry.save()
    return {
        "command": "refresh",
        "selected": len(records),
        "updated": updated,
        "not_modified": unchanged,
        "errors": errors,
    }


def command_hydrate(args, registry: Registry, client: GitHubClient) -> dict:
    records = [
        record
        for record in registry.records.values()
        if record.get("verification_status") == "verified"
        and record.get("full_name")
        and (
            record.get("languages_status") != "complete"
            or record.get("latest_release_status") == "pending"
        )
    ]
    if args.lead_only:
        records = [
            record
            for record in records
            if any(item.get("lead_id") for item in record.get("provenance", []))
        ]
    records.sort(
        key=lambda record: (
            not any(item.get("lead_id") for item in record.get("provenance", [])),
            -(record.get("metrics", {}).get("stars") or 0),
        )
    )
    if args.limit is not None:
        records = records[: args.limit]
    hydrated = 0
    errors = []
    for existing in records:
        try:
            incoming = hydrate_repo(
                client,
                existing["full_name"],
                kind_hint=existing.get("entity_kind"),
                lead_match_status=existing.get("lead_match_status", "not_applicable"),
            )
            now = utc_now()
            provenance = make_provenance(
                source="metadata-hydration",
                source_ref=existing["api_url"],
                first_seen=existing["first_seen"],
                last_seen=now,
            )
            registry.upsert_repo(incoming, provenance)
            hydrated += 1
        except Exception as error:
            existing["last_error"] = str(error)
            errors.append({"full_name": existing["full_name"], "error": str(error)})
        finally:
            registry.save()
    return {
        "command": "hydrate",
        "selected": len(records),
        "hydrated": hydrated,
        "errors": errors,
    }


def parse_lead_file(path: Path) -> list[str]:
    full_names = []
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("https://github.com/"):
            parts = urllib.parse.urlsplit(line).path.strip("/").split("/")
            if len(parts) < 2:
                raise ValueError(f"invalid GitHub repository URL in {path}: {line}")
            line = f"{parts[0]}/{parts[1].removesuffix('.git')}"
        if not re.fullmatch(r"[^/\s]+/[^/\s]+", line):
            raise ValueError(f"expected owner/repo in {path}: {line}")
        full_names.append(line)
    return full_names


def command_expand(args, registry: Registry, client: GitHubClient) -> dict:
    """Controlled owner/topic neighbor expansion plus exact awesome-lead import."""
    seen_ids: set[int] = set()
    errors = []
    owners = [item.strip() for item in (args.owner or "").split(",") if item.strip()]
    topics = [item.strip() for item in (args.topic or "").split(",") if item.strip()]

    for owner in owners:
        params = urllib.parse.urlencode(
            {"type": "public", "sort": "pushed", "direction": "desc", "per_page": args.per_page}
        )
        next_url = f"{API_ROOT}/users/{urllib.parse.quote(owner, safe='')}/repos?{params}"
        page = 0
        while next_url and page < args.pages:
            page += 1
            try:
                response, headers, _ = client.request_json(next_url)
                now = utc_now()
                for repo in response:
                    seen_ids.add(repo["id"])
                    incoming = record_from_repo(
                        repo,
                        now=now,
                        languages=None,
                        languages_status="pending",
                        release=None,
                        release_status="pending",
                        kind_hint=None,
                    )
                    provenance = make_provenance(
                        source="github-owner-expansion",
                        source_ref=owner,
                        first_seen=now,
                        last_seen=now,
                    )
                    registry.upsert_repo(incoming, provenance)
                registry.save()
                next_url = parse_next_link(headers.get("link"))
            except Exception as error:
                errors.append({"owner": owner, "page": page, "error": str(error)})
                break

    for topic in topics:
        query = f"topic:{topic} archived:false"
        params = urllib.parse.urlencode(
            {
                "q": query,
                "sort": "stars",
                "order": "desc",
                "per_page": args.per_page,
                "page": 1,
            }
        )
        next_url = f"{API_ROOT}/search/repositories?{params}"
        page = 0
        while next_url and page < args.pages:
            page += 1
            try:
                response, headers, _ = client.request_json(next_url)
                now = utc_now()
                for repo in response.get("items", []):
                    seen_ids.add(repo["id"])
                    incoming = record_from_repo(
                        repo,
                        now=now,
                        languages=None,
                        languages_status="pending",
                        release=None,
                        release_status="pending",
                        kind_hint=None,
                    )
                    provenance = make_provenance(
                        source="github-topic-neighbor",
                        source_ref=topic,
                        query_id=f"neighbor-topic:{topic}",
                        first_seen=now,
                        last_seen=now,
                    )
                    registry.upsert_repo(incoming, provenance)
                registry.save()
                if response.get("incomplete_results"):
                    errors.append(
                        {"topic": topic, "warning": "GitHub returned incomplete_results=true"}
                    )
                next_url = parse_next_link(headers.get("link"))
            except Exception as error:
                errors.append({"topic": topic, "page": page, "error": str(error)})
                break

    imported = 0
    if args.lead_file:
        for full_name in parse_lead_file(Path(args.lead_file)):
            try:
                incoming = hydrate_repo(
                    client,
                    full_name,
                    kind_hint=None,
                    lead_match_status="exact",
                )
                now = utc_now()
                provenance = make_provenance(
                    source="awesome-list-lead-file",
                    source_ref=str(args.lead_file),
                    first_seen=now,
                    last_seen=now,
                )
                registry.upsert_repo(incoming, provenance)
                registry.save()
                seen_ids.add(incoming["github_repo_id"])
                imported += 1
            except Exception as error:
                errors.append({"full_name": full_name, "error": str(error)})

    hydrated = 0
    if args.hydrate_limit:
        candidates = [
            registry.records[f"repo:{repo_id}"]
            for repo_id in seen_ids
            if registry.records[f"repo:{repo_id}"].get("languages_status") != "complete"
        ]
        candidates.sort(key=lambda record: record.get("metrics", {}).get("stars") or 0, reverse=True)
        for existing in candidates[: args.hydrate_limit]:
            try:
                incoming = hydrate_repo(
                    client,
                    existing["full_name"],
                    kind_hint=existing.get("entity_kind"),
                    lead_match_status=existing.get("lead_match_status", "not_applicable"),
                )
                now = utc_now()
                provenance = make_provenance(
                    source="expansion-metadata-hydration",
                    source_ref=existing["api_url"],
                    first_seen=existing["first_seen"],
                    last_seen=now,
                )
                registry.upsert_repo(incoming, provenance)
                registry.save()
                hydrated += 1
            except Exception as error:
                errors.append({"full_name": existing["full_name"], "error": str(error)})

    return {
        "command": "expand",
        "owners": len(owners),
        "topics": len(topics),
        "awesome_leads_imported": imported,
        "unique_repositories_seen": len(seen_ids),
        "hydrated": hydrated,
        "errors": errors,
    }


def create_snapshot(registry: Registry, run_summary: dict) -> Path:
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H%M%SZ")
    snapshot = ROOT / "data" / "snapshots" / f"run-{timestamp}"
    counter = 2
    while snapshot.exists():
        snapshot = ROOT / "data" / "snapshots" / f"run-{timestamp}-{counter}"
        counter += 1
    snapshot.mkdir(parents=True)
    shutil.copy2(registry.path, snapshot / "registry.jsonl")
    write_json(snapshot / "run-summary.json", run_summary)
    return snapshot


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--registry", default=str(DEFAULT_REGISTRY))
    parser.add_argument("--cache", default=str(DEFAULT_CACHE))
    parser.add_argument("--request-interval", type=float, default=0.25)
    parser.add_argument("--search-interval", type=float)
    parser.add_argument("--max-retries", type=int, default=2)
    parser.add_argument("--max-wait", type=float, default=90.0)
    parser.add_argument("--no-snapshot", action="store_true")
    subparsers = parser.add_subparsers(dest="command", required=True)

    seed = subparsers.add_parser("seed", help="Register and verify exact/name leads")
    seed.add_argument("--seeds", default=str(ROOT / "config" / "seeds.json"))
    seed.add_argument("--only", help="Comma-separated lead ids")
    seed.add_argument("--limit", type=int)
    seed.add_argument(
        "--summary-only",
        action="store_true",
        help="Verify from search/repository metadata now; defer languages/releases",
    )

    discover = subparsers.add_parser("discover", help="Run selected search query families")
    discover.add_argument("--matrix", default=str(ROOT / "config" / "query-matrix.json"))
    discover.add_argument("--family", help="Comma-separated families")
    discover.add_argument("--query-id", help="Comma-separated query ids")
    discover.add_argument("--query-limit", type=int)
    discover.add_argument("--pages", type=int, default=1)
    discover.add_argument("--per-page", type=int, default=100, choices=range(1, 101))
    discover.add_argument("--sort", choices=["stars", "forks", "updated"], default="stars")
    discover.add_argument("--order", choices=["asc", "desc"], default="desc")
    discover.add_argument("--hydrate-limit", type=int, default=0)

    refresh = subparsers.add_parser("refresh", help="Conditional refresh of existing records")
    refresh.add_argument("--limit", type=int)

    hydrate = subparsers.add_parser(
        "hydrate",
        help="Fill languages and latest-release metadata for pending records",
    )
    hydrate.add_argument("--limit", type=int)
    hydrate.add_argument("--lead-only", action="store_true")

    expand = subparsers.add_parser(
        "expand",
        help="Controlled owner/topic expansion or exact awesome-lead import",
    )
    expand.add_argument("--owner", help="Comma-separated GitHub owners")
    expand.add_argument("--topic", help="Comma-separated high-signal neighbor topics")
    expand.add_argument(
        "--lead-file",
        help="Text file of exact owner/repo names or GitHub URLs from awesome indices",
    )
    expand.add_argument("--pages", type=int, default=1)
    expand.add_argument("--per-page", type=int, default=100, choices=range(1, 101))
    expand.add_argument("--hydrate-limit", type=int, default=0)
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    registry = Registry(Path(args.registry))
    client = GitHubClient(args)
    started_at = utc_now()
    if args.command == "seed":
        result = command_seed(args, registry, client)
    elif args.command == "discover":
        result = command_discover(args, registry, client)
    elif args.command == "refresh":
        result = command_refresh(args, registry, client)
    elif args.command == "hydrate":
        result = command_hydrate(args, registry, client)
    else:
        if not (args.owner or args.topic or args.lead_file):
            parser.error("expand requires --owner, --topic, or --lead-file")
        result = command_expand(args, registry, client)
    registry.save()
    result.update(
        {
            "started_at": started_at,
            "finished_at": utc_now(),
            "registry_records": len(registry.records),
            "api_requests": client.request_count,
            "not_modified_responses": client.not_modified_count,
            "authenticated": bool(client.token),
            "api_version": client.version,
        }
    )
    if not args.no_snapshot:
        result["snapshot"] = str(create_snapshot(registry, result).relative_to(ROOT))
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 1 if result.get("errors") else 0


if __name__ == "__main__":
    sys.exit(main())
