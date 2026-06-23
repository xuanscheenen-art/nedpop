export type WordFamilySeed = {
  familyId: string;
  members: Array<{
    text: string;
    type: "noun" | "verb" | "adjective" | "phrase";
    meaningZh: string;
  }>;
  reasonZh?: string;
  reasonEn?: string;
  examples?: string[];
};

export const wordFamilySeeds: WordFamilySeed[] = [
  {
    familyId: "help-family",
    members: [
      { text: "hulp", type: "noun", meaningZh: "帮助" },
      { text: "helpen", type: "verb", meaningZh: "帮助" },
    ],
    reasonZh: "hulp 是名词“帮助”，helpen 是动词“帮助”。",
    reasonEn: "hulp is the noun help; helpen is the verb to help.",
    examples: ["Ik heb hulp nodig.", "Kunt u mij helpen?"],
  },
  {
    familyId: "work-family",
    members: [
      { text: "werk", type: "noun", meaningZh: "工作" },
      { text: "werken", type: "verb", meaningZh: "工作" },
    ],
    reasonZh: "werk 是名词“工作”，werken 是动词“工作”。",
    reasonEn: "werk is the noun work; werken is the verb to work.",
    examples: ["Ik heb werk.", "Ik werk vandaag."],
  },
  {
    familyId: "question-family",
    members: [
      { text: "vraag", type: "noun", meaningZh: "问题" },
      { text: "vragen", type: "verb", meaningZh: "问" },
    ],
    reasonZh: "vraag 是名词“问题”，vragen 是动词“问”。",
    reasonEn: "vraag is the noun question; vragen is the verb to ask.",
    examples: ["Ik heb een vraag.", "Mag ik iets vragen?"],
  },
  {
    familyId: "answer-family",
    members: [
      { text: "antwoord", type: "noun", meaningZh: "答案" },
      { text: "antwoorden", type: "verb", meaningZh: "回答" },
    ],
    reasonZh: "antwoord 是名词“答案”，antwoorden 是动词“回答”。",
    reasonEn: "antwoord is the noun answer; antwoorden is the verb to answer.",
    examples: ["Ik geef antwoord.", "Kunt u antwoorden?"],
  },
  {
    familyId: "living-family",
    members: [
      { text: "wonen", type: "verb", meaningZh: "居住" },
      { text: "woning", type: "noun", meaningZh: "住房" },
    ],
    reasonZh: "wonen 是“居住”，woning 是“住房”。",
    reasonEn: "wonen means to live somewhere; woning is a home/dwelling.",
    examples: ["Ik woon in Nederland.", "Ik zoek een woning."],
  },
  {
    familyId: "payment-family",
    members: [
      { text: "betalen", type: "verb", meaningZh: "付款" },
      { text: "betaling", type: "noun", meaningZh: "付款" },
      { text: "rekening", type: "noun", meaningZh: "账单" },
    ],
    reasonZh: "betalen 是动作“付款”，betaling 是名词“付款”，rekening 是常被 betaald 的账单。",
    reasonEn: "betalen is the action of paying; betaling is payment; rekening is the bill you pay.",
    examples: ["Ik betaal de rekening.", "De betaling is gelukt."],
  },
  {
    familyId: "change-family",
    members: [
      { text: "veranderen", type: "verb", meaningZh: "改变" },
      { text: "verandering", type: "noun", meaningZh: "变化" },
    ],
    reasonZh: "veranderen 是动词“改变”，verandering 是名词“变化”。",
    reasonEn: "veranderen is to change; verandering is a change.",
    examples: ["Ik wil mijn adres veranderen.", "Dat is een grote verandering."],
  },
  {
    familyId: "insurance-family",
    members: [
      { text: "verzekeren", type: "verb", meaningZh: "投保" },
      { text: "verzekering", type: "noun", meaningZh: "保险" },
      { text: "zorgverzekering", type: "noun", meaningZh: "医疗保险" },
    ],
    reasonZh: "verzekeren 是“投保”，verzekering 是“保险”。",
    reasonEn: "verzekeren is to insure; verzekering is insurance.",
    examples: ["Ik wil mij verzekeren.", "Ik heb een zorgverzekering."],
  },
];
