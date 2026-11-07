# evidence-search 独立结果

证据范围：本地提供的三个完整技能正文与许可。用户上限三候选覆盖原来源的“至少十来源”；无法外部检索，不补造七个来源。完成比较后才进入下一步骤。

| ID / 版本 | 证据位置 | 组件条款 | 可用方法 | 差距 |
|---|---|---|---|---|
| evidence-search / 1.0.0 | fixtures/skills/evidence-search/SKILL.md 全文 | MIT，保留版权与许可 | 比较、版本/缺口保留；摘要限能力判断 | 十来源默认与用户冲突，采用三上限 |
| lesson-planner / 2.0.0 | fixtures/skills/lesson-planner/SKILL.md 全文 | MIT，保留版权与许可 | learner flow、data contract、产品验收与学习效果区分 | 答案优先/付费模型默认需按用户覆写 |
| pdf-helper / 1.1.0 | fixtures/skills/pdf-helper/SKILL.md 全文 | MIT，保留版权与许可 | 文件/页/文本/不确定性与缺工具降级 | 当前无提取器，不能核页 |

选择：交给 lesson-planner 做规划；采用证据表作为规划输入，用户题目/纯文本作为内容输入。premium-planner 的目录摘要只作为未评审线索，不加入第四个候选，不推断实现，不复用未知正文。实现与学习效果尚未验证，原来源方法存在不等于产品已实现。
