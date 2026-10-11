import type { MetadataRoute } from "next";
import { courses } from "./content/courses";
import { resources } from "./content/resources";
import { SITE_URL } from "./seo/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  // Redirects, query-driven views and downloadable tools are not canonical pages.
  // No lastModified: request/build time is not the date content was changed.
  const paths = ["/", "/learn", "/use", "/build", "/atlas", "/directory",
    "/learning-sciences", "/changelog", "/updates/research",
    ...courses.map(course => `/learn/${course.slug}`),
    ...resources.filter(resource => resource.artifactPath).map(resource => `/use/${resource.id}`),
  ];
  return [...new Set(paths)].map(path => ({ url: new URL(path, SITE_URL).toString() }));
}
