import type { CourseLevel } from "@/types/course";

export type SpecialFormLevel = Extract<CourseLevel, "A0" | "A1" | "A2" | "B1">;

export type SpecialFormSection =
  | "present-special-verb"
  | "irregular-past"
  | "perfectum"
  | "separable-verb"
  | "comparison";

export type Auxiliary = "hebben" | "zijn" | "both";

export type SourceId =
  | "nt2-irregular-verbs"
  | "taalthuis-irregular-verbs"
  | "dutch-online-academy-irregular-perfectum"
  | "dutch-online-academy-perfectum"
  | "zichtbaar-nederlands-separable-verbs"
  | "nt2-taalmenu-a1-word-lists"
  | "taalboost-frequent-verbs-a2"
  | "nedpop-editorial";

type SpecialFormBase = {
  id: string;
  section: SpecialFormSection;
  level: SpecialFormLevel;
  sourceIds: SourceId[];
  meaningZh: string;
  meaningEn: string;
  exampleSentence: string;
  exampleMeaningZh: string;
  audioText: string;
  noteZh: string;
  memoryHintZh?: string;
};

export type PresentSpecialVerb = SpecialFormBase & {
  section: "present-special-verb";
  infinitive: string;
  forms: {
    ik: string;
    jijJe: string;
    hijZijHet: string;
    wijWe: string;
    jullie: string;
    zijZe: string;
  };
};

export type IrregularPastVerb = {
  id: string;
  section: "irregular-past";
  level: SpecialFormLevel;
  sourceIds: SourceId[];
  infinitive: string;
  meaningZh: string;
  meaningEn: string;
  pastSingular: string;
  pastPlural: string;
  pastParticiple: string;
  auxiliary: Auxiliary;
  examplePast: string;
  examplePerfect: string;
  exampleMeaningZh: string;
  audioText: string;
  noteZh: string;
  memoryHintZh?: string;
};

export type PerfectumForm = SpecialFormBase & {
  section: "perfectum";
  infinitive: string;
  pastParticiple: string;
  auxiliary: Auxiliary;
  perfectChunk: string;
};

export type SeparableVerbForm = SpecialFormBase & {
  section: "separable-verb";
  infinitive: string;
  prefix: string;
  baseVerb: string;
  isSeparable: boolean;
  presentExample: string;
  perfectParticiple: string;
  perfectExample: string;
};

export type ComparisonForm = SpecialFormBase & {
  section: "comparison";
  base: string;
  comparative: string;
  superlative: string;
};

export type SpecialFormEntry =
  | PresentSpecialVerb
  | IrregularPastVerb
  | PerfectumForm
  | SeparableVerbForm
  | ComparisonForm;
