import type { CourseLevel, LocalizedText } from "@/types/course";
import type { WordItem } from "@/types/vocabulary";

export type WordType =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "function-word"
  | "language-name"
  | "country-name"
  | "number"
  | "day-month"
  | "phrase";

export type ExampleSentenceType =
  | "minimal"
  | "collocation"
  | "scenario"
  | "output"
  | "contrast"
  | "mistake-correction";

export type TemplateExample = {
  dutch: string;
  meaningZh: string;
  meaningEn: string;
  level?: CourseLevel;
  type: ExampleSentenceType;
  phraseChunkUsed?: string;
  scenarioTags?: string[];
  grammarFocus?: string;
  confidence?: "high" | "medium" | "low";
  needsHumanReview?: boolean;
};

export type CollocationTemplate = {
  id: string;
  phraseChunk: string;
  usageScene: LocalizedText;
  examples: TemplateExample[];
};

const lt = (zh: string, en: string): LocalizedText => ({ zh, en });
const norm = (value: string) => value.trim().toLowerCase();

const languageNames = new Set(["engels", "nederlands", "chinees", "duits", "frans", "spaans", "arabisch", "pools", "turks"]);
const countryNames = new Set(["china", "nederland", "duitsland", "belgie", "belgië", "frankrijk", "spanje", "italië", "italie", "polen", "turkije", "marokko", "syrië", "syrie", "oekraine", "oekraïne"]);
const functionWords = new Set([
  "maar",
  "ook",
  "nog",
  "al",
  "want",
  "omdat",
  "zodat",
  "hoewel",
  "voordat",
  "nadat",
  "terwijl",
  "volgens",
  "daarnaast",
  "bovendien",
  "namelijk",
  "daardoor",
  "doordat",
  "daarom",
  "als",
  "toen",
  "kortom",
  "geen",
  "niet",
  "wel",
  "en",
  "of",
  "de",
  "het",
  "een",
  "dit",
  "dat",
  "om",
  "in",
  "op",
  "naar",
  "bij",
  "met",
  "voor",
  "waar",
  "wanneer",
  "wie",
  "wat",
  "hoe",
  "ik",
  "jij",
  "je",
  "u",
  "hij",
  "zij",
  "ze",
  "wij",
  "we",
  "jullie",
  "mijn",
  "jouw",
  "uw",
  "ons",
  "onze",
  "uit",
  "hier",
  "daar",
  "waarheen",
  "waarvandaan",
  "welk",
  "welke",
  "links",
  "rechts",
  "rechtdoor",
  "naast",
  "tegenover",
  "achter",
  "boven",
  "beneden",
  "dichtbij",
  "ver",
  "binnen",
  "buiten",
  "tussen",
  "graag",
  "liever",
  "altijd",
  "vaak",
  "soms",
  "nooit",
  "meestal",
  "vroeg",
  "laat",
  "later",
  "eerder",
  "nu",
  "straks",
  "meteen",
  "daarna",
  "eerst",
  "laatst",
  "misschien",
  "zeker",
  "ongeveer",
  "bijvoorbeeld",
  "gemiddeld",
  "bruto",
  "netto",
  "veel",
  "weinig",
  "meer",
  "minder",
  "contant",
  "totaal",
  "extra",
  "dus",
  "toch",
  "samen",
  "alleen",
  "nogmaals",
]);
const phraseWords = new Set([
  "hallo",
  "dag",
  "ja",
  "nee",
  "prima",
  "oké",
  "welkom",
  "sorry",
  "tot ziens",
  "dank je",
  "dank u",
  "bedankt",
  "alsjeblieft",
  "alstublieft",
  "goedemorgen",
  "goedemiddag",
  "goedenavond",
  "een beetje",
  "kunt u",
  "nog een keer",
  "kom uit",
  "woon in",
  "ga naar",
]);
const dayMonths = new Set([
  "maandag",
  "dinsdag",
  "woensdag",
  "donderdag",
  "vrijdag",
  "zaterdag",
  "zondag",
  "januari",
  "februari",
  "maart",
  "april",
  "mei",
  "juni",
  "juli",
  "augustus",
  "september",
  "oktober",
  "november",
  "december",
  "lente",
  "zomer",
  "herfst",
  "winter",
]);
const numberWords = new Set([
  "nul",
  "een",
  "twee",
  "drie",
  "vier",
  "vijf",
  "zes",
  "zeven",
  "acht",
  "negen",
  "tien",
  "elf",
  "twaalf",
  "dertien",
  "veertien",
  "vijftien",
  "zestien",
  "zeventien",
  "achttien",
  "negentien",
  "twintig",
  "dertig",
  "veertig",
  "vijftig",
  "zestig",
  "zeventig",
  "tachtig",
  "negentig",
  "honderd",
]);

