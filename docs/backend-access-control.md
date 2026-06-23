# NedPop Backend Access Control

## Source Of Truth

Paid access is stored on the user record as:

```ts
unlocked_levels: Array<"A1" | "A2" | "B1">
```

Access mapping:

| Plan | Price | unlocked_levels |
| --- | ---: | --- |
| A0 Free | €0 | `[]` |
| A1 Pack | €19 | `["A1"]` |
| A2 Pack | €39 | `["A2"]` |
| B1 Pack | €39 | `["B1"]` |
| All Access Pass | €59 | `["A1", "A2", "B1"]` |

`A0` is always public and never appears in `unlocked_levels`.

## Public Modules

These modules require no paid entitlement:

- Pronunciation / Word Decoder
- Grammar Rules
- Exam Practice
- Word Review page shell, for signed-in users

## Protected Modules

These modules are checked by the selected level:

- `course`
- `word_bubble`
- `scenario`

Rule:

```ts
targetLevel === "A0" || user.unlocked_levels.includes(targetLevel)
```

For `A1`, `A2`, and `B1`, the user must be signed in and own that level.

## Review Pool Filtering

The page itself is available to logged-in users, but returned words must be filtered:

```sql
select w.*
from public.user_reviewed_words urw
join public.words w on w.id = urw.word_id
where urw.user_id = $1
  and w.level = any($2::text[]);
```

`$2` should be:

```ts
["A0", ...user.unlocked_levels]
```

## Code Entry Points

- Core ACL: `lib/access-control.ts`
- Next.js API helper: `lib/server-access.ts`
- Review filtering helper: `lib/word-review-access.ts`
- Lightweight route proxy: `proxy.ts`
- Runtime check endpoint: `/api/access/check?targetModule=course&targetLevel=B1`

`proxy.ts` is only a coarse login guard. Do not rely on it as the only security layer. Route Handlers, Server Components, or database queries must call the ACL helpers again.
