> Historical standalone deployment proposal. The 2026-11-06 consolidation supersedes this publication route. Collection now belongs to the Edu AI Builders repository; `/directory` reads its own reviewed snapshot. Do not provision a database or deploy the old frontend from this document. See `../../docs/directory-2026-11-06/brief.md`.

# Vercel + managed Postgres launch route

Decision snapshot: 2026-07-22. Pricing and plan limits can change; recheck the
linked provider page immediately before provisioning.

No account, paid resource, database, domain, deployment, or ad account has been
created by this task.

## Recommended tomorrow path

Use a two-stage launch:

1. **Day-one public page:** deploy the Next.js application from `web/` as a
   read-only snapshot. This is operationally small and has no database secret
   or GitHub token in the browser. In the standalone Radar repository, Vercel's
   Root Directory is `web`.
2. **Database-backed update:** provision Neon Postgres through the Vercel
   Marketplace, run `migrations/001_init.sql`, import the JSONL snapshot, and
   expose a small cached read-only API. Run crawling as a scheduled worker, not
   inside public page requests.

Neon is the default recommendation for this registry because it provides
serverless Postgres, pooling, scale-to-zero, branching and restore history while
keeping the data model portable. Vercel's Marketplace can inject credentials.

## Provider comparison

| Choice | Current entry point | Useful here | Important limit/cost |
|---|---:|---|---|
| Neon | Free | Serverless Postgres, built-in pooling, branching, scale-to-zero, read replicas | Free: 0.5 GB/project, 100 CU-hours/month/project, 6-hour restore window. Launch is usage-based; listed compute is $0.106/CU-hour and storage $0.35/GB-month. |
| Supabase | Free; Pro from $25/month | Full Postgres plus Auth, REST, Realtime and storage if the Radar later needs accounts/community workflows | Free: 500 MB database and pauses after one inactive week; no automatic backups. Pro includes 8 GB disk and 7-day daily backups. |
| Prisma Postgres | Free; Starter $10/month | Managed pooling, edge support, operation-based spend controls | Free: 100,000 operations and 500 MB. Starter: 1M included operations, 10 GB, 7-day daily backups; per-operation pricing needs traffic modeling. |

Official references:

- [Vercel Marketplace storage](https://vercel.com/docs/marketplace-storage)
- [Neon pricing](https://neon.com/pricing)
- [Supabase pricing](https://supabase.com/pricing)
- [Supabase backup guidance](https://supabase.com/docs/guides/platform/backups)
- [Prisma Postgres pricing](https://www.prisma.io/pricing)

AWS Aurora Postgres is available in the Vercel Marketplace and can be evaluated
when AWS governance, provisioned capacity or an existing AWS footprint outweighs
the additional operational/cost surface. It is not the smallest tomorrow launch.

## Environment variables

Use provider/Vercel dashboards, never committed files:

- `DATABASE_URL`: pooled runtime connection with TLS.
- `DATABASE_URL_UNPOOLED`: direct connection used only for migrations/imports.
- `GITHUB_TOKEN`: read-only token used only by the scheduled crawler.
- `RADAR_ADMIN_TOKEN`: optional ingestion endpoint secret; unnecessary if import
  runs directly from a trusted job.
- `PUBLIC_SITE_URL`: canonical public URL.

Vercel environment variables are encrypted at rest. Mark production/preview
tokens and database credentials as Sensitive so they become unreadable after
creation. Scope values separately for Development, Preview and Production.

Official references:

- [Vercel environment variables](https://vercel.com/docs/environment-variables)
- [Vercel sensitive variables](https://vercel.com/docs/environment-variables/sensitive-environment-variables)

## Migration, import, backup and export

1. Provision one database in the same/near region as Vercel Functions.
2. Save both pooled and direct URLs as sensitive environment variables.
3. Apply `migrations/001_init.sql` and `migrations/002_project_suggestions.sql`
   with the direct URL.
4. Convert `registry.jsonl` into transactional UPSERTs keyed by
   `github_repo_id`; write provenance to `radar_discoveries`.
5. Verify record counts, unique IDs, null/completeness distribution and sample
   filters before switching reads.
6. Schedule daily `pg_dump --format=custom` to storage owned by the project, and
   export JSONL/CSV regularly so the registry stays provider-portable.
7. Quarterly, test an actual restore into a disposable database/branch.

Free-tier restore/backup coverage is not sufficient as the only copy. Keep the
compact versioned JSONL snapshots even after Postgres becomes canonical.

## Public read architecture

- `GET /api/repos?q=&kind=&language=&license=&min_stars=&pushed_after=&page=`
  returns a bounded field allowlist and at most 50 rows.
- Use parameterized SQL only. Never accept raw sort columns or SQL fragments.
- GIN full-text index covers names/descriptions/topics; B-tree indexes cover
  stars, kind and pushed time. Chinese substring search may need `pg_trgm` or a
  dedicated search service after measuring actual queries.
- Cache popular filters at the CDN for 5–15 minutes with
  `stale-while-revalidate`. Invalidate/rotate a dataset version after ingestion.
- Cap query length, page depth and response size. Apply per-IP/API-key rate
  limits at the edge for API routes; the static snapshot itself needs none.
- The public application gets a read-only database role. The ingestion role and
  GitHub token never enter browser JavaScript.

## Curated submissions and private learning goals

`POST /api/suggestions` accepts only a normalized public GitHub repository name
and a 1–2,000 character private learning goal. It writes to
`radar_project_suggestions` with `status: pending`; there is intentionally no
public list endpoint for this table. A curator must verify the repository with
the GitHub metadata crawler before adding it to the published snapshot. Do not
collect a name, email, IP address, or analytics identifier for the first launch
unless there is a separate published privacy policy and retention decision.

The website currently falls back to a quiet repository information cover rather
than GitHub's repeated default social preview. Homepage screenshots should be
generated and cached in a scheduled server-side job only after selecting a
screenshot provider, budget, retention period, and URL-sharing disclosure. Do
not call an anonymous screenshot provider from every visitor's browser request.

## Robots, GitHub rate limits and attribution

The supplied `robots.txt` allows public indexing. Before launch, decide whether
detail pages should be indexable and add a sitemap only after the canonical
domain is known. Robots rules do not protect an API; enforce API limits.

Do not proxy open-ended GitHub search from the public page. All displayed links
point to GitHub or repository homepages, and the page should say that counts are
snapshots and GitHub owns the live source data.

## Ads and commercial/public access

Vercel's current Hobby plan is restricted to personal, non-commercial use.
Advertising, sponsorship sales, paid lead generation, or operating this as a
business should be treated as commercial and launched on Pro after checking the
current terms. Hobby usage cannot simply buy overage after caps are reached.

Official references:

- [Vercel Hobby plan](https://vercel.com/docs/plans/hobby)
- [Vercel pricing](https://vercel.com/pricing)
- [Vercel platform limits](https://vercel.com/docs/limits)

Before adding ads:

- publish privacy and cookie disclosures appropriate to the chosen network;
- implement consent where required; avoid behavioral tracking by default;
- check repository logo/name usage and do not imply endorsement;
- keep sponsored rankings visually and semantically separate from organic data;
- define a correction/removal contact and a metadata refresh policy.

## User decisions required before launch

1. Static snapshot first, or database-backed API on day one?
2. Neon (recommended), Supabase, Prisma Postgres, or an existing database?
3. Personal/non-commercial launch, or commercial/ads requiring Vercel Pro?
4. Vercel project/team, region, public domain, and deployment authority?
5. Public indexing policy and whether unverified/probable leads are visible?
6. Read-only GitHub token or GitHub App for scheduled authenticated crawling?
