"use client";

import { createContext, createElement, useContext, useEffect, useMemo, useState } from "react";

export type Language = "zh" | "en";

export const translations = {
  zh: {
    "nav.home": "首页",
    "nav.dashboard": "课程总览",
    "nav.pronunciation": "发音解码",
    "nav.wordLink": "单词泡泡",
    "nav.rules": "语法规则",
    "nav.scenarios": "场景输出",
    "nav.examPractice": "考试练习",
    "nav.pricing": "价格",
    "nav.learningPath": "课程总览",
    "nav.more": "更多",
    "nav.creator": "词库管理",
    "nav.localReview": "内容校对",
    "nav.reviewPool": "复习池",
    "nav.start": "开始学习",

    "method.decode": "解码发音",
    "method.link": "联想单词",
    "method.rule": "掌握规则",
    "method.speak": "场景输出",

    "landing.title": "内德泡泡",
    "landing.subtitle": "用联想法，从零开始学荷兰语",
    "landing.description":
      "先学会发音解码，再用中文记忆梗、拆词和真实搭配记单词，掌握固定语法规则，最后进入真实生活场景练习。",
    "landing.cta.start": "开始学习",
    "landing.cta.decoder": "试试发音解码",
    "landing.methodTitle": "先解码发音，再联想单词，掌握规则，最后进入场景输出。",
    "landing.methodBody": "NedPop 把荷兰语学习拆成清晰步骤：声音、记忆、规则、场景，一步一步走。",
    "landing.toolTitle": "这是学习工具，不是课本页面。",
    "landing.toolBody": "每次学习一个发音、一个记忆梗、一个语法 pattern、一个生活场景。",
    "landing.exampleLink": "联想示例",
    "landing.memoryHook": "中文记忆梗",
    "landing.sound": "发音",
    "landing.meaning": "含义",
    "landing.memory": "记忆",
    "landing.use": "使用",

    "dashboard.title": "从 A1 继续走向 A2",
    "dashboard.description": "今天的学习会混合发音复习、单词联想、固定语法规则和一个真实场景任务。",
    "dashboard.currentStage": "当前阶段",
    "dashboard.nextGoal": "下一目标",
    "dashboard.longTermGoal": "长期目标",
    "dashboard.todayBubbles": "今日学习泡泡",
    "dashboard.continue": "继续学习",
    "dashboard.practiceScenario": "练习场景",
    "dashboard.weakPoints": "我的薄弱点",
    "dashboard.suggestedLesson": "推荐下一课",
    "dashboard.soundProgress": "发音进度",
    "dashboard.wordProgress": "单词进度",
    "dashboard.ruleProgress": "规则进度",
    "dashboard.scenarioProgress": "场景进度",
    "dashboard.currentLevel": "当前阶段",
    "dashboard.target": "下一目标",
    "dashboard.a1Status": "A1 生活基础",
    "dashboard.a2Status": "A2 生活进阶",
    "dashboard.startLesson": "开始这一课",

    "stage.a0.title": "A0 零基础入门",
    "stage.a0.goal": "目标：先会读，能说最简单的问候和自我介绍。",
    "stage.a1.title": "A1 生活基础",
    "stage.a1.goal": "目标：能处理数字、时间、家庭、购物、交通、住址等基础场景。",
    "stage.a2.title": "A2 生活进阶",
    "stage.a2.goal": "目标：能预约医生、去市政厅、租房、请病假、写简单邮件，处理常见生活任务。",
    "stage.b.title": "B1/B2 之后开放",
    "stage.b.goal": "目标：工作、学习和更复杂表达。",

    "label.soundRule": "发音规则",
    "label.mouthPosition": "口型提示",
    "label.commonMistake": "常见误区",
    "label.exampleWords": "例词",
    "label.exampleSentence": "例句",
    "label.wordBreakdown": "拆词联想",
    "label.memoryHook": "中文记忆梗",
    "label.englishBridge": "记忆提示",
    "label.usefulPhrase": "常用短语",
    "label.errorPoint": "易错点",
    "label.miniQuiz": "小测一下",
    "label.verbConjugation": "动词变形",
    "label.articleDetector": "de/het 探测器",
    "label.pluralBuilder": "单复数生成器",
    "label.sentenceOrder": "词序训练",
    "label.scenarioTask": "场景任务",
    "label.speakingPractice": "口语练习",
    "label.writingPractice": "写作练习",
    "label.sampleAnswer": "参考答案",
    "label.usefulWords": "常用词",
    "label.usefulPhrases": "常用短语",
    "label.miniDialogue": "迷你对话",
    "label.checklist": "检查清单",
    "label.practiceFeedback": "练习反馈",
    "label.goodSentence": "好句子",
    "label.grammarCorrection": "语法修正",
    "label.betterPhrase": "更自然表达",
    "label.examTip": "考试提示",
    "label.relatedWords": "相关词",
    "label.noRecording": "浏览器朗读",
    "label.highlightedChunks": "高亮音块",
    "label.pronunciationHints": "发音提示",
    "label.relatedLessons": "相关发音课",
    "label.practiceSteps": "练习步骤",
    "label.correct": "正确",
    "action.openPractice": "展开练习",
    "action.collapse": "收起",

    "pronunciation.title": "发音解码",
    "pronunciation.body": "像自然拼读一样学习荷兰语发音。掌握关键字母和组合音后，就能自己读出很多新单词。",
    "pronunciation.path": "解码路径",
    "pronunciation.soundMap": "发音地图",
    "pronunciation.soundMapBody": "荷兰语核心发音系统",
    "pronunciation.lessonCards": "发音课程卡",
    "pronunciation.lessonCardsBody": "20 个入门发音课程",
    "pronunciation.wordDecoder": "单词解码器",
    "pronunciation.wordDecoderBody": "试试这些荷兰语单词",
    "pronunciation.soundDrill": "发音 Drill",
    "pronunciation.soundDrillBody": "重复短小的视觉练习",
    "pronunciation.quizBody": "检查你记住了什么",
    "pronunciation.inputTitle": "输入一个荷兰语单词",
    "pronunciation.inputHelp": "输入荷兰语单词后，系统会高亮常见发音组合，并链接到相关课程。",

    "wordLink.title": "单词联想",
    "wordLink.body": "不要孤立背荷兰语单词。每个词都变成一个记忆泡泡：拆词、中文记忆梗、真实搭配、发音提示、真实场景和常用短语。",
    "wordLink.recipe": "记忆配方",
    "wordLink.featured": "精选智能单词",
    "wordLink.featuredBody": "从一个词打开整个生活场景",
    "wordLink.cards": "单词联想卡",
    "wordLink.cardsBody": "日常荷兰语记忆泡泡",
    "wordLink.network": "相关词网络",
    "wordLink.networkBody": "把词看成彼此连接的泡泡",
    "wordLink.quizBody": "回忆联想关系",
    "wordLink.create": "创建自己的单词联想",
    "wordLink.placeholder": "自定义联想",
    "wordLink.comingLater": "之后开放",

    "rules.title": "语法规则",
    "rules.body": "荷兰语语法应该被学成清晰 pattern，而不是大段课本解释。每条规则都要可视化、好记、可训练。",
    "rules.loop": "规则训练循环",
    "rules.verbTrainer": "动词训练器",
    "rules.verbBody": "把现在时变位看成一张清楚的表",
    "rules.articleBody": "先找 article 线索，再把例外词整体记住",
    "rules.pluralBody": "把单数词变成复数 pattern",
    "rules.orderBody": "用位置泡泡搭建荷兰语句序",
    "rules.quizBody": "语法小测",

    "scenarios.title": "场景输出",
    "scenarios.body": "学完发音解码、单词联想和语法规则后，进入真实荷兰语生活场景练习口语和写作。",
    "scenarios.cards": "A0-A2 场景卡",
    "scenarios.cardsBody": "在真实生活发生的地方练荷兰语",
    "scenarios.count": "场景",
    "scenarios.a1": "A1 生存表达",
    "scenarios.a2": "A2 生活进阶",
  },
  en: {
    "nav.home": "Home",
    "nav.dashboard": "Courses",
    "nav.pronunciation": "Pronunciation",
    "nav.wordLink": "Word Bubbles",
    "nav.rules": "Grammar",
    "nav.scenarios": "Scenario Output",
    "nav.examPractice": "Exam Practice",
    "nav.pricing": "Pricing",
    "nav.learningPath": "Courses",
    "nav.more": "More",
    "nav.creator": "Word Manager",
    "nav.localReview": "Content Review",
    "nav.reviewPool": "Review Pool",
    "nav.start": "Start Learning",

    "method.decode": "Decode Sounds",
    "method.link": "Link Words",
    "method.rule": "Master Rules",
    "method.speak": "Speak in Scenarios",

    "landing.title": "NedPop",
    "landing.subtitle": "A smarter way to learn Dutch from zero",
    "landing.description":
      "Decode Dutch sounds, connect words through memory hooks, master grammar patterns, and practice real-life scenarios step by step.",
    "landing.cta.start": "Start Learning",
    "landing.cta.decoder": "Try Pronunciation Decoder",
    "landing.methodTitle": "Decode sounds, link words, master rules, then speak in real situations.",
    "landing.methodBody":
      "NedPop turns Dutch into a clear sequence: sound first, memory next, grammar as patterns, then practice in everyday scenarios.",
    "landing.toolTitle": "A learning tool, not a textbook page.",
    "landing.toolBody": "Each session focuses on one sound, one memory hook, one grammar pattern, and one real-life task.",
    "landing.exampleLink": "Example link",
    "landing.memoryHook": "Memory hook",
    "landing.sound": "Sound",
    "landing.meaning": "Meaning",
    "landing.memory": "Memory",
    "landing.use": "Use",

    "dashboard.title": "Keep moving from A1 to A2.",
    "dashboard.description": "Today’s plan mixes sound review, word links, fixed grammar patterns, and one real-life speaking task.",
    "dashboard.currentStage": "Current Stage",
    "dashboard.nextGoal": "Next Goal",
    "dashboard.longTermGoal": "Long-term Goal",
    "dashboard.todayBubbles": "Today’s Learning Bubbles",
    "dashboard.continue": "Continue Learning",
    "dashboard.practiceScenario": "Practice Scenario",
    "dashboard.weakPoints": "Weak Points",
    "dashboard.suggestedLesson": "Suggested Next Lesson",
    "dashboard.soundProgress": "Sound Progress",
    "dashboard.wordProgress": "Word Progress",
    "dashboard.ruleProgress": "Rule Progress",
    "dashboard.scenarioProgress": "Scenario Progress",
    "dashboard.currentLevel": "Current Stage",
    "dashboard.target": "Next Goal",
    "dashboard.a1Status": "A1 Foundation",
    "dashboard.a2Status": "A2 Bridge",
    "dashboard.startLesson": "Start Lesson",

    "stage.a0.title": "A0 Starter",
    "stage.a0.goal": "Goal: Learn to read Dutch sounds and say basic greetings and self-introductions.",
    "stage.a1.title": "A1 Foundation",
    "stage.a1.goal": "Goal: Handle basic daily topics such as numbers, time, family, shopping, transport, weather, and address.",
    "stage.a2.title": "A2 Bridge",
    "stage.a2.goal":
      "Goal: Handle real-life Dutch situations such as GP appointments, municipality visits, housing, sick leave, simple emails, and practical life tasks.",
    "stage.b.title": "B1/B2 Coming Later",
    "stage.b.goal": "Goal: Work, study, and more complex communication.",

    "label.soundRule": "Sound Rule",
    "label.mouthPosition": "Mouth Position",
    "label.commonMistake": "Common Mistake",
    "label.exampleWords": "Example Words",
    "label.exampleSentence": "Example Sentence",
    "label.wordBreakdown": "Word Breakdown",
    "label.memoryHook": "Memory Hook",
    "label.englishBridge": "Memory Hint",
    "label.usefulPhrase": "Useful Phrase",
    "label.errorPoint": "Common Mistake",
    "label.miniQuiz": "Mini Quiz",
    "label.verbConjugation": "Verb Conjugation",
    "label.articleDetector": "De/Het Detective",
    "label.pluralBuilder": "Plural Builder",
    "label.sentenceOrder": "Sentence Order Trainer",
    "label.scenarioTask": "Scenario Task",
    "label.speakingPractice": "Speaking Practice",
    "label.writingPractice": "Writing Practice",
    "label.sampleAnswer": "Sample Answer",
    "label.usefulWords": "Useful Words",
    "label.usefulPhrases": "Useful Phrases",
    "label.miniDialogue": "Mini Dialogue",
    "label.checklist": "Checklist",
    "label.practiceFeedback": "Practice Feedback",
    "label.goodSentence": "Good sentence",
    "label.grammarCorrection": "Grammar correction",
    "label.betterPhrase": "Better phrase",
    "label.examTip": "Exam readiness tip",
    "label.relatedWords": "Related Words",
    "label.noRecording": "Browser voice",
    "label.highlightedChunks": "Highlighted chunks",
    "label.pronunciationHints": "Pronunciation hints",
    "label.relatedLessons": "Related sound lessons",
    "label.practiceSteps": "Practice steps",
    "label.correct": "correct",
    "action.openPractice": "Open Practice",
    "action.collapse": "Collapse",

    "pronunciation.title": "Pronunciation Decoder",
    "pronunciation.body":
      "Learn Dutch pronunciation like a phonics system. Once key letters and sound combinations become familiar, learners can read many new Dutch words by themselves.",
    "pronunciation.path": "Decoder path",
    "pronunciation.soundMap": "Sound Map",
    "pronunciation.soundMapBody": "The core Dutch sound system",
    "pronunciation.lessonCards": "Sound Lesson Cards",
    "pronunciation.lessonCardsBody": "20 starter lessons for phonics-style Dutch reading",
    "pronunciation.wordDecoder": "Word Decoder",
    "pronunciation.wordDecoderBody": "Try supported Dutch words",
    "pronunciation.soundDrill": "Sound Drill",
    "pronunciation.soundDrillBody": "Repeat short visual drills",
    "pronunciation.quizBody": "Check what you remember",
    "pronunciation.inputTitle": "Type a Dutch word",
    "pronunciation.inputHelp": "Type a Dutch word to highlight common sound combinations and related lessons.",

    "wordLink.title": "Word Link",
    "wordLink.body":
      "Users do not memorize isolated Dutch words. Each word becomes a memory bubble with breakdown, Chinese hook, English bridge, sound hint, real-life scene, and useful phrase.",
    "wordLink.recipe": "Memory recipe",
    "wordLink.featured": "Featured smart word",
    "wordLink.featuredBody": "Start with a word that opens a whole scene",
    "wordLink.cards": "Word association cards",
    "wordLink.cardsBody": "Daily Dutch memory bubbles",
    "wordLink.network": "Related word network",
    "wordLink.networkBody": "See words as connected bubbles",
    "wordLink.quizBody": "Recall the association",
    "wordLink.create": "Create your own word link",
    "wordLink.placeholder": "Custom word link",
    "wordLink.comingLater": "Coming later",

    "rules.title": "Rule Engine",
    "rules.body":
      "Dutch grammar should be learned as clear patterns, not long textbook explanations. Each rule here is visual, memorable, and trainable.",
    "rules.loop": "Pattern loop",
    "rules.verbTrainer": "Verb Trainer",
    "rules.verbBody": "Present tense as a simple table",
    "rules.articleBody": "Find article clues before memorizing",
    "rules.pluralBody": "Turn singular words into plural patterns",
    "rules.orderBody": "Build Dutch sentence order with position bubbles",
    "rules.quizBody": "Mini grammar quiz",

    "scenarios.title": "Scenario Output",
    "scenarios.body":
      "After decoding sounds, linking words, and mastering rules, learners practice real Dutch situations with speaking and writing tasks.",
    "scenarios.cards": "A0-A2 scenario cards",
    "scenarios.cardsBody": "Practice Dutch where it actually happens",
    "scenarios.count": "scenarios",
    "scenarios.a1": "A1 survival",
    "scenarios.a2": "A2 bridge",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("zh");

  useEffect(() => {
    const saved = window.localStorage.getItem("nedpop-language");
    if (saved === "zh" || saved === "en") {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem("nedpop-language", nextLanguage);
  };

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key) => translations[language][key] ?? translations.en[key],
    }),
    [language],
  );

  return createElement(LanguageContext.Provider, { value }, children);
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
