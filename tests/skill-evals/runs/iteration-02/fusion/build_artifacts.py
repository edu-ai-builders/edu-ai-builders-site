from pathlib import Path
import hashlib,json,copy
root=Path('/private/tmp/edu-skill-evals-20261012')
out=root/'candidate-fusion'
fixtures=root/'fixtures/skills'

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,s):
 p.parent.mkdir(parents=True,exist_ok=True);p.write_text(s,encoding='utf-8')
def js(p,o): write(p,json.dumps(o,ensure_ascii=False,indent=2)+'\n')
inputs=[p for b in [fixtures,root/'candidate/edu-skill-fusion'] for p in b.rglob('*') if p.is_file()]
js(out/'input-hashes-before.json',{str(p.relative_to(root)):sha(p) for p in inputs})
pkg=out/'case-e/teacher-science-activity'
requirements=[
 ('R1','为教师科学活动设计创建独立 skill，触发范围只限该重复工作。'),
 ('R2','交付教师与学生可用的中英双语内容；Web 是目标平台。'),
 ('R3','每次最多两个候选；没有可读来源时可交付零候选和缺口，不能凑十个。'),
 ('R4','学生先写出判断并提交，再看证据；答案和证据均不得提前泄露。'),
 ('R5','初版不得依赖付费模型；使用教师预编写材料和静态规则。'),
 ('R6','PDF 工具目前不可用：不能声称提取、页码覆盖或要求该工具作为依赖。'),
 ('R7','premium-planner 仅是目录线索；不复制或推断未读实现。'),
 ('R8','不得强制数学分层提示，也不得并入所有来源触发词。'),
 ('R9','原始来源保持不变，记录身份、许可、方法取舍、目标与维护映射。'),
 ('R10','交付新 skill、可维护的 fusion-record.json、至少两个任务走查并运行包内 helper。')]
sources=[]
for sid,folder,version,state,permission,scope,files in [
 ('evidence','evidence-search','1.0.0','full-method','redistributable','SKILL.md instructions; MIT notice retained',['SKILL.md','LICENSE']),
 ('planner','lesson-planner','2.0.0','full-method','redistributable','SKILL.md instructions; MIT notice retained',['SKILL.md','LICENSE']),
 ('pdf','pdf-helper','1.1.0','full-method','redistributable','Optional fallback instructions only; runtime extractor unavailable; MIT',['SKILL.md','LICENSE']),
 ('premium','link-only','not stated','metadata-only','unknown','Catalog description only, no reusable implementation or permission supplied',['SKILL.md'])]:
 sources.append(dict(id=sid,version=version,state=state,files=[dict(path=f,sha256=sha(fixtures/folder/f)) for f in files],reuse=dict(permission=permission,scope=scope,attribution='Edu AI Builders contributors, 2026' if permission=='redistributable' else 'catalog identity only')))

def dec(i,s,m,a,req,why,targets): return dict(id=i,source_id=s,method=m,decision=a,requirement_ids=req,reason=why,targets=targets)
decisions=[
 dec('D1','evidence','Read selected methods, preserve source identity/version/terms/gaps and compare before planning','transform',['R3','R9'],'Replace ten-source minimum with zero to two total candidates; inspection still precedes implementation claims',['SKILL.md','references/output-contract.md']),
 dec('D2','planner','Correct-answer-first flow','transform',['R4'],'Gate evidence and correct answer after submitted judgment; preserve explanation as a revision step',['SKILL.md','references/web-flow.md']),
 dec('D3','planner','Paid model variable practice','remove',['R5'],'No paid model in first version',[]),
 dec('D4','planner','Source side panel','transform',['R2','R4'],'Teacher panel retains references; learner panel reveals evidence only after judgment',['references/web-flow.md']),
 dec('D5','planner','Learner flow, data contract, product acceptance distinct from learning outcomes','keep',['R2','R10'], 'Concrete Web activity output and measurable product checks serve teachers',['references/output-contract.md','references/web-flow.md']),
 dec('D6','planner','Model-training experiment and broad subject support','remove',['R1','R8'],'Science activity scope does not need model training or universal subject triggers',[]),
 dec('D7','pdf','Missing extractor fallback','transform',['R6'],'Use author-provided plain text/examples with explicit coverage gap; do not extract PDF',['SKILL.md','references/output-contract.md']),
 dec('D8','premium','Proprietary planner listing','reference',['R7'],'Preserve discovery clue only; no body was supplied and no method is redistributed',['references/sources-and-maintenance.md']),
 dec('D9',None,'Teacher-authored bilingual science activity and static Web states','independent',['R1','R2','R4','R5','R8'],'Author from user requirements; no compulsory mathematics hints',['SKILL.md','references/web-flow.md','references/output-contract.md']),
 dec('D10',None,'Case execution and hash-pinned maintenance','independent',['R9','R10'],'Transparent task walkthroughs and provenance checks allow future review',['references/sources-and-maintenance.md'])]
