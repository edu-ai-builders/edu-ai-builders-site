# optical simulation 有界候选判断

结论是 unresolved：未在本次所读范围确认任何候选具有光学仿真，当前不推荐其中之一作为已验证光学来源。

预算事先限定每个候选 README + 一个入口文件，最多 2 个文件、1,800 字节、单文件 1,400 字节、12 条命中；只检索 optical、光学、simulation、ray、lens、refraction。三个候选合计读取 6 个不同文件、1,706 字节。所选路径枚举/命中完整，无跳过、无关键词命中；随后静态复读同六个文件判断语义，没有扩大路径。

practice 入口是分数比较与结果解释；retriever 入口按文本子串筛选文档，返回 text/source/score；viewer 入口将 answer 和 citations 拼成 HTML。所读入口没有确认光路、折射率、透镜或波场计算接口。README 与源码的精确引用/哈希见 handoff.json；selected-source-text.json 保留这六个文件的静态阅读内容。

这不是全仓库不存在光学功能的证明。LICENSE、测试、sample_documents 等未选文件没有用于本案例结论；许可证、物理正确性、运行表现与集成均未确认。源码无 Git 元数据，revision=null。候选源码没有被本案例 import 或运行，runtime_tested=false；只运行只读 inventory/verify helper。

预算已用到所选范围边界，停止追加读取与寻找新仓库。下一步保持 unresolved；若未来有新预算，先指定光学模型或入口，再扩大静态追踪、定义单位与已知解的验收；本次没有执行这些后续步骤。

命令与原始结果在 ../commands.json。helper 最终证据/结构验证通过，没有 helper 失败；该验证不证明光学功能或应用运行通过。
