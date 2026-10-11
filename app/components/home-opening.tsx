import Link from "next/link";
import { getLocale } from "@/app/i18n/server";

/** Original seed-and-paper collage. Inline vectors keep the opening light. */
function SeedCollage() {
  return (
    <div className="seed-collage" aria-hidden="true">
      <svg viewBox="0 0 620 490" fill="none">
        <defs>
          <filter id="seed-grain"><feTurbulence type="fractalNoise" baseFrequency=".68" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".16"/></feComponentTransfer><feComposite in2="SourceGraphic" operator="in"/><feBlend in="SourceGraphic" mode="soft-light"/></filter>
          <linearGradient id="seed-fill" x1="170" y1="180" x2="410" y2="360" gradientUnits="userSpaceOnUse"><stop stopColor="#a8b792"/><stop offset="1" stopColor="#69876c"/></linearGradient>
        </defs>
        <ellipse cx="300" cy="410" rx="164" ry="15" fill="#625742" opacity=".08"/>
        <circle cx="317" cy="248" r="185" fill="#eae2d4" opacity=".5"/>
        <path className="seed-trail" d="M27 299C91 182 159 407 263 322S418 131 536 198S592 323 551 354" stroke="#8d8079" strokeWidth="1.5" strokeDasharray="3 7"/>
        <g className="seed-note note-idea" transform="rotate(-12 109 166)">
          <path d="M50 104h118v122H50z" fill="#e6d4be"/>
          <path d="M60 96h118v122H60z" fill="#fffaf0" stroke="#ded2bc"/>
          <path d="M107 131c-23 1-27 27-9 36v12h19v-12c19-11 13-37-10-36Zm-9 55h19m-10-66v-9m-29 22-8-5m59 5 8-5" stroke="#9d7755" strokeWidth="2" strokeLinecap="round"/>
        </g>
        <g className="seed-body" filter="url(#seed-grain)">
          <path d="M163 345c-35-24-39-65-11-92 17-17 33-19 49-19-14-65 22-117 71-116 44 1 74 43 71 90 29-13 62 1 73 28 15 38-7 70-34 85-12 46-50 79-102 76-56 5-102-13-117-52Z" fill="url(#seed-fill)"/>
          <path d="M346 285c28 9 48-9 60-30 10-18 33-4 26 15-16 46-57 65-94 48" fill="#789576"/>
          <ellipse cx="284" cy="241" rx="5" ry="10" fill="#34493a"/><ellipse cx="309" cy="238" rx="5" ry="10" fill="#34493a"/>
          <path d="M288 267q12 9 21-3" stroke="#34493a" strokeWidth="2" strokeLinecap="round"/>
          <path d="M255 127c-10-29-2-48 16-61 4 26 1 44-16 61Z" fill="#536e55"/>
          <path d="M258 124c12-24 31-30 53-27-10 21-29 30-53 27Z" fill="#91a782"/>
        </g>
        <g className="seed-note note-build" transform="rotate(9 469 211)">
          <path d="M418 148h123v118H418z" fill="#d4c8dd"/>
          <path d="M409 139h123v118H409z" fill="#eee6f2" stroke="#d4c8dd"/>
          <rect x="429" y="161" width="84" height="67" rx="4" stroke="#7d6a8f" strokeWidth="2"/>
          <path d="M429 177h84m-64 17-8 9 8 9m43-18 8 9-8 9m-22-23-7 28" stroke="#7d6a8f" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="438" cy="169" r="2" fill="#7d6a8f"/>
        </g>
        <g className="seed-note note-understand" transform="rotate(-7 476 361)">
          <path d="M429 316h99v94h-99z" fill="#eacaaf"/>
          <path d="M421 308h99v94h-99z" fill="#f5dec8" stroke="#daba9c"/>
          <path d="m446 351 15 15 32-34M443 383h55" stroke="#997355" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
        <path d="m365 114 7-17m5 26 15-8M113 360l-9 14m22-7-1 16" stroke="#7d6a64" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="78" cy="289" r="13" fill="#d8c9e3"/><circle cx="547" cy="111" r="8" fill="#d7ad87"/>
        <path d="M90 395q12-37 38-29-17 29-38 29Zm0 0 10-22" fill="#c1cbae" stroke="#8d9e79"/>
      </svg>
    </div>
  );
}

export default async function HomeOpening({ courseCount }: { courseCount: number }) {
  const en = (await getLocale()) === "en";
  const paths = en ? [
    ["01", "Explore open source", "See what others have already built.", "/directory"],
    ["02", "Make your own", `${courseCount} free courses. Start small.`, "/learn"],
    ["03", "Find the why", "Explore learning sciences and design.", "/atlas"],
  ] : [
    ["01", "逛开源目录", "看看别人已经做好了什么。", "/directory"],
    ["02", "亲手做一个", `${courseCount} 门免费课，从小作品开始。`, "/learn"],
    ["03", "找到设计依据", "把学习科学，放进你的设计。", "/atlas"],
  ];
  return <>
    <section className="seed-opening" aria-labelledby="vision-title">
      <div className="seed-copy">
        <p className="seed-eyebrow">EDU AI BUILDERS <span>✳</span> {en ? "A little room for an idea" : "给想法一点生长的空间"}</p>
        <h1 id="vision-title">{en ? <>Small ideas.<br/><span>Real learning.</span></> : <>小小的点子，<br/><span>让学习发生。</span></>}</h1>
        <p className="seed-lead">{en ? "Use AI to make something learners can see, try, and understand." : "和 AI 一起，把教学想法做成能看、能练的学习工具。"}</p>
        <div className="seed-actions">
          <Link className="ea-button primary" href="/directory">{en ? "Explore open source" : "逛开源目录"} <span aria-hidden="true">↓</span></Link>
          <Link href="#open-source">{en ? "Try a ready-made project" : "先试一个现成的"} <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
      <SeedCollage/>
      <div className="seed-caption"><span>01 {en ? "Wonder" : "发现"}</span><i aria-hidden="true">⌁</i><span>02 {en ? "Make" : "动手"}</span><i aria-hidden="true">⌁</i><span>03 {en ? "Understand" : "理解"}</span></div>
    </section>
    <nav className="seed-paths" aria-label={en ? "Choose a starting point" : "选择一个起点"}>
      {paths.map(([number, title, note, href]) => <Link href={href} key={number}><span>{number}</span><div><h2>{title}</h2><p>{note}</p></div><b aria-hidden="true">↗</b></Link>)}
    </nav>
  </>;
}
