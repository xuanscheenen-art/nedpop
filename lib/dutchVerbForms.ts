import type { LocalizedText } from "@/types/course";
import type { WordItem } from "@/types/vocabulary";
import { specialForms } from "@/data/specialForms";

const text = (zh: string, en: string): LocalizedText => ({ zh, en });

export type VerbUsageCard = {
  infinitive: string;
  ikForm: string;
  jijForm: string;
  wijForm: string;
  rule: LocalizedText;
  hint: LocalizedText;
  examples: string[];
};

export type FiniteVerbForm = {
  form: string;
  meaningZh: string;
  meaningEn: string;
  roleZh: string;
  roleEn: string;
  exampleDutch: string;
  exampleZh: string;
  exampleEn: string;
};

export type FiniteVerbFamily = {
  infinitive: string;
  infinitiveMeaningZh: string;
  infinitiveMeaningEn: string;
  forms: FiniteVerbForm[];
  tableZh: string;
  tableEn: string;
};

export type FiniteVerbFormInfo = FiniteVerbFamily & {
  current: FiniteVerbForm;
  isInfinitive: boolean;
  hookZh: string;
  hookEn: string;
  explanationZh: string;
  explanationEn: string;
  usageZh: string;
  usageEn: string;
  warningZh?: string;
  warningEn?: string;
};

type StemResult = {
  stem: string;
  ruleZh: string;
  ruleEn: string;
};

const finiteVerbFamilies: Record<string, FiniteVerbFamily> = {
  zijn: {
    infinitive: "zijn",
    infinitiveMeaningZh: "是/在",
    infinitiveMeaningEn: "be",
    forms: [
      { form: "ben", meaningZh: "我是/我在", meaningEn: "am", roleZh: "ik 形式", roleEn: "ik form", exampleDutch: "Ik ben Lin.", exampleZh: "我是 Lin。", exampleEn: "I am Lin." },
      { form: "bent", meaningZh: "你是/你在", meaningEn: "are", roleZh: "jij/je/u 形式", roleEn: "jij/je/u form", exampleDutch: "Jij bent student.", exampleZh: "你是学生。", exampleEn: "You are a student." },
      { form: "is", meaningZh: "他/她/它/这是", meaningEn: "is", roleZh: "hij/zij/het/dit/dat 形式", roleEn: "hij/zij/het/dit/dat form", exampleDutch: "Dit is mijn boek.", exampleZh: "这是我的书。", exampleEn: "This is my book." },
      { form: "zijn", meaningZh: "是/在", meaningEn: "are / be", roleZh: "原形/复数形式", roleEn: "infinitive/plural form", exampleDutch: "Wij zijn klaar.", exampleZh: "我们准备好了。", exampleEn: "We are ready." },
    ],
    tableZh: "ik ben / jij bent / hij is / wij zijn",
    tableEn: "ik ben / jij bent / hij is / wij zijn",
  },
  hebben: {
    infinitive: "hebben",
    infinitiveMeaningZh: "有",
    infinitiveMeaningEn: "have",
    forms: [
      { form: "heb", meaningZh: "我有", meaningEn: "have", roleZh: "ik 形式", roleEn: "ik form", exampleDutch: "Ik heb tijd.", exampleZh: "我有时间。", exampleEn: "I have time." },
      { form: "hebt", meaningZh: "你有", meaningEn: "have", roleZh: "jij/je/u 形式", roleEn: "jij/je/u form", exampleDutch: "Jij hebt tijd.", exampleZh: "你有时间。", exampleEn: "You have time." },
      { form: "heeft", meaningZh: "他/她/它有", meaningEn: "has", roleZh: "hij/zij/het 形式", roleEn: "hij/zij/het form", exampleDutch: "Zij heeft een afspraak.", exampleZh: "她有一个预约。", exampleEn: "She has an appointment." },
      { form: "hebben", meaningZh: "有", meaningEn: "have", roleZh: "原形/复数形式", roleEn: "infinitive/plural form", exampleDutch: "Wij hebben les.", exampleZh: "我们有课。", exampleEn: "We have class." },
    ],
    tableZh: "ik heb / jij hebt / hij heeft / wij hebben",
    tableEn: "ik heb / jij hebt / hij heeft / wij hebben",
  },
  heten: {
    infinitive: "heten",
    infinitiveMeaningZh: "叫/名字是",
    infinitiveMeaningEn: "be called / be named",
    forms: [
      { form: "heet", meaningZh: "我/你/他叫", meaningEn: "am/is called", roleZh: "ik/jij/hij/zij 形式", roleEn: "ik/jij/hij/zij form", exampleDutch: "Ik heet Lin.", exampleZh: "我叫 Lin。", exampleEn: "My name is Lin." },
      { form: "heten", meaningZh: "叫/名字是", meaningEn: "are called / be named", roleZh: "原形/复数形式", roleEn: "infinitive/plural form", exampleDutch: "Wij heten Li.", exampleZh: "我们姓 Li。", exampleEn: "We are called Li." },
    ],
    tableZh: "ik heet / jij heet / hij heet / wij heten",
    tableEn: "ik heet / jij heet / hij heet / wij heten",
  },
  kunnen: {
    infinitive: "kunnen",
    infinitiveMeaningZh: "能/可以",
    infinitiveMeaningEn: "can / be able to",
    forms: [
      { form: "kan", meaningZh: "我/他可以", meaningEn: "can", roleZh: "ik/hij/zij/het 形式", roleEn: "ik/hij/zij/het form", exampleDutch: "Ik kan helpen.", exampleZh: "我可以帮忙。", exampleEn: "I can help." },
      { form: "kunt", meaningZh: "你/您可以", meaningEn: "can", roleZh: "jij/je/u 形式", roleEn: "jij/je/u form", exampleDutch: "U kunt hier wachten.", exampleZh: "您可以在这里等。", exampleEn: "You can wait here." },
      { form: "kunnen", meaningZh: "能/可以", meaningEn: "can", roleZh: "原形/复数形式", roleEn: "infinitive/plural form", exampleDutch: "Wij kunnen komen.", exampleZh: "我们可以来。", exampleEn: "We can come." },
    ],
    tableZh: "ik kan / jij kunt / hij kan / wij kunnen",
    tableEn: "ik kan / jij kunt / hij kan / wij kunnen",
  },
  willen: {
    infinitive: "willen",
    infinitiveMeaningZh: "想要",
    infinitiveMeaningEn: "want",
    forms: [
      { form: "wil", meaningZh: "我/他想要", meaningEn: "want", roleZh: "ik/hij/zij/het 形式", roleEn: "ik/hij/zij/het form", exampleDutch: "Ik wil koffie.", exampleZh: "我想要咖啡。", exampleEn: "I want coffee." },
      { form: "wilt", meaningZh: "你想要", meaningEn: "want", roleZh: "jij/je 形式", roleEn: "jij/je form", exampleDutch: "Jij wilt water.", exampleZh: "你想要水。", exampleEn: "You want water." },
      { form: "willen", meaningZh: "想要", meaningEn: "want", roleZh: "原形/复数形式", roleEn: "infinitive/plural form", exampleDutch: "Wij willen betalen.", exampleZh: "我们想付款。", exampleEn: "We want to pay." },
    ],
    tableZh: "ik wil / jij wilt / hij wil / wij willen",
    tableEn: "ik wil / jij wilt / hij wil / wij willen",
  },
  moeten: {
    infinitive: "moeten",
    infinitiveMeaningZh: "必须/需要",
    infinitiveMeaningEn: "must / have to",
    forms: [
      { form: "moet", meaningZh: "必须/需要", meaningEn: "must / have to", roleZh: "单数形式", roleEn: "singular form", exampleDutch: "Ik moet naar de gemeente.", exampleZh: "我必须去市政厅。", exampleEn: "I have to go to the municipality." },
      { form: "moeten", meaningZh: "必须/需要", meaningEn: "must / have to", roleZh: "原形/复数形式", roleEn: "infinitive/plural form", exampleDutch: "Wij moeten wachten.", exampleZh: "我们必须等。", exampleEn: "We have to wait." },
    ],
    tableZh: "ik moet / jij moet / hij moet / wij moeten",
    tableEn: "ik moet / jij moet / hij moet / wij moeten",
  },
  gaan: {
    infinitive: "gaan",
    infinitiveMeaningZh: "去",
    infinitiveMeaningEn: "go",
    forms: [
      { form: "ga", meaningZh: "我去", meaningEn: "go", roleZh: "ik 形式", roleEn: "ik form", exampleDutch: "Ik ga naar huis.", exampleZh: "我回家。", exampleEn: "I go home." },
      { form: "gaat", meaningZh: "你/他去", meaningEn: "goes", roleZh: "jij/hij/zij/het 形式", roleEn: "jij/hij/zij/het form", exampleDutch: "Hij gaat naar school.", exampleZh: "他去学校。", exampleEn: "He goes to school." },
      { form: "gaan", meaningZh: "去", meaningEn: "go", roleZh: "原形/复数形式", roleEn: "infinitive/plural form", exampleDutch: "Wij gaan samen.", exampleZh: "我们一起去。", exampleEn: "We go together." },
    ],
    tableZh: "ik ga / jij gaat / hij gaat / wij gaan",
    tableEn: "ik ga / jij gaat / hij gaat / wij gaan",
  },
  lezen: {
    infinitive: "lezen",
    infinitiveMeaningZh: "读",
    infinitiveMeaningEn: "read",
    forms: [
      { form: "lees", meaningZh: "我读/读吧", meaningEn: "read", roleZh: "ik 形式/命令形", roleEn: "ik form / imperative", exampleDutch: "Ik lees de brief.", exampleZh: "我读这封信。", exampleEn: "I read the letter." },
      { form: "leest", meaningZh: "你/他读", meaningEn: "read / reads", roleZh: "jij/hij/zij 形式", roleEn: "jij/hij/zij form", exampleDutch: "Hij leest de zin.", exampleZh: "他读这个句子。", exampleEn: "He reads the sentence." },
      { form: "lezen", meaningZh: "读", meaningEn: "read", roleZh: "原形/复数形式", roleEn: "infinitive/plural form", exampleDutch: "Wij lezen samen.", exampleZh: "我们一起读。", exampleEn: "We read together." },
    ],
    tableZh: "ik lees / jij leest / hij leest / wij lezen",
    tableEn: "ik lees / jij leest / hij leest / wij lezen",
  },
  schrijven: {
    infinitive: "schrijven",
    infinitiveMeaningZh: "写",
    infinitiveMeaningEn: "write",
    forms: [
      { form: "schrijf", meaningZh: "我写/写吧", meaningEn: "write", roleZh: "ik 形式/命令形", roleEn: "ik form / imperative", exampleDutch: "Ik schrijf mijn naam.", exampleZh: "我写我的名字。", exampleEn: "I write my name." },
      { form: "schrijft", meaningZh: "你/他写", meaningEn: "write / writes", roleZh: "jij/hij/zij 形式", roleEn: "jij/hij/zij form", exampleDutch: "Zij schrijft het adres.", exampleZh: "她写地址。", exampleEn: "She writes the address." },
      { form: "schrijven", meaningZh: "写", meaningEn: "write", roleZh: "原形/复数形式", roleEn: "infinitive/plural form", exampleDutch: "Wij schrijven een email.", exampleZh: "我们写一封邮件。", exampleEn: "We write an email." },
    ],
    tableZh: "ik schrijf / jij schrijft / hij schrijft / wij schrijven",
    tableEn: "ik schrijf / jij schrijft / hij schrijft / wij schrijven",
  },
};

