// Bilingual concept lexicon for builder search. Written from domain knowledge on
// 2026-10-29 before the frozen query set existed; do not tune it against test queries.
// Each concept: surface forms that detect it in a query (zh/en) and index terms it expands to.
// `generic` concepts carry little intent and do not count toward query coverage.

export const CONCEPTS = [
  // research methods
  { id: "qualitative", zh: ["质性", "定性", "質性"], en: ["qualitative", "qda"], expand: ["qualitative", "interview", "thematic analysis", "grounded theory", "qda", "coding scheme", "codebook"] },
  { id: "interview", zh: ["访谈", "訪談", "采访"], en: ["interview", "interviews"], expand: ["interview", "transcript", "qualitative"] },
  { id: "thematic", zh: ["主题分析", "主题编码", "编码", "码本"], en: ["thematic analysis", "thematic coding", "qualitative coding", "codebook", "coding scheme"], expand: ["thematic analysis", "codebook", "qualitative", "annotation", "coding scheme"] },
  { id: "transcript", zh: ["转录", "转写", "逐字稿"], en: ["transcript", "transcription", "transcribe"], expand: ["transcript", "transcription", "speech to text", "whisper", "asr"] },
  { id: "quantitative", zh: ["量化", "定量", "统计分析", "统计"], en: ["quantitative", "statistics", "statistical", "stats"], expand: ["statistics", "statistical", "regression", "quantitative", "data analysis"] },
  { id: "prepost", zh: ["前后测", "前测", "后测"], en: ["pre-post", "pretest", "posttest", "pre test", "post test"], expand: ["pretest", "posttest", "paired", "repeated measures", "effect size"] },
  { id: "effect-size", zh: ["效应量", "显著性", "t检验", "方差分析"], en: ["effect size", "t-test", "anova", "significance", "hypothesis test"], expand: ["effect size", "anova", "hypothesis", "statistics", "regression"] },
  { id: "survey", zh: ["问卷", "调查"], en: ["survey", "questionnaire", "likert"], expand: ["survey", "questionnaire", "likert", "form"] },
  { id: "literature", zh: ["文献综述", "文献", "论文", "引用", "参考文献"], en: ["literature review", "literature", "papers", "citation", "citations", "reference manager", "bibliography"], expand: ["literature review", "paper", "citation", "zotero", "bibliography", "arxiv", "scholarly", "academic"] },
  { id: "systematic-review", zh: ["系统综述", "元分析", "荟萃分析"], en: ["systematic review", "meta-analysis", "meta analysis", "prisma"], expand: ["systematic review", "meta analysis", "prisma", "screening", "literature review"] },
  { id: "research", zh: ["研究", "科研", "学术"], en: ["research", "researcher", "academic", "study"], expand: ["research", "academic", "scholarly", "study"], generic: true },
  { id: "experiment", zh: ["实验设计", "a/b测试", "ab测试", "对照"], en: ["experiment", "a/b test", "ab test", "randomized", "rct"], expand: ["experiment", "a/b testing", "randomized", "causal inference"] },
  { id: "learning-analytics", zh: ["学习分析", "教育数据挖掘", "学情"], en: ["learning analytics", "educational data mining", "edm"], expand: ["learning analytics", "educational data mining", "dashboard", "student data", "xapi"] },
  { id: "dashboard", zh: ["仪表盘", "看板", "数据面板"], en: ["dashboard", "dashboards"], expand: ["dashboard", "analytics", "visualization", "chart"] },
  { id: "knowledge-tracing", zh: ["知识追踪", "学习者建模", "学生建模", "认知诊断"], en: ["knowledge tracing", "learner model", "learner modeling", "student model", "student modeling", "bkt", "dkt", "cognitive diagnosis"], expand: ["knowledge tracing", "bayesian knowledge tracing", "deep knowledge tracing", "student modeling", "learner model", "item response theory", "cognitive diagnosis"] },
  { id: "irt", zh: ["项目反应理论", "题目难度"], en: ["item response theory", "irt", "psychometrics", "psychometric"], expand: ["item response theory", "psychometrics", "irt", "assessment"] },

  // teaching, visualization, subjects
  { id: "visualization", zh: ["可视化", "图示", "动画", "图表"], en: ["visualization", "visualisation", "visualize", "visual", "animation", "chart"], expand: ["visualization", "interactive", "animation", "d3", "chart", "diagram"] },
  { id: "simulation", zh: ["仿真", "模拟", "虚拟实验"], en: ["simulation", "simulations", "simulator", "virtual lab", "phet"], expand: ["simulation", "simulator", "interactive", "virtual lab", "phet", "physics engine"] },
  { id: "physics", zh: ["物理", "力学", "光学", "电路", "电磁"], en: ["physics", "mechanics", "optics", "circuit", "circuits"], expand: ["physics", "mechanics", "optics", "circuit", "simulation"] },
  { id: "optics", zh: ["光学", "光的折射", "透镜"], en: ["optics", "lens", "refraction", "light"], expand: ["optics", "lens", "refraction", "light", "ray tracing"] },
  { id: "chemistry", zh: ["化学", "分子"], en: ["chemistry", "molecule", "molecular"], expand: ["chemistry", "molecule", "periodic table"] },
  { id: "biology", zh: ["生物", "细胞", "基因"], en: ["biology", "cell", "genetics"], expand: ["biology", "cell", "genetics", "evolution"] },
  { id: "math", zh: ["数学", "算术", "代数", "几何", "微积分", "分数", "方程"], en: ["math", "maths", "mathematics", "algebra", "geometry", "calculus", "arithmetic", "fractions", "equation"], expand: ["math", "mathematics", "algebra", "geometry", "calculus", "arithmetic", "fraction"] },
  { id: "geometry", zh: ["几何", "作图"], en: ["geometry", "geogebra"], expand: ["geometry", "geogebra", "construction"] },
  { id: "word-problem", zh: ["应用题", "解题", "解题步骤"], en: ["word problem", "word problems", "step by step", "worked example", "worked examples"], expand: ["word problem", "step by step", "worked example", "solution", "gsm8k", "math reasoning"] },
  { id: "science", zh: ["科学", "理科", "stem"], en: ["science", "stem"], expand: ["science", "stem", "physics", "chemistry", "biology"] },
  { id: "history", zh: ["历史", "地理", "社会科学"], en: ["history", "geography", "social studies"], expand: ["history", "geography", "humanities", "social studies"] },
  { id: "music-art", zh: ["音乐", "美术", "艺术", "绘画"], en: ["music", "art", "drawing"], expand: ["music", "art", "drawing", "creative"] },
  { id: "programming-edu", zh: ["编程教育", "编程", "少儿编程", "代码教学", "计算机教育"], en: ["coding education", "learn to code", "programming", "programming education", "cs education", "scratch", "python course"], expand: ["programming", "learn to code", "coding", "computer science", "scratch", "python", "cs education"] },
  { id: "autograder", zh: ["自动评测代码", "代码评测", "判题", "oj"], en: ["autograder", "auto grader", "code grading", "online judge"], expand: ["autograder", "grading", "online judge", "unit test", "programming assignment"] },

  // language learning
  { id: "language-learning", zh: ["语言学习", "外语", "英语学习", "学英语", "二语"], en: ["language learning", "language learner", "esl", "efl", "second language", "foreign language"], expand: ["language learning", "esl", "efl", "foreign language", "language learner", "duolingo"] },
  { id: "vocabulary", zh: ["词汇", "单词", "背单词", "生词", "記憶卡", "记忆卡", "抽认卡"], en: ["vocabulary", "vocab", "words", "flashcard", "flashcards", "word list"], expand: ["vocabulary", "flashcard", "spaced repetition", "anki", "word", "srs", "fsrs"] },
  { id: "spaced-repetition", zh: ["间隔重复", "记忆曲线", "艾宾浩斯", "复习"], en: ["spaced repetition", "srs", "anki", "fsrs", "review schedule", "forgetting curve"], expand: ["spaced repetition", "anki", "fsrs", "srs", "flashcard", "memory"] },
  { id: "reading", zh: ["阅读", "分级阅读", "阅读理解"], en: ["reading", "reading comprehension", "graded reader", "graded readers", "literacy"], expand: ["reading", "reading comprehension", "literacy", "graded reader", "readability"] },
  { id: "writing-feedback", zh: ["写作", "作文", "批改作文", "写作反馈", "作文批改"], en: ["writing", "essay", "essays", "writing feedback", "essay scoring", "automated essay scoring", "grammar"], expand: ["writing", "essay", "feedback", "grammar", "automated essay scoring", "writing assistant"] },
  { id: "speaking", zh: ["口语", "发音", "语音评测", "跟读"], en: ["speaking", "pronunciation", "speech", "oral"], expand: ["speaking", "pronunciation", "speech", "speech recognition", "asr"] },
  { id: "translation", zh: ["翻译", "双语"], en: ["translation", "bilingual", "translate"], expand: ["translation", "bilingual", "multilingual"] },
  { id: "chinese-lang", zh: ["汉字", "中文学习", "拼音", "汉语"], en: ["chinese characters", "hanzi", "pinyin", "mandarin", "learn chinese"], expand: ["chinese", "hanzi", "pinyin", "mandarin", "kanji"] },
  { id: "exam-prep", zh: ["雅思", "托福", "四六级", "高考", "考研", "备考"], en: ["ielts", "toefl", "gre", "sat", "exam prep", "test prep"], expand: ["ielts", "toefl", "exam", "test prep", "gre"] },

  // assessment, feedback, tutoring
  { id: "assessment", zh: ["测评", "评估", "考试", "测验", "题库", "出题", "组卷"], en: ["assessment", "quiz", "quizzes", "exam", "test bank", "question bank", "question generation", "item bank"], expand: ["assessment", "quiz", "exam", "question bank", "question generation", "test"] },
  { id: "grading", zh: ["批改", "评分", "打分", "自动评分", "阅卷"], en: ["grading", "auto grading", "automatic grading", "scoring", "marking", "grader"], expand: ["grading", "scoring", "feedback", "rubric", "autograder", "evaluation"] },
  { id: "rubric", zh: ["评分标准", "量规", "评价量表"], en: ["rubric", "rubrics"], expand: ["rubric", "grading", "assessment", "criteria"] },
  { id: "feedback", zh: ["反馈", "点评"], en: ["feedback"], expand: ["feedback", "formative", "comments"] },
  { id: "tutor", zh: ["辅导", "家教", "ai老师", "ai 老师", "智能导师", "答疑", "苏格拉底"], en: ["tutor", "tutoring", "ai tutor", "intelligent tutoring", "socratic", "teaching assistant"], expand: ["tutor", "tutoring", "intelligent tutoring", "socratic", "teaching assistant", "chatbot"] },
  { id: "agent", zh: ["智能体", "代理", "agent"], en: ["agent", "agents", "agentic", "multi-agent"], expand: ["agent", "multi agent", "agentic", "llm"] },
  { id: "llm", zh: ["大模型", "大语言模型", "语言模型", "chatgpt", "gpt"], en: ["llm", "llms", "large language model", "chatgpt", "gpt", "language model", "generative ai", "genai"], expand: ["llm", "large language model", "gpt", "generative ai", "chatgpt", "openai"] },
  { id: "prompt", zh: ["提示词", "提示工程"], en: ["prompt", "prompts", "prompt engineering", "system prompt"], expand: ["prompt", "prompt engineering", "prompting"] },
  { id: "rag", zh: ["知识库", "检索增强", "课程资料问答", "文档问答", "rag"], en: ["rag", "retrieval augmented", "retrieval-augmented", "knowledge base", "document qa", "chat with pdf", "question answering"], expand: ["rag", "retrieval augmented generation", "knowledge base", "vector database", "embedding", "question answering", "document"] },
  { id: "pdf", zh: ["pdf", "讲义", "课件"], en: ["pdf", "slides", "lecture notes"], expand: ["pdf", "document", "slides", "lecture"] },

  // teachers and planning
  { id: "lesson-plan", zh: ["备课", "教案", "教学设计", "课程设计", "课程规划"], en: ["lesson plan", "lesson planning", "lesson plans", "curriculum design", "course design", "instructional design", "syllabus"], expand: ["lesson plan", "lesson planning", "curriculum", "instructional design", "syllabus", "course design"] },
  { id: "curriculum", zh: ["课程", "课程体系", "教材"], en: ["curriculum", "course", "courses", "textbook", "mooc"], expand: ["curriculum", "course", "textbook", "mooc"] },
  { id: "teacher", zh: ["老师", "教师", "教学"], en: ["teacher", "teachers", "teaching", "educator", "instructor", "classroom"], expand: ["teacher", "teaching", "classroom", "educator"] },
  { id: "classroom-mgmt", zh: ["课堂管理", "考勤", "班级管理"], en: ["classroom management", "attendance", "lms", "learning management system", "moodle", "canvas"], expand: ["classroom management", "lms", "learning management system", "moodle", "attendance"] },
  { id: "parents", zh: ["家长", "亲子", "家庭教育", "在家学习", "自学"], en: ["parent", "parents", "homeschool", "homeschooling", "family", "kids at home"], expand: ["parent", "homeschool", "family", "kids", "children"] },
  { id: "kids", zh: ["儿童", "小学生", "孩子", "幼儿", "低龄", "小学", "幼儿园"], en: ["kids", "children", "child", "elementary", "primary school", "k-12", "k12", "preschool"], expand: ["kids", "children", "elementary", "k12", "primary school", "preschool"] },
  { id: "higher-ed", zh: ["大学", "高校", "研究生"], en: ["university", "college", "higher education", "graduate"], expand: ["university", "higher education", "college", "academic"] },
  { id: "gamification", zh: ["游戏化", "教育游戏", "闯关"], en: ["gamification", "gamified", "educational game", "serious game", "game-based"], expand: ["gamification", "game", "educational game", "serious game"] },
  { id: "accessibility", zh: ["无障碍", "特殊教育", "特教", "读写障碍", "自闭症", "视障", "听障", "融合教育"], en: ["accessibility", "accessible", "special education", "inclusive", "dyslexia", "autism", "adhd", "screen reader", "a11y", "udl", "blind", "deaf"], expand: ["accessibility", "a11y", "special education", "inclusive", "dyslexia", "autism", "screen reader", "assistive", "udl"] },

  // models, data, evaluation
  { id: "fine-tune", zh: ["微调", "训练模型", "模型训练", "lora", "sft"], en: ["fine-tune", "fine tune", "fine-tuning", "finetune", "finetuning", "lora", "qlora", "sft", "train a model", "training"], expand: ["fine tuning", "lora", "qlora", "sft", "peft", "unsloth", "fine tune"] },
  { id: "rlhf", zh: ["强化学习", "奖励模型", "偏好对齐"], en: ["rlhf", "reinforcement learning", "reward model", "dpo", "grpo", "alignment"], expand: ["reinforcement learning", "rlhf", "reward model", "dpo", "grpo", "alignment"] },
  { id: "model-eval", zh: ["模型评测", "评测", "评估模型", "测评框架"], en: ["evaluation", "evaluate", "eval", "evals", "model evaluation", "llm evaluation", "leaderboard"], expand: ["evaluation", "benchmark", "eval", "leaderboard", "metrics"] },
  { id: "benchmark", zh: ["基准", "基准测试", "benchmark", "测试集"], en: ["benchmark", "benchmarks", "leaderboard", "test set"], expand: ["benchmark", "evaluation", "leaderboard", "test set"] },
  { id: "dataset", zh: ["数据集", "语料", "语料库", "数据"], en: ["dataset", "datasets", "corpus", "corpora", "data set"], expand: ["dataset", "corpus", "data", "annotated"] },
  { id: "student-data", zh: ["学生作答", "作答数据", "答题记录", "学生数据"], en: ["student responses", "student data", "learner data", "response data", "clickstream"], expand: ["student", "response", "learner", "clickstream", "log data", "interaction data"] },
  { id: "multimodal", zh: ["多模态", "图像", "视觉"], en: ["multimodal", "vision", "image"], expand: ["multimodal", "vision", "image", "vqa"] },
  { id: "classification", zh: ["分类", "分类器"], en: ["classification", "classifier"], expand: ["classification", "classifier", "machine learning"] },
  { id: "ml", zh: ["机器学习", "深度学习", "神经网络"], en: ["machine learning", "deep learning", "neural network", "ml", "pytorch"], expand: ["machine learning", "deep learning", "neural network", "pytorch", "model"] },
  { id: "notebook", zh: ["笔记本", "jupyter", "colab"], en: ["jupyter", "notebook", "notebooks", "colab"], expand: ["jupyter", "notebook", "colab", "python"] },

  // Added 2026-10-29 after reviewing dev-split results (dev-informed; test split not read).
  { id: "sem", zh: ["结构方程", "结构方程模型", "因子分析", "验证性因子"], en: ["structural equation", "structural equation model", "structural equation modeling", "sem", "cfa", "factor analysis", "lavaan", "semopy"], expand: ["structural equation", "factor analysis", "lavaan", "semopy", "latent variable", "psychometrics"] },
  { id: "multilevel", zh: ["多层模型", "分层模型", "混合效应", "多层线性"], en: ["multilevel", "multi-level", "hierarchical model", "hierarchical linear", "mixed effects", "mixed-effects", "hlm", "lme4"], expand: ["multilevel", "hierarchical", "mixed effects", "lme4", "random effects"] },
  { id: "r-lang", zh: [], en: ["r package", "rstats", "tidyverse", "rstudio"], expand: ["r package", "rstats", "tidyverse", "rstudio"] },
  { id: "classroom-discourse", zh: ["课堂对话", "课堂话语", "师生对话", "课堂实录", "课堂录音"], en: ["classroom discourse", "teacher talk", "talk moves", "classroom dialogue", "classroom transcripts"], expand: ["classroom discourse", "teacher talk", "talk move", "dialogue", "transcript", "classroom"] },
  { id: "hint", zh: ["提示", "支架", "脚手架", "引导"], en: ["hint", "hints", "scaffold", "scaffolding"], expand: ["hint", "scaffolding", "feedback", "socratic"] },
  { id: "pedagogy", zh: ["教学法", "教学策略"], en: ["pedagogical", "pedagogically", "pedagogy", "instructional quality"], expand: ["pedagogical", "pedagogy", "instructional"] },
  { id: "readability", zh: ["文本难度", "难度分级", "可读性", "简化文本"], en: ["text difficulty", "readability", "leveled reading", "text simplification", "lexile", "cefr"], expand: ["readability", "text simplification", "difficulty", "leveled", "cefr", "graded reader"] },
  { id: "english", zh: ["英语", "英文"], en: ["english"], expand: ["english", "esl"] },
  { id: "asr", zh: ["语音识别", "语音转文字"], en: ["speech recognition", "speech-to-text", "speech to text", "asr", "whisper"], expand: ["speech recognition", "whisper", "asr", "speech to text"] },
  { id: "pron-score", zh: ["发音评分", "发音评测", "口语评分", "口语评测"], en: ["pronunciation assessment", "pronunciation scoring", "pronunciation feedback"], expand: ["pronunciation", "speech assessment", "speaking", "phoneme"] },
  { id: "mistakes", zh: ["错题", "错题本", "错题集", "错因"], en: ["mistake", "mistakes", "error analysis", "wrong answers", "misconception", "misconceptions"], expand: ["mistake", "error analysis", "misconception", "wrong answer", "review"] },
  { id: "worksheet", zh: ["练习题", "习题", "练习册", "口算", "计算题", "出题"], en: ["worksheet", "worksheets", "practice problems", "exercises", "problem generator", "mental math"], expand: ["worksheet", "exercise", "practice", "problem generator", "arithmetic"] },
  { id: "kinematics", zh: ["抛体", "运动学", "抛物线运动", "自由落体"], en: ["projectile", "kinematics", "projectile motion", "free fall"], expand: ["projectile", "kinematics", "motion", "physics", "simulation"] },
  { id: "interactive", zh: ["交互", "交互式", "演示", "拖动", "可调参数", "调参数"], en: ["interactive", "demo", "slider", "sliders", "adjustable parameters", "draggable"], expand: ["interactive", "demo", "slider", "simulation", "visualization"] },
  { id: "wasm", zh: ["浏览器里跑", "浏览器运行"], en: ["webassembly", "wasm", "pyodide", "in-browser", "jupyterlite"], expand: ["webassembly", "wasm", "pyodide", "jupyterlite", "browser"] },
  { id: "sandbox", zh: ["沙盒", "沙箱", "在线编程", "在线运行代码"], en: ["sandbox", "playground", "code runner", "repl"], expand: ["sandbox", "playground", "repl", "code runner", "online judge"] },

  // builder artifacts
  { id: "skill", zh: ["技能", "skill", "skills"], en: ["skill", "skills", "agent skill", "skill.md", "claude skill", "codex skill"], expand: ["skill", "agent skill", "claude", "codex"] },
  { id: "mcp", zh: ["mcp"], en: ["mcp", "model context protocol"], expand: ["mcp", "model context protocol", "server"] },
  { id: "awesome", zh: ["合集", "资源列表", "清单", "大全"], en: ["awesome", "awesome list", "curated list", "resource list"], expand: ["awesome", "curated list", "resources"] },
  { id: "chatbot", zh: ["聊天机器人", "对话", "问答机器人"], en: ["chatbot", "chat bot", "conversational", "chat"], expand: ["chatbot", "chat", "conversational", "assistant"] },
  { id: "app", zh: ["应用", "工具", "平台", "系统", "项目", "软件", "app"], en: ["app", "tool", "tools", "platform", "project", "software", "system", "application"], expand: [], generic: true },
  { id: "education", zh: ["教育", "学习", "学生", "教学资源"], en: ["education", "educational", "learning", "learn", "student", "students", "edtech", "ed tech"], expand: [], generic: true },
  { id: "ai", zh: ["人工智能", "ai"], en: ["ai", "artificial intelligence"], expand: [], generic: true },
];

