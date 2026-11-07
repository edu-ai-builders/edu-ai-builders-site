# Repo Adapter / Skill Fusion — 迭代与验证报告

2026-10-12。两个核心包现为 **v0.2.1**，原创 MIT，位于 `packages/builder-skills/`。本次按用户“尽可能完备、找 test case、多做 iteration”的要求完成。未安装到全局、push、部署或公开发布；原站和下载资产本地更新，GPT preview 保留。

## 可以直接使用的交付

| 包 | 交付能力 | 资源 |
| --- | --- | --- |
| `edu-repo-adapter` | 比较/提取/refactor/redesign；绑定真实源码，决定复用或改造，交付接口与验收 | SKILL.md、3 份按需参考、JSON 模板、Python evidence helper、Codex UI metadata、LICENSE。 |
| `edu-skill-fusion` | 按 workload 提炼方法，处理冲突、来源许可范围、专业委派和维护 | SKILL.md、4 份按需参考、JSON 模板、Python provenance helper、Codex UI metadata、LICENSE。 |
| `family-math-workflow` 示例 | 由真实 Search/Design 方法生成的双语手机家庭数学规划方法 | 独立 SKILL.md、2 份参考、来源决策记录、3 个终版走查与 1 个初始 PDF 边界记录、LICENSE。 |

ZIP 见 `public/downloads/skills/`。两个核心包分别为 8 与 9 个文件；示例为 9 个文件。scripts 是可选工具，Python 3.9+、标准库，无第三方库；Git 仅用于有条件的版本观察。没有 Python 时仍可用当前 agent 的文件/检索工具执行方法，保留验证限制。

主要 scope：[Repo Adapter](edu-repo-adapter-scope.md)、[Skill Fusion](edu-skill-fusion-scope.md)。Repo 的完整源码交付例见 [handoff](repo-adapter-complete-handoff.json)，实际基线记录见 [probe](repo-adapter-baseline-probe.json)。Fusion 下载示例已经替换为这轮生成的完整方法与走查。

## 三轮方法迭代

测试按 skill-creator 的独立 forward-test 方法进行。五个独立评估 agent 分别拿到明确用户任务、当轮 skill 和最小原始材料，没有父 agent 的预期答案、源码错误或先前结论。它们只在隔离目录生成产物，没有修改原始 source、实际网站或安装第三方软件。原始输入、指令版本、输出和实际命令保留在 `tests/skill-evals/`。

| 轮次 | 输入 | 实际检查与改进 |
| --- | --- | --- |
| 01 基线 | v0.1.0；分数源码、检索/显示两个源码；相互冲突的技能方法与目录摘要 | 基本方法能完成有来源的分析和融合。Repo 发现既有测试失败；检索→adapter→viewer 的有限真实集成运行。Fusion 生成家庭工作方法和单独编排交付。父审阅发现备用 Help 分支可能绕过先尝试条件，以及引入未请求的答案载荷要求；需要检查分支与硬约束。 |
| 02 完善 | v0.2.0；纯 refactor、小预算未命中、教师科学 workload、互斥硬要求 | 补模式/接口规则、机器模板、来源与维护工具。独立任务能保留既有行为、报告有界未知项、收窄教师科学方法并阻塞无法同时满足的硬要求。新增脚本回归首次 17 项中 2 项异常，定位为 dict 类型 ID/requirement 造成 TypeError；修复后扩至 23 项通过。 |
| 03 终版 | v0.2.1；真实网站 HTML 和实际第一方 Search/Plan；正常、缺 PDF 工具、不适用请求 | 源码基线探针执行真实 inline JS；5,929 组分数比较与整数交叉乘积一致。生成新家庭工作方法，处理所有提示入口、未知材料与范围。再补 runtime 声明、不可变来源、缺文件/漂移、未版本化来源与可重复 ZIP；27 项回归通过。 |

v0.2.1 的指令与评估快照保留在 `tests/skill-evals/versions/`。评估之后新增的“无版本标签可显式为 null 并用哈希绑定”及发布 ZIP 检查由针对性回归验证；不把它们描述成新的跨模型任务评测。

## 任务案例与真实结果

[cases.json](../../tests/skill-evals/cases.json) 是任务矩阵。八个主要案例之外，还保存基线 Fusion 的四个走查和单独编排结果。

| ID | 要完成的任务 | 观察到的结果 |
| --- | --- | --- |
| A | 将分数练习 redesign 为两层提示，保留 compare 数学接口；先分析不改代码 | 找到真实函数、哈希、状态转换与接口；现有 2 个测试中 1 个等值解释失败，明确为既有失败，改造验收未运行。 |
| B | 商业科学问答，连接 Python retriever 与 JavaScript viewer，必须页码引用，文档含 HTML | 提供并实际运行格式 adapter、合法页码和文字转义；两次命中、无命中、恶意 URL 拒绝通过。使用新写自有材料，排除非商业样例。未执行浏览器/多用户流程。 |
| C | 纯 refactor 分析，不顺手改变 render 行为 | 保留立即显示与当前返回；区分已有错误和新增回归。实际测试与额外输入/异常表征有记录，源码证据 helper 通过。 |
| D | 六个限定文件、1,706 字节中找光学仿真，禁止扩大搜索或执行代码 | 无命中，输出 unresolved；所选路径完成不被解释成全仓库覆盖，runtime_tested=false。 |
| E | 教师科学 Web 方法，最多两候选、先判断后证据、无付费模型 | 变换十候选/先答案/付费默认，避免强套数学流程；正文与摘要区分，PDF 降级、来源与维护映射齐全。三份任务走查保存。 |
| F | 首次展示既必须显示完整答案，又必须完全不显示，两项均硬要求 | 保留两项，给准备材料和选择分支，学习者流程保持 draft/blocked；没有偷偷取舍或制造成功。Provenance valid 只表示记录一致。 |
| G | 真实 `public/tools/fraction-bars.html` 的分层提示 redesign | 源码哈希、caller、交付 JSON 及 Node VM 基线完整；5,929 个合法分数输入组合比较正确。六类基线检查中 5 类通过，1 类说明既有的 `2/4 = 2/4` 解释错误。实际 redesign 与浏览器未运行。 |
| H | 用本项目 Search/Plan 生成家庭数学方法并实际用于自有乘法、PDF 缺工具、不适用训练任务 | 完成独立包、融合决策和 3 个输出。候选≤3，先提交有效尝试再提示，无付费模型/强制后台；PDF 提取 blocked，但独立规划可完成。三份为生成者自己的真实任务走查，不是另一个下游 agent 执行或应用运行。 |

