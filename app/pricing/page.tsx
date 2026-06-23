"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PricingSection } from "@/components/PricingSection";
import { useLanguage } from "@/lib/i18n";

export default function PricingPage() {
  const { language } = useLanguage();

  return (
    <main className="bg-white">
      <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-black text-pop">
          <ArrowLeft size={16} />
          {language === "zh" ? "返回首页" : "Back home"}
        </Link>
      </section>
      <PricingSection />
    </main>
  );
}
