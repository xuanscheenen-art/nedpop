import type { LucideIcon } from "lucide-react";

type ProgressCardProps = {
  title: string;
  value: string;
  percent: number;
  tone: string;
  icon: LucideIcon;
};

export function ProgressCard({ title, value, percent, tone, icon: Icon }: ProgressCardProps) {
  return (
    <article className="rounded-[24px] border border-blue-100 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <span className={`flex size-11 items-center justify-center rounded-2xl ${tone} text-ocean`}>
          <Icon size={20} />
        </span>
        <span className="text-sm font-black text-pop">{percent}%</span>
      </div>
      <h3 className="mt-5 text-lg font-black text-ink">{title}</h3>
      <p className="mt-1 text-sm font-semibold text-ocean/70">{value} complete</p>
      <div className="mt-4 h-2 rounded-full bg-blue-50">
        <div className="h-2 rounded-full bg-ocean" style={{ width: `${percent}%` }} />
      </div>
    </article>
  );
}
