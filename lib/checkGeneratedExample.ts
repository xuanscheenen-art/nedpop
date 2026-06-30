import type { WordItem } from "@/types/vocabulary";
import { inferWordType, verbFormsForWord } from "@/lib/exampleTemplates";
import type { GeneratedExample } from "@/lib/exampleSentenceGenerator";
import { badGenericTargetTemplateIssue, isKnownBadLearnerLine } from "@/lib/exampleQualityRules";

const wordCount = (sentence: string) => sentence.trim().replace(/[.!?]+$/, "").split(/\s+/).filter(Boolean).length;
const lower = (value: string) => value.toLowerCase();
const containsWord = (sentence: string, token: string) => new RegExp(`(^|\\W)${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\W|$)`, "i").test(sentence);
const containsSeparableVerbUse = (sentence: string, token: string) => {
  const lowerToken = token.toLowerCase();
  const separableForms: Record<string, [verbForm: string, particle: string]> = {
    inspreken: ["spreek", "in"],
    opbellen: ["bel", "op"],
    opstaan: ["sta", "op"],
    invullen: ["vul", "in"],
    aanmelden: ["meld", "aan"],
    afmelden: ["meld", "af"],
    aantrekken: ["trek", "aan"],
    uittrekken: ["trek", "uit"],
    terugbrengen: ["breng", "terug"],
    opruimen: ["ruim", "op"],
    schoonmaken: ["maak", "schoon"],
    afwassen: ["was", "af"],
    afdrogen: ["droog", "af"],
    ophangen: ["hang", "op"],
    weggooien: ["gooi", "weg"],
    inpakken: ["pak", "in"],
    uitpakken: ["pak", "uit"],
    aanzetten: ["zet", "aan"],
    uitzetten: ["zet", "uit"],
    aanraken: ["raak", "aan"],
    uitloggen: ["log", "uit"],
    uitnodigen: ["nodig", "uit"],
    afspreken: ["spreek", "af"],
    achterlaten: ["laat", "achter"],
    klaarmaken: ["maak", "klaar"],
    uitschrijven: ["schrijf", "uit"],
    aanvinken: ["vink", "aan"],
    bijvoegen: ["voeg", "bij"],
    doorverwijzen: ["verwijst", "door"],
    innemen: ["neem", "in"],
    opzeggen: ["zeg", "op"],
    thuisblijven: ["blijf", "thuis"],
    omreizen: ["reis", "om"],
    uitstappen: ["stap", "uit"],
    instappen: ["stap", "in"],
    doorsturen: ["stuur", "door"],
    opnemen: ["neem", "op"],
    oplossen: ["los", "op"],
    terugstorten: ["stort", "terug"],
    afhalen: ["haal", "af"],
    afstemmen: ["stem", "af"],
    aanbieden: ["bied", "aan"],
    aanpassen: ["pas", "aan"],
    uitleggen: ["leg", "uit"],
  };
  const form = separableForms[lowerToken];
  if (form) return containsWord(sentence, form[0]) && containsWord(sentence, form[1]);
  return false;
};
const containsVerbUse = (sentence: string, token: string) => {
  const forms = verbFormsForWord(token);
  if (!forms) return false;
  return [forms.infinitive, forms.ik, forms.jij, forms.hij, forms.wij].some((form) => containsWord(sentence, form)) ||
    containsSeparableVerbUse(sentence, forms.infinitive);
};
const generatedMeaningPattern = /词：|word:|自动扩充|generated expansion|需要人工|placeholder|后台|creator/i;
const analyticGlossPattern = /(^|[\s，。])[^，。.!?]{1,20}\s[+＋]\s[^，。.!?]{1,20}/;
const safeStandaloneWords = new Set(["hallo", "dag", "ja", "nee", "sorry", "bedankt", "alsjeblieft", "alstublieft", "dank je", "dank u", "tot ziens", "goedemorgen", "goedenavond", "prima", "oké", "welkom"]);
const weakDitIsNouns = new Set(["adres", "formulier", "rekening", "afspraak", "gemeente", "huisarts", "ziekenhuis", "verzekering", "woning", "huur", "factuur", "document", "brief", "e-mail"]);
const adjectiveEForm = (adjective: string) => {
  const irregular: Record<string, string> = { groot: "grote", oud: "oude", nieuw: "nieuwe", duur: "dure", goedkoop: "goedkope" };
  return irregular[adjective.toLowerCase()] ?? `${adjective}e`;
};

const downgrade = (example: GeneratedExample, issue: string, severe = true): GeneratedExample => ({
  ...example,
  confidence: severe ? "low" : example.confidence === "high" ? "medium" : example.confidence,
  needsHumanReview: true,
  qualityIssues: [...(example.qualityIssues ?? []), issue],
});

