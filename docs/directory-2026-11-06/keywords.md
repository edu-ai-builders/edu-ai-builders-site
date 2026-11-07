# Discovery keyword review

2026-11-06. Status: configurations changed locally. The parent integration owns cursor migration, collection, public export and publishing.

## Product goal

Edu AI Builders supplies a future agent and client with reusable Skills, applications, libraries, data, tutor and model-training benchmarks, open learning materials and knowledge graphs. Coverage includes personal learning, teaching, educational research and system administration. Generic building blocks qualify by a concrete role. Popularity does not establish a role or reuse permission.

The shared [product brief](brief.md) and the earlier [MVP scope](../../../../docs/education-builder-mvp-2026-10-10.md) informed this revision.

## Changes

| Configuration | Before | After | Scheduled use |
| --- | ---: | ---: | --- |
| Builder search families | 18 | 30 | User-query expansion only |
| Builder rotating queries | 54 | 90 | 8 queries maximum per run |
| Directory repository queries | 1 | 24 | Parent integration rotates selected query IDs |
| Legacy repository matrix | 32 | 56 | Optional explicit collector runs |
| Legacy Skill matrix | 6 | 60 | Optional explicit collector runs |
| Builder exact Skill sources | 6 | 8 | Existing bounded source rotation |
| Legacy exact Skill sources | 2 | 4 | Optional explicit collector runs |
| Repository seeds | 32 | 40 | Eight exact additions and two resolved old leads |

The request, manifest and result budgets remain unchanged. Search expansion is broader across runs, not an unbounded crawl. At eight completed Builder queries per run, one pass of 90 queries needs at least 12 runs; failures and budget stops can extend this. This is not a claim of full weekly coverage.

## Search coverage

Each Skill expression below is prefixed with `filename:SKILL.md`. Each repository expression is followed by `in:name,description,readme archived:false fork:false`. Expressions are shown exactly.

| Search family | Skill expressions | Repository expression |
| --- | --- | --- |
| parents | `"home learning"` ; `"家庭辅导"` | `"homeschool" "learning"` |
| teachers | `"lesson planning"` ; `"教案设计"` | `"lesson planning" education` |
| higher-education | `"course design"` ; `"大学课程"` | `"course authoring" university` |
| research | `"literature review"` ; `"文献综述"` | `"research assistant" citations` |
| mathematics | `"mathematical reasoning"` ; `"数学辅导"` | `"math tutor"` |
| science | `"science lesson"` ; `"物理实验"` | `"science education" simulation` |
| languages | `"language learning"` ; `"写作反馈"` | `"language learning" practice` |
| humanities | `"historical sources"` ; `"史料分析"` | `"history education"` |
| arts | `"music education"` ; `"艺术教育"` | `"music education"` |
| computing | `"programming education"` ; `"编程教学"` | `"programming tutor"` |
| accessibility | `"screen reader"` ; `"无障碍学习"` | `"accessible learning"` |
| web | `"web application" accessibility` ; `"前端开发"` | `"learning application" web` |
| mobile | `"mobile application" accessibility` ; `SwiftUI interface` | `"learning application" mobile` |
| desktop | `"desktop application"` ; `Tauri application` | `"learning application" desktop` |
| design | `"instructional design"` ; `"data visualization"` | `"education visualization"` |
| data | `"retrieval augmented generation"` ; `"数据分析"` | `"education assessment"` |
| skill-authoring | `"skill creation"` ; `"技能编写"` | `"agent skills" composition` |
| repo-adaptation | `"repository analysis"` ; `"代码重构"` | `"code adaptation"` |
| self-learning | `"spaced repetition"` ; `"自主学习"` | `"spaced repetition"` |
| educational-research | `"learning sciences"` ; `"教育研究"` | `"educational research"` |
| tutor-evaluation | `"tutor evaluation"` ; `"教学评测"` | `"tutor benchmark"` |
| training-data | `"dataset curation"` ; `"训练数据"` | `"educational dataset"` |
| open-textbooks | `"open textbook"` ; `"开放教材"` | `"open textbook"` |
| knowledge-graphs | `"knowledge graph"` ; `"知识图谱"` | `"educational knowledge graph"` |
| system-admin | `backup restore` ; `"权限管理"` | `"learning platform" deployment` |
| assessment | `"assessment rubric"` ; `"形成性评价"` | `"automatic grading"` |
| learning-analytics | `"learning analytics"` ; `"知识追踪"` | `"knowledge tracing" dataset` |
| biology | `biology "literature review"` ; `"生物教学"` | `"biology education"` |
| chemistry | `"molecular visualization"` ; `"化学教学"` | `"chemistry education"` |
| statistics | `"statistical analysis"` ; `"统计教学"` | `"statistics education"` |

The original 18 family IDs and first 54 Builder query IDs keep their order. A separate `query_revision=2026-11-06` declares changed semantics. Reset old `query_pages` and `query_sample_offsets` before collecting this revision; keep prior registry evidence and provenance. The numeric query cursor can restart at zero. The parent owns this serialized state migration.

## Search leads cannot become capabilities

