type RuleCardProps = {
  title: string;
  pattern: string[];
  example: string;
  tip: string;
};

export function RuleCard({ title, pattern, example, tip }: RuleCardProps) {
  return (
    <article className="rounded-[24px] border border-blue-100 bg-white p-6 shadow-soft">
      <h3 className="text-xl font-black text-ink">{title}</h3>
      <div className="mt-4 grid gap-2">
        {pattern.map((item) => (
          <p key={item} className="rounded-2xl bg-peach p-4 text-base font-black text-ocean">
            {item}
          </p>
        ))}
      </div>
      <p className="mt-4 text-lg font-bold text-ink">{example}</p>
      <p className="mt-3 leading-7 text-ocean/75">{tip}</p>
    </article>
  );
}
