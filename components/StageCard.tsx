type StageCardProps = {
  level: string;
  title: string;
  status: string;
  progress: number;
  topics: string[];
};

export function StageCard({ level, title, status, progress, topics }: StageCardProps) {
  return (
    <article className="rounded-[28px] border border-blue-100 bg-white p-6 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="rounded-full bg-skywash px-3 py-1 text-xs font-black text-ocean">{status}</span>
          <h3 className="mt-4 text-2xl font-black text-ink">
            {level} {title}
          </h3>
        </div>
        <span className="flex size-14 items-center justify-center rounded-full bg-peach text-lg font-black text-pop">
          {progress}%
        </span>
      </div>
      <div className="mt-5 h-2 rounded-full bg-blue-50">
        <div className="h-2 rounded-full bg-pop" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {topics.map((topic) => (
          <span key={topic} className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-ocean ring-1 ring-blue-100">
            {topic}
          </span>
        ))}
      </div>
    </article>
  );
}
