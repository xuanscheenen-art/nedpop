export type CategorySeed = {
  categoryId: string;
  labelZh: string;
  labelEn: string;
  members: string[];
  reasonZh: string;
  reasonEn: string;
};

export const categorySeeds: CategorySeed[] = [
  {
    categoryId: "maand",
    labelZh: "月份",
    labelEn: "months",
    members: ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"],
    reasonZh: "这些都是月份，按 kalender 顺序记。",
    reasonEn: "These are months. Learn them in calendar order.",
  },
  {
    categoryId: "tijdseenheid",
    labelZh: "时间单位",
    labelEn: "time units",
    members: ["dag", "week", "maand", "jaar", "uur", "minuut"],
    reasonZh: "这些都是时间单位，用来表达日期、时间和时长。",
    reasonEn: "These are time units used for dates, clock time, and duration.",
  },
  {
    categoryId: "taal",
    labelZh: "语言",
    labelEn: "languages",
    members: ["Nederlands", "Engels", "Chinees"],
    reasonZh: "这些都是语言名，常和 spreken / leren / begrijpen 搭配。",
    reasonEn: "These are language names and combine with spreken / leren / begrijpen.",
  },
  {
    categoryId: "familie",
    labelZh: "家庭成员",
    labelEn: "family",
    members: ["moeder", "vader", "ouders", "broer", "zus", "kind", "zoon", "dochter"],
    reasonZh: "这些是家庭成员，按人物关系一起记。",
    reasonEn: "These are family members. Learn them by family role.",
  },
  {
    categoryId: "vervoer",
    labelZh: "交通",
    labelEn: "transport",
    members: ["trein", "bus", "fiets", "auto", "station", "halte", "kaartje"],
    reasonZh: "这些都出现在出行场景里：交通工具、站点和票。",
    reasonEn: "These belong to travel: vehicles, stops, and tickets.",
  },
  {
    categoryId: "eten-drinken",
    labelZh: "吃喝",
    labelEn: "food and drink",
    members: ["brood", "melk", "water", "koffie", "thee", "rijst", "appel", "kaas"],
    reasonZh: "这些是基础食物/饮料词，常和 eten / drinken / kopen 搭配。",
    reasonEn: "These are basic food and drink words and combine with eten / drinken / kopen.",
  },
  {
    categoryId: "gezondheid",
    labelZh: "健康",
    labelEn: "health",
    members: ["huisarts", "ziekenhuis", "apotheek", "tandarts", "pijn", "ziek", "koorts", "medicijn"],
    reasonZh: "这些属于健康和看病场景。",
    reasonEn: "These belong to health and medical-care situations.",
  },
  {
    categoryId: "gemeente",
    labelZh: "市政办事",
    labelEn: "municipality",
    members: ["gemeente", "formulier", "adres", "paspoort", "afspraak", "inschrijven"],
    reasonZh: "这些常在市政厅办事流程里一起出现。",
    reasonEn: "These often appear together in municipality procedures.",
  },
];
