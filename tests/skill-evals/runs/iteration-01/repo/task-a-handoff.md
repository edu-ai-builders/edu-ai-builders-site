# A：分数比较两层提示交付（分析版，未改代码）

## 定位与版本证据

来源目录：`/private/tmp/edu-skill-evals-20261012/fixtures/repos/practice`。这是未附 `.git` 的 fixture；不能声称属于某个提交、tag 或已发布网站。以 `source-manifest.json` 的 SHA-256 固定本次内容。核心 `fractions_logic.py` 哈希为 `1661597211236e8e4295e7b68b6a008d728adb6d95dd9d023c330dc1f36a23d8`。所读范围是该目录的 README、LICENSE、实现与测试四个文件，没有观察到浏览器页面、滑块、键盘交互或调用站点。

| 必需能力 | 当前证据与契约 | 判断与交付动作 |
|---|---|---|
| 比较数学 | `fractions_logic.py:4–6`, `compare(left, right)`；两个 `(numerator, denominator)`，输出 `greater / less / equal`；使用 Python 标准库 `Fraction` | 原样复用。保留签名、所有已有合法输入的精确结果及零分母异常；不加入浮点比较或提示状态 |
| 解释 | `fractions_logic.py:8–12`, `explanation(left, right)` | 本地修复并补全：同分母相等当前错误地指向 B；异分母目前只重复 verdict。解释延迟到最终阶段展示 |
| 即时展示 | `fractions_logic.py:14–15`, `render(problem)`；problem 为 `(left, right)`，当前立刻返回 verdict、explanation | 改造展示投影，添加学习流程状态；初始不得输出答案文本 |
| 调用和依赖 | README:2、`test_fractions.py:4–10`；仅观察到测试动态导入，标准库依赖，无持久化 | 真实页面调用方、事件系统和部署栈未提供。先交付 Python 契约，接入实际页面时补调用清单 |
| 可复用条件 | LICENSE:1–13，MIT，2026 Edu AI Builders contributors | 分发复用代码时保留版权和许可文本；未复制或修改源实现 |

## 保留与改变的行为

保留 `compare(left, right)` 本身：例如 `((1,2),(2,4)) → equal`、`((1,2),(3,4)) → less`、倒序为 `greater`。现有行为还支持负分母等 `Fraction` 接受的输入，零分母抛 `ZeroDivisionError`；不要顺便改其合同。面向初学者的页面若限制分母为正，应在输入层约束并单独说明，不能改变 compare。

改变的是学习流程。初始只呈现题目及作答控件；学习者先选择 `greater / less / equal` 并提交，再每次点击揭晓一层。明确按“两层提示 + 最终解释”实施，提交不自动揭晓提示，因此提交后依次有三次揭晓动作。

| 状态（拟新增） | 可见内容 | 允许的下一步 |
|---|---|---|
| awaiting_attempt | 题目；无提示、verdict 或 explanation | 提交合法作答 |
| attempted | 显示自己的作答、“已记录”；暂不标对错 | 揭晓提示 1，或重新作答 |
| hint_1 | 提示 1：先看分母是否相同；分母相同时每份大小相同，不同时需要统一份的大小 | 揭晓提示 2，或重新作答 |
| hint_2 | 保留提示 1；提示 2 给出共同正分母与两边换算后的分子，提示比较等大份数，暂不直接输出关系词 | 揭晓解释，或重新作答 |
| explained | 两层提示、正确 verdict、完整推导、首次及当前作答反馈 | 重新作答或换题 |

以上顺序及反馈时机是为落实“先尝试”作出的明确设计假设。重试保留已经看到的提示及首次尝试，不重置；换题一定清空尝试和提示。没有作答时的揭晓操作不推进状态。重复提交或重复渲染不自动推进状态。教师复核不在 fixture 中：可由未来调用方读取首次作答、重试和揭晓次数；本次不添加远程上报或教师端。

## 给 coding agent 的接口与改造顺序

以下是拟新增接口，不是现有符号：

1. `PracticeState(problem_id, stage, attempts)`：由页面/会话拥有，无模块全局状态；attempt 包含提交的关系和顺序。problem_id 标识具体题目实例，换新实例即重置，即使数值等价。渲染前核对 state 与题目实例是否匹配。
2. `submit_attempt(problem_id, state, relation)`：只接受三个关系词；首次提交进入 attempted，后续追加尝试；最终前不输出 correctness。
3. `reveal_next(problem_id, state)`：awaiting_attempt 保持不变并说明先作答；随后 attempted → hint_1 → hint_2 → explained；最终状态幂等。
4. `render(problem, state=None)`：保留原单参调用形式，默认返回 awaiting_attempt 的新展示投影。建议输出 `{stage, attempt, hints, can_reveal, verdict, explanation, feedback}`；最终前 verdict/explanation/feedback 为 `None`，hints 只含已揭晓部分。旧 render 的即时展示返回行为是本次有意改变，调用方若依赖旧键值必须迁移。不要把未揭晓答案装进 HTML 隐藏节点或序列化 payload。
5. `compare` 保持完全独立；提示和解释在各自阶段按需生成。通过 `Fraction` 归一化后计算公共正分母，避免原始负分母导致“分子大就更大”的错误。最终解释先判断 equal，同分母相等说等大份数相同；异分母显示等值变换再解释关系，不仅复述结论。

先记录现有基线与失败，再写状态转换和投影，最后接调用方。单独修复 explanation 的相等分支并验证归一化分母情形。因为目前没有页面代码，页面改动的具体文件路径仍待定位，不能把 README 的“practice page”推断成已找到 UI。

## 验收与当前执行结果

已实际运行 `PYTHONDONTWRITEBYTECODE=1 python3 …/practice/test_fractions.py`：2 个测试，comparison 通过，equal_explanation 失败。失败原因为 `explanation((1,4),(1,4)) == 'B has more equal-sized parts.'`，不是本次改造造成的回归。额外运行的探针确认异分母等值、零分子、负分母等值仍返回 equal，零分母抛 ZeroDivisionError。所有输出位于独立交付目录，源文件不变。

实施后的验收（尚未运行）：

- 原 test_comparison 保持通过；原 test_equal_explanation 修复后通过。
- compare 对同分母相等、异分母等值、小于、大于、零分子和负分母返回与基线一致；零分母异常不变。
- 初始、首次提交、两次提示、第三次最终解释逐步验证输出；每次操作只推进一个阶段，初始跳过尝试失败，重复渲染不推进。
- 首次答错再重试保持首次尝试记录及已揭晓层数；最终反馈与 compare 一致；换题不残留旧尝试、提示或反馈；状态与题目 ID 不匹配拒绝或重置。
- 提示内容不包含显式正确关系或最终解释；最终説明同分母相等不说某一方更多；归一化分母后的解释与数学一致。
- 接入真实页面后检查作答、揭晓、换题按钮和键盘焦点顺序，错误/禁用状态有文本说明。因未提供页面，这些检查本次未执行。
