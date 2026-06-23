# NedPop / 内德泡泡

Responsive web app prototype for Chinese and English-speaking learners starting Dutch from A0 and moving toward A1 and A2.

## Tech

- Next.js App Router
- TypeScript
- Tailwind CSS
- Mock data only

## Run

```bash
pnpm install
pnpm run dev
```

Open `http://localhost:3000`.

In the Codex desktop sandbox used to build this prototype, Next.js needed the wasm SWC fallback:

```bash
NEXT_TEST_WASM_DIR="./node_modules/.pnpm/@next+swc-wasm-nodejs@16.2.6/node_modules/@next/swc-wasm-nodejs" pnpm run dev
```

Most normal local Node environments should not need that extra variable.
# NedPop

## Local Preview

Start the web app preview:

```bash
pnpm dev
```

The preview runs at:

```text
http://localhost:3001
```

`pnpm dev` uses `scripts/dev-preview.sh`, which selects the local Node runtime that can load Next.js SWC correctly in the Codex desktop environment. If you need another port:

```bash
PORT=3002 pnpm dev
```
