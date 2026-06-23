"use client";

import { useLanguage } from "@/lib/i18n";

type WritingTaskCardProps = {
  prompt: string;
  checklist: string[];
  sampleAnswer?: string;
};

export function WritingTaskCard({ prompt, checklist, sampleAnswer }: WritingTaskCardProps) {
  const { t } = useLanguage();

  return (
    <article className="rounded-[24px] border border-blue-100 bg-white p-6 shadow-soft">
      <h3 className="text-xl font-black text-ink">{prompt}</h3>
      <div className="mt-5 grid gap-2">
        {checklist.map((item) => (
          <label key={item} className="flex items-center gap-3 rounded-2xl bg-skywash p-3 font-bold text-ocean">
            <input type="checkbox" className="size-4 accent-orange-400" />
            {item}
          </label>
        ))}
      </div>
      {sampleAnswer ? (
        <>
          <p className="mt-5 text-sm font-black text-pop">{t("label.sampleAnswer")}</p>
        <p className="mt-5 whitespace-pre-line rounded-2xl bg-peach p-4 text-sm font-bold leading-6 text-ocean">
          {sampleAnswer}
        </p>
        </>
      ) : null}
    </article>
  );
}
