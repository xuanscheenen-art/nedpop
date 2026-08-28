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
    "NedPop（内德泡泡）为中文学习者提供荷兰语发音解码、语法规则、每日单词泡泡和 A0–B1 系统课程。",
  keywords: [
    "荷兰语学习",
    "荷兰语入门",
    "荷兰语A1",
    "荷兰语A2",
    "荷兰语B1",
    "荷兰语发音",
    "荷兰语词汇",
    "荷兰语语法",
    "中文学荷兰语",
    "Learn Dutch",
    "Dutch for Chinese speakers",
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
      "NedPop（内德泡泡）为中文学习者提供荷兰语发音解码、语法规则、每日单词泡泡和 A0–B1 系统课程。",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary_large_image",
    title: "NedPop 内德泡泡｜荷兰语学习平台｜从A0到B1系统学习荷兰语",
    description:
      "NedPop（内德泡泡）为中文学习者提供荷兰语发音解码、语法规则、每日单词泡泡和 A0–B1 系统课程。",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://nedpop.com/#organization",
      name: "NedPop",
      alternateName: "内德泡泡",
      url: "https://nedpop.com",
      description: "中文学习者的荷兰语学习平台，提供荷兰语发音、词汇、语法和 A0–B1 学习资源。",
    },
    {
      "@type": "WebSite",
      "@id": "https://nedpop.com/#website",
      name: "NedPop",
      alternateName: "内德泡泡",
      url: "https://nedpop.com",
      inLanguage: ["zh-CN", "en"],
      publisher: { "@id": "https://nedpop.com/#organization" },
    },
    {
      "@type": "WebApplication",
      "@id": "https://nedpop.com/#application",
      name: "NedPop",
      url: "https://nedpop.com",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Any",
      inLanguage: ["zh-CN", "en"],
      description: "面向中文学习者、同时提供英文界面的荷兰语学习平台。",
      publisher: { "@id": "https://nedpop.com/#organization" },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
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