const finiteVerbFormToInfinitive = Object.fromEntries(
  Object.values(finiteVerbFamilies).flatMap((family) =>
    family.forms.map((form) => [form.form, family.infinitive]),
  ),
) as Record<string, string>;

// Perfect participles are separate study entries in the vocabulary plan too.
// Route them back to their infinitive instead of generating a generic verb card.
const pastParticipleToInfinitive = Object.fromEntries(
  specialForms.flatMap((entry) => {
    if (!("pastParticiple" in entry) || !entry.pastParticiple || !entry.infinitive) return [];
    return [[entry.pastParticiple.toLowerCase(), entry.infinitive.toLowerCase()] as const];
  }),
) as Record<string, string>;

export const infinitiveForPastParticiple = (form: string) =>
  pastParticipleToInfinitive[form.trim().toLowerCase()];

export function finiteVerbFormInfoFor(wordOrText: WordItem | string): FiniteVerbFormInfo | undefined {
  const form = (typeof wordOrText === "string" ? wordOrText : wordOrText.dutch).trim().toLowerCase();
  const infinitive = finiteVerbFamilies[form]?.infinitive ?? finiteVerbFormToInfinitive[form];
  if (!infinitive) return undefined;
  const family = finiteVerbFamilies[infinitive];
  const current = family.forms.find((item) => item.form === form) ?? family.forms.find((item) => item.form === infinitive);
  if (!current) return undefined;
  const isInfinitive = form === infinitive;
  return {
    ...family,
    current,
    isInfinitive,
    hookZh: isInfinitive ? `${infinitive} 整组变位：${family.tableZh}` : `${current.form} = ${infinitive} 的${current.roleZh}`,
    hookEn: isInfinitive ? `${infinitive} forms: ${family.tableEn}` : `${current.form} = the ${current.roleEn} of ${infinitive}`,
    explanationZh: isInfinitive
      ? `${infinitive} 是动词原形，也会出现在复数主语后；这组要按主语整块记。`
      : `${current.form} 不是新词；它是 ${infinitive} 跟主语/命令句变出来的样子。`,
    explanationEn: isInfinitive
      ? `${infinitive} is the infinitive and also appears with plural subjects; learn the whole subject-form set.`
      : `${current.form} is not a new verb; it is a subject-based form of ${infinitive}.`,
    usageZh: `${family.tableZh}。${current.exampleDutch} = ${current.exampleZh}`,
    usageEn: `${family.tableEn}. ${current.exampleDutch} = ${current.exampleEn}`,
    warningZh: isInfinitive ? undefined : `别把 ${current.form} 当独立动词；回到原形 ${infinitive} 才能看懂整组。`,
    warningEn: isInfinitive ? undefined : `Do not treat ${current.form} as a separate verb; connect it back to ${infinitive}.`,
  };
}

