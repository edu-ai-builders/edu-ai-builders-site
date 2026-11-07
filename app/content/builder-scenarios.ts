import type { BuilderScenario } from "../lib/builder-core";
export const builderScenarios: BuilderScenario[] = [
  {
    "slug": "family-math",
    "title": "给孩子做一个分层提示的数学练习页",
    "audience": "家长 · 数学",
    "outcome": "一个可以选题、先尝试、再逐层看提示的练习页。",
    "summary": "从一条数学题开始，把提示的出现时机交给你。",
    "keywords": [
      "math",
      "mathematics",
      "fraction",
      "homeschool",
      "parent",
      "数学",
      "分数",
      "家长",
      "孩子",
      "家庭"
    ],
    "resourceIds": [
      "repo:1167667024",
      "repo:419462905",
      "github-skill:1103643573:skills/.curated/pdf/SKILL.md",
      "github-skill:1103643573:skills/.curated/jupyter-notebook/SKILL.md"
    ],
    "resourceRoles": [
      "参考辅导交互；完整产品也可作为替代方案。",
      "选取少量有来源的数学题，先检查答案。",
      "需要导入自有 PDF 时，参考资料处理流程。",
      "整理题目检查与评测记录；不要求先训练模型。"
    ],
    "courses": [
      "vibe-coding-basics",
      "learning-sciences-starter",
      "web-interactions"
    ],
    "steps": [
      "先用三道自己有权使用的题目做一个静态页面。",
      "将作答、提示和反馈分别建模；每次只显示下一层提示。",
      "再接入题目来源或资料导入，保留题目 ID 与引用。",
      "交给学习者试一次，检查错误反馈与第二次尝试。"
    ],
    "acceptance": [
      "答案展示前可以先作答；提示不会一次全部揭晓。",
      "题目答案可核对，反馈与当前题目一致。",
      "手机可用，键盘可操作；不必上传学习者身份。"
    ],
    "starter": "/use/fraction-bars"
  },
  {
    "slug": "science-evidence",
    "title": "给课堂做一个带来源的科学问答活动",
    "audience": "教师 · 科学",
    "outcome": "一个展示问题、资料出处和讨论任务的科学学习活动。",
    "summary": "先让学生判断证据，再决定要不要接入问答模型。",
    "keywords": [
      "science",
      "evidence",
      "classroom",
      "teacher",
      "科学",
      "物理",
      "证据",
      "课堂",
      "教师",
      "老师"
    ],
    "resourceIds": [
      "repo:1178737655",
      "repo:730534580",
      "repo:552715974",
      "repo:259442120"
    ],
    "resourceRoles": [
      "比较课堂交互与角色活动；不必与其他整套产品合并。",
      "需要资料检索时，深入检查解析与引用能力。",
      "非商业题目研究参考；商业方案先排除受限数据。",
      "参考主张、证据与判断任务，分别检查材料许可。"
    ],
    "courses": [
      "learning-sciences-starter",
      "personal-learning-assistant",
      "refactor-with-ai"
    ],
    "steps": [
      "先选一条科学主张和两份有权使用的资料。",
      "做出主张、证据片段和出处的可比较界面。",
      "需要检索时选一个实现，核对返回引用与页面定位。",
      "让学生解释证据是否足够；教师检查反馈。"
    ],
    "acceptance": [
      "每条证据能回到出处，缺少证据时明确说明。",
      "商业方案不默认包含受限的题目数据。",
      "学生有判断与解释的动作，而不只是读取模型答案。"
    ],
    "starter": "/learn/personal-learning-assistant"
  },
  {
    "slug": "research-workflow",
    "title": "做一个可复查的文献与实验助手",
    "audience": "高校 · 研究",
    "outcome": "一个保留文献来源、检索条件和实验结果的研究工作流。",
    "summary": "把查资料、做实验、看结果组织成可以重复检查的过程。",
    "keywords": [
      "research",
      "university",
      "literature",
      "paper",
      "experiment",
      "研究",
      "高校",
      "大学",
      "文献",
      "论文",
      "实验"
    ],
    "resourceIds": [
      "repo:587050620",
      "repo:655806940",
      "repo:894113337",
      "github-skill:1061953414:skills/skill-creator/SKILL.md"
    ],
    "resourceRoles": [
      "比较程序化 AI 工作流与评价接口。",
      "参考实现与学习材料；按模块选取。",
      "涉及模型适配时再使用；不是基础检索的必要依赖。",
      "将重复研究任务写成 skill，并迭代验收。"
    ],
    "courses": [
      "personal-learning-assistant",
      "github-starter",
      "refactor-with-ai"
    ],
    "steps": [
      "用三篇自有或可使用的文献，建立来源与引用表。",
      "先做可复现的检索与结果记录，再考虑模型工作流。",
      "定义评测输入、输出和固定版本，运行一个小样例。",
      "重复任务稳定后，再用 Skill Fusion 整理个人工作方法。"
    ],
    "acceptance": [
      "引用能核对，推断与来源陈述分开。",
      "实验条件、依赖和版本可记录，失败不被隐藏。",
      "不同输出用相同任务比较，实际 token 和时间另行记录。"
    ],
    "starter": "/learn/personal-learning-assistant"
  }
];
export const builderSkills = [
  {
    "name": "edu-resource-search",
    "version": "0.1.0",
    "title": "资源搜索",
    "purpose": "按问题找到相关的 skills、repo、数据与评测，留下比较理由。"
  },
  {
    "name": "edu-design-plan",
    "version": "0.1.0",
    "title": "设计与计划",
    "purpose": "把资源变成学习交互、接口、开发步骤与验收任务。"
  },
  {
    "name": "edu-repo-adapter",
    "version": "0.2.1",
    "title": "Repo 能力适配",
    "purpose": "找到实现在哪里，决定复用、改造或重写，并输出证据。"
  },
  {
    "name": "edu-skill-fusion",
    "version": "0.2.1",
    "title": "工作流融合",
    "purpose": "按你的工作方法提炼多个 skills，生成自己的 skill。"
  }
];