// Constraints are checked against metadata and reported; they never become text-match terms.
export const CONSTRAINTS = [
  { id: "offline", zh: ["离线", "无网", "断网", "本地运行", "不联网", "本地部署", "本地", "不能上传云端", "不上传", "不能上传"], en: ["offline", "no internet", "local-first", "local first", "runs locally", "on-device", "on device"] },
  { id: "mobile", zh: ["手机", "移动端", "移动", "安卓", "苹果手机", "平板", "ipad"], en: ["mobile", "phone", "android", "ios", "iphone", "tablet", "ipad"] },
  { id: "browser", zh: ["浏览器", "网页", "网页版", "在线", "web", "不需要服务器", "无需服务器", "不要服务器", "无服务器"], en: ["browser", "web", "web app", "webapp", "in the browser", "website", "no server", "serverless", "without a server", "no backend"] },
  { id: "no-paid-api", zh: ["免费", "不付费", "无付费", "不用付费", "不用付费api", "开源模型", "不要api", "不依赖api", "不调用api", "本地大模型"], en: ["free", "no paid", "no api key", "without api", "no openai", "open source model", "open-source model", "local model", "self-hosted", "self hosted"] },
  { id: "commercial", zh: ["商用", "商业", "可商用", "商业使用"], en: ["commercial", "commercially", "permissive license", "mit license", "business use", "mit or apache license", "mit or apache", "apache license"] },
  { id: "chinese-ui", zh: ["中文", "中文界面", "汉语界面", "简体"], en: ["chinese ui", "chinese interface", "in chinese", "chinese language"] },
  { id: "open-source", zh: ["开源"], en: ["open source", "open-source", "oss"] },
];