export function finiteVerbFormMeaningFor(form: string) {
  return finiteVerbFormInfoFor(form)?.current;
}

const verbOverrides: Record<string, VerbUsageCard> = {
  zijn: {
    infinitive: "zijn",
    ikForm: "ik ben",
    jijForm: "jij bent / je bent",
    wijForm: "wij zijn",
    rule: text("zijn 是最高频特殊动词，不套普通规则，直接整块记。", "zijn is a high-frequency irregular verb. Memorize the forms as chunks."),
    hint: text("我是 ben，你是 bent，他/她/它 is，复数 zijn。", "ik ben, jij bent, hij/zij/het is, plural zijn."),
    examples: ["Ik ben student.", "Jij bent thuis.", "Wij zijn klaar."],
  },
  hebben: {
    infinitive: "hebben",
    ikForm: "ik heb",
    jijForm: "jij hebt / je hebt",
    wijForm: "wij hebben",
    rule: text("hebben 是高频特殊动词：ik heb，jij hebt，wij hebben。", "hebben is a high-frequency irregular verb: ik heb, jij hebt, wij hebben."),
    hint: text("我有 heb，你有 hebt，他/她/它 heeft，复数 hebben。", "ik heb, jij hebt, hij/zij/het heeft, plural hebben."),
    examples: ["Ik heb een boek.", "Jij hebt tijd.", "Wij hebben een afspraak."],
  },
  heten: {
    infinitive: "heten",
    ikForm: "ik heet",
    jijForm: "jij heet / je heet",
    wijForm: "wij heten",
    rule: text("heten 是“叫/名字是”。heet 不是孤立词，它是 ik/jij/hij/zij 的现在时形式。", "heten means 'to be called / be named'. heet is not a standalone word; it is the present form for ik/jij/hij/zij."),
    hint: text("先整句记：Ik heet Lin. / Hoe heet je? 复数才用 wij heten。", "First learn the chunks: Ik heet Lin. / Hoe heet je? Use wij heten for plural."),
    examples: ["Ik heet Lin.", "Hoe heet je?", "Zij heet Anna."],
  },
  gaan: {
    infinitive: "gaan",
    ikForm: "ik ga",
    jijForm: "jij gaat / je gaat",
    wijForm: "wij gaan",
    rule: text("gaan 是常用特殊动词：ik ga，jij gaat，wij gaan。", "gaan is a common irregular verb: ik ga, jij gaat, wij gaan."),
    hint: text("不要写 ik gaan；ik 用 ga。", "Do not write ik gaan; use ik ga."),
    examples: ["Ik ga naar school.", "Jij gaat naar huis.", "Wij gaan samen."],
  },
  willen: {
    infinitive: "willen",
    ikForm: "ik wil",
    jijForm: "jij wilt / je wilt",
    wijForm: "wij willen",
    rule: text("willen 是特殊动词。完整样子是 willen；放进句子后常用 ik wil。", "willen is irregular. The base form is willen; in sentences you often use ik wil."),
    hint: text("A0 先记：ik wil + 名词，或者 ik wil graag + 名词。", "For A0, first learn: ik wil + noun, or ik wil graag + noun."),
    examples: ["Ik wil water.", "Jij wilt hulp.", "Wij willen koffie."],
  },
  kunnen: {
    infinitive: "kunnen",
    ikForm: "ik kan",
    jijForm: "jij kunt / je kunt",
    wijForm: "wij kunnen",
    rule: text("kunnen 是特殊动词。完整样子是 kunnen；放进句子后常用 ik kan。", "kunnen is irregular. The base form is kunnen; in sentences you often use ik kan."),
    hint: text("A0 先记：ik kan + 动词原本的样子，例如 Ik kan helpen。", "For A0, first learn: ik kan + base verb, for example Ik kan helpen."),
    examples: ["Ik kan helpen.", "Jij kunt komen.", "Wij kunnen wachten."],
  },
  zien: {
    infinitive: "zien",
    ikForm: "ik zie",
    jijForm: "jij ziet / je ziet",
    wijForm: "wij zien",
    rule: text("zien 是“看见”。当前词形 zie 要回到完整动词 zien 来记。", "zien means see. Connect the current form zie back to the full verb zien."),
    hint: text("先记三格：ik zie，jij ziet，wij zien。", "Remember the three slots: ik zie, jij ziet, wij zien."),
    examples: ["Ik zie het station.", "Jij ziet de brief.", "Wij zien de balie."],
  },
  doen: {
    infinitive: "doen",
    ikForm: "ik doe",
    jijForm: "jij doet / je doet",
    wijForm: "wij doen",
    rule: text("doen 是“做”的完整动词；放进句子后常见 ik doe，jij doet，wij doen。", "doen is the base verb 'to do'; in sentences it becomes ik doe, jij doet, wij doen."),
    hint: text("先记两块：Wat doe je? / boodschappen doen。", "First learn two chunks: Wat doe je? / boodschappen doen."),
    examples: ["Wat doe je?", "Ik doe boodschappen.", "Wij doen het samen."],
  },
  komen: {
    infinitive: "komen",
    ikForm: "ik kom",
    jijForm: "jij komt / je komt",
    wijForm: "wij komen",
    rule: text("komen 放进句子后：ik kom，jij komt，wij komen。", "komen becomes ik kom, jij komt, wij komen."),
    hint: text("先按“来/到来”记；说来自哪里才加 uit。o 不写成 oo：komen -> kom。", "Learn it first as coming/arriving; add uit only for origin. Do not write oo here: komen -> kom."),
    examples: ["Wanneer kan ik komen?", "Jij komt morgen.", "Wij komen om tien uur."],
  },
  kijken: {
    infinitive: "kijken",
    ikForm: "ik kijk",
    jijForm: "jij kijkt / je kijkt",
    wijForm: "wij kijken",
    rule: text("kijken 原本以 -en 结尾。放进句子后：ik kijk，jij kijkt，wij kijken。", "kijken ends in -en. In sentences: ik kijk, jij kijkt, wij kijken."),
    hint: text("先记三格：ik 去 en，单数加 t，复数用原形。", "Remember three slots: ik removes -en, singular adds t, plural keeps the base form."),
    examples: ["Ik kijk naar het bord.", "Jij kijkt naar de zin.", "Wij kijken samen."],
  },
  werken: {
    infinitive: "werken",
    ikForm: "ik werk",
    jijForm: "jij werkt / je werkt",
    wijForm: "wij werken",
    rule: text("werken 是规则动词：ik werk，jij werkt，wij werken。", "werken is regular: ik werk, jij werkt, wij werken."),
    hint: text("ik 最简单，只去掉 -en。", "ik is the simplest: remove -en."),
    examples: ["Ik werk vandaag.", "Jij werkt morgen.", "Wij werken in Amsterdam."],
  },
  leren: {
    infinitive: "leren",
    ikForm: "ik leer",
    jijForm: "jij leert / je leert",
    wijForm: "wij leren",
    rule: text("leren 放进句子后会变成 leer / leert / leren。", "leren becomes leer / leert / leren in sentences."),
    hint: text("长音 ee 保持清楚：leren -> leer。", "Keep the long ee clear: leren -> leer."),
    examples: ["Ik leer Nederlands.", "Jij leert snel.", "Wij leren samen."],
  },
  wonen: {
    infinitive: "wonen",
    ikForm: "ik woon",
    jijForm: "jij woont / je woont",
    wijForm: "wij wonen",
    rule: text("wonen 放进句子后：ik woon，jij woont，wij wonen。", "wonen becomes ik woon, jij woont, wij wonen."),
    hint: text("oo 是长音：wonen -> woon。", "oo is a long sound: wonen -> woon."),
    examples: ["Ik woon in Delft.", "Jij woont in Utrecht.", "Wij wonen in Nederland."],
  },
  maken: {
    infinitive: "maken",
    ikForm: "ik maak",
    jijForm: "jij maakt / je maakt",
    wijForm: "wij maken",
    rule: text("maken 放进句子后：ik maak，jij maakt，wij maken。", "maken becomes ik maak, jij maakt, wij maken."),
    hint: text("a 变成 aa，是为了保持长音。", "a becomes aa to keep the long sound."),
    examples: ["Ik maak een afspraak.", "Jij maakt koffie.", "Wij maken een zin."],
  },
  kopen: {
    infinitive: "kopen",
    ikForm: "ik koop",
    jijForm: "jij koopt / je koopt",
    wijForm: "wij kopen",
    rule: text("kopen 放进句子后：ik koop，jij koopt，wij kopen。", "kopen becomes ik koop, jij koopt, wij kopen."),
    hint: text("o 变成 oo，是为了保持长音。", "o becomes oo to keep the long sound."),
    examples: ["Ik koop brood.", "Jij koopt water.", "Wij kopen appels."],
  },
  koken: {
    infinitive: "koken",
    ikForm: "ik kook",
    jijForm: "jij kookt / je kookt",
    wijForm: "wij koken",
    rule: text("koken 放进句子后：ik kook，jij kookt，wij koken。", "koken becomes ik kook, jij kookt, wij koken."),
    hint: text("o 变成 oo，是为了保持长音。", "o becomes oo to keep the long vowel."),
    examples: ["Ik kook vandaag.", "Jij kookt rijst.", "Wij koken thuis."],
  },
  lopen: {
    infinitive: "lopen",
    ikForm: "ik loop",
    jijForm: "jij loopt / je loopt",
    wijForm: "wij lopen",
    rule: text("lopen 放进句子后：ik loop，jij loopt，wij lopen。", "lopen becomes ik loop, jij loopt, wij lopen."),
    hint: text("o 变成 oo，是为了保持长音。", "o becomes oo to keep the long vowel."),
    examples: ["Ik loop naar huis.", "Jij loopt rechtdoor.", "Wij lopen naar het station."],
  },
  slapen: {
    infinitive: "slapen",
    ikForm: "ik slaap",
    jijForm: "jij slaapt / je slaapt",
    wijForm: "wij slapen",
    rule: text("slapen 放进句子后：ik slaap，jij slaapt，wij slapen。", "slapen becomes ik slaap, jij slaapt, wij slapen."),
    hint: text("a 变成 aa，是为了保持长音。", "a becomes aa to keep the long vowel."),
    examples: ["Ik slaap goed.", "Jij slaapt thuis.", "Wij slapen om tien uur."],
  },
  halen: {
    infinitive: "halen",
    ikForm: "ik haal",
    jijForm: "jij haalt / je haalt",
    wijForm: "wij halen",
    rule: text("halen 放进句子后：ik haal，jij haalt，wij halen。", "halen becomes ik haal, jij haalt, wij halen."),
    hint: text("a 变成 aa，是为了保持长音；不要写 ik hal。", "a becomes aa to keep the long vowel; do not write ik hal."),
    examples: ["Ik haal brood.", "Jij haalt koffie.", "Wij halen de kinderen."],
  },
  lezen: {
    infinitive: "lezen",
    ikForm: "ik lees",
    jijForm: "jij leest / je leest",
    wijForm: "wij lezen",
    rule: text("lezen 放进句子后：ik lees，jij leest，wij lezen。", "lezen becomes ik lees, jij leest, wij lezen."),
    hint: text("z 在 ik 形式里变成 s：lezen -> lees。", "z changes to s in the ik form: lezen -> lees."),
    examples: ["Ik lees de zin.", "Jij leest een brief.", "Wij lezen Nederlands."],
  },
  schrijven: {
    infinitive: "schrijven",
    ikForm: "ik schrijf",
    jijForm: "jij schrijft / je schrijft",
    wijForm: "wij schrijven",
    rule: text("schrijven 放进句子后：ik schrijf，jij schrijft，wij schrijven。", "schrijven becomes ik schrijf, jij schrijft, wij schrijven."),
    hint: text("ij 要整体读；schrijf 是 ik 形式。", "Read ij as one sound; schrijf is the ik form."),
    examples: ["Ik schrijf mijn naam.", "Jij schrijft een e-mail.", "Wij schrijven een zin."],
  },
  bellen: {
    infinitive: "bellen",
    ikForm: "ik bel",
    jijForm: "jij belt / je belt",
    wijForm: "wij bellen",
    rule: text("bellen 放进句子后：ik bel，jij belt，wij bellen。", "bellen becomes ik bel, jij belt, wij bellen."),
    hint: text("双 l 回到单 l：bellen -> bel。", "Double l becomes single l: bellen -> bel."),
    examples: ["Ik bel de huisarts.", "Jij belt morgen.", "Wij bellen samen."],
  },
  appen: {
    infinitive: "appen",
    ikForm: "ik app",
    jijForm: "jij appt / je appt",
    wijForm: "wij appen",
    rule: text("appen 是发 app/WhatsApp 消息；ik 形式保留 app，不是 ap。", "appen means messaging via an app/WhatsApp; the ik form stays app, not ap."),
    hint: text("名词 app 复数 apps；动作才是 appen。", "The noun app has plural apps; the action is appen."),
    examples: ["Ik app mijn zus.", "Jij appt de afspraak.", "Wij appen straks."],
  },
  emailen: {
    infinitive: "emailen",
    ikForm: "ik email",
    jijForm: "jij emailt / je emailt",
    wijForm: "wij emailen",
    rule: text("emailen 是“发邮件”这个动作；名词 email 的复数是 emails。", "emailen is the action 'to email'; the noun email has plural emails."),
    hint: text("看到 -en 才是动作：emailen = 发邮件。", "The -en form is the action: emailen = to email."),
    examples: ["Ik email de gemeente.", "Jij emailt de bijlage.", "Wij emailen vandaag."],
  },
  "e-mailen": {
    infinitive: "e-mailen",
    ikForm: "ik e-mail",
    jijForm: "jij e-mailt / je e-mailt",
    wijForm: "wij e-mailen",
    rule: text("e-mailen 是带连字符的“发邮件”；名词 e-mail 的复数是 e-mails。", "e-mailen is the hyphenated verb 'to email'; the noun e-mail has plural e-mails."),
    hint: text("名词 e-mail，复数 e-mails；动作 e-mailen。", "Noun e-mail, plural e-mails; action e-mailen."),
    examples: ["Ik e-mail de gemeente.", "Jij e-mailt de bijlage.", "Wij e-mailen vandaag."],
  },
  beginnen: {
    infinitive: "beginnen",
    ikForm: "ik begin",
    jijForm: "jij begint / je begint",
    wijForm: "wij beginnen",
    rule: text("beginnen 去掉 -en 后，双 n 变单 n：ik begin。", "After removing -en, double n becomes single n: ik begin."),
    hint: text("beginnen -> begin；不是 beginn。", "beginnen -> begin, not beginn."),
    examples: ["Ik begin nu.", "Jij begint morgen.", "Wij beginnen samen."],
  },
  klikken: {
    infinitive: "klikken",
    ikForm: "ik klik",
    jijForm: "jij klikt / je klikt",
    wijForm: "wij klikken",
    rule: text("klikken 去掉 -en 后，双 k 变单 k：ik klik。", "After removing -en, double k becomes single k: ik klik."),
    hint: text("双辅音在 ik 形式里通常只留一个。", "A doubled consonant usually becomes one in the ik form."),
    examples: ["Ik klik hier.", "Jij klikt op de knop.", "Wij klikken niet."],
  },
  stoppen: {
    infinitive: "stoppen",
    ikForm: "ik stop",
    jijForm: "jij stopt / je stopt",
    wijForm: "wij stoppen",
    rule: text("stoppen 去掉 -en 后，双 p 变单 p：ik stop。", "After removing -en, double p becomes single p: ik stop."),
    hint: text("stoppen -> stop；不是 stopp。", "stoppen -> stop, not stopp."),
    examples: ["Ik stop hier.", "Jij stopt nu.", "Wij stoppen vandaag."],
  },
  wassen: {
    infinitive: "wassen",
    ikForm: "ik was",
    jijForm: "jij wast / je wast",
    wijForm: "wij wassen",
    rule: text("wassen 去掉 -en 后，双 s 变单 s：ik was。", "After removing -en, double s becomes single s: ik was."),
    hint: text("这里 was 是 wassen 的 ik 形式，不是过去式那一课。", "Here was is the ik form of wassen, not the past-tense lesson."),
    examples: ["Ik was mijn handen.", "Jij wast je handen.", "Wij wassen samen."],
  },
  helpen: {
    infinitive: "helpen",
    ikForm: "ik help",
    jijForm: "jij helpt / je helpt",
    wijForm: "wij helpen",
    rule: text("helpen 放进句子后：ik help，jij helpt，wij helpen。", "helpen becomes ik help, jij helpt, wij helpen."),
    hint: text("help 是 ik 形式；hulp 是名词“帮助”，不要混成动词形式。", "help is the ik form; hulp is the noun help, not a verb form."),
    examples: ["Ik help u.", "Jij helpt mij.", "Wij helpen samen."],
  },
  eten: {
    infinitive: "eten",
    ikForm: "ik eet",
    jijForm: "jij eet / je eet",
    wijForm: "wij eten",
    rule: text("eten 是常见拼写变化：ik eet，jij eet，wij eten。", "eten has a common spelling change: ik eet, jij eet, wij eten."),
    hint: text("长音保持住：eten -> eet。", "Keep the long vowel: eten -> eet."),
    examples: ["Ik eet brood.", "Jij eet rijst.", "Wij eten om zes uur."],
  },
  drinken: {
    infinitive: "drinken",
    ikForm: "ik drink",
    jijForm: "jij drinkt / je drinkt",
    wijForm: "wij drinken",
    rule: text("drinken 放进句子后：ik drink，jij drinkt，wij drinken。", "drinken becomes ik drink, jij drinkt, wij drinken."),
    hint: text("ik 去掉 -en，单数主语加 t。", "ik removes -en; singular subjects add t."),
    examples: ["Ik drink water.", "Jij drinkt koffie.", "Wij drinken thee."],
  },
  spreken: {
    infinitive: "spreken",
    ikForm: "ik spreek",
    jijForm: "jij spreekt / je spreekt",
    wijForm: "wij spreken",
    rule: text("spreken 放进句子后：ik spreek，jij spreekt，wij spreken。", "spreken becomes ik spreek, jij spreekt, wij spreken."),
    hint: text("e 变成 ee，是为了保持长音。", "e becomes ee to keep the long vowel."),
    examples: ["Ik spreek Nederlands.", "Jij spreekt Engels.", "Wij spreken samen."],
  },
  begrijpen: {
    infinitive: "begrijpen",
    ikForm: "ik begrijp",
    jijForm: "jij begrijpt / je begrijpt",
    wijForm: "wij begrijpen",
    rule: text("begrijpen 放进句子后：ik begrijp，jij begrijpt，wij begrijpen。", "begrijpen becomes ik begrijp, jij begrijpt, wij begrijpen."),
    hint: text("A0 先记救命句：Ik begrijp het niet. 我不明白。", "For A0, first remember the repair phrase: Ik begrijp het niet."),
    examples: ["Ik begrijp het niet.", "Jij begrijpt de zin.", "Wij begrijpen het."],
  },
  herhalen: {
    infinitive: "herhalen",
    ikForm: "ik herhaal",
    jijForm: "jij herhaalt / je herhaalt",
    wijForm: "wij herhalen",
    rule: text("herhalen 是动词，意思是“重复”。herhaal 是 ik 形式，也可以出现在礼貌请求里。", "herhalen is a verb meaning to repeat. herhaal is the ik form and can also appear in requests."),
    hint: text("先记实用句：Kunt u dat herhalen? 您能重复一遍吗？", "First learn the useful sentence: Kunt u dat herhalen?"),
    examples: ["Ik herhaal de zin.", "Jij herhaalt het woord.", "Wij herhalen samen."],
  },
  luisteren: {
    infinitive: "luisteren",
    ikForm: "ik luister",
    jijForm: "jij luistert / je luistert",
    wijForm: "wij luisteren",
    rule: text("luisteren 放进句子后：ik luister，jij luistert，wij luisteren。", "luisteren becomes ik luister, jij luistert, wij luisteren."),
    hint: text("luister 是 ik 形式，也能当课堂指令“听”。", "luister is the ik form and can also be the classroom command listen."),
    examples: ["Ik luister goed.", "Jij luistert naar de zin.", "Wij luisteren samen."],
  },
  openen: {
    infinitive: "openen",
    ikForm: "ik open",
    jijForm: "jij opent / je opent",
    wijForm: "wij openen",
    rule: text("openen 放进句子后：ik open，jij opent，wij openen。", "openen becomes ik open, jij opent, wij openen."),
    hint: text("open 既可以是形容词“开着的”，也可以是 openen 的 ik/指令形式。", "open can be an adjective, and also the ik/command form of openen."),
    examples: ["Ik open de app.", "Jij opent het formulier.", "Wij openen de deur."],
  },
  sluiten: {
    infinitive: "sluiten",
    ikForm: "ik sluit",
    jijForm: "jij sluit / je sluit",
    wijForm: "wij sluiten",
    rule: text("sluiten 放进句子后：ik sluit，jij sluit，wij sluiten。", "sluiten becomes ik sluit, jij sluit, wij sluiten."),
    hint: text("sluit 末尾已经是 t 音，jij 形式不再额外写 tt。", "sluit already ends in t, so the jij form does not add another t."),
    examples: ["Ik sluit de app.", "Jij sluit de deur.", "Wij sluiten samen af."],
  },
  opstaan: {
    infinitive: "opstaan",
    ikForm: "ik sta op",
    jijForm: "jij staat op / je staat op",
    wijForm: "wij staan op",
    rule: text("opstaan 是分离动词：op 常跑到句子后面。", "opstaan is a separable verb: op often moves to the end."),
    hint: text("记整句：ik sta op，不是 ik opsta。", "Remember the sentence chunk: ik sta op, not ik opsta."),
    examples: ["Ik sta vroeg op.", "Jij staat om zeven uur op.", "Wij staan samen op."],
  },
  staan: {
    infinitive: "staan",
    ikForm: "ik sta",
    jijForm: "jij staat / je staat",
    wijForm: "wij staan",
    rule: text("staan 是常用特殊动词：ik sta，jij staat，wij staan。", "staan is a common irregular verb: ik sta, jij staat, wij staan."),
    hint: text("sta 是“站”的 ik/指令形式；opstaan 才是“起床”。", "sta is the ik/command form for standing; opstaan means getting up."),
    examples: ["Ik sta hier.", "Jij staat bij de deur.", "Wij staan in de rij."],
  },
  nemen: {
    infinitive: "nemen",
    ikForm: "ik neem",
    jijForm: "jij neemt / je neemt",
    wijForm: "wij nemen",
    rule: text("nemen 放进句子后：ik neem，jij neemt，wij nemen。", "nemen becomes ik neem, jij neemt, wij nemen."),
    hint: text("e 变成 ee，是为了保持长音。", "e becomes ee to keep the long vowel."),
    examples: ["Ik neem de trein.", "Jij neemt plaats.", "Wij nemen koffie."],
  },
  geven: {
    infinitive: "geven",
    ikForm: "ik geef",
    jijForm: "jij geeft / je geeft",
    wijForm: "wij geven",
    rule: text("geven 放进句子后：ik geef，jij geeft，wij geven。", "geven becomes ik geef, jij geeft, wij geven."),
    hint: text("v 在 ik 形式里变成 f，同时保持长音 ee。", "v changes to f in the ik form, with long ee."),
    examples: ["Ik geef mijn naam.", "Jij geeft antwoord.", "Wij geven hulp."],
  },
  zetten: {
    infinitive: "zetten",
    ikForm: "ik zet",
    jijForm: "jij zet / je zet",
    wijForm: "wij zetten",
    rule: text("zetten 放进句子后：ik zet，jij zet，wij zetten。", "zetten becomes ik zet, jij zet, wij zetten."),
    hint: text("zet 末尾已经是 t，jij 形式不再额外写 tt。", "zet already ends in t, so the jij form does not add another t."),
    examples: ["Ik zet de tas hier.", "Jij zet koffie.", "Wij zetten de tafel klaar."],
  },
  leggen: {
    infinitive: "leggen",
    ikForm: "ik leg",
    jijForm: "jij legt / je legt",
    wijForm: "wij leggen",
    rule: text("leggen 放进句子后：ik leg，jij legt，wij leggen。", "leggen becomes ik leg, jij legt, wij leggen."),
    hint: text("leg 是“放平/放下”的形式；uitleggen 才是“解释”。", "leg is for putting/laying down; uitleggen means explaining."),
    examples: ["Ik leg het boek op tafel.", "Jij legt de brief hier.", "Wij leggen de kaarten klaar."],
  },
  zitten: {
    infinitive: "zitten",
    ikForm: "ik zit",
    jijForm: "jij zit / je zit",
    wijForm: "wij zitten",
    rule: text("zitten 放进句子后：ik zit，jij zit，wij zitten。", "zitten becomes ik zit, jij zit, wij zitten."),
    hint: text("zit 末尾已经是 t，jij 形式不再额外写 tt。", "zit already ends in t, so the jij form does not add another t."),
    examples: ["Ik zit op de stoel.", "Jij zit hier.", "Wij zitten samen."],
  },
  opbellen: {
    infinitive: "opbellen",
    ikForm: "ik bel op",
    jijForm: "jij belt op / je belt op",
    wijForm: "wij bellen op",
    rule: text("opbellen 是分离动词：op 放到句子后面。", "opbellen is a separable verb: op moves to the end."),
    hint: text("先记：ik bel ... op。", "First remember: ik bel ... op."),
    examples: ["Ik bel de huisarts op.", "Jij belt morgen op.", "Wij bellen samen op."],
  },
  aanpassen: {
    infinitive: "aanpassen",
    ikForm: "ik pas aan",
    jijForm: "jij past aan / je past aan",
    wijForm: "wij passen aan",
    rule: text("aanpassen 是分离动词：aan 常放到句子后面。", "aanpassen is a separable verb: aan often moves to the end."),
    hint: text("记整句：ik pas mijn gegevens aan。", "Remember the sentence chunk: ik pas mijn gegevens aan."),
    examples: ["Ik pas mijn gegevens aan.", "Jij past de afspraak aan.", "Wij passen het formulier aan."],
  },
  uitleggen: {
    infinitive: "uitleggen",
    ikForm: "ik leg uit",
    jijForm: "jij legt uit / je legt uit",
    wijForm: "wij leggen uit",
    rule: text("uitleggen 是分离动词：uit 常放到句子后面。", "uitleggen is a separable verb: uit often moves to the end."),
    hint: text("记整句：Kunt u dat uitleggen? / Ik leg het uit。", "Remember the chunks: Kunt u dat uitleggen? / Ik leg het uit."),
    examples: ["Ik leg de regel uit.", "Jij legt het formulier uit.", "Wij leggen het samen uit."],
  },
  aanbieden: {
    infinitive: "aanbieden",
    ikForm: "ik bied aan",
    jijForm: "jij biedt aan / je biedt aan",
    wijForm: "wij bieden aan",
    rule: text("aanbieden 是分离动词：aan 常放到句子后面。", "aanbieden is a separable verb: aan often moves to the end."),
    hint: text("记整句：ik bied hulp aan。", "Remember the sentence chunk: ik bied hulp aan."),
    examples: ["Ik bied hulp aan.", "Jij biedt een cursus aan.", "Wij bieden koffie aan."],
  },
};