write(pkg/'SKILL.md','''---
name: teacher-science-activity
description: Design bilingual Chinese-English science activities for teachers using Web delivery, at most two evidence candidates, and student judgment before evidence. Use for creating or revising these teacher activities; exclude general tutoring, other subject planning, model training, and website deployment.
license: MIT
metadata:
  version: "0.1.0"
---
# 教师科学活动设计 / Teacher science activity design

## 输入与范围 / Inputs and scope
收集年级、科学问题、活动时长、教师提供的证据/文本和设备条件。缺少非关键字段时注明假设并继续；缺少关键证据时交付有限设计与待补项，不能虚构外部来源。Ask for grade, question, duration, teacher evidence/text and available devices; state optional assumptions, and preserve missing evidence as a gap.

每次最多两个候选，总数包括额外例子和备选资料。先比较，再写活动。读到的方法与仅有目录线索分开；来源实现能力需要实际检查。Each response has at most two total candidates. Compare before planning; distinguish inspected content from catalog clues.

## 工作方法 / Method
1. 明确一个可用证据检验的科学问题，给出中英对应措辞和可观察结果；不要强制数学分层提示。Define a testable science question with bilingual wording and an observable outcome; do not require tiered math hints.
2. 用零到两个候选表记录来源、版本/日期、材料类型、可读取范围和缺口；没有检索工具时只用用户材料或独立编写示例，标清“示例/非实测”。Compare zero to two candidates with identity, version/date, material, readable scope and gaps; use supplied materials or explicitly authored examples if search is unavailable.
3. 写教师准备说明与独立的学生流程：学生先写判断及理由并提交；提交后才能看证据；再修订判断并解释证据；最后展示教师审核的答案与其适用范围。Prepare teacher instructions and a separate learner flow: written judgment and reason → submit → evidence → revision and evidence-based explanation → teacher-reviewed answer and limits.
4. 初版用教师预编写双语文本、数据卡和静态规则，不依赖付费模型。Web 状态与数据契约见 [web-flow.md](references/web-flow.md)。Use teacher-authored bilingual text, data cards and static rules with no paid model dependency.
5. PDF 工具当前不可用：接受教师粘贴的文本、截图转述或已提供例子；注明未读取 PDF 和未验证页码，不假称完整覆盖。PDF tools are unavailable: accept teacher text/transcriptions/examples and record unverified pages/coverage.
6. 输出 [output-contract.md](references/output-contract.md) 中的完整交付，检查双语、候选数、判断门控、工具缺口和可观察验收；教学成效必须另行实测。Deliver the output contract and check bilingual completeness, count, attempt gate, tool gaps and observable acceptance; learning effects require separate measurement.

出现用户硬要求互斥时保留原文，标记未解决，交付独立可完成的准备项与可选分支；不能偷偷取舍或把草案称为可用。Retain incompatible hard requirements, mark the conflict unresolved, provide independent preparation and explicit branches; never silently weaken either.

来源与变更复核见 [sources-and-maintenance.md](references/sources-and-maintenance.md)。
''')
write(pkg/'references/web-flow.md','''# Web 流程 / Web flow

Teacher preparation has full editable material and answer keys. Students use a separate route and role; the learner-facing first display includes only question, input and submit controls. It includes no correct answer, evidence card, revealing title, tooltip, alt text, accessibility label, hidden DOM, JSON payload or side-panel link that discloses either.

States: `awaiting_judgment` → `evidence_available` after a nonblank written judgment and reason are submitted → `revision_submitted` after the revised judgment and supporting evidence → `answer_available` after the revision. Retain submitted text and permit correcting it without erasing the first attempt. Each question starts a new gate; translation toggles never change state. Reload retains the same question state. Teacher previews explicitly select learner state; sharing uses learner view.

Use static teacher-authored content and deterministic validation. If implementing a shared Web application, keep unrevealed evidence/answers behind the state and role check, including on the server response; do not send hidden answers before submission. A paper/text walkthrough simulates these states and does not verify server enforcement. The skill designs a Web activity and does not itself install, publish, or deploy an app.

中英对应：`awaiting_judgment` = 待判断（仅问题与输入）；`evidence_available` = 判断已交，可看证据；`revision_submitted` = 已修订；`answer_available` = 可看教师审核答案。中文/英文切换不改变状态。首次答案与证据均不出现在学生数据或界面中。
''')
write(pkg/'references/output-contract.md','''# 输出契约 / Output contract

Deliver in this order:
1. Assumptions/gaps / 假设与缺口: grade, duration, materials, access, coverage.
2. Candidate comparison / 候选比较: at most two rows across the whole response; ID, identity/version/date, provenance, inspected or metadata-only status, reuse conditions, fit and gaps. Zero is acceptable when none is readable. Do not conflate teacher evidence candidates with the pinned method sources in the maintenance record.
3. Teacher activity / 教师活动: science objective, preparation, evidence, reviewed answer, bilingual student question and flow. Any invented dataset says illustrative, not observed; do not present it as external research.
4. Web/data contract / Web 与数据: `activity_id`, `question_zh/en`, `judgment`, `reason`, `submitted_at`, `state`, teacher-managed `evidence_zh/en`, `revision`, `answer_zh/en`, source identity and coverage. Learner projections exclude unrevealed fields until their gate opens; teacher key is role-restricted.
5. Acceptance / 验收: count <=2; equivalent Chinese/English; no evidence or answer before judgment submission; evidence after valid attempt; answer after revision; no paid dependency; unavailable PDF coverage explicit. Name test category and actual artifacts. A walkthrough verifies planned behavior, not a running Web implementation or measured teaching gain.
6. Follow-up gaps / 待补项: unread evidence, unclear source terms or missing tools; bound the current output.
''')
write(pkg/'references/sources-and-maintenance.md','''# Sources and maintenance / 来源与维护

`fusion-record.json` pins evidence-search 1.0.0 and lesson-planner 2.0.0 full instructions and licenses, pdf-helper 1.1.0 fallback instructions and license, and the premium-planner catalog stored in link-only/SKILL.md. Premium implementation was not supplied, no version or redistribution permission is asserted, and it is only a future discovery clue; it is not a runtime dependency.

All incorporated MIT methods retain the contributors' license in ../LICENSE. Independently authored portions use the same package license. Keep original sources unchanged. For source drift, find `upstream_map` decision IDs, read changed files, re-evaluate their requirements/targets, rerun affected cases, retain old results, update hashes only after review, and increment the version when the method changes. A missing source leaves coverage incomplete. Unknown new terms do not authorize copying.

The provenance helper checks identity and record consistency only. The case artifacts are task walkthroughs; no model benchmark, token saving, installed skill, application runtime, Web deployment, live search or teaching effect is claimed.
''')
write(pkg/'LICENSE',(fixtures/'evidence-search/LICENSE').read_text())
write(pkg/'requirements.md','''# E WorkloadSpec

Artifact: a new skill because user explicitly requests it and the repeated teacher workload changes source defaults and triggers. Inputs: teacher science question, grade, time, evidence text/data and Web constraints. Outputs: bilingual activity, bounded comparison, learner flow, data contract, acceptance, fusion record and case artifacts. Excludes routine tutoring, mathematics-only scaffolds, training models, automatic tool installation and deployment.

All R1–R10 in fusion-record.json are hard user constraints. Precedence: explicit user hard requirements > task/tool constraints > optional teacher preferences > source defaults. Assumptions: no live search needed for supplied-data walkthroughs; Web is a designed target rather than a requested implementation; no PDF extraction or premium body is available.

Source conflicts: ten-source minimum becomes <=2; answer-first becomes judgment-first; paid generation is removed; model training and broad subject triggers are removed. MIT attribution is retained. These are source-default changes, not weakened user conditions.
''')
write(pkg/'fusion-decisions.md','\n'.join(['# Fusion decisions before drafting','']+['- '+d['id']+': '+d['decision']+' — '+d['method']+'; '+d['reason'] for d in decisions])+'\n')
case1='''# E1 — Typical task walkthrough
Category: walkthrough, executed by the package author; not application runtime or independent execution of the generated skill.
Raw prompt: 五年级，20 分钟。设计“纸飞机机翼更宽是否一定飞得更远”的 Web 活动。教师给出相同纸张两组试飞记录：窄翼 3.2/3.5/3.1 米，宽翼 3.4/3.0/3.3 米。中英双语。

Assumptions: teacher-supplied classroom sample; illustrative use in this walkthrough, not independently measured. No live research retrieval.
Candidate comparison before activity: one candidate C1, teacher flight records, supplied text, no version/date supplied, all six values readable, no PDF, no external research claim. No second source is invented.

Teacher objective / 教师目标: compare a claim against a small controlled sample; discuss variability and limits / 用小样本判断主张并讨论波动与局限。准备相同纸张，保持投掷者和场地一致；记录真实活动时的控制条件。
First learner display: “Wider wings always make a paper airplane fly farther. Do you agree? Write your judgment and reason. / 宽机翼总能让纸飞机飞得更远。你同意吗？先写判断和理由。” Only inputs and submit; six distances and answer are absent.
Simulated student submission: “不同意，因为还有投掷角度。/ I disagree because launch angle may matter.” State moves to evidence_available.
Evidence reveal: narrow wing 3.2, 3.5, 3.1 m; wide wing 3.4, 3.0, 3.3 m / 窄翼与宽翼试飞记录。Student revision: “这组记录不能支持总是更远；两组结果有重叠。/ This sample does not support always farther; results overlap.”
Teacher-reviewed answer after revision: “不能从这六次试飞推出‘总能更远’。两组有波动，需更多重复并控制投掷条件。/ These six flights cannot establish always farther. Both groups vary; repeat trials and control launch conditions.” This bounded answer uses provided data and is not a claim that wing width has no effect.
Data contract: activity_id=flight-01; question_zh/en supplied; initial judgment/reason retained; state transitions per web-flow; evidence/answer restricted until gates.

Observed checks: one candidate <=2; bilingual question, judgment, evidence, revision and answer; learner sees no evidence or answer until written submission; answer after revision; static prewritten content and no paid model; no math hints required. All pass in this reasoning walkthrough. Real Web payload/role/reload tests and actual learning outcomes are not run.
'''
case2='''# E2 — Missing PDF and catalog-only boundary walkthrough
Category: walkthrough, executed by the package author; not actual PDF extraction.
Raw prompt: 六年级 15 分钟科学活动，主题是光与植物生长。只有一本 PDF 和 premium-planner 的目录介绍，PDF 工具没有；教师能提供这段文字：“同种幼苗，其他条件相同，A 每日照光 8 小时，两周长高 4 厘米；B 每日照光 2 小时，长高 1 厘米。”请做中英双语 Web 草案。

Candidate table: C1 teacher's pasted A/B text; readable excerpt, document version/page not supplied, full PDF coverage unavailable. C2 premium-planner catalog; metadata only, no method/version/permission supplied; excluded from substantive evidence and implementation. Total two, no extras.
Assumption/gap: teacher excerpt is the only usable evidence; observations are teacher-provided, not independently verified. No PDF extraction, full page citation or premium implementation is asserted.
First learner display: “More daily light caused these seedlings to grow taller. Is this claim supported? State a judgment and why. / 每天更多光照使这些幼苗长得更高。这条主张有支持吗？写出判断和理由。” No data, correct answer, premium suggestion or revealing alt text.
Simulated submission: “可能有支持，但需比较其他条件。/ Possibly, but other conditions must be compared.” Then reveal A/B data and stated control conditions.
Revision: “此小样本与更多光照有关，但不足以证明所有植物的规律。/ This small sample is consistent with more light helping, but cannot establish a rule for all plants.”
Reviewed answer after revision: “在给出的同种、相同其他条件样本中，较多光照组长高更多；重复组数、测量误差等未提供，不能推广为所有植物或所有光照量。/ Under the stated same-species and controlled conditions, the higher-light group grew more; repetitions and measurement error are unspecified, so do not generalize to all plants or light levels.”
Web contract follows web-flow; all content teacher-authored/static. Follow-up: teacher supplies source identity and page text if citation is required; bounded draft remains useful without PDF or premium tools.
Observed checks: two total candidates; catalog not fused or called; PDF gap explicit; judgment precedes evidence, answer after revision; bilingual content, no paid model; no tiered math prompt. Passed as walkthrough. Source authenticity, PDF coverage and implemented Web enforcement remain unverified.
'''
case3='''# E3 — Non-trigger walkthrough
Category: walkthrough.
Raw prompt: 帮我改写一封求职邮件，不涉及课堂科学活动。
Observed routing: teacher-science-activity does not trigger. A normal email-writing workflow can answer the request without candidate science evidence, Web learner gates or source-method fusion. Passed scoped-trigger check; no email was sent.
'''
write(pkg/'cases/E1-flight.md',case1);write(pkg/'cases/E2-pdf-boundary.md',case2);write(pkg/'cases/E3-non-trigger.md',case3)
cases=[dict(id='E1',kind='normal',prompt='五年级，20分钟，教师纸飞机试飞记录，双语Web活动',expected_behaviors=['<=2 candidates','judgment before evidence','bilingual static activity'],status='passed',method='walkthrough',observed_result='One supplied candidate; student attempt then evidence then revision and bounded answer. No paid tool. Web runtime not tested.',result_path='cases/E1-flight.md'),dict(id='E2',kind='boundary',prompt='光与植物生长；PDF unavailable and premium catalog only; supplied excerpt',expected_behaviors=['explicit PDF gap','no premium body fusion','<=2 candidates','judgment gate'],status='passed',method='walkthrough',observed_result='Two total candidates with only teacher text usable; no extraction or premium method claim. Bilingual bounded draft completed.',result_path='cases/E2-pdf-boundary.md'),dict(id='E3',kind='non-trigger',prompt='改写求职邮件',expected_behaviors=['avoid science activity trigger'],status='passed',method='walkthrough',observed_result='Excluded unrelated mail-writing request from the skill.',result_path='cases/E3-non-trigger.md')]
record=dict(schema_version='edu.fusion-record.v1',readiness='usable',workload=dict(purpose='教师中英双语 Web 科学活动设计',trigger='Create/revise teacher science activities with judgment before evidence',exclusions=['general tutoring','other subject planning','model training','deployment'],inputs=['grade/time/question','teacher supplied data or readable texts','Web constraints'],outputs=['bilingual teacher activity','<=2 candidate table','learner flow/data contract/acceptance','fusion record and walkthroughs'],constraints=[dict(id=i,level='hard',requirement=t) for i,t in requirements],precedence=['explicit user hard requirements','tool/platform constraints','optional teacher preferences','source defaults']),sources=sources,decisions=decisions,conflicts=[dict(id='C1',status='resolved',requirements=['R3'],conflicting_defaults=['evidence-search ten-source minimum'],resolution='Use <=2 total candidates; preserve inspected provenance and gaps'),dict(id='C2',status='resolved',requirements=['R4'],conflicting_defaults=['lesson-planner answer first'],resolution='Student judgment before evidence and answer after revision'),dict(id='C3',status='resolved',requirements=['R5'],conflicting_defaults=['lesson-planner paid variable problems'],resolution='Remove paid dependency; static teacher-authored first version')],acceptance_cases=cases,upstream_map=[dict(source_id='evidence',decision_ids=['D1'],review_when=['SKILL.md or LICENSE hash changes; inspect scope/count/provenance terms','rerun E1 and E2']),dict(source_id='planner',decision_ids=['D2','D3','D4','D5','D6'],review_when=['SKILL.md or LICENSE changes; inspect answer order/paid dependency/output contract/triggers','rerun E1,E2,E3']),dict(source_id='pdf',decision_ids=['D7'],review_when=['fallback instructions, terms or tool availability change','rerun E2 without extractor and review before adding dependency']),dict(source_id='premium',decision_ids=['D8'],review_when=['implementation/version or permission becomes available; catalog alone never suffices','inspect new terms and body before any new fusion decision'])],validation_notes=dict(task_category='walkthrough',provenance='pending helper command',application_runtime='not-run',benchmark='not-run',teaching_outcomes='not-run'))
js(pkg/'fusion-record.json',record)

