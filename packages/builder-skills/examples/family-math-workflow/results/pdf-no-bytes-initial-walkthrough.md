# PDF缺失工具时的家庭数学计划 / Family math plan with unavailable PDF extraction

执行类型 / Execution type: actual manual task walkthrough using generated instructions and the raw boundary input; no extractor/application/browser execution.

PDF状态 / PDF status: filename `family-worksheet.pdf` was supplied, but bytes, visible pages and extracted text were not available. Extraction is BLOCKED. No PDF task, page number, citation, answer, topic or ownership claim can be inferred from the filename. The product-planning step can still finish with clearly independent material.

目标与假设 / Goal and assumptions: plan a bilingual mobile-friendly family math practice product. Builder: family tool maker; users: family members. Initial version needs no paid models, compares at most three candidates and requires a submitted attempt before hints. Unknown: actual worksheet math topic, problem content and material rights. Adjustable assumption: responsive browser page; no grade, curriculum, session duration or fixed question count. An independently authored multiplication example below tests the interaction only and does not represent the PDF's contents.

候选 / Candidate: ONE independent static practice-page route, proposal v0.1 dated 2026-10-12. Evidence: filename and unavailable-tool state from supplied input; all practice material below independently authored. Role: complete first prototype without importing PDF. Input/output: owned/authored reviewed problem record → local learner state and requested feedback. Dependencies: ordinary browser and deterministic local checking; no extractor, paid model, catalog or backend. Terms: no PDF material incorporated; its rights remain unresolved. Fit: useful bounded prototype now. Gap: worksheet-specific alignment cannot yet be claimed. Next check: obtain user-selected transcription with its true page/source, or later use an available extractor followed by manual math/rights review. No catalog search or extra alternatives performed.

独立演示题 / Independent demo, NOT FROM PDF: “3盒积木，每盒4块，共多少块？ / There are 3 boxes of blocks with 4 blocks in each. How many blocks in total?” Answer: `3×4=12` blocks. Provisional domain: whole-number input for this one demonstration; user can replace it with the actual worksheet topic later. It does not impose a curriculum or problem count.

交互 / Interaction:

| 阶段 | Stage |
|---|---|
| 输入答案并提交 | Enter an answer and Submit |
| 先试着提交答案 | Try submitting an answer first |
| 答案已记录 | Answer recorded |
| 提示1：数一数有几组、每组几块 | Hint 1: Count the groups and the blocks per group |
| 提示2：写成4+4+4或3×4，先试算 | Hint 2: Write 4+4+4 or 3×4 and try calculating |
| 查看答案：12块积木 | Reveal answer: 12 blocks |
| 重新开始 | Reset |

Fresh Help/Hint has only the attempt prompt, no hint or answer. A valid nonempty whole-number submission creates a current-problem attempt and a neutral acknowledgement. Hints are optional requested stages after that attempt; for the demo choose two, with repeated requests capped. Reveal is explicit after the chosen stages and evaluates the latest attempt. Invalid/blank submission never unlocks. Problem edit/Reset clears learner state; zh/en switch preserves state. No content is silently obtained from PDF.

数据与接口 / Data and interfaces: `{problemId, task:{zh,en}, exactAnswer, authoredHints:[{zh,en}], source:{kind:"independently-authored",page:null}}` plus UI `{draftAnswer, attempts[], hintLevel, answerVisible, locale}`. All math remains deterministic. Optional later adapter: `{extractedText, originalFileId, truePageRef, rightsObservation}` → math/format review → approved problem record. If extraction fails or rights/math validation is unresolved, keep the independent demo and show “无法读取PDF，当前使用独立演示题 / PDF unavailable; using an independently authored demo.” Never overwrite a current practice task with unreviewed extracted text.

手机与构建 / Mobile and build: one column, wrapped Chinese/English labels, proposed 44px touch controls, keyboard/focus and nonrevealing announcements. First build the authored bilingual interaction, then attempt/hint/reset checks, then narrow-screen validation. PDF import remains optional; it does not delay a useful initial prototype or require paid models.

验收状态 / Acceptance status: manual planning fallback PASSED: no fabricated PDF contents; one candidate; no paid model/backend/extractor dependency; both language flows provided; Help guard matches ordinary hint guard. The PDF extraction itself is BLOCKED. Application checks are NOT RUN: 320/375px layout, keyboard, blank/invalid attempt, Help before attempt, hint repeats, locale changes, resets, reveal mathematical correctness. No PDF-derived task accuracy can be checked until actual source text exists.

实际推演 / Actual manual walkthrough: file cannot be read → label extraction blocked → retain independent demo; fresh Help keeps hintLevel 0; blank submission remains locked; submitting 11 records an attempt; requested hints move 0→1→2→2; reveal uses exact 12 blocks; switching language preserves stage; optional import failure leaves demo unchanged. The arithmetic 4+4+4=12 is the independent demo's truth, not an extracted worksheet answer.

下一步 / Next action: build the independent first interaction, or substitute a user-selected real transcription with a genuine page reference when available. Worksheet-specific design remains explicitly unresolved; the bounded product brief is complete.