const knownInfinitives = new Set([
  "zijn",
  "hebben",
  "heten",
  "gaan",
  "willen",
  "kunnen",
  "doen",
  "komen",
  "beginnen",
  "bellen",
  "appen",
  "emailen",
  "e-mailen",
  "klikken",
  "drinken",
  "eten",
  "kijken",
  "koken",
  "leren",
  "lezen",
  "helpen",
  "luisteren",
  "lopen",
  "maken",
  "kopen",
  "openen",
  "opstaan",
  "staan",
  "slapen",
  "sluiten",
  "stoppen",
  "wassen",
  "dragen",
  "pakken",
  "werken",
  "wonen",
  "schrijven",
  "spreken",
  "begrijpen",
  "herhalen",
  "zeggen",
  "zoeken",
  "invullen",
  "betalen",
  "veranderen",
  "verzetten",
  "afzeggen",
  "vragen",
  "nemen",
  "wachten",
  "hoesten",
  "rusten",
  "noteren",
  "doorverbinden",
  "terugbellen",
  "gebruiken",
  "opbellen",
  "regelen",
  "melden",
  "controleren",
  "aanpassen",
  "bespreken",
  "uitleggen",
  "verbeteren",
  "bezoeken",
  "verhuizen",
  "verlengen",
  "verkorten",
  "bereiken",
  "besparen",
  "vergelijken",
  "kiezen",
  "beslissen",
  "aanbieden",
  "ontvangen",
  "verzenden",
  "accepteren",
  "weigeren",
  "bewijzen",
  "ontdekken",
  "passen",
  "aantrekken",
  "uittrekken",
  "brengen",
  "halen",
  "geven",
  "krijgen",
  "zetten",
  "leggen",
  "zitten",
  "liggen",
  "blijven",
  "spelen",
  "horen",
  "zwemmen",
  "hardlopen",
  "dansen",
  "zingen",
  "tekenen",
  "duwen",
  "trekken",
  "aanmelden",
  "afmelden",
  "ruilen",
  "terugbrengen",
  "bewaren",
  "opruimen",
  "schoonmaken",
  "stofzuigen",
  "afwassen",
  "afdrogen",
  "vegen",
  "dweilen",
  "strijken",
  "vouwen",
  "ophangen",
  "weggooien",
  "inpakken",
  "uitpakken",
  "aanzetten",
  "uitzetten",
  "aanraken",
  "uitloggen",
  "logeren",
  "uitnodigen",
  "samenwonen",
  "scheiden",
  "printen",
  "scannen",
  "afspreken",
  "slikken",
  "ademen",
  "vallen",
  "snijden",
  "branden",
  "jeuken",
  "bloeden",
  "achterlaten",
  "onthouden",
  "pauzeren",
  "klaarmaken",
  "proeven",
  "uitschrijven",
  "aanvinken",
  "ondertekenen",
  "uploaden",
  "downloaden",
  "toevoegen",
  "verwijderen",
  "versturen",
  "nakijken",
  "bijvoegen",
  "doorverwijzen",
  "innemen",
  "smeren",
  "schudden",
  "opzeggen",
  "inwerken",
  "thuisblijven",
  "declareren",
  "vergoeden",
  "wijzigen",
  "omreizen",
  "uitstappen",
  "instappen",
  "doorsturen",
  "beantwoorden",
  "opnemen",
  "oplossen",
  "beschrijven",
  "trakteren",
  "verzekeren",
  "identificeren",
  "retourneren",
  "terugstorten",
  "bezorgen",
  "afhalen",
  "afstemmen",
]);

