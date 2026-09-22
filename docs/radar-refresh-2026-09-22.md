# Public directory refresh — September 22, 2026

Source: existing `apps/radar/data/registry.jsonl` and `skills.jsonl`; output: `public/data/radar/catalog.json`. The separate Radar source repository and GPT-hosted website were not modified. This refresh updates existing entries, not a new discovery crawl.

## Results

- 3,644 existing entries: 2,323 repositories/tools, 629 datasets, 319 benchmarks, 242 resource lists, 131 Skills.
- 3,579 unique repository identities checked via the authenticated public GitHub REST API. 3,471 succeeded (including repositories used only by Skills); 108 returned HTTP 404.
- Of the 3,513 repository directory entries, 3,405 refreshed successfully.
- 123 of 131 Skill name/description declarations refreshed from their current default branch. Each successful check records the manifest Git blob SHA. Two paths returned 404; six files lack the required name/description frontmatter.
- 3,528 directory entries refreshed; 116 retained their last successful observation and check date. No failed check gets a new verification date. 23 historically unverified repository candidates remain excluded.
- 1,029 entries changed star counts, 1,912 changed last-push timestamps, and 26 changed descriptions. Changes excluding check timestamps occurred in 2260 entries (counts overlap by field).
- Dataset and benchmark updates cover public repository metadata only. No dataset downloads, content-version verification, benchmark reruns, or Skill instruction execution occurred.

## Notable observations

- `BDIC-Learning-Hub/BDIC-SE-KnowledgeBase` now resolves by stable repository ID to [BDICFun/bdicfun.github.io](https://github.com/BDICFun/bdicfun.github.io); the website record follows the rename.
- Refreshed declarations include [ResearchClaw](https://github.com/AlphaLab-USTC/ResearchClaw/blob/main/SKILL.md), [exam-cram-coach](https://github.com/ZeKaiNie/universal-examprep-skill/blob/main/SKILL.md), and [Anthropic academy-guide](https://github.com/anthropics/skills/blob/main/skills/academy-guide/SKILL.md).
- Five repository entries newly returned 404 since the previous snapshot: Cyber-Gwen/TeacherGPT, Good-Way-ZJU/CCFCal, rajgupta2/SkillHub, LittleAlety/chemai-8.23-, pranavparekhcontent/academic-file-app. A 404 does not establish whether a repository was deleted or made private.
- `hashintel/hash` no longer exposes the recorded `.codex/skills/zod/SKILL.md` path; no matching zod Skill appeared in its current tree.
- `ZeKaiNie/universal-examprep-skill/locales/en/SKILL.md` is gone. The current `full/locales/en/SKILL.md` is a compatibility document without a Skill declaration, so it was not silently substituted. The root Skill remains available and freshly checked.
- Six records have unconfirmed declaration formats. Two are ordinary skills/competency documents rather than declared agent Skills; others omit frontmatter or a name. They retain historical provenance and show an explicit format warning, rather than being marked verified.

## Maintenance and publication

The refresh now checks Skill declarations with `--skills`, preserves previous successful metadata on failure, stops on authentication/rate-limit errors, and replaces the public file atomically. Runtime code never executes downloaded Skill instructions.

Next.js and eslint-config-next were upgraded within major version 16 to 16.3.6 and compatible dependency fixes applied. `npm audit` reported zero known vulnerabilities after this change.

The user authorized updating and pushing `main` to publish the site. Existing Vercel project: `edu-ai-builders-site`; production domain: `edu-ai-builders.dev`. It has no Git integration, so a validated production deployment through the existing project is required in addition to the main push.

## Validation

- 48 Node tests passed, including directory consistency/filtering, bilingual courses, Atlas relations and existing tools.
- 3 Python refresh tests passed, covering declaration parsing and preservation of prior successful data.
- Translation coverage: zero untranslated authored strings.
- ESLint and the Next.js 16.3.6 production build passed.
