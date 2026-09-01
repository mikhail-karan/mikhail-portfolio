/**
 * Acceptance criteria 1–8 from docs/analytics-spec.md §11. No database, no deployment:
 * `recordEvent` takes its clock, headers, url and store as arguments precisely so that
 * the identity model can be tested directly.
 */

import { describe, expect, it, vi } from 'vitest';

import { classifyReferrer, recordEvent, type CollectDeps } from './collect';
import type { EventInsert } from './db/schema';
import { createSaltCache } from './salt';
import type { CollectStore } from './store';

const DESKTOP_UA =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0 Safari/537.36';
const CRAWLER_UA =
	'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.2; +https://openai.com/gptbot';

const SITE = 'https://mikek.me';

type Recorder = CollectStore & { events: EventInsert[]; claimedDays: string[] };

function recorder(overrides: Partial<CollectStore> = {}): Recorder {
	const events: EventInsert[] = [];
	const claimedDays: string[] = [];

	return {
		events,
		claimedDays,
		async insertEvent(row) {
			events.push(row);
		},
		async claimSalt(day, candidate) {
			claimedDays.push(day);
			return candidate;
		},
		...overrides,
	};
}

/** Distinct, deterministic salts, so a changed visitor_day is never down to luck. */
function saltSequence() {
	let n = 0;
	return () => new Uint8Array(32).fill((n += 1));
}

function headersFor(extra: Record<string, string> = {}): Headers {
	return new Headers({
		'user-agent': DESKTOP_UA,
		'x-real-ip': '203.0.113.9',
		'x-vercel-ip-country': 'CA',
		...extra,
	});
}

function deps(overrides: Partial<CollectDeps> = {}): CollectDeps {
	return {
		headers: headersFor(),
		url: new URL(`${SITE}/`),
		now: new Date('2026-08-06T12:00:00.000Z'),
		store: recorder(),
		salts: createSaltCache(saltSequence()),
		log: () => {},
		...overrides,
	};
}

describe('recordEvent', () => {
	it('gives the same visitor the same identifier twice in one day', async () => {
		const store = recorder();
		const shared = { store, salts: createSaltCache(saltSequence()) };

		await recordEvent(deps({ ...shared, url: new URL(`${SITE}/`) }));
		await recordEvent(deps({ ...shared, url: new URL(`${SITE}/links`) }));

		expect(store.events).toHaveLength(2);
		expect(store.events[0]?.visitorDay).toBe(store.events[1]?.visitorDay);
	});

	it('gives the same visitor a different identifier across a UTC date boundary', async () => {
		const store = recorder();
		const shared = { store, salts: createSaltCache(saltSequence()) };

		await recordEvent(deps({ ...shared, now: new Date('2026-08-06T23:59:59.000Z') }));
		await recordEvent(deps({ ...shared, now: new Date('2026-08-07T00:00:01.000Z') }));

		expect(store.claimedDays).toEqual(['2026-08-06', '2026-08-07']);
		expect(store.events[0]?.visitorDay).not.toBe(store.events[1]?.visitorDay);
	});

	it('reuses the cached salt within a day and refetches when the day changes', async () => {
		const store = recorder();
		const shared = { store, salts: createSaltCache(saltSequence()) };

		await recordEvent(deps({ ...shared, now: new Date('2026-08-06T01:00:00.000Z') }));
		await recordEvent(deps({ ...shared, now: new Date('2026-08-06T22:00:00.000Z') }));
		expect(store.claimedDays).toEqual(['2026-08-06']);

		await recordEvent(deps({ ...shared, now: new Date('2026-08-07T00:30:00.000Z') }));
		expect(store.claimedDays).toEqual(['2026-08-06', '2026-08-07']);
	});

	it('flags a known crawler', async () => {
		const store = recorder();
		await recordEvent(deps({ store, headers: headersFor({ 'user-agent': CRAWLER_UA }) }));

		expect(store.events[0]?.isBot).toBe(true);
	});

	it('does not flag an ordinary browser', async () => {
		const store = recorder();
		await recordEvent(deps({ store }));

		expect(store.events[0]?.isBot).toBe(false);
	});

	it('records a null country when the geo header is absent', async () => {
		const store = recorder();
		const headers = headersFor();
		headers.delete('x-vercel-ip-country');

		await recordEvent(deps({ store, headers }));

		expect(store.events[0]?.country).toBeNull();
	});

	it('strips the query string from the stored path', async () => {
		const store = recorder();
		await recordEvent(deps({ store, url: new URL(`${SITE}/links?utm_source=x&id=1234#top`) }));

		expect(store.events[0]?.path).toBe('/links');
	});

	it('stores no referrer for internal navigation', async () => {
		const store = recorder();
		const headers = headersFor({ referer: `${SITE}/links` });

		await recordEvent(deps({ store, headers, url: new URL(`${SITE}/`) }));

		expect(store.events[0]?.referrer).toBeNull();
	});

	it('stores an external referrer', async () => {
		const store = recorder();
		const headers = headersFor({ referer: 'https://news.ycombinator.com/item?id=1' });

		await recordEvent(deps({ store, headers }));

		expect(store.events[0]?.referrer).toBe('https://news.ycombinator.com/item?id=1');
	});

	it('never persists the raw IP address', async () => {
		const store = recorder();
		await recordEvent(deps({ store }));

		expect(JSON.stringify(store.events[0])).not.toContain('203.0.113.9');
	});

	it('logs an insert failure instead of propagating it', async () => {
		const boom = new Error('neon unreachable');
		const log = vi.fn();
		const store = recorder({
			insertEvent: () => Promise.reject(boom),
		});

		await expect(recordEvent(deps({ store, log }))).resolves.toBeUndefined();
		expect(log).toHaveBeenCalledWith(expect.stringContaining('/'), boom);
	});

	it('logs a salt failure instead of propagating it', async () => {
		const boom = new Error('salt upsert failed');
		const log = vi.fn();
		const store = recorder({ claimSalt: () => Promise.reject(boom) });

		await expect(recordEvent(deps({ store, log }))).resolves.toBeUndefined();
		expect(log).toHaveBeenCalledWith(expect.any(String), boom);
		expect(store.events).toHaveLength(0);
	});
});

describe('classifyReferrer', () => {
	it('treats a missing referrer as none', () => {
		expect(classifyReferrer(null, 'mikek.me')).toEqual({ kind: 'none', url: null });
	});

	it('treats a same-host referrer as internal', () => {
		expect(classifyReferrer('https://mikek.me/links', 'mikek.me')).toEqual({
			kind: 'internal',
			url: null,
		});
	});

	it('compares hosts case-insensitively and ignores the port', () => {
		expect(classifyReferrer('http://LOCALHOST:5173/links', 'localhost:5173').kind).toBe('internal');
	});

	it('does not treat a lookalike host as internal', () => {
		expect(classifyReferrer('https://mikek.me.evil.test/', 'mikek.me').kind).toBe('external');
	});

	it('treats an unparseable referrer as none', () => {
		expect(classifyReferrer('not a url', 'mikek.me')).toEqual({ kind: 'none', url: null });
	});
});