const shortCommandToInfinitive: Record<string, string> = {
  ...finiteVerbFormToInfinitive,
  begin: "beginnen",
  klik: "klikken",
  kijk: "kijken",
  lees: "lezen",
  luister: "luisteren",
  open: "openen",
  schrijf: "schrijven",
  sluit: "sluiten",
  stop: "stoppen",
  zeg: "zeggen",
  ga: "gaan",
  wil: "willen",
  kan: "kunnen",
  kom: "komen",
  woon: "wonen",
  werk: "werken",
  leer: "leren",
  bel: "bellen",
  help: "helpen",
  begrijp: "begrijpen",
  begrijpt: "begrijpen",
  herhaal: "herhalen",
  herhaalt: "herhalen",
  drink: "drinken",
  drinkt: "drinken",
  eet: "eten",
  kook: "koken",
  kookt: "koken",
  loop: "lopen",
  loopt: "lopen",
  slaap: "slapen",
  slaapt: "slapen",
  was: "wassen",
  wast: "wassen",
  draag: "dragen",
  draagt: "dragen",
  pak: "pakken",
  pakt: "pakken",
  doe: "doen",
  doet: "doen",
  zie: "zien",
  ziet: "zien",
  leest: "lezen",
  spreek: "spreken",
  spreekt: "spreken",
  zoek: "zoeken",
  zoekt: "zoeken",
  vul: "invullen",
  vult: "invullen",
  betaal: "betalen",
  betaalt: "betalen",
  verander: "veranderen",
  verandert: "veranderen",
  verzet: "verzetten",
  afzeg: "afzeggen",
  vraag: "vragen",
  vraagt: "vragen",
  neem: "nemen",
  neemt: "nemen",
  geef: "geven",
  geeft: "geven",
  zet: "zetten",
  leg: "leggen",
  legt: "leggen",
  zit: "zitten",
  sta: "staan",
  staat: "staan",
  wacht: "wachten",
  hoest: "hoesten",
  rust: "rusten",
  noteer: "noteren",
  noteert: "noteren",
  verbind: "doorverbinden",
  verbindt: "doorverbinden",
  gebruik: "gebruiken",
  gebruikt: "gebruiken",
  regel: "regelen",
  regelt: "regelen",
  meld: "melden",
  meldt: "melden",
  controleer: "controleren",
  controleert: "controleren",
  pas: "aanpassen",
  past: "aanpassen",
  bespreek: "bespreken",
  bespreekt: "bespreken",
  uitleg: "uitleggen",
  verbeter: "verbeteren",
  verbetert: "verbeteren",
  bezoek: "bezoeken",
  bezoekt: "bezoeken",
  verhuis: "verhuizen",
  verhuist: "verhuizen",
  verleng: "verlengen",
  verlengt: "verlengen",
  verkort: "verkorten",
  bereik: "bereiken",
  bereikt: "bereiken",
  bespaar: "besparen",
  bespaart: "besparen",
  vergelijk: "vergelijken",
  vergelijkt: "vergelijken",
  kies: "kiezen",
  kiest: "kiezen",
  beslis: "beslissen",
  beslist: "beslissen",
  bied: "aanbieden",
  biedt: "aanbieden",
  ontvang: "ontvangen",
  ontvangt: "ontvangen",
  verzend: "verzenden",
  verzendt: "verzenden",
  accepteer: "accepteren",
  accepteert: "accepteren",
  weiger: "weigeren",
  weigert: "weigeren",
  bewijs: "bewijzen",
  bewijst: "bewijzen",
  ontdek: "ontdekken",
  ontdekt: "ontdekken",
};

