import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "隐私政策｜NedPop内德泡泡",
  description: "了解 NedPop 如何处理账号、学习进度、课程权益和付款相关数据。",
  path: "/privacy",
  index: false,
});

export default function PrivacyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
