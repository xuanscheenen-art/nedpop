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

const fetchWiktionaryWikitext = async (word: string) => {
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

  const data = (await fetchWiktionaryJson(revisionParams)) as
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

  const clue = clueFor(query);
  return NextResponse.json({
    status: "not-found",
    query,
    clue,
  });
}
