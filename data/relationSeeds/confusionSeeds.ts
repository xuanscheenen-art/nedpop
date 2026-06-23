export type ConfusionSeed = {
  a: string;
  b: string;
  reasonZh: string;
  reasonEn: string;
  exampleA?: string;
  exampleB?: string;
};

export const confusionSeeds: ConfusionSeed[] = [
  { a: "hulp", b: "helpen", reasonZh: "hulp 是名词，helpen 是动词。", reasonEn: "hulp is a noun; helpen is a verb.", exampleA: "Ik heb hulp nodig.", exampleB: "Kunt u mij helpen?" },
  { a: "niet", b: "geen", reasonZh: "geen 放在无冠词名词前；niet 否定其他部分。", reasonEn: "geen negates nouns without an article; niet negates other parts.", exampleA: "Ik heb geen tijd.", exampleB: "Ik kom niet." },
  { a: "kennen", b: "weten", reasonZh: "kennen 是认识人/熟悉事物；weten 是知道事实。", reasonEn: "kennen is to know people/places; weten is to know facts.", exampleA: "Ik ken hem.", exampleB: "Ik weet het." },
  { a: "u", b: "jij", reasonZh: "u 是礼貌“您”；jij 是普通“你”。", reasonEn: "u is formal you; jij is informal you.", exampleA: "Hoe heet u?", exampleB: "Hoe heet jij?" },
  { a: "u", b: "je", reasonZh: "u 是礼貌“您”；je 是普通弱读“你”。", reasonEn: "u is formal you; je is informal unstressed you.", exampleA: "Kunt u mij helpen?", exampleB: "Kun je mij helpen?" },
  { a: "zij", b: "ze", reasonZh: "zij/ze 都可表示 she 或 they，要靠句子判断。", reasonEn: "zij/ze can mean she or they; use the sentence to tell.", exampleA: "Zij komt.", exampleB: "Ze komen." },
  { a: "alsjeblieft", b: "graag", reasonZh: "alsjeblieft 常是“请/给你”；graag 是“愿意/想要”。", reasonEn: "alsjeblieft means please/here you are; graag means gladly/would like.", exampleA: "Water, alsjeblieft.", exampleB: "Ik wil graag water." },
  { a: "dag", b: "tot ziens", reasonZh: "dag 可表示你好或再见；tot ziens 只表示再见。", reasonEn: "dag can mean hello or bye; tot ziens means goodbye.", exampleA: "Dag.", exampleB: "Tot ziens." },
  { a: "Engels", b: "Engelsen", reasonZh: "Engels 是英语；Engelsen 是英国人/英格兰人复数，不要混。", reasonEn: "Engels is the English language; Engelsen means English people.", exampleA: "Ik spreek Engels.", exampleB: "De Engelsen spreken Engels." },
];
