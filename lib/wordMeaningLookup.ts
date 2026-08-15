import { wordItems } from "@/data/vocabularyPlan";

export const normalizeDictionaryWord = (value: string) =>
  value
    .trim()
    .toLocaleLowerCase("nl-NL")
    .replace(/^(de|het|een)\s+/i, "")
    .replace(/[.,!?;:()[\]{}"'`]+$/g, "")
    .trim();

const wordsByForm = new Map(
  wordItems.flatMap((word) => {
    const forms = [[normalizeDictionaryWord(word.dutch), word] as const];
    if (word.plural) forms.push([normalizeDictionaryWord(word.plural), word] as const);
    return forms;
  }),
);

const supplementalMeanings = new Map([
  [
    "dierenarts",
    {
      dutch: "dierenarts",
      meaning: { zh: "兽医", en: "veterinarian" },
    },
  ],
]);

const spellingCorrections = new Map([["dierarts", "dierenarts"]]);

type DictionaryTranslation = {
  word?: string;
  language?: { code?: string };
};

type DictionarySense = {
  definition?: string;
  translations?: DictionaryTranslation[];
};

type DictionaryResponse = {
  word?: string;
  entries?: Array<{
    language?: { code?: string };
    partOfSpeech?: string;
    senses?: DictionarySense[];
  }>;
  source?: {
    url?: string;
    license?: { name?: string; url?: string };
  };
};

export type WordMeaningLookupResult =
  | {
      status: "found";
      word: string;
      meaning: { zh?: string; en: string };
      correctedFrom?: string;
      source: "course" | "reference" | "wiktionary";
      sourceUrl?: string;
      license?: { name: string; url: string };
    }
  | { status: "not-found"; query: string; reason: "no-dutch-entry" }
  | { status: "unavailable"; query: string };

const chineseLanguageCodes = new Set(["zh", "cmn", "zho"]);

async function lookupExternalMeaning(word: string): Promise<WordMeaningLookupResult> {
  try {
    const response = await fetch(
      `https://freedictionaryapi.com/api/v1/entries/nl/${encodeURIComponent(word)}?translations=true`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "NedPop/1.0 (https://nedpop.com; support@nedpop.com)",
        },
        signal: AbortSignal.timeout(15000),
        next: { revalidate: 60 * 60 * 24 * 7 },
      },
    );

    if (response.status === 404) {
      return { status: "not-found", query: word, reason: "no-dutch-entry" };
    }
    if (!response.ok) return { status: "unavailable", query: word };

    const data = (await response.json()) as DictionaryResponse;
    const entries = (data.entries ?? []).filter(
      (entry) => !entry.language?.code || entry.language.code === "nl",
    );
    const senses = entries
      .flatMap((entry) => entry.senses ?? []);
    const definitions = senses
      .map((sense) => (sense.definition ?? "").replace(/\s+/g, " ").trim().slice(0, 320))
      .filter((definition) => definition && !/^inflection of\b/i.test(definition));
    const uniqueDefinitions = [...new Set(definitions)].slice(0, 5);

    if (!uniqueDefinitions.length) {
      return { status: "not-found", query: word, reason: "no-dutch-entry" };
    }

    const chineseTranslations = senses
      .flatMap((sense) => sense.translations ?? [])
      .filter(
        (translation) =>
          translation.word &&
          translation.language?.code &&
          chineseLanguageCodes.has(translation.language.code),
      )
      .map((translation) => translation.word as string);
    const uniqueChineseTranslations = [...new Set(chineseTranslations)].slice(0, 6);

    return {
      status: "found",
      word: normalizeDictionaryWord(data.word ?? word),
      meaning: {
        ...(uniqueChineseTranslations.length
          ? { zh: uniqueChineseTranslations.join("；") }
          : {}),
        en: uniqueDefinitions.join("; "),
      },
      source: "wiktionary",
      sourceUrl: data.source?.url ?? `https://en.wiktionary.org/wiki/${encodeURIComponent(word)}`,
      license: {
        name: data.source?.license?.name ?? "CC BY-SA 4.0",
        url: data.source?.license?.url ?? "https://creativecommons.org/licenses/by-sa/4.0/",
      },
    };
  } catch {
    return { status: "unavailable", query: word };
  }
}

export async function lookupWordMeaning(value: string): Promise<WordMeaningLookupResult> {
  const query = normalizeDictionaryWord(value);
  const correctedWord = spellingCorrections.get(query);
  const lookupWord = correctedWord ?? query;
  const courseWord = wordsByForm.get(lookupWord);

  if (courseWord) {
    return {
      status: "found",
      word: courseWord.dutch,
      meaning: courseWord.meaning,
      correctedFrom: correctedWord ? query : undefined,
      source: "course",
    };
  }

  const supplemental = supplementalMeanings.get(lookupWord);
  if (supplemental) {
    return {
      status: "found",
      word: supplemental.dutch,
      meaning: supplemental.meaning,
      correctedFrom: correctedWord ? query : undefined,
      source: "reference",
    };
  }

  const external = await lookupExternalMeaning(lookupWord);
  return external.status === "found" && correctedWord
    ? { ...external, correctedFrom: query }
    : external;
}
