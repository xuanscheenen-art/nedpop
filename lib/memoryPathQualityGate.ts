import type { MemoryPath } from "@/types/vocabulary";

const naturalHookStrategies = new Set<MemoryPath["strategy"]>([
  "word-breakdown",
  "compound-word",
  "word-formation",
  "english-bridge",
  "meaning-contrast",
  "fixed-expression",
]);

const protectedStableStrategies = new Set<MemoryPath["strategy"]>([
  "word-breakdown",
  "compound-word",
  "english-bridge",
]);

const weakFallbackStrategies = new Set<MemoryPath["strategy"]>([
  "phrase-based",
  "sentence-based",
  "no-strong-association",
]);

const targetUseExemptTypes = new Set<MemoryPath["wordType"]>([
  "number",
  "function-word",
  "language-name",
  "country-name",
  "day-month",
]);

const staleTeachingCopyPattern =
  /高智商脑洞|这个词最好通过常用搭配记|先背能直接用的词块|先给这个词一个生活画面|先放进一个真实短句里记|没有更强的拆词、英文桥梁或固定语法|第一次进入脑海的生活画面|动词要带动作画面记|要钉在|再想起荷兰语|固定开口方式|帮助你固定|联想词块|记忆路径生成逻辑|先背这个词|真实短句|开口落点|这个词可以先借英文外形记住|先记.+再看|用「.+」这类自然词块来记|词义和动作\/物体一起出现|先抓住动作对象|看这句里的动作对象|动作开关|小开关|时间、地点或方式开关|Ik zie de (mens|vrouw)|Ik zie het kind|=\s*我看到/i;

const weakOutputLinePatterns = [
  /^(?:De|Het)\s+.+\s+is hier\.?$/i,
  /^Ik vraag naar\s+(?:de|het|een)?\s*.+\.?$/i,
  /^Ik gebruik .+ in een zin\.?$/i,
  /^We bespreken\s+(?:de|het|een|mijn|uw|deze|dit)\b/i,
  /^Ik zie\s+(?:de|het|een|mijn|uw|deze|dit)\b/i,
];

export function memoryPathQualityText(path: MemoryPath) {
  return [
    path.titleZh,
    path.titleEn,
    path.explanationZh,
    path.explanationEn,
    path.memoryHookZh,
    path.memoryHookEn,
    path.usageAnchorZh,
    path.usageAnchorEn,
    path.warningZh,
    path.warningEn,
    path.scenarioAnchor?.zh,
    path.scenarioAnchor?.en,
    path.outputSentence?.dutch,
    path.outputSentence?.meaningZh,
    path.outputSentence?.meaningEn,
    ...(path.outputSentences ?? []).flatMap((sentence) => [sentence.dutch, sentence.meaningZh, sentence.meaningEn]),
    ...(path.phraseChunks ?? []).flatMap((chunk) => [chunk.dutch, chunk.meaningZh, chunk.meaningEn]),
    ...(path.steps ?? []).flatMap((step) => [step.labelZh, step.labelEn, step.contentZh, step.contentEn, step.dutchExample ?? ""]),
  ].filter(Boolean).join("\n");
}

export function hasWeakMemoryPathOutput(path: MemoryPath) {
  const lines = [
    path.outputSentence?.dutch,
    ...(path.outputSentences ?? []).map((sentence) => sentence.dutch),
    ...(path.steps ?? []).map((step) => step.dutchExample),
  ].filter(Boolean);

  return lines.some((line) => weakOutputLinePatterns.some((pattern) => pattern.test(line ?? "")));
}

export function hasStaleMemoryPathContent(path: MemoryPath) {
  return staleTeachingCopyPattern.test(memoryPathQualityText(path)) || hasWeakMemoryPathOutput(path);
}

export function shouldPreferGeneratedMemoryPath(current: MemoryPath, generated: MemoryPath) {
  return current.strategy !== generated.strategy &&
    naturalHookStrategies.has(generated.strategy) &&
    (
      weakFallbackStrategies.has(current.strategy) ||
      (
        generated.strategy === "english-bridge" &&
        current.strategy === "category-rule" &&
        !targetUseExemptTypes.has(generated.wordType)
      )
    );
}

export function shouldUseGeneratedMemoryPath(current: MemoryPath | undefined, generated: MemoryPath) {
  if (!current) return true;
  if (current.wordType !== generated.wordType) return true;

  const currentStale = hasStaleMemoryPathContent(current);
  const generatedStale = hasStaleMemoryPathContent(generated);
  if (currentStale && !generatedStale) return true;
  if (shouldPreferGeneratedMemoryPath(current, generated)) return true;

  if (protectedStableStrategies.has(generated.strategy) && !currentStale) {
    return false;
  }

  return false;
}
