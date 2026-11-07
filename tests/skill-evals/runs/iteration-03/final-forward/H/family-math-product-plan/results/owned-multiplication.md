# 家庭乘法工具规划 / Family multiplication product plan

执行类型 / Execution type: actual manual task walkthrough by the generating agent, after reading the generated SKILL.md and raw case input. Product planning only; no application runtime or browser executed.

目标 / Goal: help a family member connect equal groups to multiplication by attempting the owned apple problem, requesting support if needed, and explaining the result. Builder / 开发者: the person making the family tool; users / 使用者: family members. No grade assigned. Adjustable assumption / 可调整假设: a responsive browser page is the first artifact because only mobile friendliness, not an app framework, was specified.

硬约束 / Hard requirements: Chinese and English; mobile-friendly; no paid models in the initial prototype; at most three compared options; a submitted attempt before every hint route. Preferences, session duration, curriculum and number of future questions are unspecified.

资源选择 / Resource choice: ONE compared candidate: independently authored HTML/CSS/JavaScript practice page, proposal v0.1 dated 2026-10-12. Evidence: user-supplied owned task was actually read; platform route is a proposed independent implementation, not an inspected external product. Role: complete first interaction. Input: bilingual owned problem plus exact answer/hints; output: local UI state and practice feedback. Dependencies: browser DOM and deterministic local math; no paid inference or server. Terms: user states ownership of the question; proposed code would be independently authored; no catalog material is incorporated. Gap: implementation and mobile preview have not been executed. Next verification: build one screen and run the acceptance below. No catalog or service was searched and no additional alternatives were compared.

题目与界面 / Task and UI:

| 中文 | English |
|---|---|
| 有6袋苹果，每袋7个，共多少个？ | There are 6 bags of apples with 7 apples in each bag. How many apples are there in total? |
| 苹果总数 | Total apples |
| 提交 | Submit |
| 提示 | Hint |
| 查看答案 | Reveal answer |
| 再试一次 | Try again |
| 请填写一个非负整数 | Enter a nonnegative whole number |
| 先试着提交答案 | Try submitting an answer first |
| 答案已记录，可以继续尝试或请求提示 | Answer recorded. Try again or request a hint. |

流程 / Flow: show the task and answer box → enter a valid whole-number answer and Submit → record attempt, show neutral acknowledgement → optionally request Hint 1 → optionally Hint 2 → explicitly Reveal answer. For this example choose two hints; future problems choose their own count. Do not reveal correctness or solution on Submit. Reveal becomes available after a submitted attempt and the chosen hint stages. A correct early attempt may still proceed through hints or retry; it never auto-reveals.

- 提示1 / Hint 1: “每袋的数量一样。你有几组？每组有多少个？ / Each bag has the same number. How many groups are there? How many in each group?”
- 提示2 / Hint 2: “把总数写成六个7相加，或者算6×7。先试算，再查看答案。 / Write the total as six 7s added together, or calculate 6×7. Try the calculation before revealing the answer.”
- 查看答案 / Reveal: “6×7=42，共42个苹果。 / 6×7=42: 42 apples in total.” Then compare the latest attempt with 42 and invite the learner to explain how the groups connect to the equation.

数学与数据 / Mathematics and data: this first owned task has nonnegative integer answer `42`, from six groups of seven; quantity unit is apples, not bags. `6×7` and `7×6` have the same product, but the story groups are six bags with seven apples each. Initially accept whole-number input with surrounding whitespace trimmed; reject blank, negative, fractional and nonnumeric entries. This is a proposed UI input domain, not a grade/curriculum constraint. If expressions are later accepted, specify a parser and safety boundary rather than using `eval`.

Problem record / 题目记录: `{id:"owned-apples-6x7-v1", task:{zh,en}, answer:{type:"integer",value:42,unit:{zh:"个苹果",en:"apples"}}, hints:[{zh,en},{zh,en}], source:{kind:"user-owned",page:null}}`. Answer data lives locally and stays out of visible UI before reveal; this is not a guarantee against inspecting client data.

Learner state / 练习状态: `{problemId, draftAnswer:"", attempts:[], hintLevel:0, answerVisible:false, locale}`. Submission appends `{problemId,submittedValue}` only after validation. Hint and pre-attempt Help share one guard: attempts for the current problem must exist. Blank Submit, Help and “I’m unsure” alone do not unlock hints. Repeated hints cap at two. Changing task/factors or Reset clears attempts/hints/answer. Locale changes translate display and preserve task, exact values and stage. Redraw never changes learning state. No persistence is required for this first prototype.

手机交互 / Mobile interaction: one column, wrapped bilingual text, answer box above the action row, proposed 44 CSS px minimum touch controls, keyboard/Enter submission with visible focus, text equivalents for any group diagram. Announcements convey “recorded” before reveal, not hidden correctness. Do not show an already counted 42-object total before the learner submits.

构建顺序 / Build sequence:

1. Build the owned bilingual static task screen and deterministic input/answer rules without paid models.
2. Add attempt-gated hints/reveal and state reset; keep problem data and learner state separate.
3. Check narrow layout, keyboard, bilingual copy and math; then decide whether more owned problems are needed. PDF import, catalogs and models are optional later work.

验收计划 / Planned acceptance: first-load Help and Hint return only the attempt prompt; blank/invalid answer does not unlock; submitted `40` and `42` both record valid attempts without auto-reveal; hints stay at two on repeated clicks; reveal reports current attempt and 42 apples; Reset/new task clears; zh/en switch retains state; 320px and 375px widths wrap without clipped controls; keyboard/focus and accessible announcements do not expose solution early. These are not executed application checks.

实际推演 / Actual manual walkthrough: evaluated state sequence fresh→Help (locked), blank→Submit (invalid/locked), 40→Submit (attempt recorded), Hint×3 (levels 1,2,2), Reveal (42 plus incorrect latest attempt), Reset (fresh), 42→Submit (recorded/no reveal), locale change (same state). Arithmetic was checked directly as 7+7+7+7+7+7=42. This demonstrates plan consistency for this case, not a running page, independent evaluator result or learning-effect evidence.

缺口 / Gaps: responsive behavior and implementation remain untested. No missing user detail blocks this bounded planning brief. Exact next action: implement the first static screen and execute the listed behavior/mobile checks.
