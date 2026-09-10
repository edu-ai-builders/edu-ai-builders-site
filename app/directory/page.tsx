import Link from "next/link";

export default function DirectoryPage() {
  return (
    <main className="directory-page">
      <header className="directory-header">
        <Link className="brand" href="/" aria-label="Back to Edu AI Builders">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /><b>e</b></span>
          <span>Edu AI Builders / Open-source Directory</span>
        </Link>
        <p>Open-source education infrastructure, mapped and searchable.</p>
        <nav aria-label="Directory navigation">
          <Link href="/">← Main site</Link>
          <Link href="/learning-sciences">Learning Sciences</Link>
          <a href="https://eduos-github-radar.vercel.app/" target="_blank" rel="noreferrer">Open standalone ↗</a>
        </nav>
      </header>
      <iframe
        className="directory-frame"
        src="https://eduos-github-radar.vercel.app/"
        title="EduOS GitHub Radar — open-source education directory"
      />
    </main>
  );
}
