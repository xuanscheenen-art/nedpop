"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

const legalLinks = [
  { href: "/privacy", zh: "隐私政策", en: "Privacy" },
  { href: "/terms", zh: "使用条款", en: "Terms" },
  { href: "/refund", zh: "退款说明", en: "Refunds" },
] as const;

export function AppFooter() {
  const { language } = useLanguage();
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@nedpop.com";

  return (
    <footer className="mt-16 border-t border-blue-100 bg-white">
      <div className="mx-auto flex max-w-[92rem] flex-col gap-5 px-4 py-8 text-sm font-bold text-ocean/70 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="text-base font-black text-ink">NedPop</p>
          <p className="mt-1">
            {language === "zh"
              ? "面向真实生活任务的荷兰语学习辅助工具。"
              : "A Dutch learning helper for practical life tasks."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {legalLinks.map((link) => (
            <Link key={link.href} href={link.href} className="whitespace-nowrap transition hover:text-ocean">
              {language === "zh" ? link.zh : link.en}
            </Link>
          ))}
          <a href={`mailto:${supportEmail}`} className="whitespace-nowrap transition hover:text-ocean">
            {supportEmail}
          </a>
        </div>
      </div>
    </footer>
  );
}
