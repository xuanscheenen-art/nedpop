"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { BookOpen, ChevronDown, Menu, Sparkles, X } from "lucide-react";
import { ContinueLearningButton } from "@/components/ContinueLearningButton";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LoginButton } from "@/components/LoginButton";
import { useLanguage } from "@/lib/i18n";

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
] as const;

function HighlightedNavLabel({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-flex px-1 py-0.5">
      <svg
        aria-hidden="true"
        viewBox="0 0 120 24"
        preserveAspectRatio="none"
        className="pointer-events-none absolute -inset-x-2 -bottom-1 h-[1.15rem] w-[calc(100%+1rem)] -rotate-2 overflow-visible text-pop"
      >
        <path
          d="M4 8 C27 3 55 1 82 2 C96 2 108 3 116 6 C112 8 113 9 118 10 C105 11 93 12 79 14 C52 17 27 20 5 21 C2 17 1 12 4 8 Z"
          fill="currentColor"
          opacity="0.7"
        />
        <path
          d="M87 5 C97 4 105 5 114 7 M91 8 C101 7 109 8 118 9 M86 11 C96 10 104 10 112 11"
          fill="none"
          stroke="white"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.55"
        />
        <path
          d="M105 12 C111 12 116 11 121 10 M101 15 C108 15 114 14 119 14 M96 18 C103 18 109 17 114 17"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.58"
        />
      </svg>
      <span className="relative">{children}</span>
    </span>
  );
}

export function AppNav() {
  const { t, language } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-blue-100 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-[92rem] items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3" onClick={() => setMobileOpen(false)}>
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
                  ? "px-4 py-2 font-black text-ink hover:text-ocean"
                  : "rounded-full px-4 py-2 font-semibold text-ocean hover:bg-skywash"
              }`}
            >
              {"highlighted" in item && item.highlighted ? (
                <HighlightedNavLabel>{t(item.labelKey)}</HighlightedNavLabel>
              ) : (
                t(item.labelKey)
              )}
            </Link>
          ))}

          <div className="group relative">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold text-ocean transition hover:bg-skywash focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean/30"
              aria-haspopup="menu"
            >
              {t("nav.more")}
              <ChevronDown size={15} aria-hidden="true" />
            </button>
            <div
              className="invisible absolute left-1/2 top-full z-50 mt-3 w-48 -translate-x-1/2 rounded-2xl border border-blue-100 bg-white p-2 opacity-0 shadow-soft transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
              role="menu"
            >
              {moreNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block whitespace-nowrap rounded-xl px-4 py-3 text-sm font-bold text-ocean transition hover:bg-skywash"
                  role="menuitem"
                >
                  {t(item.labelKey)}
                </Link>
              ))}
            </div>
          </div>
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
          <ContinueLearningButton className="px-4 py-2" onClick={() => setMobileOpen(false)} />
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="inline-flex size-11 items-center justify-center rounded-full bg-skywash text-ocean transition hover:bg-blue-100"
            aria-label={mobileOpen ? (language === "zh" ? "关闭菜单" : "Close menu") : language === "zh" ? "打开菜单" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {mobileOpen ? (
        <div className="border-t border-blue-100 bg-white px-4 py-4 shadow-soft xl:hidden">
          <div className="mx-auto grid max-w-7xl gap-2">
            {mobileNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`whitespace-nowrap text-base font-black transition ${
                  "highlighted" in item && item.highlighted
                    ? "w-fit px-4 py-3 text-ink hover:text-ocean"
                    : "rounded-2xl px-4 py-3 text-ocean hover:bg-skywash"
                }`}
              >
                {"highlighted" in item && item.highlighted ? (
                  <HighlightedNavLabel>{t(item.labelKey)}</HighlightedNavLabel>
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
      ) : null}
    </header>
  );
}
