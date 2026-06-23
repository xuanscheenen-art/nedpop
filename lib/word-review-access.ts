import { allowedReviewWordLevelsForSubject, filterReviewWordsByAccess, type AccessSubject } from "@/lib/access-control";
import type { WordItem } from "@/types/vocabulary";

export type ReviewedWordRecord = {
  user_id: string;
  word_id: string;
  reviewed_at: string;
};

export function filterReviewedWordsByAccess<T extends Pick<WordItem, "id" | "level">>(
  reviewedWordIds: readonly string[],
  words: readonly T[],
  subject: AccessSubject,
): T[] {
  const reviewedIds = new Set(reviewedWordIds);
  return filterReviewWordsByAccess(words, subject).filter((word) => reviewedIds.has(word.id));
}

export function allowedReviewLevelSql(subject: AccessSubject) {
  return allowedReviewWordLevelsForSubject(subject);
}

export function buildReviewedWordsSqlFilter(subject: AccessSubject) {
  const allowedLevels = allowedReviewLevelSql(subject);
  return {
    allowedLevels,
    sql: `
select w.*
from public.user_reviewed_words urw
join public.words w on w.id = urw.word_id
where urw.user_id = $1
  and w.level = any($2::text[])
order by urw.reviewed_at desc;
`.trim(),
  };
}
