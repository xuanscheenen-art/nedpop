import type { DailyWordPack } from "@/types/vocabulary";
import type { GeneratedExample } from "@/lib/exampleSentenceGenerator";

export type ExampleDiversityIssue = {
  type:
    | "repetitive-template"
    | "too-many-ik-heb"
    | "too-many-dit-is"
    | "missing-collocation"
    | "scenario-mismatch";
  messageZh: string;
  affectedExamples: string[];
  replacementHintZh: string;
};

const opening = (sentence: string) => sentence.trim().split(/\s+/).slice(0, 2).join(" ").toLowerCase();

export const checkExampleDiversity = (
  examples: GeneratedExample[],
  dayPack?: DailyWordPack,
): ExampleDiversityIssue[] => {
  const issues: ExampleDiversityIssue[] = [];
  if (!examples.length) return issues;

  const count = examples.length;
  const ikHeb = examples.filter((example) => /^Ik heb\b/i.test(example.dutch));
  const ditIs = examples.filter((example) => /^Dit is\b/i.test(example.dutch));
  const withoutChunk = examples.filter((example) => !example.phraseChunkUsed);

  if (ikHeb.length / count > 0.25) {
    issues.push({
      type: "too-many-ik-heb",
      messageZh: "同一天 Ik heb... 太多。",
      affectedExamples: ikHeb.map((example) => example.dutch),
      replacementHintZh: "换成 Kunt u..., Waar..., Mijn..., De/Het... 或真实搭配句。",
    });
  }

  if (ditIs.length / count > 0.2) {
    issues.push({
      type: "too-many-dit-is",
      messageZh: "同一天 Dit is... 太多，像机械模板。",
      affectedExamples: ditIs.map((example) => example.dutch),
      replacementHintZh: "优先改成动词搭配：invullen, betalen, maken, vragen, bellen。",
    });
  }

  const openings = new Map<string, string[]>();
  examples.forEach((example) => {
    const key = opening(example.dutch);
    openings.set(key, [...(openings.get(key) ?? []), example.dutch]);
  });
  openings.forEach((items, key) => {
    if (items.length >= 3 && items.length / count > 0.35) {
      issues.push({
        type: "repetitive-template",
        messageZh: `句子开头 ${key} 重复太多。`,
        affectedExamples: items,
        replacementHintZh: "混合 Ik / U / Kunt u / Waar / Wanneer / Welke / Mijn / De/Het。",
      });
    }
  });

  if (withoutChunk.length / count > 0.4) {
    issues.push({
      type: "missing-collocation",
      messageZh: "太多例句没有使用真实短语块或搭配。",
      affectedExamples: withoutChunk.map((example) => example.dutch),
      replacementHintZh: "先补 phrase chunk，再用 phrase chunk 生成例句。",
    });
  }

  if (dayPack) {
    const packTags = new Set([
      dayPack.theme,
      ...dayPack.newWords.flatMap((word) => word.dutch),
      ...dayPack.reviewWords.flatMap((word) => word.dutch),
      ...dayPack.recognitionWords.flatMap((word) => word.dutch),
    ].map((item) => item.toLowerCase()));
    const mismatch = examples.filter((example) => (
      example.type === "scenario" &&
      example.scenarioTags.length > 0 &&
      !example.scenarioTags.some((tag) => packTags.has(tag.toLowerCase()))
    ));
    if (mismatch.length > Math.max(2, count * 0.5)) {
      issues.push({
        type: "scenario-mismatch",
        messageZh: "场景例句和当天词包主题不够贴合。",
        affectedExamples: mismatch.map((example) => example.dutch),
        replacementHintZh: "先生成 Day Pack 微场景，再让例句服务同一个小场景。",
      });
    }
  }

  return issues;
};
