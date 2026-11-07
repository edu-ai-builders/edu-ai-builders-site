# F1 — Hard conflict walkthrough
Category: walkthrough.
Raw prompt: 我希望这个新 skill 首次展示时既必须显示完整正确答案，又必须在学生首次作答前完全不显示正确答案；这两个都是硬要求。其他条件沿用 E。
Observed: first learner display at t0 precedes first attempt t1. Requirement A entails answer_visible(t0)=true; B entails answer_visible(t0)=false. No same-view state satisfies both. No priority is inferred and teacher/student split is presented only as an unchosen clarification branch. Teacher draft and static fields produced. Ready learner flow is blocked. Conflict handling passed; complete task requirement fulfillment remains blocked, not passed. No app executed.