export const checkGeneratedExample = (
  example: GeneratedExample,
  word: WordItem,
  context?: { scenarioTags?: string[]; microScenario?: { targetWords: string[] }; dayPack?: { theme?: string } },
): GeneratedExample => {
  let checked: GeneratedExample = { ...example, qualityIssues: [...(example.qualityIssues ?? [])] };
  const sentence = example.dutch.trim();
  const dutch = word.dutch.trim();
  const wordType = inferWordType(word);

  if (!sentence) checked = downgrade(checked, "empty-sentence");
  if (!example.meaningZh.trim()) checked = downgrade(checked, "missing-chinese-meaning");
  if (!example.meaningEn.trim()) checked = downgrade(checked, "missing-english-meaning");
  if (generatedMeaningPattern.test(`${example.meaningZh} ${example.meaningEn}`)) checked = downgrade(checked, "placeholder-meaning");
  if (analyticGlossPattern.test(`${example.meaningZh} ${example.meaningEn}`)) checked = downgrade(checked, "analytic-gloss-meaning");
  if (!example.audioText.trim()) checked = downgrade(checked, "missing-audio-text");

  const forms = verbFormsForWord(word);
  const acceptableTokens = wordType === "verb" && forms
    ? [forms.infinitive, forms.ik, forms.jij, forms.hij, forms.wij]
    : wordType === "adjective"
      ? [dutch, adjectiveEForm(dutch)]
    : [dutch, word.plural ?? ""].filter(Boolean);
  const phrasePartsPresent = wordType === "phrase" && dutch.split(/\s+/).every((token) => containsWord(sentence, token) || containsVerbUse(sentence, token));
  const targetPresent =
    wordType === "number" ||
    ["function-word", "country-name", "day-month", "language-name"].includes(wordType) ||
    phrasePartsPresent ||
    (wordType === "verb" && forms && containsSeparableVerbUse(sentence, forms.infinitive)) ||
    acceptableTokens.some((token) => containsWord(sentence, token));
  if (!targetPresent) checked = downgrade(checked, "target-word-not-present");

  const lowered = lower(sentence);
  if (isKnownBadLearnerLine(sentence)) checked = downgrade(checked, "known-bad-sentence");
  if (/\b(ik|jij|je|u|hij|zij|ze|wij|we|jullie)\s+\1\b/i.test(sentence)) checked = downgrade(checked, "duplicate-subject");
  const genericIssue = badGenericTargetTemplateIssue(word, sentence);
  if (genericIssue) checked = downgrade(checked, genericIssue);
  if (wordType !== "phrase" && sentence.replace(/[.!?]+$/, "").trim().toLowerCase() === lower(word.dutch) && !safeStandaloneWords.has(lower(word.dutch))) {
    checked = downgrade(checked, "bare-word-is-not-example");
  }
  if (wordType === "phrase" && sentence.replace(/[.!?]+$/, "").trim().toLowerCase() === lower(word.dutch) && !safeStandaloneWords.has(lower(word.dutch))) {
    checked = downgrade(checked, "phrase-echo-is-not-example");
  }
  if (/\bde adres\b/i.test(sentence)) checked = downgrade(checked, "wrong-article-de-adres");
  if (/\bhet boeken\b/i.test(sentence)) checked = downgrade(checked, "wrong-plural-article-het-boeken");
  if (lower(word.dutch) === "engels" && /\bengelsen\b/i.test(sentence)) checked = downgrade(checked, "language-name-plural-error");
  if (wordType === "language-name" && /\b(engelsen|nederlanders|chinezen)\b/i.test(sentence)) {
    checked = downgrade(checked, "language-name-people-plural-risk");
  }

  if (wordType === "verb" && forms) {
    if (new RegExp(`^Ik\\s+${forms.infinitive.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(sentence)) {
      checked = downgrade(checked, "verb-infinitive-after-ik");
    }
    if (/^Ik\s+(zijn|hebben|kunnen|willen|moeten|gaan|komen|wonen|werken|leren|kijken|helpen|begrijpen|schrijven)\b/i.test(sentence)) {
      checked = downgrade(checked, "verb-wrong-form-after-ik");
    }
  }

  if (word.article) {
    const wrongArticle = word.article === "het" ? "de" : "het";
    if (containsWord(sentence, `${wrongArticle} ${word.dutch}`)) {
      checked = downgrade(checked, `wrong-article-${wrongArticle}-${word.dutch}`);
    }
  }

  if (/^Dit is\b/i.test(sentence) && weakDitIsNouns.has(lower(word.dutch))) {
    checked = downgrade(checked, "weak-dit-is-template", false);
  }
  if (/^Dit is (de|het)\s+\w+\.?$/i.test(sentence) && example.type !== "contrast") {
    checked = downgrade(checked, "too-generic-dit-is-template");
  }
  if (/^Dit is (de|het|een)\s+\w+\.?$/i.test(sentence) && example.type !== "contrast" && word.level !== "A0") {
    checked = downgrade(checked, "too-generic-dit-is-template");
  }
  if (!example.phraseChunkUsed?.trim() && !["function-word", "phrase", "number"].includes(wordType)) {
    checked = downgrade(checked, "missing-collocation", false);
  }

  if (example.level === "A0") {
    if (wordCount(sentence) > 7) checked = downgrade(checked, "too-long-for-a0", false);
    if (/\b(heeft|hebben)\b.*\b(gekregen|gemaakt|betaald|ingevuld)\b/i.test(sentence)) checked = downgrade(checked, "a0-perfect-tense");
    if (/\b(omdat|terwijl|formulier|gemeente|verzekering|documenten)\b/i.test(lowered)) checked = downgrade(checked, "too-hard-for-a0");
  }

  if (example.level === "A1") {
    if (/\b(gemeente|verzekering|document|formulier|aanvraag|belasting|officieel)\b/i.test(lowered)) {
      checked = downgrade(checked, "too-formal-for-a1", false);
    }
  }

  if (example.level === "A2") {
    if (/\b(maatschappij|beleid|samenleving|complexe|beïnvloedt|abstracte)\b/i.test(lowered)) {
      checked = downgrade(checked, "too-abstract-for-a2");
    }
  }

  const contextTags = [
    ...(context?.scenarioTags ?? []),
    ...(context?.microScenario?.targetWords ?? []),
    ...(context?.dayPack?.theme ? [context.dayPack.theme] : []),
  ].map((tag) => tag.toLowerCase());
  if (contextTags.length) {
    const overlap = example.scenarioTags.some((tag) => contextTags.includes(tag.toLowerCase()));
    if (!overlap && example.type === "scenario") checked = downgrade(checked, "scenario-mismatch", false);
  }

  return checked;
};
