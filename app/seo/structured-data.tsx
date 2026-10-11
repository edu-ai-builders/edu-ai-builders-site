import { SITE_NAME, SITE_URL } from "./metadata";

const data = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: SITE_NAME,
      url: SITE_URL, sameAs: ["https://github.com/edu-ai-builders"] },
    { "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: SITE_NAME,
      url: SITE_URL, publisher: { "@id": `${SITE_URL}/#organization` } },
  ],
};

// Minimal verified claims only: no invented address, ratings or credentials.
export default function SiteStructuredData() {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
