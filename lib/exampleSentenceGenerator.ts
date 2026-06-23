import { checkGeneratedExample } from "@/lib/checkGeneratedExample";
import { generateMicroScenarioForDayPack, type MicroScenario } from "@/lib/dayPackMicroScenario";
import {
  collocationsForWord,
  fallbackExamplesForWord,
  inferWordType,
  type ExampleSentenceType,
  type TemplateExample,
  type WordType,
} from "@/lib/exampleTemplates";
import { scenarioExamplesForWord } from "@/lib/scenarioExampleTemplates";
import type { CourseLevel } from "@/types/course";
import type { DailyWordPack, ExampleSentence, WordItem } from "@/types/vocabulary";

export type { ExampleSentenceType, MicroScenario, WordType };

export type GeneratedExample = {
  id: string;
  wordId: string;
  targetWord: string;
  dutch: string;
  meaningZh: string;
  meaningEn: string;
  level: "A0" | "A1" | "A2" | "B1";
  type: ExampleSentenceType;
  templateId?: string;
  phraseChunkUsed?: string;
  microScenarioId?: string;
  scenarioTags: string[];
  grammarFocus?: string;
  audioText: string;
  confidence: "high" | "medium" | "low";
  needsHumanReview: boolean;
  qualityIssues?: string[];
};

type GenerateExamplesContext = {
  dayPack?: DailyWordPack;
  microScenario?: MicroScenario;
  existingExamples?: ExampleSentence[];
};

const toExampleLevel = (level: CourseLevel): GeneratedExample["level"] =>
  level === "B1" ? "B1" : level === "A2" ? "A2" : level === "A1" ? "A1" : "A0";

const normalizeDutch = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[.!?]+$/, "")
    .replace(/\s+/g, " ");

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const maxExamplesFor = (level: GeneratedExample["level"], wordType: WordType) => {
  if (wordType === "number") return 1;
  if (wordType === "language-name") return 3;
  if (level === "A0") return 2;
  if (level === "A1") return 3;
  if (level === "B1") return 5;
  return 4;
};

const typePriorityFor = (level: GeneratedExample["level"], wordType: WordType) => {
  if (wordType === "number") return ["minimal", "scenario", "output", "collocation"];
  if (wordType === "function-word") return ["scenario", "output", "minimal", "collocation"];
  if (wordType === "phrase") return ["minimal", "output", "scenario", "collocation"];
  if (level === "A0") return ["minimal", "output", "collocation", "scenario"];
  if (level === "A1") return ["minimal", "collocation", "scenario", "output"];
  if (level === "B1") return ["scenario", "output", "collocation", "contrast", "minimal"];
  return ["scenario", "collocation", "output", "minimal"];
};

const confidenceRank = (confidence: GeneratedExample["confidence"]) =>
  confidence === "high" ? 0 : confidence === "medium" ? 1 : 2;

const fromTemplateExample = (
  word: WordItem,
  template: TemplateExample,
  index: number,
  options: {
    fallbackLevel: GeneratedExample["level"];
    templateId?: string;
    microScenario?: MicroScenario;
  },
): GeneratedExample => {
  const level = toExampleLevel(template.level ?? word.level ?? options.fallbackLevel);
  const scenarioTags = template.scenarioTags?.length ? template.scenarioTags : word.scenarioTags;
  return {
    id: `${word.id || slug(word.dutch)}-${options.templateId ?? "example"}-${index}-${slug(template.dutch)}`,
    wordId: word.id,
    targetWord: word.dutch,
    dutch: template.dutch,
    meaningZh: template.meaningZh,
    meaningEn: template.meaningEn,
    level,
    type: template.type,
    templateId: options.templateId,
    phraseChunkUsed: template.phraseChunkUsed,
    microScenarioId: options.microScenario?.id,
    scenarioTags,
    grammarFocus: template.grammarFocus,
    audioText: template.dutch,
    confidence: template.confidence ?? "high",
    needsHumanReview: template.needsHumanReview ?? false,
  };
};

