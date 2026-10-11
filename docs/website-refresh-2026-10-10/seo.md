# 原站 SEO 交付 — 2026-10-10

## 实际检查结论

目标是 `apps/site-original/`（`codex/original-site`），正式域名沿用 https://edu-ai-builders.dev。GPT 预览、Radar 独立仓库、hosting 配置均未修改；没有 commit、push 或部署。根 README 与 AGENTS 已读。

Chrome 实际打开正式首页成功。线上 title 为「Edu AI Builders — 用 AI 做出自己的学习工具」，description 存在；首页 DOM 未发现 canonical、robots meta 或 JSON-LD。`/robots.txt` 与 `/sitemap.xml` 均显示站点 404 页面。最初终端 DNS 失败、网页工具打开失败属于工具环境限制，已用用户 Chrome 会话修正，不能认定域名故障。

网页搜索执行了品牌名及 `site:edu-ai-builders.dev`；返回品牌 GitHub 页面，未返回该域名页面。这只是该检索服务的观察，不能据此断言 Google 索引为零。尚无 GSC 报表、URL Inspection 或 Google-selected canonical 数据；索引量、排名、曝光、点击和搜索量均未知。

## 搜索意图与关键词映射

以下 Primary Keywords 是基于现有内容与公开搜索结果的编辑选择，不是搜索量或排名预测。中文优先、英文作为现有英文阅读模式的标题适配；没有购买工具或捏造量级。

| 页面 | 主关键词 | 搜索意图 / 页面分工 |
| --- | --- | --- |
| `/` | Edu AI Builders；AI 学习工具 | 品牌导航、发现如何把教学点子做成工具 |
| `/learn` | 免费 AI 编程课程；学习科学课程 | 浏览并选择免费入门路径 |
| `/learn/vibe-coding-basics` | Vibe coding 入门；教师 AI 编程 | 零基础做出第一个学习工具 |
| `/learn/learning-sciences-starter` | 学习科学入门；教学设计 | 理解学习机制并用于设计 |
| `/learn/personal-learning-assistant` | 制作个人学习助手 | 任务型教程 |
| `/learn/landing-page` | AI 制作网页；网页入门 | 从想法制作网页 |
| `/learn/web-interactions` | 网页交互入门 | 增加交互、观察用户动作 |
| `/learn/github-starter` | GitHub 入门；Git 版本管理 | 保存与分享构建成果 |
| `/learn/refactor-with-ai` | AI 重构代码 | 改进已有项目 |
| `/use` | 免费互动教学工具；数学可视化 | 打开即可使用的工具选择 |
| `/use/[slug]` | 实际工具名称（分数条比较器等） | 直接完成对应教学任务；标题和摘要来自资源数据 |
| `/build` | 教育 AI Skills；教学设计资源 | 找可复用技能与组件 |
| `/atlas` | 学习科学概念地图 | 探索概念及设计关联 |
| `/learning-sciences` | 学习科学知识库；教学设计证据 | 查原理、证据边界与来源 |
| `/directory` | 教育 AI 开源项目；教育开源工具 | 搜索、比较开源资源与来源状态 |
| `/changelog` | Edu AI Builders 更新日志 | 品牌更新导航 |
| `/updates/research` | EduOS；教育 AI 基础设施 | 了解探索中的研究，不暗示可用产品 |

