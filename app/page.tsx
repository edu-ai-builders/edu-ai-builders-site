"use client";

import { type CSSProperties, useState } from "react";

const GITHUB = "https://github.com/edu-ai-builders";
const GALLERY = `${GITHUB}/eduos-teaching-design-gallery`;
const PEDAGOGY_LENS = "https://pedagogy-lens-audit.applicationconsultan.chatgpt.site";

type ComponentKey = "CALLERS" | "LOOM" | "SKILLS" | "GALLERY" | "LENS";

const components: Record<ComponentKey, {
  verb: string;
  name: string;
  kind: string;
  summary: string;
  relation: string;
  items: string[];
  color: string;
  glyph: string;
  href?: string;
}> = {
  CALLERS: {
    verb: "CALL",
    name: "Agents + Code",
    kind: "REQUESTERS",
    summary: "A harness, coding agent, or application calls EduOS with one educational task and the context needed to do it well.",
    relation: "sends task + learner / teacher context",
    items: ["DeepSeek Harness", "Codex", "Claude Code", "Application code"],
    color: "cyan",
    glyph: "↗",
  },
  LOOM: {
    verb: "FEED",
    name: "Loom",
    kind: "KNOWLEDGE PIPELINE",
    summary: "Loom converts open-world knowledge into structured pedagogical insight, reusable skills, and assets that EduOS can load.",
    relation: "open world → runtime-ready knowledge",
    items: ["New research", "GitHub projects", "Open skills", "Domain knowledge"],
    color: "violet",
    glyph: "⌁",
  },
  SKILLS: {
    verb: "LOAD",
    name: "Skills",
    kind: "EXECUTABLE CAPABILITIES",
    summary: "Skills are focused capabilities EduOS loads when a task needs them. They are separate from the runtime and independently reusable.",
    relation: "capabilities loaded for a particular task",
    items: ["Pedagogical grounding", "Visual recognition", "Paper sensemaking", "Domain skills"],
    color: "mint",
    glyph: "✦",
  },
  GALLERY: {
    verb: "MOUNT",
    name: "Asset Gallery",
    kind: "SCAFFOLDING + DESIGN",
    summary: "A growing pedagogical asset gallery: scaffolds, UI patterns, workflows, worked examples, and adaptable learning materials.",
    relation: "assets mounted by EduOS or adapted by builders",
    items: ["Scaffolding", "UI / UX", "Worked examples", "Learning workflows"],
    color: "amber",
    glyph: "◇",
  },
  LENS: {
    verb: "OBSERVE",
    name: "Evaluator + Lens",
    kind: "SEPARATE QUALITY SYSTEM",
    summary: "A separate evaluator inspects what you build through a pedagogy lens. It observes outputs and development workflows; it is not bundled into EduOS.",
    relation: "evaluates the product built around the runtime",
    items: ["Pedagogy Lens", "Edu Evaluator", "Rubrics", "Learner simulation"],
    color: "rose",
    glyph: "◎",
    href: PEDAGOGY_LENS,
  },
};

const skillProjects = [
  { name: "Pedagogical Grounding Agent", type: "CORE SKILL", text: "Turn education research into traceable decisions an AI system can execute.", href: `${GITHUB}/pedagogical-grounding-engine` },
  { name: "Visual Recognition Skills", type: "PERCEPTION", text: "Interpret visual learning material and route it into pedagogical workflows.", href: GITHUB },
  { name: "Paper Sensemaking", type: "RESEARCH SKILL", text: "Read research through the friction between a paper and an existing mental model.", href: `${GITHUB}/paper-sense-making` },
];

const assetProjects = [
  { name: "Scaffolding Asset Gallery", type: "PEDAGOGICAL GALLERY", text: "Reusable scaffolds, teaching-design patterns, workflows, and worked examples.", href: GALLERY },
  { name: "Math Visualization Assets", type: "VISUAL ASSETS", text: "Interactive building blocks for making abstract mathematical ideas visible.", href: `${GITHUB}/math-viz-kit` },
  { name: "Learning SOP Assets", type: "WORKFLOW ASSETS", text: "Adaptable operating procedures for language and domain learning experiences.", href: `${GITHUB}/language-learning-sop-kit` },
];