function removeDoubledFinalConsonant(base: string) {
  return /([bcdfghjklmnpqrstvwxz])\1$/.test(base) ? base.slice(0, -1) : base;
}

function regularStem(infinitive: string): StemResult {
  if (verbOverrides[infinitive]) {
    return {
      stem: verbOverrides[infinitive].ikForm.replace(/^ik /, "").replace(/ .+$/, ""),
      ruleZh: "这个动词有单独说明，先按词卡里的三格记。",
      ruleEn: "This verb has a specific note. Learn the three displayed forms first.",
    };
  }
  if (!infinitive.endsWith("en")) {
    return {
      stem: infinitive,
      ruleZh: "这个形式不以 -en 结尾，先当固定词块记。",
      ruleEn: "This form does not end in -en, so learn it as a fixed chunk first.",
    };
  }

  const base = infinitive.slice(0, -2);
  const dedoubled = removeDoubledFinalConsonant(base);
  if (dedoubled !== base) {
    return {
      stem: dedoubled,
      ruleZh: `${infinitive} 去掉 -en 后，末尾双辅音只留一个：${dedoubled}。`,
      ruleEn: `After removing -en from ${infinitive}, a doubled final consonant becomes one: ${dedoubled}.`,
    };
  }

  if (base.endsWith("z")) {
    return {
      stem: `${base.slice(0, -1)}s`,
      ruleZh: `${infinitive} 的 ik 形式里 z 变 s。`,
      ruleEn: `In the ik form of ${infinitive}, z changes to s.`,
    };
  }

  if (base.endsWith("v")) {
    return {
      stem: `${base.slice(0, -1)}f`,
      ruleZh: `${infinitive} 的 ik 形式里 v 变 f。`,
      ruleEn: `In the ik form of ${infinitive}, v changes to f.`,
    };
  }

  return {
    stem: base,
    ruleZh: `${infinitive} 去掉 -en，得到 ik 形式。`,
    ruleEn: `Remove -en from ${infinitive} to get the ik form.`,
  };
}

