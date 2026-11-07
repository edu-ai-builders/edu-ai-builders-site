---
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
