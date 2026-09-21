export type GitState = {
  working: number;
  staged: number;
  committed: number;
  remote: number;
};
export type GitAction =
  | "edit"
  | "add"
  | "commit"
  | "push"
  | "unstage"
  | "reset";
export const initialGitState: GitState = {
  working: 1,
  staged: 1,
  committed: 1,
  remote: 1,
};
export function gitStep(state: GitState, action: GitAction): GitState {
  if (action === "reset") return { ...initialGitState };
  if (action === "edit") return { ...state, working: state.working + 1 };
  if (action === "add") return { ...state, staged: state.working };
  if (action === "commit") return { ...state, committed: state.staged };
  if (action === "push") return { ...state, remote: state.committed };
  return { ...state, staged: state.committed };
}
export const figureKeys = [
  "git-flow",
  "github-flow",
  "scaffolding",
  "feedback",
  "web-layers",
  "responsive",
  "retrieval",
  "assistant-flow",
  "refactor",
  "form-validation",
] as const;
export type FigureKey = (typeof figureKeys)[number];
export function resolveFigure(
  course: string,
  lesson: { id: string; title: string; figureKey?: string },
): FigureKey {
  if (figureKeys.includes(lesson.figureKey as FigureKey))
    return lesson.figureKey as FigureKey;
  const text = `${lesson.id} ${lesson.title}`;
  if (course === "github-starter") return "github-flow";
  if (course === "refactor-with-ai") return "refactor";
  if (course === "personal-learning-assistant")
    return /retriev|提取|回忆|复习/.test(text) ? "retrieval" : "assistant-flow";
  if (course === "learning-sciences-starter")
    return /feedback|反馈/.test(text)
      ? "feedback"
      : /scaffold|支架|示例|认知/.test(text)
        ? "scaffolding"
        : "retrieval";
  if (/debug|test|调试|验收/.test(text)) return "refactor";
  return /responsive|layout|structure|promise|手机|布局|适配|首屏/.test(text)
    ? "responsive"
    : "web-layers";
}
