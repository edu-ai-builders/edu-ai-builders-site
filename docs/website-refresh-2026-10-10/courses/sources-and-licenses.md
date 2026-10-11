# 来源、许可与复用边界台账

核验日期：2026-10-10；通过联网读取公开仓库、README、特定许可与官方文档。链接基于当前 branch，不能代替不可变版本。正式复用前由学习者记录实际 commit SHA 与文件许可；本次未安装上游工具或复制其代码。来源失效或权利不明时可转用原创 starter 完成课程。

## 已核验的外部资源

| 资源 | 一手依据与实现建议 | 许可观察与限制 | 课程用途 |
| --- | --- | --- | --- |
| Math Viz Kit | [仓库与 README](https://github.com/edu-ai-builders/math-viz-kit)；单 HTML 可视化设计可供阅读分析 | 本次页面根文件列表未观察到 LICENSE；不以公开可读推断 MIT。未逐文件审计 | 01 的许可反例、02 的结构分析；必做用原创 starter |
| Visual Cognition Slides | [仓库](https://github.com/edu-ai-builders/visual-cognition-slides)、[LICENSE](https://github.com/edu-ai-builders/visual-cognition-slides/blob/main/LICENSE)；围绕学生动作组织六页材料 | MIT；本地 `library/visual-cognition-slides/LICENSE` 同样为 MIT。保留通知。README 关于记忆效果是作者目标，不是本次证据 | 01/03 工作流阅读与有范围的改编 |
| Frontend Slides | [仓库](https://github.com/zarazhangrui/frontend-slides)、[原始 LICENSE](https://raw.githubusercontent.com/zarazhangrui/frontend-slides/main/LICENSE)；HTML 展示生成流程 | MIT；保留版权与许可，图片/输入素材另查；未测试本次安装方式 | 03 展示路径候选 |
| Anthropic webapp-testing | [manifest](https://github.com/anthropics/skills/blob/main/skills/webapp-testing/SKILL.md)、[该 Skill 许可](https://raw.githubusercontent.com/anthropics/skills/main/skills/webapp-testing/LICENSE.txt) | Apache-2.0；保留许可与相关通知、标注改动。[仓库 README](https://github.com/anthropics/skills)区分部分文档 Skills 的 source-available 条款，不统称全仓库开源 | 02/05 可选浏览器自动检查；必做可手工 |
| GSM8K | [仓库 README](https://github.com/openai/grade-school-math)、[LICENSE](https://raw.githubusercontent.com/openai/grade-school-math/master/LICENSE)；question/answer 字段，`####` 后为最终答案 | 仓库 MIT。下载具体数据时保留许可/引用并复查数据说明；英语算术题不代表中文课堂或学生学习表现 | 04 数据结构与适配判断，不运行历史训练脚本 |
| ScienceQA | [仓库 README](https://github.com/lupantech/ScienceQA)、[LICENSE](https://raw.githubusercontent.com/lupantech/ScienceQA/main/LICENSE)；多模态题的对照案例 | 仓库 MIT 不能代替外部图片/数据来源的审查。本包不下载或分发题图，未确认资源级条件前仅看结构 | 04 可选数据对照 |
| Promptfoo | [仓库](https://github.com/promptfoo/promptfoo)、[官方 echo provider](https://www.promptfoo.dev/docs/providers/echo/) | 仓库声明 MIT；安装时保留许可证并记版本。echo 回显用于调试断言，不能测模型能力；依赖未在本次安装 | 04 可选扩展，必做用 Python 标准库 |
| Kolibri | [仓库](https://github.com/learningequality/kolibri)、[原始 LICENSE](https://raw.githubusercontent.com/learningequality/kolibri/develop/LICENSE) | MIT 代码；频道内容单独核验。仓库 HTML 多次抓取失败，许可文件成功；平台定位同时来自已有 Radar 快照，未验证安装或当前版本功能 | 01/05 平台比较，非必须运行依赖 |

MIT 使用时保留上游版权和许可；Apache-2.0 按对应文件条款保留许可、通知并标注修改。课程需要的是每个实际文件的权利记录，不是给整个教育产品贴一个推测的许可证。以上为观察记录与课程复用约束，尚未完成上游逐文件审计。

## 本地证据及公开性

| 本地材料 | 本次读取到的事实 | 本次使用边界 |
| --- | --- | --- |
| `apps/site-original/app/content/courses.ts` | 7 门基础课及受众、先修、分课、任务、来源结构 | 建立补充路线；未修改数据 |
| `apps/site-original/app/content/resources.ts` | 数学交互、语言关系组件与 Skills 的入口及教学设计关联 | 连接已有体验，不把编辑关联当效果证据 |
| `library/visual-cognition-slides/README.md` 与 LICENSE | 本地工作流说明、MIT 通知 | 与公开仓库对照；不复制私有材料到网站 |
| `library/public_github/frontend-slides/README.md` 与 LICENSE | 本地参考副本，MIT | 结合公开来源核验 |
| `library/math-viz-kit/README.md` | 可视化结构与主题说明 | 只分析；没有为本地副本授予新许可 |
| `library/geo-viz-kit/README.md` | 教师场景与 MIT badge | 非本轮依赖；未将 badge 当独立版权审计 |
| `library/EduOS`、Working Graph 入口 | 工作区 README 标注 unreleased/experimental | 非课程运行依赖，不发布本地研究或承诺成熟服务 |

语言关系组件另有 `apps/site-original/public/tools/language-assets-LICENSE.txt`，可在将来选作课题时进一步核验；本包没有复制这些素材。

## Radar 快照：发现线索，不是当日审查

读取 `apps/radar/data/registry.jsonl`：3,536 条，entity_kind 分别为 repo 2,340、dataset 631、benchmark 321、awesome_index 244；非空 fetched_at 范围 2026-07-25 至 2026-08-30。读取 `skills.jsonl`：131 条，非空 fetched_at 范围 2026-07-27 至 2026-08-30。这是当前本地文件的统计，不能宣称全目录数据都在 2026-10-10 更新。

Kolibri 记录 `repo:49976939`，license_spdx=MIT，fetched_at=2026-07-31T18:08:00Z。Skills 中 teaching-site 与 _teaching 是实际收录示例，但本次未审计其行为或将其列为推荐依赖。以上必选资源中，除 Kolibri 外，GSM8K、Promptfoo、Math Viz Kit、Frontend Slides 未在 exact full_name 查询中命中；Visual Cognition Slides/webapp-testing 未在本轮筛选中确认命中，均作为外部补充。

Radar 的 verification_status 指来源匹配和元数据验证，不能推出安全、教学效果、可运行或许可完整。分类有高召回误差，例如资源索引可能出现在 dataset 集合；课程 01 必须到上游核查。

## 本次原创材料

`starters/fraction-lab.html`、`evaluate.py`、六条题、A/B 模拟输出、两个模板和课程文字由本次任务原创制作，没有复制上游实现或题目。没有真实学习者记录；没有模型调用。课程包不擅自替工作区统一指定分发许可；正式公开打包时为原创材料明确项目许可，并继续保留实际采用的上游许可。
