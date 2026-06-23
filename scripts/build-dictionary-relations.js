#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const Module = require("module");
const ts = require("typescript");

const rootDir = path.resolve(__dirname, "..");
const cachePath = path.join(rootDir, ".cache", "dictionary-relations-cache.json");
const outputPath = path.join(rootDir, "data", "generatedDictionaryRelations.ts");

const oldResolveFilename = Module._resolveFilename;
Module._resolveFilename = function resolveWithAlias(request, parent, isMain, options) {
  if (request.startsWith("@/")) {
    const base = path.join(rootDir, request.slice(2));
    for (const extension of [".ts", ".tsx", ".js", ".jsx"]) {
      try {
        return oldResolveFilename.call(this, `${base}${extension}`, parent, isMain, options);
      } catch {
        // Try the next extension.
      }
    }
    return oldResolveFilename.call(this, base, parent, isMain, options);
  }
  return oldResolveFilename.call(this, request, parent, isMain, options);
};

for (const extension of [".ts", ".tsx"]) {
  require.extensions[extension] = (module, filename) => {
    const source = fs.readFileSync(filename, "utf8");
    const output = ts.transpileModule(source, {
      compilerOptions: {
        esModuleInterop: true,
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
      fileName: filename,
    }).outputText;
    module._compile(output, filename);
  };
}

const { wordItems } = require("@/data/vocabularyPlan");
const { relationLexicons } = require("@/data/relationLexicons");
const { inferWordType } = require("@/lib/exampleTemplates");

const normalize = (value) =>
  String(value ?? "")
    .normalize("NFC")
    .trim()
    .toLowerCase()
    .replace(/^(de|het|een)\s+/i, "")
    .replace(/[.!?]+$/g, "")
    .replace(/\s+/g, " ");

const stripHtml = (value) =>
  decodeEntities(String(value ?? "").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();

function decodeEntities(value) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&eacute;/g, "é")
    .replace(/&euml;/g, "ë")
    .replace(/&iuml;/g, "ï")
    .replace(/&oacute;/g, "ó")
    .replace(/&uuml;/g, "ü")
    .replace(/&Eacute;/g, "É")
    .replace(/&Euml;/g, "Ë")
    .replace(/&Iuml;/g, "Ï")
    .replace(/&Oacute;/g, "Ó")
    .replace(/&Uuml;/g, "Ü")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

const stopwords = new Set([
  "aan",
  "af",
  "al",
  "als",
  "ben",
  "bij",
  "daar",
  "dan",
  "dat",
  "de",
  "deze",
  "die",
  "dit",
  "doe",
  "door",
  "een",
  "en",
  "er",
  "ga",
  "geef",
  "geen",
  "heb",
  "hebben",
  "heen",
  "het",
  "hier",
  "hoe",
  "hun",
  "ik",
  "in",
  "is",
  "ja",
  "jij",
  "jou",
  "jouw",
  "jullie",
  "kan",
  "kun",
  "laat",
  "leg",
  "maak",
  "maar",
  "me",
  "met",
  "mij",
  "mijn",
  "naar",
  "nee",
  "niet",
  "nu",
  "of",
  "om",
  "ons",
  "onze",
  "op",
  "over",
  "te",
  "tegen",
  "tot",
  "u",
  "uit",
  "uw",
  "van",
  "voor",
  "waar",
  "wat",
  "we",
  "wel",
  "wie",
  "wij",
  "wil",
  "worden",
  "ze",
  "zeg",
  "zet",
  "zie",
  "zij",
  "zijn",
  "zit",
  "zo",
]);

const wrongSectionWords = new Set([
  "afkorting",
  "afkortingen",
  "ander",
  "andere",
  "betekenis",
  "betekenissen",
  "bijwoord",
  "definitie",
  "definities",
  "engels",
  "frans",
  "informatie",
  "meervoud",
  "nederlands",
  "naamwoord",
  "spreekwoord",
  "spreekwoorden",
  "synoniem",
  "synoniemen",
  "uitdrukking",
  "uitdrukkingen",
  "vertaling",
  "vertalingen",
  "vervoeging",
  "vervoegingen",
  "woord",
  "woorden",
]);

const vocabularyEntries = new Map();
const vocabularyItemsByKey = new Map();
for (const word of wordItems) {
  const key = normalize(word.dutch);
  if (!key || key.includes(" ") || /[.!?]/.test(key)) continue;
  if (!vocabularyEntries.has(key)) vocabularyEntries.set(key, word.dutch);
  if (!vocabularyItemsByKey.has(key)) vocabularyItemsByKey.set(key, word);
}

const baseMorphemeEntries = new Map(
  Object.keys(relationLexicons.baseMorphemes).map((word) => [normalize(word), word]),
);

const validTargets = new Set([...vocabularyEntries.keys(), ...baseMorphemeEntries.keys()]);

const genericMeaningTokens = new Set([
  "a",
  "an",
  "and",
  "be",
  "for",
  "from",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with",
  "word",
  "words",
  "thing",
  "things",
  "person",
  "people",
  "place",
  "places",
  "one",
  "someone",
  "something",
  "used",
  "use",
  "formal",
  "informal",
  "common",
  "daily",
  "related",
]);

const unsafeDictionarySourceTypes = new Set([
  "function-word",
  "number",
  "day-month",
  "country-name",
  "language-name",
  "phrase",
]);

function meaningForKey(key) {
  const item = vocabularyItemsByKey.get(key);
  const base = relationLexicons.baseMorphemes[key];
  return {
    zh: item?.meaning?.zh ?? base?.zh ?? "",
    en: item?.meaning?.en ?? base?.en ?? "",
  };
}

function wordTypeForKey(key) {
  const item = vocabularyItemsByKey.get(key);
  if (!item) return undefined;
  return inferWordType(item);
}

function stemToken(token) {
  return token
    .replace(/(?:ing|tion|sion|ment|ness|able|ible|ally|ly|ed|es|s)$/i, "")
    .replace(/(?:en)$/i, "");
}

function meaningTokens(value) {
  return Array.from(new Set(
    String(value ?? "")
      .toLowerCase()
      .normalize("NFC")
      .replace(/[^a-zà-ÿ0-9]+/gi, " ")
      .split(/\s+/)
      .map((token) => stemToken(token.trim()))
      .filter((token) => token.length >= 3 && !genericMeaningTokens.has(token)),
  ));
}

function zhTokens(value) {
  return Array.from(new Set(
    String(value ?? "")
      .replace(/[a-zA-Z0-9/().,;:!?·\s-]+/g, "")
      .split("")
      .filter((token) => token.trim() && !["的", "了", "和", "或", "是", "个", "一", "人", "事", "用"].includes(token)),
  ));
}

function hasMeaningOverlap(sourceKey, targetKey) {
  const sourceMeaning = meaningForKey(sourceKey);
  const targetMeaning = meaningForKey(targetKey);
  const sourceEn = new Set(meaningTokens(sourceMeaning.en));
  const targetEn = new Set(meaningTokens(targetMeaning.en));
  const sourceZhTokens = zhTokens(sourceMeaning.zh);
  const targetZhTokens = zhTokens(targetMeaning.zh);
  const sourceZh = new Set(sourceZhTokens);
  const targetZh = new Set(targetZhTokens);

  if ([...sourceEn].some((token) => targetEn.has(token))) return true;

  const sourceText = `${sourceMeaning.zh} ${sourceMeaning.en}`.toLowerCase();
  const targetText = `${targetMeaning.zh} ${targetMeaning.en}`.toLowerCase();
  const sourceKeyPlain = sourceKey.replace(/-/g, " ");
  const targetKeyPlain = targetKey.replace(/-/g, " ");
  const sourceZhText = String(sourceMeaning.zh ?? "").replace(/\s+/g, "");
  const targetZhText = String(targetMeaning.zh ?? "").replace(/\s+/g, "");
  const zhOverlapCount = sourceZhTokens.filter((token) => targetZh.has(token)).length;
  const hasStrongZhOverlap =
    (sourceZhText.length >= 2 && targetZhText.includes(sourceZhText)) ||
    (targetZhText.length >= 2 && sourceZhText.includes(targetZhText)) ||
    zhOverlapCount >= 2;

  return hasStrongZhOverlap || sourceText.includes(targetKeyPlain) || targetText.includes(sourceKeyPlain);
}

function hasCompatibleWordType(sourceKey, targetKey, relationKind) {
  const sourceType = wordTypeForKey(sourceKey);
  const targetType = wordTypeForKey(targetKey);
  if (!sourceType || !targetType) return true;
  if (unsafeDictionarySourceTypes.has(sourceType) || unsafeDictionarySourceTypes.has(targetType)) return false;
  if (sourceType === targetType) return true;
  if (relationKind === "opposite" && sourceType === "adverb" && targetType === "adjective") return true;
  if (relationKind === "opposite" && sourceType === "adjective" && targetType === "adverb") return true;
  return false;
}

function passesSenseGuard(sourceKey, targetKey, relationKind) {
  if (!hasCompatibleWordType(sourceKey, targetKey, relationKind)) return false;
  if (relationKind === "opposite") return true;
  return hasMeaningOverlap(sourceKey, targetKey);
}

function displayFor(key) {
  return vocabularyEntries.get(key) ?? baseMorphemeEntries.get(key) ?? key;
}

function shouldFetch(key) {
  if (!key || key.length < 3) return false;
  if (key.includes(" ")) return false;
  if (/^\d+$/.test(key)) return false;
  if (stopwords.has(key)) return false;
  const type = wordTypeForKey(key);
  if (type && unsafeDictionarySourceTypes.has(type)) return false;
  return true;
}

function looksLikeTerm(value) {
  const key = normalize(value);
  if (!key || key.length < 3) return false;
  if (key.length > 32) return false;
  if (key.includes(" ")) return false;
  if (/[/\\()[\]{}:;!?.,]/.test(key)) return false;
  if (/^\d+$/.test(key)) return false;
  if (stopwords.has(key) || wrongSectionWords.has(key)) return false;
  return /^[a-zà-ÿ0-9-]+$/i.test(key);
}

function isValidRelationTerm(sourceKey, targetValue, relationKind) {
  const targetKey = normalize(targetValue);
  if (!looksLikeTerm(targetKey)) return false;
  if (sourceKey === targetKey) return false;
  if (!validTargets.has(targetKey)) return false;
  if (wrongSectionWords.has(targetKey)) return false;
  if (!passesSenseGuard(sourceKey, targetKey, relationKind)) return false;
  return true;
}

function between(value, startPattern, endPattern) {
  const start = value.indexOf(startPattern);
  if (start < 0) return "";
  const bodyStart = start + startPattern.length;
  const end = value.indexOf(endPattern, bodyStart);
  return value.slice(bodyStart, end < 0 ? undefined : end);
}

function anchorTexts(html) {
  const result = [];
  const pattern = /<a\b[^>]*>(.*?)<\/a>/gis;
  let match;
  while ((match = pattern.exec(html))) {
    const term = stripHtml(match[1]);
    if (looksLikeTerm(term)) result.push(normalize(term));
  }
  return result;
}

function parseSynoniemenNet(html) {
  const direct = between(html, '<dl class="alstrefwoordtabel">', "</dl>");
  const reverse = between(html, '<dl class="alssynoniemtabel">', "</dl>");
  const directTerms = anchorTexts(direct);
  const reverseHeads = [];
  const headPattern = /<dt\b[^>]*>\s*<strong>\s*<a\b[^>]*>(.*?)<\/a>\s*<\/strong>/gis;
  let match;
  while ((match = headPattern.exec(reverse))) {
    const term = stripHtml(match[1]);
    if (looksLikeTerm(term)) reverseHeads.push(normalize(term));
  }
  return {
    synonyms: Array.from(new Set([...directTerms, ...reverseHeads])),
    opposites: [],
  };
}

function parseWoordenOrg(html) {
  const synonyms = new Set();
  const opposites = new Set();
  const synonymBlock = between(html, "<div class=divider>Synoniemen</div>", "<br><br><div class=divider>");
  anchorTexts(synonymBlock).forEach((term) => synonyms.add(term));

  const rowPattern = /<tr>\s*<td[^>]*>\s*(Synoniem(?:en)?|Antoniem(?:en)?|Tegenstelling(?:en)?)\s*:?(?:&nbsp;)*\s*<\/td>\s*<td[^>]*>(.*?)<\/td>\s*<\/tr>/gis;
  let match;
  while ((match = rowPattern.exec(html))) {
    const label = stripHtml(match[1]).toLowerCase();
    const terms = anchorTexts(match[2]);
    if (label.startsWith("synoniem")) {
      terms.forEach((term) => synonyms.add(term));
    } else {
      terms.forEach((term) => opposites.add(term));
    }
  }

  return {
    synonyms: Array.from(synonyms),
    opposites: Array.from(opposites),
  };
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "NedPop vocabulary relation builder (educational project)",
      },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchRelationsForWord(word) {
  const encoded = encodeURIComponent(word);
  const enabledSources = new Set(
    (process.env.DICTIONARY_SOURCES ?? "woorden,synoniemen")
      .split(",")
      .map((source) => source.trim().toLowerCase())
      .filter(Boolean),
  );
  const sources = [];
  const synonyms = new Set();
  const opposites = new Set();

  if (enabledSources.has("synoniemen") || enabledSources.has("synoniemen.net")) {
    try {
      const html = await fetchText(`https://synoniemen.net/index.php?zoekterm=${encoded}`);
      const parsed = parseSynoniemenNet(html);
      parsed.synonyms.forEach((term) => synonyms.add(term));
      parsed.opposites.forEach((term) => opposites.add(term));
      if (parsed.synonyms.length || parsed.opposites.length) sources.push(`https://synoniemen.net/index.php?zoekterm=${encoded}`);
    } catch (error) {
      process.stderr.write(`synoniemen.net failed for ${word}: ${error.message}\n`);
    }
  }

  if (enabledSources.has("woorden") || enabledSources.has("woorden.org")) {
    try {
      const html = await fetchText(`https://www.woorden.org/woord/${encoded}`);
      const parsed = parseWoordenOrg(html);
      parsed.synonyms.forEach((term) => synonyms.add(term));
      parsed.opposites.forEach((term) => opposites.add(term));
      if (parsed.synonyms.length || parsed.opposites.length) sources.push(`https://www.woorden.org/woord/${encoded}`);
    } catch (error) {
      process.stderr.write(`woorden.org failed for ${word}: ${error.message}\n`);
    }
  }

  return {
    synonyms: Array.from(synonyms),
    opposites: Array.from(opposites),
    sources,
    fetchedAt: new Date().toISOString(),
  };
}

function readCache() {
  try {
    return JSON.parse(fs.readFileSync(cachePath, "utf8"));
  } catch {
    return {};
  }
}

function writeCache(cache) {
  fs.mkdirSync(path.dirname(cachePath), { recursive: true });
  fs.writeFileSync(cachePath, `${JSON.stringify(cache, null, 2)}\n`);
}

function uniquePairKey(a, b) {
  return [normalize(a), normalize(b)].sort().join("|");
}

function relationPair(sourceKey, targetKey) {
  return [displayFor(sourceKey), displayFor(targetKey)];
}

function stablePairs(pairs) {
  return Array.from(pairs.values()).sort((a, b) => {
    const left = `${normalize(a[0])}|${normalize(a[1])}`;
    const right = `${normalize(b[0])}|${normalize(b[1])}`;
    return left.localeCompare(right, "nl");
  });
}

function tsString(value) {
  return JSON.stringify(value);
}

function renderArray(name, pairs) {
  const body = pairs.map((pair) => `  [${tsString(pair[0])}, ${tsString(pair[1])}],`).join("\n");
  return `export const ${name} = [\n${body}\n] as const;\n`;
}

function renderSources(sources) {
  const entries = Object.entries(sources)
    .sort(([a], [b]) => a.localeCompare(b, "nl"))
    .map(([key, values]) => `  ${tsString(key)}: [${values.map(tsString).join(", ")}],`)
    .join("\n");
  return `export const dictionaryRelationSources = {\n${entries}\n} as const;\n`;
}

async function runWithConcurrency(items, limit, worker) {
  let index = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (index < items.length) {
      const current = items[index];
      index += 1;
      await worker(current);
      await new Promise((resolve) => setTimeout(resolve, Number(process.env.REQUEST_DELAY_MS || 80)));
    }
  });
  await Promise.all(workers);
}

