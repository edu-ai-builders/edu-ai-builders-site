# lesson-planner 独立结果

输入：前一步本地来源比较表、用户的双语手机数学家庭 workload；未给真实题目，以下使用原创乘法例，暂假设8岁孩子已经会数数。用户硬约束覆盖原技能答案优先、付费模型、侧栏和模型训练默认。没有生成新 skill。

learner flow：一屏一题先尝试；提交后确认或允许逐层提示；第一次帮助提供思路，第二次提供表示/中间步骤，最后按需解释答案。主动求助先邀请尝试，可展开第一层。中英切换保留输入和提示层。家长来源与练习汇总移至手机详情页。

原创示例：初题“5组，每组3个，共几个？ / 5 groups of 3. How many?”；hint1“画5组 / Draw 5 groups”；hint2“每组画3个，数总量 / Draw 3 in each, then count all”；完整解释“3+3+3+3+3=15 / Five groups of 3 make 15”。初始屏幕不展示15，初始载荷也不带完整答案。

data contract：problem(id,topic,difficulty,prompt.zh/en,expectedAnswer,hints.zh/en[],explanation.zh/en,provenance)；attempt(problemId,input,correctness,highestHint,locale)；provenance 区分 author-provided、user-reported、unknown。数字题规范化数字；分数题拒绝零分母并用等值判定。

第一版：作者审核题库、固定双语提示与确定性参数变式，用算式校验答案，浏览器本地保存练习，无付费模型或模型训练。PDF工具不可用，要求贴纯文本/自有题；源PDF页码保持未知，未宣称覆盖。

可测产品验收：360px单列无溢出、触控目标至少44px；首次加载答案不可见；提交错误答案不揭解答；每次提示只增一层；切换语言不重置输入或提示；正确判分；无在线/付费模型依赖即可完成练习；未知来源明确标记。这是产品验收计划，尚无运行应用。

实际学习效果单列：分组提示可能帮助理解乘法，需观察孩子解释与新题迁移，不能由按钮、题数或通过功能验收推断提高。