const verbInfinitiveByForm: Record<string, string> = {
  ben: "zijn",
  bent: "zijn",
  is: "zijn",
  heet: "heten",
  heten: "heten",
  heb: "hebben",
  hebt: "hebben",
  heeft: "hebben",
  kan: "kunnen",
  kunt: "kunnen",
  wil: "willen",
  wilt: "willen",
  moet: "moeten",
  ga: "gaan",
  gaat: "gaan",
  kom: "komen",
  komt: "komen",
  woon: "wonen",
  woont: "wonen",
  leer: "leren",
  leert: "leren",
  werk: "werken",
  werkt: "werken",
  help: "helpen",
  helpt: "helpen",
  begin: "beginnen",
  begint: "beginnen",
  lees: "lezen",
  leest: "lezen",
  luister: "luisteren",
  luistert: "luisteren",
  schrijf: "schrijven",
  schrijft: "schrijven",
  stop: "stoppen",
  stopt: "stoppen",
  herhaal: "herhalen",
  herhaalt: "herhalen",
  klik: "klikken",
  klikt: "klikken",
  doe: "doen",
  doet: "doen",
  zie: "zien",
  ziet: "zien",
  sluit: "sluiten",
  opent: "openen",
  begrijp: "begrijpen",
  begrijpt: "begrijpen",
  spreek: "spreken",
  spreekt: "spreken",
  kijk: "kijken",
  kijkt: "kijken",
  zeg: "zeggen",
  zegt: "zeggen",
  bel: "bellen",
  belt: "bellen",
  koop: "kopen",
  koopt: "kopen",
  maak: "maken",
  maakt: "maken",
  zoek: "zoeken",
  zoekt: "zoeken",
  vul: "invullen",
  vult: "invullen",
  betaal: "betalen",
  betaalt: "betalen",
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
  rusten: "rusten",
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

const verbInfinitives = new Set([
  "zijn",
  "heten",
  "hebben",
  "kunnen",
  "willen",
  "moeten",
  "gaan",
  "komen",
  "wonen",
  "leren",
  "werken",
  "helpen",
  "beginnen",
  "lezen",
  "luisteren",
  "schrijven",
  "stoppen",
  "herhalen",
  "klikken",
  "doen",
  "zien",
  "sluiten",
  "openen",
  "begrijpen",
  "kijken",
  "zeggen",
  "bellen",
  "kopen",
  "maken",
  "zoeken",
  "invullen",
  "betalen",
  "veranderen",
  "verzetten",
  "afzeggen",
  "vragen",
  "spreken",
  "drinken",
  "eten",
  "koken",
  "lopen",
  "opstaan",
  "staan",
  "slapen",
  "wassen",
  "dragen",
  "pakken",
  "nemen",
  "wachten",
  "hoesten",
  "rusten",
  "noteren",
  "kopiëren",
  "printen",
  "scannen",
  "doorverbinden",
  "terugbellen",
  "gebruiken",
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
  "aankleden",
  "glimlachen",
  "herinneren",
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
  "stemmen",
  "terugbetalen",
  "terugstorten",
  "bezorgen",
  "afhalen",
  "afstemmen",
  "douchen",
  "ontbijten",
  "lunchen",
  "fietsen",
  "wandelen",
  "eindigen",
  "antwoorden",
  "vliegen",
  "proberen",
  "repareren",
  "bevestigen",
  "passen",
  "pinnen",
  "vinden",
  "oefenen",
  "vertellen",
  "weten",
  "denken",
  "meenemen",
  "sturen",
  "langskomen",
  "aanvragen",
  "verplaatsen",
  "inschrijven",
  "ziekmelden",
  "vertrekken",
  "aankomen",
  "overgeven",
  "terugkomen",
  "vervangen",
  "overleggen",
  "doorgeven",
  "overstappen",
  "uitvallen",
  "annuleren",
  "inchecken",
  "uitchecken",
  "vergeten",
  "kloppen",
  "reageren",
  "klagen",
  "ontbreken",
  "meedenken",
  "inloggen",
  "reserveren",
  "hergebruiken",
  "samenvatten",
  "waarderen",
  "toelichten",
  "doorvragen",
  "sparen",
  "lenen",
  "samenwerken",
  "reflecteren",
]);

const adjectives = new Set([
  "goed",
  "slecht",
  "leuk",
  "moeilijk",
  "makkelijk",
  "duur",
  "goedkoop",
  "ziek",
  "beter",
  "verkouden",
  "duizelig",
  "misselijk",
  "moe",
  "benauwd",
  "open",
  "dicht",
  "rood",
  "blauw",
  "groen",
  "geel",
  "zwart",
  "wit",
  "grijs",
  "bruin",
  "nieuw",
  "oud",
  "blij",
  "verdrietig",
  "boos",
  "bang",
  "nerveus",
  "tevreden",
  "ontevreden",
  "verrast",
  "verlegen",
  "trots",
  "langzaam",
  "klein",
  "groot",
  "hoog",
  "laag",
  "lang",
  "kort",
  "licht",
  "zwaar",
  "snel",
  "koud",
  "warm",
  "nat",
  "droog",
  "mooi",
  "lekker",
  "gezond",
  "ongezond",
  "zwak",
  "sterk",
  "vol",
  "leeg",
  "schoon",
  "vies",
  "druk",
  "rustig",
  "veilig",
  "gevaarlijk",
  "klaar",
  "juist",
  "fout",
  "nodig",
  "genoeg",
  "alleenstaand",
  "getrouwd",
  "gescheiden",
  "beschikbaar",
  "betrouwbaar",
  "flexibel",
  "formeel",
  "vriendelijk",
  "aanwezig",
  "afwezig",
  "gemiddeld",
  "gratis",
  "glad",
  "verboden",
  "toegestaan",
  "openbaar",
  "privé",
  "verplicht",
  "eens",
  "oneens",
  "beschadigd",
  "duidelijk",
  "onduidelijk",
  "mogelijk",
  "belangrijk",
  "dringend",
  "verkeerd",
  "wakker",
  "slaperig",
  "vrij",
]);

export const inferWordType = (word: WordItem): WordType => {
  const dutch = norm(word.dutch);
  if (numberWords.has(dutch) || word.scenarioTags.includes("numbers")) return "number";
  if (countryNames.has(dutch)) return "country-name";
  if (dayMonths.has(dutch) || word.scenarioTags.includes("date")) return "day-month";
  if (phraseWords.has(dutch) || dutch.includes(" ")) return "phrase";
  if (functionWords.has(dutch)) return "function-word";
  if (word.article) return "noun";
  if (verbInfinitives.has(dutch) || verbInfinitiveByForm[dutch]) return "verb";
  if (languageNames.has(dutch) || word.scenarioTags.includes("languages")) return "language-name";
  if (adjectives.has(dutch)) return "adjective";
  return "noun";
};

export const infinitiveForWord = (word: WordItem | string) => {
  const dutch = norm(typeof word === "string" ? word : word.dutch);
  return verbInfinitives.has(dutch) ? dutch : verbInfinitiveByForm[dutch];
};

const regularVerbForms = (infinitive: string) => {
  const spellingChanges: Record<string, string> = {
    heten: "heet",
    eten: "eet",
    spreken: "spreek",
    nemen: "neem",
    geven: "geef",
    krijgen: "krijg",
    staan: "sta",
    opstaan: "sta",
    liggen: "lig",
    zetten: "zet",
    zitten: "zit",
    betalen: "betaal",
    bewaren: "bewaar",
    herhalen: "herhaal",
    halen: "haal",
    spelen: "speel",
    horen: "hoor",
    douchen: "douche",
    logeren: "logeer",
    proberen: "probeer",
    repareren: "repareer",
    reserveren: "reserveer",
    waarderen: "waardeer",
    reflecteren: "reflecteer",
    identificeren: "identificeer",
    lopen: "loop",
    hardlopen: "loop",
    zwemmen: "zwem",
    zingen: "zing",
    koken: "kook",
    slapen: "slaap",
    vertellen: "vertel",
    weten: "weet",
    vegen: "veeg",
    strijken: "strijk",
    proeven: "proef",
    schudden: "schud",
    smeren: "smeer",
    begrijpen: "begrijp",
    controleren: "controleer",
    declareren: "declareer",
    retourneren: "retourneer",
    trakteren: "trakteer",
    annuleren: "annuleer",
    reageren: "reageer",
    accepteren: "accepteer",
    weigeren: "weiger",
    verhuizen: "verhuis",
    bewijzen: "bewijs",
    besparen: "bespaar",
    kiezen: "kies",
    verzenden: "verzend",
    versturen: "verstuur",
    sturen: "stuur",
    vergeten: "vergeet",
    klagen: "klaag",
    ontbreken: "ontbreek",
    stemmen: "stem",
    sparen: "spaar",
    lenen: "leen",
    beschrijven: "beschrijf",
    invullen: "vul",
    meenemen: "neem",
    samenwonen: "woon",
    aanmelden: "meld",
    afmelden: "meld",
    aantrekken: "trek",
    uittrekken: "trek",
    terugbrengen: "breng",
    opruimen: "ruim",
    schoonmaken: "maak",
    afwassen: "was",
    afdrogen: "droog",
    ophangen: "hang",
    weggooien: "gooi",
    inpakken: "pak",
    uitpakken: "pak",
    aanzetten: "zet",
    uitzetten: "zet",
    aanraken: "raak",
    uitloggen: "log",
    inloggen: "log",
    uitnodigen: "nodig",
    afspreken: "spreek",
    achterlaten: "laat",
    klaarmaken: "maak",
    uitschrijven: "schrijf",
    aanvinken: "vink",
    toevoegen: "voeg",
    bijvoegen: "voeg",
    doorverwijzen: "verwijs",
    innemen: "neem",
    opzeggen: "zeg",
    thuisblijven: "blijf",
    omreizen: "reis",
    uitstappen: "stap",
    instappen: "stap",
    doorsturen: "stuur",
    opnemen: "neem",
    oplossen: "los",
    terugstorten: "stort",
    afhalen: "haal",
    afstemmen: "stem",
    nakijken: "kijk",
    aanvragen: "vraag",
    inschrijven: "schrijf",
    ziekmelden: "meld",
    aankomen: "kom",
    terugkomen: "kom",
    doorgeven: "geef",
    doorvragen: "vraag",
    overstappen: "stap",
    uitvallen: "val",
    inchecken: "check",
    uitchecken: "check",
    terugbetalen: "betaal",
    meedenken: "denk",
    samenwerken: "werk",
    samenvatten: "vat",
    toelichten: "licht",
    aankleden: "kleed",
    inwerken: "werk",
    uitleggen: "leg",
    aanpassen: "pas",
    aanbieden: "bied",
  };
  if (spellingChanges[infinitive]) return spellingChanges[infinitive];
  if (infinitive.endsWith("llen") || infinitive.endsWith("ppen") || infinitive.endsWith("kken") || infinitive.endsWith("ssen") || infinitive.endsWith("ggen") || infinitive.endsWith("nnen")) {
    const base = infinitive.slice(0, -3);
    return base;
  }
  const base = infinitive.endsWith("en") ? infinitive.slice(0, -2) : infinitive;
  if (infinitive === "leren") return "leer";
  if (infinitive === "wonen") return "woon";
  if (infinitive === "kopen") return "koop";
  if (infinitive === "maken") return "maak";
  if (infinitive === "vragen") return "vraag";
  if (infinitive === "dragen") return "draag";
  if (infinitive === "lezen") return "lees";
  if (infinitive === "schrijven") return "schrijf";
  if (infinitive === "blijven") return "blijf";
  return base;
};

export const verbFormsForWord = (word: WordItem | string) => {
  const infinitive = infinitiveForWord(word);
  if (!infinitive) return undefined;
  const irregular: Record<string, { ik: string; jij: string; hij: string; wij: string }> = {
    zijn: { ik: "ben", jij: "bent", hij: "is", wij: "zijn" },
    hebben: { ik: "heb", jij: "hebt", hij: "heeft", wij: "hebben" },
    heten: { ik: "heet", jij: "heet", hij: "heet", wij: "heten" },
    gaan: { ik: "ga", jij: "gaat", hij: "gaat", wij: "gaan" },
    kunnen: { ik: "kan", jij: "kunt", hij: "kan", wij: "kunnen" },
    willen: { ik: "wil", jij: "wilt", hij: "wil", wij: "willen" },
    moeten: { ik: "moet", jij: "moet", hij: "moet", wij: "moeten" },
    doen: { ik: "doe", jij: "doet", hij: "doet", wij: "doen" },
    zien: { ik: "zie", jij: "ziet", hij: "ziet", wij: "zien" },
  };
  const forms = irregular[infinitive] ?? (() => {
    const ik = regularVerbForms(infinitive);
    return { ik, jij: `${ik}t`, hij: `${ik}t`, wij: infinitive };
  })();
  return { infinitive, ...forms };
};

export const articlePhraseFor = (word: WordItem) => `${word.article ? `${word.article} ` : ""}${word.dutch}`;

const generatedMeaningPattern = /词：|word:|自动扩充|generated expansion|需要人工|placeholder/i;
const hasNaturalMeaning = (word: WordItem) =>
  Boolean(word.meaning.zh.trim() && word.meaning.en.trim()) &&
  !generatedMeaningPattern.test(`${word.meaning.zh} ${word.meaning.en}`);

const meaningZhFor = (word: WordItem) => hasNaturalMeaning(word) ? word.meaning.zh : word.dutch;
const meaningEnFor = (word: WordItem) => hasNaturalMeaning(word) ? word.meaning.en : word.dutch;

const library: Record<string, CollocationTemplate[]> = {
  adres: [
    {
      id: "adres-form",
      phraseChunk: "het adres invullen",
      usageScene: lt("填写表格、搬家、去市政厅", "forms, moving house, municipality"),
      examples: [
        { dutch: "Ik vul mijn adres in.", meaningZh: "我填写我的地址。", meaningEn: "I fill in my address.", type: "collocation", phraseChunkUsed: "het adres invullen", scenarioTags: ["form", "gemeente"] },
        { dutch: "Wat is uw adres?", meaningZh: "您的地址是什么？", meaningEn: "What is your address?", type: "output", phraseChunkUsed: "uw adres", scenarioTags: ["form", "gemeente"] },
        { dutch: "Ik wil mijn adres veranderen.", meaningZh: "我想更改我的地址。", meaningEn: "I want to change my address.", type: "scenario", phraseChunkUsed: "mijn adres veranderen", scenarioTags: ["form", "gemeente"] },
      ],
    },
  ],
  afspraak: [
    {
      id: "afspraak-actions",
      phraseChunk: "een afspraak maken",
      usageScene: lt("预约、改约、取消预约", "making, moving, or canceling appointments"),
      examples: [
        { dutch: "Ik wil graag een afspraak maken.", meaningZh: "我想预约。", meaningEn: "I would like to make an appointment.", type: "collocation", phraseChunkUsed: "een afspraak maken", scenarioTags: ["appointment", "health"] },
        { dutch: "Ik wil mijn afspraak verzetten.", meaningZh: "我想改约。", meaningEn: "I want to reschedule my appointment.", type: "scenario", phraseChunkUsed: "mijn afspraak verzetten", scenarioTags: ["appointment"] },
        { dutch: "Ik moet mijn afspraak afzeggen.", meaningZh: "我必须取消我的预约。", meaningEn: "I have to cancel my appointment.", type: "output", phraseChunkUsed: "mijn afspraak afzeggen", scenarioTags: ["appointment"] },
      ],
    },
  ],
  rekening: [
    {
      id: "rekening-payment",
      phraseChunk: "de rekening betalen",
      usageScene: lt("账单、付款、询问费用", "bills, payment, asking about costs"),
      examples: [
        { dutch: "Ik moet de rekening betalen.", meaningZh: "我必须付账单。", meaningEn: "I have to pay the bill.", type: "collocation", phraseChunkUsed: "de rekening betalen", scenarioTags: ["bill", "payment"] },
        { dutch: "Ik heb een rekening gekregen.", meaningZh: "我收到了一张账单。", meaningEn: "I received a bill.", type: "scenario", phraseChunkUsed: "een rekening krijgen", scenarioTags: ["bill"] },
        { dutch: "Kunt u de rekening uitleggen?", meaningZh: "您能解释一下这张账单吗？", meaningEn: "Can you explain the bill?", type: "output", phraseChunkUsed: "de rekening uitleggen", scenarioTags: ["bill", "help"] },
      ],
    },
  ],
  hulp: [
    {
      id: "hulp-request",
      phraseChunk: "hulp nodig hebben",
      usageScene: lt("求助、办事、遇到问题", "asking for help, admin tasks, problems"),
      examples: [
        { dutch: "Ik heb hulp nodig.", meaningZh: "我需要帮助。", meaningEn: "I need help.", type: "collocation", phraseChunkUsed: "hulp nodig hebben", scenarioTags: ["help"] },
        { dutch: "Ik vraag om hulp.", meaningZh: "我请求帮助。", meaningEn: "I ask for help.", type: "scenario", phraseChunkUsed: "om hulp vragen", scenarioTags: ["help"] },
        { dutch: "Bedankt voor uw hulp.", meaningZh: "感谢您的帮助。", meaningEn: "Thank you for your help.", type: "output", phraseChunkUsed: "bedankt voor uw hulp", scenarioTags: ["help"] },
      ],
    },
  ],
  helpen: [
    {
      id: "helpen-person",
      phraseChunk: "iemand helpen",
      usageScene: lt("请求别人帮忙，或说自己帮别人", "asking someone for help or helping someone"),
      examples: [
        { dutch: "Kunt u mij helpen?", meaningZh: "您能帮我吗？", meaningEn: "Can you help me?", type: "output", phraseChunkUsed: "Kunt u mij helpen?", scenarioTags: ["help", "form"] },
        { dutch: "De medewerker helpt mij met het formulier.", meaningZh: "工作人员帮我填表。", meaningEn: "The employee helps me with the form.", type: "scenario", phraseChunkUsed: "helpen met het formulier", scenarioTags: ["help", "form", "gemeente"] },
        { dutch: "Ik help mijn moeder.", meaningZh: "我帮助我妈妈。", meaningEn: "I help my mother.", type: "minimal", phraseChunkUsed: "iemand helpen", scenarioTags: ["family", "help"] },
      ],
    },
  ],
  engels: [
    {
      id: "engels-language",
      phraseChunk: "Engels spreken",
      usageScene: lt("说自己会什么语言", "saying which language you speak"),
      examples: [
        { dutch: "Ik spreek Engels.", meaningZh: "我说英语。", meaningEn: "I speak English.", type: "collocation", phraseChunkUsed: "Engels spreken", scenarioTags: ["languages"] },
        { dutch: "Spreekt u Engels?", meaningZh: "您说英语吗？", meaningEn: "Do you speak English?", type: "output", phraseChunkUsed: "Engels spreken", scenarioTags: ["languages"] },
        { dutch: "Ik leer Engels.", meaningZh: "我学英语。", meaningEn: "I learn English.", type: "minimal", phraseChunkUsed: "Engels leren", scenarioTags: ["languages"] },
      ],
    },
  ],
  nederlands: [
    {
      id: "nederlands-language",
      phraseChunk: "Nederlands leren",
      usageScene: lt("说自己正在学荷兰语", "saying you are learning Dutch"),
      examples: [
        { dutch: "Ik leer Nederlands.", meaningZh: "我学荷兰语。", meaningEn: "I learn Dutch.", type: "collocation", phraseChunkUsed: "Nederlands leren", scenarioTags: ["languages"] },
        { dutch: "Ik spreek een beetje Nederlands.", meaningZh: "我会说一点荷兰语。", meaningEn: "I speak a little Dutch.", type: "output", phraseChunkUsed: "Nederlands spreken", scenarioTags: ["languages"] },
      ],
    },
  ],
  chinees: [
    {
      id: "chinees-language",
      phraseChunk: "Chinees spreken",
      usageScene: lt("说自己会中文", "saying you speak Chinese"),
      examples: [
        { dutch: "Ik spreek Chinees.", meaningZh: "我说中文。", meaningEn: "I speak Chinese.", type: "collocation", phraseChunkUsed: "Chinees spreken", scenarioTags: ["languages"] },
      ],
    },
  ],
};

export const collocationsForWord = (word: WordItem) => library[norm(word.dutch)] ?? [];

const phraseChunkMeanings: Record<string, LocalizedText> = {
  "het adres invullen": lt("填写地址", "fill in the address"),
  "mijn adres invullen": lt("填写我的地址", "fill in my address"),
  "uw adres": lt("您的地址", "your address"),
  "mijn adres veranderen": lt("更改我的地址", "change my address"),
  "een afspraak maken": lt("预约", "make an appointment"),
  "mijn afspraak verzetten": lt("更改我的预约", "reschedule my appointment"),
  "mijn afspraak afzeggen": lt("取消我的预约", "cancel my appointment"),
  "de rekening betalen": lt("付账单", "pay the bill"),
  "een rekening krijgen": lt("收到一张账单", "receive a bill"),
  "de rekening uitleggen": lt("解释账单", "explain the bill"),
  "hulp nodig hebben": lt("需要帮助", "need help"),
  "om hulp vragen": lt("请求帮助", "ask for help"),
  "bedankt voor uw hulp": lt("感谢您的帮助", "thank you for your help"),
  "iemand helpen": lt("帮助某人", "help someone"),
  "Kunt u mij helpen?": lt("您能帮我吗？", "Can you help me?"),
  "helpen met het formulier": lt("帮忙处理表格", "help with the form"),
  "Engels spreken": lt("说英语", "speak English"),
  "Engels leren": lt("学英语", "learn English"),
  "Nederlands leren": lt("学荷兰语", "learn Dutch"),
  "Nederlands spreken": lt("说荷兰语", "speak Dutch"),
  "Chinees spreken": lt("说中文", "speak Chinese"),
  "vakantie hebben": lt("放假", "be on holiday / have time off"),
  "op vakantie gaan": lt("去度假", "go on holiday"),
  "de vakantie begint": lt("假期开始", "the holiday starts"),
  "tegen de deur duwen": lt("推门", "push against the door"),
  "aan de deur trekken": lt("拉门", "pull the door"),
  "duwen en trekken": lt("推和拉", "push and pull"),
  "Ik begrijp het": lt("我明白了", "I understand it"),
  "een sollicitatie versturen": lt("提交求职申请", "submit a job application"),
  "een sollicitatiegesprek hebben": lt("有一次求职面试", "have a job interview"),
  "op een vacature reageren": lt("回复一个招聘职位", "respond to a vacancy"),
  "mijn cv toevoegen": lt("附上我的简历", "add my CV"),
  "in mijn motivatiebrief": lt("在我的动机信里", "in my motivation letter"),
  "mijn werkgever": lt("我的雇主", "my employer"),
  "als werknemer": lt("作为雇员", "as an employee"),
  "op mijn loonstrook": lt("在我的工资单上", "on my payslip"),
  "salaris betalen": lt("支付工资", "pay salary"),
  "in mijn proeftijd": lt("在我的试用期内", "during my probation period"),
  "werkervaring hebben": lt("有工作经验", "have work experience"),
  "ervaring met klantcontact": lt("客户沟通经验", "experience with customer contact"),
  "fulltime werken": lt("全职工作", "work full-time"),
  "parttime werk zoeken": lt("找兼职工作", "look for part-time work"),
  "op mbo-niveau": lt("mbo 等级", "at mbo level"),
  "feedback geven op": lt("对……给反馈", "give feedback on"),
  "in mijn portfolio bewaren": lt("保存在我的作品/学习档案里", "keep in my portfolio"),
  "in de eerste alinea": lt("在第一段里", "in the first paragraph"),
  "een aantekening maken": lt("做笔记", "make a note"),
  "een argument geven": lt("给出一个理由", "give an argument"),
  "een voorstel doen": lt("提出建议", "make a proposal"),
  "mijn inkomen": lt("我的收入", "my income"),
  "brutoloon en nettoloon": lt("税前工资和税后工资", "gross pay and net pay"),
  "mijn nettoloon": lt("我的税后工资", "my net pay"),
  "een aanvraag indienen": lt("提交申请", "submit an application"),
  "uit China komen": lt("来自中国", "come from China"),
  "in Nederland wonen": lt("住在荷兰", "live in the Netherlands"),
  "hier wonen": lt("住在这里", "live here"),
  "hier zijn": lt("在这里", "be here"),
  "daar zijn": lt("在那里", "be there"),
  "mijn arm doet pijn": lt("我的手臂疼", "my arm hurts"),
  "pijn aan mijn arm": lt("手臂疼", "pain in my arm"),
  "mijn been doet pijn": lt("我的腿疼", "my leg hurts"),
  "pijn aan mijn been": lt("腿疼", "pain in my leg"),
  "mijn hoofd doet pijn": lt("我的头疼", "my head hurts"),
  "hoofdpijn hebben": lt("头疼", "have a headache"),
  "mijn buik doet pijn": lt("我的肚子疼", "my stomach hurts"),
  "buikpijn hebben": lt("肚子疼", "have a stomachache"),
  "mijn hand doet pijn": lt("我的手疼", "my hand hurts"),
  "mijn voet doet pijn": lt("我的脚疼", "my foot hurts"),
  "mijn rug doet pijn": lt("我的背疼", "my back hurts"),
  "pijn aan mijn rug": lt("背疼", "pain in my back"),
  "mijn keel doet pijn": lt("我的喉咙疼", "my throat hurts"),
  "keelpijn hebben": lt("喉咙痛", "have a sore throat"),
  "koorts hebben": lt("发烧", "have a fever"),
  "ziek zijn": lt("生病", "be sick"),
  "verkouden zijn": lt("感冒了", "have a cold"),
  "moeten hoesten": lt("需要咳嗽/一直咳嗽", "need to cough / be coughing"),
  "veel hoesten": lt("咳嗽很多", "cough a lot"),
  "even rusten": lt("休息一下", "rest for a moment"),
  "vandaag rusten": lt("今天休息", "rest today"),
  "rust nemen": lt("休息一下", "take a rest"),
  "duizelig zijn": lt("头晕", "be dizzy"),
  "misselijk zijn": lt("恶心想吐", "feel nauseous"),
  "moe zijn": lt("累了", "be tired"),
  "benauwd zijn": lt("胸闷/呼吸不舒服", "be short of breath"),
  "een beetje Nederlands": lt("一点荷兰语", "a little Dutch"),
  "nog een keer": lt("再一次", "one more time"),
  "kunt u": lt("您可以/您能", "can you"),
  "langzaam spreken": lt("慢一点说", "speak slowly"),
  "dat herhalen": lt("重复那句话", "repeat that"),
  "water willen": lt("想要水", "want water"),
  "brood kopen": lt("买面包", "buy bread"),
  "naar school gaan": lt("去学校", "go to school"),
  "naar de supermarkt gaan": lt("去超市", "go to the supermarket"),
  "waar is het station": lt("车站在哪里", "where the station is"),
  "de trein komt": lt("火车到达/过来", "the train arrives/comes"),
  "vertraging hebben": lt("晚点/延误", "be delayed"),
  "het formulier invullen": lt("填写表格", "fill in the form"),
  "een document nodig hebben": lt("需要一份文件", "need a document"),
  "naar de gemeente gaan": lt("去市政厅", "go to the municipality"),
  "naar de dokter gaan": lt("去看医生", "go to the doctor"),
  "probleem met mijn woning": lt("我的住房有问题", "problem with my home"),
  "de huur betalen": lt("付房租", "pay the rent"),
  "naar de apotheek gaan": lt("去药房", "go to the pharmacy"),
  "medicijn ophalen": lt("取药", "pick up medicine"),
  "een e-mail schrijven": lt("写一封邮件", "write an email"),
  "met pin betalen": lt("刷卡付款", "pay by card"),
  "contact opnemen met": lt("联系", "contact"),
  "aan de lijn blijven": lt("保持通话/不要挂断", "stay on the line"),
  "een bericht inspreken": lt("留语音留言", "leave a voice message"),
  "samen leren": lt("一起学习", "learn together"),
  "alleen komen": lt("一个人来", "come alone"),
  "klik hier": lt("点击这里", "click here"),
  "iets zien": lt("看见某物", "see something"),
  "Nederlands kunnen spreken": lt("会说荷兰语", "be able to speak Dutch"),
  "boodschappen doen": lt("买菜/买日用品", "do grocery shopping"),
  "een kleine tas": lt("一个小包", "a small bag"),
  "een grote tas": lt("一个大包", "a big bag"),
  "snel komen": lt("快点来", "come quickly"),
  "klaar zijn": lt("准备好了/完成了", "be ready/done"),
  "salaris krijgen": lt("拿工资", "receive salary"),
  "mijn salaris": lt("我的工资", "my salary"),
  "mijn loonstrook krijgen": lt("收到我的工资单", "receive my payslip"),
  "op mijn loonstrook staan": lt("在我的工资单上", "be shown on my payslip"),
  "mijn proeftijd": lt("我的试用期", "my trial period"),
  "in mijn proeftijd zitten": lt("还在试用期", "be in my trial period"),
  "afwezigheid doorgeven": lt("报告/告知缺勤", "report absence"),
  "afwezigheid in het systeem": lt("系统里的缺勤记录", "absence in the system"),
  "via een uitzendbureau werken": lt("通过派遣公司工作", "work through an employment agency"),
  "het uitzendbureau belt": lt("派遣公司打电话", "the employment agency calls"),
  "mijn herstel": lt("我的恢复", "my recovery"),
  "tijd nodig voor herstel": lt("需要时间恢复", "need time for recovery"),
  "verlof aanvragen": lt("申请休假", "request leave"),
  "verlof hebben": lt("休假", "have leave"),
  "de waterrekening betalen": lt("付水费账单", "pay the water bill"),
  "de waterrekening is hoger": lt("水费账单更高", "the water bill is higher"),
  "een herinnering krijgen": lt("收到提醒/催缴信", "receive a reminder"),
  "herinnering over de rekening": lt("关于账单的提醒", "reminder about the bill"),
  "in de ochtend": lt("在上午", "in the morning"),
  "in de namiddag": lt("在下午晚些时候", "in the late afternoon"),
  "in de nacht": lt("在夜里", "at night"),
  "om middernacht": lt("在午夜", "at midnight"),
  "middagpauze hebben": lt("午休", "have a lunch break"),
  "een werkdag": lt("一个工作日", "a workday"),
  "een feestdag": lt("一个节日/假日", "a holiday"),
  "mijn verjaardag": lt("我的生日", "my birthday"),
  "in de kalender": lt("在日历里", "in the calendar"),
  "laatst ziek zijn": lt("最近生病", "be sick recently"),
  "elke week": lt("每周", "every week"),
  "per maand": lt("每月/按月", "per month"),
};

export const phraseChunkMeaningFor = (chunk: string): LocalizedText | undefined => phraseChunkMeanings[chunk.trim()];

const functionWordExamples: Record<string, TemplateExample[]> = {
  maar: [{ dutch: "Ik wil koffie, maar ik heb geen tijd.", meaningZh: "我想要咖啡，但是我没时间。", meaningEn: "I want coffee, but I do not have time.", type: "scenario", phraseChunkUsed: "maar", scenarioTags: ["daily"] }],
  ook: [{ dutch: "Ik leer ook Nederlands.", meaningZh: "我也学荷兰语。", meaningEn: "I also learn Dutch.", type: "minimal", phraseChunkUsed: "ook", scenarioTags: ["languages"] }],
  nog: [{ dutch: "Ik heb nog een vraag.", meaningZh: "我还有一个问题。", meaningEn: "I still have one question.", type: "output", phraseChunkUsed: "nog een vraag", scenarioTags: ["help"] }],
  al: [{ dutch: "Ik ben al klaar.", meaningZh: "我已经好了。", meaningEn: "I am already ready.", type: "minimal", phraseChunkUsed: "al klaar", scenarioTags: ["daily"] }],
  want: [{ dutch: "Ik kan niet komen, want ik ben ziek.", meaningZh: "我不能来，因为我病了。", meaningEn: "I cannot come because I am sick.", type: "scenario", phraseChunkUsed: "want", scenarioTags: ["sick-leave"] }],
  omdat: [{ dutch: "Ik kan niet komen omdat ik moet werken.", meaningZh: "我不能来，因为我必须工作。", meaningEn: "I cannot come because I have to work.", type: "scenario", phraseChunkUsed: "omdat ik moet werken", scenarioTags: ["work"] }],
  zodat: [{ dutch: "Ik stuur de bijlage, zodat u alles kunt controleren.", meaningZh: "我发送附件，这样您可以检查所有内容。", meaningEn: "I send the attachment so that you can check everything.", type: "output", phraseChunkUsed: "zodat u kunt controleren", scenarioTags: ["writing", "form"] }],
  hoewel: [{ dutch: "Hoewel ik morgen werk, kan ik in de middag komen.", meaningZh: "虽然我明天工作，但我下午可以来。", meaningEn: "Although I work tomorrow, I can come in the afternoon.", type: "scenario", phraseChunkUsed: "hoewel ik werk", scenarioTags: ["work", "appointment"] }],
  voordat: [{ dutch: "Voordat ik reageer, wil ik de brief goed lezen.", meaningZh: "在我回复之前，我想仔细读这封信。", meaningEn: "Before I respond, I want to read the letter carefully.", type: "scenario", phraseChunkUsed: "voordat ik reageer", scenarioTags: ["reading", "writing"] }],
  nadat: [{ dutch: "Nadat ik de tabel heb gelezen, schrijf ik mijn antwoord.", meaningZh: "读完表格后，我写我的回复。", meaningEn: "After I have read the table, I write my answer.", type: "scenario", phraseChunkUsed: "nadat ik heb gelezen", scenarioTags: ["reading", "writing"] }],
  terwijl: [{ dutch: "Terwijl ik wacht, vul ik het formulier in.", meaningZh: "等待时，我填写表格。", meaningEn: "While I wait, I fill in the form.", type: "scenario", phraseChunkUsed: "terwijl ik wacht", scenarioTags: ["form"] }],
  volgens: [{ dutch: "Volgens de brief moet ik binnen twee weken reageren.", meaningZh: "根据信件，我必须在两周内回复。", meaningEn: "According to the letter, I must respond within two weeks.", type: "scenario", phraseChunkUsed: "volgens de brief", scenarioTags: ["reading", "writing"] }],
  daarnaast: [{ dutch: "Daarnaast wil ik graag meer informatie ontvangen.", meaningZh: "此外，我想收到更多信息。", meaningEn: "In addition, I would like to receive more information.", type: "output", phraseChunkUsed: "daarnaast wil ik", scenarioTags: ["writing"] }],
  bovendien: [{ dutch: "Bovendien heb ik al ervaring met klantcontact.", meaningZh: "而且，我已经有客户沟通经验。", meaningEn: "Moreover, I already have experience with customer contact.", type: "output", phraseChunkUsed: "bovendien heb ik ervaring", scenarioTags: ["work"] }],
  namelijk: [{ dutch: "Ik heb een vraag, namelijk over de betaling.", meaningZh: "我有一个问题，也就是关于付款的问题。", meaningEn: "I have a question, namely about the payment.", type: "output", phraseChunkUsed: "namelijk over", scenarioTags: ["bill", "writing"] }],
  daardoor: [{ dutch: "Daardoor kan ik de afspraak niet halen.", meaningZh: "因此我赶不上这个预约。", meaningEn: "As a result, I cannot make the appointment.", type: "scenario", phraseChunkUsed: "daardoor kan ik niet", scenarioTags: ["appointment"] }],
  doordat: [{ dutch: "Doordat de trein vertraging heeft, kom ik later.", meaningZh: "因为火车晚点，我会晚点到。", meaningEn: "Because the train is delayed, I will arrive later.", type: "scenario", phraseChunkUsed: "doordat de trein vertraging heeft", scenarioTags: ["transport", "appointment"] }],
  als: [{ dutch: "Als u tijd heeft, kunt u mij bellen.", meaningZh: "如果您有时间，可以给我打电话。", meaningEn: "If you have time, you can call me.", type: "output", phraseChunkUsed: "als u tijd heeft", scenarioTags: ["phone-call", "appointment"] }],
  toen: [{ dutch: "Toen ik de brief kreeg, heb ik meteen gereageerd.", meaningZh: "当我收到信时，我马上回复了。", meaningEn: "When I received the letter, I responded immediately.", type: "scenario", phraseChunkUsed: "toen ik de brief kreeg", scenarioTags: ["writing", "admin"] }],
  kortom: [{ dutch: "Kortom, ik ben het ermee eens.", meaningZh: "总之，我同意这件事。", meaningEn: "In short, I agree with it.", type: "output", phraseChunkUsed: "kortom", scenarioTags: ["opinion", "writing"] }],
  geen: [{ dutch: "Ik heb geen tijd.", meaningZh: "我没有时间。", meaningEn: "I have no time.", type: "minimal", phraseChunkUsed: "geen tijd", scenarioTags: ["daily"] }],
  niet: [{ dutch: "Ik begrijp het niet.", meaningZh: "我不明白。", meaningEn: "I do not understand it.", type: "output", phraseChunkUsed: "niet begrijpen", scenarioTags: ["help", "classroom"] }],
  wel: [{ dutch: "Dat klopt wel.", meaningZh: "那确实是对的。", meaningEn: "That is indeed correct.", type: "contrast", phraseChunkUsed: "klopt wel", scenarioTags: ["daily"] }],
  en: [{ dutch: "Ik leer Nederlands en Engels.", meaningZh: "我学荷兰语和英语。", meaningEn: "I learn Dutch and English.", type: "minimal", phraseChunkUsed: "en", scenarioTags: ["languages"] }],
  of: [{ dutch: "Wil je koffie of thee?", meaningZh: "你想要咖啡还是茶？", meaningEn: "Do you want coffee or tea?", type: "output", phraseChunkUsed: "of", scenarioTags: ["food"] }],
  om: [{ dutch: "Ik kom om negen uur.", meaningZh: "我九点来。", meaningEn: "I come at nine o'clock.", type: "scenario", phraseChunkUsed: "om negen uur", scenarioTags: ["time"] }],
  in: [{ dutch: "Ik woon in Nederland.", meaningZh: "我住在荷兰。", meaningEn: "I live in the Netherlands.", type: "minimal", phraseChunkUsed: "in Nederland", scenarioTags: ["identity"] }],
  op: [{ dutch: "Het boek ligt op tafel.", meaningZh: "书在桌子上。", meaningEn: "The book is on the table.", type: "scenario", phraseChunkUsed: "op tafel", scenarioTags: ["home"] }],
  naar: [{ dutch: "Ik ga naar school.", meaningZh: "我去学校。", meaningEn: "I go to school.", type: "minimal", phraseChunkUsed: "naar school", scenarioTags: ["school"] }],
  bij: [{ dutch: "Ik ben bij de huisarts.", meaningZh: "我在家庭医生那里。", meaningEn: "I am at the GP.", type: "scenario", phraseChunkUsed: "bij de huisarts", scenarioTags: ["health"] }],
  met: [{ dutch: "Ik betaal met pin.", meaningZh: "我用银行卡付款。", meaningEn: "I pay by card.", type: "scenario", phraseChunkUsed: "met pin betalen", scenarioTags: ["payment"] }],
  voor: [{ dutch: "Dit is voor jou.", meaningZh: "这是给你的。", meaningEn: "This is for you.", type: "output", phraseChunkUsed: "voor jou", scenarioTags: ["daily"] }],
  waar: [{ dutch: "Waar is het station?", meaningZh: "车站在哪里？", meaningEn: "Where is the station?", type: "output", phraseChunkUsed: "waar is", scenarioTags: ["directions", "transport"] }],
  waarheen: [{ dutch: "Waarheen gaat u?", meaningZh: "您要去哪里？", meaningEn: "Where are you going?", type: "output", phraseChunkUsed: "waarheen gaan", scenarioTags: ["directions"] }],
  waarvandaan: [{ dutch: "Waarvandaan komt u?", meaningZh: "您从哪里来？", meaningEn: "Where do you come from?", type: "output", phraseChunkUsed: "waarvandaan komen", scenarioTags: ["identity"] }],
  wanneer: [{ dutch: "Wanneer kan ik komen?", meaningZh: "我什么时候可以来？", meaningEn: "When can I come?", type: "output", phraseChunkUsed: "wanneer kan ik", scenarioTags: ["appointment"] }],
  wie: [{ dutch: "Wie ben jij?", meaningZh: "你是谁？", meaningEn: "Who are you?", type: "minimal", phraseChunkUsed: "wie ben jij", scenarioTags: ["identity"] }],
  wat: [{ dutch: "Wat is dat?", meaningZh: "那是什么？", meaningEn: "What is that?", type: "minimal", phraseChunkUsed: "wat is dat", scenarioTags: ["classroom"] }],
  hoe: [{ dutch: "Hoe gaat het?", meaningZh: "你好吗？", meaningEn: "How are you?", type: "minimal", phraseChunkUsed: "hoe gaat het", scenarioTags: ["greeting"] }],
  ik: [{ dutch: "Ik ben student.", meaningZh: "我是学生。", meaningEn: "I am a student.", type: "minimal", phraseChunkUsed: "ik ben", scenarioTags: ["identity"] }],
  jij: [{ dutch: "Jij bent mijn vriend.", meaningZh: "你是我的朋友。", meaningEn: "You are my friend.", type: "minimal", phraseChunkUsed: "jij bent", scenarioTags: ["identity"] }],
  je: [{ dutch: "Hoe heet je?", meaningZh: "你叫什么名字？", meaningEn: "What is your name?", type: "output", phraseChunkUsed: "heet je", scenarioTags: ["identity"] }],
  u: [{ dutch: "Spreekt u Nederlands?", meaningZh: "您说荷兰语吗？", meaningEn: "Do you speak Dutch?", type: "output", phraseChunkUsed: "spreekt u", scenarioTags: ["languages"] }],
  mijn: [{ dutch: "Dit is mijn boek.", meaningZh: "这是我的书。", meaningEn: "This is my book.", type: "minimal", phraseChunkUsed: "mijn boek", scenarioTags: ["identity"] }],
  jouw: [{ dutch: "Wat is jouw naam?", meaningZh: "你的名字是什么？", meaningEn: "What is your name?", type: "output", phraseChunkUsed: "jouw naam", scenarioTags: ["identity"] }],
  uw: [{ dutch: "Wat is uw adres?", meaningZh: "您的地址是什么？", meaningEn: "What is your address?", type: "output", phraseChunkUsed: "uw adres", scenarioTags: ["form"] }],
  uit: [{ dutch: "Ik kom uit China.", meaningZh: "我来自中国。", meaningEn: "I come from China.", type: "minimal", phraseChunkUsed: "uit China komen", scenarioTags: ["identity"] }],
  hier: [{ dutch: "Ik woon hier.", meaningZh: "我住在这里。", meaningEn: "I live here.", type: "minimal", phraseChunkUsed: "hier wonen", scenarioTags: ["identity"] }],
  daar: [{ dutch: "Het station is daar.", meaningZh: "车站在那里。", meaningEn: "The station is there.", type: "minimal", phraseChunkUsed: "daar zijn", scenarioTags: ["directions"] }],
  welk: [{ dutch: "Welk nummer heeft u?", meaningZh: "您有什么号码？", meaningEn: "Which number do you have?", type: "output", phraseChunkUsed: "welk nummer", scenarioTags: ["form"] }],
  welke: [{ dutch: "Welke lijn moet ik nemen?", meaningZh: "我应该坐哪条线路？", meaningEn: "Which line should I take?", type: "output", phraseChunkUsed: "welke lijn", scenarioTags: ["transport"] }],
  links: [{ dutch: "Ga links.", meaningZh: "向左走。", meaningEn: "Go left.", type: "output", phraseChunkUsed: "links gaan", scenarioTags: ["directions"] }],
  rechts: [{ dutch: "Ga rechts.", meaningZh: "向右走。", meaningEn: "Go right.", type: "output", phraseChunkUsed: "rechts gaan", scenarioTags: ["directions"] }],
  rechtdoor: [{ dutch: "Ga rechtdoor.", meaningZh: "直走。", meaningEn: "Go straight ahead.", type: "output", phraseChunkUsed: "rechtdoor gaan", scenarioTags: ["directions"] }],
  naast: [{ dutch: "De apotheek is naast de supermarkt.", meaningZh: "药房在超市旁边。", meaningEn: "The pharmacy is next to the supermarket.", type: "scenario", phraseChunkUsed: "naast de supermarkt", scenarioTags: ["directions"] }],
  tegenover: [{ dutch: "Het station is tegenover de winkel.", meaningZh: "车站在商店对面。", meaningEn: "The station is opposite the shop.", type: "scenario", phraseChunkUsed: "tegenover de winkel", scenarioTags: ["directions"] }],
  achter: [{ dutch: "De fiets staat achter het huis.", meaningZh: "自行车在房子后面。", meaningEn: "The bike is behind the house.", type: "scenario", phraseChunkUsed: "achter het huis", scenarioTags: ["directions"] }],
  boven: [{ dutch: "Ik woon boven.", meaningZh: "我住在楼上。", meaningEn: "I live upstairs.", type: "minimal", phraseChunkUsed: "boven wonen", scenarioTags: ["housing"] }],
  beneden: [{ dutch: "De wc is beneden.", meaningZh: "厕所在楼下。", meaningEn: "The toilet is downstairs.", type: "scenario", phraseChunkUsed: "beneden zijn", scenarioTags: ["housing"] }],
  dichtbij: [{ dutch: "Het station is dichtbij.", meaningZh: "车站很近。", meaningEn: "The station is nearby.", type: "scenario", phraseChunkUsed: "dichtbij zijn", scenarioTags: ["directions"] }],
  ver: [{ dutch: "Het station is ver.", meaningZh: "车站很远。", meaningEn: "The station is far.", type: "scenario", phraseChunkUsed: "ver zijn", scenarioTags: ["directions"] }],
  binnen: [{ dutch: "Ik wacht binnen.", meaningZh: "我在里面等。", meaningEn: "I wait inside.", type: "scenario", phraseChunkUsed: "binnen wachten", scenarioTags: ["daily"] }],
  buiten: [{ dutch: "Ik wacht buiten.", meaningZh: "我在外面等。", meaningEn: "I wait outside.", type: "scenario", phraseChunkUsed: "buiten wachten", scenarioTags: ["daily"] }],
  tussen: [{ dutch: "De bank staat tussen twee winkels.", meaningZh: "银行在两家商店之间。", meaningEn: "The bank is between two shops.", type: "scenario", phraseChunkUsed: "tussen twee winkels", scenarioTags: ["directions"] }],
  graag: [{ dutch: "Ik wil graag koffie.", meaningZh: "我想要咖啡。", meaningEn: "I would like coffee.", type: "output", phraseChunkUsed: "graag willen", scenarioTags: ["food"] }],
  liever: [{ dutch: "Ik wil liever thee.", meaningZh: "我更想要茶。", meaningEn: "I would rather have tea.", type: "output", phraseChunkUsed: "liever willen", scenarioTags: ["food"] }],
  altijd: [{ dutch: "Ik kom altijd op tijd.", meaningZh: "我总是准时来。", meaningEn: "I always come on time.", type: "scenario", phraseChunkUsed: "altijd op tijd", scenarioTags: ["time"] }],
  vaak: [{ dutch: "Ik fiets vaak.", meaningZh: "我经常骑车。", meaningEn: "I often cycle.", type: "scenario", phraseChunkUsed: "vaak fietsen", scenarioTags: ["routine"] }],
  soms: [{ dutch: "Ik werk soms thuis.", meaningZh: "我有时在家工作。", meaningEn: "I sometimes work at home.", type: "scenario", phraseChunkUsed: "soms thuis werken", scenarioTags: ["work"] }],
  nooit: [{ dutch: "Ik rook nooit.", meaningZh: "我从不抽烟。", meaningEn: "I never smoke.", type: "scenario", phraseChunkUsed: "nooit roken", scenarioTags: ["health"] }],
  meestal: [{ dutch: "Meestal kom ik om acht uur.", meaningZh: "我通常八点来。", meaningEn: "Usually I come at eight o'clock.", type: "scenario", phraseChunkUsed: "meestal komen", scenarioTags: ["time"] }],
  vroeg: [{ dutch: "Ik kom vroeg.", meaningZh: "我来得早。", meaningEn: "I come early.", type: "scenario", phraseChunkUsed: "vroeg komen", scenarioTags: ["time"] }],
  laat: [{ dutch: "Ik ben laat.", meaningZh: "我迟到了。", meaningEn: "I am late.", type: "scenario", phraseChunkUsed: "laat zijn", scenarioTags: ["time"] }],
  later: [{ dutch: "Ik kom later.", meaningZh: "我晚点来。", meaningEn: "I will come later.", type: "scenario", phraseChunkUsed: "later komen", scenarioTags: ["appointment"] }],
  eerder: [{ dutch: "Kan ik eerder komen?", meaningZh: "我可以早点来吗？", meaningEn: "Can I come earlier?", type: "output", phraseChunkUsed: "eerder komen", scenarioTags: ["appointment"] }],
  nu: [{ dutch: "Ik begin nu.", meaningZh: "我现在开始。", meaningEn: "I start now.", type: "minimal", phraseChunkUsed: "nu beginnen", scenarioTags: ["daily"] }],
  straks: [{ dutch: "Ik kom straks.", meaningZh: "我一会儿来。", meaningEn: "I will come soon.", type: "scenario", phraseChunkUsed: "straks komen", scenarioTags: ["time"] }],
  meteen: [{ dutch: "Ik kom meteen.", meaningZh: "我马上来。", meaningEn: "I will come immediately.", type: "scenario", phraseChunkUsed: "meteen komen", scenarioTags: ["time"] }],
  daarna: [{ dutch: "Daarna ga ik naar huis.", meaningZh: "之后我回家。", meaningEn: "After that I go home.", type: "scenario", phraseChunkUsed: "daarna gaan", scenarioTags: ["time"] }],
  eerst: [{ dutch: "Eerst betaal ik.", meaningZh: "我先付款。", meaningEn: "First I pay.", type: "scenario", phraseChunkUsed: "eerst betalen", scenarioTags: ["payment"] }],
  laatst: [{ dutch: "Ik was laatst ziek.", meaningZh: "我最近生病了。", meaningEn: "I was sick recently.", type: "scenario", phraseChunkUsed: "laatst ziek zijn", scenarioTags: ["time", "health"] }],
  misschien: [{ dutch: "Misschien kom ik morgen.", meaningZh: "也许我明天来。", meaningEn: "Maybe I will come tomorrow.", type: "scenario", phraseChunkUsed: "misschien komen", scenarioTags: ["time"] }],
  zeker: [{ dutch: "Dat weet ik zeker.", meaningZh: "我确定知道。", meaningEn: "I know that for sure.", type: "scenario", phraseChunkUsed: "zeker weten", scenarioTags: ["daily"] }],
  ongeveer: [{ dutch: "Het kost ongeveer tien euro.", meaningZh: "大约十欧。", meaningEn: "It costs about ten euros.", type: "scenario", phraseChunkUsed: "ongeveer tien euro", scenarioTags: ["payment"] }],
  bijvoorbeeld: [{ dutch: "Ik kan bijvoorbeeld op maandag komen.", meaningZh: "例如，我可以周一来。", meaningEn: "For example, I can come on Monday.", type: "output", phraseChunkUsed: "bijvoorbeeld op maandag", scenarioTags: ["writing", "appointment"] }],
  gemiddeld: [{ dutch: "Gemiddeld werk ik vier dagen per week.", meaningZh: "平均来说，我每周工作四天。", meaningEn: "On average, I work four days per week.", type: "scenario", phraseChunkUsed: "gemiddeld werken", scenarioTags: ["work"] }],
  bruto: [{ dutch: "Mijn bruto salaris staat op de loonstrook.", meaningZh: "我的税前工资写在工资单上。", meaningEn: "My gross salary is shown on the payslip.", type: "scenario", phraseChunkUsed: "bruto salaris", scenarioTags: ["work", "tax"] }],
  netto: [{ dutch: "Mijn netto inkomen is lager dan mijn bruto salaris.", meaningZh: "我的税后收入低于税前工资。", meaningEn: "My net income is lower than my gross salary.", type: "contrast", phraseChunkUsed: "netto inkomen", scenarioTags: ["work", "tax"] }],
  veel: [{ dutch: "Ik heb veel tijd.", meaningZh: "我有很多时间。", meaningEn: "I have a lot of time.", type: "minimal", phraseChunkUsed: "veel tijd", scenarioTags: ["time"] }],
  weinig: [{ dutch: "Ik heb weinig tijd.", meaningZh: "我时间很少。", meaningEn: "I have little time.", type: "minimal", phraseChunkUsed: "weinig tijd", scenarioTags: ["time"] }],
  meer: [{ dutch: "Ik wil meer water.", meaningZh: "我想要更多水。", meaningEn: "I want more water.", type: "output", phraseChunkUsed: "meer water", scenarioTags: ["food"] }],
  minder: [{ dutch: "Ik wil minder suiker.", meaningZh: "我想少放糖。", meaningEn: "I want less sugar.", type: "output", phraseChunkUsed: "minder suiker", scenarioTags: ["food"] }],
  contant: [{ dutch: "Kan ik contant betalen?", meaningZh: "我可以付现金吗？", meaningEn: "Can I pay in cash?", type: "output", phraseChunkUsed: "contant betalen", scenarioTags: ["payment"] }],
  totaal: [{ dutch: "Wat is het totaal?", meaningZh: "总共是多少？", meaningEn: "What is the total?", type: "output", phraseChunkUsed: "het totaal", scenarioTags: ["payment"] }],
  extra: [{ dutch: "Dat kost extra.", meaningZh: "那要额外收费。", meaningEn: "That costs extra.", type: "scenario", phraseChunkUsed: "extra kosten", scenarioTags: ["payment"] }],
  verboden: [{ dutch: "Roken is verboden.", meaningZh: "禁止吸烟。", meaningEn: "Smoking is forbidden.", type: "scenario", phraseChunkUsed: "is verboden", scenarioTags: ["public-signs"] }],
  toegestaan: [{ dutch: "Parkeren is toegestaan.", meaningZh: "允许停车。", meaningEn: "Parking is allowed.", type: "scenario", phraseChunkUsed: "is toegestaan", scenarioTags: ["public-signs"] }],
  openbaar: [{ dutch: "Dit is openbaar vervoer.", meaningZh: "这是公共交通。", meaningEn: "This is public transport.", type: "scenario", phraseChunkUsed: "openbaar vervoer", scenarioTags: ["transport"] }],
  privé: [{ dutch: "Dit is privé.", meaningZh: "这是私人的。", meaningEn: "This is private.", type: "scenario", phraseChunkUsed: "privé", scenarioTags: ["public-signs"] }],
  eens: [{ dutch: "Ik ben het eens met dit voorstel.", meaningZh: "我同意这个提议。", meaningEn: "I agree with this proposal.", type: "output", phraseChunkUsed: "het eens zijn met", scenarioTags: ["opinion"] }],
  oneens: [{ dutch: "Ik ben het oneens met dit besluit.", meaningZh: "我不同意这个决定。", meaningEn: "I disagree with this decision.", type: "output", phraseChunkUsed: "het oneens zijn met", scenarioTags: ["opinion"] }],
  dus: [{ dutch: "Ik ben ziek, dus ik blijf thuis.", meaningZh: "我病了，所以我待在家里。", meaningEn: "I am sick, so I stay home.", type: "scenario", phraseChunkUsed: "dus", scenarioTags: ["health"] }],
  daarom: [{ dutch: "Ik ben ziek. Daarom blijf ik thuis.", meaningZh: "我病了。因此我待在家里。", meaningEn: "I am sick. Therefore I stay home.", type: "scenario", phraseChunkUsed: "daarom blijf ik", scenarioTags: ["health", "writing"] }],
  toch: [{ dutch: "Ik kom toch.", meaningZh: "我还是会来。", meaningEn: "I will come after all.", type: "scenario", phraseChunkUsed: "toch komen", scenarioTags: ["appointment"] }],
  verplicht: [{ dutch: "Een helm is verplicht op deze plek.", meaningZh: "在这个地方必须戴头盔。", meaningEn: "A helmet is mandatory in this place.", type: "scenario", phraseChunkUsed: "is verplicht", scenarioTags: ["safety"] }],
  samen: [{ dutch: "Wij leren samen.", meaningZh: "我们一起学习。", meaningEn: "We learn together.", type: "scenario", phraseChunkUsed: "samen leren", scenarioTags: ["school"] }],
  alleen: [{ dutch: "Ik kom alleen.", meaningZh: "我一个人来。", meaningEn: "I come alone.", type: "minimal", phraseChunkUsed: "alleen komen", scenarioTags: ["identity"] }],
  nogmaals: [{ dutch: "Nogmaals, alstublieft.", meaningZh: "请再说一遍。", meaningEn: "Again, please.", type: "output", phraseChunkUsed: "nogmaals", scenarioTags: ["help", "classroom"] }],
  dit: [{ dutch: "Wat is dit?", meaningZh: "这是什么？", meaningEn: "What is this?", type: "minimal", phraseChunkUsed: "wat is dit", scenarioTags: ["classroom"] }],
  dat: [{ dutch: "Wat is dat?", meaningZh: "那是什么？", meaningEn: "What is that?", type: "minimal", phraseChunkUsed: "wat is dat", scenarioTags: ["classroom"] }],
  is: [{ dutch: "Wat is dat?", meaningZh: "那是什么？", meaningEn: "What is that?", type: "minimal", phraseChunkUsed: "wat is", scenarioTags: ["classroom"] }],
  het: [{ dutch: "Ik begrijp het niet.", meaningZh: "我不明白。", meaningEn: "I do not understand it.", type: "output", phraseChunkUsed: "het niet begrijpen", scenarioTags: ["help"] }],
};

const verbExamples: Record<string, TemplateExample[]> = {
  zijn: [
    { dutch: "Ik ben Lin.", meaningZh: "我是 Lin。", meaningEn: "I am Lin.", type: "minimal", phraseChunkUsed: "ik ben", scenarioTags: ["identity"] },
    { dutch: "Ben jij student?", meaningZh: "你是学生吗？", meaningEn: "Are you a student?", type: "output", phraseChunkUsed: "ben jij", scenarioTags: ["identity"] },
  ],
  hebben: [
    { dutch: "Ik heb een boek.", meaningZh: "我有一本书。", meaningEn: "I have a book.", type: "minimal", phraseChunkUsed: "een boek hebben", scenarioTags: ["classroom"] },
    { dutch: "Wij hebben tijd.", meaningZh: "我们有时间。", meaningEn: "We have time.", type: "scenario", phraseChunkUsed: "tijd hebben", scenarioTags: ["time"] },
  ],
  kunnen: [
    { dutch: "Ik kan Nederlands spreken.", meaningZh: "我会说荷兰语。", meaningEn: "I can speak Dutch.", type: "output", phraseChunkUsed: "Nederlands kunnen spreken", scenarioTags: ["languages"] },
    { dutch: "Kunt u mij helpen?", meaningZh: "您能帮我吗？", meaningEn: "Can you help me?", type: "output", phraseChunkUsed: "Kunt u mij helpen?", scenarioTags: ["help"] },
  ],
  willen: [
    { dutch: "Ik wil water.", meaningZh: "我想要水。", meaningEn: "I want water.", type: "output", phraseChunkUsed: "water willen", scenarioTags: ["food"] },
    { dutch: "Ik wil graag een afspraak maken.", meaningZh: "我想预约。", meaningEn: "I would like to make an appointment.", type: "scenario", phraseChunkUsed: "een afspraak maken", scenarioTags: ["appointment"] },
  ],
  moeten: [
    { dutch: "Ik moet vandaag rusten.", meaningZh: "我今天需要休息。", meaningEn: "I need to rest today.", type: "scenario", phraseChunkUsed: "vandaag rusten", scenarioTags: ["health"] },
    { dutch: "Ik moet het formulier invullen.", meaningZh: "我必须填写表格。", meaningEn: "I have to fill in the form.", type: "scenario", phraseChunkUsed: "het formulier invullen", scenarioTags: ["form"] },
  ],
  helpen: [
    { dutch: "Kunt u mij helpen?", meaningZh: "您能帮我吗？", meaningEn: "Can you help me?", type: "output", phraseChunkUsed: "Kunt u mij helpen?", scenarioTags: ["help"] },
    { dutch: "Ik help mijn moeder.", meaningZh: "我帮我妈妈。", meaningEn: "I help my mother.", type: "minimal", phraseChunkUsed: "iemand helpen", scenarioTags: ["family", "help"] },
  ],
  hoesten: [
    { dutch: "Ik moet hoesten.", meaningZh: "我一直想咳嗽。", meaningEn: "I have to cough.", type: "scenario", phraseChunkUsed: "moeten hoesten", scenarioTags: ["health"] },
    { dutch: "Ik hoest veel.", meaningZh: "我咳嗽很多。", meaningEn: "I cough a lot.", type: "minimal", phraseChunkUsed: "veel hoesten", scenarioTags: ["health"] },
  ],
  rusten: [
    { dutch: "Ik rust even.", meaningZh: "我休息一下。", meaningEn: "I rest for a moment.", type: "minimal", phraseChunkUsed: "even rusten", scenarioTags: ["health", "daily"] },
    { dutch: "Ik moet vandaag rusten.", meaningZh: "我今天需要休息。", meaningEn: "I need to rest today.", type: "scenario", phraseChunkUsed: "vandaag rusten", scenarioTags: ["health"] },
  ],
  klikken: [
    { dutch: "Klik hier.", meaningZh: "点击这里。", meaningEn: "Click here.", type: "output", phraseChunkUsed: "klik hier", scenarioTags: ["classroom"] },
  ],
  doen: [
    { dutch: "Ik doe boodschappen.", meaningZh: "我去买菜/买日用品。", meaningEn: "I do grocery shopping.", type: "scenario", phraseChunkUsed: "boodschappen doen", scenarioTags: ["supermarket"] },
    { dutch: "Wat doe je?", meaningZh: "你在做什么？", meaningEn: "What are you doing?", type: "output", phraseChunkUsed: "wat doe je", scenarioTags: ["daily"] },
  ],
  zien: [
    { dutch: "Ik zie het station.", meaningZh: "我看见车站了。", meaningEn: "I see the station.", type: "minimal", phraseChunkUsed: "iets zien", scenarioTags: ["directions"] },
  ],
  komen: [
    { dutch: "Ik kom uit China.", meaningZh: "我来自中国。", meaningEn: "I come from China.", type: "minimal", phraseChunkUsed: "uit China komen", scenarioTags: ["identity"] },
    { dutch: "Wanneer kan ik komen?", meaningZh: "我什么时候可以来？", meaningEn: "When can I come?", type: "output", phraseChunkUsed: "kunnen komen", scenarioTags: ["appointment"] },
  ],
  gaan: [
    { dutch: "Ik ga naar school.", meaningZh: "我去学校。", meaningEn: "I go to school.", type: "minimal", phraseChunkUsed: "naar school gaan", scenarioTags: ["school"] },
    { dutch: "Waar ga je heen?", meaningZh: "你去哪里？", meaningEn: "Where are you going?", type: "output", phraseChunkUsed: "waarheen gaan", scenarioTags: ["daily"] },
  ],
  wonen: [
    { dutch: "Ik woon in Nederland.", meaningZh: "我住在荷兰。", meaningEn: "I live in the Netherlands.", type: "minimal", phraseChunkUsed: "wonen in", scenarioTags: ["identity"] },
    { dutch: "Waar woon je?", meaningZh: "你住在哪里？", meaningEn: "Where do you live?", type: "output", phraseChunkUsed: "waar woon je", scenarioTags: ["identity"] },
  ],
  leren: [
    { dutch: "Ik leer Nederlands.", meaningZh: "我学荷兰语。", meaningEn: "I learn Dutch.", type: "minimal", phraseChunkUsed: "Nederlands leren", scenarioTags: ["languages"] },
    { dutch: "Wij leren samen.", meaningZh: "我们一起学习。", meaningEn: "We learn together.", type: "scenario", phraseChunkUsed: "samen leren", scenarioTags: ["school"] },
  ],
  werken: [
    { dutch: "Ik werk vandaag.", meaningZh: "我今天工作。", meaningEn: "I work today.", type: "minimal", phraseChunkUsed: "vandaag werken", scenarioTags: ["work"] },
    { dutch: "Waar werkt u?", meaningZh: "您在哪里工作？", meaningEn: "Where do you work?", type: "output", phraseChunkUsed: "waar werkt u", scenarioTags: ["work"] },
  ],
  spreken: [
    { dutch: "Ik spreek Nederlands.", meaningZh: "我说荷兰语。", meaningEn: "I speak Dutch.", type: "collocation", phraseChunkUsed: "Nederlands spreken", scenarioTags: ["languages"] },
    { dutch: "Spreekt u Engels?", meaningZh: "您说英语吗？", meaningEn: "Do you speak English?", type: "output", phraseChunkUsed: "Engels spreken", scenarioTags: ["languages"] },
  ],
  heten: [
    { dutch: "Ik heet Lin.", meaningZh: "我叫 Lin。", meaningEn: "My name is Lin.", type: "minimal", phraseChunkUsed: "ik heet", scenarioTags: ["identity"] },
    { dutch: "Hoe heet je?", meaningZh: "你叫什么名字？", meaningEn: "What is your name?", type: "output", phraseChunkUsed: "hoe heet je", scenarioTags: ["identity"] },
  ],
  beginnen: [
    { dutch: "Ik begin nu.", meaningZh: "我现在开始。", meaningEn: "I start now.", type: "minimal", phraseChunkUsed: "nu beginnen", scenarioTags: ["classroom", "daily"] },
    { dutch: "Wanneer begint de les?", meaningZh: "课什么时候开始？", meaningEn: "When does the lesson start?", type: "output", phraseChunkUsed: "de les begint", scenarioTags: ["school", "time"] },
  ],
  lezen: [
    { dutch: "Ik lees de zin.", meaningZh: "我读这个句子。", meaningEn: "I read the sentence.", type: "minimal", phraseChunkUsed: "de zin lezen", scenarioTags: ["classroom"] },
    { dutch: "Kunt u de brief lezen?", meaningZh: "您能读这封信吗？", meaningEn: "Can you read the letter?", type: "scenario", phraseChunkUsed: "de brief lezen", scenarioTags: ["letter", "help"] },
  ],
  luisteren: [
    { dutch: "Ik luister naar de zin.", meaningZh: "我听这个句子。", meaningEn: "I listen to the sentence.", type: "minimal", phraseChunkUsed: "luisteren naar", scenarioTags: ["classroom"] },
    { dutch: "Luister goed.", meaningZh: "认真听。", meaningEn: "Listen carefully.", type: "output", phraseChunkUsed: "goed luisteren", scenarioTags: ["classroom"] },
  ],
  schrijven: [
    { dutch: "Ik schrijf mijn naam.", meaningZh: "我写我的名字。", meaningEn: "I write my name.", type: "minimal", phraseChunkUsed: "mijn naam schrijven", scenarioTags: ["identity", "form"] },
    { dutch: "Ik schrijf een e-mail.", meaningZh: "我写一封邮件。", meaningEn: "I write an email.", type: "scenario", phraseChunkUsed: "een e-mail schrijven", scenarioTags: ["email", "work"] },
  ],
  stoppen: [
    { dutch: "Ik stop hier.", meaningZh: "我在这里停下。", meaningEn: "I stop here.", type: "minimal", phraseChunkUsed: "hier stoppen", scenarioTags: ["daily", "transport"] },
    { dutch: "De trein stopt hier.", meaningZh: "火车在这里停。", meaningEn: "The train stops here.", type: "scenario", phraseChunkUsed: "de trein stopt", scenarioTags: ["transport"] },
  ],
  herhalen: [
    { dutch: "Kunt u dat herhalen?", meaningZh: "您能重复一遍吗？", meaningEn: "Can you repeat that?", type: "output", phraseChunkUsed: "dat herhalen", scenarioTags: ["help", "classroom"] },
  ],
  sluiten: [
    { dutch: "Ik sluit de deur.", meaningZh: "我关门。", meaningEn: "I close the door.", type: "minimal", phraseChunkUsed: "de deur sluiten", scenarioTags: ["home", "classroom"] },
  ],
  openen: [
    { dutch: "Ik open de deur.", meaningZh: "我开门。", meaningEn: "I open the door.", type: "minimal", phraseChunkUsed: "de deur openen", scenarioTags: ["home", "classroom"] },
  ],
  kijken: [
    { dutch: "Ik kijk naar het bord.", meaningZh: "我看黑板。", meaningEn: "I look at the board.", type: "minimal", phraseChunkUsed: "kijken naar", scenarioTags: ["classroom"] },
    { dutch: "Kijk naar de zin.", meaningZh: "看这个句子。", meaningEn: "Look at the sentence.", type: "output", phraseChunkUsed: "kijk naar", scenarioTags: ["classroom"] },
  ],
  zeggen: [
    { dutch: "Ik zeg mijn naam.", meaningZh: "我说我的名字。", meaningEn: "I say my name.", type: "minimal", phraseChunkUsed: "mijn naam zeggen", scenarioTags: ["identity"] },
    { dutch: "Kunt u dat nog een keer zeggen?", meaningZh: "您能再说一遍吗？", meaningEn: "Can you say that one more time?", type: "output", phraseChunkUsed: "nog een keer zeggen", scenarioTags: ["help"] },
  ],
  kopen: [
    { dutch: "Ik koop brood.", meaningZh: "我买面包。", meaningEn: "I buy bread.", type: "minimal", phraseChunkUsed: "brood kopen", scenarioTags: ["supermarket", "food"] },
  ],
  maken: [
    { dutch: "Ik maak een afspraak.", meaningZh: "我预约。", meaningEn: "I make an appointment.", type: "collocation", phraseChunkUsed: "een afspraak maken", scenarioTags: ["appointment"] },
  ],
  zoeken: [
    { dutch: "Ik zoek het station.", meaningZh: "我在找车站。", meaningEn: "I am looking for the station.", type: "scenario", phraseChunkUsed: "het station zoeken", scenarioTags: ["directions", "transport"] },
  ],
  veranderen: [
    { dutch: "Ik wil mijn adres veranderen.", meaningZh: "我想更改我的地址。", meaningEn: "I want to change my address.", type: "scenario", phraseChunkUsed: "mijn adres veranderen", scenarioTags: ["form", "gemeente"] },
  ],
  verzetten: [
    { dutch: "Ik wil mijn afspraak verzetten.", meaningZh: "我想改预约。", meaningEn: "I want to reschedule my appointment.", type: "scenario", phraseChunkUsed: "mijn afspraak verzetten", scenarioTags: ["appointment"] },
  ],
  afzeggen: [
    { dutch: "Ik moet mijn afspraak afzeggen.", meaningZh: "我必须取消预约。", meaningEn: "I have to cancel my appointment.", type: "scenario", phraseChunkUsed: "mijn afspraak afzeggen", scenarioTags: ["appointment"] },
  ],
  vragen: [
    { dutch: "Ik vraag om hulp.", meaningZh: "我请求帮助。", meaningEn: "I ask for help.", type: "output", phraseChunkUsed: "om hulp vragen", scenarioTags: ["help"] },
  ],
  wachten: [
    { dutch: "Ik wacht bij de balie.", meaningZh: "我在柜台旁边等。", meaningEn: "I wait at the desk.", type: "scenario", phraseChunkUsed: "bij de balie wachten", scenarioTags: ["gemeente", "appointment"] },
    { dutch: "Ik wacht tien minuten.", meaningZh: "我等十分钟。", meaningEn: "I wait ten minutes.", type: "collocation", phraseChunkUsed: "tien minuten wachten", scenarioTags: ["time"] },
  ],
  noteren: [
    { dutch: "Kunt u mijn nummer noteren?", meaningZh: "您能记下我的号码吗？", meaningEn: "Can you note down my number?", type: "output", phraseChunkUsed: "mijn nummer noteren", scenarioTags: ["phone-call"] },
  ],
  doorverbinden: [
    { dutch: "Kunt u mij doorverbinden?", meaningZh: "您能帮我转接吗？", meaningEn: "Can you connect me?", type: "output", phraseChunkUsed: "iemand doorverbinden", scenarioTags: ["phone-call"] },
  ],
  terugbellen: [
    { dutch: "Kunt u mij terugbellen?", meaningZh: "您能给我回电话吗？", meaningEn: "Can you call me back?", type: "output", phraseChunkUsed: "mij terugbellen", scenarioTags: ["phone-call"] },
  ],
  gebruiken: [
    { dutch: "Hoe moet ik dit medicijn gebruiken?", meaningZh: "我应该怎么使用这个药？", meaningEn: "How should I use this medicine?", type: "output", phraseChunkUsed: "medicijn gebruiken", scenarioTags: ["health"] },
  ],
  begrijpen: [
    { dutch: "Ik begrijp het.", meaningZh: "我明白了。", meaningEn: "I understand it.", type: "minimal", phraseChunkUsed: "Ik begrijp het", scenarioTags: ["classroom", "help"] },
    { dutch: "Ik begrijp de vraag niet.", meaningZh: "我不明白这个问题。", meaningEn: "I do not understand the question.", type: "output", phraseChunkUsed: "de vraag begrijpen", scenarioTags: ["classroom", "help"] },
    { dutch: "Begrijpt u mij?", meaningZh: "您明白我的意思吗？", meaningEn: "Do you understand me?", type: "scenario", phraseChunkUsed: "iemand begrijpen", scenarioTags: ["help"] },
  ],
  bellen: [
    { dutch: "Ik bel de huisarts.", meaningZh: "我打电话给家庭医生。", meaningEn: "I call the GP.", type: "scenario", phraseChunkUsed: "de huisarts bellen", scenarioTags: ["health", "appointment"] },
  ],
  invullen: [
    { dutch: "Ik moet het formulier invullen.", meaningZh: "我必须填写表格。", meaningEn: "I have to fill in the form.", type: "scenario", phraseChunkUsed: "het formulier invullen", scenarioTags: ["form", "gemeente"] },
  ],
  betalen: [
    { dutch: "Ik betaal de rekening.", meaningZh: "我付账单。", meaningEn: "I pay the bill.", type: "collocation", phraseChunkUsed: "de rekening betalen", scenarioTags: ["bill", "payment"] },
  ],
  lopen: [
    { dutch: "Ik loop naar huis.", meaningZh: "我走回家。", meaningEn: "I walk home.", type: "minimal", phraseChunkUsed: "naar huis lopen", scenarioTags: ["directions", "daily"] },
    { dutch: "Loop rechtdoor.", meaningZh: "一直往前走。", meaningEn: "Walk straight ahead.", type: "output", phraseChunkUsed: "rechtdoor lopen", scenarioTags: ["directions"] },
    { dutch: "Wij lopen naar het station.", meaningZh: "我们走去车站。", meaningEn: "We walk to the station.", type: "scenario", phraseChunkUsed: "naar het station lopen", scenarioTags: ["transport", "directions"] },
  ],
  eten: [
    { dutch: "Ik eet brood.", meaningZh: "我吃面包。", meaningEn: "I eat bread.", type: "minimal", phraseChunkUsed: "brood eten", scenarioTags: ["food"] },
    { dutch: "Eet smakelijk.", meaningZh: "祝你好胃口/慢慢吃。", meaningEn: "Enjoy your meal.", type: "output", phraseChunkUsed: "eet smakelijk", scenarioTags: ["food"] },
    { dutch: "Wij eten om zes uur.", meaningZh: "我们六点吃饭。", meaningEn: "We eat at six o'clock.", type: "scenario", phraseChunkUsed: "om zes uur eten", scenarioTags: ["food", "time"] },
  ],
  drinken: [
    { dutch: "Ik drink water.", meaningZh: "我喝水。", meaningEn: "I drink water.", type: "minimal", phraseChunkUsed: "water drinken", scenarioTags: ["food"] },
    { dutch: "Wij drinken koffie.", meaningZh: "我们喝咖啡。", meaningEn: "We drink coffee.", type: "scenario", phraseChunkUsed: "koffie drinken", scenarioTags: ["food"] },
  ],
  koken: [
    { dutch: "Ik kook rijst.", meaningZh: "我煮米饭。", meaningEn: "I cook rice.", type: "minimal", phraseChunkUsed: "rijst koken", scenarioTags: ["food", "home"] },
    { dutch: "Wij koken thuis.", meaningZh: "我们在家做饭。", meaningEn: "We cook at home.", type: "scenario", phraseChunkUsed: "thuis koken", scenarioTags: ["food", "home"] },
  ],
  slapen: [
    { dutch: "Ik slaap goed.", meaningZh: "我睡得好。", meaningEn: "I sleep well.", type: "minimal", phraseChunkUsed: "goed slapen", scenarioTags: ["health", "home"] },
    { dutch: "Wij slapen om tien uur.", meaningZh: "我们十点睡觉。", meaningEn: "We sleep at ten o'clock.", type: "scenario", phraseChunkUsed: "om tien uur slapen", scenarioTags: ["time", "home"] },
  ],
  wassen: [
    { dutch: "Ik was mijn handen.", meaningZh: "我洗手。", meaningEn: "I wash my hands.", type: "minimal", phraseChunkUsed: "mijn handen wassen", scenarioTags: ["health", "home"] },
    { dutch: "Was uw handen.", meaningZh: "请洗手。", meaningEn: "Wash your hands.", type: "output", phraseChunkUsed: "handen wassen", scenarioTags: ["health"] },
  ],
  dragen: [
    { dutch: "Ik draag een jas.", meaningZh: "我穿一件外套。", meaningEn: "I wear a coat.", type: "minimal", phraseChunkUsed: "een jas dragen", scenarioTags: ["clothes"] },
    { dutch: "Hij draagt schoenen.", meaningZh: "他穿着鞋。", meaningEn: "He wears shoes.", type: "scenario", phraseChunkUsed: "schoenen dragen", scenarioTags: ["clothes"] },
  ],
  pakken: [
    { dutch: "Ik pak mijn telefoon.", meaningZh: "我拿手机。", meaningEn: "I take my phone.", type: "minimal", phraseChunkUsed: "mijn telefoon pakken", scenarioTags: ["daily"] },
    { dutch: "Pak uw paspoort.", meaningZh: "请拿您的护照。", meaningEn: "Take your passport.", type: "output", phraseChunkUsed: "paspoort pakken", scenarioTags: ["form", "travel"] },
  ],
  nemen: [
    { dutch: "Ik neem de trein.", meaningZh: "我坐火车。", meaningEn: "I take the train.", type: "scenario", phraseChunkUsed: "de trein nemen", scenarioTags: ["transport"] },
    { dutch: "Neem plaats.", meaningZh: "请坐。", meaningEn: "Take a seat.", type: "output", phraseChunkUsed: "plaats nemen", scenarioTags: ["appointment"] },
  ],
  geven: [
    { dutch: "Ik geef mijn naam.", meaningZh: "我说/给出我的名字。", meaningEn: "I give my name.", type: "scenario", phraseChunkUsed: "mijn naam geven", scenarioTags: ["form", "identity"] },
    { dutch: "Geef antwoord.", meaningZh: "请回答。", meaningEn: "Give an answer.", type: "output", phraseChunkUsed: "antwoord geven", scenarioTags: ["classroom"] },
  ],
  zetten: [
    { dutch: "Ik zet de tas hier.", meaningZh: "我把包放在这里。", meaningEn: "I put the bag here.", type: "scenario", phraseChunkUsed: "de tas zetten", scenarioTags: ["daily"] },
    { dutch: "Zet de stoel daar.", meaningZh: "把椅子放在那里。", meaningEn: "Put the chair there.", type: "output", phraseChunkUsed: "de stoel zetten", scenarioTags: ["home", "classroom"] },
  ],
  leggen: [
    { dutch: "Ik leg het boek op tafel.", meaningZh: "我把书放在桌上。", meaningEn: "I put the book on the table.", type: "scenario", phraseChunkUsed: "het boek op tafel leggen", scenarioTags: ["home", "classroom"] },
    { dutch: "Leg de brief hier.", meaningZh: "把信放在这里。", meaningEn: "Put the letter here.", type: "output", phraseChunkUsed: "de brief leggen", scenarioTags: ["form"] },
  ],
  zitten: [
    { dutch: "Ik zit op de stoel.", meaningZh: "我坐在椅子上。", meaningEn: "I sit on the chair.", type: "minimal", phraseChunkUsed: "op de stoel zitten", scenarioTags: ["home", "classroom"] },
    { dutch: "Zit u hier?", meaningZh: "您坐这里吗？", meaningEn: "Do you sit here?", type: "output", phraseChunkUsed: "hier zitten", scenarioTags: ["appointment"] },
  ],
  staan: [
    { dutch: "Ik sta in de rij.", meaningZh: "我在排队。", meaningEn: "I stand in line.", type: "scenario", phraseChunkUsed: "in de rij staan", scenarioTags: ["daily"] },
    { dutch: "Sta hier.", meaningZh: "站在这里。", meaningEn: "Stand here.", type: "output", phraseChunkUsed: "hier staan", scenarioTags: ["classroom"] },
  ],
  regelen: [
    { dutch: "Ik regel een afspraak.", meaningZh: "我安排一个预约。", meaningEn: "I arrange an appointment.", type: "scenario", phraseChunkUsed: "een afspraak regelen", scenarioTags: ["appointment"] },
    { dutch: "Kunt u dat regelen?", meaningZh: "您能安排这个吗？", meaningEn: "Can you arrange that?", type: "output", phraseChunkUsed: "iets regelen", scenarioTags: ["work", "appointment"] },
  ],
  melden: [
    { dutch: "Ik meld een probleem.", meaningZh: "我报告一个问题。", meaningEn: "I report a problem.", type: "scenario", phraseChunkUsed: "een probleem melden", scenarioTags: ["gemeente", "work"] },
    { dutch: "Meld u bij de balie.", meaningZh: "请到柜台报到。", meaningEn: "Check in at the desk.", type: "output", phraseChunkUsed: "zich melden bij de balie", scenarioTags: ["appointment"] },
  ],
  controleren: [
    { dutch: "Ik controleer het adres.", meaningZh: "我核对地址。", meaningEn: "I check the address.", type: "scenario", phraseChunkUsed: "het adres controleren", scenarioTags: ["form", "gemeente"] },
    { dutch: "Controleer uw gegevens.", meaningZh: "请核对您的信息。", meaningEn: "Check your details.", type: "output", phraseChunkUsed: "gegevens controleren", scenarioTags: ["form"] },
  ],
  aanpassen: [
    { dutch: "Ik pas mijn gegevens aan.", meaningZh: "我修改我的信息。", meaningEn: "I update my details.", type: "scenario", phraseChunkUsed: "gegevens aanpassen", scenarioTags: ["form", "gemeente"] },
    { dutch: "Kunt u de afspraak aanpassen?", meaningZh: "您能调整这个预约吗？", meaningEn: "Can you adjust the appointment?", type: "output", phraseChunkUsed: "een afspraak aanpassen", scenarioTags: ["appointment"] },
  ],
  bespreken: [
    { dutch: "Wij bespreken de afspraak.", meaningZh: "我们讨论这个预约。", meaningEn: "We discuss the appointment.", type: "scenario", phraseChunkUsed: "de afspraak bespreken", scenarioTags: ["appointment", "work"] },
    { dutch: "Ik wil dit bespreken.", meaningZh: "我想讨论这个。", meaningEn: "I want to discuss this.", type: "output", phraseChunkUsed: "iets bespreken", scenarioTags: ["work"] },
  ],
  uitleggen: [
    { dutch: "Kunt u dat uitleggen?", meaningZh: "您能解释一下吗？", meaningEn: "Can you explain that?", type: "output", phraseChunkUsed: "iets uitleggen", scenarioTags: ["help", "classroom"] },
    { dutch: "Ik leg de regel uit.", meaningZh: "我解释这条规则。", meaningEn: "I explain the rule.", type: "scenario", phraseChunkUsed: "de regel uitleggen", scenarioTags: ["classroom"] },
  ],
  verbeteren: [
    { dutch: "Ik verbeter de zin.", meaningZh: "我改正这个句子。", meaningEn: "I correct the sentence.", type: "scenario", phraseChunkUsed: "de zin verbeteren", scenarioTags: ["classroom"] },
    { dutch: "Wij verbeteren de fout.", meaningZh: "我们改正错误。", meaningEn: "We correct the mistake.", type: "scenario", phraseChunkUsed: "de fout verbeteren", scenarioTags: ["classroom"] },
  ],
  ontvangen: [
    { dutch: "Ik ontvang een brief.", meaningZh: "我收到一封信。", meaningEn: "I receive a letter.", type: "scenario", phraseChunkUsed: "een brief ontvangen", scenarioTags: ["letter", "gemeente"] },
    { dutch: "Heeft u de e-mail ontvangen?", meaningZh: "您收到邮件了吗？", meaningEn: "Did you receive the email?", type: "output", phraseChunkUsed: "een e-mail ontvangen", scenarioTags: ["email"] },
  ],
  verzenden: [
    { dutch: "Ik verzend het formulier.", meaningZh: "我发送表格。", meaningEn: "I send the form.", type: "scenario", phraseChunkUsed: "het formulier verzenden", scenarioTags: ["form"] },
    { dutch: "Verzend de aanvraag.", meaningZh: "发送申请。", meaningEn: "Send the application.", type: "output", phraseChunkUsed: "de aanvraag verzenden", scenarioTags: ["form"] },
  ],
  kiezen: [
    { dutch: "Ik kies een datum.", meaningZh: "我选择一个日期。", meaningEn: "I choose a date.", type: "scenario", phraseChunkUsed: "een datum kiezen", scenarioTags: ["appointment"] },
    { dutch: "Kies een antwoord.", meaningZh: "选择一个答案。", meaningEn: "Choose an answer.", type: "output", phraseChunkUsed: "een antwoord kiezen", scenarioTags: ["classroom"] },
  ],
  beslissen: [
    { dutch: "Ik beslis vandaag.", meaningZh: "我今天决定。", meaningEn: "I decide today.", type: "minimal", phraseChunkUsed: "vandaag beslissen", scenarioTags: ["work"] },
    { dutch: "Wij beslissen samen.", meaningZh: "我们一起决定。", meaningEn: "We decide together.", type: "scenario", phraseChunkUsed: "samen beslissen", scenarioTags: ["work"] },
  ],
  aanbieden: [
    { dutch: "Ik bied hulp aan.", meaningZh: "我提供帮助。", meaningEn: "I offer help.", type: "scenario", phraseChunkUsed: "hulp aanbieden", scenarioTags: ["help", "work"] },
    { dutch: "De school biedt een cursus aan.", meaningZh: "学校提供一门课程。", meaningEn: "The school offers a course.", type: "scenario", phraseChunkUsed: "een cursus aanbieden", scenarioTags: ["school"] },
  ],
  accepteren: [
    { dutch: "Ik accepteer de afspraak.", meaningZh: "我接受这个预约。", meaningEn: "I accept the appointment.", type: "scenario", phraseChunkUsed: "de afspraak accepteren", scenarioTags: ["appointment"] },
    { dutch: "Accepteert u contant geld?", meaningZh: "你们收现金吗？", meaningEn: "Do you accept cash?", type: "output", phraseChunkUsed: "contant geld accepteren", scenarioTags: ["payment"] },
  ],
  weigeren: [
    { dutch: "Ik weiger de hulp niet.", meaningZh: "我不拒绝帮助。", meaningEn: "I do not refuse the help.", type: "scenario", phraseChunkUsed: "hulp weigeren", scenarioTags: ["help"] },
    { dutch: "Hij weigert te tekenen.", meaningZh: "他拒绝签字。", meaningEn: "He refuses to sign.", type: "scenario", phraseChunkUsed: "weigeren te tekenen", scenarioTags: ["form"] },
  ],
  bewijzen: [
    { dutch: "Ik bewijs mijn identiteit.", meaningZh: "我证明我的身份。", meaningEn: "I prove my identity.", type: "scenario", phraseChunkUsed: "identiteit bewijzen", scenarioTags: ["form", "gemeente"] },
    { dutch: "Kunt u dat bewijzen?", meaningZh: "您能证明那个吗？", meaningEn: "Can you prove that?", type: "output", phraseChunkUsed: "iets bewijzen", scenarioTags: ["form"] },
  ],
  ontdekken: [
    { dutch: "Ik ontdek een fout.", meaningZh: "我发现一个错误。", meaningEn: "I discover a mistake.", type: "scenario", phraseChunkUsed: "een fout ontdekken", scenarioTags: ["form", "classroom"] },
    { dutch: "Wij ontdekken de stad.", meaningZh: "我们探索这座城市。", meaningEn: "We discover the city.", type: "scenario", phraseChunkUsed: "de stad ontdekken", scenarioTags: ["directions"] },
  ],
};

const adjectiveExamples: Record<string, TemplateExample[]> = {
  goed: [
    { dutch: "Het gaat goed.", meaningZh: "我很好。", meaningEn: "It is going well.", type: "minimal", phraseChunkUsed: "het gaat goed", scenarioTags: ["greeting"] },
    { dutch: "Dat is goed.", meaningZh: "那很好。", meaningEn: "That is good.", type: "output", phraseChunkUsed: "dat is goed", scenarioTags: ["daily"] },
  ],
  moeilijk: [{ dutch: "Nederlands is moeilijk.", meaningZh: "荷兰语很难。", meaningEn: "Dutch is difficult.", type: "minimal", phraseChunkUsed: "is moeilijk", scenarioTags: ["school"] }],
  makkelijk: [{ dutch: "Deze oefening is makkelijk.", meaningZh: "这个练习很简单。", meaningEn: "This exercise is easy.", type: "minimal", phraseChunkUsed: "is makkelijk", scenarioTags: ["school"] }],
  ziek: [{ dutch: "Ik ben ziek.", meaningZh: "我病了。", meaningEn: "I am sick.", type: "minimal", phraseChunkUsed: "ziek zijn", scenarioTags: ["health", "sick-leave"] }],
  beter: [{ dutch: "Het gaat beter.", meaningZh: "好多了。", meaningEn: "It is getting better.", type: "minimal", phraseChunkUsed: "het gaat beter", scenarioTags: ["health"] }],
  verkouden: [{ dutch: "Ik ben verkouden.", meaningZh: "我感冒了。", meaningEn: "I have a cold.", type: "minimal", phraseChunkUsed: "verkouden zijn", scenarioTags: ["health"] }],
  duizelig: [{ dutch: "Ik ben duizelig.", meaningZh: "我头晕。", meaningEn: "I am dizzy.", type: "minimal", phraseChunkUsed: "duizelig zijn", scenarioTags: ["health"] }],
  misselijk: [{ dutch: "Ik ben misselijk.", meaningZh: "我恶心想吐。", meaningEn: "I feel nauseous.", type: "minimal", phraseChunkUsed: "misselijk zijn", scenarioTags: ["health"] }],
  moe: [{ dutch: "Ik ben moe.", meaningZh: "我累了。", meaningEn: "I am tired.", type: "minimal", phraseChunkUsed: "moe zijn", scenarioTags: ["health", "daily"] }],
  benauwd: [{ dutch: "Ik ben benauwd.", meaningZh: "我胸闷/呼吸不舒服。", meaningEn: "I am short of breath.", type: "scenario", phraseChunkUsed: "benauwd zijn", scenarioTags: ["health"] }],
  duur: [
    { dutch: "Dat is duur.", meaningZh: "那个很贵。", meaningEn: "That is expensive.", type: "minimal", phraseChunkUsed: "is duur", scenarioTags: ["payment", "supermarket"] },
    { dutch: "De huur is duur.", meaningZh: "房租很贵。", meaningEn: "The rent is expensive.", type: "scenario", phraseChunkUsed: "de huur is duur", scenarioTags: ["housing"] },
  ],
  goedkoop: [{ dutch: "Dat is goedkoop.", meaningZh: "那个很便宜。", meaningEn: "That is cheap.", type: "minimal", phraseChunkUsed: "is goedkoop", scenarioTags: ["payment", "supermarket"] }],
  koud: [{ dutch: "Het is koud.", meaningZh: "天气很冷。", meaningEn: "It is cold.", type: "minimal", phraseChunkUsed: "het is koud", scenarioTags: ["weather"] }],
  warm: [{ dutch: "Het is warm.", meaningZh: "天气很暖/热。", meaningEn: "It is warm.", type: "minimal", phraseChunkUsed: "het is warm", scenarioTags: ["weather"] }],
  nat: [{ dutch: "Mijn jas is nat.", meaningZh: "我的外套湿了。", meaningEn: "My coat is wet.", type: "scenario", phraseChunkUsed: "nat zijn", scenarioTags: ["weather", "clothes"] }],
  droog: [{ dutch: "Mijn jas is droog.", meaningZh: "我的外套干了。", meaningEn: "My coat is dry.", type: "scenario", phraseChunkUsed: "droog zijn", scenarioTags: ["weather", "clothes"] }],
  mooi: [
    { dutch: "Het weer is mooi.", meaningZh: "天气很好。", meaningEn: "The weather is nice.", type: "scenario", phraseChunkUsed: "mooi weer", scenarioTags: ["weather"] },
    { dutch: "Dat is mooi.", meaningZh: "那很好看。", meaningEn: "That is nice.", type: "minimal", phraseChunkUsed: "dat is mooi", scenarioTags: ["daily"] },
  ],
  lekker: [{ dutch: "De soep is lekker.", meaningZh: "这汤很好喝。", meaningEn: "The soup is tasty.", type: "scenario", phraseChunkUsed: "lekker zijn", scenarioTags: ["food"] }],
  leuk: [{ dutch: "Dat is leuk.", meaningZh: "那个很有趣/很好玩。", meaningEn: "That is nice/fun.", type: "minimal", phraseChunkUsed: "is leuk", scenarioTags: ["preferences"] }],
  blij: [{ dutch: "Ik ben blij.", meaningZh: "我很高兴。", meaningEn: "I am happy.", type: "minimal", phraseChunkUsed: "blij zijn", scenarioTags: ["identity"] }],
  verdrietig: [{ dutch: "Ik ben verdrietig.", meaningZh: "我很难过。", meaningEn: "I am sad.", type: "minimal", phraseChunkUsed: "verdrietig zijn", scenarioTags: ["daily"] }],
  boos: [{ dutch: "Ik ben boos.", meaningZh: "我生气了。", meaningEn: "I am angry.", type: "minimal", phraseChunkUsed: "boos zijn", scenarioTags: ["daily"] }],
  bang: [{ dutch: "Ik ben bang.", meaningZh: "我害怕。", meaningEn: "I am afraid.", type: "minimal", phraseChunkUsed: "bang zijn", scenarioTags: ["daily"] }],
  rustig: [{ dutch: "Het is rustig.", meaningZh: "这里很安静。", meaningEn: "It is quiet.", type: "scenario", phraseChunkUsed: "rustig zijn", scenarioTags: ["daily"] }],
  druk: [{ dutch: "Het is druk.", meaningZh: "这里很忙/很拥挤。", meaningEn: "It is busy.", type: "scenario", phraseChunkUsed: "druk zijn", scenarioTags: ["daily"] }],
  schoon: [{ dutch: "De kamer is schoon.", meaningZh: "房间很干净。", meaningEn: "The room is clean.", type: "scenario", phraseChunkUsed: "schoon zijn", scenarioTags: ["home"] }],
  vies: [{ dutch: "De tafel is vies.", meaningZh: "桌子很脏。", meaningEn: "The table is dirty.", type: "scenario", phraseChunkUsed: "vies zijn", scenarioTags: ["home"] }],
  gezond: [{ dutch: "Ik ben gezond.", meaningZh: "我很健康。", meaningEn: "I am healthy.", type: "minimal", phraseChunkUsed: "gezond zijn", scenarioTags: ["health"] }],
  ongezond: [{ dutch: "Dat eten is ongezond.", meaningZh: "那个食物不健康。", meaningEn: "That food is unhealthy.", type: "scenario", phraseChunkUsed: "ongezond eten", scenarioTags: ["health", "food"] }],
  sterk: [{ dutch: "Ik voel me sterk.", meaningZh: "我感觉很有力。", meaningEn: "I feel strong.", type: "scenario", phraseChunkUsed: "sterk voelen", scenarioTags: ["health"] }],
  zwak: [{ dutch: "Ik voel me zwak.", meaningZh: "我感觉虚弱。", meaningEn: "I feel weak.", type: "scenario", phraseChunkUsed: "zwak voelen", scenarioTags: ["health"] }],
  vol: [{ dutch: "De tas is vol.", meaningZh: "包满了。", meaningEn: "The bag is full.", type: "scenario", phraseChunkUsed: "vol zijn", scenarioTags: ["daily"] }],
  leeg: [{ dutch: "De fles is leeg.", meaningZh: "瓶子空了。", meaningEn: "The bottle is empty.", type: "scenario", phraseChunkUsed: "leeg zijn", scenarioTags: ["supermarket"] }],
  veilig: [{ dutch: "Deze plek is veilig.", meaningZh: "这个地方安全。", meaningEn: "This place is safe.", type: "scenario", phraseChunkUsed: "veilig zijn", scenarioTags: ["daily"] }],
  gevaarlijk: [{ dutch: "Dat is gevaarlijk.", meaningZh: "那很危险。", meaningEn: "That is dangerous.", type: "scenario", phraseChunkUsed: "gevaarlijk zijn", scenarioTags: ["daily"] }],
  nodig: [{ dutch: "Ik heb hulp nodig.", meaningZh: "我需要帮助。", meaningEn: "I need help.", type: "output", phraseChunkUsed: "hulp nodig hebben", scenarioTags: ["help"] }],
  genoeg: [{ dutch: "Dat is genoeg.", meaningZh: "那够了。", meaningEn: "That is enough.", type: "output", phraseChunkUsed: "genoeg zijn", scenarioTags: ["daily"] }],
  alleenstaand: [{ dutch: "Ik ben alleenstaand.", meaningZh: "我是单身。", meaningEn: "I am single.", type: "scenario", phraseChunkUsed: "alleenstaand zijn", scenarioTags: ["identity", "form"] }],
  getrouwd: [{ dutch: "Ik ben getrouwd.", meaningZh: "我已婚。", meaningEn: "I am married.", type: "scenario", phraseChunkUsed: "getrouwd zijn", scenarioTags: ["identity", "form"] }],
  gescheiden: [{ dutch: "Ik ben gescheiden.", meaningZh: "我离婚了。", meaningEn: "I am divorced.", type: "scenario", phraseChunkUsed: "gescheiden zijn", scenarioTags: ["identity", "form"] }],
  beschikbaar: [{ dutch: "Ik ben morgen beschikbaar.", meaningZh: "我明天有空。", meaningEn: "I am available tomorrow.", type: "scenario", phraseChunkUsed: "beschikbaar zijn", scenarioTags: ["appointment"] }],
  formeel: [{ dutch: "Deze e-mail is formeel.", meaningZh: "这封邮件是正式的。", meaningEn: "This email is formal.", type: "scenario", phraseChunkUsed: "een formele e-mail", scenarioTags: ["email", "writing"] }],
  vriendelijk: [{ dutch: "De medewerker is vriendelijk.", meaningZh: "工作人员很友好。", meaningEn: "The employee is friendly.", type: "scenario", phraseChunkUsed: "vriendelijk zijn", scenarioTags: ["work", "service"] }],
  eens: [{ dutch: "Ik ben het eens met dit voorstel.", meaningZh: "我同意这个提议。", meaningEn: "I agree with this proposal.", type: "output", phraseChunkUsed: "het eens zijn met", scenarioTags: ["opinion"] }],
  oneens: [{ dutch: "Ik ben het oneens met dit besluit.", meaningZh: "我不同意这个决定。", meaningEn: "I disagree with this decision.", type: "output", phraseChunkUsed: "het oneens zijn met", scenarioTags: ["opinion"] }],
  duidelijk: [{ dutch: "Dat is duidelijk.", meaningZh: "这很清楚。", meaningEn: "That is clear.", type: "output", phraseChunkUsed: "duidelijk zijn", scenarioTags: ["help"] }],
  onduidelijk: [{ dutch: "Dat is onduidelijk.", meaningZh: "这不清楚。", meaningEn: "That is unclear.", type: "output", phraseChunkUsed: "onduidelijk zijn", scenarioTags: ["help"] }],
  mogelijk: [{ dutch: "Is dat mogelijk?", meaningZh: "那可以吗？", meaningEn: "Is that possible?", type: "output", phraseChunkUsed: "mogelijk zijn", scenarioTags: ["appointment"] }],
  belangrijk: [{ dutch: "Dat is belangrijk.", meaningZh: "这很重要。", meaningEn: "That is important.", type: "scenario", phraseChunkUsed: "belangrijk zijn", scenarioTags: ["form"] }],
  dringend: [{ dutch: "Het is dringend.", meaningZh: "这很紧急。", meaningEn: "It is urgent.", type: "scenario", phraseChunkUsed: "dringend zijn", scenarioTags: ["health", "help"] }],
  verkeerd: [{ dutch: "Dat is verkeerd.", meaningZh: "那是错的。", meaningEn: "That is wrong.", type: "scenario", phraseChunkUsed: "verkeerd zijn", scenarioTags: ["help"] }],
  wakker: [{ dutch: "Ik ben wakker.", meaningZh: "我醒着。", meaningEn: "I am awake.", type: "minimal", phraseChunkUsed: "wakker zijn", scenarioTags: ["routine"] }],
  slaperig: [{ dutch: "Ik ben slaperig.", meaningZh: "我困了。", meaningEn: "I am sleepy.", type: "minimal", phraseChunkUsed: "slaperig zijn", scenarioTags: ["routine"] }],
  vrij: [{ dutch: "Ik ben morgen vrij.", meaningZh: "我明天有空/休息。", meaningEn: "I am free tomorrow.", type: "scenario", phraseChunkUsed: "vrij zijn", scenarioTags: ["work", "appointment"] }],
  nerveus: [{ dutch: "Ik ben nerveus.", meaningZh: "我很紧张。", meaningEn: "I am nervous.", type: "scenario", phraseChunkUsed: "nerveus zijn", scenarioTags: ["daily"] }],
  tevreden: [{ dutch: "Ik ben tevreden.", meaningZh: "我很满意。", meaningEn: "I am satisfied.", type: "scenario", phraseChunkUsed: "tevreden zijn", scenarioTags: ["complaint"] }],
  ontevreden: [{ dutch: "Ik ben ontevreden.", meaningZh: "我不满意。", meaningEn: "I am dissatisfied.", type: "scenario", phraseChunkUsed: "ontevreden zijn", scenarioTags: ["complaint"] }],
  verrast: [{ dutch: "Ik ben verrast.", meaningZh: "我很惊讶。", meaningEn: "I am surprised.", type: "scenario", phraseChunkUsed: "verrast zijn", scenarioTags: ["daily"] }],
  verlegen: [{ dutch: "Ik ben verlegen.", meaningZh: "我害羞。", meaningEn: "I am shy.", type: "scenario", phraseChunkUsed: "verlegen zijn", scenarioTags: ["daily"] }],
  trots: [{ dutch: "Ik ben trots.", meaningZh: "我很自豪。", meaningEn: "I am proud.", type: "scenario", phraseChunkUsed: "trots zijn", scenarioTags: ["daily"] }],
  langzaam: [
    { dutch: "Spreekt u langzaam?", meaningZh: "您可以说慢一点吗？", meaningEn: "Can you speak slowly?", type: "output", phraseChunkUsed: "langzaam spreken", scenarioTags: ["help"] },
    { dutch: "Kunt u langzaam praten?", meaningZh: "您能慢一点说吗？", meaningEn: "Can you speak slowly?", type: "output", phraseChunkUsed: "langzaam praten", scenarioTags: ["help"] },
  ],
  klein: [{ dutch: "Dit is een kleine tas.", meaningZh: "这是一个小包。", meaningEn: "This is a small bag.", type: "minimal", phraseChunkUsed: "een kleine tas", scenarioTags: ["daily"] }],
  groot: [{ dutch: "Dit is een grote tas.", meaningZh: "这是一个大包。", meaningEn: "This is a big bag.", type: "minimal", phraseChunkUsed: "een grote tas", scenarioTags: ["daily"] }],
  hoog: [{ dutch: "De prijs is hoog.", meaningZh: "价格很高。", meaningEn: "The price is high.", type: "scenario", phraseChunkUsed: "hoog zijn", scenarioTags: ["payment"] }],
  laag: [{ dutch: "De prijs is laag.", meaningZh: "价格很低。", meaningEn: "The price is low.", type: "scenario", phraseChunkUsed: "laag zijn", scenarioTags: ["payment"] }],
  lang: [{ dutch: "De straat is lang.", meaningZh: "这条街很长。", meaningEn: "The street is long.", type: "scenario", phraseChunkUsed: "lang zijn", scenarioTags: ["directions"] }],
  kort: [{ dutch: "De pauze is kort.", meaningZh: "休息很短。", meaningEn: "The break is short.", type: "scenario", phraseChunkUsed: "kort zijn", scenarioTags: ["school", "work"] }],
  licht: [{ dutch: "De tas is licht.", meaningZh: "这个包很轻。", meaningEn: "The bag is light.", type: "scenario", phraseChunkUsed: "licht zijn", scenarioTags: ["daily"] }],
  zwaar: [{ dutch: "De tas is zwaar.", meaningZh: "这个包很重。", meaningEn: "The bag is heavy.", type: "scenario", phraseChunkUsed: "zwaar zijn", scenarioTags: ["daily"] }],
  snel: [{ dutch: "Kom snel.", meaningZh: "快点来。", meaningEn: "Come quickly.", type: "output", phraseChunkUsed: "snel komen", scenarioTags: ["daily"] }],
  groen: [{ dutch: "Mijn jas is groen.", meaningZh: "我的外套是绿色的。", meaningEn: "My coat is green.", type: "minimal", phraseChunkUsed: "groen zijn", scenarioTags: ["clothes"] }],
  geel: [{ dutch: "Mijn jas is geel.", meaningZh: "我的外套是黄色的。", meaningEn: "My coat is yellow.", type: "minimal", phraseChunkUsed: "geel zijn", scenarioTags: ["clothes"] }],
  zwart: [{ dutch: "Mijn jas is zwart.", meaningZh: "我的外套是黑色的。", meaningEn: "My coat is black.", type: "minimal", phraseChunkUsed: "zwart zijn", scenarioTags: ["clothes"] }],
  wit: [{ dutch: "Mijn jas is wit.", meaningZh: "我的外套是白色的。", meaningEn: "My coat is white.", type: "minimal", phraseChunkUsed: "wit zijn", scenarioTags: ["clothes"] }],
  grijs: [{ dutch: "Mijn jas is grijs.", meaningZh: "我的外套是灰色的。", meaningEn: "My coat is grey.", type: "minimal", phraseChunkUsed: "grijs zijn", scenarioTags: ["clothes"] }],
  bruin: [{ dutch: "Mijn jas is bruin.", meaningZh: "我的外套是棕色的。", meaningEn: "My coat is brown.", type: "minimal", phraseChunkUsed: "bruin zijn", scenarioTags: ["clothes"] }],
  klaar: [{ dutch: "Ik ben klaar.", meaningZh: "我准备好了/我完成了。", meaningEn: "I am ready/done.", type: "minimal", phraseChunkUsed: "klaar zijn", scenarioTags: ["classroom"] }],
  juist: [{ dutch: "Dat is juist.", meaningZh: "那是正确的。", meaningEn: "That is correct.", type: "minimal", phraseChunkUsed: "is juist", scenarioTags: ["classroom"] }],
  fout: [{ dutch: "Dat is fout.", meaningZh: "那是错的。", meaningEn: "That is wrong.", type: "minimal", phraseChunkUsed: "is fout", scenarioTags: ["classroom"] }],
  open: [{ dutch: "De winkel is open.", meaningZh: "商店开着。", meaningEn: "The shop is open.", type: "scenario", phraseChunkUsed: "is open", scenarioTags: ["supermarket"] }],
  dicht: [{ dutch: "De deur is dicht.", meaningZh: "门关着。", meaningEn: "The door is closed.", type: "minimal", phraseChunkUsed: "is dicht", scenarioTags: ["home"] }],
};

const nounExamples: Record<string, TemplateExample[]> = {
  naam: [
    { dutch: "Mijn naam is Lin.", meaningZh: "我的名字是 Lin。", meaningEn: "My name is Lin.", type: "minimal", phraseChunkUsed: "mijn naam", scenarioTags: ["identity"] },
    { dutch: "Wat is jouw naam?", meaningZh: "你的名字是什么？", meaningEn: "What is your name?", type: "output", phraseChunkUsed: "jouw naam", scenarioTags: ["identity"] },
  ],
  taal: [
    { dutch: "Welke taal spreek je?", meaningZh: "你说哪种语言？", meaningEn: "Which language do you speak?", type: "output", phraseChunkUsed: "een taal spreken", scenarioTags: ["languages"] },
    { dutch: "Ik leer een taal.", meaningZh: "我学一门语言。", meaningEn: "I learn a language.", type: "minimal", phraseChunkUsed: "een taal leren", scenarioTags: ["languages"] },
  ],
  woord: [
    { dutch: "Wat betekent dit woord?", meaningZh: "这个词是什么意思？", meaningEn: "What does this word mean?", type: "output", phraseChunkUsed: "dit woord", scenarioTags: ["classroom"] },
  ],
  zin: [
    { dutch: "Lees de zin.", meaningZh: "读这个句子。", meaningEn: "Read the sentence.", type: "output", phraseChunkUsed: "de zin lezen", scenarioTags: ["classroom"] },
  ],
  boek: [
    { dutch: "Dit is mijn boek.", meaningZh: "这是我的书。", meaningEn: "This is my book.", type: "minimal", phraseChunkUsed: "mijn boek", scenarioTags: ["classroom"] },
  ],
  vakantie: [
    { dutch: "Ik heb vakantie.", meaningZh: "我放假。", meaningEn: "I am on holiday.", type: "minimal", phraseChunkUsed: "vakantie hebben", scenarioTags: ["leisure", "time"] },
    { dutch: "Wij gaan op vakantie.", meaningZh: "我们去度假。", meaningEn: "We are going on holiday.", type: "scenario", phraseChunkUsed: "op vakantie gaan", scenarioTags: ["leisure", "travel"] },
    { dutch: "De vakantie begint maandag.", meaningZh: "假期周一开始。", meaningEn: "The holiday starts on Monday.", type: "scenario", phraseChunkUsed: "de vakantie begint", scenarioTags: ["leisure", "time"] },
  ],
  dokter: [
    { dutch: "Ik ga naar de dokter.", meaningZh: "我去看医生。", meaningEn: "I go to the doctor.", type: "scenario", phraseChunkUsed: "naar de dokter gaan", scenarioTags: ["health"] },
  ],
  rust: [
    { dutch: "Ik neem even rust.", meaningZh: "我休息一下。", meaningEn: "I take a short rest.", type: "scenario", phraseChunkUsed: "rust nemen", scenarioTags: ["health", "daily"] },
  ],
  ochtend: [
    { dutch: "Ik werk in de ochtend.", meaningZh: "我上午工作。", meaningEn: "I work in the morning.", type: "scenario", phraseChunkUsed: "in de ochtend", scenarioTags: ["time", "routine"] },
  ],
  namiddag: [
    { dutch: "Ik kom in de namiddag.", meaningZh: "我下午晚些时候来。", meaningEn: "I come in the late afternoon.", type: "scenario", phraseChunkUsed: "in de namiddag", scenarioTags: ["time", "appointment"] },
  ],
  nacht: [
    { dutch: "Ik slaap in de nacht.", meaningZh: "我夜里睡觉。", meaningEn: "I sleep at night.", type: "scenario", phraseChunkUsed: "in de nacht", scenarioTags: ["time", "routine"] },
  ],
  middernacht: [
    { dutch: "Ik slaap om middernacht.", meaningZh: "我午夜时在睡觉。", meaningEn: "I sleep at midnight.", type: "scenario", phraseChunkUsed: "om middernacht", scenarioTags: ["time", "routine"] },
  ],
  middagpauze: [
    { dutch: "Ik heb middagpauze.", meaningZh: "我有午休。", meaningEn: "I have a lunch break.", type: "scenario", phraseChunkUsed: "middagpauze hebben", scenarioTags: ["time", "work"] },
  ],
  werkdag: [
    { dutch: "Vandaag is een werkdag.", meaningZh: "今天是工作日。", meaningEn: "Today is a workday.", type: "scenario", phraseChunkUsed: "een werkdag", scenarioTags: ["time", "work"] },
  ],
  feestdag: [
    { dutch: "Vandaag is een feestdag.", meaningZh: "今天是节日/假日。", meaningEn: "Today is a holiday.", type: "scenario", phraseChunkUsed: "een feestdag", scenarioTags: ["time"] },
  ],
  verjaardag: [
    { dutch: "Vandaag is mijn verjaardag.", meaningZh: "今天是我的生日。", meaningEn: "Today is my birthday.", type: "scenario", phraseChunkUsed: "mijn verjaardag", scenarioTags: ["time", "family"] },
  ],
  kalender: [
    { dutch: "De afspraak staat in de kalender.", meaningZh: "预约在日历里。", meaningEn: "The appointment is in the calendar.", type: "scenario", phraseChunkUsed: "in de kalender", scenarioTags: ["time", "appointment"] },
  ],
  oom: [
    { dutch: "Mijn oom komt vandaag.", meaningZh: "我叔叔/舅舅今天来。", meaningEn: "My uncle is coming today.", type: "minimal", phraseChunkUsed: "mijn oom", scenarioTags: ["family"] },
  ],
  tante: [
    { dutch: "Mijn tante komt vandaag.", meaningZh: "我阿姨/姑姑今天来。", meaningEn: "My aunt is coming today.", type: "minimal", phraseChunkUsed: "mijn tante", scenarioTags: ["family"] },
  ],
  neef: [
    { dutch: "Mijn neef komt vandaag.", meaningZh: "我的侄子/外甥/堂表兄弟今天来。", meaningEn: "My male cousin or nephew is coming today.", type: "minimal", phraseChunkUsed: "mijn neef", scenarioTags: ["family"] },
  ],
  nicht: [
    { dutch: "Mijn nicht komt vandaag.", meaningZh: "我的侄女/外甥女/堂表姐妹今天来。", meaningEn: "My female cousin or niece is coming today.", type: "minimal", phraseChunkUsed: "mijn nicht", scenarioTags: ["family"] },
  ],
  kleinkind: [
    { dutch: "Mijn kleinkind speelt.", meaningZh: "我的孙辈在玩。", meaningEn: "My grandchild is playing.", type: "minimal", phraseChunkUsed: "mijn kleinkind", scenarioTags: ["family"] },
  ],
  aankomst: [
    { dutch: "De aankomst is om negen uur.", meaningZh: "到达时间是九点。", meaningEn: "The arrival is at nine o'clock.", type: "scenario", phraseChunkUsed: "de aankomst", scenarioTags: ["transport"] },
  ],
  vertrek: [
    { dutch: "Het vertrek is om acht uur.", meaningZh: "出发时间是八点。", meaningEn: "The departure is at eight o'clock.", type: "scenario", phraseChunkUsed: "het vertrek", scenarioTags: ["transport"] },
  ],
  rit: [
    { dutch: "De rit duurt tien minuten.", meaningZh: "这段车程需要十分钟。", meaningEn: "The ride takes ten minutes.", type: "scenario", phraseChunkUsed: "de rit duurt", scenarioTags: ["transport"] },
  ],
  reiziger: [
    { dutch: "De reiziger stapt in.", meaningZh: "乘客上车。", meaningEn: "The passenger gets on.", type: "scenario", phraseChunkUsed: "instappen", scenarioTags: ["transport"] },
  ],
  reisplanner: [
    { dutch: "De reisplanner geeft een andere route.", meaningZh: "行程规划器给出另一条路线。", meaningEn: "The travel planner gives another route.", type: "scenario", phraseChunkUsed: "de reisplanner gebruiken", scenarioTags: ["transport", "digital"] },
  ],
  richting: [
    { dutch: "De trein gaat richting Amsterdam.", meaningZh: "火车开往阿姆斯特丹方向。", meaningEn: "The train goes towards Amsterdam.", type: "scenario", phraseChunkUsed: "richting Amsterdam", scenarioTags: ["transport"] },
  ],
  lijn: [
    { dutch: "Welke lijn moet ik nemen?", meaningZh: "我应该坐哪条线路？", meaningEn: "Which line should I take?", type: "output", phraseChunkUsed: "welke lijn", scenarioTags: ["transport"] },
    { dutch: "Blijft u aan de lijn?", meaningZh: "您可以不要挂电话吗？", meaningEn: "Can you stay on the line?", type: "output", phraseChunkUsed: "aan de lijn blijven", scenarioTags: ["phone-call"] },
  ],
  chauffeur: [
    { dutch: "De chauffeur stopt bij de halte.", meaningZh: "司机在站点停车。", meaningEn: "The driver stops at the stop.", type: "scenario", phraseChunkUsed: "bij de halte stoppen", scenarioTags: ["transport"] },
  ],
  mens: [
    { dutch: "Er is een mens in de kamer.", meaningZh: "房间里有一个人。", meaningEn: "There is a person in the room.", type: "minimal", phraseChunkUsed: "een mens", scenarioTags: ["identity"] },
  ],
  man: [
    { dutch: "De man heet Jan.", meaningZh: "这个男人叫 Jan。", meaningEn: "The man is called Jan.", type: "minimal", phraseChunkUsed: "de man", scenarioTags: ["identity"] },
  ],
  vrouw: [
    { dutch: "De vrouw heet Anna.", meaningZh: "这个女人叫 Anna。", meaningEn: "The woman is called Anna.", type: "minimal", phraseChunkUsed: "de vrouw", scenarioTags: ["identity"] },
  ],
  kind: [
    { dutch: "Het kind speelt.", meaningZh: "这个孩子在玩。", meaningEn: "The child is playing.", type: "minimal", phraseChunkUsed: "het kind", scenarioTags: ["family"] },
  ],
  leraar: [
    { dutch: "De leraar spreekt Nederlands.", meaningZh: "老师说荷兰语。", meaningEn: "The teacher speaks Dutch.", type: "minimal", phraseChunkUsed: "de leraar", scenarioTags: ["school"] },
  ],
  student: [
    { dutch: "Ik ben student.", meaningZh: "我是学生。", meaningEn: "I am a student.", type: "minimal", phraseChunkUsed: "student zijn", scenarioTags: ["identity", "school"] },
  ],
  pen: [
    { dutch: "Ik heb een pen nodig.", meaningZh: "我需要一支笔。", meaningEn: "I need a pen.", type: "minimal", phraseChunkUsed: "een pen nodig hebben", scenarioTags: ["classroom"] },
  ],
  tas: [
    { dutch: "Mijn tas is hier.", meaningZh: "我的包在这里。", meaningEn: "My bag is here.", type: "minimal", phraseChunkUsed: "mijn tas", scenarioTags: ["classroom"] },
  ],
  telefoon: [
    { dutch: "Mijn telefoon is hier.", meaningZh: "我的手机在这里。", meaningEn: "My phone is here.", type: "minimal", phraseChunkUsed: "mijn telefoon", scenarioTags: ["daily"] },
  ],
  water: [
    { dutch: "Ik wil water.", meaningZh: "我想要水。", meaningEn: "I want water.", type: "output", phraseChunkUsed: "water willen", scenarioTags: ["food"] },
  ],
  kaart: [
    { dutch: "Ik heb een kaart nodig.", meaningZh: "我需要一张卡/一张地图。", meaningEn: "I need a card/map.", type: "minimal", phraseChunkUsed: "een kaart nodig hebben", scenarioTags: ["daily"] },
  ],
  stad: [
    { dutch: "Ik woon in een stad.", meaningZh: "我住在一座城市里。", meaningEn: "I live in a city.", type: "minimal", phraseChunkUsed: "in een stad wonen", scenarioTags: ["identity"] },
  ],
  land: [
    { dutch: "Ik kom uit een ander land.", meaningZh: "我来自另一个国家。", meaningEn: "I come from another country.", type: "minimal", phraseChunkUsed: "uit een land komen", scenarioTags: ["identity"] },
  ],
  brood: [
    { dutch: "Ik koop brood.", meaningZh: "我买面包。", meaningEn: "I buy bread.", type: "minimal", phraseChunkUsed: "brood kopen", scenarioTags: ["supermarket", "food"] },
  ],
  huis: [
    { dutch: "Ik woon in een huis.", meaningZh: "我住在一栋房子里。", meaningEn: "I live in a house.", type: "minimal", phraseChunkUsed: "in een huis wonen", scenarioTags: ["home"] },
  ],
  deur: [
    { dutch: "De deur is open.", meaningZh: "门开着。", meaningEn: "The door is open.", type: "minimal", phraseChunkUsed: "de deur", scenarioTags: ["home", "classroom"] },
  ],
  ijs: [
    { dutch: "Ik wil ijs.", meaningZh: "我想要冰淇淋。", meaningEn: "I want ice cream.", type: "minimal", phraseChunkUsed: "ijs willen", scenarioTags: ["food"] },
  ],
  minuut: [
    { dutch: "Een uur heeft zestig minuten.", meaningZh: "一小时有六十分钟。", meaningEn: "An hour has sixty minutes.", type: "minimal", phraseChunkUsed: "zestig minuten", scenarioTags: ["time"] },
    { dutch: "Ik wacht tien minuten.", meaningZh: "我等十分钟。", meaningEn: "I wait ten minutes.", type: "scenario", phraseChunkUsed: "tien minuten wachten", scenarioTags: ["time"] },
  ],
  uur: [
    { dutch: "Het is negen uur.", meaningZh: "现在九点。", meaningEn: "It is nine o'clock.", type: "minimal", phraseChunkUsed: "negen uur", scenarioTags: ["time"] },
  ],
  station: [
    { dutch: "Waar is het station?", meaningZh: "车站在哪里？", meaningEn: "Where is the station?", type: "output", phraseChunkUsed: "het station", scenarioTags: ["directions", "transport"] },
  ],
  supermarkt: [
    { dutch: "Ik ga naar de supermarkt.", meaningZh: "我去超市。", meaningEn: "I go to the supermarket.", type: "minimal", phraseChunkUsed: "naar de supermarkt gaan", scenarioTags: ["supermarket"] },
  ],
  fiets: [
    { dutch: "Mijn fiets is rood.", meaningZh: "我的自行车是红色的。", meaningEn: "My bike is red.", type: "minimal", phraseChunkUsed: "mijn fiets", scenarioTags: ["transport"] },
  ],
  trein: [
    { dutch: "De trein komt om negen uur.", meaningZh: "火车九点到。", meaningEn: "The train arrives at nine o'clock.", type: "scenario", phraseChunkUsed: "de trein komt", scenarioTags: ["transport", "time"] },
  ],
  school: [
    { dutch: "Ik ga naar school.", meaningZh: "我去学校。", meaningEn: "I go to school.", type: "minimal", phraseChunkUsed: "naar school gaan", scenarioTags: ["school"] },
  ],
  maandag: [
    { dutch: "Ik kom maandag.", meaningZh: "我星期一来。", meaningEn: "I come on Monday.", type: "scenario", phraseChunkUsed: "maandag komen", scenarioTags: ["time"] },
  ],
  vrijdag: [
    { dutch: "Vrijdag werk ik.", meaningZh: "星期五我工作。", meaningEn: "I work on Friday.", type: "scenario", phraseChunkUsed: "vrijdag werken", scenarioTags: ["time", "work"] },
  ],
  middag: [
    { dutch: "Ik kom in de middag.", meaningZh: "我下午来。", meaningEn: "I come in the afternoon.", type: "scenario", phraseChunkUsed: "in de middag", scenarioTags: ["time"] },
  ],
  werk: [
    { dutch: "Ik ga naar mijn werk.", meaningZh: "我去上班。", meaningEn: "I go to work.", type: "scenario", phraseChunkUsed: "naar mijn werk gaan", scenarioTags: ["work"] },
  ],
  collega: [
    { dutch: "Mijn collega is ziek.", meaningZh: "我的同事病了。", meaningEn: "My colleague is sick.", type: "scenario", phraseChunkUsed: "mijn collega", scenarioTags: ["work", "health"] },
  ],
  spoor: [
    { dutch: "Van welk spoor vertrekt de trein?", meaningZh: "火车从几号站台/轨道出发？", meaningEn: "From which platform does the train depart?", type: "output", phraseChunkUsed: "welk spoor", scenarioTags: ["transport"] },
  ],
  perron: [
    { dutch: "De trein vertrekt van perron twee.", meaningZh: "火车从二号站台出发。", meaningEn: "The train departs from platform two.", type: "scenario", phraseChunkUsed: "van perron twee", scenarioTags: ["transport"] },
  ],
  boodschappen: [
    { dutch: "Ik doe boodschappen.", meaningZh: "我去买日用品/买菜。", meaningEn: "I do grocery shopping.", type: "scenario", phraseChunkUsed: "boodschappen doen", scenarioTags: ["supermarket"] },
  ],
  vraag: [
    { dutch: "Ik heb een vraag.", meaningZh: "我有一个问题。", meaningEn: "I have a question.", type: "output", phraseChunkUsed: "een vraag hebben", scenarioTags: ["help"] },
  ],
  arm: [
    { dutch: "Mijn arm doet pijn.", meaningZh: "我的手臂疼。", meaningEn: "My arm hurts.", type: "scenario", phraseChunkUsed: "mijn arm doet pijn", scenarioTags: ["health"] },
    { dutch: "Ik heb pijn aan mijn arm.", meaningZh: "我的手臂疼。", meaningEn: "I have pain in my arm.", type: "output", phraseChunkUsed: "pijn aan mijn arm", scenarioTags: ["health"] },
  ],
  been: [
    { dutch: "Mijn been doet pijn.", meaningZh: "我的腿疼。", meaningEn: "My leg hurts.", type: "scenario", phraseChunkUsed: "mijn been doet pijn", scenarioTags: ["health"] },
    { dutch: "Ik heb pijn aan mijn been.", meaningZh: "我的腿疼。", meaningEn: "I have pain in my leg.", type: "output", phraseChunkUsed: "pijn aan mijn been", scenarioTags: ["health"] },
  ],
  hoofd: [
    { dutch: "Mijn hoofd doet pijn.", meaningZh: "我的头疼。", meaningEn: "My head hurts.", type: "scenario", phraseChunkUsed: "mijn hoofd doet pijn", scenarioTags: ["health"] },
    { dutch: "Ik heb hoofdpijn.", meaningZh: "我头疼。", meaningEn: "I have a headache.", type: "output", phraseChunkUsed: "hoofdpijn hebben", scenarioTags: ["health"] },
  ],
  buik: [
    { dutch: "Mijn buik doet pijn.", meaningZh: "我的肚子疼。", meaningEn: "My stomach hurts.", type: "scenario", phraseChunkUsed: "mijn buik doet pijn", scenarioTags: ["health"] },
    { dutch: "Ik heb buikpijn.", meaningZh: "我肚子疼。", meaningEn: "I have a stomachache.", type: "output", phraseChunkUsed: "buikpijn hebben", scenarioTags: ["health"] },
  ],
  hand: [
    { dutch: "Mijn hand doet pijn.", meaningZh: "我的手疼。", meaningEn: "My hand hurts.", type: "scenario", phraseChunkUsed: "mijn hand doet pijn", scenarioTags: ["health"] },
  ],
  voet: [
    { dutch: "Mijn voet doet pijn.", meaningZh: "我的脚疼。", meaningEn: "My foot hurts.", type: "scenario", phraseChunkUsed: "mijn voet doet pijn", scenarioTags: ["health"] },
  ],
  rug: [
    { dutch: "Mijn rug doet pijn.", meaningZh: "我的背疼。", meaningEn: "My back hurts.", type: "scenario", phraseChunkUsed: "mijn rug doet pijn", scenarioTags: ["health"] },
    { dutch: "Ik heb pijn aan mijn rug.", meaningZh: "我背疼。", meaningEn: "I have pain in my back.", type: "output", phraseChunkUsed: "pijn aan mijn rug", scenarioTags: ["health"] },
  ],
  keel: [
    { dutch: "Mijn keel doet pijn.", meaningZh: "我的喉咙疼。", meaningEn: "My throat hurts.", type: "scenario", phraseChunkUsed: "mijn keel doet pijn", scenarioTags: ["health"] },
    { dutch: "Ik heb keelpijn.", meaningZh: "我喉咙痛。", meaningEn: "I have a sore throat.", type: "output", phraseChunkUsed: "keelpijn hebben", scenarioTags: ["health"] },
  ],
  hoofdpijn: [
    { dutch: "Ik heb hoofdpijn.", meaningZh: "我头疼。", meaningEn: "I have a headache.", type: "minimal", phraseChunkUsed: "hoofdpijn hebben", scenarioTags: ["health"] },
  ],
  buikpijn: [
    { dutch: "Ik heb buikpijn.", meaningZh: "我肚子疼。", meaningEn: "I have a stomachache.", type: "minimal", phraseChunkUsed: "buikpijn hebben", scenarioTags: ["health"] },
  ],
  keelpijn: [
    { dutch: "Ik heb keelpijn.", meaningZh: "我喉咙痛。", meaningEn: "I have a sore throat.", type: "minimal", phraseChunkUsed: "keelpijn hebben", scenarioTags: ["health"] },
  ],
  koorts: [
    { dutch: "Ik heb koorts.", meaningZh: "我发烧。", meaningEn: "I have a fever.", type: "minimal", phraseChunkUsed: "koorts hebben", scenarioTags: ["health"] },
  ],
  probleem: [
    { dutch: "Ik heb een probleem.", meaningZh: "我有一个问题。", meaningEn: "I have a problem.", type: "output", phraseChunkUsed: "een probleem hebben", scenarioTags: ["help"] },
  ],
  formulier: [
    { dutch: "Ik moet het formulier invullen.", meaningZh: "我必须填写表格。", meaningEn: "I have to fill in the form.", type: "scenario", phraseChunkUsed: "het formulier invullen", scenarioTags: ["form", "gemeente"] },
  ],
  document: [
    { dutch: "Ik heb een document nodig.", meaningZh: "我需要一份文件。", meaningEn: "I need a document.", type: "scenario", phraseChunkUsed: "een document nodig hebben", scenarioTags: ["form", "gemeente"] },
  ],
  woning: [
    { dutch: "Ik heb een probleem met mijn woning.", meaningZh: "我的住房有问题。", meaningEn: "I have a problem with my home.", type: "scenario", phraseChunkUsed: "probleem met mijn woning", scenarioTags: ["housing"] },
  ],
  huur: [
    { dutch: "Ik betaal de huur.", meaningZh: "我付房租。", meaningEn: "I pay the rent.", type: "collocation", phraseChunkUsed: "de huur betalen", scenarioTags: ["housing", "payment"] },
    { dutch: "De huur is te hoog.", meaningZh: "房租太高了。", meaningEn: "The rent is too high.", type: "scenario", phraseChunkUsed: "de huur is te hoog", scenarioTags: ["housing"] },
  ],
  apotheek: [
    { dutch: "Ik ga naar de apotheek.", meaningZh: "我去药房。", meaningEn: "I go to the pharmacy.", type: "scenario", phraseChunkUsed: "naar de apotheek gaan", scenarioTags: ["health"] },
  ],
  medicijn: [
    { dutch: "Ik haal mijn medicijn op.", meaningZh: "我去取我的药。", meaningEn: "I pick up my medicine.", type: "scenario", phraseChunkUsed: "medicijn ophalen", scenarioTags: ["health"] },
  ],
  brief: [
    { dutch: "Ik heb een brief gekregen.", meaningZh: "我收到了一封信。", meaningEn: "I received a letter.", type: "scenario", phraseChunkUsed: "een brief krijgen", scenarioTags: ["email", "form"] },
  ],
  "e-mail": [
    { dutch: "Ik schrijf een e-mail.", meaningZh: "我写一封邮件。", meaningEn: "I write an email.", type: "scenario", phraseChunkUsed: "een e-mail schrijven", scenarioTags: ["email", "work"] },
  ],
  telefoonnummer: [
    { dutch: "Wat is uw telefoonnummer?", meaningZh: "您的电话号码是什么？", meaningEn: "What is your phone number?", type: "output", phraseChunkUsed: "uw telefoonnummer", scenarioTags: ["phone-call", "form"] },
  ],
  prijs: [
    { dutch: "Wat is de prijs?", meaningZh: "价格是多少？", meaningEn: "What is the price?", type: "output", phraseChunkUsed: "de prijs", scenarioTags: ["supermarket", "payment"] },
  ],
  geld: [
    { dutch: "Ik heb geen geld bij me.", meaningZh: "我身上没有带钱。", meaningEn: "I do not have money with me.", type: "scenario", phraseChunkUsed: "geld bij zich hebben", scenarioTags: ["payment"] },
  ],
  bericht: [
    { dutch: "Ik heb een bericht gekregen.", meaningZh: "我收到了一条消息。", meaningEn: "I received a message.", type: "scenario", phraseChunkUsed: "een bericht krijgen", scenarioTags: ["email", "phone-call"] },
  ],
  handtekening: [
    { dutch: "Zet uw handtekening hier.", meaningZh: "请在这里签名。", meaningEn: "Put your signature here.", type: "output", phraseChunkUsed: "uw handtekening zetten", scenarioTags: ["form", "gemeente"] },
  ],
  verwarming: [
    { dutch: "De verwarming werkt niet.", meaningZh: "暖气不工作。", meaningEn: "The heating does not work.", type: "scenario", phraseChunkUsed: "de verwarming werkt niet", scenarioTags: ["housing", "complaint"] },
  ],
  lekkage: [
    { dutch: "Er is lekkage in de badkamer.", meaningZh: "浴室漏水了。", meaningEn: "There is a leak in the bathroom.", type: "scenario", phraseChunkUsed: "lekkage in de badkamer", scenarioTags: ["housing", "complaint"] },
  ],
  ziekmelding: [
    { dutch: "Ik doe een ziekmelding.", meaningZh: "我提交/进行病假通知。", meaningEn: "I report sick.", type: "scenario", phraseChunkUsed: "een ziekmelding doen", scenarioTags: ["work", "sick-leave"] },
  ],
  premie: [
    { dutch: "Ik betaal premie voor mijn verzekering.", meaningZh: "我为我的保险付保费。", meaningEn: "I pay a premium for my insurance.", type: "scenario", phraseChunkUsed: "premie betalen", scenarioTags: ["insurance", "payment"] },
  ],
  salaris: [
    { dutch: "Mijn salaris staat op mijn rekening.", meaningZh: "我的工资在我的账户上。", meaningEn: "My salary is in my account.", type: "scenario", phraseChunkUsed: "mijn salaris", scenarioTags: ["work", "bill"] },
    { dutch: "Ik krijg mijn salaris op vrijdag.", meaningZh: "我星期五拿工资。", meaningEn: "I receive my salary on Friday.", type: "collocation", phraseChunkUsed: "salaris krijgen", scenarioTags: ["work", "payment"] },
  ],
  loonstrook: [
    { dutch: "Ik heb mijn loonstrook gekregen.", meaningZh: "我收到了我的工资单。", meaningEn: "I received my payslip.", type: "scenario", phraseChunkUsed: "mijn loonstrook krijgen", scenarioTags: ["work"] },
    { dutch: "Op mijn loonstrook staat mijn salaris.", meaningZh: "我的工资单上写着我的工资。", meaningEn: "My salary is shown on my payslip.", type: "collocation", phraseChunkUsed: "op mijn loonstrook staan", scenarioTags: ["work"] },
  ],
  proeftijd: [
    { dutch: "Mijn proeftijd is drie maanden.", meaningZh: "我的试用期是三个月。", meaningEn: "My trial period is three months.", type: "scenario", phraseChunkUsed: "mijn proeftijd", scenarioTags: ["work"] },
    { dutch: "Ik zit nog in mijn proeftijd.", meaningZh: "我还在试用期。", meaningEn: "I am still in my trial period.", type: "collocation", phraseChunkUsed: "in mijn proeftijd zitten", scenarioTags: ["work"] },
  ],
  afwezigheid: [
    { dutch: "Ik geef mijn afwezigheid door.", meaningZh: "我告知我的缺勤。", meaningEn: "I report my absence.", type: "scenario", phraseChunkUsed: "afwezigheid doorgeven", scenarioTags: ["work", "sick-leave"] },
    { dutch: "Mijn afwezigheid staat in het systeem.", meaningZh: "我的缺勤记录在系统里。", meaningEn: "My absence is in the system.", type: "collocation", phraseChunkUsed: "afwezigheid in het systeem", scenarioTags: ["work"] },
  ],
  uitzendbureau: [
    { dutch: "Ik werk via een uitzendbureau.", meaningZh: "我通过派遣公司工作。", meaningEn: "I work through an employment agency.", type: "scenario", phraseChunkUsed: "via een uitzendbureau werken", scenarioTags: ["work"] },
    { dutch: "Het uitzendbureau belt mij morgen.", meaningZh: "派遣公司明天给我打电话。", meaningEn: "The employment agency will call me tomorrow.", type: "collocation", phraseChunkUsed: "het uitzendbureau belt", scenarioTags: ["work", "phone-call"] },
  ],
  herstel: [
    { dutch: "Mijn herstel duurt langer.", meaningZh: "我的恢复需要更久。", meaningEn: "My recovery is taking longer.", type: "scenario", phraseChunkUsed: "mijn herstel", scenarioTags: ["health", "work"] },
    { dutch: "Ik heb tijd nodig voor herstel.", meaningZh: "我需要时间恢复。", meaningEn: "I need time for recovery.", type: "collocation", phraseChunkUsed: "tijd nodig voor herstel", scenarioTags: ["health", "work"] },
  ],
  verlof: [
    { dutch: "Ik vraag verlof aan.", meaningZh: "我申请休假。", meaningEn: "I request leave.", type: "scenario", phraseChunkUsed: "verlof aanvragen", scenarioTags: ["work"] },
    { dutch: "Ik heb morgen verlof.", meaningZh: "我明天休假。", meaningEn: "I have leave tomorrow.", type: "collocation", phraseChunkUsed: "verlof hebben", scenarioTags: ["work"] },
  ],
  waterrekening: [
    { dutch: "Ik moet de waterrekening betalen.", meaningZh: "我必须付水费账单。", meaningEn: "I have to pay the water bill.", type: "scenario", phraseChunkUsed: "de waterrekening betalen", scenarioTags: ["bill", "payment"] },
    { dutch: "De waterrekening is hoger dan normaal.", meaningZh: "水费账单比平时高。", meaningEn: "The water bill is higher than usual.", type: "collocation", phraseChunkUsed: "de waterrekening is hoger", scenarioTags: ["bill", "housing"] },
  ],
  herinnering: [
    { dutch: "Ik heb een herinnering gekregen.", meaningZh: "我收到了一封催缴/提醒信。", meaningEn: "I received a reminder.", type: "scenario", phraseChunkUsed: "een herinnering krijgen", scenarioTags: ["bill", "letter"] },
    { dutch: "De herinnering gaat over de rekening.", meaningZh: "这封提醒信是关于账单的。", meaningEn: "The reminder is about the bill.", type: "collocation", phraseChunkUsed: "herinnering over de rekening", scenarioTags: ["bill", "letter"] },
  ],
  zorgpas: [
    { dutch: "Neem uw zorgpas mee.", meaningZh: "请带上您的医保卡。", meaningEn: "Bring your health insurance card.", type: "output", phraseChunkUsed: "zorgpas meenemen", scenarioTags: ["health", "insurance"] },
  ],
  servicekosten: [
    { dutch: "De servicekosten zijn hoog.", meaningZh: "服务费很高。", meaningEn: "The service costs are high.", type: "scenario", phraseChunkUsed: "servicekosten zijn hoog", scenarioTags: ["housing", "bill"] },
  ],
  tablet: [
    { dutch: "Neem een tablet met water.", meaningZh: "用水服用一片药片。", meaningEn: "Take one tablet with water.", type: "output", phraseChunkUsed: "een tablet nemen", scenarioTags: ["health"] },
  ],
  zalf: [
    { dutch: "Ik gebruik de zalf.", meaningZh: "我使用这个药膏。", meaningEn: "I use the ointment.", type: "scenario", phraseChunkUsed: "de zalf gebruiken", scenarioTags: ["health"] },
  ],
  druppels: [
    { dutch: "Ik gebruik de druppels.", meaningZh: "我使用滴剂。", meaningEn: "I use the drops.", type: "scenario", phraseChunkUsed: "druppels gebruiken", scenarioTags: ["health"] },
  ],
  bijwerking: [
    { dutch: "Heeft dit medicijn bijwerkingen?", meaningZh: "这个药有副作用吗？", meaningEn: "Does this medicine have side effects?", type: "output", phraseChunkUsed: "bijwerkingen hebben", scenarioTags: ["health"] },
  ],
  dosis: [
    { dutch: "Wat is de dosis?", meaningZh: "剂量是多少？", meaningEn: "What is the dose?", type: "output", phraseChunkUsed: "de dosis", scenarioTags: ["health"] },
  ],
  receptnummer: [
    { dutch: "Wat is uw receptnummer?", meaningZh: "您的处方号码是什么？", meaningEn: "What is your prescription number?", type: "output", phraseChunkUsed: "uw receptnummer", scenarioTags: ["health", "form"] },
  ],
  herhaalrecept: [
    { dutch: "Ik wil een herhaalrecept aanvragen.", meaningZh: "我想申请续方。", meaningEn: "I want to request a repeat prescription.", type: "scenario", phraseChunkUsed: "een herhaalrecept aanvragen", scenarioTags: ["health"] },
  ],
  voorraad: [
    { dutch: "Het medicijn is op voorraad.", meaningZh: "这个药有库存。", meaningEn: "The medicine is in stock.", type: "scenario", phraseChunkUsed: "op voorraad zijn", scenarioTags: ["health"] },
  ],
  gebruik: [
    { dutch: "Het gebruik staat op het doosje.", meaningZh: "用法写在盒子上。", meaningEn: "The usage is on the box.", type: "scenario", phraseChunkUsed: "het gebruik", scenarioTags: ["health"] },
  ],
  bereikbaar: [
    { dutch: "Ik ben vandaag telefonisch bereikbaar.", meaningZh: "我今天电话可以联系到。", meaningEn: "I am reachable by phone today.", type: "scenario", phraseChunkUsed: "telefonisch bereikbaar zijn", scenarioTags: ["phone-call", "work"] },
  ],
  contact: [
    { dutch: "Ik neem contact op met de gemeente.", meaningZh: "我联系市政厅。", meaningEn: "I contact the municipality.", type: "scenario", phraseChunkUsed: "contact opnemen met", scenarioTags: ["gemeente", "phone-call"] },
  ],
  "bericht inspreken": [
    { dutch: "Ik spreek een bericht in.", meaningZh: "我留一段语音留言。", meaningEn: "I leave a voice message.", type: "scenario", phraseChunkUsed: "een bericht inspreken", scenarioTags: ["phone-call"] },
  ],
};

const numberExamples: Record<string, TemplateExample[]> = {
  nul: [{ dutch: "Ik heb nul fouten.", meaningZh: "我有零个错误。", meaningEn: "I have zero mistakes.", type: "minimal", phraseChunkUsed: "nul fouten", scenarioTags: ["numbers", "classroom"] }],
  een: [{ dutch: "Ik wil een koffie.", meaningZh: "我想要一杯咖啡。", meaningEn: "I would like one coffee.", type: "output", phraseChunkUsed: "een koffie", scenarioTags: ["numbers", "food"] }],
  twee: [{ dutch: "Ik heb twee kinderen.", meaningZh: "我有两个孩子。", meaningEn: "I have two children.", type: "minimal", phraseChunkUsed: "twee kinderen", scenarioTags: ["numbers", "family"] }],
  drie: [{ dutch: "Het is drie uur.", meaningZh: "现在三点。", meaningEn: "It is three o'clock.", type: "minimal", phraseChunkUsed: "drie uur", scenarioTags: ["numbers", "time"] }],
  vier: [{ dutch: "Ik kom om vier uur.", meaningZh: "我四点来。", meaningEn: "I come at four o'clock.", type: "scenario", phraseChunkUsed: "om vier uur", scenarioTags: ["numbers", "time"] }],
  vijf: [{ dutch: "De trein heeft vijf minuten vertraging.", meaningZh: "火车晚点五分钟。", meaningEn: "The train is delayed by five minutes.", type: "scenario", phraseChunkUsed: "vijf minuten", scenarioTags: ["numbers", "transport", "time"] }],
  zes: [{ dutch: "Ik werk tot zes uur.", meaningZh: "我工作到六点。", meaningEn: "I work until six o'clock.", type: "scenario", phraseChunkUsed: "tot zes uur", scenarioTags: ["numbers", "work", "time"] }],
  zeven: [{ dutch: "Ik sta om zeven uur op.", meaningZh: "我七点起床。", meaningEn: "I get up at seven o'clock.", type: "scenario", phraseChunkUsed: "om zeven uur", scenarioTags: ["numbers", "routine"] }],
  acht: [{ dutch: "De les begint om acht uur.", meaningZh: "课八点开始。", meaningEn: "The lesson starts at eight o'clock.", type: "scenario", phraseChunkUsed: "om acht uur", scenarioTags: ["numbers", "school", "time"] }],
  negen: [{ dutch: "Ik kom om negen uur.", meaningZh: "我九点来。", meaningEn: "I come at nine o'clock.", type: "minimal", phraseChunkUsed: "om negen uur", scenarioTags: ["numbers", "time"] }],
  tien: [{ dutch: "Ik wacht tien minuten.", meaningZh: "我等十分钟。", meaningEn: "I wait ten minutes.", type: "scenario", phraseChunkUsed: "tien minuten", scenarioTags: ["numbers", "time"] }],
  twintig: [{ dutch: "Dat kost twintig euro.", meaningZh: "那个二十欧。", meaningEn: "That costs twenty euros.", type: "scenario", phraseChunkUsed: "twintig euro", scenarioTags: ["numbers", "payment"] }],
  dertig: [{ dutch: "Ik wacht dertig minuten.", meaningZh: "我等三十分钟。", meaningEn: "I wait thirty minutes.", type: "scenario", phraseChunkUsed: "dertig minuten", scenarioTags: ["numbers", "time"] }],
  veertig: [{ dutch: "Dat kost veertig euro.", meaningZh: "那个四十欧。", meaningEn: "That costs forty euros.", type: "scenario", phraseChunkUsed: "veertig euro", scenarioTags: ["numbers", "payment"] }],
  vijftig: [{ dutch: "Ik betaal vijftig euro.", meaningZh: "我付五十欧。", meaningEn: "I pay fifty euros.", type: "scenario", phraseChunkUsed: "vijftig euro", scenarioTags: ["numbers", "payment"] }],
  honderd: [{ dutch: "Dat kost honderd euro.", meaningZh: "那个一百欧。", meaningEn: "That costs one hundred euros.", type: "scenario", phraseChunkUsed: "honderd euro", scenarioTags: ["numbers", "payment"] }],
};

const phraseExamples: Record<string, TemplateExample[]> = {
  hallo: [{ dutch: "Hallo.", meaningZh: "你好。", meaningEn: "Hello.", type: "minimal", phraseChunkUsed: "hallo", scenarioTags: ["greeting"] }],
  dag: [{ dutch: "Dag.", meaningZh: "你好/再见。", meaningEn: "Hi/bye.", type: "minimal", phraseChunkUsed: "dag", scenarioTags: ["greeting"] }],
  ja: [{ dutch: "Ja.", meaningZh: "是/对。", meaningEn: "Yes.", type: "minimal", phraseChunkUsed: "ja", scenarioTags: ["greeting"] }],
  nee: [{ dutch: "Nee.", meaningZh: "不/不是。", meaningEn: "No.", type: "minimal", phraseChunkUsed: "nee", scenarioTags: ["greeting"] }],
  sorry: [{ dutch: "Sorry.", meaningZh: "抱歉。", meaningEn: "Sorry.", type: "minimal", phraseChunkUsed: "sorry", scenarioTags: ["greeting"] }],
  goedemorgen: [{ dutch: "Goedemorgen.", meaningZh: "早上好。", meaningEn: "Good morning.", type: "minimal", phraseChunkUsed: "goedemorgen", scenarioTags: ["greeting"] }],
  goedemiddag: [{ dutch: "Goedemiddag.", meaningZh: "下午好。", meaningEn: "Good afternoon.", type: "minimal", phraseChunkUsed: "goedemiddag", scenarioTags: ["greeting"] }],
  goedenavond: [{ dutch: "Goedenavond.", meaningZh: "晚上好。", meaningEn: "Good evening.", type: "minimal", phraseChunkUsed: "goedenavond", scenarioTags: ["greeting"] }],
  bedankt: [{ dutch: "Bedankt.", meaningZh: "谢谢。", meaningEn: "Thanks.", type: "minimal", phraseChunkUsed: "bedankt", scenarioTags: ["greeting"] }],
  "tot ziens": [{ dutch: "Tot ziens.", meaningZh: "再见。", meaningEn: "Goodbye.", type: "minimal", phraseChunkUsed: "tot ziens", scenarioTags: ["greeting"] }],
  "dank je": [{ dutch: "Dank je.", meaningZh: "谢谢你。", meaningEn: "Thank you.", type: "minimal", phraseChunkUsed: "dank je", scenarioTags: ["greeting"] }],
  alsjeblieft: [{ dutch: "Water, alsjeblieft.", meaningZh: "水，谢谢。", meaningEn: "Water, please.", type: "output", phraseChunkUsed: "alsjeblieft", scenarioTags: ["food"] }],
  alstublieft: [{ dutch: "Kunt u dat herhalen, alstublieft?", meaningZh: "您可以重复一遍吗？", meaningEn: "Can you repeat that, please?", type: "output", phraseChunkUsed: "alstublieft", scenarioTags: ["help"] }],
  "een beetje": [{ dutch: "Ik spreek een beetje Nederlands.", meaningZh: "我会说一点荷兰语。", meaningEn: "I speak a little Dutch.", type: "output", phraseChunkUsed: "een beetje Nederlands", scenarioTags: ["languages"] }],
  "kunt u": [{ dutch: "Kunt u mij helpen?", meaningZh: "您可以帮我吗？", meaningEn: "Can you help me?", type: "output", phraseChunkUsed: "kunt u", scenarioTags: ["help"] }],
  "nog een keer": [{ dutch: "Nog een keer, alstublieft.", meaningZh: "请再来一遍。", meaningEn: "One more time, please.", type: "output", phraseChunkUsed: "nog een keer", scenarioTags: ["help", "classroom"] }],
  "kom uit": [{ dutch: "Ik kom uit China.", meaningZh: "我来自中国。", meaningEn: "I come from China.", type: "minimal", phraseChunkUsed: "kom uit", scenarioTags: ["identity"] }],
  "woon in": [{ dutch: "Ik woon in Nederland.", meaningZh: "我住在荷兰。", meaningEn: "I live in the Netherlands.", type: "minimal", phraseChunkUsed: "woon in", scenarioTags: ["identity"] }],
  "ga naar": [{ dutch: "Ik ga naar school.", meaningZh: "我去学校。", meaningEn: "I go to school.", type: "minimal", phraseChunkUsed: "ga naar", scenarioTags: ["school"] }],
  "elke week": [{ dutch: "Ik oefen elke week.", meaningZh: "我每周练习。", meaningEn: "I practise every week.", type: "scenario", phraseChunkUsed: "elke week", scenarioTags: ["time", "routine"] }],
  "per maand": [{ dutch: "Ik betaal per maand.", meaningZh: "我按月付款。", meaningEn: "I pay per month.", type: "scenario", phraseChunkUsed: "per maand", scenarioTags: ["time", "payment"] }],
  "nederlandse les": [{ dutch: "Ik heb Nederlandse les.", meaningZh: "我有荷兰语课。", meaningEn: "I have Dutch lessons.", type: "scenario", phraseChunkUsed: "Nederlandse les", scenarioTags: ["school", "languages"] }],
  "den haag": [{ dutch: "Ik ga naar Den Haag.", meaningZh: "我去海牙。", meaningEn: "I go to The Hague.", type: "scenario", phraseChunkUsed: "naar Den Haag gaan", scenarioTags: ["transport", "identity"] }],
  "bericht inspreken": [{ dutch: "Ik spreek een bericht in.", meaningZh: "我留一段语音留言。", meaningEn: "I leave a voice message.", type: "scenario", phraseChunkUsed: "een bericht inspreken", scenarioTags: ["phone-call"] }],
  "ik bel over": [{ dutch: "Ik bel over mijn afspraak.", meaningZh: "我打电话是关于我的预约。", meaningEn: "I am calling about my appointment.", type: "output", phraseChunkUsed: "ik bel over", scenarioTags: ["phone-call", "appointment"] }],
  "ik heb een vraag over": [{ dutch: "Ik heb een vraag over de rekening.", meaningZh: "我有一个关于账单的问题。", meaningEn: "I have a question about the bill.", type: "output", phraseChunkUsed: "ik heb een vraag over", scenarioTags: ["help", "bill"] }],
  "kunt u uitleggen": [{ dutch: "Kunt u dat uitleggen?", meaningZh: "您能解释一下吗？", meaningEn: "Can you explain that?", type: "output", phraseChunkUsed: "kunt u uitleggen", scenarioTags: ["help"] }],
  "welke documenten": [{ dutch: "Welke documenten heb ik nodig?", meaningZh: "我需要哪些文件？", meaningEn: "Which documents do I need?", type: "output", phraseChunkUsed: "welke documenten", scenarioTags: ["form"] }],
  "hoe lang duurt het": [{ dutch: "Hoe lang duurt het?", meaningZh: "这需要多久？", meaningEn: "How long does it take?", type: "output", phraseChunkUsed: "hoe lang duurt het", scenarioTags: ["appointment"] }],
  "ik wil graag": [{ dutch: "Ik wil graag koffie.", meaningZh: "我想要咖啡。", meaningEn: "I would like coffee.", type: "output", phraseChunkUsed: "ik wil graag", scenarioTags: ["food", "speaking"] }],
  "ik kan helaas niet": [{ dutch: "Ik kan helaas niet komen.", meaningZh: "很遗憾我不能来。", meaningEn: "Unfortunately I cannot come.", type: "output", phraseChunkUsed: "ik kan helaas niet", scenarioTags: ["appointment"] }],
  "ik stel voor": [{ dutch: "Ik stel voor dat we morgen bellen.", meaningZh: "我建议我们明天打电话。", meaningEn: "I suggest that we call tomorrow.", type: "output", phraseChunkUsed: "ik stel voor", scenarioTags: ["work", "speaking"] }],
  "de reden is dat": [{ dutch: "De reden is dat ik ziek ben.", meaningZh: "原因是我生病了。", meaningEn: "The reason is that I am sick.", type: "output", phraseChunkUsed: "de reden is dat", scenarioTags: ["writing", "health"] }],
  "mijn voorstel is": [{ dutch: "Mijn voorstel is om morgen te bellen.", meaningZh: "我的建议是明天打电话。", meaningEn: "My proposal is to call tomorrow.", type: "output", phraseChunkUsed: "mijn voorstel is", scenarioTags: ["work", "writing"] }],
  "kunt u mij laten weten": [{ dutch: "Kunt u mij laten weten wat ik moet doen?", meaningZh: "您能告诉我该怎么做吗？", meaningEn: "Can you let me know what I should do?", type: "output", phraseChunkUsed: "kunt u mij laten weten", scenarioTags: ["email", "help"] }],
  "ik heb een klacht over": [{ dutch: "Ik heb een klacht over de levering.", meaningZh: "我对配送有投诉。", meaningEn: "I have a complaint about the delivery.", type: "output", phraseChunkUsed: "ik heb een klacht over", scenarioTags: ["complaint"] }],
  "uit de informatie blijkt": [{ dutch: "Uit de informatie blijkt dat de trein later komt.", meaningZh: "从信息可看出火车晚点到。", meaningEn: "The information shows that the train comes later.", type: "scenario", phraseChunkUsed: "uit de informatie blijkt", scenarioTags: ["reading", "transport"] }],
  "in vergelijking met": [{ dutch: "In vergelijking met vorig jaar is het duurder.", meaningZh: "与去年相比，这更贵。", meaningEn: "Compared with last year, it is more expensive.", type: "contrast", phraseChunkUsed: "in vergelijking met", scenarioTags: ["comparison"] }],
};

const phraseAsSentence = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return value;
  const sentence = /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
};

