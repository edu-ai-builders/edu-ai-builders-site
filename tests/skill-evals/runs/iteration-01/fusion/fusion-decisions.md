# 逐项融合取舍

| 来源/版本 | 方法 | 取舍 | 目标位置 | 用户需要与冲突处理 | 复用条件 |
|---|---|---|---|---|---|
| evidence-search 1.0.0 | 至少十个来源 | transform | SKILL 选方法 | 用户上限三候选覆盖十来源默认值；不为了凑数扩大比较 | MIT |
| evidence-search 1.0.0 | 描述阅读、来源ID/版本/条款/缺口 | keep | 材料与证据 | 保证选择可追溯；本次读取三个完整正文 | MIT |
| evidence-search 1.0.0 | 规划前比较表 | keep | SKILL 选方法 | 先判断证据再形成计划 | MIT |
| evidence-search 1.0.0 | 元数据可标能力，实现要读来源 | keep | 材料与证据 | 阻止把 premium 摘要当方法或实现证据 | MIT |
| lesson-planner 2.0.0 | 先展示正确答案 | transform | SKILL 设计练习 | 改为先尝试，逐层提示；答案末层按需展示 | MIT |
| lesson-planner 2.0.0 | 付费模型生成变式 | transform | 交付契约 | 作者题库与确定性变式支撑第一版 | MIT |
| lesson-planner 2.0.0 | 侧栏来源 | transform | SKILL 设计练习 | 手机用家长详情页/折叠材料，避免侧栏占位 | MIT |
| lesson-planner 2.0.0 | 模型训练实验 | remove | 无 | 不属于第一版产品计划，增加不必要工具和成本 | MIT |
| lesson-planner 2.0.0 | learner flow、data contract、产品验收 | keep | 交付契约 | 可建设可检查的结果 | MIT |
| lesson-planner 2.0.0 | 学习效果另列 | keep | 交付契约 | 不把产品功能当教育效果证据 | MIT |
| lesson-planner 2.0.0 | 语言/科学/研究/职业等触发 | remove | SKILL description | 新触发从用户家庭数学 workload 推导 | MIT |
| pdf-helper 1.1.0 | 本地提取器 | delegate（条件性） | 材料与证据 | 仅实际存在时调用；本次不可用，不安装、不编造 | MIT |
| pdf-helper 1.1.0 | 文件/页/文本/不确定性 | reference | 材料与证据 | 核查页面与公式；使主体精简 | MIT |
| pdf-helper 1.1.0 | 缺工具时纯文本/自有示例 | keep | SKILL 输入 | 降级仍完成产品结构，未核PDF保持未知 | MIT |
| premium-planner 无版本 | 目录摘要 | remove（方法融合） | 来源记录未评审线索 | 未读正文且无复用许可；不作为第四个比较候选 | 不复用正文 |
| 用户要求 | 中英、手机、尝试/提示、初版成本 | 独立编写 | SKILL 与交付契约 | 用户硬约束，来源无相同默认流程 | 本包 MIT |

本包统一用“候选”“来源”“题目”“练习状态”“产品验收”；来源 skill 的通用范围不进入新触发。未发现未解决的结果冲突；无法核实 PDF 内容作为明确缺口处理。
