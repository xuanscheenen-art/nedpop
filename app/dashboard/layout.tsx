import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "学习进度｜NedPop内德泡泡",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
