type SmartWordCardProps = {
  dutch: string;
  chinese: string;
  english: string;
  hook: string;
  breakdown: string[];
  example: string;
};

export function SmartWordCard({ dutch, chinese, english, hook, breakdown, example }: SmartWordCardProps) {
  return (
    <article className="rounded-[24px] border border-blue-100 bg-white p-6 shadow-soft">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-2xl font-black text-ink">{dutch}</h3>
        <span className="rounded-full bg-peach px-3 py-1 text-sm font-black text-pop">{chinese}</span>
        <span className="rounded-full bg-skywash px-3 py-1 text-sm font-bold text-ocean">{english}</span>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {breakdown.map((part) => (
          <span key={part} className="rounded-xl bg-mint px-3 py-2 text-sm font-black text-ocean">
            {part}
          </span>
        ))}
      </div>
      <p className="mt-5 leading-7 text-ocean/75">{hook}</p>
      <p className="mt-4 rounded-2xl bg-skywash p-4 font-bold text-ink">{example}</p>
    </article>
  );
}
