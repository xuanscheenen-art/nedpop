import type { DailyWordPack } from "@/types/vocabulary";

export type MicroScenario = {
  id: string;
  level: "A0" | "A1" | "A2" | "B1";
  titleZh: string;
  titleEn: string;
  sceneFlowZh: string[];
  sceneFlowEn: string[];
  targetWords: string[];
  targetPhraseChunks: string[];
  suggestedSentenceOpenings: string[];
};

const beginnerLevel = (level: DailyWordPack["level"]): MicroScenario["level"] =>
  level === "B1" || level === "A2" || level === "A1" ? level : "A0";

const packText = (dayPack: DailyWordPack) =>
  [
    dayPack.id,
    dayPack.theme,
    dayPack.title.zh,
    dayPack.title.en,
    ...dayPack.newWords.map((word) => `${word.dutch} ${word.meaning.zh}`),
    ...dayPack.reviewWords.map((word) => `${word.dutch} ${word.meaning.zh}`),
    ...dayPack.recognitionWords.map((word) => `${word.dutch} ${word.meaning.zh}`),
  ].join(" ").toLowerCase();

const allWords = (dayPack: DailyWordPack) => [
  ...dayPack.newWords,
  ...dayPack.reviewWords,
  ...dayPack.recognitionWords,
].map((word) => word.dutch);

