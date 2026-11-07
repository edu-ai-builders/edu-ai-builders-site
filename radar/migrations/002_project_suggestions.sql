-- Public Radar submissions. This table is curator-only: no public read route
-- exposes learning_goal_private, submission timestamps, or pending suggestions.

CREATE TABLE IF NOT EXISTS radar_project_suggestions (
  suggestion_id BIGSERIAL PRIMARY KEY,
  repository_full_name TEXT NOT NULL CHECK (repository_full_name ~ '^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$'),
  learning_goal_private TEXT NOT NULL CHECK (char_length(learning_goal_private) BETWEEN 1 AND 2000),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'duplicate')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  verified_github_repo_id BIGINT REFERENCES radar_repositories(github_repo_id)
);

CREATE INDEX IF NOT EXISTS radar_project_suggestions_pending_idx
  ON radar_project_suggestions (status, submitted_at);