公开资料支持「Vibe Coding + 教师互动课堂」有明确任务语境：[香港教育局工作坊](https://www.edb.gov.hk/sc/curriculum-development/kla/technology-edu/resources/InnovationAndTechnologyEducation/seminars.html)列出创建互动课堂与教师实践分享；[武汉传媒学院培训记录](https://jsxy.whmc.edu.cn/info/1302/14314.htm)涉及零基础教师、Vibe Coding 与教学科研任务。这些资料支持语言与意图选择，不证明需求规模。后续应使用 GSC 的实际 query 数据调整，而不是全面争夺「AI 教育」这样过宽的词。

## 已落地代码

- `app/seo/metadata.ts`：统一正式域名、metadataBase、逐页绝对 canonical、Open Graph 与 Twitter summary；六个栏目提供具体中英搜索标题。
- 根布局和各页面仅修改 metadata import / generateMetadata；未改首页 JSX、UI 或课程正文。课程详情沿用实际课程标题摘要，工具详情补齐资源摘要。工具列表 description 移除容易过时的固定数量。
- `app/robots.ts`：允许抓取并声明正式 sitemap。
- `app/sitemap.ts`：从当前课程与可运行工具生成 URL，去重；包含栏目页、知识库、日志与研究页，排除 `/updates` 和旧 Git 课程重定向、查询参数与原始 HTML 下载。没有把构建时间冒充内容更新时间。
- `app/seo/structured-data.tsx`：最小 Organization / WebSite JSON-LD，身份关联公开 GitHub。未添加未知地址、评分、认证或效果承诺。
- `seo-structured-data.patch`：共享根布局接入 JSON-LD 的单独补丁。按本任务的协作边界，组件已实现并通过 JSON 校验，但补丁尚未应用，页面目前尚未输出这段 JSON-LD。应用位置是在 `<body>` 开始处；不影响可见布局。后续整合时以当时 layout 为准，不覆盖视觉 thread 的更新。

现有语言由 cookie 决定，没有独立语言 URL，因此两种模式共用 canonical，未伪造 hreflang 页面。Googlebot 不一定能发现 cookie 英文版本；如果英文搜索流量成为重点，应另行设计稳定 `/en/...` 路由，再配置自引用与互指 hreflang，属于后续产品路由工作。没有加入 Google 不使用的 meta keywords，也未杜撰分享图片。

## 验证

原站运行：`node_modules/.bin/tsc --noEmit` 通过；`node_modules/.bin/eslint app/seo app/robots.ts app/sitemap.ts tests/seo.test.mjs` 通过；`node --test tests/seo.test.mjs` 3/3 通过。测试检查本地化 metadata/canonical、所有实际课程与可运行工具的 sitemap 覆盖及重定向排除、robots 声明与 JSON-LD JSON/身份关联。

没有运行生产 build 或部署，避免与其他同时工作的 thread 共用 `.next` 输出。需要整合完成后统一运行 build，并在部署后检查实际 HTTP 与渲染 HTML；本次测试不等于线上发布或 Google 富媒体结果验证。

## Search Console 实际状态与阻碍

已用当前 Chrome Google 会话打开 `https://search.google.com/search-console`。页面进入 `/welcome`；打开侧栏 Search property 下拉后明确显示 **No matching property** 与 Add property。当前账号已登录，但没有可操作的已验证网站属性。工具清单中也未发现 Search Console connector。

**没有提交 sitemap，没有完成域名所有权验证，也没有请求索引。** 线上 sitemap 目前 404；本任务明确禁止部署，因此不能提交一个尚未公开可抓取的本地 sitemap。没有另建无效属性、修改 DNS 或索要用户凭据。

具体下一步：
1. 整合结构化数据补丁、运行统一 production build；获得独立部署授权后由原站现有 Vercel 项目发布。
2. 检查 `https://edu-ai-builders.dev/robots.txt`、`/sitemap.xml` 返回 200 与对应文本/XML，检查各页面 canonical 和 JSON-LD。
3. 在具备该域名权限的 Google 账号中选择现有 property；如从未创建，在 GSC 添加 Domain property `edu-ai-builders.dev`，由 DNS 管理者加入 Google 提供的 TXT 后点击 Verify。也可使用 URL-prefix property `https://edu-ai-builders.dev/` 与正式站点 HTML tag/file 验证；验证值只能取自该账号当次界面，不能猜测。
4. 在已验证 property 的 Sitemaps 页面提交 `https://edu-ai-builders.dev/sitemap.xml`，核实提交状态、抓取时间与发现 URL；保留成功截图。再用 URL Inspection 检查首页、课程详情、工具详情的实时可索引性和 Google-selected canonical。
5. 根据实际索引与 Performance query 数据调整关键词。Sitemap 提交不保证收录，结构化数据不保证富媒体展示。

## 本次查询的 Google 官方资料

- [Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)：canonical URL、准确 lastmod、GSC 提交。
- [Canonical URL guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)：canonical 与 sitemap 信号保持一致。
- [Organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization)：只添加适用的真实组织信息，发布后用 Rich Results Test 与 URL Inspection 验证。
- [Sitemap overview](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)：发现 URL 不代表保证抓取或收录。
