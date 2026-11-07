# E1 — Typical task walkthrough
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