const outputs = ["AI tutor", "Learning app", "Education agent", "Teacher copilot", "Curriculum tool", "Something new"];

function Brand() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <i /><i /><i /><b>e</b>
    </span>
  );
}

export default function Home() {
  const [activeComponent, setActiveComponent] = useState<ComponentKey>("SKILLS");
  const active = components[activeComponent];

  return (
    <main>
      <a className="skip-link" href="#content">Skip to content</a>

      <div className="topline">
        <span>EDU AI BUILDERS</span>
        <span><i /> OPEN INFRASTRUCTURE / BUILDING IN PUBLIC</span>
        <span>INFERENCE RUNTIME / EXPANDING</span>
      </div>

      <header className="nav-shell">
        <a className="brand" href="#top" aria-label="Edu AI Builders home"><Brand /><span>Edu AI Builders</span></a>
        <nav aria-label="Main navigation">
          <a href="#system">System</a>
          <a href="#runtime">EduOS</a>
          <a href="#gallery">Assets</a>
          <a href="/directory">Directory</a>
          <a href="#build">Build</a>
        </nav>
        <a className="nav-github" href={GITHUB} target="_blank" rel="noreferrer">GitHub <span>↗</span></a>
      </header>

      <div id="content">
        <section className="hero" id="top">
          <div className="aurora aurora-one" />
          <div className="aurora aurora-two" />
          <div className="hero-grid" aria-hidden="true" />

          <div className="hero-copy">
            <p className="micro">{"// OPEN-SOURCE INFRASTRUCTURE FOR EDUCATION"}</p>
            <h1>Give AI a way<br />to <span>teach.</span></h1>
            <p className="hero-definition"><strong>Edu AI Builders is an infrastructure layer for anything you want to build around education.</strong> At its center, EduOS is a callable pedagogical runtime: give it a particular task plus learner and teacher context, and it loads the relevant capabilities to execute that task pedagogically.</p>
            <div className="hero-actions">
              <a className="action dark" href="#runtime">See the runtime <span>↓</span></a>
              <a className="action glass" href={GITHUB} target="_blank" rel="noreferrer">Explore GitHub <span>↗</span></a>
            </div>
          </div>

          <div className="runtime-console" aria-label="EduOS callable runtime overview">
            <div className="console-top">
              <span><b className="status-light" /> EDUOS / TASK RUNTIME</span>
              <span>CALLABLE</span>
            </div>

            <div className="console-stage">
              <div className="caller-deck" aria-label="Systems that can call EduOS">
                {[
                  ["HARNESS", "DeepSeek / custom"],
                  ["CODING AGENT", "Codex / Claude Code"],
                  ["APP CODE", "any learning product"],
                ].map(([name, note], index) => (
                  <div className="caller-card" key={name} style={{ "--card-i": index } as CSSProperties}>
                    <span>{name}</span><small>{note}</small>
                  </div>
                ))}
              </div>

              <div className="console-connector"><i /><span>CALL: TASK + LEARNER / TEACHER CONTEXT</span><i /></div>

              <div className="kernel-card">
                <div className="kernel-glow" />
                <div className="kernel-head"><span>EDUOS</span><span>WORKBENCH ONLINE</span></div>
                <div className="kernel-logo"><Brand /></div>
                <strong>Pedagogical task runtime</strong>
                <p>plan → load capabilities → execute</p>
                <div className="kernel-services"><span>REQUEST API</span><span>WORKBENCH</span><span>SKILL LOADER</span><span>MODEL ADAPTERS</span></div>
              </div>

              <div className="model-rail"><span>OPEN-SOURCE MODELS</span><span>LOCAL MODELS</span><span>HOSTED MODELS</span></div>
            </div>

            <div className="console-bottom"><span>LOOM FEEDS</span><span>SKILLS LOAD</span><span>GALLERY MOUNTS</span></div>
          </div>
        </section>

        <section className="thesis-strip" aria-label="System thesis">
          <span>ANY AGENT OR PRODUCT</span><i>→</i><span className="highlight">CALL EDUOS FOR A PEDAGOGICAL TASK</span><i>→</i><span>BUILD ANY LEARNING EXPERIENCE</span>
        </section>

        <section className="system-section" id="system">
          <div className="section-label"><span>{"// 01 — THE SYSTEM AROUND EDUOS"}</span><span>NOT A SEQUENCE / A COMPOSABLE SYSTEM</span></div>
          <div className="system-heading">
            <h2>EduOS is the center.<br /><span>Everything has a distinct role.</span></h2>
            <p>Agents and applications call the runtime. Loom turns outside knowledge into usable material. Skills execute capabilities. The Gallery supplies pedagogical assets. The Evaluator stays separate and examines what you build.</p>
          </div>

          <div className="component-deck" aria-label="Components surrounding EduOS">
            {(Object.keys(components) as ComponentKey[]).map((key, index) => {
              const component = components[key];
              const selected = key === activeComponent;
              return (
                <button
                  key={key}
                  className={`component-card ${component.color} ${selected ? "active" : ""}`}
                  aria-pressed={selected}
                  style={{ "--slot": index } as CSSProperties}
                  onClick={() => setActiveComponent(key)}
                  onFocus={() => setActiveComponent(key)}
                  onMouseEnter={() => setActiveComponent(key)}
                >
                  <span className="component-glyph">{component.glyph}</span>
                  <span className="component-verb">{component.verb}</span>
                  <strong>{component.name}</strong>
                  <small>{component.kind}</small>
                  <span className="component-summary">{component.summary}</span>
                  <span className="component-open">{selected ? "SELECTED" : "VIEW ROLE"} <i>↗</i></span>
                </button>
              );
            })}
          </div>

          <div className={`component-inspector ${active.color}`} aria-live="polite">
            <div className="inspector-role"><span>{active.verb}</span><strong>{active.name}</strong><small>{active.kind}</small></div>
            <p>{active.relation}</p>
            <div className="inspector-items">{active.items.map((item) => <span key={item}>{item}</span>)}</div>
            {active.href ? <a className="inspector-link" href={active.href} target="_blank" rel="noreferrer">OPEN PEDAGOGYLENS <span>↗</span></a> : null}
          </div>
        </section>

        <section className="runtime-section" id="runtime">
          <div className="section-label light"><span>{"// 02 — WHAT EDUOS ACTUALLY DOES"}</span><span>CALL → LOAD → EXECUTE</span></div>
          <div className="runtime-heading">
            <p className="micro">A PARTICULAR TASK, EXECUTED PEDAGOGICALLY</p>
            <h2>The agent asks.<br /><span>EduOS does the education work.</span></h2>
            <p>An agent does not “become” EduOS. It calls EduOS as a runtime service—passing the task, learner state, teacher intent, and available constraints.</p>
          </div>

          <div className="runtime-map" aria-label="Detailed EduOS system relationship">
            <div className="map-callers map-panel">
              <div className="map-kicker"><span>WHO CALLS</span><span>REQUEST SIDE</span></div>
              <h3>Harnesses, agents, and code</h3>
              <div className="caller-list"><span>DeepSeek Harness</span><span>Codex</span><span>Claude Code</span><span>Local agent</span><span>Application code</span></div>
              <div className="payload-card"><small>REQUEST PAYLOAD</small><strong>“Help this learner understand…”</strong><span>task · learner · teacher · constraints</span></div>
            </div>

            <div className="map-arrow request-arrow"><span>SEND REQUEST</span><i>→</i></div>

            <div className="map-eduos map-panel">
              <div className="runtime-orbit" aria-hidden="true"><i /><i /><i /></div>
              <div className="map-kicker"><span>CALLABLE CORE</span><span>INFERENCE RUNTIME</span></div>
              <div className="eduos-title"><Brand /><div><h3>EduOS</h3><p>Pedagogical Task Runtime</p></div></div>
              <div className="workbench">
                <span><b>01</b> interpret the educational task</span>
                <span><b>02</b> plan pedagogically</span>
                <span><b>03</b> load relevant skills + assets</span>
                <span><b>04</b> execute through the chosen model</span>
              </div>
              <div className="model-adapters"><small>MODEL ADAPTERS</small><span>OPEN</span><span>LOCAL</span><span>HOSTED</span></div>
            </div>

            <div className="map-arrow output-arrow"><span>RETURN / EMBED</span><i>→</i></div>

            <div className="map-output map-panel">
              <div className="map-kicker"><span>WHAT GETS BUILT</span><span>PRODUCT SIDE</span></div>
              <h3>Any learning experience</h3>
              <p>Your code can call EduOS during development or at runtime. The infrastructure does not dictate the product.</p>
              <div className="output-list">{outputs.map((output) => <span key={output}>{output}</span>)}</div>
            </div>

            <div className="runtime-dock">
              <article className="dock-card loom"><span>FEEDS</span><h4>Loom</h4><p>Open-world knowledge becomes structured insight, skills, and assets.</p></article>
              <i className="dock-arrow">↘</i>
              <article className="dock-card skills"><span>LOADS</span><h4>Skills</h4><p>Executable pedagogical capabilities selected for this task.</p></article>
              <article className="dock-card gallery"><span>MOUNTS</span><h4>Asset Gallery</h4><p>Scaffolds, interfaces, workflows, and examples.</p></article>
              <i className="dock-arrow">↗</i>
            </div>

            <div className="lens-rail">
              <span>SEPARATE OBSERVATION SYSTEM</span>
              <a href={PEDAGOGY_LENS} target="_blank" rel="noreferrer"><strong>Edu Evaluator + Pedagogy Lens</strong><b>OPEN PRODUCT ↗</b></a>
              <i />
              <p>evaluates the product, workflow, and learning experience built around EduOS</p>
            </div>
          </div>
        </section>

        <section className="loom-section" id="loom">
          <div className="loom-visual" aria-label="Loom turns open-world knowledge into runtime material">
            <div className="open-world"><small>OPEN WORLD</small><span>PAPERS</span><span>GITHUB</span><span>OPEN SKILLS</span><span>EDUCATION DATA</span></div>
            <div className="loom-thread thread-a" /><div className="loom-thread thread-b" /><div className="loom-thread thread-c" />
            <div className="loom-core"><small>KNOWLEDGE CONVERSION</small><strong>Loom</strong><span>discover → structure → validate → package</span></div>
            <div className="runtime-material"><small>RUNTIME MATERIAL</small><span>INSIGHTS</span><span>SKILLS</span><span>ASSETS</span></div>
          </div>

          <div className="loom-copy">
            <p className="micro">{"// 03 — THE KNOWLEDGE SUPPLY LINE"}</p>
            <h2>Knowledge outside the model,<br /><span>usable inside the runtime.</span></h2>
            <p>Loom continuously converts new educational research, repositories, open-source skills, and domain knowledge into material EduOS can call. It supplies the runtime; it is not the runtime.</p>
            <div className="loom-steps"><span><b>01</b> DISCOVER</span><i>→</i><span><b>02</b> CONVERT</span><i>→</i><span><b>03</b> PACKAGE</span><i>→</i><span><b>04</b> LOAD</span></div>
            <div className="loom-links">
              <a href="/directory">Browse the open-source directory <span>↗</span></a>
              <span className="planned-pill">LOOM / IN DEVELOPMENT</span>
            </div>
          </div>
        </section>

        <section className="gallery-section" id="gallery">
          <div className="section-label"><span>{"// 04 — LOADABLE CAPABILITIES + BUILDING MATERIAL"}</span><span>SKILLS ≠ GALLERY</span></div>
          <div className="gallery-heading">
            <h2>Skills execute.<br /><span>Assets scaffold.</span></h2>
            <p>EduOS can load both, but they are different things. Skills perform focused work. The Pedagogical Asset Gallery gives builders reusable structures, interfaces, workflows, and examples.</p>
          </div>

          <div className="asset-lane">
            <div className="lane-label"><span>01</span><strong>Executable skills</strong><small>LOADED BY EDUOS</small></div>
            <div className="project-grid skill-grid">
              {skillProjects.map((project, index) => (
                <a className="project-card" key={project.name} href={project.href} target="_blank" rel="noreferrer" style={{ "--card-i": index } as CSSProperties}>
                  <div className="project-top"><span>{project.type}</span><span>SKILL ↗</span></div>
                  <div className="project-glyph" aria-hidden="true"><i /><i /><i /></div>
                  <h3>{project.name}</h3><p>{project.text}</p>
                  <div className="project-link"><span>EXPLORE CAPABILITY</span><span>↗</span></div>
                </a>
              ))}
            </div>
          </div>

          <div className="asset-lane gallery-lane">
            <div className="lane-label"><span>02</span><strong>Pedagogical assets</strong><small>MOUNT OR ADAPT</small></div>
            <div className="project-grid asset-grid">
              {assetProjects.map((project, index) => (
                <a className="project-card" key={project.name} href={project.href} target="_blank" rel="noreferrer" style={{ "--card-i": index } as CSSProperties}>
                  <div className="project-top"><span>{project.type}</span><span>ASSET ↗</span></div>
                  <div className="project-glyph asset" aria-hidden="true"><i /><i /><i /></div>
                  <h3>{project.name}</h3><p>{project.text}</p>
                  <div className="project-link"><span>OPEN ASSET</span><span>↗</span></div>
                </a>
              ))}
            </div>
          </div>

          <div className="gallery-actions">
            <a className="all-projects" href={GALLERY} target="_blank" rel="noreferrer"><span>OPEN THE SCAFFOLDING ASSET GALLERY</span><span>GITHUB ↗</span></a>
            <a className="all-projects directory" href="/directory"><span>SEARCH THE OPEN-SOURCE DIRECTORY</span><span>EDUOS RADAR ↗</span></a>
          </div>
        </section>

        <section className="roadmap-section" aria-label="Edu AI Builders model lifecycle roadmap">
          <div className="section-label light"><span>{"// 05 — MODEL LIFECYCLE"}</span><span>ACTIVE + EXPLORING</span></div>
          <div className="roadmap-heading"><h2>Today: inference runtime.<br /><span>Next: more of the learning stack.</span></h2><p>EduOS is the active inference layer. Application infrastructure keeps expanding, while pre-training and post-training work are being explored and added over time.</p></div>
          <div className="roadmap-track">
            <article><span>EXPLORING</span><strong>Pre-training</strong><p>Educational data, representations, and model foundations.</p></article>
            <i>→</i>
            <article className="active"><span>ACTIVE CORE</span><strong>Inference</strong><p>EduOS, skills, assets, Loom, and agent integrations.</p></article>
            <i>→</i>
            <article><span>BUILDING</span><strong>Post-training</strong><p>Pedagogical evaluation, adaptation, and quality feedback.</p></article>
          </div>
        </section>

        <section className="build-section" id="build">
          <div className="build-aura" />
          <div className="build-content">
            <p className="micro">{"// 06 — THE OPEN INVITATION"}</p>
            <h2>Anyone can be an<br /><span>Edu AI Builder.</span></h2>
            <p>You do not need to build a model or understand the whole stack. Start with a learning problem. Call the runtime, load a skill, adapt an asset, connect new knowledge, or contribute what you learn.</p>
            <div className="output-cloud" aria-label="Things you can build">{outputs.map((output, index) => <span key={output} style={{ "--i": index } as CSSProperties}>{output}</span>)}</div>
            <div className="build-actions">
              <a className="action dark" href={`${GITHUB}?tab=repositories`} target="_blank" rel="noreferrer">Choose a starting point <span>↗</span></a>
              <a className="action glass" href="/directory">Explore the directory <span>↗</span></a>
            </div>
          </div>
        </section>

        <footer>
          <a className="brand footer-brand" href="#top"><Brand /><span>Edu AI Builders</span></a>
          <p>Open infrastructure for anything you want to build regarding education.</p>
          <div className="footer-links"><a href="#system">System</a><a href="#runtime">EduOS</a><a href="#gallery">Assets</a><a href="/directory">Directory</a><a href={GITHUB} target="_blank" rel="noreferrer">GitHub ↗</a></div>
          <div className="footer-meta"><span>OPEN SOURCE / BUILT IN PUBLIC</span><span>FOUNDED BY <a href="https://github.com/ywEdAi" target="_blank" rel="noreferrer">YI WANG ↗</a></span></div>
        </footer>
      </div>
    </main>
  );
}
