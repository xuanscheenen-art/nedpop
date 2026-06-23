"use client";

import Link from "next/link";
import { ArrowRight, BookOpenCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { authChangedEvent, getCurrentUser } from "@/lib/auth";
import { canAccessReviewWordLevel } from "@/lib/access-control";
import { getEffectiveWords } from "@/lib/contentStore";
import { accessLevelChangedEvent, getEntitledUnlockedLevels, getUnlockedLevels, type UserUnlockedLevels } from "@/lib/entitlements";
import { fetchServerLearnedWords, readLearnedWords, writeLearnedWords } from "@/lib/learnerProgress";
import { useLanguage } from "@/lib/i18n";
import type { WordItem } from "@/types/vocabulary";

const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

function firstLetter(word: string) {
  const letter = word.trim().charAt(0).toLowerCase();
  return /^[a-z]$/.test(letter) ? letter : "#";
}

function wordMeaning(word: WordItem, language: "zh" | "en") {
  return word.meaning?.[language] || word.meaning?.zh || word.meaning?.en || "";
}

export default function WordReviewPage() {
  const { language } = useLanguage();
  const [learnedWords, setLearnedWords] = useState<Record<string, boolean>>({});
  const [accessLevel, setCurrentAccessLevel] = useState<UserUnlockedLevels>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const syncReviewState = () => {
      setLearnedWords(readLearnedWords());
      void fetchServerLearnedWords().then((serverWords) => {
        if (cancelled || !Object.keys(serverWords).length) return;
        setLearnedWords((current) => {
          const next = { ...current, ...serverWords };
          writeLearnedWords(next);
          return next;
        });
      });
      setCurrentAccessLevel(getUnlockedLevels());
      void getEntitledUnlockedLevels().then((levels) => {
        if (!cancelled) setCurrentAccessLevel(levels);
      });
      void getCurrentUser().then((user) => {
        if (!cancelled) setSignedIn(Boolean(user));
      });
      setReady(true);
    };
    syncReviewState();
    window.addEventListener(accessLevelChangedEvent, syncReviewState);
    window.addEventListener(authChangedEvent, syncReviewState);
    window.addEventListener("storage", syncReviewState);
    return () => {
      window.removeEventListener(accessLevelChangedEvent, syncReviewState);
      window.removeEventListener(authChangedEvent, syncReviewState);
      window.removeEventListener("storage", syncReviewState);
      cancelled = true;
    };
  }, []);

  const words = useMemo(() => {
    return getEffectiveWords()
      .filter((word) => learnedWords[word.id] || learnedWords[word.dutch])
      .filter((word) => canAccessReviewWordLevel(word.level, { signedIn, unlockedLevels: accessLevel }))
      .sort((a, b) => a.dutch.localeCompare(b.dutch, "nl", { sensitivity: "base" }));
  }, [accessLevel, learnedWords, signedIn]);

  const groupedWords = useMemo(() => {
    return alphabet.map((letter) => ({
      letter,
      words: words.filter((word) => firstLetter(word.dutch) === letter),
    }));
  }, [words]);

  const nonAlphabetWords = words.filter((word) => firstLetter(word.dutch) === "#");

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[34px] border border-blue-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black tracking-[0.18em] text-pop">
              {language === "zh" ? "Word Review" : "Word Review"}
            </p>
            <h1 className="mt-3 text-4xl font-black text-ink sm:text-5xl">
              {language === "zh" ? "复习池" : "Review Pool"}
            </h1>
            <p className="mt-4 max-w-2xl text-lg font-bold leading-8 text-ocean/70">
              {language === "zh"
                ? "这里自动收集你点过“我记住了”的单词。按首字母顺序复习，点开可以回到词卡。"
                : "Words you marked as learned are collected here. Review them alphabetically and open any card again."}
            </p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-full bg-peach px-5 py-3 text-lg font-black text-pop">
            <BookOpenCheck size={22} />
            {words.length} {language === "zh" ? "个词" : "words"}
          </div>
        </div>

        <div className="mt-7 flex flex-wrap gap-2">
          {groupedWords.map((group) => (
            <a
              key={group.letter}
              href={`#letter-${group.letter}`}
              className={`inline-flex min-w-11 items-center justify-center rounded-full px-3 py-2 text-sm font-black transition ${
                group.words.length
                  ? "bg-ink text-white hover:bg-ocean"
                  : "bg-skywash text-ocean/35"
              }`}
            >
              {group.letter.toUpperCase()}
              {group.words.length ? <span className="ml-1 text-xs opacity-70">{group.words.length}</span> : null}
            </a>
          ))}
        </div>
      </section>

      {!ready ? null : words.length ? (
        <section className="mt-7 space-y-5">
          {groupedWords.map((group) => (
            <div key={group.letter} id={`letter-${group.letter}`} className="rounded-[28px] border border-blue-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-3xl font-black text-ink">{group.letter.toUpperCase()}</h2>
                <span className="rounded-full bg-skywash px-3 py-1 text-sm font-black text-ocean">
                  {group.words.length}
                </span>
              </div>
              {group.words.length ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {group.words.map((word) => (
                    <Link
                      key={word.id}
                      href={`/word-link?word=${encodeURIComponent(word.dutch)}`}
                      className="group rounded-3xl border border-blue-100 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-pop/40 hover:bg-peach/40 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-2xl font-black text-ink">{word.dutch}</p>
                          <p className="mt-1 text-sm font-bold text-ocean/70">{wordMeaning(word, language)}</p>
                        </div>
                        <ArrowRight className="mt-1 text-pop opacity-0 transition group-hover:opacity-100" size={20} />
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {word.article ? (
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-pop">{word.article}</span>
                        ) : null}
                        {word.plural ? (
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-ocean">{word.plural}</span>
                        ) : null}
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-ocean">{word.originalLevel ?? word.level}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl bg-skywash p-4 font-bold text-ocean/55">
                  {language === "zh" ? "这个字母下面还没有已学词。" : "No learned words under this letter yet."}
                </p>
              )}
            </div>
          ))}

          {nonAlphabetWords.length ? (
            <div id="letter-other" className="rounded-[28px] border border-blue-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-3xl font-black text-ink">#</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {nonAlphabetWords.map((word) => (
                  <Link key={word.id} href={`/word-link?word=${encodeURIComponent(word.dutch)}`} className="rounded-3xl border border-blue-100 bg-slate-50 p-4">
                    <p className="text-2xl font-black text-ink">{word.dutch}</p>
                    <p className="mt-1 text-sm font-bold text-ocean/70">{wordMeaning(word, language)}</p>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : (
        <section className="mt-7 rounded-[30px] border border-blue-100 bg-white p-8 text-center shadow-sm">
          <h2 className="text-3xl font-black text-ink">
            {language === "zh" ? "还没有已学词" : "No learned words yet"}
          </h2>
          <p className="mx-auto mt-3 max-w-xl font-bold leading-7 text-ocean/65">
            {language === "zh"
              ? "去单词联想页学习，点“我记住了”之后，单词会自动进入这里。"
              : "Study on the Word Link page. After you click “learned”, words will appear here."}
          </p>
          <Link
            href="/word-link"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 font-black text-white transition hover:bg-ocean"
          >
            {language === "zh" ? "去背单词" : "Go to Word Link"}
            <ArrowRight size={18} />
          </Link>
        </section>
      )}
    </main>
  );
}
