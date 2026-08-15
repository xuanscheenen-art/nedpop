import { NextRequest, NextResponse } from "next/server";
import { wordItems } from "@/data/vocabularyPlan";
import { translateDutchWordToChinese } from "@/lib/googleTranslate";
import { lookupWordMeaning } from "@/lib/wordMeaningLookup";

const normalizeWord = (value: string) =>
  value
    .trim()
    .toLocaleLowerCase("nl-NL")
    .replace(/^(de|het|een)\s+/i, "")
    .replace(/[.,!?;:()[\]{}"'`]+$/g, "")
    .trim();

const nounEntries = wordItems.filter((word) => word.article);

const nounsBySingular = new Map(
  nounEntries.map((word) => [normalizeWord(word.dutch), word]),
);

const nounsByPlural = new Map(
  nounEntries.flatMap((word) =>
    word.plural ? [[normalizeWord(word.plural), word] as const] : [],
  ),
);

const WIKTIONARY_API = "https://nl.wiktionary.org/w/api.php";
const ENGLISH_WIKTIONARY_API = "https://en.wiktionary.org/w/api.php";

type WiktionaryEntry = {
  title: string;
  wikitext: string;
};

const fetchWiktionaryJson = async (
  params: URLSearchParams,
  apiUrl = WIKTIONARY_API,
) => {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(`${apiUrl}?${params}`, {
        headers: {
          "User-Agent": "NedPop/1.0 (https://nedpop.com; support@nedpop.com)",
        },
        signal: AbortSignal.timeout(5000),
        next: { revalidate: 60 * 60 * 24 * 7 },
      });
      if (response.ok) return (await response.json()) as unknown;
    } catch {
      // The public dictionary occasionally has a transient DNS/timeout failure.
    }

    if (attempt === 0) {
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }

  return undefined;
};

const fetchWiktionarySearchTitles = async (params: URLSearchParams) => {
  const result = (await fetchWiktionaryJson(params)) as
    | { query?: { search?: Array<{ title?: string }> } }
    | undefined;
  return (result?.query?.search ?? [])
    .map((item) => item.title)
    .filter((title): title is string => Boolean(title));
};

const fetchWiktionaryWikitext = async (
  word: string,
  apiUrl = WIKTIONARY_API,
) => {
  // Revisions is markedly faster and more reliable than MediaWiki's parse
  // endpoint for dictionary pages. This matters for English -> Dutch fallback:
  // several candidate nouns may need their article checked in parallel.
  const revisionParams = new URLSearchParams({
    action: "query",
    titles: word,
    prop: "revisions",
    rvprop: "content",
    rvslots: "main",
    format: "json",
    formatversion: "2",
    redirects: "1",
  });

  const data = (await fetchWiktionaryJson(revisionParams, apiUrl)) as
    | {
        query?: {
          pages?: Array<{
            title?: string;
            missing?: boolean;
            revisions?: Array<{ slots?: { main?: { content?: string } } }>;
          }>;
        };
      }
    | undefined;
  const page = data?.query?.pages?.[0];
  const wikitext = page?.revisions?.[0]?.slots?.main?.content;
  if (!page || page.missing || !wikitext) return undefined;

  return {
    title: page.title ?? word,
    wikitext,
  } satisfies WiktionaryEntry;
};

const cleanTranslation = (value: string) =>
  value
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

const extractTranslations = (wikitext: string, languageCodes: string[]) => {
  const codePattern = languageCodes.join("|");
  const matches = [
    ...wikitext.matchAll(
      new RegExp(`\\{\\{trad\\|(?:${codePattern})\\|([^}|]+)`, "gi"),
    ),
  ]
    .map((match) => cleanTranslation(match[1]))
    .filter(Boolean);

  return [...new Set(matches)].slice(0, 6);
};

const extractEnglishWiktionaryTranslations = (
  wikitext: string,
  languageCode: string,
) => {
  const matches = [
    ...wikitext.matchAll(
      new RegExp(
        `\\{\\{(?:t|t\\+|tt|tt\\+|trad)\\|${languageCode}\\|([^}|]+)`,
        "gi",
      ),
    ),
  ]
    .map((match) => normalizeWord(cleanTranslation(match[1])))
    .filter(Boolean);

  return [...new Set(matches)].slice(0, 8);
};

const lookupWiktionaryArticle = async (word: string) => {
  const entry = await fetchWiktionaryWikitext(word);
  if (!entry) return undefined;

  try {
    const { wikitext } = entry;
    const dutchStart = wikitext.indexOf("{{=nld=}}");
    if (dutchStart === -1) return undefined;

    const afterDutch = wikitext.slice(dutchStart + "{{=nld=}}".length);
    const nextLanguage = afterDutch.search(/\{\{=[a-z]{3}=\}\}/);
    const dutchSection = nextLanguage === -1 ? afterDutch : afterDutch.slice(0, nextLanguage);
    const nounGenders = [
      ...dutchSection.matchAll(/\{\{-noun-\|nld\}\}[\s\S]{0,400}?\{\{-l-\|([^}]+)\}\}/g),
    ].flatMap((match) => match[1].toLowerCase().split("|").map((part) => part.trim()));

    const articles = new Set<"de" | "het">();
    nounGenders.forEach((gender) => {
      if (gender === "n") articles.add("het");
      if (["m", "f", "fm", "mf"].includes(gender)) articles.add("de");
    });
    if (articles.size !== 1) return undefined;

    const [article] = articles;
    const resolvedWord = normalizeWord(entry.title);
    const chineseMeanings = extractTranslations(dutchSection, ["zh", "zho", "cmn"]);
    const englishMeanings = extractTranslations(dutchSection, ["en", "eng"]);
    const meaning =
      chineseMeanings.length || englishMeanings.length
        ? {
            ...(chineseMeanings.length ? { zh: chineseMeanings.join("；") } : {}),
            en: englishMeanings.join("; ") || chineseMeanings.join("；"),
          }
        : undefined;

    return {
      article,
      word: resolvedWord,
      meaning,
      sourceUrl: `https://nl.wiktionary.org/wiki/${encodeURIComponent(resolvedWord)}`,
    } as const;
  } catch {
    return undefined;
  }
};

