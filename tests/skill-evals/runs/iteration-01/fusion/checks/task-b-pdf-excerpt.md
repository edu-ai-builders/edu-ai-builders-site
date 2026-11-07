# B 实际走查输出：PDF 摘录分数练习

目标：为基础分数练习规划家庭手机产品；年龄未给定，暂假设孩子已认识1/2与1/4，家长可调整。

| 候选 | 证据 | 使用与边界 |
|---|---|---|
| evidence-search 1.0.0 | 已读全文 | 比较与来源记录，当前仅本地三候选 |
| lesson-planner 2.0.0 | 已读全文 | 流程/数据/验收，按用户要求覆盖答案优先与付费依赖 |
| pdf-helper 1.1.0 | 已读全文 | 记录文件/页/文本/不确定性，无工具时用粘贴文本 |

输入记录：file=fractions.pdf；page=user-reported 2；text=“1/2 + 1/4”；uncertainty=未独立检查页面、版式或其他题目。只覆盖这一段用户文本，不宣称读过PDF。

初版：作者审校的分数题库、预写双语提示、确定性分子/分母变式；用整数最大公约数约分和交叉相乘判定等值，无付费模型。尚不做自动PDF导入。

屏幕：360px单列，44px操作目标；初题 `1/2 + 1/4 等于多少？ / What is 1/2 + 1/4?`，先输入与提交；不展示3/4。提示1 `先把两块分成同样大的小块 / Make the pieces the same size.`；提示2 `1/2 可以写成 2/4 / Write 1/2 as 2/4.`；最终解释 `2/4 + 1/4 = 3/4 / Add the fourths: 2/4 + 1/4 = 3/4.`。家长详情页看来源与提示使用。

流程：unattempted→attempted→hint1→hint2→explanation，答对可进solved；主动请求提示先邀请尝试。语言切换保持输入与提示级别。

数据：problem={id:'frac-1',topic:'fraction-addition',prompt:{zh,en},expectedAnswer:{numerator:3,denominator:4},hints:[{zh,en},{zh,en}],explanation:{zh,en},provenance:{file:'fractions.pdf',page:2,pageStatus:'user-reported',text:'1/2 + 1/4',uncertainty:'not inspected'}}；attempt={problemId,learnerInput:'2/4',correctness:false,highestHint:0,locale:'zh'}。0分母应报输入错误；6/8应按等值判对；初始载荷不包含内部答案。

验收：初屏答案隐藏；输入2/4→incorrect且不揭答案；提示逐层；输入6/8→solved；输入3/0→输入格式错误；语言切换保留最高提示；360px无横向溢出；来源页面标为用户自报，不能写“已核第2页”。本次为计划走查，未执行应用行为。

学习效果假设：视觉/通分提示能帮助解释同分母相加，需后续新题迁移观察，功能正确不构成证明。缺口：请家长核对摘录和分数先备知识；若要完整导入须另提供纯文本或真实可用工具。