export const KIND_HINTS = [
  { kind: "dataset", zh: ["数据集", "语料"], en: ["dataset", "datasets", "corpus", "data set"] },
  { kind: "benchmark", zh: ["基准", "benchmark", "测试集"], en: ["benchmark", "benchmarks", "leaderboard"] },
  { kind: "skill", zh: ["技能", "skill"], en: ["skill", "skills", "skill.md", "agent skill"] },
  { kind: "awesome_index", zh: ["合集", "资源列表", "大全"], en: ["awesome list", "awesome", "curated list"] },
];

export const STOP_EN = new Set("a an the and or of to for in on with without by from at as is are be can could should would will i we you my our me us it this that these those want need needs looking look find search help helps something some any which what how that who whose into about using use used make making build building create creating like via based support supports good best simple easy new please can't cannot not no do does whether rather than just gives give get gets getting only also than then there their them they its your yours one ones way ways something someone kind sort type types".split(" "));
export const STOP_ZH = ["我想", "我要", "我需要", "需要", "想要", "想找", "想给", "想用", "想做", "帮我", "帮忙", "找一个", "找个", "一个", "一些", "有没有", "什么", "怎么", "如何", "可以", "能够", "能直接", "直接", "用来", "用于", "适合", "做一个", "做个", "搭建", "开发", "实现", "支持", "相关", "类似", "最好", "现成", "已有", "推荐", "这个", "那个", "并且", "或者", "以及", "运行", "使用", "要能", "能在", "里", "的", "了", "吗", "呢", "吧", "和", "或", "给", "让", "把"];
