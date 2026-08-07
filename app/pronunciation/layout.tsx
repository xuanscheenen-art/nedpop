import type { Metadata } from "next";

const title = "荷兰语发音规则与练习｜NedPop内德泡泡";
const description =
  "学习荷兰语发音规则，掌握 ie、ui、eu、ij、g/ch 等常见发音组合。NedPop帮助中文学习者通过单词解码和真实发音练习快速提升荷兰语听说能力。";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "荷兰语发音",
    "荷兰语怎么读",
    "荷兰语发音规则",
    "荷兰语字母发音",
    "Dutch pronunciation",
    "Dutch pronunciation rules",
    "Learn Dutch pronunciation",
  ],
  alternates: {
    canonical: "/pronunciation",
  },
  openGraph: {
    type: "website",
    url: "/pronunciation",
    siteName: "NedPop",
    title,
    description,
    locale: "zh_CN",
  },
};

export default function PronunciationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
