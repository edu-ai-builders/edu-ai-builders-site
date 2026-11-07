# 执行记录

日期：2026-10-12。采用 `/private/tmp/edu-skill-evals-20261012/baseline/edu-repo-adapter/SKILL.md`（metadata version 0.1.0）及 `references/handoff.md`。分别输出 A 分析交付与 B 组合交付；没有把任务改成通用技能评论。

## 实际命令、作用与结果

| 实际命令/调用 | 结果 |
|---|---|
| `cat /private/tmp/edu-skill-evals-20261012/baseline/edu-repo-adapter/SKILL.md` | 成功读取技能，退出 0 |
| `cat /private/tmp/edu-skill-evals-20261012/baseline/edu-repo-adapter/references/handoff.md` | 成功读取唯一引用模板，退出 0 |
| `rg --files /private/tmp/edu-skill-evals-20261012/fixtures/repos` | 列出 12 个来源文件，退出 0 |
| `ls -la …/repos/practice …/repos/retriever …/repos/viewer` | 检查三个目录，未出现 `.git`；退出 0。省略号为完整 fixtures 前缀 |
| `python3 - <<'PY'`（读取三目录所有普通文件并逐行打印） | 完整阅读下列 12 文件，退出 0 |
| `PYTHONDONTWRITEBYTECODE=1 python3 /private/tmp/edu-skill-evals-20261012/fixtures/repos/practice/test_fractions.py` | 退出 1；2 tests，1 failure。comparison 通过；同分母相等解释返回 `B has more equal-sized parts.` 使 equal_explanation 失败 |
| `PYTHONDONTWRITEBYTECODE=1 python3 - <<'PY'`（哈希、`.git` 存在检查、动态导入 practice 并探测、`shutil.which('node')`） | 三组件均 `.git=False`；5 个 comparison/render 探针及零分母异常结果如下；Node 为 `/opt/homebrew/bin/node`；退出 0 |
| `mkdir -p /private/tmp/edu-skill-evals-20261012/baseline-repo` | 创建唯一输出目录，退出 0 |
| `python3 - <<'PY'`（在输出目录写 SHA manifest、两页原创文档与来源声明） | 成功，退出 0 |
| `cat > …/baseline-repo/run_minimal_b.py <<'PY'` | 创建隔离 B 验证程序。它导入真实 retriever，调用已有 Node 导入真实 viewer；不改原文件 |
| `PYTHONDONTWRITEBYTECODE=1 python3 /private/tmp/edu-skill-evals-20261012/baseline-repo/run_minimal_b.py` | 退出 0，实际端到端调用及断言通过；输出如下 |
| `cat > …/baseline-repo/task-a-handoff.md`、`cat > …/baseline-repo/task-b-handoff.md`、`cat > …/baseline-repo/execution-record.md` | 写交付；仅输出目录 |
| 最后 `python3 - <<'PY'`（重新计算 12 文件 SHA，与 manifest 比对，并检查输入 `__pycache__`） | 结果见 `final-verification.txt`；用于确认输入没改变 |

本记录的内联 Python 命令用执行目的描述多行正文，未声称存在额外脚本；可复跑的 B 正文已保存在 `run_minimal_b.py`。

## 读取范围

- practice：README.md、LICENSE、fractions_logic.py、test_fractions.py。
- retriever：README.md、LICENSE、DATA-LICENSE.txt、query.py、sample_documents.json。
- viewer：README.md、LICENSE、answer.mjs。
- 技能：SKILL.md 和 references/handoff.md。

12 个源码目录文件均很短且与能力、接口、版本或复用条件直接有关。未读取实际网站、其他工作树、档案仓库或外部服务。sample_documents.json 只作权利及形状审查，未纳入商业最小流程。

## 实际运行输出摘要

practice 的渲染探针：

```text
(1,4) vs (1,4): equal; B has more equal-sized parts.
(1,2) vs (2,4): equal; The comparison is equal.
(1,-2) vs (-1,2): equal; The comparison is equal.
(0,5) vs (0,7): equal; The comparison is equal.
(3,4) vs (1,2): greater; The comparison is greater.
(1,0) vs (1,2): ZeroDivisionError
```

B 实际运行：

```json
{
  "integration": "actual query.py -> adapter -> actual answer.mjs via Node",
  "results": [
    {"query":"水受热","status":"supported","pages":[1]},
    {"query":"闭合回路","status":"supported","pages":[2]},
    {"query":"光合作用","status":"no_evidence","pages":[]},
    {"unsafe_url":"rejected"}
  ],
  "html_text":"escaped",
  "external_services":false
}
```

## 未解决项与边界

- A 没有实施：两层提示状态机、正确解释和真实页面交互仍待 coding agent；现有解释测试保持已知失败。没有假报绿灯。
- 源快照没有提交、远端或发布标签，版本以 SHA 内容证据记录，无法对应真实生产站点。
- B 已完成本地抽取式集成，不是自然语言生成、PDF 导入或生产服务；浏览器实际呈现/点击、多页主张对齐、多用户权限未测。
- 自有演示文本可以先验证流程，未来教材权利与真实页码需要资料来源确认；NC 样例不进入商业数据。
- 没安装包，没联系外部服务，没修改 fixture 或实际网站。所有新文件仅在 baseline-repo。
