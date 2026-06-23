"use client";

export const learnedWordsStorageKey = "nedpop.wordLink.learnedWords";

export function readLearnedWords() {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(learnedWordsStorageKey) ?? "{}");
    return parsed && typeof parsed === "object" ? (parsed as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

export function writeLearnedWords(next: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(learnedWordsStorageKey, JSON.stringify(next));
}

export async function fetchServerLearnedWords(): Promise<Record<string, boolean>> {
  if (typeof window === "undefined") return {};

  try {
    const response = await fetch("/api/reviewed-words", {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin",
    });

    if (!response.ok) return {};

    const data = (await response.json()) as { wordIds?: string[] };
    return (data.wordIds ?? []).reduce<Record<string, boolean>>((next, wordId) => {
      next[wordId] = true;
      return next;
    }, {});
  } catch {
    return {};
  }
}

export async function syncLearnedWordToServer(wordId: string, learned: boolean) {
  if (typeof window === "undefined") return;

  try {
    await fetch("/api/reviewed-words", {
      method: learned ? "POST" : "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ wordId }),
      credentials: "same-origin",
    });
  } catch {
    // Local progress remains the fallback when the account sync endpoint is unavailable.
  }
}
