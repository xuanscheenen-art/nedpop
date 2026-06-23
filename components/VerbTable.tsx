import type { VerbEntry } from "@/types/course";

export function VerbTable({ verbs }: { verbs: VerbEntry[] }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-blue-100 bg-white shadow-soft">
      <div className="grid grid-cols-[1fr_0.9fr_0.9fr_1fr_1fr] gap-2 bg-ink px-4 py-3 text-xs font-black text-white sm:text-sm">
        <span>Infinitive</span>
        <span>Stem</span>
        <span>Ik</span>
        <span>Jij/hij/zij</span>
        <span>Wij/jullie/zij</span>
      </div>
      {verbs.map((verb) => (
        <div
          key={verb.infinitive}
          className="grid grid-cols-[1fr_0.9fr_0.9fr_1fr_1fr] gap-2 border-t border-blue-50 px-4 py-4 text-xs font-bold text-ocean sm:text-sm"
        >
          <span className="font-black text-ink">{verb.infinitive}</span>
          <span>{verb.stem}</span>
          <span>{verb.presentTense.ik}</span>
          <span>{verb.presentTense.jij} / {verb.presentTense.hijZijHet}</span>
          <span>{verb.presentTense.wij}</span>
        </div>
      ))}
    </div>
  );
}
