import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");

const source = readFileSync("data/dutchSyllabus.ts", "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    esModuleInterop: true,
  },
}).outputText;

const sandbox = { exports: {}, require };
vm.runInNewContext(compiled, sandbox, { filename: "data/dutchSyllabus.ts" });

const { dutchSyllabus, dutchSyllabusNote, dutchSoundBase } = sandbox.exports;

const countOutput = (level, type) => level.scenarioTasks.filter((task) => task.outputType.includes(type)).length;
const uniqueWords = (level) => [...new Set(level.vocabularyThemes.flatMap((theme) => theme.coreWords.map((word) => word.dutch)))];
const wordCount = (level) => uniqueWords(level).length;
const list = (items) => items.length ? items.map((item) => `- ${item}`).join("\n") : "- None";

const warnings = [];
for (const level of dutchSyllabus.filter((item) => ["A0", "A1", "A2"].includes(item.level))) {
  const words = wordCount(level);
  if (level.level === "A0" && words < 100) warnings.push("A0 has fewer than 100 unique core words.");
  if (level.level === "A1" && words < 220) warnings.push("A1 has fewer than 220 unique core words.");
  if (level.level === "A2" && words < 260) warnings.push("A2 has fewer than 260 unique core words.");
  if (level.level === "A0" && level.sentencePatterns.length < 30) warnings.push("A0 has fewer than 30 sentence patterns.");
  if (level.level === "A1" && level.sentencePatterns.length < 60) warnings.push("A1 has fewer than 60 sentence patterns.");
  if (level.level === "A2" && level.sentencePatterns.length < 80) warnings.push("A2 has fewer than 80 sentence patterns.");
  if (level.level === "A0" && level.grammarPoints.length < 12) warnings.push("A0 has fewer than 12 grammar points.");
  if (level.level === "A1" && level.grammarPoints.length < 20) warnings.push("A1 has fewer than 20 grammar points.");
  if (level.level === "A2" && level.grammarPoints.length < 25) warnings.push("A2 has fewer than 25 grammar points.");
  if (level.level === "A0" && level.pronunciationPoints.length < 15) warnings.push("A0 has fewer than 15 pronunciation points.");
  if (level.level === "A1" && level.pronunciationPoints.length < 12) warnings.push("A1 has fewer than 12 pronunciation reinforcement points.");
  if (level.level === "A2" && level.pronunciationPoints.length < 12) warnings.push("A2 has fewer than 12 pronunciation reinforcement points.");
  if (level.level === "A0" && level.scenarioTasks.length < 12) warnings.push("A0 has fewer than 12 scenario tasks.");
  if (level.level === "A1" && level.scenarioTasks.length < 18) warnings.push("A1 has fewer than 18 scenario tasks.");
  if (level.level === "A2" && level.scenarioTasks.length < 25) warnings.push("A2 has fewer than 25 scenario tasks.");
}

const a0Text = JSON.stringify(dutchSyllabus.find((item) => item.level === "A0"));
if (/heb gekregen|heb gemaakt|heb gebeld|heb gestuurd|perfect tense|volgens mij|met vriendelijke groet|naar aanleiding|standpunt|onderzoek/i.test(a0Text)) {
  warnings.push("A0 may contain perfect tense, long email formulas, or abstract/formal content; inspect manually.");
}
const a1Text = JSON.stringify(dutchSyllabus.find((item) => item.level === "A1"));
if (/naar aanleiding|standpunt|onderzoek|daarentegen|samenvattend/i.test(a1Text)) {
  warnings.push("A1 may contain B1/B2-style formal phrases; inspect manually.");
}
const a2Text = JSON.stringify(dutchSyllabus.find((item) => item.level === "A2"));
if (/beleid|abstract|nominalisatie|maatschappij|standpunt/i.test(a2Text)) {
  warnings.push("A2 may contain abstract vocabulary; inspect manually.");
}

let markdown = `# NedPop Dutch Syllabus Data Report

Source inspected: \`data/dutchSyllabus.ts\`

Scope: This report inspects the current syllabus data after the curriculum correction. It does not present official CEFR or exam material.

Note: ${dutchSyllabusNote.zh}

## Sound Base

${dutchSoundBase.title.zh} / ${dutchSoundBase.title.en}

${dutchSoundBase.goal.zh}

${dutchSoundBase.modules.map((module) => `- ${module.title.zh} / ${module.title.en}: ${module.items.join(", ")}`).join("\n")}

## Summary Counts

| Level | Vocabulary themes | Unique core vocabulary items | Sentence patterns | Grammar points | Pronunciation points | Scenario tasks | Speaking tasks | Writing tasks | Reading task types | Listening task types |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
${dutchSyllabus.map((level) => `| ${level.level} | ${level.vocabularyThemes.length} | ${wordCount(level)} | ${level.sentencePatterns.length} | ${level.grammarPoints.length} | ${level.pronunciationPoints.length} | ${level.scenarioTasks.length} | ${countOutput(level, "speaking")} | ${countOutput(level, "writing")} | ${level.readingTaskTypes.length} | ${level.listeningTaskTypes.length} |`).join("\n")}

`;

for (const level of dutchSyllabus) {
  markdown += `## ${level.level}

### Counts

- Vocabulary themes: ${level.vocabularyThemes.length}
- Unique core vocabulary items: ${wordCount(level)}
- Sentence patterns: ${level.sentencePatterns.length}
- Grammar points: ${level.grammarPoints.length}
- Pronunciation points: ${level.pronunciationPoints.length}
- Scenario tasks: ${level.scenarioTasks.length}
- Speaking tasks: ${countOutput(level, "speaking")}
- Writing tasks: ${countOutput(level, "writing")}
- Reading task types: ${level.readingTaskTypes.length}
- Listening task types: ${level.listeningTaskTypes.length}

### Vocabulary Themes

${list(level.vocabularyThemes.map((theme) => `${theme.title.zh} / ${theme.title.en}`))}

### Core Vocabulary Dutch Words

${uniqueWords(level).join(", ")}

### Sentence Patterns

${list(level.sentencePatterns.map((pattern) => pattern.pattern))}

### Grammar Point Titles

${list(level.grammarPoints.map((grammar) => `${grammar.title.zh} / ${grammar.title.en}`))}

### Scenario Task Titles

${list(level.scenarioTasks.map((scenario) => `${scenario.title.zh} / ${scenario.title.en}`))}

`;
}

markdown += `## Quality Warnings

${warnings.length ? list(warnings) : "- No configured quality warnings triggered."}
`;

writeFileSync("docs/syllabus-data-report.md", markdown);
