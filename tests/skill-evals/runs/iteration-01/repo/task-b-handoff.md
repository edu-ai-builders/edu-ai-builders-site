# B：商业科学课堂问答组合与最小流程

结论：retriever 与 viewer 适合做小型、有页码的抽取式原型，但不能直接组成可上线的任意科学问答。需要格式适配、来源校验与 HTML 安全边界；检索目前仅做子串匹配，没有自然语言理解或答案生成。已在隔离输出目录跑通“实际 retriever → 适配器 → 实际 viewer”的本地最小流程，使用本次新写的两页科学短文，未使用非商业样例数据。

## 证据、能力与复用条件

来源目录：`/private/tmp/edu-skill-evals-20261012/fixtures/repos/{retriever,viewer}`。两目录无 `.git`，版本未固定至提交；逐文件 SHA-256 见 `source-manifest.json`。`retriever/query.py` 哈希 `f741effb3dcf27465944636d2336d20a8c19dd002cfd852ce780d00723ae4a51`；`viewer/answer.mjs` 哈希 `3a00de82ea3b9cc46ba5aee888aa4fe20f4d7419ed86550be97c6719d9671bc4`。

| 能力 | 文件/符号、输入输出与限制 | 决策 |
|---|---|---|
| 页面检索 | `retriever/query.py:2–4`，`retrieve(query, documents)`；documents 条目为 `{id, page, text}`；输出 `{text, source:{document_id,page}, score}` 数组。仅 `query.lower() in text.lower()`，命中 score 固定 0.8 | 复用作最小验证；给任意课堂自然语言问答时须改检索。0.8 不是可校准的置信度，不可用来保证可靠答案 |
| 展示 | `viewer/answer.mjs:1–4`，`renderAnswer({answer:string,citations:[{url,label}]}) → HTML string` | 保留纯展示职责，添加安全边界。输入字段与 retriever 不同，必须适配 |
| 不可信 HTML | viewer:2 直接插入 href、label，viewer:3 直接插入 answer；README:2 把可信性判断留给调用方 | 原样接用户文本会注入 HTML，属性值和链接协议也有风险。最小流程所有文字转义，链接只由有效来源生成；长期用 DOM textContent 及受控 href 渲染 |
| 商业复用 | 两者 LICENSE:1–13 为 MIT；retriever/DATA-LICENSE.txt:1 和 README:2 将 sample_documents.json 单独限制为非商业 | 可复用代码并保留版权及许可；商业产品排除该样例数据。代码 MIT 不授予教材权利 |

观察范围只有上述两目录各文件。无 OAuth、服务端、UI 或文档导入器；Python 与 JavaScript 运行时不同，但数据可用 JSON 串接。当前皆无账户和持久状态，所以本地没有认证冲突；生产部署必须补文档所属用户/班级及访问范围，不能根据这个本地结果推断多用户集成可用。没有包清单或第三方依赖，最小流程使用已有 Python、Node 与标准库，未安装包。

## 明确接口合同

本地流程为页面条目 → retrieve → 校验命中 → 引用适配 → 安全展示。最终可用 HTTP JSON 替代演示中的 subprocess 边界。

- `DocumentPage = {id:string, page:positive integer, text:string}`。每一条是单一页，text 为原文的纯文本；page 必须明确来自物理页还是教材印刷页。拒绝缺页码、布尔值/非整数页码、未知文档。未来可加 title、revision、rights、owner 和 chunk_id；跨页 chunk 必须拆开或携带精确页范围，不能猜测页码。
- `Hit = {text, source:{document_id,page}, score}`。校验 source 指向本次授权文档及对应页，text 必须能在该页定位。演示用整页一致匹配；生产可换为 chunk 与 offset 校验。
- `AnswerModel = {status:'supported'|'no_evidence', answer:string, citations:[{url,label,document_id,page}]}`。supported 的事实文字必须来自已核实页面，每个片段需要来源映射；不能只有回答末尾一个与主张无关的链接。演示直接摘录原文并列页码，不调用模型、不声称做了推理。
- 无命中或只有无页码证据时输出 no_evidence 和明确“所选资料中未找到支持此问题的页面”，禁止自行生成来源；不存在证据的回答不伪造引用。多个命中逐条保留 source，后续若合并主张仍必须保留全部支持页。
- Viewer 收到 plain string，不接收“已信任 HTML”。文本在渲染边界仅转义一次；答案、引用 label、来源页内容分别处理。链接必须由文档解析器根据受控文档 ID 与页码生成并验证，拒绝 javascript/data 等 URL；不能把上传文档提供的任意 URL直接用作 href。

## 已完成的最小流程与查看方式

`owned-documents.json` 是本次新写的两页科学演示资料；来源说明在 `owned-documents-provenance.md`。未把 `sample_documents.json` 纳入检索、复制到输出或当作商业种子资料。其第 1 页特意含 `<img src=x onerror="alert(1)">` 测试文字，验证显示为原文而非执行标签。页码是自有本地文档的页节编号，不能视作已验证 PDF 提取。

运行：`PYTHONDONTWRITEBYTECODE=1 python3 /private/tmp/edu-skill-evals-20261012/baseline-repo/run_minimal_b.py`。该程序只读取源库，通过 import 调用实际 `retrieve`，生成带 page 的结构，再以已有 Node 导入实际 `renderAnswer`。适配器转义文字并将链接限制为本地页节。`minimal-answer.html` 包含回答、第 1 页链接和两页来源文本；点击引用可跳到实际对应页节。`answer-payload.json` 保留结构化页码，便于后续 API 对接。

实际结果：查询“水受热”引用第 1 页；“闭合回路”引用第 2 页；“光合作用”无证据并不提供引用；HTML 标签被转义；恶意链接被拒绝。Python 断言和 Node 实际调用均成功。仅证明这个有限抽取式流程，未做浏览器点击或脚本执行测试，未验证任意中文问题、PDF 分页、模型答案或多用户权限。

## 改造计划与验收

1. 先接用户已确认有权使用的教材，保留 document_id、版本、页码定义、授权记录及原页预览。缺授权的资料隔离；缺页码的资料不进入需要页码的问答。演示可保留这份新写资料，不用仓库 NC 数据。
2. 把演示适配合同移入目标后端，给 Python retrieval 暴露 JSON。输入长度/空查询校验、页码校验、来源存在性校验在边界完成，空查询不能让子串算法返回全部材料。
3. 改 viewer 为 DOM/模板的文本渲染，受控链接、页码标签与页预览。若未来确需富文本，单独选择维护中的 sanitizer 及允许标签；本次没有安装或选择未经验证的依赖。
4. 依据课堂问题集评估检索，再增加分词/语义检索等候选方案。先测“水为何会沸腾”等问题能否召回，不把固定 score 当作可信度阈值。引用正确率与检索覆盖分别评估。
5. 如果增加生成式回答，每个主张绑定命中页，引用验证失败即弃答或返回抽取式原文；资料内指令仅作内容，不是执行命令。最后接入教师审核或纠错入口，记录问题、证据页、版本和输出。
6. 上线前补资料可见范围、多用户隔离、保留与删除策略；本次没有服务、账户或共享功能，相关验收未完成。

验收集应覆盖：单页、多页、未知文档、丢失/非法页码、无匹配、空问题、中文改写问题；事实与页面对应；第 N 页链接实际打开对应来源；HTML 文本/引号/实体正确显示；事件标签和恶意协议不能执行；用户 A 不能查用户 B 文档；商业打包没有 NC 样例且复用文件包含 MIT 通知。最小流程已跑前三种查询及 HTML/URL 边界；其余为实施后测试，不能宣称已通过。
