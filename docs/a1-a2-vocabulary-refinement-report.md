# A1/A2 Vocabulary Refinement Report

## Scope

This pass only adjusts the existing NedPop vocabulary and daily-pack data flow. It does not rebuild a new vocabulary system.

The reference frame is public A1/A2 Dutch learning material and public inburgering/A2 task practice. These sources are used as theme and task references, not as official required-word lists:

- TaalCompleet A1/A2 public method pages and samples: https://kleurrijker.nl/taalcompleet/
- NT2 TaalMenu A1 practice scope: https://www.nt2taalmenu.nl/nt2-a1/
- NT2 TaalMenu A2 practice menu: https://nt2taalmenu.nl/nt2-a2-menu/
- DUO/Inburgeren A2 practice exams: https://www.inburgeren.nl/examen-doen/oefenen.jsp
- DUO/Inburgeren A2/B1/B2 language exam content: https://www.inburgeren.nl/examen-doen/inhoud-taalexamens-a2-b1-b2.jsp

## Modified Files

- `data/publicVocabularyAdditions.ts`
- `data/vocabularyPlan.ts`
- `lib/generateDailyWordPacks.ts`
- `lib/wordAssociations.ts`
- `app/word-link/page.tsx`
- `data/pricingPlans.ts`
- `docs/vocabulary-level-audit.md`
- `docs/a1-a2-vocabulary-refinement-report.md`

`data/dailyWordPacks.ts` was inspected but not edited directly. Daily packs are generated from `wordItems` through `generateDailyWordPacks`, so the stable fix is in source vocabulary and pack-generation config.

## A1 Main Adjustments

A1 is now treated as a larger daily-life foundation rather than a fixed 450-word cap.

- Target range changed to about 600-700 active words.
- Daily word-bubble path changed to 65 days.
- A1 selection target changed to 650 active words.
- A1 content emphasis was strengthened around weekdays, meals, groceries, payment, basic transport, basic verbs, simple health, and common function words.
- Several basic daily words that had drifted into A2 were moved back to A1, because they are needed before A2 tasks can be done naturally.

## A2 Main Adjustments

A2 is now treated as a practical life-task layer for inburgering-style living tasks, not only a small add-on after A1.

- Target range changed to about 650-750 practical words.
- Daily word-bubble path changed to 60 days.
- A2 source selection changed to 580 active task words plus 140 recognition words.
- A2 content emphasis was strengthened around GP/pharmacy, appointments, forms, municipality, address changes, housing/rent, sick leave, transport disruption, bills, insurance, email, phone, complaints, and asking for help.
- More specialized tax/legal/work-contract/public-health terms remain B1 candidates or manual-confirm items unless they are clearly needed for A2 daily tasks.

## Added Or Reinforced Words

A1 additions/reinforcements:

`dinsdag`, `woensdag`, `donderdag`, `zaterdag`, `zondag`, `water`, `ontbijt`, `lunch`, `avondeten`, `diner`, `boodschappen`, `boodschappen doen`, `kopen`, `betalen`, `pinnen`, `zoeken`, `vinden`, `maken`, `doen`, `lopen`, `tram`, `metro`, `begrijpen`, `spreken`, `wonen`.

A2 additions/reinforcements:

`verhuizing`, `verhuisdatum`, `nieuw adres`, `oude adres`, `postadres`, `inschrijving bevestigen`, `afspraak verplaatsen`, `afspraak annuleren`, `terugbellen`, `bereikbaar zijn`, `klantnummer`, `kenmerk vermelden`, `betalingsbewijs`, `huur betalen`, `medicijnen ophalen`, `pijn aangeven`, `klacht uitleggen`, `formulier opsturen`, `bijlage toevoegen`, `hulp vragen`.

For these added/reinforced words, content was completed with learner-facing examples, phrase chunks, memory hooks, related words, and memory-link bubbles through the existing override/data model.

## Level Adjustments

Moved from A1 to A2 because they are more practical-task/admin/medical than beginner daily-life core:

`formulier`, `handtekening`, `printen`, `scannen`, `kopiëren`, `stempel`, `mapje`, `afspraakkaart`, `zorgkaart`, `assistente`, `wachtkamer`, `apotheek`, `huisartspraktijk`, `tablet`, `zalf`, `slikken`, `ademen`, `vallen`, `bloeden`, `pijn doen`, `gemeente`, `loket`, `nummer trekken`, `brief`, `bericht`, `pakket`, `paspoort`, `rijbewijs`, plus earlier audited admin/transport/service words.

Moved from A2 to A1 because they are basic daily-life/function words:

`boodschappen`, `gezond`, `koorts`, `stoppen`, `proberen`, `vertellen`, `weten`, `denken`, `meenemen`, `dicht`, `gratis`, `eenvoudig`, `rustig`, `want`, `daarom`, `ook`, `nog`, `al`.

Kept or restored in A2:

`openingstijden` stays in A2 because it is highly relevant for municipality, pharmacy, service desk, and appointment tasks.

## Themes Strengthened

A1:

- weekdays and daily time
- meals and drinks
- supermarket and payment
- basic city transport
- core daily verbs
- simple health
- function words for short A1 sentences

A2:

- moving and address changes
- appointment changes and cancellations
- phone reachability and callback tasks
- customer/reference numbers
- payment proof and rent payment
- pharmacy pickup and pain explanation
- complaint/problem explanation
- sending forms and adding attachments
- asking for help

## Content Completion

For all words added or adjusted in this pass, the target content check now requires:

- non-empty Dutch example sentence
- Chinese and English example meaning
- at least two phrase chunks
- at least two visible memory associations in the word-bubble UI
- a learner-facing memory hook

The target-word validation passed with zero issues for 69 checked terms.

## Still Uncertain / Manual Confirmation

These terms remain better handled carefully because they may be A2 recognition words, B1 active words, or depend on course/product positioning:

`belastingdienst`, `toeslagen`, `zorgtoeslag`, `huurtoeslag`, `bezwaar maken`, `besluit`, `DigiD`, `arbeidscontract`, `minimumloon`, `brutoloon`, `nettoloon`, `privacy`, `doktersverklaring`, `vergunning`, `leerplicht`, `mantelzorg`.

They are not described as official required words. They are marked as suitable candidates for later manual review or B1/advanced life-Dutch expansion.

## Verification

- Target content validation: 69 checked A1/A2 added or adjusted terms, 0 issues.
- TypeScript: `pnpm exec tsc --noEmit` passed.

