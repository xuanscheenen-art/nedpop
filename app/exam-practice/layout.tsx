import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "荷兰语考试练习资源｜DUO与Staatsexamen｜NedPop内德泡泡",
  description: "按考试等级和技能查找 DUO inburgering 与 Staatsexamen NT2 官方荷兰语练习资源。",
  path: "/exam-practice",
  keywords: ["荷兰语考试练习", "DUO examen oefenen", "Staatsexamen NT2", "NT2考试"],
});

export default function ExamPracticeLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
