---
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
