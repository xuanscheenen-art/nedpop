import type { Metadata } from "next";

const title = "每日单词泡泡｜荷兰语词汇联想记忆学习｜NedPop内德泡泡";
const description =
  "NedPop每日单词泡泡帮助中文学习者通过联想记忆、词根拆解和趣味联系掌握荷兰语词汇。从A0到B1，轻松积累真实荷兰语单词。";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "每日单词泡泡",
    "荷兰语词汇",
    "荷兰语单词学习",
    "荷兰语词汇记忆",
    "荷兰语入门",
    "Dutch vocabulary",
    "Learn Dutch words",
  ],
  alternates: {
    canonical: "/word-link",
  },
  openGraph: {
    type: "website",
    url: "/word-link",
    siteName: "NedPop",
    title,
    description,
    locale: "zh_CN",
  },
};

export default function WordLinkLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
