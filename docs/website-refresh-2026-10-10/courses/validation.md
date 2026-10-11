# 本次交付与检查记录

日期：2026-10-10。范围：仅 `docs/website-refresh-2026-10-10/courses/` 的新材料。原站课程数据读取时 Git 工作区干净；没有修改其 TS、首页、共享 CSS、SEO 或两站 hosting 配置。没有提交、push、部署、修改 Radar 数据、修改 archives 或发布 library。

## 实际完成

- 5 个课程包，总设计时长 1,260 分钟（21 小时），各分课加总与 catalog 相符。
- 1 个路线总报告、1 个来源/许可台账、1 个用于未来界面衔接的 catalog（未导入网站）。
- 原创单 HTML 分数 starter、Python 标准库评测器、6 条原创题与 A/B 模拟输出、2 个练习模板。
- 读取原站 7 门课程和公开资源入口，以及 Radar 3,536 条资源、131 条 Skills 的本地快照；区分原始抓取日期与本次查阅日期。
- 联网核验公开 GitHub、原始许可文件及官方 provider 文档；失败抓取和许可证未知项保留在台账。上游依赖未安装，未固定安装版本，课程要求实际复用时记录 commit。

## 已执行的检查

1. 对所有课程 JSON 执行解析，确认 catalog 五项与总时长。
2. 检查课程 Markdown 的相对本地链接，全部目标存在。
3. 用 Node VM 和最小 DOM 替身执行 starter 的真实内联脚本：未预测时阻止看结果并聚焦输入；三组分数关系计算；切题清空结果/解释/提示；提示的 hidden 与 aria-expanded 同步。检查 HTML 没有外部网络资源引用。脚本状态检查通过。
4. 执行 `python3 evaluate.py cases.json outputs-a.json`：3/6 通过，失败 f2（字面泄露）、f4（关系错误）、f6（字面泄露）。执行 B：5/6 通过，仍失败 f4。失败是教学夹具设计，不是待修复的评测器错误。
5. 评测器异常路径：缺输出产生 missing-or-invalid-output；未知题号抛出 ValueError。教学标准答案由小整数分数比较核对。

## 尚未验证与交付边界

未在真实浏览器进行视觉、键盘、窄屏和辅助技术验收；DOM 替身不能证明这些通过。课程将这些列为学习者与讲师的明确验收任务。未安装/运行上游 Skills、Kolibri、Promptfoo 或公共数据训练管线；未调用模型；没有真实试学者或课堂实验。

课程可用于备课与组织试学，但“课程已授课”“用户测试通过”“能提高成绩”均无依据。05 提供待试用协议与空表，尚无人参与时不填结果。原创材料的公开分发许可留待项目明确，不擅自替现有仓库变更许可。

## 建议后续界面接入方式

以 catalog 的稳定 id、title、minutes、outcome 展示课程包入口，保留 draft-not-taught 状态。界面实现者先确认独立课程数据职责，再决定是否扩展现有 Course 类型。新包有工作簿、文件产出和 rubric，不能简单裁剪成选择题后称已完整上线。

## 补充：先体验再复用（2026-10-10）

根据用户最新要求，课程入口改为现成 demo→一个动作→拆解→自己的版本。新增 QUICKSTART.md；五个课程第一课均加入前 5 分钟体验或最短运行步骤，时长仍包含在原预算内。README 首屏给出原站本地分数工具与原创 starter；03 给出本地现有数学课件（不随网站发布）；04 给出无模型依赖的一条运行命令。

catalog 升为 v2，增加 entry_sequence、directory_handoff 与每课 local_demo/site_demo/adaptation_starter/first_five_minutes 字段；仅作为文档接入契约，未导入网站。资源卡优先实际试用，无 demo 则展示真实运行要求，再衔接“做自己的版本”。

重新检查 Markdown 本地链接、五课 demo/starter 目标存在、catalog JSON 与 21 小时时间预算，全部通过。联网尝试原站 `/tools/fraction-bars.html`、`/use/fraction-bars`、`/directory`，抓取未成功，catalog 明确 online_verified=false；不据此判定网站关闭，也不宣称在线 demo 可达。本次仍未执行真实浏览器验收或部署。
