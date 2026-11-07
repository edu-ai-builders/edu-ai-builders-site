# Education Builder MVP — implementation and validation

2026-10-11。按用户“直接开始做”的授权，在原站 `apps/site-original/` / `codex/original-site` 实现。此轮为本地可 review 的 MVP，未 push、部署或发布 npm；GPT preview 与两套 hosting 配置保留。

## 用户现在可以做什么

| 入口 | 用户能拿到什么 |
| --- | --- |
| `/skills` | 描述问题，选择先学习、使用现成工具、找资源开发、改造 repo 或生成自己的 skill；搜索 1,143 条资源线索。 |
| `/skills/scenarios/family-math` | 分层提示数学练习页的开发计划、四项候选职责、相关课程与验收。 |
| `/skills/scenarios/science-evidence` | 带来源的科学课堂活动计划；商业用途默认排除 ScienceQA 等受限候选。 |
| `/skills/scenarios/research-workflow` | 文献与实验助手的可复查计划、来源记录与实验验收方向。 |
| `/skills/workflows/edu-repo-adapter` | Repo Adapter skill 包、完整 scope、真实源码证据与改造计划样例。 |
| `/skills/workflows/edu-skill-fusion` | Skill Fusion 包、完整 scope、家庭数学独立新 skill 与融合决策示例。 |
| `/skills/projects` | 保存到当前浏览器、复制或下载、对比当前目录版本与条件、保留要求与平台重新生成。 |
| `/skills/contribute` | 准备 skill、资源投稿或需求草稿，下载后通过 GitHub 入口提交。 |

全站右下角提供构建小助手；首页、Build、导航与页脚连接新目录。场景页写明第一版成品、资源职责、开发环境、应补课程、具体步骤与验收。案例代表构建方向和交付计划，不宣称已集成第三方 repo。

## 两个重点 scope 与可使用的包

- [Repo Adapter scope](edu-repo-adapter-scope.md)：单个/多个 repo 的能力定位与适配；区分 extraction、refactor、redesign，保留文件/符号/版本证据、接口、取舍与验收。
- [Skill Fusion scope](edu-skill-fusion-scope.md)：先明确 workload 与 requirements，再裁剪、改写、处理冲突；区别于编排，交付独立 skill 与来源变更关系。

四个原创 MIT skills 位于 `packages/builder-skills/`，分别处理资源搜索、设计计划、repo 能力适配与工作流融合。网站提供 ZIP；用户按自己 agent 的目录规则解压使用。没有全局安装，也不捆绑第三方 skill 正文、repo 源码或付费内容。

Repo Adapter 示例检查了现有分数条工具的固定源版本和哈希，指出立即显示反馈及相等分数解释需要检查，给出分层提示改造计划；原工具没有因示例被修改，示例明确 `runtime_tested=false`。

Fusion 示例确实生成了一个新的家庭数学工作方法包。其来源是本项目原创 Search / Design 方法，来源以版本与文件哈希固定，决策记录包含保留、改写、删除、委派及上游变更影响。包结构检查与样例契约验证已完成；多 agent 任务质量、触发效果和编排对照尚未测试。

## 索引与更新边界

网站快照是 1,143 条资源记录，包括 skills、repos、datasets、benchmarks 与索引，并非 1,143 个 skills。三场景使用十二条独立精选候选；全目录保留额外 Anthropic PDF 许可比较条目，共十三项精选资料。

本轮补入原本已精选但公共 skill 目录教育关键词门槛遗漏的 Anthropic Skill Creator。没有进行新一轮外部采集。Radar 发现、精选与公共目录仍各自保留来源边界。

搜索提供双语关键词家族与资源类型、使用者、学科、能力、平台、精选条件筛选，分页稳定。移动端筛选包含明确标为 iOS / Android 的线索，缺平台标注的条目保持未知。关键词/元数据标签不是运行兼容性认证。

周一 09:00 的既有 Radar schedule 保持已授权设置：有界采集、轮转查询、预算、失败与游标记录。它更新 Radar 本地数据；不会修改或发布网站。

```sh
cd apps/site-original
python3 scripts/sync-builder-catalog.py --radar ../radar
python3 scripts/package-builder-skills.py
npm run dev -- --port 3101
```

同步是明确的数据投影；先检查网站 diff、验证再决定发布。“我的方案”的复查比较网站当前快照中的 commit、reuse status 和分项许可，不实时请求 GitHub。重新生成保留用户要求、平台和用途；旧存档仍可下载。

