"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, ExternalLink, Image as ImageIcon, LoaderCircle, Share2, X } from "lucide-react";
import type { CourseLevel, LocalizedText } from "@/types/course";

export type CheckInWord = {
  wordId: string;
  dutch: string;
  article?: "de" | "het";
  plural?: string;
  meaning: LocalizedText;
  memoryHook?: LocalizedText;
  exampleSentence?: {
    dutch: string;
    meaning: LocalizedText;
  };
};

type DailyCheckInShareProps = {
  level: CourseLevel;
  dayNumber: number;
  packTitle: LocalizedText;
  words: CheckInWord[];
  initialWordId?: string;
  language: "zh" | "en";
};

const POSTER_WIDTH = 1080;
const POSTER_HEIGHT = 1440;
const navy = "#123260";
const ocean = "#174a8b";
const orange = "#ff9d45";
const paper = "#f8f3e8";
const peach = "#fff0df";
const sky = "#edf5ff";

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillStyle: string,
  strokeStyle?: string,
) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.fillStyle = fillStyle;
  context.fill();
  if (strokeStyle) {
    context.strokeStyle = strokeStyle;
    context.lineWidth = 2;
    context.stroke();
  }
}

function wrapLines(context: CanvasRenderingContext2D, value: string, maxWidth: number, maxLines = 4) {
  const characters = Array.from(value.trim());
  const lines: string[] = [];
  let line = "";

  for (const character of characters) {
    const candidate = `${line}${character}`;
    if (line && context.measureText(candidate).width > maxWidth) {
      lines.push(line.trim());
      line = character;
      if (lines.length === maxLines - 1) break;
    } else {
      line = candidate;
    }
  }

  if (line.trim() && lines.length < maxLines) lines.push(line.trim());
  const consumed = lines.join("").length;
  if (consumed < characters.length && lines.length) {
    let last = lines[lines.length - 1];
    while (context.measureText(`${last}…`).width > maxWidth && last.length > 1) last = last.slice(0, -1);
    lines[lines.length - 1] = `${last}…`;
  }
  return lines;
}

function drawLines(
  context: CanvasRenderingContext2D,
  lines: string[],
  x: number,
  y: number,
  lineHeight: number,
  align: CanvasTextAlign = "left",
) {
  context.textAlign = align;
  lines.forEach((line, index) => context.fillText(line, x, y + index * lineHeight));
}

function drawWavyLine(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  color = "#f28b63",
) {
  context.save();
  context.beginPath();
  context.strokeStyle = color;
  context.lineWidth = 5;
  context.lineCap = "round";
  for (let offset = 0; offset <= width; offset += 8) {
    const nextY = y + Math.sin(offset / 8) * 3;
    if (offset === 0) context.moveTo(x, nextY);
    else context.lineTo(x + offset, nextY);
  }
  context.stroke();
  context.restore();
}

function drawHandCircle(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radiusX: number,
  radiusY: number,
) {
  context.save();
  context.strokeStyle = "#f28b63";
  context.lineWidth = 5;
  context.lineCap = "round";
  context.beginPath();
  context.ellipse(x, y, radiusX, radiusY, -0.08, 0.08, Math.PI * 2 - 0.12);
  context.stroke();
  context.globalAlpha = 0.55;
  context.lineWidth = 2;
  context.beginPath();
  context.ellipse(x + 2, y - 1, radiusX + 3, radiusY - 2, 0.04, 0.18, Math.PI * 2);
  context.stroke();
  context.restore();
}

function drawHandArrow(
  context: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
) {
  context.save();
  context.strokeStyle = "#f28b63";
  context.lineWidth = 5;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(startX, startY);
  context.bezierCurveTo(startX - 28, startY + 34, endX + 25, endY - 30, endX, endY);
  context.stroke();
  context.beginPath();
  context.moveTo(endX + 5, endY - 18);
  context.lineTo(endX, endY);
  context.lineTo(endX + 18, endY - 5);
  context.stroke();
  context.restore();
}

