import { wordItems } from "@/data/vocabularyPlan";
import { checkMemoryPathQuality } from "@/lib/checkMemoryPathQuality";
import { generateMemoryPath } from "@/lib/memoryPathEngine";
import { classifyMemoryPathWord } from "@/lib/memoryPathStrategies";
import { hasStaleMemoryPathContent } from "@/lib/memoryPathQualityGate";

const auditLevel = (process.env.MEMORY_AUDIT_LEVEL ?? "A1").toUpperCase();
const auditedWords = wordItems.filter((word) => word.level === auditLevel);
const forbiddenCopy =
  /真实用法落点|常见搭配|动作搭配|开口句|整句触发|先看一句具体话|第一画面里|生活里认出|先用冠词和句子位置|放进句子|先形成具体动作画面|直接想/;

const issueRows: Array<{ word: string; issues: string[] }> = [];
const strategyCounts = new Map<string, number>();

for (const word of auditedWords) {
  const path = generateMemoryPath(word, { allWords: wordItems });
  const issues: string[] = [];
  const expectedType = classifyMemoryPathWord(word);
  const stepText = (path.steps ?? []).map((step) => step.contentZh.trim()).filter(Boolean);
  const fullText = [
    path.titleZh,
    path.explanationZh,
    path.memoryHookZh,
    path.usageAnchorZh,
    path.warningZh,
    ...(path.steps ?? []).flatMap((step) => [step.labelZh, step.contentZh, step.dutchExample]),
  ].filter(Boolean).join(" ");

  const titleZh = path.titleZh ?? "";
  const explanationZh = path.explanationZh ?? "";
  const memoryHookZh = path.memoryHookZh ?? "";
  strategyCounts.set(titleZh, (strategyCounts.get(titleZh) ?? 0) + 1);

  if (!titleZh.trim() || !explanationZh.trim() || !memoryHookZh.trim()) {
    issues.push("empty-core-content");
  }
  if (forbiddenCopy.test(fullText)) issues.push("forbidden-copy");
  if (hasStaleMemoryPathContent(path)) issues.push("stale-content");
  if (path.wordType !== expectedType) issues.push(`type:${path.wordType}->${expectedType}`);
  if (new Set(stepText).size !== stepText.length) issues.push("duplicate-step");
  if (titleZh === "第一生活画面" && path.wordType !== "noun") issues.push("life-scene-not-noun");
  if (titleZh === "动词结构" && path.wordType !== "verb") issues.push("verb-structure-not-verb");
  if (titleZh === "拆词联想" && (!path.breakdown || path.breakdown.parts.length < 2)) {
    issues.push("breakdown-without-parts");
  }

  const checked = checkMemoryPathQuality(path, word);
  for (const issue of checked.issues) issues.push(`quality:${issue}`);

  if (issues.length > 0) {
    issueRows.push({ word: word.dutch, issues: Array.from(new Set(issues)) });
  }
}

const issueCounts = issueRows
  .flatMap((row) => row.issues)
  .reduce<Record<string, number>>((counts, issue) => {
    counts[issue] = (counts[issue] ?? 0) + 1;
    return counts;
  }, {});

console.log(JSON.stringify({
  auditLevel,
  totalWords: auditedWords.length,
  strategyCounts: Object.fromEntries([...strategyCounts.entries()].sort((a, b) => b[1] - a[1])),
  issueCounts,
  issueRows: issueRows.slice(0, 100),
}, null, 2));
