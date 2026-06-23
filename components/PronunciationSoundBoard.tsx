"use client";

import { Volume2 } from "lucide-react";
import { useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n";

type ActivePanel = "contrast" | "special" | "alphabet";

type SpecialSound = {
  sound: string;
  isolatedAudioSrc?: string;
  example: string;
  exampleAudioSrc?: string;
  hintZh: string;
  hintEn: string;
};

type FocusGroup = {
  title: string;
  noteZh: string;
  noteEn: string;
  mouthZh: string;
  mouthEn: string;
  funFactZh?: string;
  funFactEn?: string;
  items: {
    label: string;
    word: string;
    audioSrc?: string;
  }[];
};

const alphabet = [
  { letter: "a", name: "aa", example: "appel", audioSrc: "/audio/nl/letters/a.wav", exampleAudioSrc: "/audio/nl/words/appel.wav" },
  { letter: "b", name: "bé", example: "boek", audioSrc: "/audio/nl/letters/b.wav", exampleAudioSrc: "/audio/nl/words/boek.wav" },
  { letter: "c", name: "cé", example: "cent", audioSrc: "/audio/nl/letters/c.wav", exampleAudioSrc: "/audio/nl/words/cent.wav" },
  { letter: "d", name: "dé", example: "dag", audioSrc: "/audio/nl/letters/d.wav", exampleAudioSrc: "/audio/nl/words/dag.wav" },
  { letter: "e", name: "e", example: "een", audioSrc: "/audio/nl/letters/e.wav", exampleAudioSrc: "/audio/nl/words/een.wav" },
  { letter: "f", name: "ef", example: "fiets", audioSrc: "/audio/nl/letters/f.wav", exampleAudioSrc: "/audio/nl/words/fiets.wav" },
  { letter: "g", name: "gé", example: "goed", audioSrc: "/audio/nl/letters/g.wav", exampleAudioSrc: "/audio/nl/words/goed.wav" },
  { letter: "h", name: "haa", example: "huis", audioSrc: "/audio/nl/letters/h.wav", exampleAudioSrc: "/audio/nl/words/huis.wav" },
  { letter: "i", name: "ie", example: "ik", audioSrc: "/audio/nl/letters/i.wav", exampleAudioSrc: "/audio/nl/words/ik.wav" },
  { letter: "j", name: "jé", example: "ja", audioSrc: "/audio/nl/letters/j.wav", exampleAudioSrc: "/audio/nl/words/ja.wav" },
  { letter: "k", name: "kaa", example: "kom", audioSrc: "/audio/nl/letters/k.wav", exampleAudioSrc: "/audio/nl/words/kom.wav" },
  { letter: "l", name: "el", example: "leuk", audioSrc: "/audio/nl/letters/l.wav", exampleAudioSrc: "/audio/nl/words/leuk.wav" },
  { letter: "m", name: "em", example: "maan", audioSrc: "/audio/nl/letters/m.wav", exampleAudioSrc: "/audio/nl/words/maan.wav" },
  { letter: "n", name: "en", example: "naam", audioSrc: "/audio/nl/letters/n.wav", exampleAudioSrc: "/audio/nl/words/naam.wav" },
  { letter: "o", name: "o", example: "ook", audioSrc: "/audio/nl/letters/o.wav", exampleAudioSrc: "/audio/nl/words/ook.wav" },
  { letter: "p", name: "pé", example: "pen", audioSrc: "/audio/nl/letters/p.wav", exampleAudioSrc: "/audio/nl/words/pen.wav" },
  { letter: "q", name: "qu", example: "quiz", audioSrc: "/audio/nl/letters/q.wav", exampleAudioSrc: "/audio/nl/words/quiz.wav" },
  { letter: "r", name: "er", example: "rood", audioSrc: "/audio/nl/letters/r.wav", exampleAudioSrc: "/audio/nl/words/rood.wav" },
  { letter: "s", name: "es", example: "school", audioSrc: "/audio/nl/letters/s.wav", exampleAudioSrc: "/audio/nl/words/school.wav" },
  { letter: "t", name: "té", example: "trein", audioSrc: "/audio/nl/letters/t.wav", exampleAudioSrc: "/audio/nl/words/trein.wav" },
  { letter: "u", name: "u", example: "uur", audioSrc: "/audio/nl/letters/u.wav", exampleAudioSrc: "/audio/nl/words/uur.wav" },
  { letter: "v", name: "vé", example: "vis", audioSrc: "/audio/nl/letters/v.wav", exampleAudioSrc: "/audio/nl/words/vis.wav" },
  { letter: "w", name: "wee", example: "water", audioSrc: "/audio/nl/letters/w.wav", exampleAudioSrc: "/audio/nl/words/water.wav" },
  { letter: "x", name: "iks", example: "taxi", audioSrc: "/audio/nl/letters/x.wav", exampleAudioSrc: "/audio/nl/words/taxi.wav" },
  { letter: "y", name: "ij", example: "ijs", audioSrc: "/audio/nl/letters/y.wav", exampleAudioSrc: "/audio/nl/words/ijs.wav" },
  { letter: "z", name: "zet", example: "ziek", audioSrc: "/audio/nl/letters/z.wav", exampleAudioSrc: "/audio/nl/words/ziek.wav" },
];

const specialSounds: SpecialSound[] = [
  { sound: "aa", isolatedAudioSrc: "/audio/nl/isolated-sounds/aa.wav", example: "maan", exampleAudioSrc: "/audio/nl/words/maan.wav", hintZh: "先听 aa 本身：长一点、嘴巴打开。再听 maan。", hintEn: "Hear aa itself first: long and open. Then hear maan." },
  { sound: "ee", isolatedAudioSrc: "/audio/nl/isolated-sounds/ee.wav", example: "been", exampleAudioSrc: "/audio/nl/words/been.wav", hintZh: "先听 ee 本身：清楚、稳定、靠前。再听 been。", hintEn: "Hear ee itself first: clear, steady, front. Then hear been." },
  { sound: "ie", isolatedAudioSrc: "/audio/nl/isolated-sounds/ie.wav", example: "bier, dier, fiets", hintZh: "先听 ie 本身，接近 English see 的元音。再听 bier / dier / fiets。", hintEn: "Hear ie itself first, close to the vowel in see. Then hear bier / dier / fiets." },
  { sound: "oo", isolatedAudioSrc: "/audio/nl/isolated-sounds/oo.wav", example: "brood", exampleAudioSrc: "/audio/nl/words/brood.wav", hintZh: "先听 oo 本身：圆唇长音。再听 brood。", hintEn: "Hear oo itself first: long rounded vowel. Then hear brood." },
  { sound: "uu", isolatedAudioSrc: "/audio/nl/isolated-sounds/uu.wav", example: "bus, uur", hintZh: "先听 uu 本身：前舌位 + 圆嘴。再听 bus / uur。", hintEn: "Hear uu itself first: front tongue + rounded lips. Then hear bus / uur." },
  { sound: "ij / ei", isolatedAudioSrc: "/audio/nl/isolated-sounds/ei-ij.wav", example: "ijs, trein, ei", hintZh: "先听 ij/ei 这个滑音本身，不拆成 i+j 或 e+i。再听 ijs / trein / ei。", hintEn: "Hear the ij/ei glide itself first, not i+j or e+i. Then hear ijs / trein / ei." },
  { sound: "oe", isolatedAudioSrc: "/audio/nl/isolated-sounds/oe.wav", example: "boek, stoel, koek", hintZh: "先听 oe 本身，接近“乌”，不是“欧”。再听 boek / stoel / koek。", hintEn: "Hear oe itself first, close to oo in food, not oh. Then hear boek / stoel / koek." },
  { sound: "ui", isolatedAudioSrc: "/audio/nl/isolated-sounds/ui.wav", example: "ui, huis, tuin", hintZh: "先听 ui 本身：圆嘴开始，再向前滑。再听 ui / huis / tuin。", hintEn: "Hear ui itself first: start rounded, then glide forward. Then hear ui / huis / tuin." },
  { sound: "eu", isolatedAudioSrc: "/audio/nl/isolated-sounds/eu.wav", example: "deur, keuken, neus", hintZh: "先听 eu 本身：前舌圆唇音，不是 e + u。再听 deur / keuken / neus。", hintEn: "Hear eu itself first: front rounded vowel, not e + u. Then hear deur / keuken / neus." },
  { sound: "ou / au", isolatedAudioSrc: "/audio/nl/isolated-sounds/au-ou.wav", example: "koud, auto, blauw", hintZh: "先听 ou/au 这个滑音本身：开口再滑向圆嘴。", hintEn: "Hear the ou/au glide itself first: open, then glide to rounded lips." },
  { sound: "ai", example: "saai, maai, haai", hintZh: "先听 ai 这个罕见组合：比普通“哎”更宽、更扁。", hintEn: "Hear ai as a rare wider, flatter glide." },
  { sound: "g / ch", isolatedAudioSrc: "/audio/nl/isolated-sounds/g-ch.wav", example: "goed, dag, schip", hintZh: "先听喉后部摩擦音本身。再听 goed / dag / schip。", hintEn: "Hear the back-of-throat friction itself first. Then hear goed / dag / schip." },
  { sound: "w", example: "wat, wijn, wit", hintZh: "先找上牙轻碰下唇的阻碍感，再发短短的 w。", hintEn: "Find the light upper-teeth-to-lower-lip contact, then release a short Dutch w." },
  { sound: "r", example: "rood, reis, brood", hintZh: "先找颤动：舌尖或喉咙都可以，重点是别读成英语软 r。", hintEn: "Find a trill or throat vibration; do not turn it into a soft English r." },
  { sound: "sj / tj", example: "sjaal, meisje, hondje", hintZh: "先听 sj/tj 作为辅音组合，尤其注意 -tje 的短促小化词尾。", hintEn: "Treat sj/tj as consonant chunks, especially the clipped diminutive ending -tje." },
  { sound: "sch", isolatedAudioSrc: "/audio/nl/isolated-sounds/sch.wav", example: "school", exampleAudioSrc: "/audio/nl/words/school.wav", hintZh: "先听 sch 本身：s + 荷兰语 ch，不是英语 sh。再听 school。", hintEn: "Hear sch itself first: s plus Dutch ch, not English sh. Then hear school." },
  { sound: "-en", isolatedAudioSrc: "/audio/nl/isolated-sounds/en-ending.wav", example: "wonen", exampleAudioSrc: "/audio/nl/words/wonen.wav", hintZh: "先听弱读 -en 本身：结尾放轻。再听 wonen。", hintEn: "Hear the reduced -en ending itself first: keep the ending light. Then hear wonen." },
];

const focusGroups: FocusGroup[] = [
  {
    title: "a / aa",
    noteZh: "短 a 与长 aa 的对比。其实是“短呃”和“大啊”的区别。",
    noteEn: "Short a versus long aa: a quick open uh-ah versus a wide held aa.",
    mouthZh: "a 读短促的“啊”（带点呃）；aa 读去医院看病时张大嘴的“啊——”。",
    mouthEn: "Short a is quick and slightly uh-like; aa is the wide open doctor-says-aa sound.",
    funFactZh: "发短 a 时，嘴巴不用张太大，像被人拍了一下敷衍地“啊”；发长 aa 时，想象医生拿着压舌板说：“来，张大嘴，发啊——”。",
    funFactEn: "Short a is a quick casual ah; long aa is the wide doctor-checkup aa with the mouth fully open.",
    items: [
      { label: "a", word: "man" },
      { label: "aa", word: "maan", audioSrc: "/audio/nl/words/maan.wav" },
    ],
  },
  {
    title: "e / ee",
    noteZh: "短 e 与长 ee 的对比。其实是“短哎”和“长哎”的区别。",
    noteEn: "Short e versus long ee: a clipped eh/ay versus a longer flatter ee.",
    mouthZh: "e 读短促、大方的“哎”；ee 读嘴角拉扁、拉长的“哎——”。",
    mouthEn: "Short e is a quick eh/ay; ee is longer with the mouth corners pulled wider.",
    funFactZh: "发短 e 时，就像突然听到八卦，短促地“哎！”一声；发长 ee 时，嘴角往两边拉，发出拉长的、嫌弃的“哎——”。",
    funFactEn: "Short e is a quick surprised eh; long ee stretches wider, like a drawn-out skeptical ay.",
    items: [
      { label: "e", word: "les" },
      { label: "ee", word: "lees" },
    ],
  },
  {
    title: "o / oo",
    noteZh: "短 o 与长 oo 的对比。短音口型大，长音口型圆。",
    noteEn: "Short o versus long oo: the short sound is more open, the long sound is rounder.",
    mouthZh: "o 读短促的“噢”（嘴巴张大）；oo 读惊讶时的“哦——”（嘴唇用力缩圆）。",
    mouthEn: "Short o is a quick open oh; oo is a rounded held oh with the lips pushed forward.",
    funFactZh: "发短 o 时，嘴巴稍微张开，像听到八卦时敷衍的“噢”；发长 oo 时，嘴唇向前撅，缩成圆圈，发出长音“哦——”。",
    funFactEn: "Short o is a quick open oh; long oo needs a strong rounded lip shape, like a held surprised oh.",
    items: [
      { label: "o", word: "ros" },
      { label: "oo", word: "roos" },
    ],
  },
  {
    title: "u / uu",
    noteZh: "这是中文/英文学习者最容易错的音：可以先借“吁～”让马停下的圆嘴感觉，但舌头要像 i。短 u 用 bus，长 uu 用 uur。",
    noteEn: "A difficult sound for Chinese/English speakers: tongue like i, lips rounded. Short u uses bus; long uu uses uur.",
    mouthZh: "联想只负责找圆嘴；真正口型是先做“衣”的舌位，再把嘴唇圆起来。",
    mouthEn: "Make an ee/i tongue position, then round the lips.",
    items: [
      { label: "u", word: "bus", audioSrc: "/audio/nl/words/bus.wav" },
      { label: "uu", word: "uur", audioSrc: "/audio/nl/words/uur.wav" },
    ],
  },
  {
    title: "ij / ei",
    noteZh: "现代荷兰语里 ij 和 ei 发音一样。初学先把它们当一个整体滑音，不拆成 i+j 或 e+i。",
    noteEn: "In modern Dutch, ij and ei sound the same. Treat them as one glide, not i+j or e+i.",
    mouthZh: "张口起步，快速滑向“哎”的感觉。",
    mouthEn: "Start open, then glide quickly toward an ay-like finish.",
    items: [
      { label: "ij", word: "ijs", audioSrc: "/audio/nl/words/ijs.wav" },
      { label: "ei", word: "trein", audioSrc: "/audio/nl/words/trein.wav" },
    ],
  },
  {
    title: "v / w",
    noteZh: "v 和 w 靠口型区分。v 是上牙轻碰下唇带摩擦；w 更像双唇/唇齿靠近，摩擦少一点。",
    noteEn: "v and w need mouth-position contrast. v uses teeth and lower lip with friction; w has less friction and a lip-based shape.",
    mouthZh: "先慢慢做：vis / water，再做 veer / weer。",
    mouthEn: "Practice slowly: vis / water, then veer / weer.",
    items: [
      { label: "v", word: "vis", audioSrc: "/audio/nl/words/vis.wav" },
      { label: "w", word: "water", audioSrc: "/audio/nl/words/water.wav" },
      { label: "v", word: "veer", audioSrc: "/audio/nl/words/veer.wav" },
      { label: "w", word: "weer", audioSrc: "/audio/nl/words/weer.wav" },
    ],
  },
];

const specialSoundAssociations: Record<string, { zh: string; en: string }> = {
  aa: {
    zh: "双写 aa 像把开口音拉长：man 是短一下，maan 多停半拍。",
    en: "Double aa holds the open vowel longer: man is quick, maan is held.",
  },
  ee: {
    zh: "像微笑口型里的稳定前音；不要套 English letter E。",
    en: "Use a light smile shape and a steady front vowel; avoid the English letter E.",
  },
  ie: {
    zh: "先借 English see 的元音感，但在 Dutch 词里短促干净。",
    en: "Borrow the vowel in see, then keep it clean inside Dutch words.",
  },
  oo: {
    zh: "嘴唇拢圆，像一个小圆洞；不要读成英文 oh。",
    en: "Round the lips into a small circle; do not turn it into English oh.",
  },
  uu: {
    zh: "像“吁～”的圆嘴入口，但舌头保持“衣”的位置；uur 要拉长。",
    en: "Use rounded lips, but keep an ee tongue position; hold it in uur.",
  },
  "ij / ei": {
    zh: "把它当一个滑音，不要拆成 e+i 或 i+j。",
    en: "Treat it as one glide, not e+i or i+j.",
  },
  oe: {
    zh: "接近“乌”，不是“欧”：goed / boek / moeder 都用圆唇稳定音。",
    en: "Close to oo in food, not oh: keep it rounded and steady.",
  },
  ui: {
    zh: "圆嘴出发，再往前滑一点；huis / uit / tuin 都是这个动作。",
    en: "Start rounded, then glide forward; this action appears in huis / uit / tuin.",
  },
  eu: {
    zh: "像要说“诶/饿”的前舌位，但把嘴唇轻轻圆起来。",
    en: "Use a front vowel position, then softly round the lips.",
  },
  "ou / au": {
    zh: "先开口，再滑向圆嘴；不要停在英文 oh。",
    en: "Open first, then glide into rounded lips; do not stop at English oh.",
  },
  "g / ch": {
    zh: "像喉后部轻轻摩擦的气流，不是 English go 的硬 g。",
    en: "Use back-of-throat friction, not the hard g in English go.",
  },
  w: {
    zh: "上牙轻轻碰下唇，带一点摩擦，不是英语里松松的 w。",
    en: "Lightly touch upper teeth to lower lip; it is not a relaxed English w.",
  },
  r: {
    zh: "可以舌尖颤，也可以偏喉音；关键是让声音真的颤起来。",
    en: "Tongue-tip or throat r can both work; the key is real vibration.",
  },
  "sj / tj": {
    zh: "sj 像短促的 sh；tj 常在 -tje 里，一划而过。",
    en: "sj is a short sh-like sound; tj often appears in -tje and stays very clipped.",
  },
  sch: {
    zh: "先 s，再 ch；不是 English sh。",
    en: "Say s, then Dutch ch; it is not English sh.",
  },
  "-en": {
    zh: "结尾放轻，别把最后 n 每次都重重读出来。",
    en: "Keep the ending light; do not over-pronounce final n every time.",
  },
};

const specialSoundStories: Record<
  string,
  {
    descriptionZh: string;
    descriptionEn: string;
    mnemonicZh: string;
    mnemonicEn: string;
    funFactZh: string;
    funFactEn: string;
  }
> = {
  aa: {
    descriptionZh: "双写长音。去医院检查时的“大啊”。",
    descriptionEn: "A double-letter long vowel: the wide doctor-checkup aa.",
    mnemonicZh: "张大嘴巴，比平时说话多停半拍，发出饱满的“啊——”。",
    mnemonicEn: "Open the mouth wide, hold it half a beat longer, and make a full aa.",
    funFactZh: "想象医生拿着压舌板检查喉咙，对你说：“嘴张最大，发啊——”。就是那种把空间拉满的痛快感。",
    funFactEn: "Imagine a doctor asking you to open wide and say aa; the sound needs that full open space.",
  },
  ee: {
    descriptionZh: "双写长音。自带“恍然大悟”情绪的稳定前音。",
    descriptionEn: "A double-letter long vowel: a steady front sound with an aha feeling.",
    mnemonicZh: "嘴角向两边微笑拉开，发出拉长的“哎——”。",
    mnemonicEn: "Pull the mouth corners into a light smile and hold a long steady ee.",
    funFactZh: "想象你苦思冥想一个密码，突然一拍大腿：“哎——对对对！”嘴角保持微笑定格，声音才会稳。",
    funFactEn: "Think of a drawn-out aha moment; keep the smile shape fixed so the vowel stays steady.",
  },
  oo: {
    descriptionZh: "双写长音。标准的“圆洞音”。",
    descriptionEn: "A double-letter long vowel: the classic round-hole sound.",
    mnemonicZh: "嘴唇用力向前噘起来，缩成一个小圆洞，发出拉长的“哦——”。",
    mnemonicEn: "Push the lips forward into a small round hole and hold a rounded oo.",
    funFactZh: "看到震撼魔术时嘴巴嘬成圆圈：“哦——豁！”嘴唇缩得够圆、够紧，声音就更对味。",
    funFactEn: "Picture a surprised oh with lips forming a tight round circle; the rounder the lips, the cleaner the sound.",
  },
  uu: {
    descriptionZh: "反直觉神音。嘴唇在“吁”，舌头在“衣”。",
    descriptionEn: "Counterintuitive: lips say uu, tongue stays in an ee position.",
    mnemonicZh: "直接发出让马停下的“吁～～”，圆嘴和长音别漏气。",
    mnemonicEn: "Make a long rounded uu shape, then keep the ee tongue position inside it.",
    funFactZh: "悬崖勒马那一声“吁～～～”负责找圆嘴；真正通关点是舌头别跟着变成“乌”。",
    funFactEn: "The rounded whistle-like shape gets the lips right; the tongue still needs to stay forward.",
  },
  ui: {
    descriptionZh: "荷兰语终极 Boss。一个自带嫌弃表情包的音。",
    descriptionEn: "The Dutch boss sound: a tiny disgust-face glide.",
    mnemonicZh: "先大方发“呃”，再瞬间把嘴唇嘬成小圆嘴。",
    mnemonicEn: "Start with an open uh, then snap the lips into a small rounded shape.",
    funFactZh: "看到极丑的东西时那种“诶——吁！”的嫌弃感：重点是收尾嘴唇往前圆起来。",
    funFactEn: "Think of a surprised ew-glide, ending with rounded lips pushed forward.",
  },
  eu: {
    descriptionZh: "极具憋屈感的音，带一点呆萌机械感。",
    descriptionEn: "A squeezed front-rounded vowel, slightly stiff and mechanical.",
    mnemonicZh: "发“呃”的同时，把嘴唇固定成一个小圆圈。",
    mnemonicEn: "Say uh with a front tongue, while fixing the lips into a small circle.",
    funFactZh: "像思考时“呃……”到一半，被人捏住腮帮子，嘴被迫变成小圆管。",
    funFactEn: "Imagine an uh sound gently squeezed through a small rounded tube.",
  },
  oe: {
    descriptionZh: "深沉的轰鸣音。最老实、最靠后的“乌”。",
    descriptionEn: "A deep, steady oo sound from the back.",
    mnemonicZh: "嘬起最小的圆孔，让声音稳稳靠后。",
    mnemonicEn: "Make the smallest rounded opening and keep the sound low and steady.",
    funFactZh: "把嘴唇缩到最小，在喉咙深处发“呜——”。越稳、越靠后，越像 oe。",
    funFactEn: "Keep the lips small and rounded; the deeper and steadier it feels, the closer it gets.",
  },
  ie: {
    descriptionZh: "长音“衣”。拍照假笑专用音。",
    descriptionEn: "A clean long ee sound: the photo-smile vowel.",
    mnemonicZh: "把嘴角往两边拉，大喊一声“衣——”。",
    mnemonicEn: "Pull the mouth corners sideways and hold a clean ee.",
    funFactZh: "拍照喊“Cheese”那种假笑口型，腮帮子微酸就对了。",
    funFactEn: "Use the stretched photo-smile shape; if the cheeks work a little, you are close.",
  },
  "ij / ei": {
    descriptionZh: "高频双元音。现代荷兰语中这两个音完全一样，合称“哎”音。",
    descriptionEn: "A high-frequency diphthong. In modern Dutch, ij and ei sound the same.",
    mnemonicZh: "张大嘴发“啊”，然后迅速、极其敷衍地滑向“哎”。",
    mnemonicEn: "Open with ah, then slide quickly and lightly toward ay.",
    funFactZh: "想象路上突然有人从背后猛拍你一下，你吓得“啊——呀！”连快一点，就是 ij/ei。",
    funFactEn: "Think of a startled ah-ya, said fast enough to become one glide.",
  },
  "ou / au": {
    descriptionZh: "经典“奥”音组合。听起来像 English how，但收尾更夸张。",
    descriptionEn: "The classic Dutch ow sound, close to how but with a stronger rounded ending.",
    mnemonicZh: "大方地发“啊”，然后瞬间把嘴唇收缩成一个小圆圈。",
    mnemonicEn: "Start with a full ah, then snap the lips into a small rounded ending.",
    funFactZh: "脚趾撞到桌角那一声“嗷（Au）——！”就是入口：饱满、干脆、收圆。",
    funFactEn: "That full ouch-like ow is the entrance: open, strong, then rounded.",
  },
  ai: {
    descriptionZh: "罕见但特殊的组合。比普通“哎”更宽、更扁。",
    descriptionEn: "A rare special combination: wider and flatter than a normal ay.",
    mnemonicZh: "嘴角向两边拉扁，发一个极度夸张的“矮——”。",
    mnemonicEn: "Pull the mouth corners sideways and make an exaggerated flat ay.",
    funFactZh: "听到离谱八卦时那种拉长的“挨——？”感：嘴角往后撇，音要宽。",
    funFactEn: "Imagine a skeptical drawn-out ay? with the mouth pulled wide.",
  },
  "g / ch": {
    descriptionZh: "著名的荷兰语“刮喉音”或“吐痰音”，现代发音两者完全相同。",
    descriptionEn: "The famous Dutch throat-scrape sound; g and ch are pronounced the same in modern Dutch.",
    mnemonicZh: "假装嗓子里卡了鱼刺，使劲用喉咙往外清嗓子：“咳——”。",
    mnemonicEn: "Pretend a fish bone is stuck in your throat and clear it with a rough back-throat kh.",
    funFactZh: "想象大冬天嘴里含了一口浓痰想吐掉，或者吃鱼卡了刺，喉咙后半部分摩擦出粗犷的“赫——”。气流一定要刮着嗓子出来！",
    funFactEn: "Imagine clearing something from the back of your throat. The airflow has to scrape, not pop.",
  },
  w: {
    descriptionZh: "带有一点点微妙摩擦感的“乌”音，绝不是英语松弛的 w。",
    descriptionEn: "A Dutch w has a tiny bit of friction; it is not the loose English w.",
    mnemonicZh: "用上牙轻轻碰一下下唇，像发 v，再在这个姿势下试图发“乌”。",
    mnemonicEn: "Lightly touch upper teeth to lower lip, like v, then try to say a short oo from there.",
    funFactZh: "想象你正准备发中文的“微”，嘴唇还没彻底变扁，声音就已经结束了。那点牙齿咬嘴唇的轻微阻碍感就是 w。",
    funFactEn: "Imagine starting a v-like lip contact and ending before it turns into a full English w.",
  },
  r: {
    descriptionZh: "滚舌音。在荷兰北方偏向喉咙刮气，南方偏向舌尖颤动。",
    descriptionEn: "A rolling r: northern Dutch can be throatier, southern Dutch more tongue-tip.",
    mnemonicZh: "假装学跑车发动机轰鸣：“得儿儿儿——”，或者含一口水在喉咙里咕噜。",
    mnemonicEn: "Imitate a tiny engine rrr, or a soft gargle in the back of the throat.",
    funFactZh: "喉音 r 像轻量版刮喉音 g，假装打呼噜；舌尖 r 像玩具跑车“Vroom rrr——”，让舌头或喉咙颤起来。",
    funFactEn: "For throat r, think a softer g-like rumble; for tongue-tip r, think toy-car rrr.",
  },
  "sj / tj": {
    descriptionZh: "高频辅音组合，常出现在小化词词尾。",
    descriptionEn: "High-frequency consonant chunks, common in diminutive endings.",
    mnemonicZh: "sj 发中文“刷”的开头；tj 发中文“七”的开头，极度短促不送气。",
    mnemonicEn: "sj is like a clipped sh; tj is like a very short, light ch/tch.",
    funFactZh: "听到 sj 就想“嘘——安静！”；看到词尾 -tje，直接脑补成极轻巧可爱的“七/区”，一划而过。",
    funFactEn: "sj is the shh sound; -tje should feel tiny, quick, and cute.",
  },
  sch: {
    descriptionZh: "高频辅音组合。从“蛇叫”过渡到“刮喉咙”的连续动作。",
    descriptionEn: "A frequent consonant cluster: hiss first, then throat-scrape.",
    mnemonicZh: "先发类似“斯——”的漏气声，然后喉咙无缝接上清嗓子的“赫——”。",
    mnemonicEn: "Start with an s-like hiss, then connect straight into the Dutch throat-scrape.",
    funFactZh: "想象一条蛇先“斯——”地警告，突然喉咙卡了一下变成“赫——”。两个动作一气呵成，就是 sch。",
    funFactEn: "Imagine a snake hiss that suddenly turns into a throat-clearing scrape; connect both parts smoothly.",
  },
  "-en": {
    descriptionZh: "动词或复数核心词尾。最没有存在感的“隐形音”。",
    descriptionEn: "A core verb/plural ending, often reduced until it almost disappears.",
    mnemonicZh: "把尾音放轻、模糊化，像把声音吞进肚子里一样滑过去。",
    mnemonicEn: "Soften and blur the ending, almost swallowing it as you move on.",
    funFactZh: "荷兰人说这个词尾时很偷懒。像敷衍答应别人，从鼻子里轻轻“嗯”一下，最后的 n 常常不用重读。",
    funFactEn: "Dutch speakers often reduce this ending heavily; keep it lazy, light, and unstressed.",
  },
};

export function PronunciationSoundBoard() {
  const { language } = useLanguage();
  const [lastPlayed, setLastPlayed] = useState("");
  const [currentAudioSrc, setCurrentAudioSrc] = useState("");
  const [activePanel, setActivePanel] = useState<ActivePanel>("alphabet");
  const audioRef = useRef<HTMLAudioElement>(null);

  const play = (src: string, label: string) => {
    const audio = audioRef.current;
    if (!audio) return;
    const versionedSrc = `${src}?v=20260622-audio-6`;
    audio.pause();
    audio.currentTime = 0;
    audio.src = versionedSrc;
    setCurrentAudioSrc(versionedSrc);
    setLastPlayed(language === "zh" ? `正在播放：${label}` : `Playing: ${label}`);
    void audio.play().catch(() => {
      setLastPlayed(
        language === "zh"
          ? `音频没有播出来：${label}。请再点一次，或检查浏览器/系统音量。`
          : `Audio did not play: ${label}. Please click again or check browser/system volume.`,
      );
    });
  };

  const speakExampleWord = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setLastPlayed(language === "zh" ? `没有可播放的例词音频：${text}` : `No playable example audio: ${text}`);
      return;
    }
    audioRef.current?.pause();
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(",", "."));
    utterance.lang = "nl-NL";
    utterance.rate = 0.78;
    setCurrentAudioSrc("");
    setLastPlayed(language === "zh" ? `正在播放例词：${text}` : `Playing example word: ${text}`);
    window.speechSynthesis.speak(utterance);
  };

  const playExample = (src: string | undefined, label: string) => {
    if (src) {
      play(src, label);
      return;
    }
    speakExampleWord(label);
  };

  const panelOptions: {
    id: ActivePanel;
    title: string;
    body: string;
    count: string;
  }[] = [
    {
      id: "alphabet",
      title: language === "zh" ? "26 个字母" : "26 letters",
      body: language === "zh" ? "先认识字母名和基础例词。" : "Start with letter names and basic example words.",
      count: language === "zh" ? "A-Z" : "A-Z",
    },
    {
      id: "special",
      title: language === "zh" ? "特殊组合音" : "Special chunks",
      body: language === "zh" ? "再把荷兰语特有音整体记。" : "Then learn Dutch-specific chunks as whole sounds.",
      count: language === "zh" ? "17 个" : "17 sounds",
    },
    {
      id: "contrast",
      title: language === "zh" ? "易混音对比" : "Sound contrasts",
      body: language === "zh" ? "最后校准短长音和相近口型。" : "Finally calibrate short/long and similar mouth shapes.",
      count: language === "zh" ? "6 组" : "6 sets",
    },
  ];


  return (
    <section className="rounded-[34px] border border-blue-100 bg-white p-5 shadow-soft sm:p-7">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-black tracking-[0.18em] text-pop">A0 Sound Foundation</p>
          <h2 className="mt-3 text-4xl font-black text-ink">
            {language === "zh" ? "先学 26 个字母，再学特殊发音" : "Start with 26 letters, then special sounds"}
          </h2>
          <p className="mt-3 max-w-3xl font-bold leading-7 text-ocean/70">
            {language === "zh"
              ? "第一步不是背单词，而是先知道每个字母怎么读、常见组合音怎么读。点每个泡泡试听，再跟读。"
              : "The first step is not memorizing words. Learn how each letter and common sound combination reads, then listen and repeat."}
          </p>
        </div>
        <span className="w-fit rounded-full bg-skywash px-4 py-2 text-sm font-black text-ocean">
          {language === "zh" ? "听音 + 跟读练习" : "Listen + repeat practice"}
        </span>
      </div>
      <div className="mt-5 rounded-2xl bg-skywash px-4 py-3 text-sm font-bold leading-6 text-ocean/75">
        {lastPlayed ||
          (language === "zh"
      ? "每张卡都有两个试听：字母区听字母名和例词；组合音区先听“音本身”，再听例词。"
      : "Each card has two audio actions: letters play letter names and example words; sound chunks play the sound itself first, then an example word.")}
        <audio ref={audioRef} controls className="mt-3 w-full" preload="auto">
          {currentAudioSrc && <source src={currentAudioSrc} type="audio/wav" />}
        </audio>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-3">
        {panelOptions.map((panel) => {
          const isActive = activePanel === panel.id;
          return (
            <button
              key={panel.id}
              type="button"
              onClick={() => setActivePanel(panel.id)}
              className={`min-h-[122px] rounded-[24px] p-4 text-left ring-1 transition ${
                isActive
                  ? "bg-ink text-white shadow-soft ring-ink"
                  : "bg-white text-ink ring-blue-100 hover:bg-skywash"
              }`}
            >
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                  isActive ? "bg-white/15 text-peach" : "bg-skywash text-ocean"
                }`}
              >
                {panel.count}
              </span>
              <p className="mt-4 text-xl font-black">{panel.title}</p>
              <p className={`mt-2 text-sm font-bold leading-6 ${isActive ? "text-white/70" : "text-ocean/65"}`}>
                {panel.body}
              </p>
            </button>
          );
        })}
      </div>

      {activePanel === "alphabet" ? (
      <div className="mt-7">
        <p className="text-sm font-black tracking-[0.16em] text-pop">{language === "zh" ? "荷兰语字母" : "Dutch alphabet"}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {alphabet.map((item) => (
            <article key={item.letter} className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-blue-100">
              <div className="flex items-start justify-between gap-2">
                <span className="text-2xl font-black text-ink">{item.letter.toUpperCase()}</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => play(item.audioSrc, `${item.letter.toUpperCase()} · ${item.name}`)}
                    className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1.5 text-xs font-black text-pop ring-1 ring-blue-100 transition hover:bg-peach"
                    aria-label={`Play Dutch letter name ${item.letter}`}
                    title={language === "zh" ? "听字母" : "Hear letter"}
                  >
                    <Volume2 size={14} />
                    {language === "zh" ? "字母" : "Letter"}
                  </button>
                </div>
              </div>
              <span className="text-sm font-black text-ocean/80">{item.name}</span>
              <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2">
                <span className="text-xs font-bold text-ocean/60">{item.example}</span>
                <button
                  type="button"
                  onClick={() => playExample(item.exampleAudioSrc, item.example)}
                  className="inline-flex items-center gap-1 rounded-full bg-skywash px-2 py-1.5 text-xs font-black text-pop transition hover:bg-peach"
                  aria-label={`Play Dutch example word ${item.example}`}
                  title={language === "zh" ? "听例词" : "Hear example word"}
                >
                  <Volume2 size={13} />
                  {language === "zh" ? "例词" : "Word"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
      ) : null}

      {activePanel === "contrast" ? (
      <div className="mt-8">
        <p className="text-sm font-black tracking-[0.16em] text-pop">{language === "zh" ? "重点发音对比" : "Key sound contrasts"}</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {focusGroups.map((group) => (
            <article key={group.title} className="rounded-[24px] border border-blue-100 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-black text-ink">{group.title}</h3>
                  <p className="mt-2 text-sm font-bold leading-6 text-ocean/70">{language === "zh" ? group.noteZh : group.noteEn}</p>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <p className="rounded-2xl bg-peach px-3 py-2 text-xs font-black leading-5 text-ocean">
                  <span className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-pop">
                    {language === "zh" ? "记忆动作" : "Mouth cue"}
                  </span>
                  {language === "zh" ? group.mouthZh : group.mouthEn}
                </p>
                {group.funFactZh ? (
                  <p className="rounded-2xl bg-skywash px-3 py-2 text-xs font-bold leading-5 text-ocean/65">
                    <span className="font-black text-pop">
                      {language === "zh" ? "脑内小剧场：" : "Mental image: "}
                    </span>
                    {language === "zh" ? group.funFactZh : group.funFactEn}
                  </p>
                ) : null}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {group.items.map((item) => (
                  <button
                    key={`${group.title}-${item.label}-${item.word}`}
                    type="button"
                    onClick={() => {
                      const label = `${item.label} · ${item.word}`;
                      if (item.audioSrc) {
                        play(item.audioSrc, label);
                        return;
                      }
                      speakExampleWord(item.word);
                    }}
                    className="flex items-center justify-between gap-2 rounded-2xl bg-slate-50 px-3 py-3 text-left ring-1 ring-blue-100 transition hover:bg-peach"
                    aria-label={`Play Dutch contrast ${item.label} ${item.word}`}
                  >
                    <span>
                      <span className="block text-sm font-black text-pop">{item.label}</span>
                      <span className="block text-lg font-black text-ink">{item.word}</span>
                    </span>
                    <Volume2 size={16} className="shrink-0 text-pop" />
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
      ) : null}

      {activePanel === "special" ? (
      <div className="mt-8">
        <p className="text-sm font-black tracking-[0.16em] text-pop">{language === "zh" ? "特殊发音和组合音" : "Special sounds and combinations"}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {specialSounds.map((item) => {
            const story = specialSoundStories[item.sound];
            return (
              <article
                key={item.sound}
                className="rounded-[22px] bg-skywash p-4 text-left ring-1 ring-blue-100"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-2xl font-black text-ink">{item.sound}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const label = language === "zh" ? `${item.sound} 音本身` : `${item.sound} sound itself`;
                      if (item.isolatedAudioSrc) {
                        play(item.isolatedAudioSrc, label);
                        return;
                      }
                      speakExampleWord(item.sound);
                    }}
                    className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1.5 text-xs font-black text-pop ring-1 ring-blue-100 transition hover:bg-peach"
                    aria-label={`Play Dutch sound ${item.sound}`}
                    title={language === "zh" ? "听特殊音" : "Hear sound"}
                  >
                    <Volume2 size={15} />
                    {language === "zh" ? "音本身" : "Sound"}
                  </button>
                </div>
                <p className="mt-2 text-xs font-black text-ocean/60">
                  {language === "zh" ? "先听组合音本身，不先听单词。" : "Hear the isolated sound first, before the word."}
                </p>
                {story ? (
                  <div className="mt-3 space-y-2">
                    <div className="rounded-2xl bg-peach px-3 py-2 text-xs font-black leading-5 text-ocean">
                      <span className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-pop">
                        {language === "zh" ? "声音感觉" : "Sound feel"}
                      </span>
                      {language === "zh" ? story.descriptionZh : story.descriptionEn}
                    </div>
                    <div className="rounded-2xl bg-white/80 px-3 py-2 text-xs font-black leading-5 text-ocean">
                      <span className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-pop">
                        {language === "zh" ? "记忆动作" : "Mouth cue"}
                      </span>
                      {language === "zh" ? story.mnemonicZh : story.mnemonicEn}
                    </div>
                  </div>
                ) : specialSoundAssociations[item.sound] ? (
                  <p className="mt-3 rounded-2xl bg-peach px-3 py-2 text-xs font-black leading-5 text-ocean">
                    {language === "zh"
                      ? specialSoundAssociations[item.sound].zh
                      : specialSoundAssociations[item.sound].en}
                  </p>
                ) : null}
                <div className="mt-3 flex items-center justify-between gap-2 rounded-2xl bg-white px-3 py-2">
                  <p className="text-sm font-bold text-ocean/70">{item.example}</p>
                  <button
                    type="button"
                    onClick={() => playExample(item.exampleAudioSrc, item.example)}
                    className="inline-flex items-center gap-1 rounded-full bg-skywash px-2 py-1.5 text-xs font-black text-pop transition hover:bg-peach"
                    aria-label={`Play Dutch example word ${item.example}`}
                    title={language === "zh" ? "听例词" : "Hear example word"}
                  >
                    <Volume2 size={14} />
                    {language === "zh" ? "例词" : "Word"}
                  </button>
                </div>
                {story ? (
                  <p className="mt-2 rounded-2xl bg-white/70 px-3 py-2 text-xs font-bold leading-5 text-ocean/65">
                    <span className="font-black text-pop">{language === "zh" ? "脑内小剧场：" : "Mental image: "}</span>
                    {language === "zh" ? story.funFactZh : story.funFactEn}
                  </p>
                ) : (
                  <p className="mt-1 text-xs font-bold text-ocean/55">{language === "zh" ? item.hintZh : item.hintEn}</p>
                )}
              </article>
            );
          })}
        </div>
      </div>
      ) : null}
    </section>
  );
}