const phraseFallbackExamplesFor = (word: WordItem): TemplateExample[] => {
  const phrase = word.dutch.trim();
  const key = norm(phrase);
  const tokens = key.split(/\s+/).filter(Boolean);
  const meaningZh = meaningZhFor(word);
  const meaningEn = meaningEnFor(word);
  const scenarioTags = word.scenarioTags;
  const natural = hasNaturalMeaning(word);

  if (/^(ik|wij|we|hij|zij|ze|u)\s+/i.test(phrase) && /[.!?]$/.test(phrase)) {
    return [{
      dutch: phraseAsSentence(phrase),
      meaningZh,
      meaningEn,
      type: "output",
      phraseChunkUsed: phrase,
      scenarioTags,
      confidence: natural ? "medium" : "low",
      needsHumanReview: !natural,
    }];
  }

  const phrasePatterns: Array<[RegExp, TemplateExample]> = [
    [/^contact opnemen met$/i, { dutch: "Ik neem contact op met de gemeente.", meaningZh: "我联系市政厅。", meaningEn: "I contact the municipality.", type: "scenario", phraseChunkUsed: phrase, scenarioTags: ["gemeente", "phone-call"] }],
    [/^rekening houden met$/i, { dutch: "Ik houd rekening met de afspraak.", meaningZh: "我会考虑这个预约。", meaningEn: "I take the appointment into account.", type: "scenario", phraseChunkUsed: phrase, scenarioTags: ["appointment", "planning"] }],
    [/^volgens mij$/i, { dutch: "Volgens mij is dit een goede oplossing.", meaningZh: "我觉得这是一个好解决方案。", meaningEn: "In my opinion, this is a good solution.", type: "output", phraseChunkUsed: phrase, scenarioTags: ["opinion", "speaking"] }],
    [/^ten eerste$/i, { dutch: "Ten eerste wil ik de reden uitleggen.", meaningZh: "首先，我想解释原因。", meaningEn: "First, I want to explain the reason.", type: "output", phraseChunkUsed: phrase, scenarioTags: ["opinion", "writing"] }],
    [/^ten tweede$/i, { dutch: "Ten tweede kost het minder geld.", meaningZh: "第二，这花的钱更少。", meaningEn: "Second, it costs less money.", type: "output", phraseChunkUsed: phrase, scenarioTags: ["opinion", "writing"] }],
    [/^kortom$/i, { dutch: "Kortom, ik ben het ermee eens.", meaningZh: "总之，我同意这件事。", meaningEn: "In short, I agree with it.", type: "output", phraseChunkUsed: phrase, scenarioTags: ["opinion", "writing"] }],
    [/^aan de ene kant$/i, { dutch: "Aan de ene kant is het handig.", meaningZh: "一方面，这很方便。", meaningEn: "On the one hand, it is convenient.", type: "output", phraseChunkUsed: phrase, scenarioTags: ["opinion", "writing"] }],
    [/^aan de andere kant$/i, { dutch: "Aan de andere kant kost het veel tijd.", meaningZh: "另一方面，这要花很多时间。", meaningEn: "On the other hand, it takes a lot of time.", type: "output", phraseChunkUsed: phrase, scenarioTags: ["opinion", "writing"] }],
    [/^in vergelijking met$/i, { dutch: "In vergelijking met vorig jaar gaat het beter.", meaningZh: "和去年相比，情况更好了。", meaningEn: "Compared with last year, it is going better.", type: "output", phraseChunkUsed: phrase, scenarioTags: ["opinion", "writing"] }],
    [/^bewijs sturen$/i, { dutch: "Ik stuur het bewijs mee.", meaningZh: "我把证明一起发过去。", meaningEn: "I send the proof along.", type: "scenario", phraseChunkUsed: phrase, scenarioTags: ["form", "digital"] }],
    [/^foto meesturen$/i, { dutch: "Ik stuur een foto mee.", meaningZh: "我附上一张照片。", meaningEn: "I send a photo along.", type: "scenario", phraseChunkUsed: phrase, scenarioTags: ["digital", "form"] }],
    [/^uitleg vragen$/i, { dutch: "Ik vraag om uitleg.", meaningZh: "我请求解释。", meaningEn: "I ask for an explanation.", type: "output", phraseChunkUsed: phrase, scenarioTags: ["help"] }],
    [/^oplossing zoeken$/i, { dutch: "Ik zoek samen met u naar een oplossing.", meaningZh: "我和您一起找解决方案。", meaningEn: "I look for a solution together with you.", type: "output", phraseChunkUsed: phrase, scenarioTags: ["complaint", "help"] }],
    [/^klacht indienen$/i, { dutch: "Ik wil een klacht indienen.", meaningZh: "我想提交投诉。", meaningEn: "I want to submit a complaint.", type: "output", phraseChunkUsed: phrase, scenarioTags: ["complaint"] }],
    [/^niet akkoord$/i, { dutch: "Ik ben niet akkoord met dit besluit.", meaningZh: "我不同意这个决定。", meaningEn: "I do not agree with this decision.", type: "output", phraseChunkUsed: phrase, scenarioTags: ["opinion", "admin"] }],
    [/^akkoord gaan$/i, { dutch: "Ik ga akkoord met het voorstel.", meaningZh: "我同意这个提议。", meaningEn: "I agree with the proposal.", type: "output", phraseChunkUsed: phrase, scenarioTags: ["opinion", "work"] }],
    [/^fout herstellen$/i, { dutch: "Ik wil de fout herstellen.", meaningZh: "我想改正这个错误。", meaningEn: "I want to correct the mistake.", type: "output", phraseChunkUsed: phrase, scenarioTags: ["form", "digital"] }],
    [/^online aanvragen$/i, { dutch: "Ik vraag het online aan.", meaningZh: "我在线申请这个。", meaningEn: "I apply for it online.", type: "scenario", phraseChunkUsed: phrase, scenarioTags: ["digital", "form"] }],
    [/^digitaal ondertekenen$/i, { dutch: "Ik onderteken het document digitaal.", meaningZh: "我用数字方式签署文件。", meaningEn: "I sign the document digitally.", type: "scenario", phraseChunkUsed: phrase, scenarioTags: ["digital", "form"] }],
    [/^account aanmaken$/i, { dutch: "Ik maak een account aan.", meaningZh: "我创建一个账号。", meaningEn: "I create an account.", type: "scenario", phraseChunkUsed: phrase, scenarioTags: ["digital"] }],
    [/^status bekijken$/i, { dutch: "Ik bekijk de status van mijn aanvraag.", meaningZh: "我查看我的申请状态。", meaningEn: "I check the status of my application.", type: "scenario", phraseChunkUsed: phrase, scenarioTags: ["digital", "form"] }],
    [/^inloggen met digid$/i, { dutch: "Ik log in met DigiD.", meaningZh: "我用 DigiD 登录。", meaningEn: "I log in with DigiD.", type: "scenario", phraseChunkUsed: phrase, scenarioTags: ["digital", "gemeente"] }],
    [/^wijziging doorgeven$/i, { dutch: "Ik geef de wijziging door.", meaningZh: "我上报这个变更。", meaningEn: "I report the change.", type: "scenario", phraseChunkUsed: phrase, scenarioTags: ["form", "admin"] }],
    [/^dienst ruilen$/i, { dutch: "Ik wil mijn dienst ruilen.", meaningZh: "我想换班。", meaningEn: "I want to swap my shift.", type: "output", phraseChunkUsed: phrase, scenarioTags: ["work"] }],
    [/^uren doorgeven$/i, { dutch: "Ik geef mijn uren door.", meaningZh: "我上报我的工时。", meaningEn: "I report my hours.", type: "scenario", phraseChunkUsed: phrase, scenarioTags: ["work"] }],
    [/^te laat melden$/i, { dutch: "Ik meld dat ik te laat ben.", meaningZh: "我告知对方我迟到了。", meaningEn: "I report that I am late.", type: "scenario", phraseChunkUsed: phrase, scenarioTags: ["work", "appointment"] }],
    [/^veilig werken$/i, { dutch: "Ik werk veilig met deze machine.", meaningZh: "我安全地使用这台机器工作。", meaningEn: "I work safely with this machine.", type: "scenario", phraseChunkUsed: phrase, scenarioTags: ["work", "safety"] }],
    [/^afspraak bevestigen$/i, { dutch: "Ik bevestig de afspraak per e-mail.", meaningZh: "我通过邮件确认预约。", meaningEn: "I confirm the appointment by email.", type: "scenario", phraseChunkUsed: phrase, scenarioTags: ["appointment", "email"] }],
    [/^afspraak verzetten$/i, { dutch: "Ik wil de afspraak verzetten.", meaningZh: "我想改约。", meaningEn: "I want to reschedule the appointment.", type: "output", phraseChunkUsed: phrase, scenarioTags: ["appointment"] }],
    [/^rustig blijven$/i, { dutch: "Ik probeer rustig te blijven.", meaningZh: "我努力保持冷静。", meaningEn: "I try to stay calm.", type: "output", phraseChunkUsed: phrase, scenarioTags: ["speaking", "work"] }],
    [/^samen beslissen$/i, { dutch: "We beslissen samen over de oplossing.", meaningZh: "我们一起决定解决方案。", meaningEn: "We decide on the solution together.", type: "scenario", phraseChunkUsed: phrase, scenarioTags: ["work", "opinion"] }],
    [/^stage lopen$/i, { dutch: "Ik loop stage in een zorgcentrum.", meaningZh: "我在护理中心实习。", meaningEn: "I do an internship at a care center.", type: "scenario", phraseChunkUsed: phrase, scenarioTags: ["work", "school"] }],
    [/^sterke kant$/i, { dutch: "Mijn sterke kant is rustig luisteren.", meaningZh: "我的强项是平静地倾听。", meaningEn: "My strong point is listening calmly.", type: "output", phraseChunkUsed: phrase, scenarioTags: ["identity", "work"] }],
    [/^ervaring delen$/i, { dutch: "Ik wil mijn ervaring delen met de groep.", meaningZh: "我想和小组分享我的经验。", meaningEn: "I want to share my experience with the group.", type: "output", phraseChunkUsed: phrase, scenarioTags: ["speaking", "school"] }],
    [/^in het weekend$/i, { dutch: "In het weekend leer ik nieuwe woorden.", meaningZh: "周末我学新单词。", meaningEn: "At the weekend, I learn new words.", type: "scenario", phraseChunkUsed: phrase, scenarioTags: ["time", "school"] }],
    [/^graag doen$/i, { dutch: "Ik doe graag vrijwilligerswerk.", meaningZh: "我喜欢做志愿工作。", meaningEn: "I like doing volunteer work.", type: "output", phraseChunkUsed: phrase, scenarioTags: ["identity", "work"] }],
    [/^belangrijke informatie zoeken$/i, { dutch: "Ik zoek belangrijke informatie op de website.", meaningZh: "我在网站上查找重要信息。", meaningEn: "I look for important information on the website.", type: "scenario", phraseChunkUsed: phrase, scenarioTags: ["digital", "admin"] }],
    [/^nieuwe woorden leren$/i, { dutch: "Ik leer elke dag nieuwe woorden.", meaningZh: "我每天学习新单词。", meaningEn: "I learn new words every day.", type: "scenario", phraseChunkUsed: phrase, scenarioTags: ["school"] }],
    [/^persoonlijke mening$/i, { dutch: "Ik geef mijn persoonlijke mening in de les.", meaningZh: "我在课堂上表达个人意见。", meaningEn: "I give my personal opinion in class.", type: "output", phraseChunkUsed: phrase, scenarioTags: ["opinion", "school"] }],
    [/^contact houden$/i, { dutch: "Ik houd contact met mijn collega.", meaningZh: "我和同事保持联系。", meaningEn: "I keep in contact with my colleague.", type: "scenario", phraseChunkUsed: phrase, scenarioTags: ["work", "communication"] }],
    [/^contact leggen$/i, { dutch: "Ik leg contact met de contactpersoon.", meaningZh: "我和联系人建立联系。", meaningEn: "I make contact with the contact person.", type: "scenario", phraseChunkUsed: phrase, scenarioTags: ["work", "communication"] }],
    [/^advies geven$/i, { dutch: "De huisarts geeft advies over de behandeling.", meaningZh: "家庭医生给出治疗建议。", meaningEn: "The GP gives advice about the treatment.", type: "scenario", phraseChunkUsed: phrase, scenarioTags: ["health"] }],
    [/^advies vragen$/i, { dutch: "Ik vraag advies aan mijn leidinggevende.", meaningZh: "我向主管寻求建议。", meaningEn: "I ask my supervisor for advice.", type: "scenario", phraseChunkUsed: phrase, scenarioTags: ["work"] }],
    [/^iemand steunen$/i, { dutch: "Ik steun mijn collega bij het probleem.", meaningZh: "我在这个问题上支持我的同事。", meaningEn: "I support my colleague with the problem.", type: "scenario", phraseChunkUsed: phrase, scenarioTags: ["work", "communication"] }],
    [/^afspraak nakomen$/i, { dutch: "Ik kom mijn afspraak na.", meaningZh: "我遵守约定。", meaningEn: "I keep my appointment.", type: "output", phraseChunkUsed: phrase, scenarioTags: ["appointment", "communication"] }],
  ];
  const matchedPattern = phrasePatterns.find(([pattern]) => pattern.test(key))?.[1];
  if (matchedPattern) return [matchedPattern];

  const lastToken = tokens[tokens.length - 1];
  const lastVerbForms = lastToken ? verbFormsForWord(lastToken) : undefined;
  if (lastVerbForms && tokens.length >= 2) {
    const object = phrase.split(/\s+/).slice(0, -1).join(" ");
    return [{
      dutch: `Ik ${lastVerbForms.ik} ${object}.`,
      meaningZh: `我${meaningZh}。`,
      meaningEn: `I ${meaningEn}.`,
      type: "output",
      phraseChunkUsed: phrase,
      scenarioTags,
      confidence: "low",
      needsHumanReview: true,
    }];
  }

  const firstVerbForms = tokens[0] ? verbFormsForWord(tokens[0]) : undefined;
  if (firstVerbForms && tokens.length >= 2) {
    const rest = phrase.split(/\s+/).slice(1).join(" ");
    return [{
      dutch: `Ik ${firstVerbForms.ik} ${rest}.`,
      meaningZh: `我${meaningZh}。`,
      meaningEn: `I ${meaningEn}.`,
      type: "output",
      phraseChunkUsed: phrase,
      scenarioTags,
      confidence: "low",
      needsHumanReview: true,
    }];
  }

  return [{
    dutch: phraseAsSentence(phrase),
    meaningZh,
    meaningEn,
    type: "minimal",
    phraseChunkUsed: phrase,
    scenarioTags,
    needsHumanReview: true,
    confidence: "low",
  }];
};

