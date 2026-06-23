import { NextResponse, type NextRequest } from "next/server";
import { canAccessReviewWordLevel } from "@/lib/access-control";
import { getRequestAccessContext } from "@/lib/server-access";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { wordItems } from "@/data/vocabularyPlan";
import type { WordItem } from "@/types/vocabulary";

const wordsById = new Map(wordItems.map((word) => [word.id, word]));

function publicWord(word: WordItem) {
  return {
    id: word.id,
    dutch: word.dutch,
    level: word.level,
    originalLevel: word.originalLevel,
    meaning: word.meaning,
    article: word.article ?? null,
    plural: word.plural ?? null,
  };
}

function wordSnapshot(word: WordItem) {
  return {
    id: word.id,
    dutch: word.dutch,
    meaning_zh: word.meaning.zh,
    meaning_en: word.meaning.en,
    level: word.level,
    payload: {
      originalLevel: word.originalLevel,
      theme: word.theme,
      article: word.article ?? null,
      plural: word.plural ?? null,
      exampleSentence: word.exampleSentence,
      phraseChunks: word.phraseChunks,
    },
    updated_at: new Date().toISOString(),
  };
}

async function requireUser(request: NextRequest) {
  const context = await getRequestAccessContext(request);
  if (!context) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "LOGIN_REQUIRED" }, { status: 401 }),
    };
  }
  return { ok: true as const, context };
}

async function ensureUserProfile(context: NonNullable<Awaited<ReturnType<typeof getRequestAccessContext>>>) {
  const supabase = getSupabaseAdminClient();
  await supabase.from("users").upsert(
    {
      id: context.userId,
      email: context.email,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
}

export async function GET(request: NextRequest) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("user_reviewed_words")
    .select("word_id, reviewed_at")
    .eq("user_id", auth.context.userId)
    .order("reviewed_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "REVIEW_WORDS_READ_FAILED" }, { status: 500 });
  }

  const words = (data ?? [])
    .map((row) => wordsById.get(row.word_id))
    .filter((word): word is WordItem => Boolean(word))
    .filter((word) =>
      canAccessReviewWordLevel(word.level, {
        signedIn: true,
        unlockedLevels: auth.context.unlockedLevels,
      }),
    )
    .map(publicWord);

  return NextResponse.json({
    wordIds: words.map((word) => word.id),
    words,
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as { wordId?: string } | null;
  const word = body?.wordId ? wordsById.get(body.wordId) : null;

  if (!word) {
    return NextResponse.json({ error: "WORD_NOT_FOUND" }, { status: 404 });
  }

  if (
    !canAccessReviewWordLevel(word.level, {
      signedIn: true,
      unlockedLevels: auth.context.unlockedLevels,
    })
  ) {
    return NextResponse.json({ error: "ENTITLEMENT_REQUIRED", requiredLevel: word.level }, { status: 403 });
  }

  const supabase = getSupabaseAdminClient();
  await ensureUserProfile(auth.context);

  const { error: wordError } = await supabase.from("words").upsert(wordSnapshot(word), { onConflict: "id" });
  if (wordError) {
    return NextResponse.json({ error: "WORD_SNAPSHOT_WRITE_FAILED" }, { status: 500 });
  }

  const { error: reviewError } = await supabase.from("user_reviewed_words").upsert(
    {
      user_id: auth.context.userId,
      word_id: word.id,
      reviewed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,word_id" },
  );

  if (reviewError) {
    return NextResponse.json({ error: "REVIEW_WORD_WRITE_FAILED" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as { wordId?: string } | null;
  if (!body?.wordId) {
    return NextResponse.json({ error: "WORD_ID_REQUIRED" }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("user_reviewed_words")
    .delete()
    .eq("user_id", auth.context.userId)
    .eq("word_id", body.wordId);

  if (error) {
    return NextResponse.json({ error: "REVIEW_WORD_DELETE_FAILED" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
