# B1 And All-Level Vocabulary Refinement Report

## Scope

This pass adjusts the existing NedPop vocabulary and daily-pack pipeline. It does not introduce a new vocabulary system and it does not copy protected textbook word lists.

Public B1 material was used as a theme and task reference:

- NT2 TaalMenu B1 menu: https://nt2taalmenu.nl/nt2-b1-menu/
- TaalCompleet B1 public method page: https://kleurrijker.nl/taalcompleet-b1/
- Nederlands in actie public product page: https://www.nt2.nl/nl/product/100-17429_Nederlands-in-actie
- DUO/Inburgeren language exam content A2/B1/B2: https://www.inburgeren.nl/examen-doen/inhoud-taalexamens-a2-b1-b2.jsp
- DUO/Inburgeren practice page: https://www.inburgeren.nl/examen-doen/oefenen.jsp

These sources are treated as public theme evidence. The words are NedPop learning words suitable for those levels and tasks, not official required exam words.

## Modified Files

- `data/b1VocabularyThemes.ts`
- `data/vocabularyPlan.ts`
- `lib/generateDailyWordPacks.ts`
- `lib/wordAssociations.ts`
- `app/word-link/page.tsx`
- `app/dashboard/page.tsx`
- `data/pricingPlans.ts`
- `docs/vocabulary-level-audit.md`
- `docs/b1-and-all-level-vocabulary-refinement-report.md`

## B1 Main Adjustments

B1 was changed from a narrow work/study layer into a textbook-aligned independent-task layer.

- Target range changed to `800-950 textbook-aligned B1 words`.
- Current B1 generated word pool is now 878 words.
- B1 daily word-bubble path is now 70 days.
- B1 UI copy now says `B1 独立任务表达 / B1 Independent Task Dutch`.
- B1 source tags now include `staatsexamen-nt2` and `nt2-taalmenu`.
- B1 daily packs prioritize identity, health, neighborhood, money/budget, work, education, travel, environment, media, culture, opinions, presentations, reading/writing, digital/public-service tasks.

## B1 Themes Added Or Strengthened

New textbook-theme B1 groups were added:

- self-expression
- relationships and social contact
- travel and mobility
- environment and sustainability
- media and information
- culture and art
- opinion and discussion
- presentation and meeting
- money and budget
- health, work, and care
- neighborhood participation
- workplace and customers
- study strategies and exam preparation
- language structure and output
- the Netherlands and civic information
- language learning
- formal emails and requests
- reading and listening skills
- internship and education
- everyday problem solving

The existing B1 groups for work, official letters, digital public services, tax/benefits, health care, transport, safety/law, community news, shopping service, and output phrases remain in the pool.

## Content Completion

The generator was repaired so supplement words reuse real known content from:

- public vocabulary additions
- syllabus vocabulary
- smart words
- curated supplement meanings
- exact overrides

This avoids placeholder meanings such as `B1 theme word: ...` or `A2 theme word: ...` in learner-visible packs.

The word-association filter was also adjusted so textbook-theme related words are still visible for phrase entries. This keeps B1 phrase words from appearing as isolated labels without memory bubbles.

## A0-A2 Follow-Up Check

After the B1 change, all current A0-B1 word items were checked for:

- non-empty Dutch example sentence
- Chinese and English example meaning
- at least one phrase chunk
- no placeholder `theme word: ...` meaning
- at least two visible B1 memory associations

Remaining old A2 issues were fixed with exact meanings or overrides for service-desk and practical-task words, including `volgnummer`, `wachtrij`, `sluitingstijd`, `servicepunt`, `informatiebalie`, `controle`, `urgentie`, `dossier`, `voorraad`, `gebruik`, `storing`, `openstaand`, `terugbetaling`, `verzekeraar`, `doorverbinden`, `bereikbaar`, `tijdstip`, `schoolarts`, `wijkteam`, `inburgering`, `taalcursus`, `gemeenteloket`, `noodgeval`, and past-event forms such as `gebeld`, `gekregen`, `gestuurd`, `betaald`, `verloren`, `gewacht`.

## Final Counts

- A0: 188 word items, 20 daily packs.
- A1: 650 word items, 65 daily packs.
- A2: 710 word items, 60 daily packs.
- B1: 878 word items, 70 daily packs.

## Uncertain / Manual Confirmation

These areas should stay editorially watched because level placement depends on product positioning and learner audience:

- A2 vs B1 boundary for tax/benefit words.
- A2 recognition vs B1 active placement for legal/safety terms.
- B1 culture/art and media terms for learners focused only on inburgering rather than broader NT2 textbook study.
- B1 grammar-metalanguage words such as `bijzin`, `hoofdzin`, `verwijswoord`, and `verbindingswoord`.

They are included as suitable B1 learning candidates, not as official required exam terms.

## Verification

- All-level content check: 0 issues.
- TypeScript: `pnpm exec tsc --noEmit` passed when run with the bundled Node path in `PATH`.
