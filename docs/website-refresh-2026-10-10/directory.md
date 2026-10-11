# 资源目录更新交付 — 2026-10-10

本次只修改 `apps/radar/` 与本报告。保留两套网站和各自托管配置，没有部署、push、commit 或改动网站源码。根 README 与 AGENTS.md 已读取，radar 下未发现更细的 AGENTS.md。

## 已完成与真实状态

- 原始 JSONL 发现库 3,536 条，Skills 131 条；本次新增 40 个稳定 ID 的仓库记录，最终仓库库 **3576** 条、Skills **131** 条。
- 当前公开快照 **1040** 个仓库、**53** 个 Skills；它们是规则筛选的发现目录，不等于全部人工审核或可自由复用。
- 新增精选课程清单 **11** 条：4 个项目/课程、3 个数据集、4 个 Skills（其中 1 个仅保留参考链接）。9 条已观察到不含非商业限制的具体许可，ScienceQA 数据有非商业限制，Anthropic PDF Skill 仅链接参考。`license-observed` 不代表无条件使用或已测试运行效果。
- 使用 GitHub REST API 实际读取仓库元数据、固定提交、README/许可证、允许范围内的 Skill frontmatter；证据只保存 URL、路径、SHA256 与观察时间，不保存源代码、数据载荷、Skill 指令正文、脚本包或第三方素材。
- 更新旧记录时 30 条中 26 条成功；4 条返回 404，已再次核实并标为 `missing`/`unavailable`。404 可能是删除、私有化或访问变化，不能断言项目已删除。历史元数据保留，后续可重试，公开快照排除当前不可访问记录。
- 最终运行 `2026-10-10T145233Z-44b04e2f`：精选 11 条成功，精准发现查询返回 20 条，**41** 次 API 请求，0 错误；前一次出现 404 的部分失败运行仍保留在历史中。

## 存储与更新机制审计

当前 `apps/radar` 没有自己的 `.git`，是整理到主 workspace 的源码/数据快照；外部独立仓库与部署生命周期尚未接通，本次未创建或合并仓库。外层状态原先已将整个 radar 显示为未追踪目录，不能把它当作干净的独立 Git 工作树或直接在 wrapper 中提交。

现有 `data/registry.jsonl` 是 canonical 仓库注册表，数字 GitHub repository ID 去重；`data/skills.jsonl` 以仓库 ID + manifest 路径去重。现有 crawler 支持 ETag/条件请求、限速与运行快照。`site/data` 与 `web/data` 为生成的读模型，页面不承担抓取。

`migrations/001_init.sql` 与 `002_project_suggestions.sql` 是可选 Postgres 方案，不是数据库已启用的证据。仓库代码仅在建议表接口存在 `DATABASE_URL` 时使用 Postgres；本次没有查询远端生产环境配置，也没有部署/新建数据库。本地约 7 MB 的 JSONL 可在依赖最小的流程中读写；因此保留现有格式，未为数千条数据无谓换库。未来出现多写者、线上分页查询或快照体积压力时，才考虑按既有 SQL 迁移。

首次发现采用旧查询矩阵，README 广泛匹配带入了 12 个待筛选线索，部分为金融或通用项目。这些留在高召回发现库，未进入 11 条课程精选。新增 `config/directory-query-matrix.json` 只在名称/描述搜索 education + dataset，最终再验证 20 个新来源。关键词仍不能代替用途审阅；自动发现不会自动升级为精选资源。

## 可复用课程资源

下面“活动”是仓库 `pushed_at`，并非数据内容更新、Skill 文件更新或教育有效性。所有来源链接固定到这次读取的提交；证据文件链接见结构化清单 `evidence` 与 `license_scopes`。