## 小助手、API 与 coding agent 接入

小助手是 clean 的表单与场景引导。关键词匹配有真实命中才给场景，未命中时提示搜索；不会把任意需求硬套入三个模板。学习入口连接现有课程，使用入口连接工具，改造与 fusion 连接对应工作流。用户问题可传入场景计划。

当前目录搜索与计划导出不用模型。计划由模板与目录元数据生成，复杂目标需要用户自己的 agent 核对；没有托管 AI 聊天或网站自动执行 fusion。

| 接口/工具 | 用途 |
| --- | --- |
| `GET /api/resources` / `search_resources` | 分页检索公开元数据与条件。 |
| `GET /api/resources?id=...` / `get_resource` | 单条来源详情与快照日期。 |
| `POST /api/build-brief` / `export_build_brief` | 按场景模板导出计划；商业用途默认 true，调用者可明确选择 false。 |

无依赖 Node CLI 和 stdio MCP adapter 源码位于 `packages/builder-tools/`，同用网站 API。MCP 验证 JSON-RPC、参数、错误与 notifications；API 只读、不执行第三方技能。stdio 必须指定目录 base URL，用户问题会传给这个指定服务。没有修改客户端配置、公开远端 streaming MCP 或发布 npm。

```sh
node packages/builder-tools/cli.mjs search --base-url http://127.0.0.1:3101 --args '{"query":"science","reviewed":true,"limit":5}'
node packages/builder-tools/mcp.mjs --base-url http://127.0.0.1:3101
cd packages/builder-tools
npm pack --dry-run --json --cache /tmp/edu-builder-npm-cache
```

## 验证结果

- 生产构建、TypeScript、ESLint 通过。
- 网站 JavaScript/TypeScript 回归：60 项通过，涵盖课程、Atlas、目录、工具、i18n、来源、计划和 MCP。随后新增平台/学科筛选断言并再通过八项 Builder 测试。
- 网站 Python 刷新回归：3 项通过。
- Radar 采集/搜索：11 项通过；既有目录：11 项通过。
- 四个核心包和独立 Fusion 示例的 skill 结构验证通过。环境缺 PyYAML，使用已有 js-yaml 兼容解析运行 skill-creator validator；没有为此安装依赖。ZIP 的 SHA-256 与源码样例哈希有测试。
- authored UI 翻译缺项：0；翻译扫描现也检查模板表达式中的文字。
- 本机真实 HTTP：搜索、详情、英语计划、受限候选排除、十一项页面/下载地址及无效 JSON 返回均通过；CLI 入口实际执行成功。
- npm 包 dry-run 通过，共六个发布文件；未发布。
- 浏览器实际操作：问题 → 数学场景 → 平台选择 → 保存 → 我的方案 → 来源复查；中英切换、同义词搜索、精选与移动端筛选、小助手展开/键盘关闭；复制的计划已在剪贴板确认，重新生成链接保留要求与平台。
- 390px 手机与 1440px 桌面检查无横向溢出；保留 [桌面截图](skills-desktop.png) 与 [手机截图](skills-mobile.png)。

浏览器的 Blob 下载事件未被本次 IAB 自动化捕获，因此没有将该事件计为通过；导出内容、静态下载地址与包哈希已验证。已补一键复制，并在浏览器验证内容，因此可以直接带入 agent；文件下载体验仍需在正式发布的目标浏览器再确认。

## 仍待验证与下一阶段

当前不收费。维护订阅可围绕重复 workload、资源变更、配方与适配方案复查提供价值；价格与维护成本需真实使用数据。创作者入口能准备投稿/需求，尚无公开请求板、审核后台、交易、退款或分成。跨设备账号和托管模型会话未加入。

采用三个小任务测首个可接受计划耗时、候选打开数量、返工与实际 token；再评测 Repo Adapter 实施与 Fusion 对照。现阶段不宣传节省百分比，不把结构测试等同于 skill 的教育效果或 agent 行为评测。

原站 `/changelog`、中英文字、网站及 workspace README 与产品清单已经同步实际状态。公开发布仍是后续独立操作。

## 2026-10-12 后续迭代

Repo Adapter 与 Skill Fusion 已更新为 v0.2.1，补充工具、模板和有限独立任务验证，下载示例同步。上述未测试状态是 10 月 11 日的历史状态。最新结果见 [三轮迭代记录](skill-iterations-2026-10-12.md)。仍未部署或发布 npm。