const genericVerbObjects: Record<string, string> = {
  werken: "vandaag",
  leren: "Nederlands",
  wonen: "in Nederland",
  maken: "een afspraak",
  kopen: "brood",
  drinken: "water",
  eten: "brood",
  koken: "vandaag",
  lopen: "naar huis",
  slapen: "goed",
  lezen: "de zin",
  schrijven: "mijn naam",
  bellen: "de huisarts",
  appen: "mijn zus",
  emailen: "de gemeente",
  "e-mailen": "de gemeente",
  helpen: "u",
  spreken: "Nederlands",
  begrijpen: "het niet",
  herhalen: "de zin",
  zoeken: "mijn adres",
  invullen: "het formulier",
  betalen: "de rekening",
  veranderen: "mijn adres",
  verzetten: "mijn afspraak",
  afzeggen: "mijn afspraak",
  vragen: "om hulp",
  nemen: "de trein",
  wachten: "hier",
  hoesten: "veel",
  rusten: "vandaag",
  halen: "brood",
  noteren: "mijn naam",
  doorverbinden: "mij",
  terugbellen: "morgen",
  gebruiken: "de app",
  wassen: "mijn handen",
  openen: "de app",
  sluiten: "de deur",
  beginnen: "nu",
  stoppen: "nu",
  klikken: "hier",
  zeggen: "hallo",
  regelen: "een afspraak",
  melden: "het probleem",
  controleren: "het adres",
  aanpassen: "mijn gegevens",
  bespreken: "de afspraak",
  uitleggen: "de regel",
  verbeteren: "de zin",
  bezoeken: "de huisarts",
  verhuizen: "naar Utrecht",
  verlengen: "mijn pas",
  verkorten: "de wachttijd",
  bereiken: "het station",
  besparen: "geld",
  vergelijken: "de prijzen",
  kiezen: "een datum",
  beslissen: "vandaag",
  aanbieden: "hulp",
  ontvangen: "een brief",
  verzenden: "het formulier",
  accepteren: "de afspraak",
  weigeren: "de hulp",
  bewijzen: "mijn identiteit",
  ontdekken: "een fout",
};