| 资源 / 固定提交来源 | 类型 | 最近活动 UTC | 许可范围 | 复用状态 |
| --- | --- | --- | --- | --- |
| [GSM8K](https://github.com/openai/grade-school-math/tree/3101c7d5072418e28b9008a6636bde82a006892c) | dataset | 2024-01-21 | repository: MIT | license-observed |
| [ScienceQA](https://github.com/lupantech/ScienceQA/tree/2cbf8318e07b9ece895bb2ae605e71e38d623264) | dataset | 2024-09-19 | code: MIT; data: CC-BY-NC-SA-4.0 | restricted |
| [SciFact](https://github.com/allenai/scifact/tree/68b98a56d93e0f9da0d2aab4e6c3294699a0f72e) | dataset | 2023-10-15 | claims-and-evidence-annotations: CC-BY-4.0; abstracts: ODC-By-1.0; code: Apache-2.0 | license-observed |
| [DSPy](https://github.com/stanfordnlp/dspy/tree/f1260ff14610286cb295c7d3a5ee2cbfd0ba5cb9) | repo | 2026-10-09 | code: MIT | license-observed |
| [Generative AI for Beginners](https://github.com/microsoft/generative-ai-for-beginners/tree/d8ec07e31c4b32bd283d565c1abd9b58bb5cf2e8) | repo | 2026-10-08 | repository: MIT | license-observed |
| [OpenTutor](https://github.com/zijinz456/OpenTutor/tree/f0142f28e8ed1ab4047e16c9aee5c283a6ee98b7) | repo | 2026-10-08 | repository: MIT | license-observed |
| [Smol Course](https://github.com/huggingface/smol-course/tree/b712705327d1204353a1209e991334d441b4de7e) | repo | 2026-10-06 | repository: Apache-2.0 | license-observed |
| [PDF Skill (Anthropic, reference only)](https://github.com/anthropics/skills/tree/dbd4588f9e1033efb41dad4bef2f7947c8993d44) | skill | 2026-10-09 | skill: LicenseRef-Anthropic-Services | link-only |
| [Jupyter Notebook Skill](https://github.com/openai/skills/tree/49f948faa9258a0c61caceaf225e179651397431) | skill | 2026-09-08 | skill: Apache-2.0 | license-observed |
| [PDF Skill (OpenAI)](https://github.com/openai/skills/tree/49f948faa9258a0c61caceaf225e179651397431) | skill | 2026-09-08 | skill: Apache-2.0 | license-observed |
| [Skill Creator](https://github.com/anthropics/skills/tree/dbd4588f9e1033efb41dad4bef2f7947c8993d44) | skill | 2026-10-09 | skill: Apache-2.0 | license-observed |

特别保留了组件许可差异：ScienceQA 的代码 MIT 与数据 CC-BY-NC-SA-4.0 分开；[SciFact 的许可说明](https://github.com/allenai/scifact/blob/68b98a56d93e0f9da0d2aab4e6c3294699a0f72e/LICENSE.md)区分主张标注 CC BY 4.0、摘要 ODC-By 1.0 与代码 Apache-2.0。Skills 仓库顶层 GitHub 许可值为空，仍可从每个目录的许可文件确认具体条款；不能把其中一个 Skill 的许可推给整个仓库。

以下课程组合是本目录提出的复用建议，尚未做教学效果或运行兼容性验证：

- AI 入门/教师培训：`genai-beginners` → `notebook-skill`；改编课程后保留归属，并逐格检查 Notebook。
- 有依据的问答：`opentutor` + `openai-pdf-skill` + `scifact`；用已获授权材料验证引用能否支持回答。
- 数学推理评估：`gsm8k` + `notebook-skill` + `dspy`；分离训练/测试，评价最终答案与解释，记录模型与提示版本。
- 小模型实验：`smol-course` + `gsm8k`；核实模型权重许可、算力和数据用途，先设定基线再微调。
- Skill 作者工作坊：`skill-creator`；把一个窄教师工作流写清输入、输出与边界，用反例做测试。

每条资源已有中文用途、教育场景、课程标签、原创建议步骤、运行条件与复用约束。获取第三方包时应使用 `pinned_commit`，保留该包的原始许可，并独立核实外部模型、图片和训练数据；本次不自动安装包。

## 课程读取契约与检索

- 人工策展输入：`apps/radar/config/education-resources.json`。
- 主输出：`apps/radar/data/education-resources.json`；同内容副本 `site/data/education-resources.json`、`web/data/education-resources.json`。
- 契约：`schema_version = radar.course-resources.v1`，资源数组为 `resources`，JSON Schema 在 `schema/course-resources.schema.json`。
- 课程关联优先使用 `id`；跨源去重使用 `resource_key`；来源可复现使用 `pinned_commit`；不要把 `generated_at` 当成每条资源的新验证时间。
- 列表展示至少读取 `title`、`purpose_zh`、`source_url`、`license_scopes`、`reuse_status`、`last_verified_at` 和 `refresh_status`。用于实际复用的列表应排除 `needs-review`、`link-only` 和 `refresh_status=error`，带条件的资源须展示限制。

```bash
cd /Users/yismacmini4/Documents/ChatGPT/Edu-Ai-Builders/apps/radar
python3 scripts/update_directory.py --refresh-limit 30 --discover
python3 scripts/update_directory.py --offline
python3 scripts/query_resources.py --tag evaluation --license-observed --max-age-days 14
python3 scripts/query_resources.py 科学 --kind dataset
python3 scripts/query_resources.py tutor --all
python3 scripts/test_directory.py
```

`--all` 可离线检索整个发现库，包括尚未策展/不可访问资源；这些输出统一为 `needs-review`，不从 GitHub 检测值推断复制权。当前规模直接内存检索即可，不需搜索服务或向量库。中文采用子串匹配，英文使用空格分词 AND 匹配；没有语义检索或相关性评分。

## 持久化与失败处理

统一入口 `scripts/update_directory.py` 用标准库和 POSIX `flock`（适用当前 macOS/Linux），防止同入口并发写入。锁文件长期存在正常，锁由进程持有；不要仅凭文件存在判断正在运行。历史 crawler 直接运行不会获得此锁，定时任务只允许用统一入口。

每次网络更新先保存 `data/snapshots/directory-<run>/before-*`，结束保存当前 JSONL/清单、`run-summary.json`、`resource-changes.json`，并追加 `data/update-history.jsonl`。同机快照方便追溯与恢复，但不是异地备份；本次未启用云备份，快照按运行累积，尚无自动删旧策略。

单条请求失败保留旧证据与原 `last_verified_at`，标记 `refresh_status=error`。许可证文本哈希改变即 `needs-review`，即使标题没变也不会自动重新授权；人工读完新文本后，将 `reviewed_sha256` 写入该许可 scope 再运行更新。失败校验/构建不会覆盖既有仓库/Skills 公开快照，JSONL 与导出文件采用临时文件替换。单文件替换是原子的，多文件发布不是数据库事务；进程崩溃后可从快照恢复并重新构建。

## 自动更新

找到既有 `weekly-github-radar-refresh`，状态 ACTIVE，之前仍指向迁移前路径。本次通过应用工具更新同一任务，没有重复创建；保留现有模型 `gpt-5.6-terra`、medium、周一 09:00（America/Los_Angeles）及 `failed_runs_only` 通知配置。项目改为当前 Edu-Ai-Builders，保存提示明确只操作 `apps/radar`，运行上面的 `--refresh-limit 30 --discover` 命令，不改网站、不部署、不 push。

运行环境是本机桌面应用；需要电脑开机、应用运行、项目存在、Python 3.10+，以及允许访问 GitHub。网络读取在本次会话经批准后实际成功，但定时运行采用其自身沙箱设置，未来网络/认证不可用时会失败并保留旧证据，不能保证无人值守网络一定获准。[官方 Scheduled tasks 文档](https://learn.chatgpt.com/docs/automations?surface=app)也要求本地项目任务保持电脑与应用运行。

11 条精选来源每次核实，广泛发现库只按最旧 checked_at 轮转 30 条，不承诺全部 3,576 条每周刷新；按每周 30 条的理论全库轮转约 120 周。需要高频更新的课程资源应进入精选输入，消费者按每条验证时间判断新鲜度。Skills 高召回库 131 条也没有声称本次全量重新核实，当前定时入口只更新精选 Skill frontmatter。

本次没有在 Vercel/GitHub Actions 上创建服务器定时任务；无需把桌面任务误认为云端持续运行。下一次预计为 2026-10-12 09:00 America/Los_Angeles，实际执行受本机与沙箱条件影响。

## 验证

- 最终统一入口真实网络运行成功，仓库、Skills 校验均 0 个结构问题，公开数据重新生成并同步。
- 8 项离线测试通过：重复身份拒绝、未验证许可不得标成不受限、代码/数据许可分离、三个课程导出一致、并发锁拒绝且不写文件、变动许可保持待复核、网络失败不冒充新验证、404 保留可重试且不公开。
- 所有 Python 脚本编译检查通过，查询入口与 offline 导出实际运行成功。
- JSON Schema 文件可解析；当前 Python 未安装 `jsonschema`，没有声称运行第三方完整 Schema 校验。运行时使用依赖最小的结构/语义检查，提供 Schema 供消费者接入。
- 全库仍有不少缺少许可证检测、语言统计/发行信息的条目，详细数目见 `reports/directory-final-2026-10-10.md` 与每次运行报告。结构合法不等于教育适用或可复用。

## 追加交付：试用入口与 arXiv（2026-10-10）

以上初次审计数字保留为历史；当前精选资源为 **13** 条，GitHub 底表 **3,577** 条、Skill **131** 条。新增 OpenMAIC（MIT）、RAGFlow（Apache-2.0）。**2** 个官方在线页面核实可达：OpenMAIC 可查看公开课程入口，生成课程的账号/额度另核实；RAGFlow 实际跳转登录页，需要账号。未生成课程、上传资料或运行本地项目，因此这些结果仅说明页面和入口条件，不证明运行效果。OpenTutor 提供固定提交的 Docker 启动步骤，不虚构公开 demo。课程、数据和 Skill 阅读入口分别标记。

首页视觉线程可直接读取 `apps/radar/data/builder-resources.json`（radar.builder-resources.v1）：source_code_url、demo_url（可空）、demo_status、demo_access、demo_verification、purpose_zh/en、quick_start（步骤/依赖/命令/runtime_tested）、primary_action、license_scopes 和最后核实日期。主操作仅在页面核实可达时为 demo；源码链接永远不作为 demo。Radar 本身新增双语精选卡片，展开查看使用步骤与条件。没有修改两个主网站或部署。

统一读取入口为 `apps/radar/data/discovery-feed.json`（radar.discovery-feed.v1），当前 **81** 条=13 精选+68 论文，包含稳定 resource_id、kind、title、source_url、verified_at、tags、description、primary_action、demo_url、reuse_status、detail_collection/detail_id；详细文件为 builder-resources.json 与 papers.json。data、site/data、web/data 三份内容一致。该文件没有私人偏好或预览去重状态。

### 复用论文工具的实际原型

比较 arxiv-sanity-lite、arxiv-daily-digest、paper-digest、arxiv-digest 的许可、活跃度、部署成本和功能后，选择最小的 MIT `ibaaj/arxiv-digest`，固定提交 `93ada9431bcf58a4b87e43d9118b290ae9c0126c`。隔离放在 `apps/radar/prototypes/arxiv/upstream/`，保留 LICENSE 与来源信息，实际调用其 compute_local_score/compact_local_why；没有重新开发论文网站。完整比较与命令见 `apps/radar/docs/arxiv-recommendations.md`。

真实 arXiv API 样本为 **68** 篇，教育查询覆盖 tutoring、pedagogical、knowledge tracing、learning analytics、student simulation。`data/paper-recommendations.example.json` 有 **5** 条本地推荐及匹配理由，sent=false。偏好支持兴趣、排除词、类别、daily/weekly/manual、限额、版本去重和 enabled=false 退订。排除词按标题/摘要硬过滤。尚无真实用户注册、邮件/消息发送或每日调度；现有每周 GitHub 更新仍只更新 GitHub。

论文是预印本，同行评审未核实；描述元数据采用 CC0，论文正文及关联代码/数据许可独立核实。4 个摘要作者链接只保存线索，未标成可复用资源。教育用途为基于元数据的编辑推断，不宣称课堂效果。API 遵守单连接和至少 3.1 秒间隔；本地锁覆盖读、请求、原子写和更新日志。

验证：**11** 项目录测试、**7** 项论文测试通过；Next.js 生产构建通过。新增测试覆盖 GitHub 不可作为 demo、在线失败回退说明、未经核实的 demo 主操作拒绝。上游完整 pytest 因未安装 pytest 未运行；实际评分函数已在原型测试中执行。