# F: independent fork, preserving both hard requirements and useful preparation.
f=out/'case-f/teacher-science-activity-conflict'
for p in pkg.rglob('*'):
 if p.is_file() and p.name not in ['fusion-record.json','SKILL.md','requirements.md','fusion-decisions.md'] and 'cases' not in p.parts: write(f/p.relative_to(pkg),p.read_text())
write(f/'SKILL.md','''---
name: teacher-science-activity-conflict
description: Prepare a bilingual teacher science activity under unresolved, mutually incompatible first-display answer requirements. Use for this conflict review and safe preparation; learner delivery remains blocked until the user resolves the hard requirements.
license: MIT
metadata:
  version: "0.1.0-draft"
---
# 未解决的教师科学活动草案 / Unresolved teacher science activity draft

硬要求 A：首次展示必须显示完整正确答案。Hard A: the first display must show the complete correct answer.
硬要求 B：学生首次作答前完全不显示正确答案。Hard B: no correct answer is displayed before the student's first attempt.
首次展示是学生尚未作答的同一 learner view 时，A 要求答案可见，B 要求答案不可见，无法同时实现。At that same learner-facing moment, A requires visible answers while B requires no visible answers; both cannot be satisfied.

不得把其中一个降级为偏好、默默改成教师视图、用隐藏答案/剧透按钮声称同时满足，或输出声称已满足两项的可用学生流程。Do not weaken either requirement, silently reinterpret first display as a teacher view, use hidden answers/spoilers to claim both, or label a learner flow usable.

可继续的工作：准备中英问题、最多两个候选比较、教师审核答案、证据及静态 Web 数据结构；PDF 无工具就用教师文本并记录缺口；premium 只作目录线索；不强制数学提示，不依赖付费模型。Keep preparing bilingual questions, <=2 candidate comparison, teacher-reviewed keys, evidence and static Web data; preserve missing PDF/catalog restrictions and no paid model.

这些准备材料仅限教师草案，不向学生首次发布。答案显示时序未决，不能照搬 E 的门控流程作为 F 的已批准实现。Prepared materials remain teacher drafts; do not publish a first learner display or carry E's gate into an approved F implementation.

显式分支（都需要改变/澄清一项要求，尚未选择）：
- A 优先：首次显示完整答案；B 无法成立。A first: show full answer initially; B fails.
- B 优先：学生作答前不显示答案；A 无法成立。B first: hide answer before attempt; A fails.
- 澄清两个展示是否指不同受众：教师首次展示可含答案，学生首次展示不可含答案。此解释只有用户确认后才可采用。Clarify whether they refer to distinct teacher and learner views; adopt this interpretation only after user confirmation.

最小待答问题 / Smallest needed question: 两项“首次展示”是否分别指教师视图和学生视图？若指同一学生视图，你要修改哪项硬要求？Do the two first displays refer to teacher and learner views separately? If they refer to the same learner view, which hard requirement should change?

完整准备、证据和未执行项见 [conflict-preparation.md](references/conflict-preparation.md)，来源维护见 [sources-and-maintenance.md](references/sources-and-maintenance.md)。Readiness stays draft until the hard conflict is explicitly resolved and the selected flow is checked.
''')
# remove E flow commitment from F docs while retaining useful static contracts
write(f/'references/web-flow.md','''# F Web preparation / Web 准备
No learner-facing first-display answer policy is implemented or approved. Prepare static fields `activity_id`, bilingual question/evidence/answer, learner judgment/reason/revision, and role/state fields. The answer timing remains unresolved; do not ship a state transition that claims to satisfy both hard requirements. Paid models are not required. Actual Web execution is not run.
''')
write(f/'references/output-contract.md','''# F output contract
Deliver teacher-only bilingual question, evidence and reviewed key, a <=2 candidate comparison, PDF/catalog gaps, static data fields, explicit unresolved hard conflict, branch consequences and smallest clarification. Do not deliver a ready learner answer-display flow or assert both conditions passed. Candidate inspection and licensing constraints remain as E. Walkthroughs can verify correct conflict handling; learner runtime and answer-order compliance are blocked.
''')
write(f/'requirements.md','''# F WorkloadSpec
All E conditions apply, plus hard A: full correct answer on first display, and hard B: no correct answer before first student attempt. For the same initial student view these conflict. Neither takes precedence because the user calls both hard. No teacher/learner separation is presumed without clarification. Useful teacher preparation can continue; learner delivery and complete satisfaction are blocked. Artifact is a draft conflict package, not a resolved operational skill.
''')
write(f/'references/conflict-preparation.md','''# F useful preparation / 可继续的准备

Teacher-only activity draft, not a student first display:
Question / 问题: “Do wider wings always make a paper airplane fly farther? / 更宽的机翼是否总让纸飞机飞得更远？”
Evidence / 证据: teacher supplied narrow-wing 3.2/3.5/3.1 m, wider-wing 3.4/3.0/3.3 m. Candidate C1 only; readable text, unknown collection date, no independently verified measurement.
Reviewed key / 教师审核答案: “These trials cannot support ‘always farther’; both groups vary, repeat controlled trials. / 这些试飞不能支持‘总飞得更远’；两组都有波动，需要重复并控制条件。”
Preparation: teacher-authored zh/en text, static data fields, no paid model, PDF not read, premium body not available, no math-tier prompts.

State timing intentionally remains unresolved. Branch A shows this key initially and violates B. Branch B hides it until attempt and violates A. Distinct teacher/learner first views could be a later clarified requirement, but is not a currently authorized interpretation. This document preserves both as hard. No learner application deployed, no teaching outcome measured.
''')
frec=copy.deepcopy(record)
frec['readiness']='draft'
frec['workload']['trigger']='Prepare and review teacher science activity when conflicting hard answer-display requirements block learner delivery'
frec['workload']['outputs']=['teacher-only bilingual preparation','explicit hard conflict and branches','draft skill/record and walkthroughs']
frec['workload']['constraints'] += [dict(id='F-A',level='hard',requirement='首次展示必须显示完整正确答案。'),dict(id='F-B',level='hard',requirement='学生首次作答前完全不显示正确答案。')]
frec['workload']['precedence']=['both user answer-display constraints hard and equal; neither may be dropped','other explicit E requirements','tool constraints','source defaults']
for d in frec['decisions']:
 if d['id']=='D2': d.update(method='Correct-answer-first flow held pending conflicting user requirements',decision='remove',requirement_ids=['R4','F-A','F-B'],reason='Cannot choose an answer timing policy without weakening a hard requirement',targets=[])
 if d['id']=='D4': d.update(method='Teacher-only source/evidence draft',reason='Teacher preparation continues; learner panel answer timing not authorized',requirement_ids=['R2','F-A','F-B'])
 if d['id']=='D9': d.update(method='Teacher-only bilingual content and static fields; learner first display blocked',requirement_ids=['R1','R2','R5','R8','F-A','F-B'],reason='Useful independent preparation does not choose between incompatible hard requirements')
