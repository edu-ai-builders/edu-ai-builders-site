"use client";
import Localize from "@/app/i18n/localize";
/** Small authored diagrams show the interaction pattern, not screenshots or evidence of learning gains. */
export default function ResourcePreview({ id }: { id: string }) {
  const fractions = id === "fraction-bars";
  const tiles = id === "area-tiles";
  const relations = id === "say-the-relation" || id === "relation-template";
  const numberline = id === "number-line";
  const angle = id === "angle-measure";
  const functionPlot = id === "linear-function";
  const title = fractions
    ? "同样的整体，两种分法"
    : tiles
      ? "一行 5 格，共 4 行"
      : relations
        ? "材料 → 判断 → 表达"
        : numberline
          ? "从起点，跳到结果"
          : angle
            ? "转动一条边，观察角度"
            : functionPlot
              ? "改变参数，观察图像"
              : id === "grounding-engine"
                ? "教学目标 → 依据 → 设计"
                : id === "math-viz-skill"
                  ? "一个关系，多种表征"
                  : "信息 → 图形 → 讲解";
  return <Localize>{(
    <div className={`resource-preview preview-${id}`}>
      <svg
        viewBox="0 0 420 238"
        role="img"
        aria-label={`${title}；资源交互示意图`}
      >
        <rect
          width="420"
          height="238"
          fill={relations ? "#f0edf9" : tiles ? "#eaf4ef" : "#f0f2fb"}
        />
        <g fill="none" stroke="#bfb5d3" opacity=".22">
          {[60, 120, 180, 240, 300, 360].map((x) => (
            <line x1={x} x2={x} y1="0" y2="238" key={x} />
          ))}
          {[40, 80, 120, 160, 200].map((y) => (
            <line x1="0" x2="420" y1={y} y2={y} key={y} />
          ))}
        </g>
        <rect
          x="34"
          y="26"
          width="352"
          height="182"
          rx="14"
          fill="white"
          stroke="#e1daeb"
        />
        <text x="55" y="53" fill="#857494" fontSize="11">
          {title}
        </text>
        {fractions ? (
          <g>
            <text x="59" y="99" fill="#786390" fontSize="17">
              1/2
            </text>
            <rect
              x="115"
              y="77"
              width="235"
              height="33"
              rx="5"
              fill="#f0eafa"
            />
            <rect
              x="115"
              y="77"
              width="117.5"
              height="33"
              rx="5"
              fill="#a18cdd"
            />
            <line
              x1="232.5"
              x2="232.5"
              y1="77"
              y2="110"
              stroke="white"
              strokeWidth="2"
            />
            <text x="59" y="145" fill="#628979" fontSize="17">
              2/4
            </text>
            <rect
              x="115"
              y="123"
              width="235"
              height="33"
              rx="5"
              fill="#e6f3ed"
            />
            <rect
              x="115"
              y="123"
              width="117.5"
              height="33"
              rx="5"
              fill="#72bca1"
            />
            {[1, 2, 3].map((n) => (
              <line
                key={n}
                x1={115 + n * 58.75}
                x2={115 + n * 58.75}
                y1="123"
                y2="156"
                stroke="white"
                strokeWidth="2"
              />
            ))}
            <text
              x="208"
              y="185"
              textAnchor="middle"
              fill="#9a8ea6"
              fontSize="10"
            >
              改变分子 · 同步比较
            </text>
          </g>
        ) : tiles ? (
          <g>
            {Array.from({ length: 20 }, (_, i) => (
              <rect
                key={i}
                x={64 + (i % 5) * 31}
                y={76 + Math.floor(i / 5) * 25}
                width="27"
                height="21"
                rx="3"
                fill={i < 10 ? "#79bca0" : "#d8ede2"}
              />
            ))}
            <text x="258" y="117" fontSize="22" fill="#528d73">
              5 × 4
            </text>
            <text x="258" y="148" fontSize="14" fill="#86a493">
              = 20 格
            </text>
            <path d="M65 184H215" stroke="#9ebaaa" />
            <text
              x="137"
              y="198"
              textAnchor="middle"
              fontSize="9"
              fill="#87a493"
            >
              每一个小格，都是一个面积单位
            </text>
          </g>
        ) : relations ? (
          <g>
            <rect
              x="59"
              y="73"
              width="125"
              height="52"
              rx="7"
              fill="#f1ebfa"
              stroke="#d9cbed"
            />
            <text
              x="121"
              y="103"
              textAnchor="middle"
              fontSize="13"
              fill="#9474b4"
            >
              观察到的现象
            </text>
            <rect
              x="236"
              y="73"
              width="125"
              height="52"
              rx="7"
              fill="#e9f3f2"
              stroke="#c8e2db"
            />
            <text
              x="298"
              y="103"
              textAnchor="middle"
              fontSize="13"
              fill="#689e93"
            >
              可能的解释
            </text>
            <path d="M187 99H230m-7-5 7 5-7 5" fill="none" stroke="#af98c9" />
            <rect
              x="104"
              y="147"
              width="213"
              height="34"
              rx="17"
              fill="#e7ddf5"
            />
            <text
              x="210"
              y="169"
              textAnchor="middle"
              fontSize="12"
              fill="#8b69ac"
            >
              选择关系，再说出你的理由
            </text>
          </g>
        ) : numberline ? (
          <g>
            <path d="M70 148H350m-7-5 7 5-7 5" stroke="#a795c2" fill="none" />
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <g key={n}>
                <path d={`M${83 + n * 31} 144v8`} stroke="#b9a7cd" />
                <text
                  x={83 + n * 31}
                  y="171"
                  fontSize="11"
                  textAnchor="middle"
                  fill="#a58cb7"
                >
                  {n}
                </text>
              </g>
            ))}
            {[0, 1, 2].map((n) => (
              <path
                key={n}
                d={`M${114 + n * 62} 142q31-78 62 0`}
                fill="none"
                stroke="#9872c6"
                strokeWidth="2"
              />
            ))}
            <text
              x="209"
              y="86"
              textAnchor="middle"
              fill="#8e70b0"
              fontSize="15"
            >
              1 + 2 + 2 + 2 = 7
            </text>
          </g>
        ) : angle ? (
          <g>
            <path
              d="M109 168H321M109 168l134-92"
              stroke="#8c6dc0"
              strokeWidth="3"
            />
            <path
              d="M174 168a65 65 0 0 0-11-37"
              stroke="#70ad98"
              strokeWidth="2"
              fill="none"
            />
            <circle cx="109" cy="168" r="5" fill="#8c6dc0" />
            <text x="184" y="150" fill="#6ea18e" fontSize="20">
              35°
            </text>
            <text x="282" y="92" fill="#a090b0" fontSize="10">
              拖动 / 测量
            </text>
          </g>
        ) : functionPlot ? (
          <g>
            <path d="M80 165H335M175 72V187" stroke="#c2b1d6" />
            <path d="M103 179L297 80" stroke="#9474c6" strokeWidth="3" />
            <path
              d="M103 150L297 112"
              stroke="#98c4b4"
              strokeWidth="2"
              strokeDasharray="5 5"
            />
            <text x="262" y="177" fill="#9b81b2" fontSize="13">
              y = kx + b
            </text>
            <circle cx="175" cy="142" r="5" fill="#9474c6" />
          </g>
        ) : (
          <g>
            {[
              {
                x: 58,
                label: id === "math-viz-skill" ? "符号" : "目标",
                color: "#e5ddf2",
              },
              {
                x: 163,
                label: id === "math-viz-skill" ? "图形" : "依据",
                color: "#daece5",
              },
              {
                x: 268,
                label: id === "math-viz-skill" ? "动作" : "设计",
                color: "#f4e9d4",
              },
            ].map((n, i) => (
              <g key={n.x}>
                <rect
                  x={n.x}
                  y="88"
                  width="91"
                  height="61"
                  rx="9"
                  fill={n.color}
                />
                <text
                  x={n.x + 45.5}
                  y="124"
                  fill="#887098"
                  fontSize="14"
                  textAnchor="middle"
                >
                  {n.label}
                </text>
                {i < 2 && <path d={`M${n.x + 95} 119h6`} stroke="#b8a4c7" />}
              </g>
            ))}
            <text
              x="210"
              y="182"
              fontSize="10"
              fill="#a290b0"
              textAnchor="middle"
            >
              在 AI 工具中使用 · 输出后自行核验
            </text>
          </g>
        )}
      </svg>
      <span className="resource-preview-note">交互示意</span>
    </div>
  )}</Localize>;
}
