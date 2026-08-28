import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "荷兰语 A0–B1 课程价格｜NedPop内德泡泡",
  description: "查看 NedPop A0–B1 荷兰语课程价格与解锁方式。A0 免费开始，付费课程一次购买、不自动续费。",
  path: "/pricing",
  keywords: ["荷兰语课程价格", "荷兰语 A1", "荷兰语 A2", "荷兰语 B1", "Dutch course"],
});

export default function PricingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
