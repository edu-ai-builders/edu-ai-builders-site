# 开发计划: 给孩子做一个分层提示的数学练习页

## 你的需求
双语、移动端优先、逐层提示，先不接付费模型。

- 平台: mobile
- 商业用途: true
- 开发工具: 沿用你已有的目标平台开发环境，先做最小交互；平台适配尚待验证。

## 要做出的成品
一个可以选题、先尝试、再逐层看提示的练习页。

## 候选资源与职责
- zijinz456/OpenTutor: 参考辅导交互；完整产品也可作为替代方案。
  https://github.com/zijinz456/OpenTutor
  版本: f0142f28e8ed1ab4047e16c9aee5c283a6ee98b7
  许可观察: repository: MIT
  复用状态: license-observed; runtime_tested=false
- openai/grade-school-math: 选取少量有来源的数学题，先检查答案。
  https://github.com/openai/grade-school-math
  版本: 3101c7d5072418e28b9008a6636bde82a006892c
  许可观察: repository: MIT
  复用状态: license-observed; runtime_tested=false
- pdf: 需要导入自有 PDF 时，参考资料处理流程。
  https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/pdf/SKILL.md
  版本: 49f948faa9258a0c61caceaf225e179651397431
  许可观察: skill: Apache-2.0
  复用状态: license-observed; runtime_tested=false
- jupyter-notebook: 整理题目检查与评测记录；不要求先训练模型。
  https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/jupyter-notebook/SKILL.md
  版本: 49f948faa9258a0c61caceaf225e179651397431
  许可观察: skill: Apache-2.0
  复用状态: license-observed; runtime_tested=false

## 实现顺序
1. 先用三道自己有权使用的题目做一个静态页面。
2. 将作答、提示和反馈分别建模；每次只显示下一层提示。
3. 再接入题目来源或资料导入，保留题目 ID 与引用。
4. 交给学习者试一次，检查错误反馈与第二次尝试。

## 验收
- [ ] 答案展示前可以先作答；提示不会一次全部揭晓。
- [ ] 题目答案可核对，反馈与当前题目一致。
- [ ] 手机可用，键盘可操作；不必上传学习者身份。

## 资源连接与待确认项
上面的条目是候选与参考材料，按职责选取；不是必须全部安装。核对数据格式、输入输出、依赖、调用费用和资料使用条件。
该计划由场景模板和目录元数据生成；源码适配、实际运行和教育效果需要另行验证。改动目标功能后请重新检查步骤与验收。

## 交给 coding agent 的任务
先核对这个计划与我的需求，标出不匹配和缺失的条件。先实现一条最小学习流程并运行验收；需要 repo 实现证据时使用 edu-repo-adapter。不要把未运行的步骤标为通过。