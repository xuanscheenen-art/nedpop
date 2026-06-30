import type { Metadata } from "next";
import { AppNav } from "@/components/AppNav";
import { AppFooter } from "@/components/AppFooter";
import { LearningProgressDock } from "@/components/LearningProgressDock";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "NedPop | Dutch from zero",
  description: "A web-based Dutch learning tool for Chinese and English-speaking learners.",
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
