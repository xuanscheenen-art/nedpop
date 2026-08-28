import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "使用条款｜NedPop内德泡泡",
  description: "NedPop 课程权益、学习服务与合理使用条款。",
  path: "/terms",
  index: false,
});

export default function TermsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
