# 交付契约

1. 家长目标、孩子基础、数学主题、输入范围、明示假设。
2. 最多三个候选的证据比较表和实现选择；证据不足处标为推断。
3. 第一版页面：题目/输入/提交；逐层帮助；完成解释；家长汇总。中英提示示例与 360px 宽度、单列、无横向滚动、触控目标至少 44px 的验收约定。
4. 状态：unattempted → attempted → hint1 → hint2 → explanation；答对可由 attempted → solved；主动求助可由 unattempted → hint1，但先给出尝试邀请。提示请求不是强迫先猜答案。
5. 数据：problem(id, topic, difficulty, prompt.zh/en, expectedAnswer, hints.zh/en[], explanation.zh/en, provenance)；attempt(problemId, learnerInput, correctness, highestHint, locale)。correctness 判定按题型规范化数字/分数；渲染初始题目时不发送完整解答或隐藏答案。来源记录允许 unknown、author-provided、user-reported page，不用假页码。
6. 初版题库与提示由作者审校；参数变式限定数值范围并用确定性算式校验，无付费模型。数据本地保存即可支撑原型，不强加账户或分析服务。
7. 可测产品验收列步骤与期待结果：尝试前答案不可见；每次只展开一层；切换语言保留状态；错误答案不误判；360px 无溢出；所有生成题符合约束；缺工具提示准确。
8. 学习效果单列为假设，用家长/孩子观察和后续研究计划评估，不把完成题数、点击提示等功能指标等同于学习提升。
