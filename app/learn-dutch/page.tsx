import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  Ear,
  Flag,
  MessageCircleMore,
  Route,
} from "lucide-react";
import { LoginButton } from "@/components/LoginButton";

const title = "荷兰语学习指南：从 A0 到 B1 的完整路线";
const description =
  "面向中文学习者的荷兰语学习指南，详解 A0、A1、A2、B1 学习路线、荷兰语发音、词汇、语法以及 NT2 考试准备方法。";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "荷兰语学习",
    "荷兰语入门",
    "荷兰语学习路线",
    "荷兰语A0",
    "荷兰语A1",
    "荷兰语A2",
    "荷兰语B1",
    "NT2考试",
    "Learn Dutch",
  ],
  alternates: {
    canonical: "/learn-dutch",
  },
  openGraph: {
    type: "article",
    url: "/learn-dutch",
    siteName: "NedPop",
    title,
    description,
    locale: "zh_CN",
  },
};

const stages = [
  {
    level: "A0",
    label: "零基础起步",
    summary: "先解决“看不懂、读不出、开不了口”。",
    details: ["认识荷兰语字母与组合音", "掌握问候、自我介绍和基础数字", "用最小句型完成第一次表达"],
  },
  {
    level: "A1",
    label: "生活基础",
    summary: "建立处理日常信息所需的基础荷兰语。",
    details: ["积累家庭、购物、时间和居住词汇", "掌握现在时、de/het 与基础词序", "听懂并回答简短的生活问题"],
  },
  {
    level: "A2",
    label: "生活任务",
    summary: "从“会几个句子”走向“能完成一件事”。",
    details: ["处理预约、交通、医疗和市政场景", "扩展过去时、完成时与常用连接方式", "读懂通知并进行连续对话"],
  },
  {
    level: "B1",
    label: "独立表达",
    summary: "能够说明经历、观点、原因与计划。",
    details: ["组织较完整的口头和书面表达", "理解工作、社会与公共服务话题", "为 NT2 Programma I 所需能力打基础"],
  },
] as const;

const reasons = [
  "更顺畅地处理荷兰生活中的医疗、住房、交通和政府事务",
  "提升求职、工作沟通以及融入学校和社区的能力",
  "为 inburgering、NT2 考试和后续进阶学习建立语言基础",
] as const;

const learningTools = [
  {
    icon: Ear,
    title: "先建立发音底座",
    body: "从字母、组合音和特殊读音开始，看到新词时先有能力把它读出来。",
    href: "/pronunciation",
    linkLabel: "使用发音解码器",
  },
  {
    icon: BrainCircuit,
    title: "把词放进关系里记",
    body: "用记忆路径、拆词、词族和关联泡泡理解词义，不把单词孤零零地硬背。",
    href: "/word-link",
    linkLabel: "进入单词泡泡",
  },
  {
    icon: BookOpenCheck,
    title: "语法跟着任务补",
    body: "先学当前表达真正需要的规则，再通过例句确认词序、变形和使用位置。",
    href: "/rules",
    linkLabel: "查看语法规则",
  },
  {
    icon: MessageCircleMore,
    title: "最后落到真实表达",
    body: "把发音、词汇和语法带回生活场景，逐步练习能够真正说出口的荷兰语。",
    href: "/scenarios",
    linkLabel: "练习生活场景",
  },
] as const;

