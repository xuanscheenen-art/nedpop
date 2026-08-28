import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "复习池｜NedPop内德泡泡",
  robots: { index: false, follow: false },
};

export default function WordReviewLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
