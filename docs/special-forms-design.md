# NedPop Special Forms Bank Design

## Product Role

The Special Forms Bank is a standalone reference page at `/special-forms`. It is not a lesson module and should not look like a course card. A learner should meet a rule in context first, then open the matching table when they need to check a form.

## Grammar Entry Points

- Present special verbs belong under the verb conjugation page.
- Separable verbs also belong under the verb conjugation page because their present-tense behavior changes word order.
- Irregular past verbs belong under the past-time page.
- Perfect tense and past participles belong under the past-time page.
- Comparatives and superlatives belong under the adjectives and order page.

The top navigation exposes this as a standalone word-forms table. Direct anchor links still work, for example `/special-forms#special-perfectum`.

## Data Model

Each item carries:

- `id`
- `section`
- `level`
- `sourceIds`
- learner meaning in Chinese and English
- a short Chinese note
- optional memory hint for internal/editorial use

Section-specific fields:

- Present special verbs: subject forms for `ik`, `jij/je`, `hij/zij/het`, `wij/we`, `jullie`, `zij/ze`.
- Irregular past verbs: simple past singular/plural, past participle, auxiliary.
- Perfect tense items: auxiliary, past participle, ready-to-use perfect chunk.
- Separable verbs: prefix, base verb, perfect participle, and a flag for whether it is truly separable.
- Comparisons: base, comparative, superlative.

## Scope

The page is organized by every supported special pattern, not by course day. Within each pattern, rows cover the A0-B1 special forms used in NedPop's current learning scope.

Avoid turning the page into teaching content. If an item needs a long explanation, place the explanation in the relevant grammar lesson and keep this page as a reference table.

## UX Rules

- Keep references compact and scannable.
- Use dense tables because the data is naturally tabular.
- Do not add audio controls, sentence cards, or lesson-style explanation blocks here.
- Never show source jargon as the main explanation.
- Source links belong in docs and internal data, not as noisy user-facing labels.
