import type { CourseLevel, LocalizedText } from "@/types/course";
import type { UserAccess } from "@/lib/entitlements";

export type PricingPlanId = "a0-free" | "a1-pack" | "a2-pack" | "b1-pack" | "bundle";

export type PricingPlan = {
  id: PricingPlanId;
  nameZh: string;
  nameEn: string;
  price: string;
  badge?: string;
  accessLevel: UserAccess;
  unlocks: CourseLevel[];
  features: LocalizedText[];
  loginRequired: boolean;
};

const text = (zh: string, en: string): LocalizedText => ({ zh, en });

export const pricingPlans: PricingPlan[] = [
  {
    id: "a0-free",
    nameZh: "A0 免费入门",
    nameEn: "A0 Free Starter",
    price: "€0",
    accessLevel: "free",
    unlocks: ["A0"],
    loginRequired: false,
    features: [
      text("A0 12 课主线", "12 A0 core lessons"),
      text("20 天免费每日词包", "20 free daily word packs"),
      text("发音解码和特殊音", "Pronunciation decoder and key sounds"),
      text("问候、姓名、住处、语言", "Greetings, name, residence, and languages"),
      text("数字 0-100 和自我介绍", "Numbers 0-100 and self-introduction"),
      text("无需登录即可开始", "Start without login"),
    ],
  },
  {
    id: "a1-pack",
    nameZh: "A1 生活基础包",
    nameEn: "A1 Life Foundation Pack",
    price: "€19",
    accessLevel: "a1",
    unlocks: ["A1"],
    loginRequired: true,
    features: [
      text("A1 18 课", "18 A1 lessons"),
      text("从生存表达走向完整日常交流", "Move from survival phrases to everyday communication"),
      text("发音、单词泡泡和记忆路径", "Pronunciation, word bubbles, and memory paths"),
      text("按需查看语法规则", "Grammar rules when you need them"),
      text("错词回到复习池反复巩固", "Review missed words until they stick"),
    ],
  },
  {
    id: "a2-pack",
    nameZh: "A2 生活任务包",
    nameEn: "A2 Practical Life Task Pack",
    price: "€39",
    accessLevel: "a2",
    unlocks: ["A2"],
    loginRequired: true,
    features: [
      text("A2 20 课", "20 A2 lessons"),
      text("60 天生活任务词包", "60 days of practical task word packs"),
      text("处理预约、家庭医生和药房沟通", "Handle appointments, GP visits, and pharmacy conversations"),
      text("看懂 gemeente 表格、证件和通知", "Understand municipality forms, documents, and notices"),
      text("解决住房、工作、交通和付款问题", "Handle housing, work, transport, and payment issues"),
      text("能写邮件、打电话、投诉和求助", "Write emails, make calls, complain, and ask for help"),
      text("语法工具和完整复习池", "Grammar tools and the full review pool"),
    ],
  },
  {
    id: "b1-pack",
    nameZh: "B1 独立表达包",
    nameEn: "B1 Independent Task Pack",
    price: "€39",
    accessLevel: "b1",
    unlocks: ["B1"],
    loginRequired: true,
    features: [
      text("B1 24 课", "24 B1 lessons"),
      text("70 天教材主题词包", "70 days of textbook-theme word packs"),
      text("独立表达观点、经验和理由", "Express opinions, experiences, and reasons independently"),
      text("覆盖工作、opleiding、健康和社区", "Cover work, education, health, and community life"),
      text("理解媒体、文化、环境和正式文字", "Understand media, culture, environmental topics, and formal texts"),
      text("用场景输出卡把输入变成表达", "Turn input into usable speech with scenario cards"),
      text("语法工具和完整复习池", "Grammar tools and the full review pool"),
    ],
  },
  {
    id: "bundle",
    nameZh: "全能通关包",
    nameEn: "All Access Pass",
    price: "€59",
    badge: "Early Access",
    accessLevel: "bundle",
    unlocks: ["A1", "A2", "B1"],
    loginRequired: true,
    features: [
      text("完整解锁 A1+A2+B1 共 62 课", "Unlock all 62 lessons across A1, A2, and B1"),
      text("发音、记忆、语法、场景和复习完整闭环", "The full pronunciation, memory, grammar, scenario, and review loop"),
      text("所有生活、政务、工作和学习任务", "All daily life, admin, work, and study tasks"),
      text("包含后续内容更新", "Includes future content updates"),
    ],
  },
];

export const pricingPositioningNote = text(
  "A1/A2/B1 侧重真实生活、政务、工作学习任务，用更直接的方式先把能用的荷兰语跑起来。",
  "A1/A2/B1 focus on practical Dutch for daily life, admin tasks, work, and study, with a lighter path to usable language.",
);