function dictionarySourceLabel() {
  const value = process.env.DICTIONARY_SOURCES ?? "woorden,synoniemen";
  return value
    .split(",")
    .map((source) => source.trim())
    .filter(Boolean)
    .join(" and ");
}

async function main() {
  const cache = readCache();
  const sourceWords = Array.from(vocabularyEntries.keys())
    .filter(shouldFetch)
    .sort((a, b) => a.localeCompare(b, "nl"));
  const maxWords = Number(process.env.MAX_WORDS || sourceWords.length);
  const wordsToFetch = sourceWords.slice(0, maxWords);

  let fetched = 0;
  await runWithConcurrency(wordsToFetch, Number(process.env.CONCURRENCY || 4), async (key) => {
    if (!cache[key]) {
      cache[key] = await fetchRelationsForWord(displayFor(key));
      fetched += 1;
      if (fetched % 25 === 0) {
        writeCache(cache);
        process.stdout.write(`fetched ${fetched} new dictionary entries\n`);
      }
    }
  });
  writeCache(cache);

  const synonymPairs = new Map();
  const oppositePairs = new Map();
  const relationSources = {};

  for (const sourceKey of sourceWords) {
    const record = cache[sourceKey];
    if (!record) continue;

    for (const target of record.synonyms ?? []) {
      const targetKey = normalize(target);
      if (!isValidRelationTerm(sourceKey, targetKey, "synonym")) continue;
      const key = uniquePairKey(sourceKey, targetKey);
      synonymPairs.set(key, relationPair(sourceKey, targetKey));
      relationSources[key] = Array.from(new Set([...(relationSources[key] ?? []), ...(record.sources ?? []).filter((source) => /^https?:\/\//.test(source))]));
    }

    for (const target of record.opposites ?? []) {
      const targetKey = normalize(target);
      if (!isValidRelationTerm(sourceKey, targetKey, "opposite")) continue;
      const key = uniquePairKey(sourceKey, targetKey);
      oppositePairs.set(key, relationPair(sourceKey, targetKey));
      relationSources[key] = Array.from(new Set([...(relationSources[key] ?? []), ...(record.sources ?? []).filter((source) => /^https?:\/\//.test(source))]));
    }
  }

  const synonyms = stablePairs(synonymPairs);
  const opposites = stablePairs(oppositePairs);
  const output = [
    "// Auto-generated by scripts/build-dictionary-relations.js.",
    "// Do not edit by hand; update the builder and regenerate.",
    `// Generated at ${new Date().toISOString()} from ${dictionarySourceLabel()}.`,
    `// Source words checked: ${wordsToFetch.length}; synonym pairs: ${synonyms.length}; opposite pairs: ${opposites.length}.`,
    "",
    renderArray("dictionarySynonymGroups", synonyms),
    renderArray("dictionaryOppositePairs", opposites),
    renderSources(relationSources),
  ].join("\n");

  fs.writeFileSync(outputPath, output);
  process.stdout.write(`wrote ${path.relative(rootDir, outputPath)}\n`);
  process.stdout.write(`source words checked: ${wordsToFetch.length}\n`);
  process.stdout.write(`synonym pairs: ${synonyms.length}\n`);
  process.stdout.write(`opposite pairs: ${opposites.length}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