export const builderScopes = [
  {
    "name": "edu-resource-search",
    "inputs": [
      "产品目标、使用者、平台与必须满足的条件。",
      "可用目录、候选资源或本地元数据。"
    ],
    "outputs": [
      "带来源与版本的候选清单、替代项和缺口。",
      "每项资源的职责与下一步核对动作。"
    ],
    "acceptance": [
      "找不到满足条件的资源时，能明确返回缺口。",
      "名称、热度或关键词不被当作运行证明。"
    ],
    "prompt": "我要做一个面向家长的数学练习 Web app。请比较已有产品和可复用组件，列出来源、条件与缺口。",
    "example": null
  },
  {
    "name": "edu-design-plan",
    "inputs": [
      "产品需求、学习目标与已有资源候选。",
      "目标技术栈、部署条件和可接受的依赖。"
    ],
    "outputs": [
      "最小学习流程、资源职责、数据接口和实现顺序。",
      "可交给 coding agent 的开发计划与验收任务。"
    ],
    "acceptance": [
      "每项依赖有必要性，替代产品不会被全部强行组合。",
      "计划区分假设、待核对条件和实际运行结果。"
    ],
    "prompt": "基于这些候选，先设计一个三道题、两层提示的练习页。给我接口、开发步骤和验收标准。",
    "example": "/downloads/scopes/family-math-build-brief.md"
  },
  {
    "name": "edu-repo-adapter",
    "inputs": [
      "一个或多个 repo，以及要定位的具体功能。",
      "固定版本、已有项目、目标平台与改造方式。"
    ],
    "outputs": [
      "功能到源文件、函数与测试的证据地图。",
      "复用、适配或重写的决策，以及接口和改造计划。"
    ],
    "acceptance": [
      "证据来自实际读取的版本；未知与推断分别保留。",
      "Refactor 保留行为基线；Redesign 明确要改变的行为。",
      "多 repo 的数据格式、状态与依赖冲突被逐项检查。"
    ],
    "prompt": "检查这个 repo 的分数比较功能，把它适配成分层提示练习。先给出源码定位、保留行为、变化范围与验收，再决定怎样改。",
    "example": "/downloads/scopes/repo-adapter-complete-handoff.json"
  },
  {
    "name": "edu-skill-fusion",
    "inputs": [
      "重复任务、输入输出、工作偏好与必须遵守的要求。",
      "候选 skills、来源版本、可委派工具与验收样例。"
    ],
    "outputs": [
      "自己的 SKILL.md、按需参考资料和使用边界。",
      "保留、改写、委派与删除的决策表，以及来源记录。"
    ],
    "acceptance": [
      "新 skill 按 workload 触发，避免直接合并所有触发词。",
      "要求冲突有明确取舍，未知工具有降级方案。",
      "格式检查与真实任务效果分别报告。"
    ],
    "prompt": "把资源搜索与设计计划提炼成我的家庭数学产品工作流：双语、移动端优先、逐层提示，先不接付费模型。保留融合决策并写出新 skill。",
    "example": "/downloads/skills/family-math-workflow-example.zip"
  }
];
