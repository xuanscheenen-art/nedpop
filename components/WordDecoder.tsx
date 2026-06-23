type WordDecoderProps = {
  word: string;
  chunks: string[];
  meaning: string;
};

export function WordDecoder({ word, chunks, meaning }: WordDecoderProps) {
  return (
    <section className="rounded-[28px] bg-ink p-6 text-white shadow-soft">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-200">Word Decoder</p>
      <h2 className="mt-3 text-4xl font-black">{word}</h2>
      <div className="mt-6 flex flex-wrap gap-3">
        {chunks.map((chunk) => (
          <span key={chunk} className="rounded-2xl bg-white/10 px-5 py-3 text-lg font-black">
            {chunk}
          </span>
        ))}
      </div>
      <p className="mt-6 text-lg text-blue-50">{meaning}</p>
    </section>
  );
}
