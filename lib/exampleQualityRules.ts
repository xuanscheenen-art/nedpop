import type { WordItem } from "@/types/vocabulary";

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const norm = (value: string) => value.trim().toLowerCase();

const allowedSearchNouns = new Set(["station", "halte", "perron", "uitgang", "balie"]);

const allowedNaarPlaces = new Set([
  "school",
  "werk",
  "huis",
  "supermarkt",
  "station",
  "halte",
  "perron",
  "gemeente",
  "dokter",
  "huisarts",
  "ziekenhuis",
  "tandarts",
  "apotheek",
  "balie",
  "winkel",
  "centrum",
  "bibliotheek",
  "park",
  "restaurant",
  "café",
  "postkantoor",
  "gemeentehuis",
  "politiebureau",
  "bioscoop",
  "museum",
  "zwembad",
  "sportschool",
  "kerk",
  "moskee",
  "toilet",
  "parkeerplaats",
  "fietsenstalling",
  "stationingang",
  "halteplaats",
  "wachtruimte",
  "servicepunt",
  "informatiebalie",
  "klantenservice",
  "klantenbalie",
  "pakketpunt",
  "den haag",
  "amsterdam",
  "rotterdam",
  "utrecht",
]);

const allowedLookNouns = new Set(["bord", "voorbeeld", "foto", "kaart", "scherm"]);

const allowedDiscussHealthNouns = new Set([
  "klacht",
  "pijn",
  "symptoom",
  "koorts",
  "medicijn",
  "bijwerking",
  "allergie",
  "behandeling",
  "advies",
]);

const weakQuestionTags = new Set(["time", "routine", "family", "body", "health", "school", "work"]);

const weakQuestionWords = new Set([
  "ochtend",
  "namiddag",
  "nacht",
  "middernacht",
  "middagpauze",
  "werkdag",
  "feestdag",
  "verjaardag",
  "kalender",
  "dokter",
  "rust",
  "arm",
  "been",
  "hoofd",
  "buik",
  "oom",
  "tante",
  "neef",
  "nicht",
  "kleinkind",
]);

const broadGenericQuestionPattern = /^Ik heb een vraag over(?:\s+(?:de|het|een|mijn|uw))?\s+.+\.?$/i;
const bodyPartWordsPattern = "(arm|been|hoofd|buik|hand|voet|rug|keel|oor|neus|mond|tand|schouder|knie|nek)";
const symptomWordsPattern = "(verkouden|hoesten|hoofdpijn|buikpijn|keelpijn|koorts|duizelig|misselijk|moe|benauwd)";
const badAdminWordsPattern = "(salaris|loonstrook|proeftijd|afwezigheid|herinnering|waterrekening|herstel|verlof|uitzendbureau)";

const knownBadLearnerLinePatterns = [
  /\b(ik|jij|je|u|hij|zij|ze|wij|we|jullie)\s+\1\b/i,
  /^(de|het|een)\s+[a-zA-ZÀ-ÿ'’-]+\.?$/i,
  /^(mijn|jouw|uw|zijn|haar|ons|onze)\s+(?!.*\b(is|ben|bent|zijn|heb|hebt|heeft|wil|wilt|kan|kunt|moet|ga|gaat|kom|komt|werk|werkt|leer|leert)\b)[a-zA-ZÀ-ÿ'’-]+(?:\s+[a-zA-ZÀ-ÿ'’-]+)?\s+[a-zA-ZÀ-ÿ]+en\.?$/i,
  /^Ik werken\.$/i,
  /^Ik zijn\.$/i,
  /^Ik nodig help\.$/i,
  /^Kunt u mij hulp\??$/i,
  /^Ik heb een afspraak\.$/i,
  /^Ik ben een afspraak\.$/i,
  /^Ik zie de minuut\.$/i,
  /^Ik zeg heet\.$/i,
  /^Ik ga naar (uit|hier|daar)\.?$/i,
  /^Ik kijk naar laatst\.?$/i,
  new RegExp(`^Ik ga naar ((de|het)\\s+)?${bodyPartWordsPattern}\\.?$`, "i"),
  new RegExp(`^Ik ga naar\\s+${symptomWordsPattern}\\.?$`, "i"),
  new RegExp(`^Ik gebruik ((de|het)\\s+)?${bodyPartWordsPattern}\\.?$`, "i"),
  new RegExp(`^Ik heb (de|het)\\s+${bodyPartWordsPattern} nodig\\.?$`, "i"),
  new RegExp(`^Waar is ((de|het)\\s+)?${bodyPartWordsPattern}\\??$`, "i"),
  new RegExp(`^Ik zoek ((de|het|een)\\s+)?${badAdminWordsPattern}\\.?$`, "i"),
  new RegExp(`^Ik ga naar\\s+${badAdminWordsPattern}\\.?$`, "i"),
  /^Ik zeg (heet|heb|ben|wel|geen|wanneer|waar|wat|wie|hoe)\.?$/i,
  /^Spreek jij de supermarkt\?$/i,
  /^Ik spreek geen water\.$/i,
  /^Het is tegenover een afspraak\.$/i,
  /^Dit is (heet|ben|heb|wil|kan|dit|dat|dag)\.?$/i,
  /^Dit is (de|het)\s+[a-zA-ZÀ-ÿ-]+\.?$/i,
  /^Ik (ben|heb|wil|kan)\.?$/i,
];

