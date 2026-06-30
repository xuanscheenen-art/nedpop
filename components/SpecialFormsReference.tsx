"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  comparisonForms,
  irregularPastVerbs,
  perfectumForms,
  presentSpecialVerbs,
  separableVerbForms,
  specialFormSections,
} from "@/data/specialForms";
import type {
  ComparisonForm,
  IrregularPastVerb,
  PerfectumForm,
  PresentSpecialVerb,
  SeparableVerbForm,
  SpecialFormSection,
} from "@/types/specialForms";

type SpecialFormsReferenceProps = {
  language: "zh" | "en";
  sections?: SpecialFormSection[];
  showIndex?: boolean;
};

const allSections: SpecialFormSection[] = [
  "present-special-verb",
  "irregular-past",
  "perfectum",
  "separable-verb",
  "comparison",
];

const sectionOrder: Record<SpecialFormSection, number> = {
  "present-special-verb": 1,
  "irregular-past": 2,
  perfectum: 3,
  "separable-verb": 4,
  comparison: 5,
};

const levelClass = "rounded-full bg-skywash px-3 py-1 text-xs font-black text-ocean";
const tableHeadClass = "px-4 py-3 text-left text-xs font-black uppercase tracking-[0.12em] text-ocean/60";
const tableCellClass = "border-t border-blue-50 px-4 py-3 align-top text-sm font-bold text-ocean/75";
const strongCellClass = "border-t border-blue-50 px-4 py-3 align-top text-base font-black text-ink";

const getMeaning = (language: "zh" | "en", item: { meaningZh: string; meaningEn: string }) =>
  language === "zh" ? item.meaningZh : item.meaningEn;
const getNote = (language: "zh" | "en", noteZh: string) => (language === "zh" ? noteZh : "-");

