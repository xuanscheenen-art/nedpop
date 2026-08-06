import type { Metadata } from "next";
import { AppNav } from "@/components/AppNav";
import { AppFooter } from "@/components/AppFooter";
import { LearningProgressDock } from "@/components/LearningProgressDock";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://nedpop.com"),
  title: "NedPop 内德泡泡｜荷兰语学习平台｜从A0到B1系统学习荷兰语",
  description:
    "NedPop（内德泡泡）帮助中文学习者学习荷兰语，覆盖发音、词汇、语法以及NT2考试准备，从A0入门到B1。",
  keywords: [
    "荷兰语学习",
    "荷兰语入门",
    "荷兰语A1",
    "荷兰语A2",
    "荷兰语B1",
    "NT2考试",
    "荷兰语发音",
    "Learn Dutch",
    "Dutch course",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "NedPop",
    title: "NedPop 内德泡泡｜荷兰语学习平台｜从A0到B1系统学习荷兰语",
    description:
      "NedPop（内德泡泡）帮助中文学习者学习荷兰语，覆盖发音、词汇、语法以及NT2考试准备，从A0入门到B1。",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary",
    title: "NedPop 内德泡泡｜荷兰语学习平台｜从A0到B1系统学习荷兰语",
    description:
      "NedPop（内德泡泡）帮助中文学习者学习荷兰语，覆盖发音、词汇、语法以及NT2考试准备，从A0入门到B1。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <LanguageProvider>
          <AppNav />
          {children}
          <AppFooter />
          <LearningProgressDock />
        </LanguageProvider>
      </body>
    </html>
  );
}