const verbFallbackSentences: Record<string, { dutch: string; phraseChunk: string; meaningZh?: string; meaningEn?: string }> = {
  opstaan: { dutch: "Ik sta vroeg op.", phraseChunk: "vroeg opstaan" },
  aanmelden: { dutch: "Ik meld mij aan.", phraseChunk: "zich aanmelden" },
  afmelden: { dutch: "Ik meld mij af.", phraseChunk: "zich afmelden" },
  aantrekken: { dutch: "Ik trek mijn jas aan.", phraseChunk: "een jas aantrekken" },
  uittrekken: { dutch: "Ik trek mijn jas uit.", phraseChunk: "een jas uittrekken" },
  terugbrengen: { dutch: "Ik breng het terug.", phraseChunk: "iets terugbrengen" },
  opruimen: { dutch: "Ik ruim de kamer op.", phraseChunk: "de kamer opruimen" },
  schoonmaken: { dutch: "Ik maak de tafel schoon.", phraseChunk: "de tafel schoonmaken" },
  stofzuigen: { dutch: "Ik stofzuig de kamer.", phraseChunk: "de kamer stofzuigen" },
  afwassen: { dutch: "Ik was de borden af.", phraseChunk: "de borden afwassen" },
  afdrogen: { dutch: "Ik droog de borden af.", phraseChunk: "de borden afdrogen" },
  ophangen: { dutch: "Ik hang mijn jas op.", phraseChunk: "een jas ophangen" },
  weggooien: { dutch: "Ik gooi het papier weg.", phraseChunk: "papier weggooien" },
  inpakken: { dutch: "Ik pak mijn tas in.", phraseChunk: "een tas inpakken" },
  uitpakken: { dutch: "Ik pak de doos uit.", phraseChunk: "een doos uitpakken" },
  aanzetten: { dutch: "Ik zet de computer aan.", phraseChunk: "de computer aanzetten" },
  uitzetten: { dutch: "Ik zet de computer uit.", phraseChunk: "de computer uitzetten" },
  aanraken: { dutch: "Ik raak het scherm aan.", phraseChunk: "het scherm aanraken" },
  uitloggen: { dutch: "Ik log uit.", phraseChunk: "uitloggen" },
  uitnodigen: { dutch: "Ik nodig mijn vriend uit.", phraseChunk: "iemand uitnodigen" },
  afspreken: { dutch: "Ik spreek morgen af.", phraseChunk: "morgen afspreken" },
  achterlaten: { dutch: "Ik laat mijn nummer achter.", phraseChunk: "een nummer achterlaten" },
  onthouden: { dutch: "Ik onthoud het woord.", phraseChunk: "een woord onthouden" },
  klaarmaken: { dutch: "Ik maak het eten klaar.", phraseChunk: "eten klaarmaken" },
  uitschrijven: { dutch: "Ik schrijf mij uit.", phraseChunk: "zich uitschrijven" },
  aanvinken: { dutch: "Ik vink het vakje aan.", phraseChunk: "een vakje aanvinken" },
  bijvoegen: { dutch: "Ik voeg het document bij.", phraseChunk: "een document bijvoegen" },
  doorverwijzen: { dutch: "De huisarts verwijst mij door.", phraseChunk: "iemand doorverwijzen" },
  innemen: { dutch: "Ik neem de tablet in.", phraseChunk: "een tablet innemen" },
  opzeggen: { dutch: "Ik zeg het contract op.", phraseChunk: "een contract opzeggen" },
  thuisblijven: { dutch: "Ik blijf vandaag thuis.", phraseChunk: "thuisblijven" },
  omreizen: { dutch: "Ik reis om.", phraseChunk: "omreizen" },
  uitstappen: { dutch: "Ik stap hier uit.", phraseChunk: "hier uitstappen" },
  instappen: { dutch: "Ik stap in de bus in.", phraseChunk: "in de bus instappen" },
  doorsturen: { dutch: "Ik stuur de e-mail door.", phraseChunk: "een e-mail doorsturen" },
  opnemen: { dutch: "Ik neem de telefoon op.", phraseChunk: "de telefoon opnemen" },
  oplossen: { dutch: "Ik los het probleem op.", phraseChunk: "een probleem oplossen" },
  terugstorten: { dutch: "De winkel stort het geld terug.", phraseChunk: "geld terugstorten" },
  afhalen: { dutch: "Ik haal het pakket af.", phraseChunk: "een pakket afhalen" },
  afstemmen: { dutch: "Ik stem de planning af.", phraseChunk: "de planning afstemmen" },
  aanbieden: { dutch: "Ik bied hulp aan.", phraseChunk: "hulp aanbieden" },
  aanpassen: { dutch: "Ik pas mijn gegevens aan.", phraseChunk: "gegevens aanpassen" },
  uitleggen: { dutch: "Ik leg de regel uit.", phraseChunk: "de regel uitleggen" },
  douchen: { dutch: "Ik douche in de ochtend.", phraseChunk: "in de ochtend douchen" },
  ontbijten: { dutch: "Ik ontbijt om acht uur.", phraseChunk: "om acht uur ontbijten" },
  lunchen: { dutch: "Ik lunch om twaalf uur.", phraseChunk: "om twaalf uur lunchen" },
  fietsen: { dutch: "Ik fiets naar school.", phraseChunk: "naar school fietsen" },
  wandelen: { dutch: "Ik wandel in het park.", phraseChunk: "in het park wandelen" },
  duwen: { dutch: "Duw tegen de deur.", phraseChunk: "tegen de deur duwen" },
  trekken: { dutch: "Trek aan de deur.", phraseChunk: "aan de deur trekken" },
  eindigen: { dutch: "De les eindigt om drie uur.", phraseChunk: "de les eindigt" },
  antwoorden: { dutch: "Ik antwoord op de vraag.", phraseChunk: "op de vraag antwoorden" },
  vliegen: { dutch: "Ik vlieg naar Spanje.", phraseChunk: "naar Spanje vliegen" },
  proberen: { dutch: "Ik probeer het.", phraseChunk: "iets proberen" },
  repareren: { dutch: "De monteur repareert de kraan.", phraseChunk: "de kraan repareren" },
  bevestigen: { dutch: "Ik bevestig de afspraak.", phraseChunk: "de afspraak bevestigen" },
  passen: { dutch: "De jas past goed.", phraseChunk: "goed passen" },
  brengen: { dutch: "Ik breng mijn tas mee.", phraseChunk: "iets meebrengen" },
  halen: { dutch: "Ik haal mijn medicijn op.", phraseChunk: "medicijn ophalen" },
  krijgen: { dutch: "Ik krijg een brief.", phraseChunk: "een brief krijgen" },
  liggen: { dutch: "Het boek ligt op tafel.", phraseChunk: "op tafel liggen" },
  blijven: { dutch: "Ik blijf vandaag thuis.", phraseChunk: "thuis blijven" },
  spelen: { dutch: "Het kind speelt.", phraseChunk: "spelen" },
  horen: { dutch: "Ik hoor de telefoon.", phraseChunk: "de telefoon horen" },
  pinnen: { dutch: "Kan ik hier pinnen?", phraseChunk: "hier pinnen", meaningZh: "我可以在这里刷卡吗？", meaningEn: "Can I pay by card here?" },
  ruilen: { dutch: "Ik wil deze jas ruilen.", phraseChunk: "een jas ruilen", meaningZh: "我想换这件外套。", meaningEn: "I want to exchange this coat." },
  bewaren: { dutch: "Ik bewaar de bon.", phraseChunk: "de bon bewaren", meaningZh: "我保存收据。", meaningEn: "I keep the receipt." },
  logeren: { dutch: "Ik logeer bij mijn vriend.", phraseChunk: "bij iemand logeren", meaningZh: "我住在朋友家。", meaningEn: "I stay over at my friend's place." },
  samenwonen: { dutch: "Wij willen samenwonen.", phraseChunk: "willen samenwonen", meaningZh: "我们想一起住。", meaningEn: "We want to live together." },
  scheiden: { dutch: "Mijn ouders scheiden.", phraseChunk: "ouders scheiden", meaningZh: "我的父母离婚。", meaningEn: "My parents are divorcing." },
  snijden: { dutch: "Ik snijd brood.", phraseChunk: "brood snijden", meaningZh: "我切面包。", meaningEn: "I cut bread." },
  branden: { dutch: "Mijn hand brandt.", phraseChunk: "mijn hand brandt", meaningZh: "我的手有灼烧感。", meaningEn: "My hand burns." },
  jeuken: { dutch: "Mijn arm jeukt.", phraseChunk: "mijn arm jeukt", meaningZh: "我的手臂发痒。", meaningEn: "My arm itches." },
  vinden: { dutch: "Ik vind het goed.", phraseChunk: "het goed vinden", meaningZh: "我觉得可以。", meaningEn: "I think it is good." },
  oefenen: { dutch: "Ik oefen de zin.", phraseChunk: "de zin oefenen", meaningZh: "我练习这个句子。", meaningEn: "I practise the sentence." },
  vertellen: { dutch: "Ik vertel mijn naam.", phraseChunk: "mijn naam vertellen", meaningZh: "我说出我的名字。", meaningEn: "I tell my name." },
  weten: { dutch: "Ik weet het niet.", phraseChunk: "het niet weten", meaningZh: "我不知道。", meaningEn: "I do not know." },
  denken: { dutch: "Ik denk aan morgen.", phraseChunk: "aan morgen denken", meaningZh: "我想到明天。", meaningEn: "I think about tomorrow." },
  meenemen: { dutch: "Ik neem mijn paspoort mee.", phraseChunk: "paspoort meenemen", meaningZh: "我带上我的护照。", meaningEn: "I take my passport with me." },
  zwemmen: { dutch: "Ik zwem in het zwembad.", phraseChunk: "in het zwembad zwemmen", meaningZh: "我在游泳池游泳。", meaningEn: "I swim in the swimming pool." },
  hardlopen: { dutch: "Ik loop hard in het park.", phraseChunk: "in het park hardlopen", meaningZh: "我在公园跑步。", meaningEn: "I run in the park." },
  dansen: { dutch: "Ik dans op muziek.", phraseChunk: "op muziek dansen", meaningZh: "我跟着音乐跳舞。", meaningEn: "I dance to music." },
  zingen: { dutch: "Ik zing een lied.", phraseChunk: "een lied zingen", meaningZh: "我唱一首歌。", meaningEn: "I sing a song." },
  tekenen: { dutch: "Ik teken een huis.", phraseChunk: "een huis tekenen", meaningZh: "我画一栋房子。", meaningEn: "I draw a house." },
  vegen: { dutch: "Ik veeg de vloer.", phraseChunk: "de vloer vegen", meaningZh: "我扫地。", meaningEn: "I sweep the floor." },
  dweilen: { dutch: "Ik dweil de vloer.", phraseChunk: "de vloer dweilen", meaningZh: "我拖地。", meaningEn: "I mop the floor." },
  strijken: { dutch: "Ik strijk mijn shirt.", phraseChunk: "een shirt strijken", meaningZh: "我熨衬衫。", meaningEn: "I iron my shirt." },
  vouwen: { dutch: "Ik vouw de was.", phraseChunk: "de was vouwen", meaningZh: "我叠洗好的衣物。", meaningEn: "I fold the laundry." },
  proeven: { dutch: "Ik proef de soep.", phraseChunk: "de soep proeven", meaningZh: "我尝汤。", meaningEn: "I taste the soup." },
  slikken: { dutch: "Ik slik de tablet.", phraseChunk: "een tablet slikken", meaningZh: "我吞下一片药片。", meaningEn: "I swallow the tablet." },
  ademen: { dutch: "Ik adem rustig.", phraseChunk: "rustig ademen", meaningZh: "我平静地呼吸。", meaningEn: "I breathe calmly." },
  vallen: { dutch: "Ik val bijna.", phraseChunk: "bijna vallen", meaningZh: "我差点摔倒。", meaningEn: "I almost fall." },
  bloeden: { dutch: "Mijn vinger bloedt.", phraseChunk: "mijn vinger bloedt", meaningZh: "我的手指在流血。", meaningEn: "My finger is bleeding." },
  ondertekenen: { dutch: "Ik onderteken het formulier.", phraseChunk: "het formulier ondertekenen", meaningZh: "我签署表格。", meaningEn: "I sign the form." },
  uploaden: { dutch: "Ik upload het bestand.", phraseChunk: "een bestand uploaden", meaningZh: "我上传文件。", meaningEn: "I upload the file." },
  downloaden: { dutch: "Ik download het bestand.", phraseChunk: "een bestand downloaden", meaningZh: "我下载文件。", meaningEn: "I download the file." },
  toevoegen: { dutch: "Ik voeg het bestand toe.", phraseChunk: "een bestand toevoegen", meaningZh: "我添加文件。", meaningEn: "I add the file." },
  verwijderen: { dutch: "Ik verwijder het bestand.", phraseChunk: "een bestand verwijderen", meaningZh: "我删除文件。", meaningEn: "I remove the file." },
  versturen: { dutch: "Ik verstuur de e-mail.", phraseChunk: "een e-mail versturen", meaningZh: "我发送电子邮件。", meaningEn: "I send the email." },
  nakijken: { dutch: "Ik kijk het formulier na.", phraseChunk: "een formulier nakijken", meaningZh: "我检查表格。", meaningEn: "I check the form." },
  declareren: { dutch: "Ik declareer de kosten.", phraseChunk: "kosten declareren", meaningZh: "我申报费用。", meaningEn: "I claim the costs." },
  vergoeden: { dutch: "De verzekering vergoedt de kosten.", phraseChunk: "kosten vergoeden", meaningZh: "保险报销费用。", meaningEn: "The insurance reimburses the costs." },
  wijzigen: { dutch: "Ik wijzig mijn afspraak.", phraseChunk: "een afspraak wijzigen", meaningZh: "我更改预约。", meaningEn: "I change my appointment." },
  beantwoorden: { dutch: "Ik beantwoord de e-mail.", phraseChunk: "een e-mail beantwoorden", meaningZh: "我回复电子邮件。", meaningEn: "I answer the email." },
  retourneren: { dutch: "Ik retourneer het product.", phraseChunk: "een product retourneren", meaningZh: "我退回这个产品。", meaningEn: "I return the product." },
  bezorgen: { dutch: "De bezorger bezorgt het pakket.", phraseChunk: "een pakket bezorgen", meaningZh: "快递员配送包裹。", meaningEn: "The delivery person delivers the package." },
  sturen: { dutch: "Ik stuur een e-mail.", phraseChunk: "een e-mail sturen", meaningZh: "我发送一封电子邮件。", meaningEn: "I send an email." },
  langskomen: { dutch: "Kan ik morgen langskomen?", phraseChunk: "morgen langskomen", meaningZh: "我明天可以过来吗？", meaningEn: "Can I come by tomorrow?" },
  aanvragen: { dutch: "Ik vraag huurtoeslag aan.", phraseChunk: "huurtoeslag aanvragen", meaningZh: "我申请房租补贴。", meaningEn: "I apply for housing benefit." },
  verplaatsen: { dutch: "Ik verplaats de afspraak.", phraseChunk: "een afspraak verplaatsen", meaningZh: "我改预约时间。", meaningEn: "I move the appointment." },
  trakteren: { dutch: "Ik trakteer op taart.", phraseChunk: "op taart trakteren", meaningZh: "我请大家吃蛋糕。", meaningEn: "I treat people to cake." },
  bezoeken: { dutch: "Ik bezoek mijn buurvrouw.", phraseChunk: "iemand bezoeken", meaningZh: "我拜访我的邻居。", meaningEn: "I visit my neighbour." },
  verlengen: { dutch: "Ik verleng mijn contract.", phraseChunk: "een contract verlengen", meaningZh: "我延长合同。", meaningEn: "I extend my contract." },
  verkorten: { dutch: "Ik verkort de tekst.", phraseChunk: "een tekst verkorten", meaningZh: "我缩短文本。", meaningEn: "I shorten the text." },
  bereiken: { dutch: "Ik bereik de klantenservice.", phraseChunk: "de klantenservice bereiken", meaningZh: "我联系到了客服。", meaningEn: "I reach customer service." },
  besparen: { dutch: "Ik bespaar energie.", phraseChunk: "energie besparen", meaningZh: "我节省能源。", meaningEn: "I save energy." },
  vergelijken: { dutch: "Ik vergelijk de prijzen.", phraseChunk: "prijzen vergelijken", meaningZh: "我比较价格。", meaningEn: "I compare prices." },
  inschrijven: { dutch: "Ik schrijf mij in.", phraseChunk: "zich inschrijven", meaningZh: "我报名/登记。", meaningEn: "I register." },
  ziekmelden: { dutch: "Ik meld mij ziek.", phraseChunk: "zich ziekmelden", meaningZh: "我请病假。", meaningEn: "I call in sick." },
  vertrekken: { dutch: "De trein vertrekt om acht uur.", phraseChunk: "de trein vertrekt", meaningZh: "火车八点出发。", meaningEn: "The train leaves at eight o'clock." },
  aankomen: { dutch: "De trein komt om negen uur aan.", phraseChunk: "om negen uur aankomen", meaningZh: "火车九点到达。", meaningEn: "The train arrives at nine o'clock." },
  overgeven: { dutch: "Ik moet overgeven.", phraseChunk: "moeten overgeven", meaningZh: "我想吐/需要呕吐。", meaningEn: "I need to vomit." },
  terugkomen: { dutch: "Ik kom morgen terug.", phraseChunk: "morgen terugkomen", meaningZh: "我明天回来。", meaningEn: "I come back tomorrow." },
  vervangen: { dutch: "Ik vervang mijn pas.", phraseChunk: "een pas vervangen", meaningZh: "我更换我的卡。", meaningEn: "I replace my card." },
  overleggen: { dutch: "Ik overleg met mijn collega.", phraseChunk: "met een collega overleggen", meaningZh: "我和同事商量。", meaningEn: "I consult with my colleague." },
  doorgeven: { dutch: "Ik geef mijn adres door.", phraseChunk: "een adres doorgeven", meaningZh: "我告知我的地址。", meaningEn: "I pass on my address." },
  overstappen: { dutch: "Ik stap over op de trein.", phraseChunk: "op de trein overstappen", meaningZh: "我换乘火车。", meaningEn: "I transfer to the train." },
  uitvallen: { dutch: "De trein valt uit.", phraseChunk: "de trein valt uit", meaningZh: "火车停运。", meaningEn: "The train is cancelled." },
  annuleren: { dutch: "Ik annuleer de afspraak.", phraseChunk: "een afspraak annuleren", meaningZh: "我取消预约。", meaningEn: "I cancel the appointment." },
  inchecken: { dutch: "Ik check in met mijn kaart.", phraseChunk: "met mijn kaart inchecken", meaningZh: "我用卡刷卡进站。", meaningEn: "I check in with my card." },
  uitchecken: { dutch: "Ik check uit met mijn kaart.", phraseChunk: "met mijn kaart uitchecken", meaningZh: "我用卡刷卡出站。", meaningEn: "I check out with my card." },
  vergeten: { dutch: "Ik vergeet mijn pas.", phraseChunk: "een pas vergeten", meaningZh: "我忘带我的卡。", meaningEn: "I forget my card." },
  terugbetalen: { dutch: "Ik betaal het bedrag terug.", phraseChunk: "een bedrag terugbetalen", meaningZh: "我退还这笔金额。", meaningEn: "I pay the amount back." },
  kloppen: { dutch: "De gegevens kloppen.", phraseChunk: "gegevens kloppen", meaningZh: "信息是正确的。", meaningEn: "The details are correct." },
  reageren: { dutch: "Ik reageer op de e-mail.", phraseChunk: "op een e-mail reageren", meaningZh: "我回复这封邮件。", meaningEn: "I respond to the email." },
  klagen: { dutch: "Ik klaag over de levering.", phraseChunk: "over de levering klagen", meaningZh: "我投诉配送问题。", meaningEn: "I complain about the delivery." },
  ontbreken: { dutch: "Mijn handtekening ontbreekt.", phraseChunk: "handtekening ontbreekt", meaningZh: "我的签名缺失。", meaningEn: "My signature is missing." },
  meedenken: { dutch: "Ik denk graag mee.", phraseChunk: "meedenken", meaningZh: "我愿意一起想办法。", meaningEn: "I am happy to think along." },
  inloggen: { dutch: "Ik log in met mijn DigiD.", phraseChunk: "inloggen met DigiD", meaningZh: "我用 DigiD 登录。", meaningEn: "I log in with my DigiD." },
  stemmen: { dutch: "Ik stem bij de verkiezingen.", phraseChunk: "bij verkiezingen stemmen", meaningZh: "我在选举中投票。", meaningEn: "I vote in the elections." },
  reserveren: { dutch: "Ik reserveer een tafel.", phraseChunk: "een tafel reserveren", meaningZh: "我预订一张桌子。", meaningEn: "I reserve a table." },
  hergebruiken: { dutch: "Ik hergebruik de tas.", phraseChunk: "een tas hergebruiken", meaningZh: "我重复使用这个袋子。", meaningEn: "I reuse the bag." },
  samenvatten: { dutch: "Ik vat de tekst samen.", phraseChunk: "een tekst samenvatten", meaningZh: "我总结这段文本。", meaningEn: "I summarize the text." },
  waarderen: { dutch: "Ik waardeer uw hulp.", phraseChunk: "hulp waarderen", meaningZh: "我感谢您的帮助。", meaningEn: "I appreciate your help." },
  toelichten: { dutch: "Ik licht mijn antwoord toe.", phraseChunk: "een antwoord toelichten", meaningZh: "我说明我的答案。", meaningEn: "I explain my answer." },
  doorvragen: { dutch: "Ik vraag door over het probleem.", phraseChunk: "doorvragen over", meaningZh: "我继续追问这个问题。", meaningEn: "I ask follow-up questions about the problem." },
  sparen: { dutch: "Ik spaar elke maand geld.", phraseChunk: "geld sparen", meaningZh: "我每个月存钱。", meaningEn: "I save money every month." },
  lenen: { dutch: "Ik leen geld bij de bank.", phraseChunk: "geld lenen", meaningZh: "我从银行借钱。", meaningEn: "I borrow money from the bank." },
  samenwerken: { dutch: "Wij willen samenwerken aan de opdracht.", phraseChunk: "samenwerken aan", meaningZh: "我们想一起做这项任务。", meaningEn: "We want to work together on the assignment." },
  reflecteren: { dutch: "Ik reflecteer op mijn werk.", phraseChunk: "reflecteren op", meaningZh: "我反思我的工作。", meaningEn: "I reflect on my work." },
  beschrijven: { dutch: "Ik beschrijf mijn ervaring.", phraseChunk: "ervaring beschrijven", meaningZh: "我描述我的经历。", meaningEn: "I describe my experience." },
  aankleden: { dutch: "Ik kleed mij aan.", phraseChunk: "zich aankleden", meaningZh: "我穿衣服。", meaningEn: "I get dressed." },
  glimlachen: { dutch: "Ik glimlach naar de buurvrouw.", phraseChunk: "naar iemand glimlachen", meaningZh: "我对邻居微笑。", meaningEn: "I smile at the neighbour." },
  herinneren: { dutch: "Ik herinner mij de afspraak.", phraseChunk: "zich iets herinneren", meaningZh: "我记得这个预约。", meaningEn: "I remember the appointment." },
  inwerken: { dutch: "Mijn collega werkt mij in.", phraseChunk: "iemand inwerken", meaningZh: "我的同事带我熟悉工作。", meaningEn: "My colleague trains me in." },
  verzekeren: { dutch: "Ik verzeker mijn fiets.", phraseChunk: "een fiets verzekeren", meaningZh: "我给自行车上保险。", meaningEn: "I insure my bike." },
  identificeren: { dutch: "Ik identificeer mij met mijn paspoort.", phraseChunk: "zich identificeren", meaningZh: "我用护照证明身份。", meaningEn: "I identify myself with my passport." },
};

const sentenceCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const nounFallback = (
  word: WordItem,
  template: Omit<TemplateExample, "confidence" | "needsHumanReview">,
  naturalNoun = hasNaturalMeaning(word),
): TemplateExample => ({
  ...template,
  confidence: naturalNoun ? "medium" : "low",
  needsHumanReview: !naturalNoun,
});

const dictionaryStyleNounFallbacksFor = (
  word: WordItem,
  dutch: string,
  articlePhrase: string,
  naturalNoun: boolean,
): TemplateExample[] => {
  const subject = sentenceCase(articlePhrase);
  const zh = meaningZhFor(word);
  const en = meaningEnFor(word);

  const b1TaskNouns: Record<string, TemplateExample> = {
    diploma: { dutch: "Ik stuur mijn diploma mee.", meaningZh: "我把我的文凭一起发过去。", meaningEn: "I send my diploma along.", type: "scenario", phraseChunkUsed: "mijn diploma meesturen", scenarioTags: ["work", "school", "digital"] },
    personeel: { dutch: "Het personeel helpt de klanten rustig.", meaningZh: "工作人员耐心帮助顾客。", meaningEn: "The staff help the customers calmly.", type: "scenario", phraseChunkUsed: "het personeel helpt", scenarioTags: ["work"] },
    uitzendkracht: { dutch: "Ik werk deze maand als uitzendkracht.", meaningZh: "我这个月做临时派遣工。", meaningEn: "I work as a temporary worker this month.", type: "scenario", phraseChunkUsed: "als uitzendkracht werken", scenarioTags: ["work"] },
    stagiair: { dutch: "De stagiair leert het werk stap voor stap.", meaningZh: "实习生一步一步学习工作。", meaningEn: "The intern learns the work step by step.", type: "scenario", phraseChunkUsed: "de stagiair leert", scenarioTags: ["work", "school"] },
    kandidaat: { dutch: "De kandidaat komt morgen op gesprek.", meaningZh: "候选人明天来面试。", meaningEn: "The candidate comes for an interview tomorrow.", type: "scenario", phraseChunkUsed: "de kandidaat komt op gesprek", scenarioTags: ["work"] },
    karakter: { dutch: "Mijn karakter past bij werken met mensen.", meaningZh: "我的性格适合和人打交道的工作。", meaningEn: "My character fits working with people.", type: "output", phraseChunkUsed: "mijn karakter past", scenarioTags: ["identity", "work"] },
    eigenschap: { dutch: "Geduld is een belangrijke eigenschap.", meaningZh: "耐心是一项重要品质。", meaningEn: "Patience is an important quality.", type: "output", phraseChunkUsed: "een belangrijke eigenschap", scenarioTags: ["identity", "work"] },
    gewoonte: { dutch: "Ik heb de gewoonte om op tijd te komen.", meaningZh: "我有准时到的习惯。", meaningEn: "I have the habit of arriving on time.", type: "scenario", phraseChunkUsed: "de gewoonte hebben", scenarioTags: ["identity", "work"] },
    interesse: { dutch: "Ik heb interesse in deze opleiding.", meaningZh: "我对这个培训/课程感兴趣。", meaningEn: "I am interested in this program.", type: "output", phraseChunkUsed: "interesse hebben in", scenarioTags: ["school", "work"] },
    zelfvertrouwen: { dutch: "Door de cursus krijg ik meer zelfvertrouwen.", meaningZh: "通过课程我获得更多自信。", meaningEn: "Through the course, I gain more self-confidence.", type: "scenario", phraseChunkUsed: "meer zelfvertrouwen krijgen", scenarioTags: ["school", "identity"] },
    verbeterpunt: { dutch: "Mijn verbeterpunt is duidelijker spreken.", meaningZh: "我的改进点是说得更清楚。", meaningEn: "My improvement point is speaking more clearly.", type: "output", phraseChunkUsed: "mijn verbeterpunt", scenarioTags: ["school", "work"] },
    toekomstplan: { dutch: "Mijn toekomstplan is een baan in de zorg.", meaningZh: "我的未来计划是在护理行业工作。", meaningEn: "My future plan is a job in care.", type: "output", phraseChunkUsed: "mijn toekomstplan", scenarioTags: ["work", "school"] },
    leerdoel: { dutch: "Mijn leerdoel is beter Nederlands spreken.", meaningZh: "我的学习目标是把荷兰语说得更好。", meaningEn: "My learning goal is speaking Dutch better.", type: "output", phraseChunkUsed: "mijn leerdoel", scenarioTags: ["school"] },
    relatie: { dutch: "Een goede relatie vraagt om vertrouwen.", meaningZh: "良好的关系需要信任。", meaningEn: "A good relationship requires trust.", type: "scenario", phraseChunkUsed: "een goede relatie", scenarioTags: ["communication"] },
    vriendschap: { dutch: "Vriendschap is belangrijk voor mij.", meaningZh: "友谊对我很重要。", meaningEn: "Friendship is important to me.", type: "output", phraseChunkUsed: "vriendschap is belangrijk", scenarioTags: ["communication"] },
    kennismaking: { dutch: "De kennismaking begint met een korte uitleg.", meaningZh: "初次认识从简短介绍开始。", meaningEn: "The introduction starts with a short explanation.", type: "scenario", phraseChunkUsed: "de kennismaking begint", scenarioTags: ["communication"] },
    vertrouwen: { dutch: "Ik heb vertrouwen in mijn team.", meaningZh: "我信任我的团队。", meaningEn: "I have confidence in my team.", type: "output", phraseChunkUsed: "vertrouwen hebben in", scenarioTags: ["work", "communication"] },
    respect: { dutch: "We tonen respect voor elkaar.", meaningZh: "我们彼此表示尊重。", meaningEn: "We show respect for each other.", type: "output", phraseChunkUsed: "respect tonen", scenarioTags: ["communication"] },
    misverstand: { dutch: "Ik wil het misverstand rustig uitleggen.", meaningZh: "我想平静地解释这个误会。", meaningEn: "I want to calmly explain the misunderstanding.", type: "output", phraseChunkUsed: "het misverstand uitleggen", scenarioTags: ["communication"] },
    ruzie: { dutch: "Na de ruzie praten we rustig verder.", meaningZh: "争吵之后，我们继续平静地谈。", meaningEn: "After the argument, we continue talking calmly.", type: "scenario", phraseChunkUsed: "na de ruzie", scenarioTags: ["communication"] },
    vaardigheid: { dutch: "Deze vaardigheid is belangrijk voor mijn werk.", meaningZh: "这项技能对我的工作很重要。", meaningEn: "This skill is important for my work.", type: "scenario", phraseChunkUsed: "een vaardigheid is belangrijk", scenarioTags: ["work", "school"] },
    team: { dutch: "Ik werk in een team.", meaningZh: "我在一个团队里工作。", meaningEn: "I work in a team.", type: "scenario", phraseChunkUsed: "in een team werken", scenarioTags: ["work"] },
    werkplek: { dutch: "Mijn werkplek is rustig.", meaningZh: "我的工作地点很安静。", meaningEn: "My workplace is quiet.", type: "scenario", phraseChunkUsed: "mijn werkplek", scenarioTags: ["work"] },
    contactpersoon: { dutch: "Mijn contactpersoon belt mij morgen terug.", meaningZh: "我的联系人明天给我回电话。", meaningEn: "My contact person will call me back tomorrow.", type: "scenario", phraseChunkUsed: "mijn contactpersoon", scenarioTags: ["work", "phone-call"] },
    functie: { dutch: "Ik solliciteer naar deze functie.", meaningZh: "我申请这个职位。", meaningEn: "I apply for this position.", type: "scenario", phraseChunkUsed: "naar een functie solliciteren", scenarioTags: ["work"] },
    leidinggevende: { dutch: "Ik overleg met mijn leidinggevende.", meaningZh: "我和我的主管商量。", meaningEn: "I consult my supervisor.", type: "scenario", phraseChunkUsed: "met mijn leidinggevende overleggen", scenarioTags: ["work"] },
    proeftijd: { dutch: "Mijn proeftijd duurt een maand.", meaningZh: "我的试用期持续一个月。", meaningEn: "My probation period lasts one month.", type: "scenario", phraseChunkUsed: "mijn proeftijd duurt", scenarioTags: ["work"] },
    mening: { dutch: "Ik geef mijn mening in de vergadering.", meaningZh: "我在会议上表达我的意见。", meaningEn: "I give my opinion in the meeting.", type: "output", phraseChunkUsed: "mijn mening geven", scenarioTags: ["opinion", "work"] },
    standpunt: { dutch: "Ik leg mijn standpunt rustig uit.", meaningZh: "我平静地解释我的立场。", meaningEn: "I calmly explain my point of view.", type: "output", phraseChunkUsed: "mijn standpunt uitleggen", scenarioTags: ["opinion", "speaking"] },
    reden: { dutch: "Ik geef een duidelijke reden.", meaningZh: "我给出一个清楚的理由。", meaningEn: "I give a clear reason.", type: "output", phraseChunkUsed: "een reden geven", scenarioTags: ["opinion", "writing"] },
    voordeel: { dutch: "Dit voordeel vind ik belangrijk.", meaningZh: "我觉得这个优点很重要。", meaningEn: "I find this advantage important.", type: "output", phraseChunkUsed: "een voordeel belangrijk vinden", scenarioTags: ["opinion"] },
    nadeel: { dutch: "Een nadeel is dat het veel tijd kost.", meaningZh: "一个缺点是它花很多时间。", meaningEn: "A disadvantage is that it takes a lot of time.", type: "output", phraseChunkUsed: "een nadeel is dat", scenarioTags: ["opinion"] },
    oplossing: { dutch: "Ik zoek samen met u naar een oplossing.", meaningZh: "我和您一起找解决方案。", meaningEn: "I look for a solution together with you.", type: "output", phraseChunkUsed: "naar een oplossing zoeken", scenarioTags: ["help", "complaint"] },
    voorstel: { dutch: "Ik doe een voorstel.", meaningZh: "我提出一个建议。", meaningEn: "I make a proposal.", type: "output", phraseChunkUsed: "een voorstel doen", scenarioTags: ["opinion", "work"] },
    verandering: { dutch: "Deze verandering heeft gevolgen voor mijn werk.", meaningZh: "这个变化会影响我的工作。", meaningEn: "This change has consequences for my work.", type: "scenario", phraseChunkUsed: "een verandering heeft gevolgen", scenarioTags: ["work", "society"] },
    discussie: { dutch: "We voeren een discussie over de oplossing.", meaningZh: "我们就解决方案进行讨论。", meaningEn: "We have a discussion about the solution.", type: "scenario", phraseChunkUsed: "een discussie voeren", scenarioTags: ["opinion", "work"] },
    argument: { dutch: "Ik geef een argument voor mijn mening.", meaningZh: "我给出一个支持我意见的论点。", meaningEn: "I give an argument for my opinion.", type: "output", phraseChunkUsed: "een argument geven", scenarioTags: ["opinion", "writing"] },
    aanhef: { dutch: "Ik begin de brief met een nette aanhef.", meaningZh: "我用得体的称呼开始这封信。", meaningEn: "I start the letter with a proper salutation.", type: "scenario", phraseChunkUsed: "een nette aanhef", scenarioTags: ["email", "writing"] },
    afsluiting: { dutch: "Ik schrijf een vriendelijke afsluiting.", meaningZh: "我写一个友好的结尾。", meaningEn: "I write a friendly closing.", type: "scenario", phraseChunkUsed: "een afsluiting schrijven", scenarioTags: ["email", "writing"] },
    betreft: { dutch: "Betreft: mijn aanvraag voor huurtoeslag.", meaningZh: "主题：我的房租补贴申请。", meaningEn: "Subject: my application for rent benefit.", type: "output", phraseChunkUsed: "betreft mijn aanvraag", scenarioTags: ["email", "writing", "admin"] },
    groet: { dutch: "Ik sluit de e-mail af met een groet.", meaningZh: "我用问候语结束邮件。", meaningEn: "I close the email with a greeting.", type: "scenario", phraseChunkUsed: "met een groet afsluiten", scenarioTags: ["email", "writing"] },
    uitnodiging: { dutch: "Ik krijg een uitnodiging voor het gesprek.", meaningZh: "我收到面试/谈话邀请。", meaningEn: "I receive an invitation for the interview.", type: "scenario", phraseChunkUsed: "een uitnodiging krijgen", scenarioTags: ["work", "email"] },
    verklaring: { dutch: "Ik stuur de verklaring naar de gemeente.", meaningZh: "我把声明/证明发给市政厅。", meaningEn: "I send the statement to the municipality.", type: "scenario", phraseChunkUsed: "de verklaring sturen", scenarioTags: ["admin", "gemeente"] },
    verzoek: { dutch: "Ik stuur u een verzoek om informatie.", meaningZh: "我向您发送一个索取信息的请求。", meaningEn: "I send you a request for information.", type: "output", phraseChunkUsed: "een verzoek om informatie", scenarioTags: ["email", "writing"] },
    onderwerp: { dutch: "Het onderwerp van mijn e-mail is duidelijk.", meaningZh: "我的邮件主题很清楚。", meaningEn: "The subject of my email is clear.", type: "scenario", phraseChunkUsed: "het onderwerp van mijn e-mail", scenarioTags: ["email", "writing"] },
    reactie: { dutch: "Ik wacht op uw reactie.", meaningZh: "我等待您的回复。", meaningEn: "I wait for your response.", type: "output", phraseChunkUsed: "op uw reactie wachten", scenarioTags: ["email", "writing"] },
    gebeurtenis: { dutch: "Ik beschrijf de gebeurtenis in mijn brief.", meaningZh: "我在信里描述这件事。", meaningEn: "I describe the event in my letter.", type: "scenario", phraseChunkUsed: "een gebeurtenis beschrijven", scenarioTags: ["writing"] },
    regel: { dutch: "Ik lees de regel goed.", meaningZh: "我仔细读这条规则。", meaningEn: "I read the rule carefully.", type: "scenario", phraseChunkUsed: "de regel lezen", scenarioTags: ["admin", "safety"] },
    voorkeur: { dutch: "Mijn voorkeur is een afspraak in de ochtend.", meaningZh: "我更希望预约在上午。", meaningEn: "My preference is an appointment in the morning.", type: "output", phraseChunkUsed: "mijn voorkeur is", scenarioTags: ["appointment", "opinion"] },
    uitgaven: { dutch: "Ik houd mijn uitgaven per maand bij.", meaningZh: "我记录每月支出。", meaningEn: "I keep track of my monthly expenses.", type: "scenario", phraseChunkUsed: "uitgaven bijhouden", scenarioTags: ["payment", "budget"] },
    account: { dutch: "Ik maak een account aan op de website.", meaningZh: "我在网站上创建账号。", meaningEn: "I create an account on the website.", type: "scenario", phraseChunkUsed: "een account aanmaken", scenarioTags: ["digital"] },
    belasting: { dutch: "Ik betaal belasting over mijn inkomen.", meaningZh: "我为我的收入缴税。", meaningEn: "I pay tax on my income.", type: "scenario", phraseChunkUsed: "belasting betalen", scenarioTags: ["admin", "payment"] },
    vergunning: { dutch: "Ik vraag een vergunning aan bij de gemeente.", meaningZh: "我向市政厅申请许可证。", meaningEn: "I apply for a permit at the municipality.", type: "scenario", phraseChunkUsed: "een vergunning aanvragen", scenarioTags: ["gemeente", "admin"] },
    bedrijfsarts: { dutch: "Ik maak een afspraak met de bedrijfsarts.", meaningZh: "我和职业医生预约。", meaningEn: "I make an appointment with the occupational doctor.", type: "scenario", phraseChunkUsed: "afspraak met de bedrijfsarts", scenarioTags: ["work", "health"] },
    maatschappij: { dutch: "De maatschappij verandert snel.", meaningZh: "社会变化很快。", meaningEn: "Society is changing quickly.", type: "scenario", phraseChunkUsed: "de maatschappij verandert", scenarioTags: ["society"] },
    samenleving: { dutch: "In de samenleving helpen mensen elkaar.", meaningZh: "在社会中，人们互相帮助。", meaningEn: "In society, people help each other.", type: "scenario", phraseChunkUsed: "in de samenleving", scenarioTags: ["society"] },
    nieuws: { dutch: "Ik lees het nieuws online.", meaningZh: "我在线读新闻。", meaningEn: "I read the news online.", type: "scenario", phraseChunkUsed: "het nieuws lezen", scenarioTags: ["society", "digital"] },
    krant: { dutch: "Ik lees de krant in de ochtend.", meaningZh: "我早上读报纸。", meaningEn: "I read the newspaper in the morning.", type: "scenario", phraseChunkUsed: "de krant lezen", scenarioTags: ["society"] },
    artikel: { dutch: "Ik lees een artikel over de gemeente.", meaningZh: "我读一篇关于市政厅的文章。", meaningEn: "I read an article about the municipality.", type: "scenario", phraseChunkUsed: "een artikel lezen", scenarioTags: ["society", "gemeente"] },
    overheid: { dutch: "De overheid stuurt een brief.", meaningZh: "政府寄来一封信。", meaningEn: "The government sends a letter.", type: "scenario", phraseChunkUsed: "de overheid stuurt", scenarioTags: ["society", "admin"] },
    burger: { dutch: "Elke burger heeft rechten en plichten.", meaningZh: "每个公民都有权利和义务。", meaningEn: "Every citizen has rights and duties.", type: "scenario", phraseChunkUsed: "rechten en plichten", scenarioTags: ["society"] },
    verkiezing: { dutch: "De verkiezing is volgende week.", meaningZh: "选举在下周。", meaningEn: "The election is next week.", type: "scenario", phraseChunkUsed: "de verkiezing is", scenarioTags: ["society"] },
    evenement: { dutch: "Het evenement begint om acht uur.", meaningZh: "活动八点开始。", meaningEn: "The event starts at eight o'clock.", type: "scenario", phraseChunkUsed: "het evenement begint", scenarioTags: ["society", "time"] },
    verhaal: { dutch: "Ik vertel mijn verhaal rustig.", meaningZh: "我平静地讲述我的经历。", meaningEn: "I tell my story calmly.", type: "output", phraseChunkUsed: "mijn verhaal vertellen", scenarioTags: ["speaking"] },
    ervaring: { dutch: "Ik heb ervaring met klantcontact.", meaningZh: "我有客户沟通经验。", meaningEn: "I have experience with customer contact.", type: "output", phraseChunkUsed: "ervaring met klantcontact", scenarioTags: ["work"] },
    planning: { dutch: "Ik stem de planning af met mijn team.", meaningZh: "我和团队协调计划。", meaningEn: "I coordinate the planning with my team.", type: "scenario", phraseChunkUsed: "de planning afstemmen", scenarioTags: ["work", "planning"] },
  };

  const transportVehicles = new Set(["bus", "tram", "metro", "trein", "taxi", "boot", "vliegtuig"]);
  const privateTransport = new Set(["fiets", "auto"]);
  const transportTimeNouns = new Set(["aankomsttijd", "vertrektijd"]);
  const transportDurationNouns = new Set(["reis", "overstap"]);
  const transportInfoNouns: Record<string, TemplateExample> = {
    dienstregeling: { dutch: "De dienstregeling is vandaag aangepast.", meaningZh: "今天的时刻表调整了。", meaningEn: "The timetable has been changed today.", type: "scenario", phraseChunkUsed: "de dienstregeling is aangepast", scenarioTags: ["transport"] },
    reisinformatie: { dutch: "Ik lees de reisinformatie in de app.", meaningZh: "我在应用里读出行信息。", meaningEn: "I read the travel information in the app.", type: "scenario", phraseChunkUsed: "reisinformatie lezen", scenarioTags: ["transport", "digital"] },
    reisplanner: { dutch: "De reisplanner geeft een andere route.", meaningZh: "行程规划器给出另一条路线。", meaningEn: "The travel planner gives another route.", type: "scenario", phraseChunkUsed: "de reisplanner gebruiken", scenarioTags: ["transport", "digital"] },
  };
  const transportProblemNouns: Record<string, TemplateExample> = {
    vertraging: { dutch: "De trein heeft vertraging.", meaningZh: "火车晚点。", meaningEn: "The train is delayed.", type: "scenario", phraseChunkUsed: "vertraging hebben", scenarioTags: ["transport"] },
    uitval: { dutch: "Er is uitval op deze lijn.", meaningZh: "这条线路有停运。", meaningEn: "There is a cancellation on this line.", type: "scenario", phraseChunkUsed: "uitval op deze lijn", scenarioTags: ["transport"] },
    omleiding: { dutch: "Er is een omleiding.", meaningZh: "有改道。", meaningEn: "There is a diversion.", type: "scenario", phraseChunkUsed: "een omleiding", scenarioTags: ["transport"] },
    "vervangend vervoer": { dutch: "Er is vervangend vervoer.", meaningZh: "有替代交通。", meaningEn: "There is replacement transport.", type: "scenario", phraseChunkUsed: "vervangend vervoer", scenarioTags: ["transport"] },
  };
  const ticketNouns: Record<string, TemplateExample> = {
    kaartje: { dutch: "Ik koop een kaartje.", meaningZh: "我买一张票。", meaningEn: "I buy a ticket.", type: "scenario", phraseChunkUsed: "een kaartje kopen", scenarioTags: ["transport", "payment"] },
    "ov-chipkaart": { dutch: "Ik laad mijn ov-chipkaart op.", meaningZh: "我给我的 OV 交通卡充值。", meaningEn: "I top up my OV-chipkaart.", type: "scenario", phraseChunkUsed: "ov-chipkaart opladen", scenarioTags: ["transport", "payment"] },
    abonnement: { dutch: "Ik heb een abonnement nodig.", meaningZh: "我需要一份订阅/通票。", meaningEn: "I need a subscription/pass.", type: "scenario", phraseChunkUsed: "een abonnement nodig hebben", scenarioTags: ["transport", "payment"] },
    boete: { dutch: "Ik krijg een boete.", meaningZh: "我收到一张罚单。", meaningEn: "I get a fine.", type: "scenario", phraseChunkUsed: "een boete krijgen", scenarioTags: ["transport"] },
  };
  const routeNouns: Record<string, TemplateExample> = {
    route: { dutch: "Welke route moet ik nemen?", meaningZh: "我应该走哪条路线？", meaningEn: "Which route should I take?", type: "output", phraseChunkUsed: "welke route nemen", scenarioTags: ["transport", "directions"] },
    spoor: { dutch: "Van welk spoor vertrekt de trein?", meaningZh: "火车从几号站台/轨道出发？", meaningEn: "From which platform does the train depart?", type: "output", phraseChunkUsed: "welk spoor", scenarioTags: ["transport"] },
    perron: { dutch: "De trein vertrekt van perron twee.", meaningZh: "火车从二号站台出发。", meaningEn: "The train departs from platform two.", type: "scenario", phraseChunkUsed: "van perron twee", scenarioTags: ["transport"] },
    halte: { dutch: "Ik stap uit bij de halte.", meaningZh: "我在这个站下车。", meaningEn: "I get off at the stop.", type: "scenario", phraseChunkUsed: "bij de halte uitstappen", scenarioTags: ["transport"] },
  };
  const personRoleNouns: Record<string, TemplateExample> = {
    klant: { dutch: "De klant betaalt aan de kassa.", meaningZh: "顾客在收银台付款。", meaningEn: "The customer pays at the checkout.", type: "scenario", phraseChunkUsed: "de klant betaalt", scenarioTags: ["payment", "supermarket"] },
    medewerker: { dutch: "De medewerker helpt mij.", meaningZh: "工作人员帮助我。", meaningEn: "The employee helps me.", type: "scenario", phraseChunkUsed: "de medewerker helpt", scenarioTags: ["work", "help"] },
    verkoper: { dutch: "De verkoper helpt mij.", meaningZh: "售货员帮助我。", meaningEn: "The seller helps me.", type: "scenario", phraseChunkUsed: "de verkoper helpt", scenarioTags: ["supermarket"] },
    conducteur: { dutch: "De conducteur controleert het kaartje.", meaningZh: "列车员检查车票。", meaningEn: "The conductor checks the ticket.", type: "scenario", phraseChunkUsed: "het kaartje controleren", scenarioTags: ["transport"] },
  };
  const documentNouns: Record<string, TemplateExample> = {
    aanvraag: { dutch: "Ik dien een aanvraag in.", meaningZh: "我提交一份申请。", meaningEn: "I submit an application.", type: "scenario", phraseChunkUsed: "een aanvraag indienen", scenarioTags: ["gemeente", "form"] },
    inschrijving: { dutch: "Ik regel mijn inschrijving.", meaningZh: "我办理我的登记。", meaningEn: "I arrange my registration.", type: "scenario", phraseChunkUsed: "mijn inschrijving regelen", scenarioTags: ["gemeente", "form"] },
    uittreksel: { dutch: "Ik vraag een uittreksel aan.", meaningZh: "我申请一份摘录/证明。", meaningEn: "I request an extract.", type: "scenario", phraseChunkUsed: "een uittreksel aanvragen", scenarioTags: ["gemeente", "form"] },
    bewijs: { dutch: "Ik heb een bewijs nodig.", meaningZh: "我需要一份证明。", meaningEn: "I need proof.", type: "scenario", phraseChunkUsed: "een bewijs nodig hebben", scenarioTags: ["gemeente", "form"] },
    paspoort: { dutch: "Ik neem mijn paspoort mee.", meaningZh: "我带上我的护照。", meaningEn: "I take my passport with me.", type: "scenario", phraseChunkUsed: "paspoort meenemen", scenarioTags: ["gemeente", "travel"] },
    rijbewijs: { dutch: "Ik neem mijn rijbewijs mee.", meaningZh: "我带上我的驾照。", meaningEn: "I take my driving licence with me.", type: "scenario", phraseChunkUsed: "rijbewijs meenemen", scenarioTags: ["gemeente", "travel"] },
    afspraakbevestiging: { dutch: "Ik toon mijn afspraakbevestiging.", meaningZh: "我出示我的预约确认。", meaningEn: "I show my appointment confirmation.", type: "scenario", phraseChunkUsed: "afspraakbevestiging tonen", scenarioTags: ["gemeente", "form"] },
  };
  const healthNouns: Record<string, TemplateExample> = {
    afspraak: { dutch: "Ik maak een afspraak.", meaningZh: "我预约。", meaningEn: "I make an appointment.", type: "output", phraseChunkUsed: "een afspraak maken", scenarioTags: ["health", "phone-call"] },
    recept: { dutch: "Ik haal mijn recept op.", meaningZh: "我去取我的处方。", meaningEn: "I pick up my prescription.", type: "scenario", phraseChunkUsed: "recept ophalen", scenarioTags: ["health"] },
    tablet: { dutch: "Ik neem de tablet in.", meaningZh: "我服用这片药。", meaningEn: "I take the tablet.", type: "scenario", phraseChunkUsed: "de tablet innemen", scenarioTags: ["health"] },
    zalf: { dutch: "Ik smeer de zalf op mijn arm.", meaningZh: "我把药膏涂在手臂上。", meaningEn: "I put the ointment on my arm.", type: "scenario", phraseChunkUsed: "zalf smeren", scenarioTags: ["health"] },
    druppels: { dutch: "Ik gebruik de druppels.", meaningZh: "我使用滴剂。", meaningEn: "I use the drops.", type: "scenario", phraseChunkUsed: "druppels gebruiken", scenarioTags: ["health"] },
    paracetamol: { dutch: "Ik neem paracetamol.", meaningZh: "我服用扑热息痛。", meaningEn: "I take paracetamol.", type: "scenario", phraseChunkUsed: "paracetamol nemen", scenarioTags: ["health"] },
  };
  const familyNouns: Record<string, TemplateExample> = {
    moeder: { dutch: "Mijn moeder is thuis.", meaningZh: "我妈妈在家。", meaningEn: "My mother is at home.", type: "minimal", phraseChunkUsed: "mijn moeder", scenarioTags: ["family"] },
    vader: { dutch: "Mijn vader is thuis.", meaningZh: "我爸爸在家。", meaningEn: "My father is at home.", type: "minimal", phraseChunkUsed: "mijn vader", scenarioTags: ["family"] },
    ouders: { dutch: "Mijn ouders wonen hier.", meaningZh: "我父母住在这里。", meaningEn: "My parents live here.", type: "minimal", phraseChunkUsed: "mijn ouders", scenarioTags: ["family"] },
    broer: { dutch: "Mijn broer komt vandaag.", meaningZh: "我兄弟今天来。", meaningEn: "My brother is coming today.", type: "minimal", phraseChunkUsed: "mijn broer", scenarioTags: ["family"] },
    zus: { dutch: "Mijn zus komt vandaag.", meaningZh: "我姐妹今天来。", meaningEn: "My sister is coming today.", type: "minimal", phraseChunkUsed: "mijn zus", scenarioTags: ["family"] },
    zoon: { dutch: "Mijn zoon is op school.", meaningZh: "我儿子在学校。", meaningEn: "My son is at school.", type: "scenario", phraseChunkUsed: "mijn zoon", scenarioTags: ["family", "school"] },
    dochter: { dutch: "Mijn dochter is op school.", meaningZh: "我女儿在学校。", meaningEn: "My daughter is at school.", type: "scenario", phraseChunkUsed: "mijn dochter", scenarioTags: ["family", "school"] },
    partner: { dutch: "Mijn partner werkt vandaag.", meaningZh: "我的伴侣今天工作。", meaningEn: "My partner works today.", type: "scenario", phraseChunkUsed: "mijn partner", scenarioTags: ["family", "work"] },
    opa: { dutch: "Mijn opa woont dichtbij.", meaningZh: "我爷爷/外公住得近。", meaningEn: "My grandfather lives nearby.", type: "scenario", phraseChunkUsed: "mijn opa", scenarioTags: ["family"] },
    oma: { dutch: "Mijn oma woont dichtbij.", meaningZh: "我奶奶/外婆住得近。", meaningEn: "My grandmother lives nearby.", type: "scenario", phraseChunkUsed: "mijn oma", scenarioTags: ["family"] },
  };
  const peopleNouns: Record<string, TemplateExample> = {
    persoon: { dutch: "Deze persoon helpt mij.", meaningZh: "这个人帮助我。", meaningEn: "This person helps me.", type: "scenario", phraseChunkUsed: "deze persoon", scenarioTags: ["identity", "help"] },
    vriend: { dutch: "Mijn vriend komt vandaag.", meaningZh: "我的朋友今天来。", meaningEn: "My friend is coming today.", type: "minimal", phraseChunkUsed: "mijn vriend", scenarioTags: ["identity"] },
    vriendin: { dutch: "Mijn vriendin komt vandaag.", meaningZh: "我的女性朋友/女友今天来。", meaningEn: "My female friend/girlfriend is coming today.", type: "minimal", phraseChunkUsed: "mijn vriendin", scenarioTags: ["identity"] },
    baby: { dutch: "De baby slaapt.", meaningZh: "婴儿在睡觉。", meaningEn: "The baby is sleeping.", type: "minimal", phraseChunkUsed: "de baby slaapt", scenarioTags: ["family"] },
    meisje: { dutch: "Het meisje speelt.", meaningZh: "女孩在玩。", meaningEn: "The girl is playing.", type: "minimal", phraseChunkUsed: "het meisje speelt", scenarioTags: ["family"] },
    jongen: { dutch: "De jongen speelt.", meaningZh: "男孩在玩。", meaningEn: "The boy is playing.", type: "minimal", phraseChunkUsed: "de jongen speelt", scenarioTags: ["family"] },
    buurman: { dutch: "Mijn buurman is thuis.", meaningZh: "我的男邻居在家。", meaningEn: "My male neighbor is at home.", type: "scenario", phraseChunkUsed: "mijn buurman", scenarioTags: ["housing"] },
    buurvrouw: { dutch: "Mijn buurvrouw is thuis.", meaningZh: "我的女邻居在家。", meaningEn: "My female neighbor is at home.", type: "scenario", phraseChunkUsed: "mijn buurvrouw", scenarioTags: ["housing"] },
    buur: { dutch: "Mijn buur helpt mij.", meaningZh: "我的邻居帮助我。", meaningEn: "My neighbor helps me.", type: "scenario", phraseChunkUsed: "mijn buur", scenarioTags: ["housing", "help"] },
    mevrouw: { dutch: "Goedemorgen, mevrouw.", meaningZh: "早上好，女士。", meaningEn: "Good morning, madam.", type: "output", phraseChunkUsed: "mevrouw", scenarioTags: ["greeting"] },
    meneer: { dutch: "Goedemorgen, meneer.", meaningZh: "早上好，先生。", meaningEn: "Good morning, sir.", type: "output", phraseChunkUsed: "meneer", scenarioTags: ["greeting"] },
    tolk: { dutch: "Ik heb een tolk nodig.", meaningZh: "我需要一名口译员。", meaningEn: "I need an interpreter.", type: "scenario", phraseChunkUsed: "een tolk nodig hebben", scenarioTags: ["languages", "help"] },
  };
  const basicObjectNouns: Record<string, TemplateExample> = {
    naamkaartje: { dutch: "Ik draag een naamkaartje.", meaningZh: "我戴着名牌。", meaningEn: "I wear a name tag.", type: "scenario", phraseChunkUsed: "een naamkaartje dragen", scenarioTags: ["identity"] },
    bril: { dutch: "Ik draag een bril.", meaningZh: "我戴眼镜。", meaningEn: "I wear glasses.", type: "minimal", phraseChunkUsed: "een bril dragen", scenarioTags: ["daily"] },
    schrift: { dutch: "Ik schrijf in mijn schrift.", meaningZh: "我写在我的本子里。", meaningEn: "I write in my notebook.", type: "scenario", phraseChunkUsed: "in mijn schrift schrijven", scenarioTags: ["school"] },
    app: { dutch: "Ik open de app.", meaningZh: "我打开应用。", meaningEn: "I open the app.", type: "scenario", phraseChunkUsed: "de app openen", scenarioTags: ["digital"] },
    foto: { dutch: "Ik maak een foto.", meaningZh: "我拍一张照片。", meaningEn: "I take a photo.", type: "scenario", phraseChunkUsed: "een foto maken", scenarioTags: ["daily"] },
    papier: { dutch: "Ik schrijf op papier.", meaningZh: "我写在纸上。", meaningEn: "I write on paper.", type: "scenario", phraseChunkUsed: "op papier schrijven", scenarioTags: ["school", "form"] },
    potlood: { dutch: "Ik schrijf met een potlood.", meaningZh: "我用铅笔写。", meaningEn: "I write with a pencil.", type: "scenario", phraseChunkUsed: "met een potlood schrijven", scenarioTags: ["school"] },
    computer: { dutch: "Ik werk op de computer.", meaningZh: "我在电脑上工作。", meaningEn: "I work on the computer.", type: "scenario", phraseChunkUsed: "op de computer werken", scenarioTags: ["work", "digital"] },
    laptop: { dutch: "Ik werk op mijn laptop.", meaningZh: "我在笔记本电脑上工作。", meaningEn: "I work on my laptop.", type: "scenario", phraseChunkUsed: "op mijn laptop werken", scenarioTags: ["work", "digital"] },
    sleutel: { dutch: "Ik heb mijn sleutel bij me.", meaningZh: "我带着我的钥匙。", meaningEn: "I have my key with me.", type: "scenario", phraseChunkUsed: "mijn sleutel bij me hebben", scenarioTags: ["housing"] },
    printer: { dutch: "Ik gebruik de printer.", meaningZh: "我使用打印机。", meaningEn: "I use the printer.", type: "scenario", phraseChunkUsed: "de printer gebruiken", scenarioTags: ["work", "digital"] },
    stempel: { dutch: "Ik zet een stempel.", meaningZh: "我盖一个印章。", meaningEn: "I stamp it.", type: "scenario", phraseChunkUsed: "een stempel zetten", scenarioTags: ["form"] },
    mapje: { dutch: "Ik doe de papieren in het mapje.", meaningZh: "我把文件放进文件夹。", meaningEn: "I put the papers in the folder.", type: "scenario", phraseChunkUsed: "in het mapje doen", scenarioTags: ["form"] },
    balpen: { dutch: "Ik schrijf met een balpen.", meaningZh: "我用圆珠笔写。", meaningEn: "I write with a ballpoint pen.", type: "scenario", phraseChunkUsed: "met een balpen schrijven", scenarioTags: ["form"] },
    bureau: { dutch: "Ik zit aan het bureau.", meaningZh: "我坐在书桌旁。", meaningEn: "I sit at the desk.", type: "scenario", phraseChunkUsed: "aan het bureau zitten", scenarioTags: ["work"] },
    vergadering: { dutch: "Ik heb een vergadering.", meaningZh: "我有一个会议。", meaningEn: "I have a meeting.", type: "scenario", phraseChunkUsed: "een vergadering hebben", scenarioTags: ["work"] },
    voorbeeld: { dutch: "Ik kijk naar het voorbeeld.", meaningZh: "我看这个例子。", meaningEn: "I look at the example.", type: "scenario", phraseChunkUsed: "naar het voorbeeld kijken", scenarioTags: ["school", "form"] },
    foutje: { dutch: "Ik maak een foutje.", meaningZh: "我犯了一个小错误。", meaningEn: "I make a small mistake.", type: "scenario", phraseChunkUsed: "een foutje maken", scenarioTags: ["school"] },
  };
  const roomNouns: Record<string, TemplateExample> = {
    keuken: { dutch: "Ik kook in de keuken.", meaningZh: "我在厨房做饭。", meaningEn: "I cook in the kitchen.", type: "scenario", phraseChunkUsed: "in de keuken koken", scenarioTags: ["home", "food"] },
    badkamer: { dutch: "Ik douche in de badkamer.", meaningZh: "我在浴室洗澡。", meaningEn: "I shower in the bathroom.", type: "scenario", phraseChunkUsed: "in de badkamer douchen", scenarioTags: ["home"] },
    slaapkamer: { dutch: "Ik slaap in de slaapkamer.", meaningZh: "我在卧室睡觉。", meaningEn: "I sleep in the bedroom.", type: "scenario", phraseChunkUsed: "in de slaapkamer slapen", scenarioTags: ["home"] },
    woonkamer: { dutch: "Ik zit in de woonkamer.", meaningZh: "我坐在客厅里。", meaningEn: "I sit in the living room.", type: "scenario", phraseChunkUsed: "in de woonkamer zitten", scenarioTags: ["home"] },
    hal: { dutch: "Ik wacht in de hal.", meaningZh: "我在门厅等。", meaningEn: "I wait in the hallway.", type: "scenario", phraseChunkUsed: "in de hal wachten", scenarioTags: ["home"] },
    zolder: { dutch: "De doos staat op zolder.", meaningZh: "盒子在阁楼上。", meaningEn: "The box is in the attic.", type: "scenario", phraseChunkUsed: "op zolder staan", scenarioTags: ["home"] },
    kelder: { dutch: "De fiets staat in de kelder.", meaningZh: "自行车在地下室。", meaningEn: "The bike is in the basement.", type: "scenario", phraseChunkUsed: "in de kelder staan", scenarioTags: ["home"] },
    balkon: { dutch: "Ik zit op het balkon.", meaningZh: "我坐在阳台上。", meaningEn: "I sit on the balcony.", type: "scenario", phraseChunkUsed: "op het balkon zitten", scenarioTags: ["home"] },
    gang: { dutch: "Ik loop door de gang.", meaningZh: "我穿过走廊。", meaningEn: "I walk through the corridor.", type: "scenario", phraseChunkUsed: "door de gang lopen", scenarioTags: ["home"] },
    wc: { dutch: "Waar is de wc?", meaningZh: "厕所在哪里？", meaningEn: "Where is the toilet?", type: "output", phraseChunkUsed: "waar is de wc", scenarioTags: ["home", "directions"] },
  };
  const homeObjectNouns: Record<string, TemplateExample> = {
    raam: { dutch: "Het raam is open.", meaningZh: "窗户开着。", meaningEn: "The window is open.", type: "scenario", phraseChunkUsed: "het raam is open", scenarioTags: ["home"] },
    vloer: { dutch: "Ik maak de vloer schoon.", meaningZh: "我打扫地板。", meaningEn: "I clean the floor.", type: "scenario", phraseChunkUsed: "de vloer schoonmaken", scenarioTags: ["home"] },
    muur: { dutch: "De lamp hangt aan de muur.", meaningZh: "灯挂在墙上。", meaningEn: "The lamp hangs on the wall.", type: "scenario", phraseChunkUsed: "aan de muur", scenarioTags: ["home"] },
    tuin: { dutch: "Ik zit in de tuin.", meaningZh: "我坐在花园里。", meaningEn: "I sit in the garden.", type: "scenario", phraseChunkUsed: "in de tuin zitten", scenarioTags: ["home"] },
    trap: { dutch: "Ik loop de trap op.", meaningZh: "我上楼梯。", meaningEn: "I walk up the stairs.", type: "scenario", phraseChunkUsed: "de trap op lopen", scenarioTags: ["home"] },
    dak: { dutch: "Het dak lekt.", meaningZh: "屋顶漏水。", meaningEn: "The roof is leaking.", type: "scenario", phraseChunkUsed: "het dak lekt", scenarioTags: ["housing"] },
    bed: { dutch: "Ik slaap in het bed.", meaningZh: "我睡在床上。", meaningEn: "I sleep in the bed.", type: "scenario", phraseChunkUsed: "in het bed slapen", scenarioTags: ["home"] },
    bank: { dutch: "Ik zit op de bank.", meaningZh: "我坐在沙发上。", meaningEn: "I sit on the sofa.", type: "scenario", phraseChunkUsed: "op de bank zitten", scenarioTags: ["home"] },
    kast: { dutch: "De jas hangt in de kast.", meaningZh: "外套挂在柜子里。", meaningEn: "The coat hangs in the closet.", type: "scenario", phraseChunkUsed: "in de kast hangen", scenarioTags: ["home", "clothes"] },
    lamp: { dutch: "Ik doe de lamp aan.", meaningZh: "我开灯。", meaningEn: "I turn on the lamp.", type: "scenario", phraseChunkUsed: "de lamp aandoen", scenarioTags: ["home"] },
    gordijn: { dutch: "Ik doe het gordijn dicht.", meaningZh: "我把窗帘拉上。", meaningEn: "I close the curtain.", type: "scenario", phraseChunkUsed: "het gordijn dichtdoen", scenarioTags: ["home"] },
    deken: { dutch: "Ik pak een deken.", meaningZh: "我拿一条毯子。", meaningEn: "I take a blanket.", type: "scenario", phraseChunkUsed: "een deken pakken", scenarioTags: ["home"] },
    kussen: { dutch: "Het kussen ligt op het bed.", meaningZh: "枕头在床上。", meaningEn: "The pillow is on the bed.", type: "scenario", phraseChunkUsed: "op het bed liggen", scenarioTags: ["home"] },
    spiegel: { dutch: "Ik kijk in de spiegel.", meaningZh: "我照镜子。", meaningEn: "I look in the mirror.", type: "scenario", phraseChunkUsed: "in de spiegel kijken", scenarioTags: ["home"] },
    kraan: { dutch: "Ik draai de kraan open.", meaningZh: "我打开水龙头。", meaningEn: "I turn on the tap.", type: "scenario", phraseChunkUsed: "de kraan opendraaien", scenarioTags: ["home"] },
    koelkast: { dutch: "De melk staat in de koelkast.", meaningZh: "牛奶在冰箱里。", meaningEn: "The milk is in the fridge.", type: "scenario", phraseChunkUsed: "in de koelkast staan", scenarioTags: ["home", "food"] },
    oven: { dutch: "De oven is warm.", meaningZh: "烤箱是热的。", meaningEn: "The oven is warm.", type: "scenario", phraseChunkUsed: "de oven is warm", scenarioTags: ["home", "food"] },
  };
  const foodNouns = new Set(["brood", "kaas", "rijst", "kip", "vis", "soep", "salade", "vlees", "rundvlees", "varkensvlees", "groente", "pasta", "noedel", "suiker", "zout", "peper", "fruit"]);
  const countFoodNouns = new Set(["appel", "aardappel", "sinaasappel", "banaan", "ei", "tomaat", "komkommer", "wortel", "ui", "paprika", "boon", "peer", "druif", "aardbei", "citroen", "meloen", "perzik"]);
  const drinkNouns = new Set(["water", "melk", "koffie", "thee", "appelsap", "sap", "sinaasappelsap", "frisdrank", "bier", "wijn", "sojamelk", "kraanwater", "mineraalwater"]);
  const clothingNouns = new Set(["shirt", "jurk", "rok", "muts", "hemd", "blouse", "riem", "pet", "sjaal", "handschoen", "laars", "pantoffel", "pyjama", "ondergoed"]);
  const bodyPartNouns = new Set(["arm", "been", "hoofd", "buik", "hand", "voet", "rug", "keel", "oor", "neus", "mond", "tand", "oog", "gezicht", "haar", "vinger", "teen", "knie", "schouder", "nek", "borst", "hart", "maag", "huid", "lichaam"]);
  const tablewareNouns = new Set(["bord", "glas", "beker", "kop", "mes", "vork", "lepel", "pan", "pot", "bak", "bordje", "servet", "tafelkleed", "zeep", "handdoek", "vuilniszak"]);
  const weatherNouns: Record<string, TemplateExample> = {
    weer: { dutch: "Het weer is mooi.", meaningZh: "天气很好。", meaningEn: "The weather is nice.", type: "scenario", phraseChunkUsed: "het weer", scenarioTags: ["weather"] },
    zon: { dutch: "De zon schijnt.", meaningZh: "太阳在照耀。", meaningEn: "The sun is shining.", type: "scenario", phraseChunkUsed: "de zon schijnt", scenarioTags: ["weather"] },
    regen: { dutch: "Er is regen.", meaningZh: "有雨。", meaningEn: "There is rain.", type: "scenario", phraseChunkUsed: "regen", scenarioTags: ["weather"] },
    wind: { dutch: "Er is veel wind.", meaningZh: "风很大。", meaningEn: "There is a lot of wind.", type: "scenario", phraseChunkUsed: "veel wind", scenarioTags: ["weather"] },
    sneeuw: { dutch: "Er is sneeuw.", meaningZh: "有雪。", meaningEn: "There is snow.", type: "scenario", phraseChunkUsed: "sneeuw", scenarioTags: ["weather"] },
  };
  const schoolWorkNouns: Record<string, TemplateExample> = {
    les: { dutch: "De les begint om negen uur.", meaningZh: "课九点开始。", meaningEn: "The lesson starts at nine o'clock.", type: "scenario", phraseChunkUsed: "de les begint", scenarioTags: ["school", "time"] },
    docent: { dutch: "De docent legt de les uit.", meaningZh: "老师讲解课程。", meaningEn: "The teacher explains the lesson.", type: "scenario", phraseChunkUsed: "de docent legt uit", scenarioTags: ["school"] },
    cursus: { dutch: "Ik volg een cursus.", meaningZh: "我上一门课程。", meaningEn: "I take a course.", type: "scenario", phraseChunkUsed: "een cursus volgen", scenarioTags: ["school"] },
    baan: { dutch: "Ik heb een baan.", meaningZh: "我有一份工作。", meaningEn: "I have a job.", type: "scenario", phraseChunkUsed: "een baan hebben", scenarioTags: ["work"] },
    pauze: { dutch: "Ik heb pauze.", meaningZh: "我在休息。", meaningEn: "I have a break.", type: "scenario", phraseChunkUsed: "pauze hebben", scenarioTags: ["school", "work"] },
    rooster: { dutch: "Ik kijk in het rooster.", meaningZh: "我查看课表/排班表。", meaningEn: "I check the schedule.", type: "scenario", phraseChunkUsed: "in het rooster kijken", scenarioTags: ["school", "work"] },
    taak: { dutch: "Ik maak de taak af.", meaningZh: "我完成任务。", meaningEn: "I finish the task.", type: "scenario", phraseChunkUsed: "de taak afmaken", scenarioTags: ["school", "work"] },
    klas: { dutch: "Ik zit in de klas.", meaningZh: "我在班里/教室里。", meaningEn: "I am in class.", type: "scenario", phraseChunkUsed: "in de klas zitten", scenarioTags: ["school"] },
    agenda: { dutch: "Ik zet de afspraak in mijn agenda.", meaningZh: "我把预约写进日程本。", meaningEn: "I put the appointment in my agenda.", type: "scenario", phraseChunkUsed: "in mijn agenda zetten", scenarioTags: ["appointment", "work"] },
    huiswerk: { dutch: "Ik maak mijn huiswerk.", meaningZh: "我做作业。", meaningEn: "I do my homework.", type: "scenario", phraseChunkUsed: "huiswerk maken", scenarioTags: ["school"] },
    opdracht: { dutch: "Ik maak de opdracht.", meaningZh: "我做这个任务。", meaningEn: "I do the assignment.", type: "scenario", phraseChunkUsed: "de opdracht maken", scenarioTags: ["school"] },
    toets: { dutch: "Ik maak een toets.", meaningZh: "我参加测验。", meaningEn: "I take a test.", type: "scenario", phraseChunkUsed: "een toets maken", scenarioTags: ["school"] },
    examen: { dutch: "Ik doe examen.", meaningZh: "我参加考试。", meaningEn: "I take an exam.", type: "scenario", phraseChunkUsed: "examen doen", scenarioTags: ["school"] },
    groep: { dutch: "Ik werk in een groep.", meaningZh: "我在小组里工作。", meaningEn: "I work in a group.", type: "scenario", phraseChunkUsed: "in een groep werken", scenarioTags: ["school", "work"] },
    lokaal: { dutch: "De les is in lokaal twee.", meaningZh: "课在二号教室。", meaningEn: "The lesson is in classroom two.", type: "scenario", phraseChunkUsed: "in lokaal twee", scenarioTags: ["school"] },
    kantoor: { dutch: "Ik werk op kantoor.", meaningZh: "我在办公室工作。", meaningEn: "I work at the office.", type: "scenario", phraseChunkUsed: "op kantoor werken", scenarioTags: ["work"] },
    bedrijf: { dutch: "Ik werk bij een bedrijf.", meaningZh: "我在一家公司工作。", meaningEn: "I work at a company.", type: "scenario", phraseChunkUsed: "bij een bedrijf werken", scenarioTags: ["work"] },
    winkelmedewerker: { dutch: "De winkelmedewerker helpt mij.", meaningZh: "店员帮助我。", meaningEn: "The shop employee helps me.", type: "scenario", phraseChunkUsed: "de winkelmedewerker helpt", scenarioTags: ["work", "supermarket"] },
    chef: { dutch: "Ik bespreek het met mijn chef.", meaningZh: "我和我的主管讨论这件事。", meaningEn: "I discuss it with my boss.", type: "scenario", phraseChunkUsed: "met mijn chef bespreken", scenarioTags: ["work"] },
    sollicitatie: { dutch: "Ik heb mijn sollicitatie online verstuurd.", meaningZh: "我已经在线提交了我的求职申请。", meaningEn: "I submitted my job application online.", type: "scenario", phraseChunkUsed: "een sollicitatie versturen", scenarioTags: ["work", "digital"] },
    ervaring: { dutch: "Ik heb ervaring met klantcontact.", meaningZh: "我有客户沟通方面的经验。", meaningEn: "I have experience with customer contact.", type: "output", phraseChunkUsed: "ervaring met klantcontact", scenarioTags: ["work"] },
    opleiding: { dutch: "Ik volg een opleiding op mbo-niveau.", meaningZh: "我在上 mbo 等级的培训/教育。", meaningEn: "I am following a program at mbo level.", type: "scenario", phraseChunkUsed: "een opleiding volgen", scenarioTags: ["school", "work"] },
  };
  const placeNouns: Record<string, TemplateExample> = {
    straat: { dutch: "Ik woon in deze straat.", meaningZh: "我住在这条街。", meaningEn: "I live on this street.", type: "scenario", phraseChunkUsed: "in deze straat wonen", scenarioTags: ["directions", "housing"] },
    plein: { dutch: "Ik wacht op het plein.", meaningZh: "我在广场等。", meaningEn: "I wait on the square.", type: "scenario", phraseChunkUsed: "op het plein wachten", scenarioTags: ["directions"] },
    centrum: { dutch: "Ik ga naar het centrum.", meaningZh: "我去市中心。", meaningEn: "I go to the city center.", type: "scenario", phraseChunkUsed: "naar het centrum gaan", scenarioTags: ["directions"] },
    markt: { dutch: "Ik koop fruit op de markt.", meaningZh: "我在市场买水果。", meaningEn: "I buy fruit at the market.", type: "scenario", phraseChunkUsed: "op de markt kopen", scenarioTags: ["supermarket"] },
    park: { dutch: "Ik wandel in het park.", meaningZh: "我在公园散步。", meaningEn: "I walk in the park.", type: "scenario", phraseChunkUsed: "in het park wandelen", scenarioTags: ["directions"] },
    bibliotheek: { dutch: "Ik ga naar de bibliotheek.", meaningZh: "我去图书馆。", meaningEn: "I go to the library.", type: "scenario", phraseChunkUsed: "naar de bibliotheek gaan", scenarioTags: ["school", "directions"] },
    restaurant: { dutch: "Ik eet in het restaurant.", meaningZh: "我在餐厅吃饭。", meaningEn: "I eat in the restaurant.", type: "scenario", phraseChunkUsed: "in het restaurant eten", scenarioTags: ["food"] },
    café: { dutch: "Ik drink koffie in het café.", meaningZh: "我在咖啡馆喝咖啡。", meaningEn: "I drink coffee in the cafe.", type: "scenario", phraseChunkUsed: "in het café", scenarioTags: ["food"] },
    ingang: { dutch: "Waar is de ingang?", meaningZh: "入口在哪里？", meaningEn: "Where is the entrance?", type: "output", phraseChunkUsed: "waar is de ingang", scenarioTags: ["directions"] },
    uitgang: { dutch: "Waar is de uitgang?", meaningZh: "出口在哪里？", meaningEn: "Where is the exit?", type: "output", phraseChunkUsed: "waar is de uitgang", scenarioTags: ["directions"] },
  };
  const quantityNouns: Record<string, TemplateExample> = {
    euro: { dutch: "Dat kost tien euro.", meaningZh: "那个十欧。", meaningEn: "That costs ten euros.", type: "scenario", phraseChunkUsed: "tien euro", scenarioTags: ["payment"] },
    cent: { dutch: "Dat kost vijftig cent.", meaningZh: "那个五十分。", meaningEn: "That costs fifty cents.", type: "scenario", phraseChunkUsed: "vijftig cent", scenarioTags: ["payment"] },
    kilo: { dutch: "Ik koop een kilo appels.", meaningZh: "我买一公斤苹果。", meaningEn: "I buy one kilo of apples.", type: "scenario", phraseChunkUsed: "een kilo appels", scenarioTags: ["supermarket"] },
    gram: { dutch: "Ik wil honderd gram kaas.", meaningZh: "我想要一百克奶酪。", meaningEn: "I would like one hundred grams of cheese.", type: "output", phraseChunkUsed: "honderd gram kaas", scenarioTags: ["supermarket"] },
    fles: { dutch: "Ik koop een fles water.", meaningZh: "我买一瓶水。", meaningEn: "I buy a bottle of water.", type: "scenario", phraseChunkUsed: "een fles water", scenarioTags: ["supermarket"] },
    pak: { dutch: "Ik koop een pak melk.", meaningZh: "我买一盒牛奶。", meaningEn: "I buy a carton of milk.", type: "scenario", phraseChunkUsed: "een pak melk", scenarioTags: ["supermarket"] },
    zak: { dutch: "Ik koop een zak appels.", meaningZh: "我买一袋苹果。", meaningEn: "I buy a bag of apples.", type: "scenario", phraseChunkUsed: "een zak appels", scenarioTags: ["supermarket"] },
    stuk: { dutch: "Ik wil een stuk kaas.", meaningZh: "我想要一块奶酪。", meaningEn: "I would like a piece of cheese.", type: "output", phraseChunkUsed: "een stuk kaas", scenarioTags: ["supermarket"] },
    kassa: { dutch: "Ik betaal bij de kassa.", meaningZh: "我在收银台付款。", meaningEn: "I pay at the checkout.", type: "scenario", phraseChunkUsed: "bij de kassa betalen", scenarioTags: ["supermarket", "payment"] },
    mandje: { dutch: "Ik pak een mandje.", meaningZh: "我拿一个购物篮。", meaningEn: "I take a basket.", type: "scenario", phraseChunkUsed: "een mandje pakken", scenarioTags: ["supermarket"] },
    pinpas: { dutch: "Ik betaal met mijn pinpas.", meaningZh: "我用银行卡付款。", meaningEn: "I pay with my debit card.", type: "scenario", phraseChunkUsed: "met mijn pinpas betalen", scenarioTags: ["payment"] },
  };
  const timeNouns: Record<string, TemplateExample> = {
    tijd: { dutch: "Ik heb tijd.", meaningZh: "我有时间。", meaningEn: "I have time.", type: "minimal", phraseChunkUsed: "tijd hebben", scenarioTags: ["time"] },
    lente: { dutch: "In de lente is het mooi.", meaningZh: "春天很美。", meaningEn: "In spring it is nice.", type: "scenario", phraseChunkUsed: "in de lente", scenarioTags: ["time", "weather"] },
    zomer: { dutch: "In de zomer is het warm.", meaningZh: "夏天天气热。", meaningEn: "In summer it is warm.", type: "scenario", phraseChunkUsed: "in de zomer", scenarioTags: ["time", "weather"] },
    herfst: { dutch: "In de herfst regent het vaak.", meaningZh: "秋天经常下雨。", meaningEn: "In autumn it often rains.", type: "scenario", phraseChunkUsed: "in de herfst", scenarioTags: ["time", "weather"] },
    winter: { dutch: "In de winter is het koud.", meaningZh: "冬天天气冷。", meaningEn: "In winter it is cold.", type: "scenario", phraseChunkUsed: "in de winter", scenarioTags: ["time", "weather"] },
  };
  const communicationNouns: Record<string, TemplateExample> = {
    informatie: { dutch: "Ik heb informatie nodig.", meaningZh: "我需要信息。", meaningEn: "I need information.", type: "scenario", phraseChunkUsed: "informatie nodig hebben", scenarioTags: ["help", "form"] },
    antwoord: { dutch: "Ik geef antwoord.", meaningZh: "我回答。", meaningEn: "I give an answer.", type: "scenario", phraseChunkUsed: "antwoord geven", scenarioTags: ["classroom", "help"] },
    tekst: { dutch: "Ik lees de tekst.", meaningZh: "我读这段文本。", meaningEn: "I read the text.", type: "scenario", phraseChunkUsed: "de tekst lezen", scenarioTags: ["classroom"] },
    gesprek: { dutch: "Ik heb een gesprek.", meaningZh: "我有一次谈话。", meaningEn: "I have a conversation.", type: "scenario", phraseChunkUsed: "een gesprek hebben", scenarioTags: ["phone-call", "work"] },
    vertaling: { dutch: "Ik vraag om een vertaling.", meaningZh: "我请求翻译。", meaningEn: "I ask for a translation.", type: "scenario", phraseChunkUsed: "om een vertaling vragen", scenarioTags: ["languages", "help"] },
  };
  const personalInfoExtraNouns: Record<string, TemplateExample> = {
    leeftijd: { dutch: "Wat is uw leeftijd?", meaningZh: "您的年龄是多少？", meaningEn: "What is your age?", type: "output", phraseChunkUsed: "uw leeftijd", scenarioTags: ["form", "identity"] },
    nummer: { dutch: "Wat is uw nummer?", meaningZh: "您的号码是多少？", meaningEn: "What is your number?", type: "output", phraseChunkUsed: "uw nummer", scenarioTags: ["form", "phone-call"] },
    huisnummer: { dutch: "Wat is uw huisnummer?", meaningZh: "您的门牌号是多少？", meaningEn: "What is your house number?", type: "output", phraseChunkUsed: "uw huisnummer", scenarioTags: ["form", "housing"] },
    straatnaam: { dutch: "Wat is uw straatnaam?", meaningZh: "您的街名是什么？", meaningEn: "What is your street name?", type: "output", phraseChunkUsed: "uw straatnaam", scenarioTags: ["form", "housing"] },
    woonplaats: { dutch: "Wat is uw woonplaats?", meaningZh: "您的居住地是哪儿？", meaningEn: "What is your place of residence?", type: "output", phraseChunkUsed: "uw woonplaats", scenarioTags: ["form", "housing"] },
    provincie: { dutch: "In welke provincie woont u?", meaningZh: "您住在哪个省？", meaningEn: "In which province do you live?", type: "output", phraseChunkUsed: "welke provincie", scenarioTags: ["form", "housing"] },
    buurt: { dutch: "Ik woon in deze buurt.", meaningZh: "我住在这个社区。", meaningEn: "I live in this neighborhood.", type: "scenario", phraseChunkUsed: "in deze buurt wonen", scenarioTags: ["housing"] },
  };

  if (b1TaskNouns[dutch]) return [nounFallback(word, b1TaskNouns[dutch], naturalNoun)];
  if (transportVehicles.has(dutch)) {
    return [nounFallback(word, { dutch: `Ik neem ${articlePhrase}.`, meaningZh: `我乘坐${zh}。`, meaningEn: `I take the ${en}.`, type: "scenario", phraseChunkUsed: `${articlePhrase} nemen`, scenarioTags: ["transport"] }, naturalNoun)];
  }
  if (privateTransport.has(dutch)) {
    return [nounFallback(word, { dutch: `Ik ga met ${articlePhrase}.`, meaningZh: `我骑/开${zh}去。`, meaningEn: `I go by ${en}.`, type: "scenario", phraseChunkUsed: `met ${articlePhrase}`, scenarioTags: ["transport"] }, naturalNoun)];
  }
  if (transportTimeNouns.has(dutch)) {
    return [nounFallback(word, { dutch: `${subject} is om acht uur.`, meaningZh: `${zh}是八点。`, meaningEn: `The ${en} is at eight o'clock.`, type: "scenario", phraseChunkUsed: articlePhrase, scenarioTags: ["transport", "time"] }, naturalNoun)];
  }
  if (transportDurationNouns.has(dutch)) {
    return [nounFallback(word, { dutch: `${subject} duurt tien minuten.`, meaningZh: `${zh}需要十分钟。`, meaningEn: `The ${en} takes ten minutes.`, type: "scenario", phraseChunkUsed: `${articlePhrase} duurt`, scenarioTags: ["transport", "time"] }, naturalNoun)];
  }
  if (transportInfoNouns[dutch]) return [nounFallback(word, transportInfoNouns[dutch], naturalNoun)];
  if (transportProblemNouns[dutch]) return [nounFallback(word, transportProblemNouns[dutch], naturalNoun)];
  if (ticketNouns[dutch]) return [nounFallback(word, ticketNouns[dutch], naturalNoun)];
  if (routeNouns[dutch]) return [nounFallback(word, routeNouns[dutch], naturalNoun)];
  if (familyNouns[dutch]) return [nounFallback(word, familyNouns[dutch], naturalNoun)];
  if (peopleNouns[dutch]) return [nounFallback(word, peopleNouns[dutch], naturalNoun)];
  if (personRoleNouns[dutch]) return [nounFallback(word, personRoleNouns[dutch], naturalNoun)];
  if (documentNouns[dutch]) return [nounFallback(word, documentNouns[dutch], naturalNoun)];
  if (healthNouns[dutch]) return [nounFallback(word, healthNouns[dutch], naturalNoun)];
  if (basicObjectNouns[dutch]) return [nounFallback(word, basicObjectNouns[dutch], naturalNoun)];
  if (roomNouns[dutch]) return [nounFallback(word, roomNouns[dutch], naturalNoun)];
  if (homeObjectNouns[dutch]) return [nounFallback(word, homeObjectNouns[dutch], naturalNoun)];
  if (weatherNouns[dutch]) return [nounFallback(word, weatherNouns[dutch], naturalNoun)];
  if (schoolWorkNouns[dutch]) return [nounFallback(word, schoolWorkNouns[dutch], naturalNoun)];
  if (placeNouns[dutch]) return [nounFallback(word, placeNouns[dutch], naturalNoun)];
  if (quantityNouns[dutch]) return [nounFallback(word, quantityNouns[dutch], naturalNoun)];
  if (timeNouns[dutch]) return [nounFallback(word, timeNouns[dutch], naturalNoun)];
  if (communicationNouns[dutch]) return [nounFallback(word, communicationNouns[dutch], naturalNoun)];
  if (personalInfoExtraNouns[dutch]) return [nounFallback(word, personalInfoExtraNouns[dutch], naturalNoun)];
  if (bodyPartNouns.has(dutch)) {
    return [nounFallback(word, { dutch: `Mijn ${word.dutch} doet pijn.`, meaningZh: `我的${zh}疼。`, meaningEn: `My ${en} hurts.`, type: "scenario", phraseChunkUsed: `mijn ${word.dutch} doet pijn`, scenarioTags: ["health"] }, naturalNoun)];
  }
  if (countFoodNouns.has(dutch)) {
    return [nounFallback(word, { dutch: `Ik eet een ${word.dutch}.`, meaningZh: `我吃一个${zh}。`, meaningEn: `I eat a ${en}.`, type: "scenario", phraseChunkUsed: `een ${word.dutch} eten`, scenarioTags: ["food"] }, naturalNoun)];
  }
  if (foodNouns.has(dutch)) {
    return [nounFallback(word, { dutch: `Ik eet ${word.dutch}.`, meaningZh: `我吃${zh}。`, meaningEn: `I eat ${en}.`, type: "scenario", phraseChunkUsed: `${word.dutch} eten`, scenarioTags: ["food"] }, naturalNoun)];
  }
  if (drinkNouns.has(dutch)) {
    return [nounFallback(word, { dutch: `Ik drink ${word.dutch}.`, meaningZh: `我喝${zh}。`, meaningEn: `I drink ${en}.`, type: "scenario", phraseChunkUsed: `${word.dutch} drinken`, scenarioTags: ["food"] }, naturalNoun)];
  }
  if (clothingNouns.has(dutch)) {
    return [nounFallback(word, { dutch: `Ik draag ${articlePhrase}.`, meaningZh: `我穿/戴${zh}。`, meaningEn: `I wear the ${en}.`, type: "scenario", phraseChunkUsed: `${articlePhrase} dragen`, scenarioTags: ["clothes"] }, naturalNoun)];
  }
  if (tablewareNouns.has(dutch)) {
    return [nounFallback(word, { dutch: `Ik gebruik ${articlePhrase}.`, meaningZh: `我使用${zh}。`, meaningEn: `I use the ${en}.`, type: "scenario", phraseChunkUsed: `${articlePhrase} gebruiken`, scenarioTags: ["food", "home"] }, naturalNoun)];
  }
  if (naturalNoun) {
    const tags = word.scenarioTags.map((tag) => tag.toLowerCase());
    const theme = word.theme.toLowerCase();
    if (tags.includes("form") || tags.includes("gemeente") || theme.includes("document") || theme.includes("admin")) {
      return [];
    }
    if (tags.includes("health") || theme.includes("health") || theme.includes("pharmacy")) {
      const discussableHealthNouns = new Set(["klacht", "pijn", "symptoom", "koorts", "medicijn", "bijwerking", "allergie", "behandeling", "advies"]);
      if (discussableHealthNouns.has(dutch)) {
        return [nounFallback(word, { dutch: `Ik bespreek ${articlePhrase} met de huisarts.`, meaningZh: `我和家庭医生讨论${zh}。`, meaningEn: `I discuss the ${en} with the GP.`, type: "scenario", phraseChunkUsed: `${articlePhrase} bespreken`, scenarioTags: ["health"] }, naturalNoun)];
      }
      return [];
    }
    if (tags.includes("housing") || theme.includes("home") || theme.includes("housing") || theme.includes("rent")) {
      return [];
    }
    if (tags.includes("work") || theme.includes("work") || theme.includes("school")) {
      return [];
    }
    if (tags.includes("transport") || theme.includes("transport")) {
      return [nounFallback(word, { dutch: `Ik vraag naar ${articlePhrase}.`, meaningZh: `我询问${zh}。`, meaningEn: `I ask about the ${en}.`, type: "output", phraseChunkUsed: `naar ${articlePhrase} vragen`, scenarioTags: ["transport"] }, naturalNoun)];
    }
    if (theme.includes("place") || theme.includes("service")) {
      return [nounFallback(word, { dutch: `Ik ga naar ${articlePhrase}.`, meaningZh: `我去${zh}。`, meaningEn: `I go to the ${en}.`, type: "scenario", phraseChunkUsed: `naar ${articlePhrase} gaan`, scenarioTags: ["directions"] }, naturalNoun)];
    }
    return [];
  }

  return [];
};

