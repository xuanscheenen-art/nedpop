import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "退款说明｜NedPop内德泡泡",
  description: "查看 NedPop 数字课程的退款适用范围、申请方式与处理原则。",
  path: "/refund",
  index: false,
});

export default function RefundLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
