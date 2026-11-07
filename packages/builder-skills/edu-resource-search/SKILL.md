---
name: edu-resource-search
description: Find and compare skills, repositories, datasets and benchmarks for an education product, with traceable sources and explicit resource gaps. Use when a builder needs resource selection before design or implementation.
license: MIT
metadata:
  version: "0.1.0"
---

# Education Resource Search

Translate the user's product goal into a small, inspectable candidate set. Distinguish the builder from the learner, teacher or researcher using the finished product.

Identify task, audience, subject, platform and hard constraints from the request. Preserve supplied choices; record assumptions where a detail is optional. Ask only for missing information that changes selection.

Use an available catalog API, MCP tools or supplied local metadata. Read [catalog-contract.md](references/catalog-contract.md) for the Edu AI Builders interface. If that catalog is unavailable, use the user's sources or public repository tools and label the search boundary. Never imply a search of a service that was not available.

Search by capabilities and related terms, combining structured filters with bilingual queries. Retrieve compact metadata first; read selected manifests/docs only when needed. Facet hints and repository licenses are discovery evidence, not verified compatibility or component reuse permission. Unknown hard constraints remain unresolved. Keep restricted candidates separate from an eligible shortlist.

Compare complete existing products against component combinations. Assign a role to each candidate, identify substitutes and interface gaps, and cite source URL, observed version/date and evidence type. Stars and name similarity do not establish task fit. Return an explicit gap when no candidate meets the requirement.

Deliver a shortlist with reasons, alternatives, unresolved constraints and the next verification step. When the user wants a plan, provide this evidence to `edu-design-plan` if available, or write the brief directly. Do not install packages or execute third-party skills merely to inspect a listing.
