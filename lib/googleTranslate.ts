import "server-only";
import { unstable_cache } from "next/cache";

const GOOGLE_TRANSLATE_ENDPOINT =
  "https://translation.googleapis.com/language/translate/v2";

type GoogleTranslateResponse = {
  data?: {
    translations?: Array<{
      translatedText?: string;
    }>;
  };
};

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 10)),
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const requestGoogleTranslation = unstable_cache(
  async (word: string) => {
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (!apiKey) throw new Error("google-translation-key-missing");

    const response = await fetch(GOOGLE_TRANSLATE_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        q: word,
        source: "nl",
        target: "zh-CN",
        format: "text",
      }),
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });

    if (!response.ok) throw new Error("google-translation-failed");

    const data = (await response.json()) as GoogleTranslateResponse;
    const translatedText =
      data.data?.translations?.[0]?.translatedText?.trim();
    if (!translatedText) throw new Error("google-translation-empty");

    return decodeHtmlEntities(translatedText);
  },
  ["nedpop-google-translate-nl-zh-v1"],
  { revalidate: 60 * 60 * 24 * 30 },
);

export async function translateDutchWordToChinese(word: string) {
  const normalizedWord = word.trim().toLocaleLowerCase("nl-NL");
  if (
    !normalizedWord ||
    normalizedWord.length > 100 ||
    !/^[\p{L}\p{M}][\p{L}\p{M}\s'-]*$/u.test(normalizedWord)
  ) {
    return undefined;
  }

  // Do not invoke the cached request when this deployment has no server key.
  if (!process.env.GOOGLE_TRANSLATE_API_KEY) return undefined;

  try {
    return await requestGoogleTranslation(normalizedWord);
  } catch {
    // Translation is optional: dictionary lookup must remain usable on failure.
    return undefined;
  }
}
