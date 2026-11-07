# practice 重构分析

仅做分析；当前源码未改，学习流程未改。`fractions_logic.py:4–15` 的公开接口是 compare、explanation 与 render。render 同步返回 verdict 和 explanation，先算比较，再算解释；反馈不延后。

现有测试已运行：在 practice 目录执行 `python3 -B test_fractions.py`，退出码 1。两项测试中 comparison 通过，equal_explanation 失败：`explanation((1,4),(1,4))` 实际是 `B has more equal-sized parts.`。这是既有失败；本次要求保留当前返回行为，所以计划保留这个结果，不能为了让旧测试绿灯偷偷修复它。

补充公开接口记录已运行，退出码 0，记录 8 组值与 4 类错误，包括不同分母等值、同分母大小/等值、负分数、零分母和参数形状错误。`characterization-result.json` 是观测快照；`characterize.py` 可接收后续副本的源码路径，将输出与基线 diff。此快照没有声称穷尽所有对象输入。

后续先冻结公开契约和既有失败，再按明确维护需求提取内部 helper，保留函数签名、返回字符串、原始同分母判断、求值顺序、异常与 render 时机；最后在后续工作副本运行旧测试和快照差分，要求无新增失败、无返回行为差异。模块仅 15 行，暂未发现必须增加抽象的理由。未实现重构、未运行后续检查。

handoff.json 提供哈希、精确源码行范围、短引用、接口和分阶段验收。源码没有 Git 元数据，revision=null；哈希绑定本次读取字节。README 描述页面立即展示，但缺少真实 UI 调用方，因此浏览器状态与学习效果未测。MIT 文件已读；复制时保留通知。

命令与原始结果在 ../commands.json；证据/结构 helper 最终验证通过，不能把它当应用测试通过。helper 未出现失败。../inspected-input-integrity.json 确认已读输入字节未变化。
