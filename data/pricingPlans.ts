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
      text("生活词汇", "Daily-life vocabulary"),
      text("语法规则工具", "Grammar rules tools"),
      text("每日单词泡泡", "Daily word bubbles"),
      text("完整复习池", "Full review pool"),
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
      text("预约、改约、家庭医生和药房", "Appointments, rescheduling, GP, and pharmacy"),
      text("gemeente、表格、证件和通知", "Municipality, forms, documents, and notices"),
      text("住房维修、工作排班和请假", "Housing repairs, work schedule, and sick leave"),
      text("交通延误、账单、保险和付款", "Transport delays, bills, insurance, and payment"),
      text("邮件、电话、投诉和求助表达", "Email, phone, complaint, and help-request phrases"),
      text("语法规则工具", "Grammar rules tools"),
      text("完整复习池", "Full review pool"),
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
      text("自我表达、健康、社区、钱、工作、opleiding", "Self-expression, health, neighborhood, money, work, and education"),
      text("旅行、环境、媒体、文化、观点和正式文字", "Travel, environment, media, culture, opinions, and formal texts"),
      text("B1 场景输出卡", "B1 scenario output cards"),
      text("语法规则工具", "Grammar rules tools"),
      text("完整复习池", "Full review pool"),
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
      text("解锁 A1+A2+B1", "Unlock A1+A2+B1"),
      text("后续内容更新", "Future content updates"),
      text("语法规则工具", "Grammar rules tools"),
      text("完整复习池", "Full review pool"),
      text("所有生活任务和工作学习课程", "All practical life, work, and study lessons"),
    ],
  },
];

export const pricingPositioningNote = text(
  "A1/A2/B1 侧重真实生活、政务、工作学习任务，用更直接的方式先把能用的荷兰语跑起来。",
  "A1/A2/B1 focus on practical Dutch for daily life, admin tasks, work, and study, with a lighter path to usable language.",
);
