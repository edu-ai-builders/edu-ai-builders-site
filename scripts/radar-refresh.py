#!/usr/bin/env python3
"""Read-only GitHub refresh into the original site's public, allowlisted snapshot.

Never changes the historical Radar registries. Uses gh's existing credential only
in memory; no credential, raw response or arbitrary manifest is published.
"""
import argparse
import base64
import re
import concurrent.futures
import datetime
import json
import pathlib
import subprocess
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE = ROOT.parent / "radar" / "data"
OUT = ROOT / "public/data/radar/catalog.json"

def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")

def safe_url(value):
    if not isinstance(value, str) or any(char.isspace() for char in value):
        return None
    try:
        parsed = urllib.parse.urlparse(value)
        return value if parsed.scheme in ("https", "http") and parsed.hostname and not parsed.username and not parsed.password else None
    except ValueError:
        return None

def read_jsonl(name):
    return [json.loads(line) for line in (SOURCE / name).read_text().splitlines() if line.strip()]

def parse_frontmatter(markdown):
    """Read declared name/description only; never execute or publish instructions."""
    match = re.match(r"\A\ufeff?---[ \t]*\r?\n(.*?)\r?\n---[ \t]*(?:\r?\n|$)", markdown, re.S)
    if not match:
        return None
    fields, active = {}, None
    for line in match[1].splitlines():
        if line[:1].isspace() and active in ("name", "description"):
            fields[active] += " " + line.strip()
            continue
        item = re.match(r"^(name|description):\s*(.*)$", line)
        if not item:
            active = None
            continue
        active, value = item.groups()
        fields[active] = "" if re.fullmatch(r"[|>][+-]?", value.strip()) else value.strip().strip("\"'")
    fields = {key: re.sub(r"\s+", " ", value).strip() for key, value in fields.items()}
    if not fields.get("name") or not fields.get("description") or len(fields["name"]) > 200 or len(fields["description"]) > 6000:
        return None
    return fields


