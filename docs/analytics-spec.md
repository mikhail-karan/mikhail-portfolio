# Self-hosted analytics — specification

Status: draft, pre-implementation. Derived from a design review on 2026-08-06.

Normative keywords (MUST, MUST NOT, SHOULD) mark statements that are testable and
are expected to have a corresponding assertion in the test suite.

## 1. Purpose

Record and publish traffic statistics for this site without a third-party analytics
provider, without cookies, and without shipping JavaScript to visitors.

The public page is a portfolio artifact first and a dashboard second: at this site's
traffic volume the numbers are not the interesting part, the method is. The page
therefore explains how the system works and uses live figures as evidence.

## 2. Non-goals

- Session, funnel, or cohort analysis. The identity model (§5) cannot express them.
- Returning-visitor counts. Structurally impossible once the salt is destroyed.
- Real-time reporting. The public tier is hourly at best (§9).
- Multi-site or multi-user support. One site, one operator.

## 3. Inherited constraints

These come from the existing site and are not up for renegotiation as part of
this feature:

- `/` and `/links` MUST remain prerendered static files.
- The client bundle MUST remain zero bytes of JavaScript. Runtime dependencies
  added by this feature are server-only.
- No web fonts. Rendering is monospace, dark by default, light via
  `prefers-color-scheme`, driven by the tokens in `src/lib/styles/app.css`.
- Pages MUST render correctly with JavaScript disabled and when printed.
- No consent banner. This constrains §5 rather than the reverse.

## 4. Architecture

`@sveltejs/adapter-vercel` replaces `@sveltejs/adapter-static`. Content pages keep
`prerender = true` and are unchanged in output. Two new server-rendered routes and
one edge middleware are added.

```
middleware.ts              edge, global      collection + private-tier auth
/                          static            unchanged
/links                     static            unchanged
/analytics                 ISR, 3600s        public tier
/analytics/private         no-store          private tier, Basic Auth
/api/cron/sweep            daily cron        retention
```

Storage is Neon Postgres, accessed through `drizzle-orm` over the
`@neondatabase/serverless` HTTP driver (`drizzle-orm/neon-http`). No connection
pool is used; every statement is a one-shot HTTP query.

**Known platform limitation:** Vercel middleware on SvelteKit does not support URL
rewrites. This design never rewrites. The private-tier gate returns a 401 response
directly, which is a short-circuit and not a rewrite.

## 5. Identity model

A visitor is identified by `visitor_day`, scoped to a single calendar day (UTC).

```
visitor_day = sha256(salt(today) || host || ip || user_agent)
```

- `salt(day)` MUST be cryptographically random, 32 bytes, generated once per day.
- The salt MUST be stored server-side only and MUST NOT be derived from a static
  secret, a date, or any other reproducible value.
- Salts for days before the current day MUST be deleted. Once deleted, historical
  `visitor_day` values MUST NOT be re-derivable by anyone, including the operator.
- The raw IP address MUST NOT be persisted in any table.

Consequences that are intentional, not defects:

- The same visitor on two days produces two unrelated identifiers.
- "Returning visitors" is not a computable quantity. The public page states this
  explicitly rather than omitting the metric silently.

This is the construction used by Plausible, Fathom, and Umami. Because nothing is
stored on the visitor's device, ePrivacy Art. 5(3) consent is not triggered.
Enforcement is not uniform across the EU — French, Spanish, and UK regulators
treat this as exempt; German and Dutch authorities may not. This is accepted risk
for a personal portfolio.

### 5.1 Salt acquisition

The salt MUST be cached in module scope, keyed by date, and refetched when the date
changes. A warm instance MUST NOT reuse a salt across a date boundary.

Many edge regions may request the salt simultaneously at rollover. The upsert MUST
return the winning row in all cases:

```sql
insert into salt (day, val) values ($1, $2)
on conflict (day) do update set val = salt.val
returning val;
```

`on conflict do nothing` MUST NOT be used here — losing regions would receive an
empty result and have no salt.

## 6. Data model

