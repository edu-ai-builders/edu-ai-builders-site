"use client";

import { useState } from "react";

const GITHUB = "https://github.com/edu-ai-builders";

type LayerKey = "CONNECT" | "LOOM" | "EDUOS" | "ASSETS" | "EVALUATE";

const layers: Record<LayerKey, {
  index: string;
  eyebrow: string;
  name: string;
  kind: string;
  summary: string;
  items: string[];
  status: string;
  color: string;
}> = {
  CONNECT: {
    index: "01",
    eyebrow: "INPUT SURFACE",
    name: "Agents & Models",
    kind: "PLUGGABLE PROVIDERS",
    summary: "Bring the intelligence you already use. An agent can read EduOS; hosted and local models can connect through adapters.",
    items: ["Any agent", "DeepSeek Harness bridge", "Local models", "Hosted models"],
    status: "OPEN INTERFACE",
    color: "cyan",
  },
  LOOM: {
    index: "02",
    eyebrow: "KNOWLEDGE FABRIC",
    name: "Loom",
    kind: "EXTERNAL KNOWLEDGE",
    summary: "Weave knowledge outside the model into the runtime: new education papers, repositories, datasets, and community skills.",
    items: ["Research papers", "GitHub repositories", "Open skills", "Domain collections"],
    status: "IN DEVELOPMENT",
    color: "violet",
  },
  EDUOS: {
    index: "03",
    eyebrow: "PEDAGOGICAL RUNTIME",
    name: "EduOS",
    kind: "CORE SYSTEM",
    summary: "The runtime that turns educational knowledge into decisions an AI system can use while it teaches, builds, and adapts.",
    items: ["Learner context", "Pedagogical decisions", "Capability routing", "Runtime services"],
    status: "CORE SPEC",
    color: "indigo",
  },
  ASSETS: {
    index: "04",
    eyebrow: "BUILDING MATERIAL",
    name: "Skills + Gallery",
    kind: "COMPOSABLE ASSETS",
    summary: "Reusable teaching capabilities and concrete design material: skills, UI patterns, workflows, worked examples, and the Edu Substrate.",
    items: ["Pedagogical skills", "UI / UX patterns", "Workflows", "Worked examples", "Substrate / Loom assets"],
    status: "ACTIVE + EXPANDING",
    color: "mint",
  },
  EVALUATE: {
    index: "05",
    eyebrow: "QUALITY LOOP",
    name: "Evaluator + Lens",
    kind: "PEDAGOGICAL EVALUATION",
    summary: "Inspect what the system did through a pedagogy lens, evaluate teaching quality, and feed what you learn back into the runtime.",
    items: ["Edu Evaluator", "Pedagogy Lens", "Rubrics", "Learner simulation"],
    status: "IN DEVELOPMENT",
    color: "rose",
  },
};

const projects = [
  { name: "Pedagogical Grounding Engine", type: "KNOWLEDGE", text: "Turn educational research into traceable product decisions.", href: `${GITHUB}/pedagogical-grounding-engine` },
  { name: "EduOS Teaching Design Gallery", type: "GALLERY", text: "Teaching-design examples and adaptable artifacts.", href: `${GITHUB}/eduos-teaching-design-gallery` },
  { name: "Math Viz Kit", type: "ASSET KIT", text: "Interactive visualizations for mathematical ideas.", href: `${GITHUB}/math-viz-kit` },
  { name: "Language Learning SOP Kit", type: "SKILLS", text: "Reusable operating procedures for language-learning workflows.", href: `${GITHUB}/language-learning-sop-kit` },
  { name: "Paper Sensemaking", type: "WORKFLOW", text: "Read papers through friction with your existing mental model.", href: `${GITHUB}/paper-sense-making` },
  { name: "Visual Cognition Slides", type: "ASSET KIT", text: "Create decks grounded in cognition and instructional design.", href: `${GITHUB}/visual-cognition-slides` },
];

const outputs = ["AI tutor", "Learning app", "Education agent", "Teacher copilot", "Curriculum tool", "Something new"];

