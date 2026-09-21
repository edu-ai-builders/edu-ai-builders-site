export type Resource = {
  id: string;
  title: string;
  description: string;
  kind: "tool" | "component" | "skill" | "example";
  href: string;
  conceptIds: string[];
  relationshipNote: string;
  availabilityLabel: string;
  sourceHref: string;
  sourceLabel: string;
  artifactPath?: string;
  tryThis?: string;
  check?: string;
};

// Editorial associations explain a design connection, not verified learning impact.
// Stable concept IDs refer to the original rack; no research records are duplicated here.
export const resources: Resource[] = [
  {
    id: "fraction-bars",
    title: "分数条比较器",
    kind: "tool",
    href: "/use/fraction-bars",
    description: "改变分子和分母，同时观察等长整体中的图形、符号与比较结果。",
    conceptIds: [
      "pedagogy:math-systematic-representations",
      "pedagogy:multimedia-coherence",
    ],
    relationshipNote:
      "等长分数条和分数符号同步变化，展示数学表征如何对应；交互完成并不代表已经理解。",
    availabilityLabel: "浏览器直接打开",
    artifactPath: "/tools/fraction-bars.html",
    sourceHref: "https://github.com/edu-ai-builders/math-viz-kit",
    sourceLabel: "Math Viz Kit",
    tryThis:
      "先预测 1/2 和 2/4 是否相等，再调整滑杆。保持整体相同，试着解释为什么。",
    check:
      "换成 2/3 和 3/5，不看图先作判断。检查解释是否同时考虑分子、分母和相同的整体。",
  },
  {
    id: "area-tiles",
    title: "面积铺砖模型",
    kind: "tool",
    href: "/use/area-tiles",
    description: "用单位方格铺满矩形，观察行、列与总格数怎样对应。",
    conceptIds: ["pedagogy:math-systematic-representations"],
    relationshipNote:
      "用单位方格计数连接矩形面积与乘法表达；观看动画后还需要独立解释和新题检查。",
    availabilityLabel: "浏览器直接打开",
    artifactPath: "/tools/area-tiles.html",
    sourceHref: "https://github.com/edu-ai-builders/math-viz-kit",
    sourceLabel: "Math Viz Kit",
    tryThis:
      "先预测 5 列、4 行有多少块单位方格，再开始铺砖。改变行列数，解释你的预测。",
    check:
      "不播放动画，画一个面积同为 12 平方单位、形状不同的矩形。说明每行格数、行数和总数的关系。",
  },
  {
    id: "angle-measure",
    title: "角度测量器",
    kind: "tool",
    href: "/use/angle-measure",
    description:
      "旋转角的一条边，让开口、刻度与角度数值同步变化。支持拖动与键盘滑杆。",
    conceptIds: ["pedagogy:math-systematic-representations"],
    relationshipNote:
      "把角的旋转量连接到量角器刻度和数值；学生仍需要解释开口大小与边长的区别。",
    availabilityLabel: "浏览器直接打开",
    artifactPath: "/tools/angle-measure.html",
    sourceHref: "https://github.com/edu-ai-builders/math-viz-kit",
    sourceLabel: "Math Viz Kit · 核验修订副本",
    tryThis:
      "先预测 30°、90°、120° 的开口大小，再移动滑杆。试着描述从锐角变成直角的变化。",
    check: "画两组边长不同但同为 60° 的角，解释为什么角度没有因为边长而改变。",
  },
  {
    id: "number-line",
    title: "数轴跳跃加减法",
    kind: "tool",
    href: "/use/number-line",
    description:
      "把加减法变成数轴上的位置变化。设定起点和步数，先预测，再看跳跃。",
    conceptIds: ["pedagogy:math-systematic-representations"],
    relationshipNote:
      "用方向与单位距离连接加减运算和位置变化，动画后的等式帮助核对；仍需尝试新的起点。",
    availabilityLabel: "浏览器直接打开",
    artifactPath: "/tools/number-line.html",
    sourceHref: "https://github.com/edu-ai-builders/math-viz-kit",
    sourceLabel: "Math Viz Kit · 核验修订副本",
    tryThis: "从 5 出发减去 3，你预测会停在哪里？改变运算符，比较跳跃方向。",
    check: "从 2 出发减去 5，先画出路径，再解释为什么会经过零。",
  },
  {
    id: "linear-function",
    title: "一次函数滑杆实验室",
    kind: "tool",
    href: "/use/linear-function",
    description:
      "改变斜率与截距，同时观察函数图像、方程和数值表；再尝试匹配目标直线。",
    conceptIds: [
      "pedagogy:math-systematic-representations",
      "pedagogy:self-explanation",
    ],
    relationshipNote:
      "方程、图像与数值表同步呈现参数的作用；匹配挑战可用来追问参数的作用，而不只拖到相似。",
    availabilityLabel: "浏览器直接打开",
    artifactPath: "/tools/linear-function.html",
    sourceHref: "https://github.com/edu-ai-builders/math-viz-kit",
    sourceLabel: "Math Viz Kit · 核验修订副本",
    tryThis:
      "固定 b，只改变 k。预测 x 每增加 1 时，y 会改变多少，再用数值表核对。",
    check: "解释 k=0 时图像是什么。进一步比较 b=0 和 b≠0 两种情况下的零点。",
  },
  {
    id: "say-the-relation",
    title: "说出这条关系",
    kind: "example",
    href: "/use/say-the-relation",
    description:
      "从城市树木的阅读材料中连接两句话，区分因果、让步与先后，再用英语表达。",
    conceptIds: ["pedagogy:self-explanation", "pedagogy:actionable-feedback"],
    relationshipNote:
      "不仅连接卡片，还要求选择关系和表达，并说明不合适的词为什么不合适。这里展示设计关联，不宣称学习效果已验证。",
    availabilityLabel: "浏览器直接打开",
    artifactPath: "/tools/say-the-relation.html",
    sourceHref: "/tools/say-the-relation.html",
    sourceLabel: "Language Learning Asset Library · 本地案例副本",
    tryThis:
      "先读原材料，再选择两张卡片。判断关系后选择连接表达，特别留意“先后”不等于“因果”。",
    check: "换一对句子解释自己的选择；能否指出一对根本不应该建立关系的句子？",
  },
  {
    id: "relation-template",
    title: "关系表达组件",
    kind: "component",
    href: "/tools/relation-template.html",
    description:
      "复用“选择关系 → 选择表达 → 形成句子”的交互骨架，替换为适合学习者的材料。",
    conceptIds: ["pedagogy:self-explanation", "pedagogy:actionable-feedback"],
    relationshipNote:
      "组件保留了学习者的判断和表达动作；更换材料时仍需检查关系、干扰项和反馈理由。",
    availabilityLabel: "含示例数据的可修改 HTML",
    sourceHref: "/tools/relation-component-guide.md",
    sourceLabel: "组件使用说明",
  },
  {
    id: "grounding-engine",
    title: "教学设计依据 Skill",
    kind: "skill",
    href: "https://github.com/edu-ai-builders/pedagogical-grounding-engine",
    description: "从研究与场景出发，为教学设计保留依据、约束和取舍。",
    conceptIds: [
      "pedagogy:contingent-scaffolding",
      "pedagogy:cognitive-load-design",
    ],
    relationshipNote:
      "可用来审视支架与认知负荷等设计考虑。需要提供对应研究和情境，不代表每次输出都正确实现这些原则。",
    availabilityLabel: "GitHub 上的 Skill",
    sourceHref:
      "https://github.com/edu-ai-builders/pedagogical-grounding-engine",
    sourceLabel: "源仓库与使用说明",
  },
  {
    id: "math-viz-skill",
    title: "数学可视化 Skill",
    kind: "skill",
    href: "https://github.com/edu-ai-builders/math-viz-kit",
    description: "先判断一个关系是否值得可视化，再组织交互说明与 HTML 实现。",
    conceptIds: [
      "pedagogy:math-systematic-representations",
      "pedagogy:cognitive-load-design",
    ],
    relationshipNote:
      "从明确的认知动作出发组织表征，是可检查的设计方向；仍需核验数学正确性和实际使用表现。",
    availabilityLabel: "GitHub 上的工具与 Skill",
    sourceHref: "https://github.com/edu-ai-builders/math-viz-kit",
    sourceLabel: "源仓库与使用说明",
  },
  {
    id: "cognition-slides",
    title: "可视化教学课件 Skill",
    kind: "skill",
    href: "https://github.com/edu-ai-builders/visual-cognition-slides",
    description:
      "围绕比较、解释与理解任务组织 HTML 课件，而不只安排装饰和动画。",
    conceptIds: [
      "pedagogy:multimedia-coherence",
      "pedagogy:cognitive-load-design",
    ],
    relationshipNote:
      "用来检查文字、图形与讲解顺序是否服务同一任务。课件生成后仍要实际打开复核。",
    availabilityLabel: "GitHub 上的 Skill",
    sourceHref: "https://github.com/edu-ai-builders/visual-cognition-slides",
    sourceLabel: "源仓库与使用说明",
  },
];

export const resourcesForConcept = (conceptId: string) =>
  resources.filter((r) => r.conceptIds.includes(conceptId));
export const resourceKindNames = {
  tool: "工具",
  example: "示例",
  component: "组件",
  skill: "Skill",
};
