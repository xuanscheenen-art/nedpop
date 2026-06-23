import { wordItems } from "@/data/vocabularyPlan";
import { generateDailyWordPacks } from "@/lib/generateDailyWordPacks";

const generatedDailyWordData = generateDailyWordPacks(wordItems);

export const dailyWordPacks = generatedDailyWordData.packs;
export const dailyPackAssignments = generatedDailyWordData.assignments;
