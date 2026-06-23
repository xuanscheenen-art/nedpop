type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  body?: string;
};

export function SectionHeader({ eyebrow, title, body }: SectionHeaderProps) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-pop">{eyebrow}</p>
      ) : null}
      <h1 className="text-3xl font-black text-ink sm:text-4xl lg:text-5xl">{title}</h1>
      {body ? <p className="mt-4 text-lg leading-8 text-ocean/75">{body}</p> : null}
    </div>
  );
}