def retain_previous(record, previous, status, error=None):
    """A failed/limited run must not roll September data back to July source data."""
    return {**record, **(previous or {}), "refreshStatus": status, "refreshError": error}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=60)
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--offline", action="store_true")
    parser.add_argument("--skills", action="store_true", help="Recheck public SKILL.md declarations as well as repository metadata")
    args = parser.parse_args()
    started = now()
    previous = json.loads(OUT.read_text()) if OUT.exists() and not args.offline else {"records": []}
    previous_by_id = {r["id"]: r for r in previous["records"]}
    registry, skills = read_jsonl("registry.jsonl"), read_jsonl("skills.jsonl")
    eligible = [r for r in registry if r.get("verification_status") == "verified" and r.get("full_name")]
    # Stable GitHub IDs, rather than repository names, survive transfers/renames.
    repositories = {str(r["github_repo_id"]): r for r in eligible}
    names = {r["full_name"] for r in eligible}
    for skill in skills:
        r = skill["source_repository"]
        if r["full_name"] not in names:
            repositories[str(r["github_repo_id"])] = {**r, "metrics": {"stars": r.get("stars", 0)}, "checked_at": skill["fetched_at"], "entity_kind": "repo", "skill_only": True}
            names.add(r["full_name"])
    ordered = sorted(repositories.items(), key=lambda item: (item[1]["full_name"] != "datawhalechina/easy-vibe", -(item[1].get("metrics", {}).get("stars") or 0)))
    token = ""
    if not args.offline:
        auth = subprocess.run(["gh", "auth", "token"], capture_output=True, text=True, check=False)
        if auth.returncode == 0:
            token = auth.stdout.strip()
    headers = {"Accept": "application/vnd.github+json", "User-Agent": "Edu-AI-Builders-public-radar-refresh", "X-GitHub-Api-Version": "2022-11-28"}
    if token:
        headers["Authorization"] = "Bearer " + token

    def fetch(item):
        key, old = item
        url = "https://api.github.com/repositories/" + key
        for attempt in range(2):
            try:
                with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=25) as response:
                    data = json.load(response)
                if str(data.get("id")) != key or data.get("private"):
                    return key, None, "identity-mismatch"
                return key, data, None
            except urllib.error.HTTPError as error:
                return key, None, "http-" + str(error.code)
            except (OSError, ValueError):
                if attempt == 0:
                    time.sleep(1)
        return key, None, "network-error"

    fresh, errors = {}, {}
    selected = [] if args.offline else ordered[:max(0, args.limit)]
    with concurrent.futures.ThreadPoolExecutor(max_workers=min(max(args.workers, 1), 6)) as pool:
        for index, (key, data, error) in enumerate(pool.map(fetch, selected), 1):
            if data is not None:
                fresh[key] = (data, now())
            else:
                errors[key] = error
            if index % 100 == 0:
                print(f"Checked {index}/{len(selected)}: {len(fresh)} refreshed, {len(errors)} retained with errors", flush=True)
    if selected and not fresh:
        raise SystemExit("No repository response succeeded; keeping the current snapshot unchanged.")
    if any(error in ("http-401", "http-403", "http-429") for error in errors.values()):
        raise SystemExit("Authentication or API rate limit encountered; current snapshot unchanged. Retry after resolving it.")
    manifest_results = {}
    if args.skills and not args.offline:
        def fetch_manifest(old):
            key = str(old["source_repository"]["github_repo_id"])
            if key not in fresh:
                return old["skill_key"], None, errors.get(key, "repository-not-checked")
            repo = fresh[key][0]
            path = urllib.parse.quote(old["skill_path"], safe="/")
            ref = urllib.parse.quote(repo["default_branch"], safe="")
            url = f"https://api.github.com/repos/{repo['full_name']}/contents/{path}?ref={ref}"
            try:
                with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=25) as response:
                    payload = json.load(response)
                if payload.get("type") != "file" or payload.get("encoding") != "base64" or payload.get("size", 0) > 1_000_000:
                    return old["skill_key"], None, "unsupported-manifest"
                text = base64.b64decode(payload["content"], validate=False).decode("utf-8")
                fields = parse_frontmatter(text)
                if fields is None:
                    return old["skill_key"], None, "invalid-frontmatter"
                return old["skill_key"], {**fields, "sha": payload["sha"], "url": safe_url(payload["html_url"]), "checkedAt": now()}, None
            except urllib.error.HTTPError as error:
                return old["skill_key"], None, "http-" + str(error.code)
            except (OSError, ValueError, KeyError):
                return old["skill_key"], None, "manifest-read-error"
        with concurrent.futures.ThreadPoolExecutor(max_workers=min(max(args.workers, 1), 6)) as pool:
            for index, (key, value, error) in enumerate(pool.map(fetch_manifest, skills), 1):
                manifest_results[key] = (value, error)
                if index % 25 == 0:
                    print(f"Skill manifests checked {index}/{len(skills)}", flush=True)
        if any(error in ("http-401", "http-403", "http-429") for _, error in manifest_results.values()):
            raise SystemExit("Manifest API authentication/rate limit error; snapshot unchanged.")
    records = []
    for key, old in ordered:
        if old.get("skill_only"):
            continue
        data, checked = fresh.get(key, (None, old.get("checked_at") or old.get("fetched_at")))
        r = data or old
        records.append({
            "id": "repo:" + key, "kind": old.get("entity_kind", "repo"),
            "name": r["full_name"], "title": r.get("name") or r["full_name"].split("/")[-1],
            "description": r.get("description") or "", "url": safe_url(r.get("html_url")),
            "homepage": safe_url(r.get("homepage")), "topics": r.get("topics") or [],
            "language": r.get("language") if data else r.get("primary_language"),
            "license": (r.get("license") or {}).get("spdx_id") if data else r.get("license_spdx"),
            "stars": r.get("stargazers_count", 0) if data else r.get("metrics", {}).get("stars", 0),
            "archived": bool(r.get("archived")), "pushedAt": r.get("pushed_at"),
            "checkedAt": checked, "refreshStatus": "refreshed" if data else "failed" if key in errors else "not-refreshed",
            "refreshError": errors.get(key), "source": "GitHub REST repository metadata", "sourceUrl": "https://api.github.com/repositories/" + key,
            "importedFrom": "Radar/data/registry.jsonl",
        })
        if not data:
            records[-1] = retain_previous(records[-1], previous_by_id.get("repo:" + key), "failed" if key in errors else "not-refreshed", errors.get(key))
    for old in skills:
        source = old["source_repository"]
        key = str(source["github_repo_id"])
        data, checked = fresh.get(key, (None, old["fetched_at"]))
        r = data or source
        records.append({
            "id": old["skill_key"], "kind": "skill", "name": r["full_name"], "title": old["skill_name"],
            "description": (old.get("description") or "").lstrip("| "), "url": safe_url(old["manifest_url"]),
            "homepage": None, "topics": old.get("ecosystems") or [], "language": None,
            "license": (r.get("license") or {}).get("spdx_id") if data else r.get("license_spdx"),
            "stars": r.get("stargazers_count", 0) if data else r.get("stars", 0), "archived": bool(r.get("archived")),
            "pushedAt": r.get("pushed_at"), "checkedAt": old["fetched_at"], "repositoryCheckedAt": checked,
            "refreshStatus": "not-refreshed", "repositoryRefreshStatus": "refreshed" if data else "failed" if key in errors else "not-refreshed",
            "refreshError": None, "source": "GitHub tree + SKILL.md frontmatter (historical snapshot)",
            "sourceUrl": safe_url(old["manifest_url"]), "importedFrom": "Radar/data/skills.jsonl",
        })
        record = records[-1]
        prior = previous_by_id.get(old["skill_key"])
        if prior:
            for field in ("title", "description", "url", "sourceUrl", "source", "checkedAt", "manifestSha"):
                if field in prior:
                    record[field] = prior[field]
            if not data:
                for field in ("name", "license", "stars", "archived", "pushedAt", "repositoryCheckedAt"):
                    if field in prior:
                        record[field] = prior[field]
        manifest, error = manifest_results.get(old["skill_key"], (None, None))
        if manifest:
            record.update(title=manifest["name"], description=manifest["description"], url=manifest["url"], sourceUrl=manifest["url"],
                          checkedAt=manifest["checkedAt"], manifestSha=manifest["sha"], refreshStatus="refreshed",
                          source="GitHub public SKILL.md name/description declarations; not an instruction or safety review")
        elif old["skill_key"] in manifest_results:
            record.update(refreshStatus="failed", refreshError=error)
    summary = {
        "schemaVersion": 1, "generatedAt": now(), "refreshStartedAt": started,
        "total": len(records), "repositories": len(eligible), "skills": len(skills),
        "refreshed": sum(r["refreshStatus"] == "refreshed" for r in records),
        "notRefreshed": sum(r["refreshStatus"] != "refreshed" for r in records),
        "failed": sum(r["refreshStatus"] == "failed" for r in records),
        "excludedUnverified": len(registry) - len(eligible), "repositoryRequests": len(selected),
        "repositoryRefreshSuccess": len(fresh), "repositoryRefreshErrors": len(errors),
        "manifestRequests": len(manifest_results),
        "manifestRefreshSuccess": sum(value is not None for value, error in manifest_results.values()),
        "manifestRefreshErrors": sum(error is not None for value, error in manifest_results.values()),
        "manifestPolicy": "Skill checkedAt records a successful name/description declaration check only. Repository checks are separate. Failed checks preserve the latest successful observation, not a new verification date. No instructions executed or safety/quality assessment implied.",
        "sourcePolicy": "Public metadata only. No repository source code or manifest bodies copied. Project license metadata does not grant reuse rights.",
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    temporary = OUT.with_suffix(".tmp")
    temporary.write_text(json.dumps({"summary": summary, "records": records}, ensure_ascii=False, separators=(",", ":")) + "\n")
    temporary.replace(OUT)
    print(json.dumps(summary, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
