# mikhail-portfolio

Personal portfolio — a single-page, terminal-styled site built with SvelteKit and
prerendered to static files.

## Running it

```sh
pnpm install
pnpm dev        # dev server
pnpm build      # static build → build/
pnpm preview    # serve the built site
pnpm check      # svelte-check + types
pnpm lint       # oxlint
pnpm format     # oxfmt
```

## Where the content lives

Everything on the page comes from `src/lib/content.ts` — identity, highlights,
projects, leadership entries, stack, experience, podcast, contact. Editing that
file is the whole content workflow; no component changes needed to update copy.

Content is derived from the `career-achievments` repo, deliberately filtered:

- **No revenue or MRR figures.** The source repo flags them as unreconciled.
- **No internal dashboard metrics.** Scale is described in rounded, qualitative
  terms ("tens of thousands of active users") rather than exact request counts.
- **No confidential documents.** The SOC 2 report and pen-test reports are
  marked do-not-publish at the source; the work is described, nothing is linked.

## Structure

```
src/
├── app.html                    ← adds an html.js flag so scroll reveals degrade safely
├── lib/
│   ├── content.ts              ← all page copy and data
│   ├── actions/reveal.ts       ← fade-in-on-scroll, once, then disconnects
│   ├── components/             ← Hero, Section, Prompt + one per section
│   └── styles/app.css          ← design tokens and base layer
└── routes/
    ├── +layout.svelte          ← head meta
    ├── +layout.ts              ← prerender = true
    └── +page.svelte            ← composes the sections
```

## Design notes

- **Monospace system stack, no web font.** `ui-monospace` and friends already
  read as a terminal on every platform, and it costs zero network requests.
- **Dark by default, light via `prefers-color-scheme`.** Both themes are token-driven.
- **Animation is minimal on purpose:** one fast staggered entrance in the hero, a
  blinking cursor, and a single fade per section on first scroll into view. All of
  it is disabled under `prefers-reduced-motion`, and sections stay visible when
  JavaScript is unavailable or when printing.

## Deploying to Vercel

`@sveltejs/adapter-static` detects Vercel via the `VERCEL` environment variable and
writes `.vercel/output` with a config that sets immutable caching on hashed assets.
No `vercel.json` is needed — import the repo and Vercel's SvelteKit preset handles it.

## Before going live

- Set the domain, then add `og:url` and an `og:image` in `src/routes/+layout.svelte`.
  Social previews currently use `twitter:card=summary` with no image.
- Fill in the real Digital Dynasty Design years in `src/lib/content.ts` (marked TODO).
