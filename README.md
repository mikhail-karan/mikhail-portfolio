# mikhail-portfolio

Personal portfolio — a terminal-styled site built with SvelteKit. The portfolio at `/`
and link-in-bio page at `/links` are prerendered. Routing middleware serves Markdown from
the same homepage URL when requested. `/analytics` is server-rendered and publishes the site's
own traffic, which the site also collects itself — see [Analytics](#analytics).

## Running it

```sh
pnpm install
pnpm dev          # dev server
pnpm build        # production build
pnpm preview      # serve the built site
pnpm check        # svelte-check + types
pnpm test         # vitest
pnpm lint         # oxlint
pnpm format       # oxfmt
pnpm db:generate  # drizzle-kit — regenerate migrations from the schema
pnpm db:migrate   # drizzle-kit — apply them to $DATABASE_URL
```

Copy `.env.example` to `.env` for local development. Without `DATABASE_URL` the site
still runs; collection logs a failure per request and `/analytics` errors.

## Where the content lives

All page copy comes from `src/lib/content.ts` — identity, highlights, projects,
leadership entries, stack, experience, podcast, contact, the `links` object behind
`/links`, and the `analytics` object holding the writeup on `/analytics`. Editing
that file is the whole content workflow; no component changes needed to update copy.
The only thing not in there is the analytics figures, which come from the database.

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
│   ├── server/                 ← collector, salt, queries, retention (never bundled)
│   └── styles/app.css          ← design tokens and base layer
├── hooks.server.ts             ← negotiation, auth backstop, dev collection
└── routes/
    ├── +layout.svelte          ← favicon, theme colour, og:type, twitter:card
    ├── +layout.ts              ← SSR on; prerender by default
    ├── +page.ts                ← keeps / explicitly prerendered
    ├── +page.svelte            ← composes the sections
    ├── links/+page.svelte      ← /links, the link-in-bio page
    ├── analytics/              ← /analytics (ISR) and /analytics/private (no-store)
    ├── mcp/                    ← stateless, read-only MCP resource server
    └── api/cron/sweep/         ← daily retention job
middleware.ts                   ← routing: negotiation, collection + private-tier Basic Auth
static/llms.txt                 ← compact agent navigation index
drizzle/                        ← generated migrations
```

Each page renders `Head.svelte` with its own `PageMeta` — title, description,
canonical, `og:url`, and its own card. The layout only carries what's identical
everywhere.

## Agent interfaces

- `/` returns prerendered HTML by default and Markdown when the client
  prefers `Accept: text/markdown`. Both variants send `Vary: Accept, Accept-Encoding`;
  unsupported media types receive `406 Not Acceptable`.
- `/llms.txt` is the compact navigation index for agents.
- `/mcp` is a stateless Streamable HTTP MCP endpoint. It supports the current
  per-request metadata protocol and the legacy initialize flow, and exposes the public
  portfolio Markdown through `resources/list` and `resources/read`.
- Unknown routes keep a real `404`; Markdown clients receive recovery links while
  browsers receive a terminal-styled error page with the same destinations.

## Design notes

- **Monospace system stack, no web font.** `ui-monospace` and friends already
  read as a terminal on every platform, and it costs zero network requests.
- **Dark by default, light via `prefers-color-scheme`.** Both themes are token-driven.
- **Animation is minimal on purpose:** one fast staggered entrance in the hero, a
  blinking cursor, and a single fade per section on first scroll into view. All of
  it is disabled under `prefers-reduced-motion`, and sections stay visible when
  JavaScript is unavailable or when printing.

## Analytics

The site counts its own traffic instead of using a third-party provider. The full
design, including the alternatives that were rejected, is in
[`docs/analytics-spec.md`](docs/analytics-spec.md). In short:

- Routing middleware schedules one row per pageview to Neon Postgres through drizzle's
  HTTP driver. Both the analytics module import and write are deferred with `waitUntil`,
  so neither is on the response path.
- A visitor is `sha256(daily salt || host || ip || user agent)`. The raw IP is never
  stored, and the salt is destroyed when the day rolls over, so yesterday's
  identifiers cannot be recomputed. Nothing is written to the visitor's device, so
  there is no consent banner and no cookie.
- `/analytics` is public and suppressed: buckets under five views collapse into
  `Other`, referrers must match an allowlist of registrable domains or they are
  reported as `Direct / private`, and time is never finer than a day. All of it
  happens in SQL — see `src/lib/server/queries.ts`.
- `/analytics/private` is the same data unsuppressed, behind HTTP Basic Auth
  enforced in `middleware.ts`, `no-store`, `noindex`, and disallowed in `robots.txt`.
- `/api/cron/sweep` runs daily and nulls user agents older than 30 days. Events are
  never deleted. Referrer URLs are kept indefinitely and stay private.

Collection logic lives in `src/lib/server/collect.ts` and is called from two places:
`middleware.ts` in production and `src/hooks.server.ts` in `vite dev`, because
`vite dev` does not run Vercel middleware. There is no second implementation.

`pnpm test` runs the collector and auth tests with no database. The query-layer
tests need one and skip without it:

```sh
DATABASE_URL='postgres://…/neondb?sslmode=require' pnpm test
```

Point that at a scratch Neon branch — the suite truncates the tables it uses.

## Deploying to Vercel

`@sveltejs/adapter-vercel` writes `.vercel/output`, keeping `/` and `/links` as static files and
adding functions for `/mcp`, `/analytics`, `/analytics/private` and the cron route.
`vercel.json` **is** required now: it declares the daily cron. Vercel builds root
`middleware.ts` itself.

Set these in the project's environment variables:

| variable                 | what it does                                           |
| ------------------------ | ------------------------------------------------------ |
| `DATABASE_URL`           | Neon connection string                                 |
| `ANALYTICS_PRIVATE_AUTH` | `user:password` for `/analytics/private`               |
| `CRON_SECRET`            | Vercel sends it as a bearer token to `/api/cron/sweep` |

Run `pnpm db:migrate` against the production database once before the first deploy.

## Before going live

- Fill in the real Digital Dynasty Design years in `src/lib/content.ts` (marked TODO).
- `site.url` in `src/lib/content.ts` is `https://www.mikek.me` — the apex redirects
  there, and canonical/`og:url`/`og:image` are all built from it. Change it there if
  the domain ever moves.