export default function LearnDutchPage() {
  return (
    <main className="bg-white text-ink">
      <article>
        <header className="border-b border-blue-100 bg-skywash">
          <div className="mx-auto grid min-h-[600px] max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
            <div>
              <p className="text-sm font-black text-pop">荷兰语学习指南</p>
              <h1 className="mt-5 max-w-4xl text-5xl font-black leading-tight sm:text-6xl">
                荷兰语学习指南：从 A0 到 B1 的完整路线
              </h1>
              <p className="mt-6 max-w-3xl text-xl font-bold leading-9 text-ocean/75">
                中文学习者不需要一开始就吞下一整本语法书。先读得出来，再把高频词放进句子，最后用它完成生活任务，这条路线更清楚，也更容易坚持。
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-4 font-black text-white transition hover:bg-ocean"
                >
                  从 A0 开始学习
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-6 py-4 font-black text-ocean transition hover:bg-blue-50"
                >
                  查看 A1–B1 课程
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md py-8" aria-label="A0 到 B1 学习路线概览">
              <div className="absolute bottom-12 left-[35px] top-12 w-1 rounded-full bg-pop/35" />
              <div className="space-y-5">
                {stages.map((stage) => (
                  <div key={stage.level} className="relative flex items-center gap-5">
                    <span className="relative z-10 flex size-[72px] shrink-0 items-center justify-center rounded-full bg-ink text-xl font-black text-white ring-8 ring-white/80">
                      {stage.level}
                    </span>
                    <div className="min-w-0 border-b border-blue-200 py-5">
                      <p className="text-lg font-black">{stage.label}</p>
                      <p className="mt-1 font-bold leading-7 text-ocean/70">{stage.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="what-is-dutch-learning">
          <p className="text-sm font-black text-pop">先理解目标</p>
          <h2 id="what-is-dutch-learning" className="mt-3 text-4xl font-black">什么是荷兰语学习？</h2>
          <div className="mt-7 space-y-5 text-lg font-bold leading-9 text-ocean/75">
            <p>
              荷兰语学习不只是记住中文释义。真正的学习包括听清声音、读出单词、理解句子结构，并在需要时自己组织表达。发音、词汇、语法和输出不是四门分开的课，而是一条连续的能力路线。
            </p>
            <p>
              对中文母语者来说，荷兰语中的组合音、动词位置、名词冠词和词形变化都需要专门适应。合理的顺序是先建立发音和高频表达，再逐步补充语法，而不是等“全部学完”才开始说。
            </p>
          </div>
        </section>

        <section className="border-y border-blue-100 bg-slate-50" aria-labelledby="why-learn-dutch">
          <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
            <p className="text-sm font-black text-pop">连接真实生活</p>
            <h2 id="why-learn-dutch" className="mt-3 text-4xl font-black">为什么学习荷兰语？</h2>
            <div className="mt-9 grid gap-7 md:grid-cols-3">
              {reasons.map((reason, index) => (
                <div key={reason} className="border-t-4 border-pop pt-5">
                  <span className="text-sm font-black text-ocean/45">0{index + 1}</span>
                  <p className="mt-3 text-lg font-black leading-8">{reason}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="learning-route">
          <div className="max-w-3xl">
            <p className="text-sm font-black text-pop">CEFR 能力阶梯</p>
            <h2 id="learning-route" className="mt-3 text-4xl font-black">A0 到 B1 学习路线</h2>
            <p className="mt-5 text-lg font-bold leading-8 text-ocean/70">
              A0 是零基础准备阶段，A1、A2、B1 对应逐步提升的语言能力。每一级都应该建立在前一级能够真实使用的基础上。
            </p>
          </div>

          <div className="mt-12 divide-y divide-blue-100 border-y border-blue-100">
            {stages.map((stage) => (
              <section key={stage.level} className="grid gap-6 py-10 md:grid-cols-[180px_1fr]" aria-labelledby={`stage-${stage.level}`}>
                <div>
                  <p className="text-5xl font-black text-pop">{stage.level}</p>
                  <h3 id={`stage-${stage.level}`} className="mt-2 text-xl font-black">{stage.label}</h3>
                </div>
                <div>
                  <p className="text-xl font-black leading-8">{stage.summary}</p>
                  <ul className="mt-5 grid gap-3 sm:grid-cols-3">
                    {stage.details.map((detail) => (
                      <li key={detail} className="flex items-start gap-2 font-bold leading-7 text-ocean/75">
                        <CheckCircle2 className="mt-1 shrink-0 text-pop" size={18} />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            ))}
          </div>
        </section>

        <section className="bg-ink text-white" aria-labelledby="nt2-exam">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
            <div>
              <Flag className="text-pop" size={36} />
              <p className="mt-6 text-sm font-black text-orange-200">从通用能力到考试任务</p>
              <h2 id="nt2-exam" className="mt-3 text-4xl font-black">NT2 考试与 B1 有什么关系？</h2>
            </div>
            <div className="space-y-5 text-lg font-bold leading-9 text-blue-50/85">
              <p>
                Staatsexamen NT2 Programma I 大体面向 B1 水平，考查阅读、听力、口语和写作。达到 B1 并不等于自动熟悉考试，但稳定的 B1 词汇、句子组织和理解能力，是进行题型训练的前提。
              </p>
              <p>
                更有效的准备方式是先完成 A0–B1 的能力积累，再针对考试指令、时间限制和答题形式练习，而不是只背几套模板。
              </p>
              <Link href="/exam-practice" className="inline-flex items-center gap-2 font-black text-orange-200 hover:text-pop">
                查看 NT2 练习
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="nedpop-method">
          <div className="max-w-3xl">
            <p className="text-sm font-black text-pop">NedPop 学习方式</p>
            <h2 id="nedpop-method" className="mt-3 text-4xl font-black">把声音、单词和句子连起来</h2>
            <p className="mt-5 text-lg font-bold leading-8 text-ocean/70">
              NedPop 面向中文学习者，把学习内容按“先能读、再理解、最后能用”的顺序组织起来。
            </p>
          </div>
          <div className="mt-12 grid gap-x-10 gap-y-12 md:grid-cols-2">
            {learningTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div key={tool.title} className="grid grid-cols-[52px_1fr] gap-4">
                  <span className="flex size-12 items-center justify-center rounded-full bg-peach text-pop">
                    <Icon size={23} />
                  </span>
                  <div>
                    <h3 className="text-xl font-black">{tool.title}</h3>
                    <p className="mt-2 font-bold leading-7 text-ocean/70">{tool.body}</p>
                    <Link href={tool.href} className="mt-4 inline-flex items-center gap-1.5 font-black text-ocean hover:text-pop">
                      {tool.linkLabel}
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="border-t border-blue-100 bg-peach" aria-labelledby="start-learning">
          <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-8 px-4 py-16 sm:px-6 md:flex-row md:items-center lg:px-8">
            <div>
              <Route className="text-pop" size={32} />
              <h2 id="start-learning" className="mt-4 text-4xl font-black">从今天能完成的一小步开始</h2>
              <p className="mt-4 max-w-2xl text-lg font-bold leading-8 text-ocean/70">
                先体验免费的 A0 内容。注册后可以保存学习进度，并把后续课程绑定到自己的账号。
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-black text-white hover:bg-ocean">
                开始学习
                <ArrowRight size={17} />
              </Link>
              <LoginButton />
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}
