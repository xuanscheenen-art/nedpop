import type { MetadataRoute } from "next";

const baseUrl = "https://nedpop.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/api/", "/auth/", "/word-review"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
