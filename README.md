# mikhail-portfolio

Personal portfolio — a terminal-styled site built with SvelteKit and prerendered to
static files. Two pages: the portfolio at `/` and a link-in-bio page at `/links`.

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

Everything on both pages comes from `src/lib/content.ts` — identity, highlights,
projects, leadership entries, stack, experience, podcast, contact, and the `links`
object behind `/links`. Editing that file is the whole content workflow; no
component changes needed to update copy.

`/links` is the link-in-bio page (it replaced a hosted Linktree-style page). Adding
a link means adding an entry to a group in `links.groups`; its `icon` has to be a
key of `src/lib/icons.ts`, which holds the inlined brand marks.

Content is derived from the `career-achievments` repo, deliberately filtered:

- **No revenue or MRR figures.** The source repo flags them as unreconciled.
- **No internal dashboard metrics.** Scale is described in rounded, qualitative
  terms ("tens of thousands of active users") rather than exact request counts.
- **No confidential documents.** The SOC 2 report and pen-test reports are
  marked do-not-publish at the source; the work is described, nothing is linked.

## Structure

```
og/                             ← 1200×630 og:image sources, see og/README.md
static/og.png, og-links.png     ← rendered from og/, served as the social cards
src/
├── app.html                    ← adds an html.js flag so scroll reveals degrade safely
├── lib/
│   ├── content.ts              ← all page copy and data, plus site.url and page meta
│   ├── icons.ts                ← inlined brand marks for /links
│   ├── actions/reveal.ts       ← fade-in-on-scroll, once, then disconnects
│   ├── components/             ← Hero, Section, Prompt, Head, Icon + one per section
│   └── styles/app.css          ← design tokens and base layer
└── routes/
    ├── +layout.svelte          ← favicon, theme colour, og:type, twitter:card
    ├── +layout.ts              ← prerender = true
    ├── +page.svelte            ← composes the sections
    └── links/+page.svelte      ← /links, the link-in-bio page
```

Each page renders `Head.svelte` with its own `PageMeta` — title, description,
canonical, `og:url`, and its own card. The layout only carries what's identical
everywhere.

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

- Fill in the real Digital Dynasty Design years in `src/lib/content.ts` (marked TODO).
- `site.url` in `src/lib/content.ts` is `https://www.mikek.me` — the apex redirects
  there, and canonical/`og:url`/`og:image` are all built from it. Change it there if
  the domain ever moves.
