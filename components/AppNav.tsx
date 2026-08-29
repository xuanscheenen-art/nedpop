"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { BookOpen, ChevronDown, Menu, Sparkles, X } from "lucide-react";
import { ContinueLearningButton } from "@/components/ContinueLearningButton";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LoginButton } from "@/components/LoginButton";
import { useLanguage } from "@/lib/i18n";
import styles from "./AppNav.module.css";

const mainNavItems = [
  { href: "/word-link", labelKey: "nav.wordLink", highlighted: true },
  { href: "/pronunciation", labelKey: "nav.pronunciation" },
  { href: "/dashboard", labelKey: "nav.learningPath" },
  { href: "/rules", labelKey: "nav.rules" },
  { href: "/pricing", labelKey: "nav.pricing" },
] as const;

const moreNavItems = [
  { href: "/special-forms", labelKey: "nav.specialForms" },
  { href: "/scenarios", labelKey: "nav.scenarios" },
  { href: "/exam-practice", labelKey: "nav.examPractice" },
  { href: "/about", labelKey: "nav.about" },
] as const;

const mobileNavItems = [
  { href: "/word-link", labelKey: "nav.wordLink", highlighted: true },
  { href: "/pronunciation", labelKey: "nav.pronunciation" },
  { href: "/dashboard", labelKey: "nav.learningPath" },
  { href: "/rules", labelKey: "nav.rules" },
  { href: "/special-forms", labelKey: "nav.specialForms" },
  { href: "/scenarios", labelKey: "nav.scenarios" },
  { href: "/exam-practice", labelKey: "nav.examPractice" },
  { href: "/word-review", labelKey: "nav.reviewPool" },
  { href: "/pricing", labelKey: "nav.pricing" },
  { href: "/about", labelKey: "nav.about" },
] as const;

function WordBubbleNavLabel({ label, language }: { label: string; language: "zh" | "en" }) {
  return (
    <span className={styles.featuredNavLabel}>
      <span className={styles.featuredNavText}>{language === "zh" ? "单词泡泡" : label}</span>
      <span className={styles.featuredNavSparkles} aria-hidden="true">
        <span className={styles.featuredNavSparkleLarge} />
        <span className={styles.featuredNavSparkleSmall} />
      </span>
    </span>
  );
}

export function AppNav() {
  const { t, language } = useLanguage();
  const moreMenuRef = useRef<HTMLDetailsElement>(null);
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function closeMoreMenu(event: PointerEvent) {
      if (!moreMenuRef.current?.contains(event.target as Node)) {
        moreMenuRef.current?.removeAttribute("open");
      }
      if (!mobileMenuRef.current?.contains(event.target as Node)) {
        mobileMenuRef.current?.removeAttribute("open");
      }
    }

    function closeMoreMenuOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        moreMenuRef.current?.removeAttribute("open");
        mobileMenuRef.current?.removeAttribute("open");
      }
    }

    document.addEventListener("pointerdown", closeMoreMenu);
    document.addEventListener("keydown", closeMoreMenuOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeMoreMenu);
      document.removeEventListener("keydown", closeMoreMenuOnEscape);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-blue-100 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-[92rem] items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3"
          onClick={() => mobileMenuRef.current?.removeAttribute("open")}
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-peach text-ocean">
            <BookOpen size={20} />
          </span>
          <span>
            <span className="block text-lg font-black leading-5 text-ink">NedPop</span>
            <span className="block text-xs font-semibold text-ocean/70">
              {language === "zh" ? "内德泡泡" : "Dutch from zero"}
            </span>
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-3 xl:flex">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap text-sm transition ${
                "highlighted" in item && item.highlighted
                  ? `${styles.featuredNavLink} font-black text-ink`
                  : "rounded-full px-4 py-2 font-semibold text-ocean hover:bg-skywash"
              }`}
            >
              {"highlighted" in item && item.highlighted ? (
                <WordBubbleNavLabel label={t(item.labelKey)} language={language} />
              ) : (
                t(item.labelKey)
              )}
            </Link>
          ))}

          <details ref={moreMenuRef} className="group relative">
            <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold text-ocean transition hover:bg-skywash focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean/30 [&::-webkit-details-marker]:hidden">
              {t("nav.more")}
              <ChevronDown
                size={15}
                aria-hidden="true"
                className="transition-transform group-open:rotate-180"
              />
            </summary>
            <div
              className="absolute left-1/2 top-full z-50 mt-2 w-48 -translate-x-1/2 rounded-2xl border border-blue-100 bg-white p-2 shadow-soft"
              role="menu"
            >
              {moreNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => moreMenuRef.current?.removeAttribute("open")}
                  className="block whitespace-nowrap rounded-xl px-4 py-3 text-sm font-bold text-ocean transition hover:bg-skywash"
                  role="menuitem"
                >
                  {t(item.labelKey)}
                </Link>
              ))}
            </div>
          </details>
        </div>

        <div className="hidden shrink-0 items-center gap-3 xl:flex">
          <LanguageSwitcher />
          <LoginButton compact />
          <Link
            href="/word-review"
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-pop px-4 py-2.5 text-sm font-black text-ink shadow-soft ring-1 ring-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-300"
          >
            <span className="flex size-6 items-center justify-center rounded-full bg-white/55 text-ink">
              <Sparkles size={14} />
            </span>
            {t("nav.reviewPool")}
          </Link>
          <ContinueLearningButton />
        </div>

        <div className="flex shrink-0 items-center gap-2 xl:hidden">
          <ContinueLearningButton
            className="px-4 py-2"
            onClick={() => mobileMenuRef.current?.removeAttribute("open")}
          />
          <details ref={mobileMenuRef} className="group relative">
            <summary
              className="inline-flex size-11 cursor-pointer list-none items-center justify-center rounded-full bg-skywash text-ocean transition hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean/30 [&::-webkit-details-marker]:hidden"
              aria-label={language === "zh" ? "打开菜单" : "Open menu"}
            >
              <Menu size={20} className="group-open:hidden" />
              <X size={20} className="hidden group-open:block" />
            </summary>
            <div className="absolute right-0 top-full z-50 mt-3 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-blue-100 bg-white p-3 shadow-soft">
              <div className="grid gap-1">
                {mobileNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => mobileMenuRef.current?.removeAttribute("open")}
                    className={`whitespace-nowrap text-base font-black transition ${
                      "highlighted" in item && item.highlighted
                        ? `${styles.featuredNavLink} w-fit text-ink`
                        : "rounded-2xl px-4 py-3 text-ocean hover:bg-skywash"
                    }`}
                  >
                    {"highlighted" in item && item.highlighted ? (
                      <WordBubbleNavLabel label={t(item.labelKey)} language={language} />
                    ) : (
                      t(item.labelKey)
                    )}
                  </Link>
                ))}
                <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-blue-100 pt-4">
                  <LoginButton />
                  <LanguageSwitcher />
                </div>
              </div>
            </div>
          </details>
        </div>
      </nav>
    </header>
  );
}
