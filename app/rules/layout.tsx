import type { Metadata } from "next";

const title = "荷兰语语法规则学习｜de/het、动词变位与句子结构｜NedPop内德泡泡";
const description =
  "学习荷兰语核心语法规则，掌握 de/het、单复数、动词变位、介词结构和句子顺序。NedPop内德泡泡帮助中文学习者从A0到B1系统理解荷兰语语法。";

export const metadata: Metadata = {
  title,
  description,
  keywords: ["荷兰语语法", "荷兰语规则", "de het区别", "荷兰语动词变位", "Dutch grammar"],
  alternates: {
    canonical: "/rules",
  },
  openGraph: {
    type: "website",
    url: "/rules",
    siteName: "NedPop",
    title,
    description,
    locale: "zh_CN",
  },
};

export default function RulesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