Removed all five facet arrays from families, queries and source rows. A phrase match supplies search provenance only. In particular, mobile no longer implies iOS, Android and offline support together; RAG no longer implies evaluation and interoperability; a writing word no longer assigns language-learning use. Confirmed facets need independent source evidence and the taxonomy review.

The repository matrices now use neutral `kind_hint=repo`; dataset and benchmark words identify discovery intent only. The classifier must inspect evidence rather than treating the search family as the artifact type. Existing raw records are not relabeled by a configuration edit.

Removed standalone `art`, `history` and `writing` from family expansion words. Kept task phrases such as music education, historical sources and writing feedback. Generic UI, literature, data and administration Skills remain discoverable without inventing education claims. No language, stars or recent-push cutoff excludes stable knowledge resources.

## Exact sources checked

| Source | Discovery role and boundary |
| --- | --- |
| [HKUDS/DeepTutor](https://github.com/HKUDS/DeepTutor) | Personalized tutoring project. The exact public repository identity was checked; no runtime claim. |
| [OpenAI Skills notice](https://github.com/openai/skills) and [current plugin examples](https://github.com/openai/plugins) | The old Skills README now declares deprecation and points to plugins. The current feed selects data-analytics, Zotero and life-science-research Skill roots rather than treating every plugin as an education resource. Per-plugin rights and service dependencies remain separate. |
| [OpenAI Agents Python](https://github.com/openai/openai-agents-python) and [TypeScript](https://github.com/openai/openai-agents-js) | Reusable agent orchestration libraries. Education behavior requires adaptation and evaluation. |
| [OpenAI Evals](https://github.com/openai/evals) | Evaluation framework and benchmark registry. Individual datasets and evaluation protocols need their own review. |
| [GSM8K](https://github.com/openai/grade-school-math) | Math word-problem dataset and reference code. Training and evaluation splits have distinct roles. |
| [Dive into Deep Learning](https://github.com/d2l-ai/d2l-en) | Open textbook with code and mathematical explanations. Book and code conditions need scope-specific review. |
| [JupyterHub](https://github.com/jupyterhub/jupyterhub) | Multi-user learning and research notebook environments, including administration. |
| [OpenMAIC](https://github.com/THU-MAIC/OpenMAIC) | Resolved the existing named lead to the exact public source. |
| [EDUKG](https://github.com/THU-KEG/EDUKG) | Resolved the existing named lead to an educational knowledge graph. Its older push date alone does not establish obsolescence. |
| [MathTutorBench](https://github.com/eth-lre/mathtutorbench) and [Education Dialogue Dataset](https://github.com/google-research-datasets/Education-Dialogue-Dataset) | Existing exact seeds retained. Tutor evaluation and generated teacher-student conversations serve different purposes. |
| [EduData](https://github.com/bigdata-ustc/EduData) | Existing exact seed retained. A dataset loading toolkit and its underlying datasets need separate capability and license review. |

Added seed IDs are `deeptutor-hkuds`, `openai-plugins`, `openai-agents-python`, `openai-agents-js`, `openai-evals`, `openai-gsm8k`, `d2l-open-textbook` and `jupyterhub-learning-environments`. Updated existing `openmaic` and `edukg` identities. A seed alone does not add a source to the public catalog; metadata resolution and review still run.

## Verification and negative examples

GitHub documents that REST code search uses [legacy code search syntax](https://docs.github.com/en/search-github/searching-on-github/searching-code). The matrix uses its supported `filename:` qualifier and quoted multiword terms. It does not use modern web-only regex or code-search repository qualifiers. [REST search limits](https://docs.github.com/en/rest/search/search) still apply.

Three live metadata-only probes completed without incomplete results:

- `filename:SKILL.md "lesson plan"` returned 1,806 hits, including a lesson-plan Skill and a leaked-prompts collection. The latter is a negative example that must not be accepted from phrase match alone.
- `filename:SKILL.md "literature review"` returned 21,312 hits, including medical research Skills and general Skill collections. Research coverage can cross disciplines; roles and provenance still need review.
- `"intelligent tutoring" in:name,description,readme archived:false fork:false` returned 3,867 hits. OATutor and tutoring feedback appeared alongside a course assignment repository. It is valid syntax with remaining README noise.

These probes check compatibility and expose noise; they are not a measured precision score. Counts are a 2026-11-06 observation and can change. Longer queries alone do not establish relevance.

Keep these review examples:

| Candidate | Expected decision |
| --- | --- |
| OATutor | Tutoring application candidate, not dataset because it matched a data query |
| Vercel React performance Skill | Generic frontend capability, not language-learning Skill because its description contains writing |
| X API history or git history | Not evidence of history education |
| Browser accessibility tree tooling | Generic browser capability, not proof of inclusive-learning design |
| EDUKG or a stable open textbook | Review knowledge content and access; do not reject only because code activity is old |
| Leaked prompt collection | Discovery noise; do not ingest or redistribute prompt bodies |

Run `python3 docs/directory-2026-11-06/check-keywords.py` from the website repository. The check enforces budget limits, neutral discovery hints, required workload coverage, current OpenAI source routing and exact seed identities. The parent runs collector and website behavior tests after integrating the other workstreams.

No third-party instructions, datasets or source trees were installed or executed. No public catalog was rebuilt by this workstream. Search-result quality still needs the independent resource and taxonomy gates.
