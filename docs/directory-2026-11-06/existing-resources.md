# 已有资源的可恢复审核

审核日期为 2026-11-06。本轮审核服务于 Edu AI Builders 的 agent 与 client 资源组合目标，覆盖个人学习、教学、跨学科研究、教育软件构建和教育系统运维。审核不执行第三方代码，不删除原始记录。

## 展示与保存分开

`radar/scripts/review_resources.py` 提供 `review_resource(record, policy=None, now=None)`。它接受 canonical Repo、Skill 和 Builder 记录，返回以下状态。

| 状态 | 展示建议 | 含义 |
| --- | --- | --- |
| `include` | 默认目录可见 | 元数据中有明确的复用角色，或有具体的来源审核。 |
| `review` | 在待复查筛选中可见 | 复用角色不清楚、来源待核实、旧运行软件缺当前运行证据，或上游需要迁移。 |
| `exclude` | 从公开目录下架，审计仍保留 | 已确认的离题资源、作者声明停止使用的旧工作流，或最后一次来源观察为 missing。 |

返回对象同时包含 `reasons`、`evidence`、`evidence_level`、`activity`、`policy_version`、`evaluated_at` 和 `reviewed_at`。自动规则的 `reviewed_at` 为 null；它们没有被伪装成人工逐条审核。活动状态与相关性独立保存。`include` 不表示功能、安全性、教学效果、许可范围或组合效果已经验证。

审核只使用资源自己的名称、简介和 topics 判断复用角色。搜索查询、owner 名中的 K12、旧 `entity_kind=dataset` 和发现标签不能单独证明相关性。未知许可不直接造成下架；现有许可范围与使用条件由其他字段承载。

## 当前记录的可重复统计

运行以下命令可重现审核。命令只读取 canonical 数据；可选输出文件保存审核结果，不改写注册表。

```sh
cd apps/site-original/radar
python3 scripts/review_resources.py --date 2026-11-06 --output /private/tmp/edu-resource-review-20261106.json
python3 scripts/test_resource_review.py
```

本次统计运行时，父线程已补入 4 个 Repo，输入为 3,644 个 Repo 和 181 个 Skill。后续继续采集时数量会改变，应重新运行上面的命令。taxonomy 的 artifact_kind 信息补入后，部分边界判断也可能改变。

| 原始集合 | include | review | exclude | 合计 |
| --- | ---: | ---: | ---: | ---: |
| Repo | 2,586 | 1,049 | 9 | 3,644 |
| Skill | 133 | 48 | 0 | 181 |
| 合计 | 2,719 | 1,097 | 9 | 3,825 |

9 条 exclude 包括 4 条具有具体理由的离题或停止使用记录，以及 5 条历史来源状态为 missing 的记录。它们全部留在原始文件中；本轮没有重新检查那 5 条 missing 是否已经恢复，刷新成功后可以重新进入审核。

不能将这张表理解成 3,825 条都被逐一人工审阅。全量部分是确定性元数据规则，人工来源抽查见下一节。1,034 条记录没有从自身元数据证明复用角色，进入 review，而不是因为 stars 低或语言不受欢迎而被永久删除。

## 来源抽查与具体决定

本轮只读查询了 14 个精确 GitHub repository endpoint，并检查了 5 个关键 README。没有运行代码或下载数据正文。

