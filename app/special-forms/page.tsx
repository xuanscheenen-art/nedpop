"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SpecialFormsReference } from "@/components/SpecialFormsReference";
import { useLanguage } from "@/lib/i18n";

export default function SpecialFormsPage() {
  const { language } = useLanguage();

  return (
    <main className="bg-white">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-black text-pop">
          <ArrowLeft size={16} />
          {language === "zh" ? "返回首页" : "Back to home"}
        </Link>

        <div className="mt-10 rounded-[38px] border border-blue-100 bg-slate-50 p-6 shadow-soft sm:p-8">
          <p className="text-sm font-black tracking-[0.18em] text-pop">{language === "zh" ? "Reference" : "Reference"}</p>
          <h1 className="mt-3 text-5xl font-black leading-tight text-ink">
            {language === "zh" ? "荷兰语单词变形表" : "Dutch Word Forms Table"}
          </h1>
          <p className="mt-4 max-w-4xl text-lg font-bold leading-8 text-ocean/70">
            {language === "zh"
              ? "免费的荷兰语单词变形查询工具：查动词变位、过去式与完成式、可分动词拆分和形容词变化。"
              : "Look up verb changes, past and perfect forms, separable verbs, and adjective comparisons."}
          </p>
        </div>

        <div className="mt-7">
          <SpecialFormsReference language={language} />
        </div>
      </section>
    </main>
  );
}