```ts
// db/schema.ts
export const event = pgTable('event', {
  id:         bigserial('id', { mode: 'number' }).primaryKey(),
  ts:         timestamp('ts', { withTimezone: true }).notNull().defaultNow(),
  path:       text('path').notNull(),
  referrer:   text('referrer'),
  country:    text('country'),
  device:     text('device'),
  ua:         text('ua'),
  isBot:      boolean('is_bot').notNull(),
  visitorDay: text('visitor_day').notNull(),
}, (t) => [index('event_ts_idx').on(t.ts.desc())]);

export const salt = pgTable('salt', {
  day: date('day').primaryKey(),
  val: customType<Uint8Array>()('val').notNull(),
});
```

The log is append-only. Rows MUST NOT be updated after insert except by the
retention sweep (§7).

Sizing: at ~2,000 views/month and ~250 bytes/row this is roughly 6 MB/year against
Neon's 0.5 GB free tier. Storage is not a design constraint.

## 7. Retention

A cron job runs once daily (`/api/cron/sweep`) and nulls `ua` on rows older than
30 days.

- Rows MUST NOT be deleted. Full history is retained so that charts invented later
  can be backfilled against it.
- `referrer` is retained in full, indefinitely. **This is a deliberate decision made
  with the tradeoff understood**: raw referrers may contain third-party internal
  URLs (ATS links, private wikis, workspace links). They are never exposed publicly
  (§8), but they persist in the database and are visible in the private tier.
- Because referrers are retained, the public page MUST scope its privacy claim to
  what is true: *no identifier is retained past 30 days*. Broader claims MUST NOT
  be made.

Vercel Hobby crons run once daily with hour-level precision only; the sweep is not
time-sensitive.

## 8. Collection

Middleware records one event per matched request.

- The matcher MUST cover `/`, `/links`, `/analytics` and MUST NOT cover `/_app/*`
  or any static asset. Middleware bills per invocation.
- The write MUST be issued via `waitUntil` and MUST NOT delay the response.
- Steady-state cost MUST be one `INSERT` per pageview. Salt lookup is served from
  cache; retention runs on cron.
- Query strings MUST be stripped from `path` before insert. Identifiers in query
  parameters are a known leak vector and this site has no legitimate use for them.
- A referrer whose host equals the site host MUST be classified as internal
  navigation and MUST NOT be reported as a traffic source.
- Bot classification uses `isbot`. Misclassification is expected; `is_bot` is a
  best-effort field and the public page says so.
- Collection failures MUST be caught and logged, and MUST NOT be rethrown. A
  database outage MUST NOT affect the response to a visitor. Failures are logged,
  not swallowed.

`/analytics` is intentionally within the matcher and counts its own traffic.

### 8.1 Structure

Collection logic lives in `src/lib/server/collect.ts` as `recordEvent(deps)` with
dependencies (headers, url, clock, db) injected. It has two call sites:

- `middleware.ts` — production
- `src/hooks.server.ts` — development only, because `vite dev` does not run Vercel
  middleware

Logic MUST NOT be duplicated between them.

## 9. Public tier — `/analytics`

Server-rendered with `prerender = false` and `config = { isr: { expiration: 3600 } }`.
Caching bounds rendering at 24 database reads per day regardless of request volume;
the route is unauthenticated and would otherwise be trivially abusable.

Suppression rules, all applied **in SQL** so suppressed values never reach the
render tree:

- Any dimension bucket with `count < 5` MUST be collapsed into `Other`.
- Referrers MUST be reduced to their registrable domain and MUST pass an allowlist
  of known-public sources. Anything else MUST be reported as `Direct / private`.
- Time granularity MUST NOT be finer than one day.
- There MUST NOT be a live visitor feed, and dimensions MUST NOT be cross-filterable.

These rules exist because at this traffic volume an unsuppressed public dashboard
publishes individual browsing sessions. They are presented on the page as part of
the writeup rather than hidden as a disclaimer.

The page MUST display the time it was rendered, so staleness is stated.

### 9.1 Presentation

Charts are monospace text aligned to `ch` units against `--measure`, using existing
colour tokens. No charting library, no client JavaScript, no SVG coordinate math.
Charts MUST be marked up as `<table>` so they are legible to screen readers, and
MUST print correctly.

## 10. Private tier — `/analytics/private`

Full fidelity: raw referrers, hourly buckets, `n = 1` rows, no suppression.

- Access MUST be gated by HTTP Basic Auth enforced in middleware, compared in
  constant time against an environment variable.