const editDistance = (left: string, right: string) => {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] +
          (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1),
      );
    }
    previous.splice(0, previous.length, ...current);
  }

  return previous[right.length];
};

const lookupDutchTranslations = async (englishWord: string) => {
  if (!/^[a-z][a-z '-]{1,60}$/i.test(englishWord)) return [];

  const exactSearchParams = new URLSearchParams({
    action: "query",
    list: "search",
    srsearch: `insource:"{{trad|en|${englishWord}}}"`,
    srnamespace: "0",
    srlimit: "6",
    format: "json",
    formatversion: "2",
  });
  const broadSearchParams = new URLSearchParams({
    action: "query",
    list: "search",
    srsearch: `insource:"${englishWord}"`,
    srnamespace: "0",
    srlimit: "8",
    format: "json",
    formatversion: "2",
  });

  // English Wiktionary exposes Dutch translations directly. Dutch
  // Wiktionary search runs alongside it as a fallback for entries whose
  // translation template differs from the usual spelling.
  const [englishEntry, exactSearchTitles] = await Promise.all([
    fetchWiktionaryWikitext(englishWord, ENGLISH_WIKTIONARY_API),
    fetchWiktionarySearchTitles(exactSearchParams),
  ]);
  const directCandidates = englishEntry
    ? extractEnglishWiktionaryTranslations(englishEntry.wikitext, "nl")
    : [];
  const primaryTitles = [
    ...new Set([
      ...directCandidates,
      ...exactSearchTitles,
    ].map(normalizeWord)),
  ].slice(0, 12);
  const validateTitles = async (titles: string[]) => {
    const matches = await Promise.all(
      titles.map((title) => lookupWiktionaryArticle(normalizeWord(title))),
    );
    return matches
      .filter((match): match is NonNullable<typeof match> => Boolean(match))
      .sort(
        (left, right) =>
          editDistance(englishWord, left.word) - editDistance(englishWord, right.word),
      );
  };

  const primaryMatches = await validateTitles(primaryTitles);
  if (primaryMatches.length) return primaryMatches;

  // Broad full-text search is intentionally last. It can rescue uncommon
  // template spellings, but only its strongest validated noun is returned so
  // loosely related dictionary pages never appear as translation alternatives.
  const broadSearchTitles = await fetchWiktionarySearchTitles(broadSearchParams);
  const broadMatches = await validateTitles(broadSearchTitles);
  return broadMatches.slice(0, 1);
};

const clueFor = (word: string) => {
  if (/(je|tje|etje|pje|kje)$/.test(word)) {
    return {
      likelyArticle: "het" as const,
      zh: "这个词看起来是 -je 小词；荷兰语小词通常用 het。但目前没有查到可靠词条，请再用其他词典确认。",
      en: "This looks like a diminutive ending in -je. Dutch diminutives usually take het, but no reliable entry was found, so confirm it in another dictionary.",
    };
  }

  if (/(ing|heid|teit|tie|ie|ij)$/.test(word)) {
    return {
      likelyArticle: "de" as const,
      zh: "这个词的词尾通常是 de 的强线索，但不是百分之百规则。目前没有查到可靠词条，请再用其他词典确认。",
      en: "This ending is a strong clue for de, but it is not a 100% rule. No reliable entry was found, so confirm it in another dictionary.",
    };
  }

  if (/(ment|sel|isme)$/.test(word)) {
    return {
      likelyArticle: "het" as const,
      zh: "这个词的词尾常见于 het 词，但不是百分之百规则。目前没有查到可靠词条，请再用其他词典确认。",
      en: "This ending often appears in het-words, but it is not a 100% rule. No reliable entry was found, so confirm it in another dictionary.",
    };
  }

  return undefined;
};

export async function GET(request: NextRequest) {
  const query = normalizeWord(request.nextUrl.searchParams.get("q") ?? "");

  if (!query) {
    return NextResponse.json(
      { error: "missing-query" },
      { status: 400 },
    );
  }

  const exact = nounsBySingular.get(query);
  if (exact) {
    return NextResponse.json({
      status: "found",
      matchedAs: "singular",
      word: exact.dutch,
      article: exact.article,
      plural: exact.plural,
      meaning: exact.meaning,
      level: exact.level,
      source: "course",
    });
  }

  const pluralMatch = nounsByPlural.get(query);
  if (pluralMatch) {
    return NextResponse.json({
      status: "found",
      matchedAs: "plural",
      word: pluralMatch.dutch,
      article: pluralMatch.article,
      plural: pluralMatch.plural,
      meaning: pluralMatch.meaning,
      level: pluralMatch.level,
      source: "course",
    });
  }

  const onlineMatch = await lookupWiktionaryArticle(query);
  if (onlineMatch) {
    const meaningMatch = onlineMatch.meaning
      ? undefined
      : await lookupWordMeaning(onlineMatch.word);
    const dictionaryMeaning = onlineMatch.meaning ??
      (meaningMatch?.status === "found" ? meaningMatch.meaning : undefined);
    const googleMeaning = !dictionaryMeaning?.zh
      ? await translateDutchWordToChinese(onlineMatch.word)
      : undefined;
    const meaning = googleMeaning && dictionaryMeaning
      ? { ...dictionaryMeaning, zh: googleMeaning }
      : googleMeaning
        ? { zh: googleMeaning, en: "" }
      : dictionaryMeaning;
    return NextResponse.json({
      status: "found",
      matchedAs: "singular",
      word: onlineMatch.word,
      article: onlineMatch.article,
      meaning,
      source: "wiktionary",
      sourceUrl: onlineMatch.sourceUrl,
      meaningSourceUrl:
        meaningMatch?.status === "found" && meaningMatch.source === "wiktionary"
          ? meaningMatch.sourceUrl
          : undefined,
      meaningLicense:
        meaningMatch?.status === "found" && meaningMatch.source === "wiktionary"
          ? meaningMatch.license
          : undefined,
    });
  }

  const translatedMatches = await lookupDutchTranslations(query);
  const translatedMatch = translatedMatches[0];
  if (translatedMatch) {
    // The raw query may be English. Only translate the Dutch noun after
    // Wiktionary has resolved and validated it as a Dutch entry.
    const dictionaryMeaning = translatedMatch.meaning ?? { en: query };
    const googleMeaning = !dictionaryMeaning.zh
      ? await translateDutchWordToChinese(translatedMatch.word)
      : undefined;
    const meaning = googleMeaning
      ? { ...dictionaryMeaning, zh: googleMeaning }
      : dictionaryMeaning;

    return NextResponse.json({
      status: "found",
      matchedAs: "singular",
      word: translatedMatch.word,
      article: translatedMatch.article,
      meaning,
      source: "wiktionary",
      sourceUrl: translatedMatch.sourceUrl,
      translatedFrom: query,
      alternatives: translatedMatches.slice(1, 4).map((match) => ({
        word: match.word,
        article: match.article,
      })),
    });
  }

  const clue = clueFor(query);
  return NextResponse.json({
    status: "not-found",
    query,
    clue,
  });
}
