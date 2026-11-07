# arXiv 教育 AI 推荐原型 — 2026-10-10

用户已确认最初的 “XRIV Education” 指 arXiv。此成果仅在 radar：元数据采集、可复用上游工具接入、每用户本地推荐预览。没有注册入口、邮件推送或线上订阅服务。

## 上游比较与选择

检查日期 2026-10-10；活动时间取 GitHub `pushed_at`，不是质量保证。原始 GitHub 元数据、README、LICENSE 保存在 `prototypes/arxiv/`。

| 项目 | 许可 / 最近 push | 能力与代价 | 决策 |
| --- | --- | --- | --- |
| [karpathy/arxiv-sanity-lite](https://github.com/karpathy/arxiv-sanity-lite) | MIT / 2023-06-19 | 标签兴趣、相似论文、邮件推荐；需要独立 Python Web 服务、特征索引与邮件配置，维护时间较旧 | 不引入第二套账号和服务 |
| [BernieZhu/arxiv-daily-digest](https://github.com/BernieZhu/arxiv-daily-digest) | MIT / 2026-10-09 | 分类/关键词、每日 Markdown；README 的自动化方案依赖 DeepSeek 或 Claude，非现有用户订阅系统 | 最小目录任务仍有额外模型依赖 |
| [X-PG13/paper-digest](https://github.com/X-PG13/paper-digest) | MIT / 2026-08-20 | 关键词、发送去重、JSON/Markdown/RSS，SMTP 与多种 webhook；Python 3.12+，基础 stdlib，可选模型 | 后续多渠道投递优先参考，但当前范围较大 |
| [ibaaj/arxiv-digest](https://github.com/ibaaj/arxiv-digest) | MIT / 2026-05-21 | 关键词/作者评分、明确理由、SQLite、HTML，可选 LLM；Python 3.11+ 基础无第三方依赖 | 实际复用其评分模块，最小适配 radar JSONL |

已固定 ibaaj 提交 `93ada9431bcf58a4b87e43d9118b290ae9c0126c`，保存原版代码与 MIT LICENSE 于 `prototypes/arxiv/upstream/`。`recommend_papers.py` 导入真实上游 `compute_local_score` 与 `compact_local_why`，不是重新实现评分。隔离代码不执行上游采集/LLM/通知；因此未装 key、未下载 PDF。上游评分含逻辑学 cs.LO 历史加权，教育适配先在外部过滤分类，评分输入不带分类，以避免该偏置。

运行成本：本地 Python / 网络 / 磁盘，当前路径不调用付费模型。邮件服务、线上账号、自动运行环境均未配置。

## 实际数据与边界

`data/papers.jsonl` 当前 68 条去重记录：3 条官方 API 查询各取最新 20 条，加上最初官方 tutoring 查询样本；各记录保留查询与实际采集时刻。4 条含摘要中作者明确给出的 GitHub/Hugging Face/Zenodo 链接；仅标注 author-linked-resource，未探测可运行性，未把源码当 demo。记录含作者、分类、提交/更新时间、固定版本、preprint 标志、用途推断和证据限制。

分类范围以 cs.AI/cs.CL/cs.HC/cs.LG 为主，并单独允许标题 education/pedagogical + LLM 的跨分类匹配。arXiv 没有完整教育学索引，覆盖不了全部教育研究或期刊；限定标题提高精度但漏掉摘要才提到教育的论文，最新 20 条不能保证每天全量覆盖。`student` 会命中师生蒸馏，`learning` 会命中普通机器学习，故不单独用这些宽词。当前列表是机器发现候选，推荐理由是可解释关键词匹配，仍需编辑筛选。

官方 [API 使用条款](https://info.arxiv.org/help/api/tou.html) 要求单连接且至少 3 秒间隔，并鼓励链接 abstract 页面。采集脚本用本地文件锁和请求结束时间节流，保持至少 3.1 秒；仅保证本机本脚本，其他机器/工具调用必须自行协调总限额。一次请求最多 20 条，无全文下载。描述性元数据 CC0；[论文许可](https://info.arxiv.org/help/license/index.html) 逐篇独立，Atom 没提供许可时保持 unknown，不能从开放阅读推断可复制正文/图表或训练。代码/数据也必须另核许可。arXiv 发布不证明同行评议；这里 `is_preprint=true` 指 arXiv 版本，论文可能另有正式发表，peer review 未核实。

## 稳定字段与网站适配

`schema/paper.schema.json` 对单条 JSONL 定义契约。统一入口字段：`resource_id=arxiv:<id>`、`kind=paper`、`title`、`source_url`、`verified_at`、`tags`、`builder_use`、`related_resources`、`evidence_limits`。论文无在线试用；下一步为原站论文页面及作者明确资源，不能标 “立即试用”。`builder_use.status=editorial-inference-from-metadata` 明示用途只是推断。

持久化沿用 JSONL，无数据库迁移。按无版本 arXiv ID 合并，新版本替换当前记录；`paper-update-history.jsonl` 记运行、版本变化与快照哈希，后续新/变版本全文元数据记 `paper-record-history.jsonl`。旧记录保留，重复跨分类/查询去重。请求失败保留当前文件，当前写入原子替换；历史可能含失败运行的候选观测，不能当发布成功。

## 可运行入口

从 radar 目录执行：

```sh
python3 scripts/crawl_papers.py
python3 scripts/recommend_papers.py --preferences data/paper-preferences.example.json --state /tmp/edu-paper-user-state.json --output /tmp/edu-paper-digest.json --record-preview
python3 scripts/test_papers.py
```

输入示例 `data/paper-preferences.example.json`：每用户 ID、interests、exclude、分类、daily/weekly/manual/disabled、enabled、最多条数和时间窗口。输出 `data/paper-recommendations.example.json` 5 条，含匹配兴趣、分数、推荐理由、builder 用途、证据限制、`sent=false`。每用户独立 state；默认预览不更新状态，显式 `--record-preview` 才记录已预览版本及频率。新版本可再推荐；同版本不重复。enabled=false 或 frequency=disabled 即退订模拟，无投递；不会删除已有预览历史。

上线前需网站账号关联、私有偏好存储、时区与发送时间、经确认的渠道、真实投递成功状态及退订 token。目前只读检查 radar Next 应用和 migrations 未见账号/session/邮件投递实现，suggestions API 不是订阅系统。请勿把本地去重状态当 “已经发送”，或在现有站点宣称注册即每日推送。不会重复创建自动化；父任务协调已有目录更新。

验证：实际 API 采集成功；7 项标准库测试覆盖上游评分、频率、同版本去重、新版本、排除/分类、退订和未知许可/作者链接。上游 pytest 测试因本环境缺 pytest 未运行，不声明全上游通过。