export const generateMicroScenarioForDayPack = (dayPack: DailyWordPack): MicroScenario => {
  const text = packText(dayPack);
  const targetWords = allWords(dayPack);
  const level = beginnerLevel(dayPack.level);

  if (text.includes("greeting") || text.includes("打招呼") || text.includes("礼貌")) {
    return {
      id: `${dayPack.id}-micro-greeting`,
      level,
      titleZh: "见面和礼貌表达",
      titleEn: "Greeting and politeness",
      sceneFlowZh: ["见面打招呼", "说谢谢", "说请/给你", "说再见"],
      sceneFlowEn: ["Say hello", "Say thank you", "Say please/here you are", "Say goodbye"],
      targetWords,
      targetPhraseChunks: ["Hallo.", "Dank je.", "Water, alsjeblieft.", "Tot ziens."],
      suggestedSentenceOpenings: ["Hallo", "Dank", "Tot", "Water"],
    };
  }

  if (text.includes("supermarkt") || text.includes("winkel") || text.includes("brood") || text.includes("买东西")) {
    return {
      id: `${dayPack.id}-micro-supermarket`,
      level: level === "A0" ? "A1" : level,
      titleZh: "在超市买东西",
      titleEn: "Buying groceries",
      sceneFlowZh: ["去超市", "买面包和牛奶", "问价格", "付款"],
      sceneFlowEn: ["Go to the supermarket", "Buy bread and milk", "Ask the price", "Pay"],
      targetWords,
      targetPhraseChunks: ["Ik koop brood en melk.", "Hoeveel kost het brood?", "Kan ik met pin betalen?", "De winkel is open."],
      suggestedSentenceOpenings: ["Ik", "Hoeveel", "Kan", "De"],
    };
  }

  if (text.includes("huisarts") || text.includes("afspraak") || text.includes("ziek") || text.includes("gp")) {
    return {
      id: `${dayPack.id}-micro-gp-appointment`,
      level: "A2",
      titleZh: "预约家庭医生",
      titleEn: "Making a GP appointment",
      sceneFlowZh: ["生病了", "打电话给 huisarts", "预约", "说明疼痛", "请求帮助"],
      sceneFlowEn: ["You are sick", "Call the GP", "Make an appointment", "Describe pain", "Ask for help"],
      targetWords,
      targetPhraseChunks: [
        "Ik ben ziek.",
        "Ik bel de huisarts.",
        "Ik wil graag een afspraak maken.",
        "Ik heb pijn in mijn buik.",
        "Kunt u mij helpen?",
      ],
      suggestedSentenceOpenings: ["Ik", "Kunt u", "Wanneer"],
    };
  }

  if (text.includes("gemeente") || text.includes("formulier") || text.includes("adres") || text.includes("document")) {
    return {
      id: `${dayPack.id}-micro-gemeente-form`,
      level: "A2",
      titleZh: "去市政厅填表",
      titleEn: "Municipality and forms",
      sceneFlowZh: ["去市政厅", "填表", "写地址", "问需要哪些文件"],
      sceneFlowEn: ["Go to the municipality", "Fill in a form", "Write your address", "Ask which documents are needed"],
      targetWords,
      targetPhraseChunks: [
        "Ik ga naar de gemeente.",
        "Ik moet een formulier invullen.",
        "Ik vul mijn adres in.",
        "Welke documenten heb ik nodig?",
      ],
      suggestedSentenceOpenings: ["Ik", "Welke", "Kunt u"],
    };
  }

  if (text.includes("trein") || text.includes("vertraging") || text.includes("station") || text.includes("transport")) {
    return {
      id: `${dayPack.id}-micro-transport`,
      level: level === "A0" ? "A1" : level,
      titleZh: "交通和延误",
      titleEn: "Transport and delays",
      sceneFlowZh: ["去车站", "坐火车", "遇到延误", "询问信息"],
      sceneFlowEn: ["Go to the station", "Take the train", "Deal with a delay", "Ask for information"],
      targetWords,
      targetPhraseChunks: ["Ik ga naar het station.", "Mijn trein heeft vertraging.", "Waar is het spoor?", "Kunt u dat herhalen?"],
      suggestedSentenceOpenings: ["Ik", "Mijn", "Waar", "Kunt u"],
    };
  }

  if (level === "B1" && (text.includes("work") || text.includes("werk") || text.includes("sollicitatie") || text.includes("functie"))) {
    return {
      id: `${dayPack.id}-micro-b1-work`,
      level: "B1",
      titleZh: "工作任务说明",
      titleEn: "Explaining a work task",
      sceneFlowZh: ["说明工作情况", "提到合同/排班", "提出问题", "给出建议或请求"],
      sceneFlowEn: ["Explain the work situation", "Mention contract or schedule", "State a problem", "Make a suggestion or request"],
      targetWords,
      targetPhraseChunks: ["Ik heb een vraag over mijn contract.", "Volgens mijn rooster werk ik morgen.", "Ik stel voor om dit te bespreken."],
      suggestedSentenceOpenings: ["Volgens", "Ik heb", "Ik stel voor", "Daarnaast"],
    };
  }

  if (level === "B1" && (text.includes("education") || text.includes("opleiding") || text.includes("mbo") || text.includes("opdracht"))) {
    return {
      id: `${dayPack.id}-micro-b1-education`,
      level: "B1",
      titleZh: "学习任务说明",
      titleEn: "Explaining a study task",
      sceneFlowZh: ["说明课程或任务", "描述进度", "提出问题", "总结下一步"],
      sceneFlowEn: ["Explain the course or task", "Describe progress", "Ask a question", "Summarize the next step"],
      targetWords,
      targetPhraseChunks: ["Ik volg een opleiding.", "Ik heb een vraag over de opdracht.", "Mijn voorstel is om eerst de tekst te lezen."],
      suggestedSentenceOpenings: ["Ik volg", "Mijn voorstel", "Volgens", "Daarna"],
    };
  }

  if (level === "B1" && (text.includes("brief") || text.includes("tekst") || text.includes("tabel") || text.includes("aanvraag") || text.includes("besluit"))) {
    return {
      id: `${dayPack.id}-micro-b1-official-text`,
      level: "B1",
      titleZh: "读官方文字并回应",
      titleEn: "Reading and responding to an official text",
      sceneFlowZh: ["读信件/表格", "找出期限或决定", "说明自己的情况", "写一句回应"],
      sceneFlowEn: ["Read a letter or table", "Find a deadline or decision", "Explain your situation", "Write one response"],
      targetWords,
      targetPhraseChunks: ["Volgens de brief moet ik reageren.", "In de tabel staat de informatie.", "Ik wil graag uitleg geven."],
      suggestedSentenceOpenings: ["Volgens", "In de tabel", "Ik wil graag", "Daarom"],
    };
  }

  return {
    id: `${dayPack.id}-micro-general`,
    level,
    titleZh: dayPack.title.zh,
    titleEn: dayPack.title.en,
    sceneFlowZh: [dayPack.theme || "本日主题", "识别核心词", "放进可用短句"],
    sceneFlowEn: [dayPack.theme || "Daily theme", "Recognize key words", "Use them in short sentences"],
    targetWords,
    targetPhraseChunks: dayPack.phraseChunks.map((phrase) => phrase.dutch),
    suggestedSentenceOpenings: level === "B1"
      ? ["Volgens", "Daarnaast", "Ik stel voor", "De reden is dat"]
      : level === "A2"
        ? ["Ik", "Kunt u", "Wanneer", "Welke"]
        : ["Ik", "Jij", "Waar", "Wat"],
  };
};