export default function Home() {
  const [activeLayer, setActiveLayer] = useState<LayerKey>("EDUOS");
  const active = layers[activeLayer];

  return (
    <main>
      <a className="skip-link" href="#content">Skip to content</a>
      <div className="topline">
        <span>EDU AI BUILDERS</span>
        <span><i /> OPEN INFRASTRUCTURE / EARLY STAGE</span>
        <span>BUILD SYSTEM 01—05</span>
      </div>

      <header className="nav-shell">
        <a className="brand" href="#top" aria-label="Edu AI Builders home">
          <span className="brand-orbit" aria-hidden="true"><i /><i /><i /></span>
          <span>Edu AI Builders</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#system">System</a>
          <a href="#runtime">Runtime</a>
          <a href="#gallery">Gallery</a>
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
            <p className="micro">// OPEN-SOURCE INFRASTRUCTURE FOR EDUCATION</p>
            <h1>Build anything<br />for <span>learning.</span></h1>
            <p className="hero-definition"><strong>Edu AI Builders is the infrastructure layer for education.</strong> At its center is EduOS — a pedagogical runtime that gives any agent or model access to external knowledge, reusable teaching capabilities, and evaluation.</p>
            <div className="hero-actions">
              <a className="action dark" href="#system">See how it works <span>↓</span></a>
              <a className="action glass" href={GITHUB} target="_blank" rel="noreferrer">Explore GitHub <span>↗</span></a>
            </div>
          </div>

          <div className="runtime-console" aria-label="EduOS system overview">
            <div className="console-top">
              <span><b className="status-light" /> EDUOS / RUNTIME</span>
              <span>ACTIVE SPEC</span>
            </div>
            <div className="console-stage">
              <div className="console-row source-row">
                <small>INPUT</small>
                <div><span>AGENT</span><span>MODEL</span><span>LOCAL</span></div>
              </div>
              <div className="console-connector"><i /><span>reads + plugs in</span><i /></div>
              <div className="kernel-card">
                <div className="kernel-glow" />
                <div className="kernel-head"><span>03</span><span>CORE</span></div>
                <strong>EduOS</strong>
                <p>pedagogical runtime</p>
                <div className="kernel-services"><span>context</span><span>skills</span><span>routing</span><span>eval</span></div>
              </div>
              <div className="console-connector down"><i /><span>composes</span><i /></div>
              <div className="console-row output-row">
                <small>OUTPUT</small>
                <div><span>TUTOR</span><span>APP</span><span>AGENT</span><span>ANYTHING</span></div>
              </div>
            </div>
            <div className="console-bottom"><span>LOOM CONNECTED</span><span>GALLERY MOUNTED</span><span>EVAL WATCHING</span></div>
          </div>
        </section>

        <section className="thesis-strip" aria-label="System thesis">
          <span>ANY MODEL</span><i>→</i><span className="highlight">ONE PEDAGOGICAL RUNTIME</span><i>→</i><span>ANY LEARNING EXPERIENCE</span>
        </section>

        <section className="system-section" id="system">
          <div className="section-label"><span>// 01 — ARCHITECTURE</span><span>SELECT A LAYER</span></div>
          <div className="system-heading">
            <h2>One runtime.<br /><span>Everything plugs in.</span></h2>
            <p>EduOS is not another education app. It is the pedagogical runtime underneath whatever you want to build. Each surrounding layer has one clear job.</p>
          </div>

          <div className="layer-workbench">
            <div className="layer-list" aria-label="Edu AI Builders system layers">
              {(Object.keys(layers) as LayerKey[]).map((key) => {
                const layer = layers[key];
                const selected = key === activeLayer;
                return (
                  <button
                    key={key}
                    className={`layer-card ${layer.color} ${selected ? "active" : ""}`}
                    aria-expanded={selected}
                    onClick={() => setActiveLayer(key)}
                    onFocus={() => setActiveLayer(key)}
                    onMouseEnter={() => setActiveLayer(key)}
                  >
                    <span className="layer-number">{layer.index}</span>
                    <span className="layer-icon" aria-hidden="true">{key === "EDUOS" ? "◉" : key === "LOOM" ? "⌁" : key === "CONNECT" ? "＋" : key === "ASSETS" ? "◇" : "◎"}</span>
                    <span className="layer-title"><strong>{layer.name}</strong><small>{layer.kind}</small></span>
                    <span className="layer-summary">{layer.summary}</span>
                    <span className="layer-toggle">{selected ? "−" : "+"}</span>
                    <span className="layer-detail" aria-hidden={!selected}>
                      <span className="layer-items">{layer.items.map((item) => <i key={item}>{item}</i>)}</span>
                      <span className="layer-command"><b>$</b> eduos inspect --layer {key.toLowerCase()}<em>{layer.status}</em></span>
                    </span>
                  </button>
                );
              })}
            </div>

            <aside className={`layer-inspector ${active.color}`} aria-live="polite">
              <div className="inspector-index"><span>{active.index}</span><span>OF 05</span></div>
              <div className="inspector-node"><i /><i /><i /></div>
              <p>{active.eyebrow}</p>
              <h3>{active.name}</h3>
              <span className="inspector-status">{active.status}</span>
              <div className="inspector-flow">
                <span>knowledge</span><i />
                <strong>EduOS</strong><i />
                <span>experience</span>
              </div>
            </aside>
          </div>
        </section>

        <section className="runtime-section" id="runtime">
          <div className="section-label light"><span>// 02 — RUNTIME</span><span>THE RELATIONSHIP</span></div>
          <div className="runtime-heading">
            <p className="micro">WHAT EDUOS ACTUALLY DOES</p>
            <h2>The model brings intelligence.<br /><span>EduOS brings pedagogy.</span></h2>
          </div>
          <div className="runtime-flow" aria-label="EduOS relationship diagram">
            <article className="flow-column input-column">
              <div className="flow-top"><span>01</span><span>CONNECT</span></div>
              <h3>Agents + Models</h3>
              <p>Use the intelligence layer you choose.</p>
              <ul><li>DeepSeek Harness</li><li>Other agents</li><li>Local models</li><li>Hosted models</li></ul>
            </article>
            <div className="flow-arrow"><span>READ / CALL</span><i>→</i></div>
            <article className="flow-column core-column">
              <div className="core-halo" />
              <div className="flow-top"><span>02</span><span>RUN</span></div>
              <h3>EduOS</h3>
              <p>A shared pedagogical runtime — model-agnostic, agent-readable, and built to compose.</p>
              <div className="core-slots"><span>Loom</span><span>Skills</span><span>Gallery</span><span>Lens</span></div>
            </article>
            <div className="flow-arrow"><span>COMPOSE</span><i>→</i></div>
            <article className="flow-column output-column">
              <div className="flow-top"><span>03</span><span>BUILD</span></div>
              <h3>Anything for learning</h3>
              <p>The infrastructure does not decide the product.</p>
              <ul>{outputs.map((output) => <li key={output}>{output}</li>)}</ul>
            </article>
          </div>
          <div className="feedback-loop"><span>EDU EVALUATOR + PEDAGOGY LENS</span><i /><strong>observe → evaluate → improve the runtime</strong></div>
        </section>

        <section className="loom-section">
          <div className="loom-visual" aria-hidden="true">
            <div className="loom-thread thread-a" /><div className="loom-thread thread-b" /><div className="loom-thread thread-c" />
            <span className="loom-input paper">PAPERS</span><span className="loom-input repos">REPOS</span><span className="loom-input skills">OPEN SKILLS</span>
            <div className="loom-core"><small>KNOWLEDGE FABRIC</small><strong>LOOM</strong><span>outside the model → usable at runtime</span></div>
          </div>
          <div className="loom-copy">
            <p className="micro">// 03 — EXTERNAL KNOWLEDGE</p>
            <h2>Models know a lot.<br />They do not know <span>everything.</span></h2>
            <p>Loom is how EduOS incorporates knowledge outside model weights: a new education paper, a useful GitHub project, an open-source skill, or a domain-specific collection.</p>
            <div className="loom-steps"><span><b>01</b> INGEST</span><i>→</i><span><b>02</b> STRUCTURE</span><i>→</i><span><b>03</b> EXPOSE</span></div>
            <span className="planned-pill">LOOM / IN DEVELOPMENT</span>
          </div>
        </section>

        <section className="gallery-section" id="gallery">
          <div className="section-label"><span>// 04 — AVAILABLE NOW</span><span>BUILDING MATERIAL</span></div>
          <div className="gallery-heading">
            <h2>Start with something<br />you can already use.</h2>
            <p>The repositories are not the system. They are pieces of building material that plug into it — knowledge workflows, skills, interface assets, and reference implementations.</p>
          </div>
          <div className="project-grid">
            {projects.map((project, index) => (
              <a className="project-card" key={project.name} href={project.href} target="_blank" rel="noreferrer">
                <div className="project-top"><span>{String(index + 1).padStart(2, "0")}</span><span>{project.type}</span></div>
                <div className="project-glyph" aria-hidden="true"><i /><i /><i /></div>
                <h3>{project.name}</h3>
                <p>{project.text}</p>
                <div className="project-link"><span>VIEW ON GITHUB</span><span>↗</span></div>
              </a>
            ))}
          </div>
          <a className="all-projects" href={`${GITHUB}?tab=repositories`} target="_blank" rel="noreferrer"><span>EXPLORE EVERY REPOSITORY</span><span>GITHUB / EDU-AI-BUILDERS ↗</span></a>
        </section>

        <section className="build-section" id="build">
          <div className="build-aura" />
          <p className="micro">// 05 — THE OPEN INVITATION</p>
          <h2>Anyone can be an<br /><span>Edu AI Builder.</span></h2>
          <p>You do not need to build a model or understand the whole stack. Start with a learning problem. Use the infrastructure, adapt an asset, connect new knowledge, or contribute what you learn.</p>
          <div className="output-cloud" aria-label="Things you can build">
            {outputs.map((output, i) => <span key={output} style={{ "--i": i } as React.CSSProperties}>{output}</span>)}
          </div>
          <div className="build-actions">
            <a className="action dark" href={`${GITHUB}?tab=repositories`} target="_blank" rel="noreferrer">Choose a starting point <span>↗</span></a>
            <a className="action glass" href="https://github.com/orgs/edu-ai-builders/discussions" target="_blank" rel="noreferrer">Open a discussion <span>↗</span></a>
          </div>
        </section>

        <footer>
          <a className="brand footer-brand" href="#top"><span className="brand-orbit" aria-hidden="true"><i /><i /><i /></span><span>Edu AI Builders</span></a>
          <p>Open infrastructure for anything you want to build regarding education.</p>
          <div className="footer-links"><a href="#system">System</a><a href="#runtime">Runtime</a><a href="#gallery">Gallery</a><a href={GITHUB} target="_blank" rel="noreferrer">GitHub ↗</a></div>
          <div className="footer-meta"><span>OPEN SOURCE / BUILT IN PUBLIC</span><span>FOUNDED BY <a href="https://github.com/ywEdAi" target="_blank" rel="noreferrer">YI WANG ↗</a></span></div>
        </footer>
      </div>
    </main>
  );
}
