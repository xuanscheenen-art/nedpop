import type { Metadata } from "next";

const title = "关于NedPop内德泡泡｜一种更容易记住荷兰语的学习方式";
const description =
  "认识NedPop内德泡泡：先从荷兰语发音和语法建立理解，再通过每日单词泡泡、记忆路径和单词关联泡泡积累词汇，让荷兰语更容易理解和记住。";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://nedpop.com/about" },
  openGraph: {
    type: "website",
    url: "https://nedpop.com/about",
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
  robots: { index: true, follow: true },
};

export default function AboutLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
