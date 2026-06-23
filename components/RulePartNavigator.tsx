"use client";

import { useLanguage } from "@/lib/i18n";

type RulePartItem<T extends string> = {
  id: T;
  label: string;
  body: string;
};

export function RulePartNavigator<T extends string>({
  title,
  activeId,
  items,
  onSelect,
}: {
  title: string;
  activeId: T;
  items: RulePartItem<T>[];
  onSelect: (id: T) => void;
}) {
  const { language } = useLanguage();
  const gridClass = items.length === 2 ? "md:grid-cols-2" : items.length === 4 ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-3";

  return (
    <nav className="mt-6 rounded-[28px] border border-blue-100 bg-slate-50 p-4" aria-label={title}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-sm font-black tracking-[0.14em] text-pop">{title}</p>
        <p className="text-sm font-black text-ocean/65">
          {language === "zh" ? `${items.length} 个部分，按顺序点开` : `${items.length} parts. Open them in order.`}
        </p>
      </div>
      <div className={`mt-4 grid gap-3 ${gridClass}`}>
        {items.map((item, index) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              aria-pressed={isActive}
              className={`min-h-[112px] rounded-[22px] p-4 text-left ring-1 transition ${
                isActive
                  ? "bg-ink text-white ring-ink shadow-soft"
                  : "bg-white text-ocean ring-blue-100 hover:-translate-y-0.5 hover:bg-peach"
              }`}
            >
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-black ${
                  isActive ? "bg-white text-ink" : "bg-skywash text-ocean"
                }`}
              >
                {index + 1}
              </span>
              <span className="mt-3 block text-lg font-black leading-6">{item.label}</span>
              <span className={`mt-2 block text-sm font-bold leading-6 ${isActive ? "text-blue-50" : "text-ocean/65"}`}>
                {item.body}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
