# A 实际走查输出：自有乘法题

目标：8岁孩子练习“相同组的总量”；家长看提示使用情况。年龄和题目由测试输入给出，未假设教育效果。

| 候选 | 正文/版本 | 可用方法 | 取舍与缺口 |
|---|---|---|---|
| evidence-search | 已读 / 1.0.0 | 来源可追溯、先比较 | 只比较三项；本次本地证据，未外部搜索 |
| lesson-planner | 已读 / 2.0.0 | 流程/数据/产品验收 | 采用交付方法，覆盖答案优先和付费生成 |
| pdf-helper | 已读 / 1.1.0 | 导入时保存不确定性 | 本例无PDF，仅保持 provenance=author-provided |

第一版：作者审核20道乘法题，确定性参数生成 a∈[2,9], b∈[2,9] 的题；逐题以 a*b 校验。预写成对中英提示；浏览器原型可离线运行，无付费模型或在线API。家长汇总位于独立详情页。账户、模型、PDF导入不进入第一版。

手机屏幕：360px单列，按钮至少44px，无横向滚动。
- 初屏：`6组，每组4颗珠子。一共多少颗？ / 6 groups of 4 beads. How many beads?`，答案输入与“提交 / Submit”“给我一点提示 / Hint”。初屏不展示24，也不把完整答案放进初始客户端载荷。
- 尝试后错误：`先看看有几组 / Count the groups first.` 不自动跳到解答。
- 提示1：`你可以画6组 / Draw 6 groups.`
- 提示2：`每组画4个，再数全部 / Draw 4 in each group, then count them all.`
- 最终解释：`4+4+4+4+4+4=24，因此6×4=24 / Six groups of 4 make 24.`

状态：unattempted→attempted；错误时继续输入或点击依次展开hint1、hint2、explanation；答对由attempted→solved并给解释。主动求助先邀请尝试，可自行进入hint1。中英切换保持输入与提示级别。

数据：problem={id:'mul-6-4',topic:'multiplication',difficulty:1,prompt:{zh,en},expectedAnswer:24,hints:[{zh,en},{zh,en}],explanation:{zh,en},provenance:{kind:'author-provided'}}；attempt={problemId,learnerInput:'20',correctness:false,highestHint:0,locale:'zh'}。判分规范化前后空格与数字，拒绝无法解析输入；非负整数题不接受近似值。

验收步骤/预期：载入题→题干与输入可见，答案不可见；输入20并提交→incorrect而不揭答案；点Hint→只显示第一层；切换English→输入20与highestHint=1保留；再次点Hint→第二层；最终请求解答→24可见；输入24→solved；360px检视→无横向溢出；遍历参数范围→全部题答案符合a*b。以上是待实现产品的验收条件，本次只走查设计，并未执行浏览器交互。

学习效果：假设分组表示能帮助理解乘法；后续邀请家长观察孩子是否能解释新题分组结构。不能从通过上述功能验收推断学习提高。

缺口：题库需要家长审校20条双语文案和难度；无PDF内容需要处理。
