import type { LucideIcon } from "lucide-react";

type FeatureCardProps = {
  title: string;
  body: string;
  icon: LucideIcon;
};

export function FeatureCard({ title, body, icon: Icon }: FeatureCardProps) {
  return (
    <article className="rounded-[24px] border border-blue-100 bg-white p-6 shadow-soft">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-mint text-ocean">
        <Icon size={22} />
      </span>
      <h3 className="mt-5 text-xl font-black text-ink">{title}</h3>
      <p className="mt-3 leading-7 text-ocean/75">{body}</p>
    </article>
  );
}
