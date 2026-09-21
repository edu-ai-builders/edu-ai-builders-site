#!/usr/bin/env python3
"""Read-only GitHub refresh into the original site's public, allowlisted snapshot.

Never changes the historical Radar registries. Uses gh's existing credential only
in memory; no credential, raw response or arbitrary manifest is published.
"""
import argparse
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

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=60)
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--offline", action="store_true")
    args = parser.parse_args()
    started = now()
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
    summary = {
        "schemaVersion": 1, "generatedAt": now(), "refreshStartedAt": started,
        "total": len(records), "repositories": len(eligible), "skills": len(skills),
        "refreshed": sum(r["refreshStatus"] == "refreshed" for r in records),
        "notRefreshed": sum(r["refreshStatus"] != "refreshed" for r in records),
        "failed": sum(r["refreshStatus"] == "failed" for r in records),
        "excludedUnverified": len(registry) - len(eligible), "repositoryRequests": len(selected),
        "repositoryRefreshSuccess": len(fresh), "repositoryRefreshErrors": len(errors),
        "manifestPolicy": "Skill descriptions and manifest check dates retain their original observation date; refreshing a repository is not a manifest review.",
        "sourcePolicy": "Public metadata only. No repository source code or manifest bodies copied. Project license metadata does not grant reuse rights.",
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"summary": summary, "records": records}, ensure_ascii=False, separators=(",", ":")) + "\n")
    print(json.dumps(summary, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