function drawHandStar(context: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  context.save();
  context.beginPath();
  context.strokeStyle = "#f28b63";
  context.lineWidth = 5;
  context.lineJoin = "round";
  for (let index = 0; index < 10; index += 1) {
    const angle = -Math.PI / 2 + index * Math.PI / 5;
    const pointRadius = index % 2 === 0 ? radius : radius * 0.42;
    const pointX = x + Math.cos(angle) * pointRadius;
    const pointY = y + Math.sin(angle) * pointRadius;
    if (index === 0) context.moveTo(pointX, pointY);
    else context.lineTo(pointX, pointY);
  }
  context.closePath();
  context.stroke();
  context.restore();
}

function formatDate() {
  const date = new Date();
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join(".");
}

function posterFileName(level: CourseLevel, dayNumber: number) {
  return `nedpop-${level.toLowerCase()}-day-${dayNumber}-check-in.png`;
}

async function renderPoster({
  level,
  dayNumber,
  packTitle,
  words,
  featured,
  language,
}: DailyCheckInShareProps & { featured: CheckInWord }) {
  await document.fonts?.ready;
  const canvas = document.createElement("canvas");
  canvas.width = POSTER_WIDTH;
  canvas.height = POSTER_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable");

  context.fillStyle = paper;
  context.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);

  context.strokeStyle = "rgba(18,50,96,0.07)";
  context.lineWidth = 1;
  for (let x = 56; x < POSTER_WIDTH; x += 36) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, POSTER_HEIGHT);
    context.stroke();
  }
  for (let y = 42; y < POSTER_HEIGHT; y += 36) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(POSTER_WIDTH, y);
    context.stroke();
  }
  for (let y = 75; y < POSTER_HEIGHT; y += 92) {
    context.beginPath();
    context.fillStyle = "#e3dbc9";
    context.arc(20, y, 9, 0, Math.PI * 2);
    context.fill();
  }

  context.fillStyle = navy;
  context.font = '700 58px "Bradley Hand", "Comic Sans MS", "Kaiti SC", "PingFang SC", sans-serif';
  context.textAlign = "left";
  context.fillText(`Day ${dayNumber}`, 72, 92);
  drawWavyLine(context, 74, 108, 178);
  context.fillStyle = "#ae1c28";
  context.fillRect(270, 52, 62, 13);
  context.fillStyle = "#ffffff";
  context.fillRect(270, 65, 62, 13);
  context.fillStyle = "#21468b";
  context.fillRect(270, 78, 62, 13);
  context.fillStyle = "rgba(18,50,96,0.46)";
  context.font = '700 25px "PingFang SC", sans-serif';
  context.textAlign = "right";
  context.fillText(formatDate(), 1005, 76);

  context.fillStyle = orange;
  context.beginPath();
  context.arc(88, 162, 7, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = navy;
  context.font = '700 31px "Kaiti SC", "STKaiti", "PingFang SC", sans-serif';
  context.textAlign = "left";
  const todayLine = language === "zh"
    ? `今天学：${featured.article ? `${featured.article} ` : ""}${featured.dutch} = ${featured.meaning.zh}`
    : `Today: ${featured.article ? `${featured.article} ` : ""}${featured.dutch} = ${featured.meaning.en}`;
  context.fillText(todayLine, 112, 173);
  const featuredPrefix = language === "zh" ? "要记住：" : "Remember:";
  const featuredLabel = `${featured.article ? `${featured.article} ` : ""}${featured.dutch}`;
  context.fillStyle = orange;
  context.beginPath();
  context.arc(88, 235, 7, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = navy;
  context.font = '700 31px "Kaiti SC", "STKaiti", "PingFang SC", sans-serif';
  context.fillText(featuredPrefix, 112, 246);
  const featuredPrefixWidth = context.measureText(featuredPrefix).width;
  context.font = '700 34px "Bradley Hand", "Comic Sans MS", "Kaiti SC", sans-serif';
  context.fillText(featuredLabel, 120 + featuredPrefixWidth, 246);
  drawWavyLine(context, 120 + featuredPrefixWidth, 260, Math.min(context.measureText(featuredLabel).width, 225));
  drawHandStar(context, 565, 230, 25);

  const sentence = featured.exampleSentence?.dutch ?? `${featured.article ? `${featured.article} ` : ""}${featured.dutch}`;
  const sentenceMeaning = featured.exampleSentence?.meaning[language] ?? featured.meaning[language];
  context.save();
  context.translate(710, 122);
  context.rotate(-0.025);
  context.shadowColor = "rgba(18,50,96,0.16)";
  context.shadowBlur = 18;
  context.shadowOffsetY = 10;
  roundedRect(context, 0, 0, 300, 175, 3, "#fff4bd");
  context.shadowColor = "transparent";
  context.fillStyle = "#d8cba3";
  context.fillRect(97, -11, 105, 24);
  context.fillStyle = navy;
  context.font = '800 24px "PingFang SC", sans-serif';
  drawLines(context, wrapLines(context, sentence, 252, 2), 24, 62, 34);
  context.fillStyle = "rgba(18,50,96,0.68)";
  context.font = '700 19px "PingFang SC", sans-serif';
  drawLines(context, wrapLines(context, sentenceMeaning, 252, 2), 24, 125, 27);
  context.restore();
  drawHandArrow(context, 742, 292, 675, 352);

  context.shadowColor = "rgba(18,50,96,0.14)";
  context.shadowBlur = 24;
  context.shadowOffsetY = 12;
  roundedRect(context, 54, 330, 972, 890, 24, "#ffffff", "#dce9f8");
  context.shadowColor = "transparent";

  context.fillStyle = navy;
  context.font = '900 27px "Arial Rounded MT Bold", "PingFang SC", sans-serif';
  context.textAlign = "left";
  context.fillText("NedPop", 92, 382);
  context.fillStyle = orange;
  context.font = '800 17px "PingFang SC", sans-serif';
  context.fillText(`${level} · DAY ${dayNumber}`, 92, 410);
  context.fillStyle = "rgba(18,50,96,0.55)";
  context.font = '700 17px "PingFang SC", sans-serif';
  context.fillText(packTitle[language], 260, 408);
  context.strokeStyle = "#dce9f8";
  context.beginPath();
  context.moveTo(80, 438);
  context.lineTo(1000, 438);
  context.stroke();

  roundedRect(context, 84, 472, 300, 670, 24, "#fbfdff", "#dce9f8");
  context.fillStyle = orange;
  context.font = '800 18px "PingFang SC", sans-serif';
  context.fillText(language === "zh" ? "今天这组词" : "TODAY'S WORDS", 110, 510);
  const visibleWords = words.slice(0, 9);
  visibleWords.forEach((word, index) => {
    const y = 552 + index * 61;
    const active = word.wordId === featured.wordId;
    if (active) roundedRect(context, 100, y - 31, 268, 51, 13, sky, "#aac8ee");
    context.beginPath();
    context.fillStyle = active ? orange : peach;
    context.arc(126, y - 6, 16, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = active ? "#ffffff" : orange;
    context.font = '900 14px "Arial", sans-serif';
    context.textAlign = "center";
    context.fillText(String(index + 1), 126, y - 1);
    context.fillStyle = navy;
    context.font = '900 20px "Arial Rounded MT Bold", "PingFang SC", sans-serif';
    context.textAlign = "left";
    context.fillText(word.dutch, 154, y);
    context.fillStyle = "rgba(18,50,96,0.54)";
    context.font = '700 14px "PingFang SC", sans-serif';
    context.fillText(word.meaning[language], 154, y + 21);
  });

  roundedRect(context, 414, 472, 580, 405, 24, "#fffaf4", "#ffe0bf");
  context.fillStyle = orange;
  context.font = '800 18px "PingFang SC", sans-serif';
  context.fillText(language === "zh" ? "今天记住" : "WORD OF THE DAY", 446, 516);
  context.fillStyle = navy;
  context.font = '900 70px "Arial Rounded MT Bold", "PingFang SC", sans-serif';
  context.fillText(featured.dutch, 446, 600);

  let badgeX = 448;
  const badges = [
    featured.article,
    featured.plural ? `plural: ${featured.plural}` : undefined,
  ].filter(Boolean) as string[];
  context.font = '800 18px "Arial Rounded MT Bold", "PingFang SC", sans-serif';
  badges.forEach((badge, index) => {
    const width = context.measureText(badge).width + 34;
    roundedRect(context, badgeX, 626, width, 42, 21, index === 0 ? peach : sky);
    context.fillStyle = index === 0 ? orange : ocean;
    context.textAlign = "center";
    context.fillText(badge, badgeX + width / 2, 654);
    if (index === 0) drawHandCircle(context, badgeX + width / 2, 647, width / 2 + 7, 27);
    badgeX += width + 12;
  });
  context.textAlign = "left";
  context.fillStyle = ocean;
  context.font = '900 27px "PingFang SC", sans-serif';
  context.fillText(`${featured.meaning.zh} / ${featured.meaning.en}`, 446, 715);

  context.fillStyle = "rgba(18,50,96,0.74)";
  context.font = '700 20px "PingFang SC", sans-serif';
  const hook = featured.memoryHook?.[language]
    ?? (language === "zh" ? `把 ${featured.dutch} 放回今天的场景里记。` : `Remember ${featured.dutch} in today's scene.`);
  drawLines(context, wrapLines(context, hook, 510, 3), 446, 764, 32);

  roundedRect(context, 414, 903, 580, 239, 24, navy);
  context.fillStyle = "#ffd19f";
  context.font = '800 17px "PingFang SC", sans-serif';
  context.fillText(language === "zh" ? "我能说的一句" : "ONE SENTENCE I CAN SAY", 448, 946);
  context.fillStyle = "#ffffff";
  context.font = '900 30px "Arial Rounded MT Bold", "PingFang SC", sans-serif';
  const sentenceLines = wrapLines(context, sentence, 510, 3);
  drawLines(context, sentenceLines, 448, 1000, 43);
  if (sentenceLines.length) {
    const underlineWidth = Math.min(context.measureText(sentenceLines[0]).width, 480);
    drawWavyLine(context, 448, 1015, underlineWidth);
  }
  context.fillStyle = "rgba(255,255,255,0.68)";
  context.font = '700 19px "PingFang SC", sans-serif';
  drawLines(context, wrapLines(context, sentenceMeaning, 510, 2), 448, 1094, 30);

  context.fillStyle = navy;
  context.font = '900 28px "PingFang SC", sans-serif';
  context.textAlign = "center";
  context.fillText(
    language === "zh" ? `今天完成 ${words.length} 个荷兰语单词` : `${words.length} Dutch words completed today`,
    POSTER_WIDTH / 2,
    1290,
  );
  context.fillStyle = "rgba(18,50,96,0.64)";
  context.font = '700 22px "PingFang SC", sans-serif';
  context.fillText(
    language === "zh" ? "慢慢来，每天一点点。" : "Little by little, every day.",
    POSTER_WIDTH / 2,
    1333,
  );
  context.fillStyle = orange;
  context.fillRect(382, 1363, 316, 6);
  context.fillStyle = "rgba(18,50,96,0.45)";
  context.font = '700 16px "Arial", sans-serif';
  context.fillText("nedpop.com", POSTER_WIDTH / 2, 1403);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Unable to create poster"));
    }, "image/png");
  });
}