export const fallbackExamplesForWord = (word: WordItem, wordType: WordType): TemplateExample[] => {
  const dutch = norm(word.dutch);
  if (wordType === "number") {
    if (numberExamples[dutch]) return numberExamples[dutch];
    return [
      { dutch: `Ik wacht ${word.dutch} minuten.`, meaningZh: `我等${meaningZhFor(word)}分钟。`, meaningEn: `I wait ${meaningEnFor(word)} minutes.`, type: "scenario", phraseChunkUsed: `${word.dutch} minuten`, scenarioTags: ["numbers", "time"], confidence: "medium", needsHumanReview: !hasNaturalMeaning(word) },
    ];
  }
  if (wordType === "language-name") {
    const language = word.dutch[0].toUpperCase() + word.dutch.slice(1);
    return [
      { dutch: `Ik spreek ${language}.`, meaningZh: `我说${word.meaning.zh || language}。`, meaningEn: `I speak ${word.meaning.en || language}.`, type: "collocation", phraseChunkUsed: `${language} spreken`, scenarioTags: ["languages"] },
      { dutch: `Ik leer ${language}.`, meaningZh: `我学${word.meaning.zh || language}。`, meaningEn: `I learn ${word.meaning.en || language}.`, type: "minimal", phraseChunkUsed: `${language} leren`, scenarioTags: ["languages"] },
    ];
  }
  if (wordType === "country-name") {
    if (dutch === "china") {
      return [{ dutch: "Ik kom uit China.", meaningZh: "我来自中国。", meaningEn: "I come from China.", type: "minimal", phraseChunkUsed: "uit China komen", scenarioTags: ["identity"] }];
    }
    if (dutch === "nederland") {
      return [
        { dutch: "Ik woon in Nederland.", meaningZh: "我住在荷兰。", meaningEn: "I live in the Netherlands.", type: "minimal", phraseChunkUsed: "in Nederland wonen", scenarioTags: ["identity"] },
        { dutch: "Ik leer Nederlands in Nederland.", meaningZh: "我在荷兰学荷兰语。", meaningEn: "I learn Dutch in the Netherlands.", type: "scenario", phraseChunkUsed: "in Nederland", scenarioTags: ["languages", "identity"] },
      ];
    }
    return [{ dutch: `Ik kom uit ${word.dutch}.`, meaningZh: `我来自${word.meaning.zh || word.dutch}。`, meaningEn: `I come from ${word.meaning.en || word.dutch}.`, type: "minimal", phraseChunkUsed: `uit ${word.dutch} komen`, scenarioTags: ["identity"], confidence: hasNaturalMeaning(word) ? "medium" : "low", needsHumanReview: !hasNaturalMeaning(word) }];
  }
  if (wordType === "day-month") {
    if (nounExamples[dutch]) return nounExamples[dutch];
    const seasonExamples: Record<string, TemplateExample[]> = {
      lente: [{ dutch: "In de lente is het mooi.", meaningZh: "春天很美。", meaningEn: "In spring it is nice.", type: "scenario", phraseChunkUsed: "in de lente", scenarioTags: ["time", "weather"] }],
      zomer: [{ dutch: "In de zomer is het warm.", meaningZh: "夏天天气热。", meaningEn: "In summer it is warm.", type: "scenario", phraseChunkUsed: "in de zomer", scenarioTags: ["time", "weather"] }],
      herfst: [{ dutch: "In de herfst regent het vaak.", meaningZh: "秋天经常下雨。", meaningEn: "In autumn it often rains.", type: "scenario", phraseChunkUsed: "in de herfst", scenarioTags: ["time", "weather"] }],
      winter: [{ dutch: "In de winter is het koud.", meaningZh: "冬天天气冷。", meaningEn: "In winter it is cold.", type: "scenario", phraseChunkUsed: "in de winter", scenarioTags: ["time", "weather"] }],
    };
    if (seasonExamples[dutch]) return seasonExamples[dutch];
    return [{ dutch: `Ik kom in ${word.dutch}.`, meaningZh: `我在${meaningZhFor(word)}来。`, meaningEn: `I come in ${meaningEnFor(word)}.`, type: "scenario", phraseChunkUsed: `in ${word.dutch}`, scenarioTags: ["time"], confidence: "medium" }];
  }
  if (wordType === "function-word") return functionWordExamples[dutch] ?? [];
  if (wordType === "phrase") {
    return phraseExamples[dutch] ?? phraseFallbackExamplesFor(word);
  }
  if (wordType === "verb") {
    const infinitive = infinitiveForWord(word) ?? dutch;
    if (verbExamples[infinitive]) return verbExamples[infinitive];
    const fallback = verbFallbackSentences[infinitive];
    if (fallback) {
      return [{
        dutch: fallback.dutch,
        meaningZh: fallback.meaningZh ?? `我${meaningZhFor(word)}。`,
        meaningEn: fallback.meaningEn ?? `I ${meaningEnFor(word)}.`,
        type: "scenario",
        phraseChunkUsed: fallback.phraseChunk,
        scenarioTags: word.scenarioTags,
        confidence: "medium",
      }];
    }
    const forms = verbFormsForWord(word);
    if (forms) {
      return [{ dutch: `Ik wil ${infinitive}.`, meaningZh: `我想${meaningZhFor(word)}。`, meaningEn: `I want to ${meaningEnFor(word)}.`, type: "scenario", phraseChunkUsed: infinitive, scenarioTags: word.scenarioTags, confidence: hasNaturalMeaning(word) ? "medium" : "low", needsHumanReview: !hasNaturalMeaning(word) }];
    }
  }
  if (wordType === "adjective") {
    return adjectiveExamples[dutch] ?? [{ dutch: `Dat is ${word.dutch}.`, meaningZh: `那很${meaningZhFor(word)}。`, meaningEn: `That is ${meaningEnFor(word)}.`, type: "minimal", phraseChunkUsed: `is ${word.dutch}`, scenarioTags: word.scenarioTags, confidence: hasNaturalMeaning(word) ? "medium" : "low", needsHumanReview: !hasNaturalMeaning(word) }];
  }
  if (wordType === "noun" && nounExamples[dutch]) return nounExamples[dutch];

  const articlePhrase = articlePhraseFor(word);
  const naturalNoun = hasNaturalMeaning(word);
  const personalInfoNouns = new Set(["adres", "naam", "voornaam", "achternaam", "geboortedatum", "nationaliteit", "postcode", "telefoonnummer", "email"]);
  const paymentNouns = new Set(["rekening", "factuur", "bedrag", "betaling", "prijs", "bon", "waterrekening"]);
  const healthPlaceNouns = new Set(["dokter", "huisarts", "apotheek", "ziekenhuis", "tandarts"]);
  const transportPlaceNouns = new Set(["station", "halte", "perron"]);
  const housingNouns = new Set(["woning", "kamer", "huur", "huurcontract", "reparatie"]);

  if (personalInfoNouns.has(dutch)) {
    return [
      { dutch: `Ik vul mijn ${word.dutch} in.`, meaningZh: `我填写我的${meaningZhFor(word)}。`, meaningEn: `I fill in my ${meaningEnFor(word)}.`, type: "collocation", phraseChunkUsed: `mijn ${word.dutch} invullen`, scenarioTags: ["form", "gemeente"], confidence: naturalNoun ? "medium" : "low", needsHumanReview: !naturalNoun },
      { dutch: `Wat is uw ${word.dutch}?`, meaningZh: `您的${meaningZhFor(word)}是什么？`, meaningEn: `What is your ${meaningEnFor(word)}?`, type: "output", phraseChunkUsed: `uw ${word.dutch}`, scenarioTags: ["form"], confidence: naturalNoun ? "medium" : "low", needsHumanReview: !naturalNoun },
    ];
  }
  if (paymentNouns.has(dutch)) {
    return [
      { dutch: `Ik moet ${articlePhrase} betalen.`, meaningZh: `我必须支付${meaningZhFor(word)}。`, meaningEn: `I have to pay the ${meaningEnFor(word)}.`, type: "collocation", phraseChunkUsed: `${articlePhrase} betalen`, scenarioTags: ["bill", "payment"], confidence: naturalNoun ? "medium" : "low", needsHumanReview: !naturalNoun },
    ];
  }
  if (healthPlaceNouns.has(dutch) || transportPlaceNouns.has(dutch)) {
    return [{ dutch: `Ik ga naar ${articlePhrase}.`, meaningZh: `我去${meaningZhFor(word)}。`, meaningEn: `I go to the ${meaningEnFor(word)}.`, type: "scenario", phraseChunkUsed: `naar ${articlePhrase} gaan`, scenarioTags: word.scenarioTags, confidence: naturalNoun ? "medium" : "low", needsHumanReview: !naturalNoun }];
  }
  if (housingNouns.has(dutch)) {
    return [{ dutch: `Ik heb een probleem met mijn ${word.dutch}.`, meaningZh: `我的${meaningZhFor(word)}有问题。`, meaningEn: `I have a problem with my ${meaningEnFor(word)}.`, type: "scenario", phraseChunkUsed: `probleem met mijn ${word.dutch}`, scenarioTags: ["housing"], confidence: naturalNoun ? "medium" : "low", needsHumanReview: !naturalNoun }];
  }
  const dictionaryStyleFallbacks = dictionaryStyleNounFallbacksFor(word, dutch, articlePhrase, naturalNoun);
  if (dictionaryStyleFallbacks.length) return dictionaryStyleFallbacks;
  if (wordType === "noun") {
    return [];
  }

  return [];
};
