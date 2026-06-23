import type { LucideIcon } from "lucide-react";

type MethodStepCardProps = {
  title: string;
  label: string;
  body: string;
  icon: LucideIcon;
  index: number;
};

export function MethodStepCard({ title, label, body, icon: Icon, index }: MethodStepCardProps) {
  return (
    <article className="relative overflow-hidden rounded-[28px] border border-blue-100 bg-white p-6 shadow-soft">
      <div className="absolute right-5 top-5 text-5xl font-black text-skywash">{index + 1}</div>
      <div className="relative flex size-12 items-center justify-center rounded-2xl bg-peach text-ocean">
        <Icon size={22} />
      </div>
      <p className="mt-6 text-sm font-black uppercase tracking-[0.15em] text-pop">{label}</p>
      <h3 className="mt-2 text-2xl font-black text-ink">{title}</h3>
      <p className="mt-3 leading-7 text-ocean/75">{body}</p>
    </article>
  );
}