- Credentials MUST NOT appear in any URL. Query-string keys and unguessable paths
  are both rejected: either would leak through the `Referer` header on outbound
  clicks, into browser history, and into this system's own `event.referrer` column.
- Responses MUST set `Cache-Control: no-store` and MUST NOT be cached by ISR.
- The route MUST be `noindex` and MUST be disallowed in `static/robots.txt`.

Vercel-native password protection is not used: it requires Pro + a $150/month
add-on, and Hobby production domains are always public.

## 11. Acceptance criteria

Collector (`collect.test.ts`, unit, no deployment required):

1. Same visitor, same day → identical `visitor_day`.
2. Same visitor, across a UTC date boundary → different `visitor_day`.
3. Module-scope salt cache invalidates when the date changes.
4. A known crawler UA (e.g. `GPTBot`) sets `is_bot = true`.
5. Missing `x-vercel-ip-country` yields `country = null`, not a throw.
6. A path with a query string is stored without it.
7. A same-host referrer is classified internal.
8. A database error is logged and does not propagate.

Query layer (`queries.test.ts`, against a seeded Neon branch):

9. A bucket with 4 rows is reported as `Other`; with 5 rows it is reported by name.
10. A referrer outside the allowlist is reported as `Direct / private`.
11. No public query returns a raw referrer URL or a UA string.

Platform (preview deployment):

12. Middleware fires on a CDN-cached hit to `/`.
13. `/` and `/links` are still emitted as static files after the adapter swap.
14. `/analytics/private` returns 401 without credentials.
15. Repeated requests to `/analytics` within an hour produce one database read.

Criterion 12 is a gate. If it fails, §8 is invalid and collection must move to a
client-side beacon, which changes §5 (no server-side IP) and §9 (ad-blocker
undercount) but leaves §6, §7, and §10 intact.

## 12. Dependencies

Runtime, server-only: `drizzle-orm@0.45.2`, `@neondatabase/serverless@1.1.0`,
`@vercel/functions@3.8.0`, `isbot@5.2.1`.

Development: `@sveltejs/adapter-vercel@6.3.4`, `drizzle-kit@0.31.10`, `vitest@4.1.10`.

Versions are pinned exact, per repo convention.

## 13. Consequential changes

- `vercel.json` becomes required (crons). The README currently states it is not.
- `lint` and `format` scripts target `src` only and must be extended to cover root
  `middleware.ts`; `tsconfig.json` `include` likewise.
- These four runtime dependencies are the repository's first. The client bundle is
  unaffected.

## 14. Open questions

- Should `/analytics` be indexed by search engines? Recommendation: yes. The
  writeup is the point of the page. Only `/analytics/private` is disallowed.
- Should the step-0 platform spike land on a throwaway branch or as the first
  commit of the feature branch? Recommendation: throwaway, so the adapter swap
  stays out of history if criterion 12 fails.

## 15. Rejected alternatives

Recorded so they are not relitigated.

| Alternative | Rejected because |
|---|---|
| Keep `adapter-static`, separate collector service | Two repos, two deploys, CORS, no shared types |
| Browser writes directly to a database | Write credential ships to the client |
| Pre-aggregated counters (Redis) | Fixes the answerable questions on day one |
| Client beacon for collection | Audience is ad-blocker heavy; systematic undercount |
| Dual edge + beacon with dedup | Token correlation needs a cookie; the resulting ad-blocker-rate metric is confounded by bots |
| Static env-var salt | Permanently re-identifiable; anonymity claim would be false |
| No visitor identity at all | Loses the single most useful number on the page |
| Persistent localStorage ID | Terminal-equipment storage; requires a consent banner |
| Per-event edge/beacon correlation | Races on multiple tabs, ambiguous on refresh |
| Buffer and batch writes | Edge instances are killed without warning; lossy |
| Fully public full-fidelity dashboard | Publishes individual sessions and recruiter referrers |
| Secret in URL path or query string | Leaks via `Referer`, history, and this system's own logs |
| Vercel password protection | Pro + $150/month add-on |
| No cache on the public page | Unauthenticated SQL endpoint, trivially abusable |
| Charting library | First client dependency; breaks no-JS, print, and the page's own claim |
| Hard-delete events at 12 months | Contradicts the append-only log rationale |
