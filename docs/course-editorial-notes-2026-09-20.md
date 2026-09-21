# Edu AI Builders 课程内容交付说明

交付文件：`/private/tmp/edu-course-content-v2/courses.ts`。

本轮只写 `/private/tmp/edu-course-content-v2/`，没有编辑主站、发布网站、创建仓库或向外部仓库发出 Issue/PR。课程中的操作均是供学习者执行的练习说明。

## 内容规模与兼容性

- 共 8 门、82 节：学习科学 12 节，其余 7 门各 10 节。
- 保留原 5 个 course slug 与全部 15 个 lesson ID，原有提示卡和本地反思卡的代码示例保留。
- 导出 `CourseSource`、`CourseLesson`、`Course`、`courses`、`getCourse(slug)`。读取的原文件结束于 courses 数组，没有其他函数导出；按整合要求补入 getCourse，返回 Course 或 undefined。
- `CourseLesson` 仅增加可选 `module?: string` 和 `figureKey?: string`。所有课时实际填写了 module，未匹配图机制的课时不填 figureKey。
- 每节包含目标、3—4 段正文、具体案例、小步任务、3 项自检、3 选 1 检查及逐项反馈、资料来源。
- 260 段正文均不重复；正文合计 20,349 个中文字符，每节正文 201—311 个中文字符（此统计不含目标、案例、任务、反馈及代码）。
- 原来的两选题已补齐第三项，对应具体误解，不使用统一的“以上都不是”。

## 课程范围与顺序

| 课程 slug | 节数 | 递进目标 |
| --- | ---: | --- |
| learning-sciences-starter | 12 | 领域是什么→已有知识→目标与回想→间隔→范例渐退→认知负担→自我解释→反馈→信心校准→交错辨别→迁移→设计评审 |
| git-first-checkpoint | 10 | 版本与 Git/GitHub→终端位置→工作区/暂存/提交→小提交→历史→忽略规则→分支→合并→冲突→回退 |
| vibe-coding-basics | 10 | 小任务→文件预览→三层网页→HTML→CSS→JavaScript 状态→任务描述→读差异→排错→交付 |
| landing-page | 10 | 来访任务→承诺→证据与状态→内容顺序→语义骨架→视觉规则→手机适配→诚实表单→任务测试→交付检查 |
| personal-learning-assistant | 10 | 回想循环→规则/模型边界→卡片数据→先答后看→本地原型→具体反思→下次计划→数据控制→评价→完整交付 |
| github-starter | 10 | 账号→仓库→README/许可→Fork/clone→远端同步→Issue→PR→评审协作→合并核对→工作交接 |
| web-interactions | 10 | 状态图→事件渲染→表单→校验→结果反馈→可访问性→本地存储→JSON→纯文本预览→完整路径验收 |
| refactor-with-ai | 10 | 定义边界→基线→行为约定→小任务→提取函数→职责分开→测试→差异审阅→回退→交付报告 |

建议路径：零基础先读网页入门和 Git；需要在线协作再读 GitHub；网页入门之后可分别进入首页、互动网页与学习助手；有可运行页面及版本记录后进入安全重构。学习科学可独立从零开始，不要求先会编程。新增排序不会更改已保存的 lesson ID，但首次显示“完成比例”会因课程总课时增加而变化，这是新增课时后的正常分母变化。

## 编辑依据与参考边界

先读主工作区 README 与原 courses.ts，确认目标是原站内容整合，未改 GPT 预览或部署设置。学习科学内容依据本地 `public/learning-sciences/0.2.0/rack.json` 中的机制、适用条件、风险与来源，而不是只复制概念标签。

课程组织参考：

