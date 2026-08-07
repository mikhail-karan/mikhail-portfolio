/**
 * One event per pageview. See docs/analytics-spec.md §5 and §8.
 *
 * Everything the collector touches arrives as an argument — headers, url, clock, store,
 * salt cache — because it runs from two places (the Vercel middleware in production, the
 * SvelteKit `handle` hook in `vite dev`) and neither may own a private copy of this logic.
 */

import { isbot } from 'isbot';

import { utcDay, type SaltCache } from './salt';
import type { CollectStore } from './store';
import type { EventInsert } from './db/schema';

/**
 * Paths that get an event.
 *
 * The middleware matcher lists these too, but the matcher is a billing optimisation — it keeps
 * the middleware from being invoked for assets — and this is the decision. Drift makes the
 * middleware run more often than it needs to; it never makes it record the wrong thing.
 */
export const COLLECTED_PATHS: ReadonlySet<string> = new Set(['/', '/links', '/analytics']);

export type CollectDeps = {
	headers: Headers;
	url: URL;
	now: Date;
	store: CollectStore;
	salts: SaltCache;
	log: (message: string, error: unknown) => void;
};

export type ReferrerClass = {
	kind: 'none' | 'internal' | 'external';
	/** What goes in the `referrer` column. Null for internal navigation, so that no query,
	 * public or private, can report the site to itself as a traffic source (§8). */
	url: string | null;
};

/**
 * Record one pageview.
 *
 * Resolves whether or not the write succeeded: this is handed to `waitUntil`, and a database
 * outage must not reach the visitor (§8). Failures are logged, never rethrown, never swallowed.
 */
export async function recordEvent(deps: CollectDeps): Promise<void> {
	const { headers, url, now, store, salts, log } = deps;

	try {
		const ua = headers.get('user-agent');
		const salt = await salts.get(utcDay(now), store);

		const row: EventInsert = {
			ts: now,
			path: url.pathname,
			referrer: classifyReferrer(headers.get('referer'), url.host).url,
			country: headers.get('x-vercel-ip-country'),
			device: classifyDevice(ua),
			ua,
			isBot: isbot(ua ?? undefined),
			visitorDay: await visitorDay(salt, url.host, clientIp(headers), ua ?? ''),
		};

		await store.insertEvent(row);
	} catch (error) {
		log(`Analytics collection failed for ${url.pathname}`, error);
	}
}

/**
 * `sha256(salt(today) || host || ip || user_agent)`, hex encoded (§5).
 *
 * The fields are newline-separated so that two different visitors cannot collide by shifting
 * a boundary between them. The salt is destroyed the next day, which is what makes this
 * irreversible rather than merely obscured — and what makes returning visitors uncountable.
 */
export async function visitorDay(
	salt: Uint8Array,
	host: string,
	ip: string,
	ua: string,
): Promise<string> {
	const fields = new TextEncoder().encode(`\n${host}\n${ip}\n${ua}`);
	const input = new Uint8Array(salt.length + fields.length);
	input.set(salt);
	input.set(fields, salt.length);

	const digest = await crypto.subtle.digest('SHA-256', input);

	let hex = '';
	for (const byte of new Uint8Array(digest)) hex += byte.toString(16).padStart(2, '0');
	return hex;
}

/** Never persisted — it exists only long enough to be hashed into `visitor_day` (§5). */
function clientIp(headers: Headers): string {
	const real = headers.get('x-real-ip');
	if (real) return real;

	const forwarded = headers.get('x-forwarded-for');
	return forwarded?.split(',')[0]?.trim() ?? '';
}

/** A referrer from our own host is navigation, not a source. */
export function classifyReferrer(referrer: string | null, host: string): ReferrerClass {
	if (!referrer) return { kind: 'none', url: null };

	let parsed: URL;
	try {
		parsed = new URL(referrer);
	} catch {
		return { kind: 'none', url: null };
	}

	if (parsed.host.toLowerCase() === host.toLowerCase()) return { kind: 'internal', url: null };

	return { kind: 'external', url: referrer };
}

/**
 * Coarse form factor from the UA string. Three buckets is as far as this can be trusted, and
 * more would not survive the `n < 5` suppression on the public page anyway (§9).
 */
export function classifyDevice(ua: string | null): string | null {
	if (!ua) return null;
	if (/\b(ipad|tablet)\b|android(?!.*\bmobile\b)/i.test(ua)) return 'tablet';
	if (/\b(mobi|iphone|ipod|android)\b/i.test(ua)) return 'mobile';
	return 'desktop';
}
