"use client";

import { useLanguage } from "@/lib/i18n";

type SpeakingTaskCardProps = {
  prompt: string;
  target?: string;
  level: string;
  sampleAnswer?: string;
};

export function SpeakingTaskCard({ prompt, target, level, sampleAnswer }: SpeakingTaskCardProps) {
  const { t } = useLanguage();

  return (
    <article className="rounded-[24px] bg-ink p-6 text-white shadow-soft">
      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-orange-200">{level} Speak</span>
      <h3 className="mt-4 text-xl font-black">{prompt}</h3>
      {target ? <p className="mt-4 leading-7 text-blue-50">{target}</p> : null}
      {sampleAnswer ? <p className="mt-4 rounded-2xl bg-white/10 p-4 leading-7 text-blue-50">{sampleAnswer}</p> : null}
      <button className="mt-6 rounded-full bg-pop px-5 py-3 text-sm font-black text-ink">{t("label.practiceSteps")}</button>
    </article>
  );
}
