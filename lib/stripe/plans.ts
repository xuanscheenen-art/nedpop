import { planToUnlockedLevels, type AccessPlan, type UnlockableLevel } from "@/lib/access-control";

export type PaidPlanId = "a1-pack" | "a2-pack" | "b1-pack" | "bundle";

export type PaidPlanConfig = {
  accessLevel: Exclude<AccessPlan, "free">;
  unlockedLevels: UnlockableLevel[];
  priceEnvKey: "STRIPE_PRICE_A1" | "STRIPE_PRICE_A2" | "STRIPE_PRICE_B1" | "STRIPE_PRICE_BUNDLE";
};

export const paidPlanConfig: Record<PaidPlanId, PaidPlanConfig> = {
  "a1-pack": {
    accessLevel: "a1",
    unlockedLevels: planToUnlockedLevels("a1"),
    priceEnvKey: "STRIPE_PRICE_A1",
  },
  "a2-pack": {
    accessLevel: "a2",
    unlockedLevels: planToUnlockedLevels("a2"),
    priceEnvKey: "STRIPE_PRICE_A2",
  },
  "b1-pack": {
    accessLevel: "b1",
    unlockedLevels: planToUnlockedLevels("b1"),
    priceEnvKey: "STRIPE_PRICE_B1",
  },
  bundle: {
    accessLevel: "bundle",
    unlockedLevels: planToUnlockedLevels("bundle"),
    priceEnvKey: "STRIPE_PRICE_BUNDLE",
  },
};

export const isPaidPlanId = (value: string): value is PaidPlanId =>
  value === "a1-pack" || value === "a2-pack" || value === "b1-pack" || value === "bundle";