| 来源 | 决定 | 证据与边界 |
| --- | --- | --- |
| [HKUDS/DeepTutor](https://github.com/HKUDS/DeepTutor) | include | 官方元数据描述 lifelong personalized tutoring，2026-11-06 查询时仍有近期推送。没有运行辅导系统。 |
| [OpenAI Plugins](https://github.com/openai/plugins) | include | OpenAI Skills 当前 README 指向的官方 Skill 与 Plugin 来源。组件条件仍分别判断。 |
| [OpenAI Skills](https://github.com/openai/skills#readme) | repo 与浮动 manifest 为 review，固定 manifest 保留 include | README 明确声明此目录 deprecated，并指向 OpenAI Plugins。记录 `replacement_url`。现有 6 条 40 位 commit 固定的 Skill 仍可作为历史方法参考，不自动改写来源或声称最新版兼容。 |
| [GSM8K](https://github.com/openai/grade-school-math) | include | 上游 archived，最后推送为 2024 年。它是稳定题集，不按废弃运行应用处理。许可范围仍独立。 |
| [Education Dialogue Dataset](https://github.com/google-research-datasets/Education-Dialogue-Dataset) | include | 上游 archived，描述明确为 teacher-student 对话数据。可以用于辅导研究，archived 本身不证明数据失效。 |
| [EDUKG](https://github.com/THU-KEG/EDUKG) | include | K-12 教育知识图谱，最后推送为 2022 年。保留知识材料价值，数据时效与可用性仍需单独检查。 |
| [SciFact](https://github.com/allenai/scifact) | include | 科学论断验证任务的数据和模型，最后推送为 2023 年。研究材料不要求持续代码更新。 |
| [judyess/K12](https://github.com/judyess/K12#readme) | exclude | README 描述学校联系人营销采集脚本，作者明确写出停止使用及依赖失效的原因。保留历史，退出默认复用目录。 |
| [imdhiru/backlinks](https://github.com/imdhiru/backlinks#readme) | exclude | README 是自动通过评论的 backlink 清单。K12 搜索命中来自链接内容，没有教育资源或构建能力证据。 |
| [Bangalore startup companies](https://github.com/harshamv/Bangalore-startups-companies-list#readme) | exclude | 公司目录提及教育企业，但没有提供开源学习产物、数据集或可复用实现。 |
| [Game radio playlists](https://github.com/MarauderXtreme/video-game-radiostation-playlists) | exclude | 元数据是游戏电台歌单重建，未提供明确的学习、研究或构建用途。可在出现具体用途后撤销决定。 |
| [node-offliberty](https://github.com/radubogdan/node-offliberty#readme) | review | 2018 年的下载服务 adapter。旧查询中的 K12 对应示例服务器地址；媒体导入可能有用，但当前服务兼容性没有验证。 |
| [Typing Test](https://github.com/Atharva-K12/Typing-Test) | review | 打字练习可能有学习价值；2021 年后无新推送、简介为空。缺当前使用说明不等于确认无价值。 |
| [Python random quote](https://github.com/daniel-reynolds-k12/python-random-quote) | review | 元数据关联入门 Python 课程练习。不能仅靠 owner 名 K12 将其推荐为教育系统，也不应抹掉历史学习样例。 |

此前本地 3,640 条 Repo 中，3,523 条 last-push 已在 2026 年，只有 2 条 archived，而且两条都是数据集。网站看到大量旧内容，主要还涉及旧网站快照和错误召回；不能据此把全库按日期或某种语言删除。

## 对旧软件与稳定材料采用不同判断

- archived 的运行应用、库或 Skill，在没有稳定材料证据时退出默认展示。
- 超过 1,095 天未推送的运行软件进入 review。没有依赖失效或作者停止使用的证据，不自动宣称软件不可运行。
- 教材、教程、知识图谱、数据集、benchmark 和资源索引不因年份被自动拒绝。
- React、Python、R、Java、PHP、Ruby、C++、AutoHotkey 以及人的语言都不构成黑名单。
- 通用研究、可视化、设计、媒体制作、文档处理、部署、身份认证和运维工具，在元数据有明确角色时可以保留。它们不会因此自动获得某个教育学科标签。
- 产品标签与相关性审核独立。资源被纳入目录，不代表其搜索标签已经成为确认能力。

## 验证与剩余工作

10 个行为测试通过，覆盖稳定旧材料、archived 运行软件、未活跃软件、研究与系统管理、跨学科创作、owner 和查询误召回、未知许可、手工下架、Skill 身份、上游迁移和不改动输入。

Model the Domain 将展示决定与活动状态分开。Test Behavior, Not Implementation 用可见的保留、待复查和下架结果做断言。

本轮没有逐个审查所有项目的源码、依赖版本和安装流程，也没有证明任何第三方组合可以运行。默认展示中的宽泛构建资源仍需按具体 workload 排序；review 队列保留了下一轮按用途审核的入口。
