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
const { memoryAssociationsFor } = require("@/lib/wordAssociations");

const level = String(process.env.AUDIT_LEVEL ?? "A2").toUpperCase();
const words = wordItems.filter((word) => (word.originalLevel ?? word.level) === level);
const broadTypes = new Set(["semantic-series", "scenario-word", "action-object", "state-action"]);
const genericReason = /相关|一起记|同一组|同场景|同一条线上|belong|related|same group|same scene|same .* line/i;

const rows = words.map((word) => {
  const associations = memoryAssociationsFor(word, wordItems, 8);
  const strongAssociations = associations.filter((association) => !broadTypes.has(association.type));
  const broadAssociations = associations.filter((association) => broadTypes.has(association.type));
  const questionable = associations.filter((association) =>
    broadTypes.has(association.type) ||
    genericReason.test(`${association.reason?.zh ?? ""} ${association.reason?.en ?? ""}`) ||
    association.dutch.startsWith("-") ||
    association.dutch === word.dutch,
  );
  return {
    id: word.id,
    dutch: word.dutch,
    theme: word.theme,
    count: associations.length,
    strongCount: strongAssociations.length,
    broadCount: broadAssociations.length,
    associations: associations.map((association) => ({
      target: association.dutch,
      type: association.type,
      source: association.source,
      reasonZh: association.reason?.zh ?? "",
    })),
    questionableCount: questionable.length,
  };
});

const countByType = rows.flatMap((row) => row.associations).reduce((counts, association) => {
  counts[association.type] = (counts[association.type] ?? 0) + 1;
  return counts;
}, {});

const buckets = {
  zero: rows.filter((row) => row.count === 0).length,
  one: rows.filter((row) => row.count === 1).length,
  two: rows.filter((row) => row.count === 2).length,
  three: rows.filter((row) => row.count === 3).length,
  fourOrFive: rows.filter((row) => row.count === 4 || row.count === 5).length,
  sixToEight: rows.filter((row) => row.count >= 6).length,
};

const compact = (row) => ({
  dutch: row.dutch,
  theme: row.theme,
  count: row.count,
  strongCount: row.strongCount,
  broadCount: row.broadCount,
  associations: row.associations.map((association) => `${association.target}:${association.type}`),
});

console.log(JSON.stringify({
  level,
  wordCount: rows.length,
  buckets,
  associationTypes: Object.fromEntries(Object.entries(countByType).sort((a, b) => b[1] - a[1])),
  noBubbles: rows.filter((row) => row.count === 0).map(compact),
  tooFew: rows.filter((row) => row.count > 0 && row.count <= 2).map(compact),
  noStrongRelations: rows.filter((row) => row.count > 0 && row.strongCount === 0).map(compact),
  mostlyBroad: rows.filter((row) => row.count >= 3 && row.broadCount / row.count >= 0.6).map(compact),
}, null, 2));