function sentenceFor(infinitive: string, subject: "ik" | "jij" | "wij", form: string) {
  const verb = form.replace(/^(ik|jij|wij) /, "");
  const object = genericVerbObjects[infinitive];
  if (!object) return `${form}.`;
  if (["nu", "vandaag", "goed", "hier"].includes(object)) return `${form} ${object}.`;
  return `${form} ${object}.`;
}

export function verbUsageFor(word: WordItem): VerbUsageCard | undefined {
  const normalized = word.dutch.toLowerCase();
  const infinitive = shortCommandToInfinitive[normalized] ?? pastParticipleToInfinitive[normalized] ?? normalized;

  if ((word.article && normalized !== "zie") || normalized.includes(" ")) return undefined;
  if (verbOverrides[infinitive]) return verbOverrides[infinitive];
  if (!knownInfinitives.has(infinitive)) return undefined;

  const stem = regularStem(infinitive);
  const jijVerb = stem.stem.endsWith("t") ? stem.stem : `${stem.stem}t`;
  const ikForm = `ik ${stem.stem}`;
  const jijForm = `jij ${jijVerb} / je ${jijVerb}`;
  const wijForm = `wij ${infinitive}`;
  return {
    infinitive,
    ikForm,
    jijForm,
    wijForm,
    rule: text(`${stem.ruleZh} 放进句子后，先看主语是谁。`, `${stem.ruleEn} In a sentence, first check the subject.`),
    hint: text("先记三格：ik 形式、单数主语形式、复数原形。遇到双辅音、v/f、z/s 要看拼写变化。", "Remember three slots: ik form, singular form, plural base form. Watch spelling changes such as double consonants, v/f, and z/s."),
    examples: [sentenceFor(infinitive, "ik", ikForm), sentenceFor(infinitive, "jij", `jij ${jijVerb}`), sentenceFor(infinitive, "wij", wijForm)],
  };
}