const dedupeCandidates = (examples: GeneratedExample[]) => {
  const seen = new Set<string>();
  return examples.filter((example) => {
    const key = normalizeDutch(example.dutch);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const existingUsableKeys = (examples?: ExampleSentence[]) =>
  new Set(
    (examples ?? [])
      .filter((example) => example.meaning.zh.trim() && example.meaning.en.trim() && (example.audioText ?? example.dutch).trim())
      .map((example) => normalizeDutch(example.dutch)),
  );

const sortExamples = (examples: GeneratedExample[], level: GeneratedExample["level"], wordType: WordType) => {
  const priorities = typePriorityFor(level, wordType);
  return [...examples].sort((a, b) => {
    const reviewDiff = Number(a.needsHumanReview) - Number(b.needsHumanReview);
    if (reviewDiff) return reviewDiff;
    const confidenceDiff = confidenceRank(a.confidence) - confidenceRank(b.confidence);
    if (confidenceDiff) return confidenceDiff;
    const aPriority = priorities.includes(a.type) ? priorities.indexOf(a.type) : priorities.length;
    const bPriority = priorities.includes(b.type) ? priorities.indexOf(b.type) : priorities.length;
    return aPriority - bPriority;
  });
};

const fallbackReviewExample = (word: WordItem, level: GeneratedExample["level"]): GeneratedExample => ({
  id: `${word.id || slug(word.dutch)}-manual-review-example`,
  wordId: word.id,
  targetWord: word.dutch,
  dutch: word.dutch,
  meaningZh: word.meaning.zh,
  meaningEn: word.meaning.en,
  level,
  type: "minimal",
  scenarioTags: word.scenarioTags,
  audioText: word.dutch,
  confidence: "low",
  needsHumanReview: true,
  qualityIssues: ["no-natural-template"],
});

export const generatedExampleToExampleSentence = (example: GeneratedExample): ExampleSentence => ({
  dutch: example.dutch,
  meaning: {
    zh: example.meaningZh,
    en: example.meaningEn,
  },
  level: example.level,
  type: example.type,
  targetWord: example.targetWord,
  grammarFocus: example.grammarFocus,
  scenarioTags: example.scenarioTags,
  audioText: example.audioText,
});

export const generateExamplesForWord = (word: WordItem, context: GenerateExamplesContext = {}): GeneratedExample[] => {
  const level = toExampleLevel(word.level);
  const wordType = inferWordType(word);
  const maxExamples = maxExamplesFor(level, wordType);
  if (!maxExamples) return [];

  const microScenario = context.microScenario ?? (context.dayPack ? generateMicroScenarioForDayPack(context.dayPack) : undefined);
  const candidates = dedupeCandidates([
    ...collocationsForWord(word).flatMap((template) =>
      template.examples.map((example, index) =>
        fromTemplateExample(word, example, index, {
          fallbackLevel: level,
          templateId: template.id,
          microScenario,
        }),
      ),
    ),
    ...scenarioExamplesForWord(word, wordType, microScenario).map((example, index) =>
      fromTemplateExample(word, example, index, {
        fallbackLevel: level,
        templateId: microScenario?.id ?? "scenario",
        microScenario,
      }),
    ),
    ...fallbackExamplesForWord(word, wordType).map((example, index) =>
      fromTemplateExample(word, example, index, {
        fallbackLevel: level,
        templateId: "fallback",
        microScenario,
      }),
    ),
  ]);

  const alreadyUsable = existingUsableKeys(context.existingExamples);
  const checked = candidates
    .filter((example) => !alreadyUsable.has(normalizeDutch(example.dutch)))
    .map((example) => checkGeneratedExample(example, word, { microScenario, dayPack: context.dayPack }));

  const usable = checked.filter((example) => example.dutch.trim() && example.meaningZh.trim() && example.meaningEn.trim());
  const sorted = sortExamples(usable.length ? usable : checked, level, wordType);
  if (sorted.length) return sorted.slice(0, maxExamples);

  return [checkGeneratedExample(fallbackReviewExample(word, level), word, { microScenario, dayPack: context.dayPack })];
};
