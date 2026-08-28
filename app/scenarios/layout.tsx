import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "荷兰语生活场景练习｜A0–B1 口语与写作｜NedPop内德泡泡",
  description: "通过 A0–B1 荷兰语生活场景练习，训练真实情境中的口语、听力和写作表达。",
  path: "/scenarios",
  keywords: ["荷兰语口语练习", "荷兰语生活场景", "Dutch speaking practice"],
});

export default function ScenariosLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
