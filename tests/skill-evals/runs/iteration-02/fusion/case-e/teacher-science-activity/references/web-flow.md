# Web 流程 / Web flow

Teacher preparation has full editable material and answer keys. Students use a separate route and role; the learner-facing first display includes only question, input and submit controls. It includes no correct answer, evidence card, revealing title, tooltip, alt text, accessibility label, hidden DOM, JSON payload or side-panel link that discloses either.

States: `awaiting_judgment` → `evidence_available` after a nonblank written judgment and reason are submitted → `revision_submitted` after the revised judgment and supporting evidence → `answer_available` after the revision. Retain submitted text and permit correcting it without erasing the first attempt. Each question starts a new gate; translation toggles never change state. Reload retains the same question state. Teacher previews explicitly select learner state; sharing uses learner view.

Use static teacher-authored content and deterministic validation. If implementing a shared Web application, keep unrevealed evidence/answers behind the state and role check, including on the server response; do not send hidden answers before submission. A paper/text walkthrough simulates these states and does not verify server enforcement. The skill designs a Web activity and does not itself install, publish, or deploy an app.

中英对应：`awaiting_judgment` = 待判断（仅问题与输入）；`evidence_available` = 判断已交，可看证据；`revision_submitted` = 已修订；`answer_available` = 可看教师审核答案。中文/英文切换不改变状态。首次答案与证据均不出现在学生数据或界面中。
