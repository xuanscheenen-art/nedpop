import type { Metadata } from "next";

const title = "荷兰语单词变形表｜动词变位、过去式、完成式查询｜NedPop内德泡泡";
const description =
  "免费的荷兰语单词变形查询工具。快速查询荷兰语动词变位、过去式、完成式、可分动词和形容词变化。遇到不会变化的单词，来这里查。";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "荷兰语单词变形",
    "荷兰语动词变位",
    "荷兰语过去式",
    "荷兰语完成式",
    "Dutch verb conjugation",
  ],
  alternates: {
    canonical: "/special-forms",
  },
  openGraph: {
    type: "website",
    url: "/special-forms",
    siteName: "NedPop",
    title,
    description,
    locale: "zh_CN",
  },
};

export default function SpecialFormsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