export type GenericTargetTemplateIssue =
  | "generic-ik-zoek-template"
  | "generic-de-het-nodig-template"
  | "generic-naar-template"
  | "article-only-not-example"
  | "known-bad-sentence"
  | "generic-ik-kijk-naar-template"
  | "generic-health-discuss-template"
  | "generic-work-discuss-template"
  | "weak-generic-question-template";

export function badGenericTargetTemplateIssue(word: WordItem, sentence: string): GenericTargetTemplateIssue | undefined {
  const lowerWord = norm(word.dutch);
  const target = escapeRegExp(word.dutch);
  const articleTarget = `(de|het|een)\\s+${target}`;
  const tags = [word.theme, ...word.scenarioTags].map(norm);

  if (new RegExp(`^Ik zoek\\s+(de|het|een)?\\s*${target}\\.?$`, "i").test(sentence)) {
    return allowedSearchNouns.has(lowerWord) ? undefined : "generic-ik-zoek-template";
  }
  if (new RegExp(`^Ik heb\\s+(de|het)\\s+${target}\\s+nodig\\.?$`, "i").test(sentence)) {
    return "generic-de-het-nodig-template";
  }
  if (new RegExp(`^Ik ga naar\\s+(de|het)?\\s*${target}\\.?$`, "i").test(sentence)) {
    return allowedNaarPlaces.has(lowerWord) ? undefined : "generic-naar-template";
  }
  if (word.article && new RegExp(`^${articleTarget}\\.?$`, "i").test(sentence)) {
    return "article-only-not-example";
  }
  if (/^Ik kijk naar laatst\.?$/i.test(sentence)) {
    return "known-bad-sentence";
  }
  if (/\b(ik|jij|je|u|hij|zij|ze|wij|we|jullie)\s+\1\b/i.test(sentence)) {
    return "known-bad-sentence";
  }
  if (/^(de|het|een)\s+[a-zA-ZÀ-ÿ'’-]+\.?$/i.test(sentence)) {
    return "article-only-not-example";
  }
  if (new RegExp(`^Ik kijk naar\\s+${articleTarget}\\.?$`, "i").test(sentence)) {
    return allowedLookNouns.has(lowerWord) ? undefined : "generic-ik-kijk-naar-template";
  }
  if (new RegExp(`^Ik bespreek\\s+${articleTarget}\\s+met de huisarts\\.?$`, "i").test(sentence)) {
    return allowedDiscussHealthNouns.has(lowerWord) ? undefined : "generic-health-discuss-template";
  }
  if (new RegExp(`^Ik bespreek\\s+${articleTarget}\\s+op het werk\\.?$`, "i").test(sentence)) {
    return "generic-work-discuss-template";
  }
  if (new RegExp(`^Ik heb een vraag over\\s+${articleTarget}\\.?$`, "i").test(sentence)) {
    return weakQuestionWords.has(lowerWord) || tags.some((tag) => weakQuestionTags.has(tag))
      ? "weak-generic-question-template"
      : undefined;
  }

  return undefined;
}

export const isBadGenericTargetTemplate = (word: WordItem, sentence: string) =>
  Boolean(badGenericTargetTemplateIssue(word, sentence));

export const isBroadGenericQuestionTemplate = (sentence: string) =>
  broadGenericQuestionPattern.test(sentence.trim());

export const isKnownBadLearnerLine = (sentence: string) =>
  knownBadLearnerLinePatterns.some((pattern) => pattern.test(sentence.trim()));