- [VibeHub 课程目录](https://vibe-hub.org/courses)：参考从目标、结构、实现到验收的项目递进，以及 Git 工作流的完整闭环。
- [Datawhale Easy-Vibe](https://github.com/datawhalechina/easy-vibe)：参考先解决真实小问题、补前置知识、完成可展示原型的学习路径。

两者只作为组织参考；本课程的教师情境、中文正文、例题、自检、错误选项和反馈为针对本项目编写，没有复制外部课程正文或沿用外部品牌能力声明。

技术事实优先采用 Git、GitHub、MDN、W3C WAI 官方资料；重构定义和提取函数参考 Martin Fowler 原站，自动断言参考 Node.js 官方资料。通过浏览检查的关键页面包括 Git restore/merge/revert、GitHub 账号/仓库/Fork/PR 流程/许可/Issue、MDN 事件/模块/localStorage/校验/textContent/本地服务器/排错、WAI 表单和 Fowler 重构说明。部分官方页面会跳转到新版文档路由，这是来源站的正常重定向。其他研究链接继承 rack.json 的原始 DOI/官方报告记录，不把“链接在来源库中”写成“本轮重新阅读了全部论文全文”。

主要研究依据包括 [How People Learn II](https://doi.org/10.17226/24783)、[课堂提取练习综合研究](https://doi.org/10.1037/bul0000309)、[分散练习综合研究](https://doi.org/10.1037/0033-2909.132.3.354)、[数学范例效应综合研究](https://doi.org/10.1007/s10648-023-09745-1)、[反馈综合研究](https://doi.org/10.3389/fpsyg.2019.03087)、[交错练习的调节因素](https://doi.org/10.1037/bul0000209)、[迁移分类框架](https://doi.org/10.1037/0033-2909.128.4.612)；每节仍有自己的精确 sources，不依赖此总说明代替课内来源。

## 必须保留的内容边界

1. 学习科学第一课明确领域、产品设计价值，以及好用/参与/学会的区别。没有用点击、停留或打卡直接证明学习效果；没有承诺固定间隔对所有人最佳。
2. Git 和 GitHub 分开解释。保存不等于暂存，暂存不等于提交，提交不等于推送，合并不等于部署。包含 restore --staged 的边界、忽略规则不清历史、合并冲突和普通提交 revert。
3. GitHub 的 check-in/check-out 是团队自定义开工/收工报告，**不是 Git 内置命令**。正文也明确区分 Git checkout 历史命令与该报告。
4. 学习助手使用人工审核材料、本地规则与预写脚本，不调用真实模型、不自动评分、不诊断学生，不暗示跨设备同步或自动通知。
5. 技术课程没有附加学习科学 conceptIds；只有学习科学与确实讲学习动作的助手课程保留这些关联。
6. 安全重构保留原有行为，包括键盘、数据格式与存储键兼容。区分缺陷修复、增加功能与内部整理；测试不等于全部场景保证，回退后也要检查。
7. 公开源码不自动授予任意使用权；许可内容只教阅读与核对，不替代具体材料的授权判断。

## 预测→尝试→解释与交互图

已应用 `/Users/yismacmini4/Documents/ChatGPT/AI_Literacy/web/.claude/skills/teachable-figures/SKILL.md` 的机制设计：案例明确可改变的条件，先提出预测，执行一个小操作，再把观察解释为原因与结果。纸卡或实际工具均可完成任务，图不是完成课程的唯一途径。

只给机制吻合的课节填写现有 figureKey：

| key | 课节 | 对应机制与边界 |
| --- | --- | --- |
| retrieval | 学习科学 retrieve；助手 attempt-before-reference | 先答与先看参考产生不同证据；沿用事实/观点情境 |
| scaffolding | 学习科学 scaffold | 正文另补分数支持 0—3 级说明；等级表示支持量，不表示能力等级 |
| feedback | 学习科学 feedback | 正文另补分数错误回答、反馈与可执行修改；预写示例不做真实诊断 |
| git-flow | Git snapshot、review | 工作区/暂存/提交分开；先预测 add 后再次编辑、撤销暂存的结果 |
| github-flow | GitHub remote-sync、merge-verify | 本地/远端同步边界；合并后本地仍需同步，不暗示部署 |
| web-layers | 网页 three-layers、js-values | HTML/CSS/JS 的不同职责及行为缺失；对重复点击实际检查 |
| responsive | 首页 structure、mobile | 相同内容在窄宽屏重排；不以整体缩小替代适配 |
| assistant-flow | 助手 learning-loop、assistant-boundary | 固定阶段流程，明显说明是脚本而非模型 |
| form-validation | 互动网页 form-basics、validate | 本地主题输入、空白/长度校验、错误修正与预览；图不联网、不保存 |
| refactor | 重构 meaning、behavior-contract、tests | 两次点击检查打开/收起的行为不变，截图不能替代状态验证 |

UI 后续新增了第十种 form-validation 图，已映射到互动网页的 form-basics 与 validate，情境与正文中的活动主题一致。其校验和预览是真实本地交互，但不联网、不保存；不要把它展示的预览成功说成后续存储课的保存成功。其他图继续按机制匹配，不为每节强配。

## 验证与未覆盖项

已执行：

- TypeScript 独立严格检查：`tsc courses.ts --noEmit --strict --target ES2020 --skipLibCheck`，通过。
- 内容检查：8 门、82 节、每门 10—12 节，旧 slug/ID 保留，ID 唯一，每课 ≥3 段且正文 ≥150 中文字符，三项自检、三个选项、仅一个正确项、各选项具体反馈，全部有 HTTPS 来源。
- 260 段正文没有整段重复；代码字段无意外的字面量反斜杠 n。
- 完整 HTML 示例内联 JavaScript 语法检查通过。
- 提取函数的 Node 内置断言实际执行通过。
- 新增完整互动网页示例通过 DOM/存储替身逻辑检查：空白拒绝、纯文本预览、保存、恢复、只删自己的键、损坏 JSON、版本不匹配、存储失败保留输入。

未声称完成：真实浏览器布局、焦点/屏幕阅读器、UI 图组件与整站构建验证。这些需主线程把 courses.ts 整合进站点以后完成。代码逻辑检查使用替身环境，不能替代浏览器验收。

辅助文件 `build.py`、`courses.json`、`verify.cjs`、`original.ts` 和 `original.json` 只供内容生成与复查，不必复制到主站。正式整合只需要 courses.ts，编辑说明可按需存档。