function ReferenceIndex({ language, sections }: { language: "zh" | "en"; sections: SpecialFormSection[] }) {
  return (
    <nav className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {sections.map((section) => {
        const meta = specialFormSections[section];
        return (
          <Link
            key={section}
            href={`#${meta.id}`}
            className="rounded-[22px] bg-white p-4 ring-1 ring-blue-100 transition hover:bg-peach"
          >
            <span className="text-sm font-black tracking-[0.14em] text-pop">
              {language === "zh" ? `模式 ${sectionOrder[section]}` : `Pattern ${sectionOrder[section]}`}
            </span>
            <span className="mt-2 block text-lg font-black text-ink">{language === "zh" ? meta.titleZh : meta.titleEn}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function SectionShell({
  section,
  language,
  count,
  children,
}: {
  section: SpecialFormSection;
  language: "zh" | "en";
  count: number;
  children: ReactNode;
}) {
  const meta = specialFormSections[section];

  return (
    <section id={meta.id} className="scroll-mt-28 rounded-[34px] border border-blue-100 bg-white p-5 shadow-soft sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black tracking-[0.16em] text-pop">
            {language === "zh" ? `模式 ${sectionOrder[section]}` : `Pattern ${sectionOrder[section]}`}
          </p>
          <h2 className="mt-2 text-3xl font-black text-ink">{language === "zh" ? meta.titleZh : meta.titleEn}</h2>
          <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-ocean/70">{language === "zh" ? meta.introZh : meta.introEn}</p>
        </div>
        <span className="w-fit rounded-full bg-skywash px-4 py-2 text-sm font-black text-ocean">
          {count} {language === "zh" ? "条" : "items"}
        </span>
      </div>
      <div className="overflow-x-auto rounded-[24px] ring-1 ring-blue-100">{children}</div>
    </section>
  );
}

function PresentSpecialTable({ language }: { language: "zh" | "en" }) {
  return (
    <SectionShell section="present-special-verb" language={language} count={presentSpecialVerbs.length}>
      <table className="min-w-[980px] w-full bg-white">
        <thead className="bg-slate-50">
          <tr>
            <th className={tableHeadClass}>{language === "zh" ? "动词" : "Verb"}</th>
            <th className={tableHeadClass}>{language === "zh" ? "意思" : "Meaning"}</th>
            <th className={tableHeadClass}>ik</th>
            <th className={tableHeadClass}>jij/je</th>
            <th className={tableHeadClass}>hij/zij/het</th>
            <th className={tableHeadClass}>wij/we</th>
            <th className={tableHeadClass}>jullie/zij</th>
            <th className={tableHeadClass}>{language === "zh" ? "备注" : "Note"}</th>
          </tr>
        </thead>
        <tbody>
          {presentSpecialVerbs.map((item) => (
            <tr key={item.id}>
              <td className={strongCellClass}>
                <div className="flex items-center gap-2">
                  {item.infinitive}
                  <span className={levelClass}>{item.level}</span>
                </div>
              </td>
              <td className={tableCellClass}>{getMeaning(language, item)}</td>
              <td className={strongCellClass}>{item.forms.ik}</td>
              <td className={strongCellClass}>{item.forms.jijJe}</td>
              <td className={strongCellClass}>{item.forms.hijZijHet}</td>
              <td className={strongCellClass}>{item.forms.wijWe}</td>
              <td className={strongCellClass}>{item.forms.jullie}</td>
              <td className={tableCellClass}>{getNote(language, item.noteZh)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </SectionShell>
  );
}

function IrregularPastTable({ language }: { language: "zh" | "en" }) {
  return (
    <SectionShell section="irregular-past" language={language} count={irregularPastVerbs.length}>
      <table className="min-w-[980px] w-full bg-white">
        <thead className="bg-slate-50">
          <tr>
            <th className={tableHeadClass}>{language === "zh" ? "动词原形" : "Infinitive"}</th>
            <th className={tableHeadClass}>{language === "zh" ? "意思" : "Meaning"}</th>
            <th className={tableHeadClass}>{language === "zh" ? "过去单数" : "Past singular"}</th>
            <th className={tableHeadClass}>{language === "zh" ? "过去复数" : "Past plural"}</th>
            <th className={tableHeadClass}>{language === "zh" ? "过去分词" : "Participle"}</th>
            <th className={tableHeadClass}>{language === "zh" ? "完成式助动词" : "Auxiliary"}</th>
            <th className={tableHeadClass}>{language === "zh" ? "备注" : "Note"}</th>
          </tr>
        </thead>
        <tbody>
          {irregularPastVerbs.map((item) => (
            <tr key={item.id}>
              <td className={strongCellClass}>
                <div className="flex items-center gap-2">
                  {item.infinitive}
                  <span className={levelClass}>{item.level}</span>
                </div>
              </td>
              <td className={tableCellClass}>{getMeaning(language, item)}</td>
              <td className={strongCellClass}>{item.pastSingular}</td>
              <td className={strongCellClass}>{item.pastPlural}</td>
              <td className={strongCellClass}>{item.pastParticiple}</td>
              <td className={strongCellClass}>{item.auxiliary}</td>
              <td className={tableCellClass}>{getNote(language, item.noteZh)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </SectionShell>
  );
}

function PerfectumTable({ language }: { language: "zh" | "en" }) {
  return (
    <SectionShell section="perfectum" language={language} count={perfectumForms.length}>
      <table className="min-w-[920px] w-full bg-white">
        <thead className="bg-slate-50">
          <tr>
            <th className={tableHeadClass}>{language === "zh" ? "动词原形" : "Infinitive"}</th>
            <th className={tableHeadClass}>{language === "zh" ? "意思" : "Meaning"}</th>
            <th className={tableHeadClass}>{language === "zh" ? "过去分词" : "Participle"}</th>
            <th className={tableHeadClass}>{language === "zh" ? "助动词" : "Auxiliary"}</th>
            <th className={tableHeadClass}>{language === "zh" ? "常见完成式块" : "Perfect chunk"}</th>
            <th className={tableHeadClass}>{language === "zh" ? "备注" : "Note"}</th>
          </tr>
        </thead>
        <tbody>
          {perfectumForms.map((item) => (
            <tr key={item.id}>
              <td className={strongCellClass}>
                <div className="flex items-center gap-2">
                  {item.infinitive}
                  <span className={levelClass}>{item.level}</span>
                </div>
              </td>
              <td className={tableCellClass}>{getMeaning(language, item)}</td>
              <td className={strongCellClass}>{item.pastParticiple}</td>
              <td className={strongCellClass}>{item.auxiliary}</td>
              <td className={strongCellClass}>{item.perfectChunk}</td>
              <td className={tableCellClass}>{getNote(language, item.noteZh)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </SectionShell>
  );
}

function SeparableVerbTable({ language }: { language: "zh" | "en" }) {
  return (
    <SectionShell section="separable-verb" language={language} count={separableVerbForms.length}>
      <table className="min-w-[980px] w-full bg-white">
        <thead className="bg-slate-50">
          <tr>
            <th className={tableHeadClass}>{language === "zh" ? "动词" : "Verb"}</th>
            <th className={tableHeadClass}>{language === "zh" ? "意思" : "Meaning"}</th>
            <th className={tableHeadClass}>{language === "zh" ? "前缀" : "Prefix"}</th>
            <th className={tableHeadClass}>{language === "zh" ? "基础动词" : "Base verb"}</th>
            <th className={tableHeadClass}>{language === "zh" ? "是否可分" : "Separable"}</th>
            <th className={tableHeadClass}>{language === "zh" ? "完成式" : "Perfect"}</th>
            <th className={tableHeadClass}>{language === "zh" ? "备注" : "Note"}</th>
          </tr>
        </thead>
        <tbody>
          {separableVerbForms.map((item) => (
            <tr key={item.id}>
              <td className={strongCellClass}>
                <div className="flex items-center gap-2">
                  {item.infinitive}
                  <span className={levelClass}>{item.level}</span>
                </div>
              </td>
              <td className={tableCellClass}>{getMeaning(language, item)}</td>
              <td className={strongCellClass}>{item.prefix || "-"}</td>
              <td className={strongCellClass}>{item.baseVerb}</td>
              <td className={tableCellClass}>{item.isSeparable ? (language === "zh" ? "是" : "Yes") : (language === "zh" ? "否" : "No")}</td>
              <td className={strongCellClass}>{item.perfectParticiple}</td>
              <td className={tableCellClass}>{getNote(language, item.noteZh)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </SectionShell>
  );
}

function ComparisonTable({ language }: { language: "zh" | "en" }) {
  return (
    <SectionShell section="comparison" language={language} count={comparisonForms.length}>
      <table className="min-w-[760px] w-full bg-white">
        <thead className="bg-slate-50">
          <tr>
            <th className={tableHeadClass}>{language === "zh" ? "原级" : "Base"}</th>
            <th className={tableHeadClass}>{language === "zh" ? "意思" : "Meaning"}</th>
            <th className={tableHeadClass}>{language === "zh" ? "比较级" : "Comparative"}</th>
            <th className={tableHeadClass}>{language === "zh" ? "最高级" : "Superlative"}</th>
            <th className={tableHeadClass}>{language === "zh" ? "备注" : "Note"}</th>
          </tr>
        </thead>
        <tbody>
          {comparisonForms.map((item) => (
            <tr key={item.id}>
              <td className={strongCellClass}>
                <div className="flex items-center gap-2">
                  {item.base}
                  <span className={levelClass}>{item.level}</span>
                </div>
              </td>
              <td className={tableCellClass}>{getMeaning(language, item)}</td>
              <td className={strongCellClass}>{item.comparative}</td>
              <td className={strongCellClass}>{item.superlative}</td>
              <td className={tableCellClass}>{getNote(language, item.noteZh)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </SectionShell>
  );
}

export function SpecialFormsReference({ language, sections = allSections, showIndex = true }: SpecialFormsReferenceProps) {
  return (
    <div className="space-y-7">
      {showIndex ? <ReferenceIndex language={language} sections={sections} /> : null}
      {sections.includes("present-special-verb") ? <PresentSpecialTable language={language} /> : null}
      {sections.includes("irregular-past") ? <IrregularPastTable language={language} /> : null}
      {sections.includes("perfectum") ? <PerfectumTable language={language} /> : null}
      {sections.includes("separable-verb") ? <SeparableVerbTable language={language} /> : null}
      {sections.includes("comparison") ? <ComparisonTable language={language} /> : null}
    </div>
  );
}
