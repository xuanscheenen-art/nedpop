import Link from "next/link";
import { ArrowRight } from "lucide-react";

type NextStepCardProps = {
  eyebrow?: string;
  currentLabel?: string;
  title: string;
  reason: string;
  buttonLabel: string;
  route: string;
  secondaryLabel?: string;
  secondaryRoute?: string;
};

export function NextStepCard({
  eyebrow = "Next",
  currentLabel,
  title,
  reason,
  buttonLabel,
  route,
  secondaryLabel,
  secondaryRoute,
}: NextStepCardProps) {
  return (
    <section className="mt-6 rounded-[28px] border border-blue-100 bg-white p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div className="min-w-0">
          <p className="text-sm font-black tracking-[0.14em] text-pop">{eyebrow}</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
            <h3 className="min-w-0 text-2xl font-black leading-tight text-ink">{title}</h3>
            {currentLabel ? (
              <span className="w-fit shrink-0 rounded-full bg-skywash px-3 py-1 text-xs font-black text-ocean ring-1 ring-blue-100">
                {currentLabel}
              </span>
            ) : null}
          </div>
          <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-ocean/65">{reason}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 md:items-end">
          <Link
            href={route}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-black text-white shadow-soft transition hover:bg-ocean"
          >
            {buttonLabel}
            <ArrowRight size={17} />
          </Link>
          {secondaryLabel && secondaryRoute ? (
            <Link
              href={secondaryRoute}
              className="inline-flex items-center justify-center rounded-full bg-skywash px-5 py-3 text-sm font-black text-ocean ring-1 ring-blue-100 transition hover:bg-peach"
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
