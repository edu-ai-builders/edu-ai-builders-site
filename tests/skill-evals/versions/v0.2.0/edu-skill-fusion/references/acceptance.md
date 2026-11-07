# Package and task acceptance

## Structural checks

Verify frontmatter/name, relative reference links, package boundaries and scripts if present. Use the agent's available skill validator where possible; no particular tool is required to use this skill. Keep ordinary automatic discovery enabled unless the user asks for explicit-only invocation. UI metadata is optional and must agree with the skill description.

A source-record checker can detect missing source IDs, mismatched hashes, forbidden declared redistribution, absent target files and incomplete delegation fallbacks. It cannot prove that a declaration is true or that the new instructions produce high-quality results.

## Realistic tasks

Use user-like prompts and raw inputs, not a prompt containing the expected solution. Judge outputs against requirements:

- Typical task: does the deliverable serve the workload and include needed input/output contracts?
- Repeated task: does the method stay scoped rather than add source-default extras?
- Missing optional tool/material: is there a useful bounded fallback and an explicit gap?
- Conflicting input: are hard requirements retained or surfaced as unresolved?
- Non-trigger task: does the skill avoid hijacking unrelated work?
- Upstream change: can the record identify what must be reviewed without discarding unrelated method parts?

Keep actual artifacts and results. A self-written checklist is a plan until executed. If an independent evaluator is available and authorized, give it the skill, realistic request and minimum raw materials, without intended answers or prior failures. A walkthrough checks reasoning for that example; executing generated application code checks only that implementation. Neither automatically establishes cross-model performance or teaching outcomes.

## Comparison

Use the same task, constraints and model/tool conditions for orchestration and fusion. Report successful outputs, failures, corrections and actual available token/time measurements. If there is no trustworthy measurement, say it was not collected. Fewer words/files/entry points are not a substitute for measured quality or token savings.