frec['decisions'].append(dec('D11',None,'Retain two incompatible hard requirements and deliver branches','independent',['F-A','F-B'],'No simultaneous answer visibility state exists for same initial learner view',['SKILL.md','references/conflict-preparation.md']))
frec['conflicts']=[c for c in frec['conflicts'] if c['id']!='C2']+[dict(id='F-C1',status='unresolved',requirement_ids=['R4','F-A','F-B'],conflicting_requirements=['Full correct answer visible on first display','Correct answer completely absent before first student attempt'],resolution='No selection made. Learner delivery blocked; teacher-only preparation completed. Ask whether audiences differ or which requirement changes. No silent weakening.')]
write(f/'fusion-decisions.md','\n'.join(['# F decisions','']+['- '+d['id']+': '+d['decision']+' — '+d['method']+'; '+d['reason'] for d in frec['decisions']])+'\n')
write(f/'cases/F1-conflict.md','''# F1 — Hard conflict walkthrough
Category: walkthrough.
Raw prompt: 我希望这个新 skill 首次展示时既必须显示完整正确答案，又必须在学生首次作答前完全不显示正确答案；这两个都是硬要求。其他条件沿用 E。
Observed: first learner display at t0 precedes first attempt t1. Requirement A entails answer_visible(t0)=true; B entails answer_visible(t0)=false. No same-view state satisfies both. No priority is inferred and teacher/student split is presented only as an unchosen clarification branch. Teacher draft and static fields produced. Ready learner flow is blocked. Conflict handling passed; complete task requirement fulfillment remains blocked, not passed. No app executed.
''')
write(f/'cases/F2-preparation.md','''# F2 — Preparation boundary walkthrough
Category: walkthrough.
Raw prompt: 沿用 F 的硬条件；教师提供纸飞机六次试飞文本，不提供 PDF 工具，premium 只有目录。可以先准备什么？
Observed: references/conflict-preparation.md includes one supplied candidate, bilingual question/evidence/key and static teacher data. It marks teacher-only draft and never constructs a student first display. PDF coverage and premium implementation remain unavailable; no paid or math-tier dependency. Both hard answer requirements remain present in SKILL.md and record, readiness draft. Preparation boundary passed; learner timing acceptance blocked. No tool extraction or runtime claim.
''')
write(f/'cases/F3-non-trigger.md',case3.replace('E3','F3'))
frec['acceptance_cases']=[dict(id='F1',kind='boundary',prompt='首次展示完整答案且首次作答前不显示；均为硬要求',expected_behaviors=['retain both hard constraints','report unsatisfiable same-view timing','complete useful preparation','draft readiness'],status='passed',method='walkthrough',observed_result='Conflict formally identified; neither weakened; teacher preparation completed; full learner fulfillment blocked.',result_path='cases/F1-conflict.md'),dict(id='F2',kind='boundary',prompt='F with teacher flight text, no PDF tool, premium catalog only; prepare independently',expected_behaviors=['bounded preparation','<=2 candidates','no silent answer-policy choice','no missing-tool claims'],status='passed',method='walkthrough',observed_result='One candidate; bilingual teacher-only materials and static data, no learner first view or dependency.',result_path='cases/F2-preparation.md'),dict(id='F3',kind='non-trigger',prompt='改写求职邮件',expected_behaviors=['exclude unrelated work'],status='passed',method='walkthrough',observed_result='Science conflict skill does not trigger.',result_path='cases/F3-non-trigger.md'),dict(id='F4',kind='normal',prompt='Deliver a ready learner first view satisfying both A and B',expected_behaviors=['A and B both enforced'],status='blocked',observed_result='Mutually contradictory hard requirements at same initial learner moment; requires user clarification; no implementation run.')]
js(f/'fusion-record.json',frec)
js(out/'input-hashes-after-generation.json',{str(p.relative_to(root)):sha(p) for p in inputs})
print(json.dumps({'case_e':str(pkg),'case_f':str(f),'input_files':len(inputs),'inputs_unchanged':all(sha(p)==json.loads((out/'input-hashes-before.json').read_text())[str(p.relative_to(root))] for p in inputs)},ensure_ascii=False))
