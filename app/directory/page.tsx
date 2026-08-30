import Link from "next/link";

const radarUrl =
  process.env.NEXT_PUBLIC_RADAR_URL?.trim() ||
  "https://eduos-github-radar.vercel.app/";
const radarSourceUrl = "https://github.com/ywEdAi/eduos-github-radar";

export default function DirectoryPage() {
  return (
    <main className="directory-page">
      <header className="directory-header">
        <Link className="brand" href="/" aria-label="Back to Edu AI Builders">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /><b>e</b></span>
          <span>Edu AI Builders / Directory</span>
        </Link>
        <p>Open-source education infrastructure, mapped and searchable.</p>
        <nav aria-label="Directory navigation">
          <Link href="/">← Main site</Link>
          <a href={radarSourceUrl} target="_blank" rel="noreferrer">Source ↗</a>
          <a href={radarUrl} target="_blank" rel="noreferrer">Open standalone ↗</a>
        </nav>
      </header>
      <iframe
        className="directory-frame"
        src={radarUrl}
        title="EduOS GitHub Radar — open-source education directory"
      />
    </main>
  );
}
