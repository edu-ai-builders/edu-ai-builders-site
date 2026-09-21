"use client";
import Localize from "@/app/i18n/localize";
/** A course is a route across the atlas: one stop per lesson. */
export default function CourseRoute({ lessons }: { lessons: { title: string; minutes: number }[] }) {
  const n = lessons.length;
  const left = 26, right = 274;
  const step = n > 1 ? (right - left) / (n - 1) : 0;
  const xs = lessons.map((_, i) => (n > 1 ? left + i * step : (left + right) / 2));
  return <Localize>{(
    <svg className="course-route" viewBox="0 0 300 52" role="img" aria-label={`${n} 节，依次为 ${lessons.map(l => `${l.title}（${l.minutes} 分钟）`).join("、")}`}>
      <line x1={xs[0]} y1="18" x2={xs[n - 1]} y2="18" stroke="#d9d2ee" strokeWidth="2" />
      {lessons.map((lesson, i) => (
        <g key={lesson.title}>
          <circle cx={xs[i]} cy="18" r="9" fill={i === 0 ? "#6f5fba" : "#fff"} stroke="#6f5fba" strokeWidth="2" />
          <text x={xs[i]} y="22" textAnchor="middle" fontSize="10" fontWeight="650" fill={i === 0 ? "#fff" : "#6f5fba"}>{i + 1}</text>
          <text x={xs[i]} y="44" textAnchor="middle" fontSize="10" fill="#857d95">{lesson.minutes} 分钟</text>
        </g>
      ))}
    </svg>
  )}</Localize>;
}
