"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { getLearningProgress, learningProgressChangedEvent, type LearningProgress } from "@/lib/learningProgress";
import { getNextRecommendedAction } from "@/lib/nextAction";
import { useLanguage } from "@/lib/i18n";

type ContinueLearningButtonProps = {
  className?: string;
  onClick?: () => void;
};

const hasStarted = (progress: LearningProgress) =>
  progress.pronunciationBaseCompleted ||
  progress.starterWordsCompleted ||
  progress.grammarBaseCompleted ||
  progress.currentStep !== "pronunciation" ||
  progress.currentDay > 1;

const normalizePath = (value: string) => value.replace(/\/$/, "") || "/";

const routePath = (route: string) => {
  const [path] = route.split("?");
  return normalizePath(path ?? route);
};

export function ContinueLearningButton({ className, onClick }: ContinueLearningButtonProps) {
  const { language } = useLanguage();
  const pathname = usePathname();
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [mounted, setMounted] = useState(false);
  const [currentSearch, setCurrentSearch] = useState("");

  useEffect(() => {
    setMounted(true);
    const sync = () => setProgress(getLearningProgress());
    sync();
    window.addEventListener(learningProgressChangedEvent, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(learningProgressChangedEvent, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    setCurrentSearch(window.location.search);
  }, [pathname]);

  const action = mounted && progress
    ? getNextRecommendedAction(progress)
    : {
        route: "/dashboard",
      };
  const label = mounted && progress && hasStarted(progress)
    ? language === "zh"
      ? "继续学习"
      : "Continue"
    : language === "zh"
      ? "开始学习"
      : "Start Learning";
  const currentRoute = `${normalizePath(pathname)}${currentSearch}`;
  const isAlreadyOnRecommendedPage =
    mounted &&
    progress &&
    routePath(action.route) === normalizePath(pathname) &&
    (!action.route.includes("?") || action.route === currentRoute);
  const currentPageLabel = language === "zh" ? "继续本页" : "Continue here";
  const baseClassName =
    "inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-ink px-5 py-2.5 text-sm font-black text-white shadow-soft transition hover:bg-ocean";

  if (isAlreadyOnRecommendedPage) {
    return (
      <button
        type="button"
        onClick={() => {
          onClick?.();
          document.querySelector("main")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
        className={className ? `${baseClassName} ${className}` : baseClassName}
      >
        <LayoutDashboard size={16} />
        {currentPageLabel}
      </button>
    );
  }

  return (
    <Link
      href={action.route}
      onClick={onClick}
      className={className ? `${baseClassName} ${className}` : baseClassName}
    >
      <LayoutDashboard size={16} />
      {label}
    </Link>
  );
}
