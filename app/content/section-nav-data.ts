import { courses } from "./courses";
import { resources } from "./resources";
import type { NavGroup } from "../components/section-nav";

const elsewhere = (skip: "learn" | "use" | "build"): NavGroup => ({
  title: "其他板块",
  items: [
    { href: "/learn", label: "学习", meta: `${courses.length} 条路线` },
    { href: "/use", label: "使用", meta: `${resources.filter(r => r.artifactPath).length} 个工具` },
    { href: "/build", label: "构建", meta: `${resources.filter(r => !r.artifactPath).length} 项材料` },
    { href: "/atlas", label: "地图 Atlas", meta: "180 个概念" },
    { href: "/directory", label: "开源资源", meta: "外部项目" },
  ].filter(item => item.href !== `/${skip}`),
});

export const learnNav: NavGroup[] = [
  {
    title: "全部课程",
    items: courses.map(course => ({
      href: `/learn/${course.slug}`,
      label: course.title,
      meta: `${course.lessons.length} 节 · ${course.lessons.reduce((sum, l) => sum + l.minutes, 0)} 分钟`,
    })),
  },
  elsewhere("learn"),
];

export const useNav: NavGroup[] = [
  {
    title: "可直接打开",
    items: resources.filter(r => r.artifactPath).map(r => ({ href: r.href, label: r.title, meta: r.availabilityLabel })),
  },
  elsewhere("use"),
];

export const buildNav: NavGroup[] = [
  {
    title: "组件与 Skill",
    items: resources.filter(r => !r.artifactPath).map(r => ({ href: r.href, label: r.title, meta: r.availabilityLabel })),
  },
  elsewhere("build"),
];
