-- GitHub Radar database schema. Independent from the eduos substrate schema.
-- Run with a direct Postgres connection; the web runtime should use a pooler.

CREATE TABLE IF NOT EXISTS radar_repositories (
  github_repo_id BIGINT PRIMARY KEY,
  github_node_id TEXT,
  owner_github_id BIGINT,
  owner_login TEXT NOT NULL,
  owner_type TEXT,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL UNIQUE,
  html_url TEXT NOT NULL,
  api_url TEXT NOT NULL,
  clone_url TEXT NOT NULL,
  homepage TEXT,
  description TEXT,
  topics JSONB NOT NULL DEFAULT '[]'::jsonb,
  languages JSONB NOT NULL DEFAULT '{}'::jsonb,
  primary_language TEXT,
  stars INTEGER,
  forks INTEGER,
  github_watchers_count INTEGER,
  subscribers_count INTEGER,
  open_issues INTEGER,
  license_spdx TEXT,
  default_branch TEXT,
  github_created_at TIMESTAMPTZ,
  github_updated_at TIMESTAMPTZ,
  github_pushed_at TIMESTAMPTZ,
  latest_release JSONB,
  archived BOOLEAN,
  is_fork BOOLEAN,
  is_template BOOLEAN,
  entity_kind TEXT NOT NULL CHECK (
    entity_kind IN ('repo', 'dataset', 'benchmark', 'awesome_index', 'unknown')
  ),
  lead_match_status TEXT NOT NULL DEFAULT 'not_applicable' CHECK (
    lead_match_status IN ('exact', 'probable', 'ambiguous', 'unresolved', 'not_applicable')
  ),
  first_seen TIMESTAMPTZ NOT NULL,
  last_seen TIMESTAMPTZ NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL,
  checked_at TIMESTAMPTZ NOT NULL,
  archived_from_radar_at TIMESTAMPTZ,
  search_document TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(full_name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(topics::text, '')), 'C')
  ) STORED
);

CREATE INDEX IF NOT EXISTS radar_repositories_search_idx
  ON radar_repositories USING GIN (search_document);
CREATE INDEX IF NOT EXISTS radar_repositories_stars_idx
  ON radar_repositories (stars DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS radar_repositories_kind_idx
  ON radar_repositories (entity_kind);
CREATE INDEX IF NOT EXISTS radar_repositories_pushed_idx
  ON radar_repositories (github_pushed_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS radar_repositories_topics_idx
  ON radar_repositories USING GIN (topics);
CREATE INDEX IF NOT EXISTS radar_repositories_languages_idx
  ON radar_repositories USING GIN (languages);

CREATE TABLE IF NOT EXISTS radar_discoveries (
  discovery_id BIGSERIAL PRIMARY KEY,
  github_repo_id BIGINT NOT NULL REFERENCES radar_repositories(github_repo_id),
  source TEXT NOT NULL,
  source_ref TEXT,
  query_id TEXT,
  lead_id TEXT,
  first_seen TIMESTAMPTZ NOT NULL,
  last_seen TIMESTAMPTZ NOT NULL,
  UNIQUE (github_repo_id, source, source_ref, query_id, lead_id)
);

CREATE INDEX IF NOT EXISTS radar_discoveries_repo_idx
  ON radar_discoveries (github_repo_id);
CREATE INDEX IF NOT EXISTS radar_discoveries_query_idx
  ON radar_discoveries (query_id);

CREATE TABLE IF NOT EXISTS radar_sync_runs (
  run_id BIGSERIAL PRIMARY KEY,
  started_at TIMESTAMPTZ NOT NULL,
  finished_at TIMESTAMPTZ,
  command TEXT NOT NULL,
  api_version TEXT NOT NULL,
  query_matrix_version TEXT,
  authenticated BOOLEAN NOT NULL,
  api_requests INTEGER NOT NULL DEFAULT 0,
  repositories_seen INTEGER NOT NULL DEFAULT 0,
  errors JSONB NOT NULL DEFAULT '[]'::jsonb
);
