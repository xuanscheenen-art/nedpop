import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "课程学习｜NedPop内德泡泡",
  robots: { index: false, follow: false },
};

export default function LessonLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
