# NedPop Example Sentence Generator

这是 NedPop 的例句生成规则说明。目标不是用一个模板填满所有词，而是生成可审核、可修改、可放进课程的候选例句。

## Core Flow

```text
WordItem
-> infer wordType
-> check level
-> read scenarioTags
-> find phrase chunks / collocations
-> generate examples from collocations and micro-scenario
-> check level difficulty and known errors
-> mark confidence and human review status
-> creator accepts / edits / rejects
-> localStorage override becomes effective content
```

## Product Rule

例句生成器不是为了省掉审核，而是为了让 creator 不用从零手写几千个例句。

High-confidence suggestions can be accepted quickly. Low-confidence suggestions must stay in review.

## Dictionary And Corpus Reference Policy

NedPop can use public lexical references to verify word type, spelling, common forms, and likely collocations. These references are for guidance and checking, not for copying commercial content.

Preferred reference use:

- Woordenlijst Nederlandse Taal / INT: verify spelling, word class, conjugation, and inflected forms.
- INT dictionary APIs and collocation resources: verify whether a chunk is plausible before adding it to the internal reference bank.
- Wiktionary: check open dictionary data and word-family hints where licensing is compatible.
- Tatoeba: check whether a sentence pattern sounds common and daily-life oriented when license and attribution rules are respected.

Do not copy:

- Commercial dictionary example sentences.
- Textbook exercise sentences.
- Official exam questions.
- Audio or example lines from paid sources.

NedPop should create original examples after checking the usage pattern. For example, a dictionary may confirm that `een afspraak maken` is a real chunk, but NedPop writes its own beginner sentence such as `Ik wil graag een afspraak maken.`

## Do Not Use One Template For All Words

Bad:

- `Dit is het adres.`
- `Dit is het formulier.`
- `Dit is de rekening.`
- `Dit is de afspraak.`

Better:

- `Ik vul mijn adres in.`
- `Ik moet het formulier invullen.`
- `Ik moet de rekening betalen.`
- `Ik wil graag een afspraak maken.`

## Collocation First

Words should first look for real usage chunks.

Examples:

- `adres`: `mijn adres`, `uw adres`, `het adres invullen`, `mijn adres veranderen`
- `afspraak`: `een afspraak maken`, `een afspraak verzetten`, `een afspraak afzeggen`
- `rekening`: `de rekening betalen`, `een rekening krijgen`, `de rekening uitleggen`
- `hulp`: `hulp nodig hebben`, `om hulp vragen`, `bedankt voor uw hulp`
- `helpen`: `iemand helpen`, `helpen met ...`, `Kunt u mij helpen?`

## Word Type Rules

Nouns use article-aware chunks when useful.

Verbs must use real conjugated forms or natural infinitive chunks.

Adjectives should describe a real thing or situation.

Function words must appear inside real sentences.

Language names must not create misleading plurals. `Engels` means the language. `Engelsen` means English people and is not taught as a plural of `het Engels`.

Numbers are special. They can be grouped and practiced by recognition, pronunciation, and order. They do not need forced phrase chunks or output sentences.

## Level Rules

A0 examples should be extremely short:

- `Hallo.`
- `Dank je.`
- `Ik ben Lin.`
- `Ik leer Nederlands.`

A1 examples should be concrete daily-life present tense:

- `Ik koop brood.`
- `Ik ga naar school.`
- `Mijn fiets is rood.`

A2 examples should be practical scenario language:

- `Ik wil graag een afspraak maken.`
- `Ik moet het formulier invullen.`
- `Kunt u dat herhalen?`

## Creator Workflow

The generator creates suggestions only. It should not overwrite approved creator content.

Accepted suggestions are saved through the same localStorage override layer that the learner-facing Word Link page reads.

## Effective Content Fallback

The learner-facing Word Link page reads the effective content layer:

```text
base seed content + creator localStorage overrides + safe generated fallbacks
```

Priority:

1. Use approved / usable creator examples when they exist.
2. If creator examples are empty or clearly broken, use high-confidence generated examples.
3. If the word is a number, do not force phrase chunks or output sentences.
4. Low-confidence generated examples stay in Creator review and should not be shown as learner-ready content.

This means creator edits still win, but bad empty examples no longer block better generated fallback examples.
