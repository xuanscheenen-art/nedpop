import type { MetadataRoute } from "next";

const baseUrl = "https://nedpop.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/api/",
        "/auth/",
        "/learn/",
        "/word-review",
        "/words",
        "/a2-exam-practice",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