export function DailyCheckInShare({
  level,
  dayNumber,
  packTitle,
  words,
  initialWordId,
  language,
}: DailyCheckInShareProps) {
  const [open, setOpen] = useState(false);
  const [featuredWordId, setFeaturedWordId] = useState(initialWordId ?? words[0]?.wordId);
  const [busyAction, setBusyAction] = useState<"share" | null>(null);
  const [feedback, setFeedback] = useState("");
  const [posterBlob, setPosterBlob] = useState<Blob | null>(null);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [isPreparingPoster, setIsPreparingPoster] = useState(false);
  const featured = useMemo(
    () => words.find((word) => word.wordId === featuredWordId) ?? words[0],
    [featuredWordId, words],
  );

  useEffect(() => {
    if (!open) return;
    setFeaturedWordId(initialWordId ?? words[0]?.wordId);
    setFeedback("");
  }, [initialWordId, open, words]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !featured) return;

    let cancelled = false;
    let objectUrl = "";
    setIsPreparingPoster(true);
    setPosterBlob(null);
    setPosterUrl(null);
    setFeedback("");

    renderPoster({ level, dayNumber, packTitle, words, featured, language })
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setPosterBlob(blob);
        setPosterUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) {
          setFeedback(language === "zh" ? "图片生成失败，请再试一次。" : "Image generation failed. Please try again.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsPreparingPoster(false);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [dayNumber, featured, language, level, open, packTitle, words]);

  if (!featured) return null;

  const createPoster = () => posterBlob
    ? Promise.resolve(posterBlob)
    : renderPoster({ level, dayNumber, packTitle, words, featured, language });

  const sharePoster = async () => {
    setBusyAction("share");
    setFeedback("");
    try {
      const blob = await createPoster();
      const file = new File([blob], posterFileName(level, dayNumber), { type: "image/png" });
      const supportsFileShare = typeof navigator.share === "function"
        && (!navigator.canShare || navigator.canShare({ files: [file] }));
      if (supportsFileShare) {
        await navigator.share({
          title: `NedPop ${level} Day ${dayNumber}`,
          files: [file],
        });
        return;
      }
      setFeedback(
        language === "zh"
          ? "当前浏览器不支持图片分享，请保存图片后发布。"
          : "Image sharing is not supported here. Save the image to post it.",
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setFeedback(language === "zh" ? "没有完成分享，请再试一次。" : "Sharing did not complete. Please try again.");
    } finally {
      setBusyAction(null);
    }
  };

  const openPlatform = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-1.5 rounded-full bg-pop px-3.5 py-2 text-xs font-black text-white shadow-sm transition hover:bg-orange-400"
      >
        <Share2 size={15} />
        {language === "zh" ? "分享打卡" : "Share"}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/55 p-0 backdrop-blur-sm sm:items-center sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="check-in-share-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className="max-h-[96vh] w-full overflow-y-auto rounded-t-[30px] bg-white p-5 shadow-2xl sm:max-w-5xl sm:rounded-[30px] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black tracking-[0.14em] text-pop">
                  {language === "zh" ? "每日学习打卡" : "Daily Check-in"}
                </p>
                <h2 id="check-in-share-title" className="mt-2 text-3xl font-black text-ink">
                  {language === "zh" ? "把今天学到的分享出去" : "Share what you learned today"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={language === "zh" ? "关闭" : "Close"}
                className="grid size-11 shrink-0 place-items-center rounded-full bg-skywash text-ocean transition hover:bg-peach"
              >
                <X size={21} />
              </button>
            </div>

            <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(300px,0.78fr)_minmax(0,1.22fr)]">
              <div>
                <p className="text-sm font-black text-ink">{language === "zh" ? "选择主打单词" : "Choose featured word"}</p>
                <div className="mt-3 flex max-h-48 flex-wrap gap-2 overflow-y-auto pr-1">
                  {words.map((word) => {
                    const active = word.wordId === featured.wordId;
                    return (
                      <button
                        key={word.wordId}
                        type="button"
                        onClick={() => setFeaturedWordId(word.wordId)}
                        className={`rounded-full px-3 py-2 text-sm font-black transition ${
                          active ? "bg-ink text-white" : "bg-skywash text-ocean hover:bg-peach"
                        }`}
                      >
                        {word.article ? `${word.article} ` : ""}{word.dutch}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5">
                  <p className="text-sm font-black text-ink">{language === "zh" ? "分享到" : "Share to"}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openPlatform("https://creator.xiaohongshu.com/publish/publish")}
                      className="rounded-full bg-[#ff2442] px-4 py-2.5 text-sm font-black text-white transition hover:brightness-95"
                    >
                      小红书
                    </button>
                    <button
                      type="button"
                      onClick={sharePoster}
                      disabled={busyAction !== null}
                      className="rounded-full bg-[#07c160] px-4 py-2.5 text-sm font-black text-white transition hover:brightness-95 disabled:opacity-60"
                    >
                      朋友圈
                    </button>
                    <button
                      type="button"
                      onClick={() => openPlatform("https://www.instagram.com/")}
                      className="rounded-full bg-ink px-4 py-2.5 text-sm font-black text-white transition hover:bg-ocean"
                    >
                      Instagram
                    </button>
                    <button
                      type="button"
                      onClick={() => openPlatform("https://weibo.com/compose/")}
                      className="rounded-full bg-[#ff8200] px-4 py-2.5 text-sm font-black text-white transition hover:brightness-95"
                    >
                      微博
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
                  <button
                    type="button"
                    onClick={sharePoster}
                    disabled={busyAction !== null || isPreparingPoster}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 font-black text-white transition hover:bg-ocean disabled:opacity-60"
                  >
                    {busyAction === "share" ? <LoaderCircle className="animate-spin" size={18} /> : <Share2 size={18} />}
                    {language === "zh" ? "系统分享" : "System Share"}
                  </button>
                  <a
                    href={posterUrl ?? undefined}
                    download={posterFileName(level, dayNumber)}
                    aria-disabled={!posterUrl}
                    onClick={(event) => {
                      if (!posterUrl) {
                        event.preventDefault();
                        return;
                      }
                      setFeedback(
                        language === "zh"
                          ? "高清图已保存到浏览器的默认下载文件夹。"
                          : "The image was saved to your browser's Downloads folder.",
                      );
                    }}
                    className={`inline-flex items-center justify-center gap-2 rounded-full bg-skywash px-5 py-3 font-black text-ocean transition hover:bg-peach ${
                      posterUrl ? "" : "pointer-events-none opacity-60"
                    }`}
                  >
                    {isPreparingPoster ? <LoaderCircle className="animate-spin" size={18} /> : <Download size={18} />}
                    {language === "zh" ? "保存高清图" : "Save Image"}
                  </a>
                  <a
                    href={posterUrl ?? undefined}
                    target="_blank"
                    rel="noreferrer"
                    aria-disabled={!posterUrl}
                    onClick={(event) => {
                      if (!posterUrl) event.preventDefault();
                    }}
                    className={`inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 font-black text-ocean ring-1 ring-blue-100 transition hover:bg-slate-50 ${
                      posterUrl ? "" : "pointer-events-none opacity-60"
                    }`}
                  >
                    <ExternalLink size={18} />
                    {language === "zh" ? "打开原图" : "Open Image"}
                  </a>
                </div>
                {feedback ? (
                  <p className="mt-3 rounded-2xl bg-mint px-4 py-3 text-sm font-black leading-6 text-ocean">{feedback}</p>
                ) : null}
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="inline-flex items-center gap-2 text-sm font-black text-ink">
                    <ImageIcon size={17} />
                    {language === "zh" ? "海报预览 · 3:4" : "Poster Preview · 3:4"}
                  </p>
                  <span className="rounded-full bg-peach px-3 py-1 text-xs font-black text-pop">
                    1080 × 1440
                  </span>
                </div>
                <div className="mx-auto aspect-[3/4] w-full max-w-[500px] overflow-hidden rounded-[22px] border border-orange-100 bg-[#f8f3e8] shadow-soft">
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt={language === "zh" ? "NedPop 今日学习打卡高清海报" : "NedPop daily check-in poster"}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="grid size-full place-items-center text-ocean">
                      <div className="text-center">
                        <LoaderCircle className="mx-auto animate-spin" size={32} />
                        <p className="mt-3 text-sm font-black">
                          {language === "zh" ? "正在生成高清图" : "Creating image"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
