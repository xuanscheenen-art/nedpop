const fs = require("fs");
const path = require("path");
const Module = require("module");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const originalResolveFilename = Module._resolveFilename;

require.extensions[".ts"] = function compileTs(module, filename) {
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filename,
  }).outputText;
  module._compile(output, filename);
};

Module._resolveFilename = function resolveAlias(request, parent, isMain, options) {
  if (request.startsWith("@/")) {
    return originalResolveFilename.call(this, path.join(root, request.slice(2)), parent, isMain, options);
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

const { wordItems } = require("@/data/vocabularyPlan");
const { generateExamplesForWord } = require("@/lib/exampleSentenceGenerator");
const { memoryAssociationsFor } = require("@/lib/wordAssociations");
const { validateVocabularyQuality } = require("@/lib/vocabularyQuality");

const normalize = (value) => value.trim().toLowerCase();
const requestedLevels = String(process.env.AUDIT_LEVELS ?? "B1")
  .split(",")
  .map((level) => level.trim().toUpperCase())
  .filter(Boolean);
const auditAllLevels = requestedLevels.includes("ALL");
const auditedWords = auditAllLevels
  ? wordItems
  : wordItems.filter((word) => requestedLevels.includes(word.originalLevel ?? word.level) || requestedLevels.includes(word.level));
const auditedIds = new Set(auditedWords.map((word) => word.id));
const qualityIssues = validateVocabularyQuality(wordItems).filter((issue) => auditedIds.has(issue.wordId));

const rows = auditedWords.map((word) => {
  const examples = generateExamplesForWord(word).filter((example) => !example.needsHumanReview && example.dutch.trim());
  const phraseChunks = new Set(examples.map((example) => example.phraseChunkUsed).filter(Boolean));
  const associations = memoryAssociationsFor(word, wordItems, 8);
  return {
    dutch: word.dutch,
    examples: examples.length,
    phraseChunks: phraseChunks.size,
    associations: associations.length,
    associationTypes: associations.map((item) => `${item.dutch}:${item.type}`).join(", "),
  };
});

const missingExamples = rows.filter((row) => row.examples === 0);
const missingPhrases = rows.filter((row) => row.phraseChunks === 0);
const missingAssociations = rows.filter((row) => row.associations === 0);
const weakAssociations = rows.filter((row) => row.associations > 0 && !/synonym|opposite|compound|word-family|verb-form|verb-noun-pair|category-member|action-object|state-action/.test(row.associationTypes));

const byIssue = qualityIssues.reduce((acc, issue) => {
  acc[issue.code] = (acc[issue.code] ?? 0) + 1;
  return acc;
}, {});

const focusWords = ["begin", "stop", "beginnen", "stoppen", "eindigen", "aanmelden", "afmelden", "bruto", "netto", "uploaden", "downloaden", "inloggen", "uitloggen"];
const sampleLimit = Number(process.env.AUDIT_LIMIT ?? 12);
const focus = wordItems
  .filter((word) => focusWords.includes(normalize(word.dutch)))
  .map((word) => ({
    dutch: word.dutch,
    level: word.originalLevel,
    examples: generateExamplesForWord(word).slice(0, 3).map((example) => `${example.dutch} [${example.needsHumanReview ? "review" : "ok"}]`),
    associations: memoryAssociationsFor(word, wordItems, 8).map((item) => `${item.dutch}:${item.type}`),
  }));

if (process.env.AUDIT_NAMES_ONLY === "1") {
  console.log(JSON.stringify({
    missingExamples: missingExamples.map((row) => row.dutch),
    missingPhrases: missingPhrases.map((row) => row.dutch),
    missingAssociations: missingAssociations.map((row) => row.dutch),
    weakAssociations: weakAssociations.map((row) => row.dutch),
  }, null, 2));
  process.exit(0);
}

console.log(JSON.stringify({
  auditLevels: auditAllLevels ? "all" : requestedLevels,
  words: auditedWords.length,
  qualityIssues: qualityIssues.length,
  byIssue,
  missingExamples: missingExamples.length,
  missingPhrases: missingPhrases.length,
  missingAssociations: missingAssociations.length,
  weakAssociations: weakAssociations.length,
  samples: {
    missingExamples: missingExamples.slice(0, sampleLimit),
    missingPhrases: missingPhrases.slice(0, sampleLimit),
    missingAssociations: missingAssociations.slice(0, sampleLimit),
    weakAssociations: weakAssociations.slice(0, sampleLimit),
  },
  focus,
}, null, 2));
