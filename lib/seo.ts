import type { Metadata } from "next";

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  index?: boolean;
};

export function createPageMetadata({
  title,
  description,
  path,
  keywords,
  index = true,
}: PageMetadataOptions): Metadata {
  return {
    title,
    description,
    keywords,
    alternates: { canonical: path },
    robots: { index, follow: true },
    openGraph: {
      type: "website",
      url: path,
      siteName: "NedPop",
      title,
      description,
      locale: "zh_CN",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