八项结果按交付范围审阅。正确地返回未知或阻塞不是“完成了被阻塞功能”，也不标为应用测试通过。A/G 的源码错误已纳入改造计划，原工具没有因本轮 skill 测试被修改。

## 自动回归与交付检查

`tests/test_skill_workflows.py` 的 **27 项**涵盖：

- UTF-8 和中文、字面量而非任意正则、文件/字节/匹配预算、截断与跳过路径。
- 二进制、非 UTF-8、外部 symlink、越界路径、缺源文件。
- 真实源码哈希、行号、短引用；源改变使旧证据失效。
- 无命中/未执行状态，缺命令结果不能标执行通过。
- metadata-only 与未知许可不能被标为可再分发融合。
- requirement/source/decision/target ID 关系、委派条件与 fallback、来源变化影响映射。
- 硬冲突与 readiness、走查实际 artifact、畸形 JSON 诊断、未版本化来源的显式 null。
- 外部目录执行 CLI，无第三方依赖；ZIP 排除 caches/symlinks，同内容即使 touch 后压缩字节仍一致。

脚本检查不能验证声明的法律正确性、全部语义、实际教学生效，或证明记录里的命令真的运行。任务记录另存实际 argv、退出码和输出。独立评估的 C/D/E/F/G/H 结构记录均用当前 helper 再复查。

```sh
python3 tests/test_skill_workflows.py
python3 -m unittest discover -s tests -p 'test_*.py'
python3 packages/builder-skills/edu-repo-adapter/scripts/repo_evidence.py verify public/downloads/scopes/repo-adapter-complete-handoff.json --repo original=.
python3 packages/builder-skills/edu-skill-fusion/scripts/fusion_provenance.py packages/builder-skills/examples/family-math-workflow/fusion-record.json --package packages/builder-skills/examples/family-math-workflow --source search=packages/builder-skills/edu-resource-search --source plan=packages/builder-skills/edu-design-plan
python3 scripts/package-builder-skills.py
```

`--repo` / `--source` 左侧是 JSON 中的 ID，不一定与文件夹名相同。可按 case 的命令记录重跑。历史产物保留当时隔离路径供审计；项目内原始 fixtures 和显式根参数支持重新验证，不要求那个临时目录永久存在。

两个核心包及新 Fusion 示例通过 skill-creator quick validator。宿主缺 PyYAML，使用已有 js-yaml 兼容解析运行官方检查，没有额外安装。Frontmatter/名称/链接/来源结构与真实任务的结论分开。压缩包每项版本与站内显示、manifest SHA-256 对齐。

## 目前明确未验证的部分

没有做不同模型/不同 coding agent 平台的自动触发评测，没有运行完整分层提示改造，没有真实 PDF 提取、浏览器可访问性/移动布局验证，也没有学习实验。未采集可靠模型 token、费用或统一耗时对照，不宣传节省比例。方法包不提供托管执行、支付或自动更新用户项目。

下一轮有实际用户任务后，可以按这些案例增加输入，并在同模型、同环境下比较原编排与 Fusion 的质量、约束符合、返工和可得的实际 token/时间。已完成本轮要求的完善、迭代与有限验证；这不是延后当前交付的前提。

## 最终交付检查记录

- 27 项新 helper/打包回归通过；加上既有刷新测试，Python 共 30 项通过。
- 网站 JavaScript/TypeScript 回归 60 项通过，生产 build 和 ESLint 通过，authored 翻译缺项为 0。
- 官方 skill 结构校验：两个核心包与新版 Fusion 示例均通过。
- 直接解压发行 ZIP 后，在临时工作目录运行其中两个 helpers，通过真实源码 handoff 与解压后的 Search/Plan/Fusion 示例来源核对；不依赖网站 node_modules。记录见 `tests/skill-evals/cold-package-check.json`。
- 完整源证据例、新 Fusion 示例、四个核心 ZIP 和 manifest 已更新；zip 哈希与站内版本一致。
- 原分数工具保持未改，原站部署与 GPT preview 未动，未注册全局 skill 或外部服务。

本机生产预览已启动于 `http://127.0.0.1:3101`（只绑定回环地址）。实际 HTTP 复核两个页面显示 v0.2.1、ZIP 字节与准备文件哈希一致，以及四项 scope/example/report 路由成功；记录见 `tests/skill-evals/http-release-check.json`。
