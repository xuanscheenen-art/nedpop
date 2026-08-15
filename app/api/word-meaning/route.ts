import { NextRequest, NextResponse } from "next/server";
import { lookupWordMeaning, normalizeDictionaryWord } from "@/lib/wordMeaningLookup";

export async function GET(request: NextRequest) {
  const query = normalizeDictionaryWord(request.nextUrl.searchParams.get("q") ?? "");

  if (!query) {
    return NextResponse.json({ error: "missing-query" }, { status: 400 });
  }

  const result = await lookupWordMeaning(query);
  return NextResponse.json(result, { status: result.status === "unavailable" ? 503 : 200 });
}
