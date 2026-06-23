import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const envFiles = [".env.local", ".env.production.local", ".env"];

function parseEnvFile(path) {
  if (!existsSync(path)) return {};
  const entries = {};
  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    entries[key] = rawValue.replace(/^['"]|['"]$/g, "");
  }
  return entries;
}

const fileEnv = envFiles.reduce((acc, file) => ({ ...acc, ...parseEnvFile(resolve(process.cwd(), file)) }), {});
const env = { ...fileEnv, ...process.env };

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_A1",
  "STRIPE_PRICE_A2",
  "STRIPE_PRICE_B1",
  "STRIPE_PRICE_BUNDLE",
];

const optional = [
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_ENABLE_REVIEW_LOGIN",
  "NEXT_PUBLIC_ENABLE_LOCAL_ACCESS_FALLBACK",
];
const prefixRules = [
  ["STRIPE_SECRET_KEY", /^sk_(test|live)_/],
  ["STRIPE_WEBHOOK_SECRET", /^whsec_/],
  ["STRIPE_PRICE_A1", /^price_/],
  ["STRIPE_PRICE_A2", /^price_/],
  ["STRIPE_PRICE_B1", /^price_/],
  ["STRIPE_PRICE_BUNDLE", /^price_/],
  ["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", /^pk_(test|live)_/],
];

const missing = required.filter((key) => !env[key]);
const formatIssues = prefixRules
  .filter(([key]) => env[key])
  .filter(([key, pattern]) => !pattern.test(env[key]))
  .map(([key]) => key);

const warnings = [];
if (env.NEXT_PUBLIC_ENABLE_REVIEW_LOGIN === "true") {
  warnings.push("NEXT_PUBLIC_ENABLE_REVIEW_LOGIN=true should not be used for public production.");
}
if (env.NEXT_PUBLIC_ENABLE_LOCAL_ACCESS_FALLBACK === "true") {
  warnings.push("NEXT_PUBLIC_ENABLE_LOCAL_ACCESS_FALLBACK=true should not be used for public production.");
}
if (env.STRIPE_SECRET_KEY?.startsWith("sk_live_") && env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith("pk_test_")) {
  warnings.push("STRIPE_SECRET_KEY is live but NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is test.");
}
if (env.STRIPE_SECRET_KEY?.startsWith("sk_test_") && env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith("pk_live_")) {
  warnings.push("STRIPE_SECRET_KEY is test but NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is live.");
}

console.log("NedPop production environment check");
console.log("-----------------------------------");
console.log(`Loaded env files: ${envFiles.filter((file) => existsSync(resolve(process.cwd(), file))).join(", ") || "none"}`);
console.log(`Required variables: ${required.length}`);
console.log(`Optional variables: ${optional.length}`);

if (missing.length) {
  console.error("\nMissing required variables:");
  missing.forEach((key) => console.error(`- ${key}`));
}

if (formatIssues.length) {
  console.error("\nVariables with unexpected format:");
  formatIssues.forEach((key) => console.error(`- ${key}`));
}

if (warnings.length) {
  console.warn("\nWarnings:");
  warnings.forEach((warning) => console.warn(`- ${warning}`));
}

if (missing.length || formatIssues.length) {
  console.error("\nNot ready. Add/fix these in Vercel Environment Variables or .env.local.");
  process.exit(1);
}

console.log("\nReady: required production variables are present and basic formats look right.");
