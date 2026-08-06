/**
 * Acceptance criteria 9–11 from docs/analytics-spec.md §11, plus the retention rules from §7.
 *
 * These run against a real, migrated Neon branch — the suppression they check lives in SQL,
 * so anything short of Postgres would be testing a different implementation. Set DATABASE_URL
 * to a scratch branch and run `pnpm db:migrate` first; without it the suite skips rather than
 * silently passing.
 *
 *     DATABASE_URL='postgres://…/neondb?sslmode=require' pnpm test
 *
 * The branch is truncated between tests, so do not point this at anything you want to keep.
 */

import { sql } from 'drizzle-orm';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createDb, type Db } from './db/client';
import { event, salt } from './db/schema';
import { PRIVATE_SOURCE } from './referrers';
import { OTHER_BUCKET, privateStats, publicStats } from './queries';
import { sweep, UA_RETENTION_DAYS } from './retention';

const url = process.env.DATABASE_URL;

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/139.0 Safari/537.36';

describe.skipIf(!url)('query layer', () => {
	// Built in a hook, not in the describe body: the body still runs when the suite is skipped.
	let database: Db;
	beforeAll(() => {
		database = createDb(url as string);
	});

	type Seed = Partial<{
		path: string;
		referrer: string | null;
		country: string | null;
		device: string | null;
		ua: string | null;
		isBot: boolean;
		daysAgo: number;
	}>;

	async function seed(count: number, values: Seed = {}) {
		const { daysAgo = 0, ...rest } = values;
		const ts = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

		await database.insert(event).values(
			Array.from({ length: count }, (_, i) => ({
				ts,
				path: '/',
				referrer: null,
				country: 'CA',
				device: 'desktop',
				ua: UA,
				isBot: false,
				// Distinct visitors by default, so a bucket's row count is also its visitor count.
				visitorDay: `visitor-${JSON.stringify(rest)}-${i}`,
				...rest,
			})),
		);
	}

	const labels = (buckets: { label: string }[]) => buckets.map((b) => b.label);
	const viewsFor = (buckets: { label: string; views: number }[], label: string) =>
		buckets.find((b) => b.label === label)?.views;

	beforeEach(async () => {
		await database.execute(sql`truncate table event restart identity`);
		await database.execute(sql`truncate table salt`);
	});

	it('collapses a bucket of four and names a bucket of five', async () => {
		await seed(4, { path: '/rare' });
		await seed(5, { path: '/common' });

		const { paths } = await publicStats(database);

		expect(labels(paths)).toContain('/common');
		expect(labels(paths)).not.toContain('/rare');
		expect(viewsFor(paths, OTHER_BUCKET)).toBe(4);
	});

	it('sums several small buckets into one Other', async () => {
		await seed(4, { path: '/rare-a' });
		await seed(3, { path: '/rare-b' });

		const { paths } = await publicStats(database);

		expect(labels(paths)).toEqual([OTHER_BUCKET]);
		expect(viewsFor(paths, OTHER_BUCKET)).toBe(7);
	});

	it('reduces an allowlisted referrer to its registrable domain', async () => {
		await seed(5, { referrer: 'https://news.ycombinator.com/item?id=12345' });

		const { sources } = await publicStats(database);

		expect(labels(sources)).toContain('ycombinator.com');
	});

	it('reports a referrer outside the allowlist as private', async () => {
		await seed(5, { referrer: 'https://ats.recruiting.example.test/candidate/9f3a' });

		const { sources } = await publicStats(database);

		expect(labels(sources)).toContain(PRIVATE_SOURCE);
		expect(viewsFor(sources, PRIVATE_SOURCE)).toBe(5);
	});

	it('reports direct traffic as private rather than as its own bucket', async () => {
		await seed(5, { referrer: null });

		const { sources } = await publicStats(database);

		expect(labels(sources)).toEqual([PRIVATE_SOURCE]);
	});

	it('returns no raw referrer and no user agent anywhere in the public tier', async () => {
		const secret = 'https://wiki.internal.example.test/people/hiring/candidate-42';
		await seed(6, { referrer: secret });
		await seed(6, { referrer: 'https://google.com/search?q=mikhail+karan' });

		const stats = await publicStats(database);
		const serialised = JSON.stringify(stats);

		expect(serialised).not.toContain('example.test');
		expect(serialised).not.toContain('/people/hiring');
		expect(serialised).not.toContain('/search?q=');
		expect(serialised).not.toContain('Mozilla');
	});

	it('excludes bots from views and visitors but counts them separately', async () => {
		await seed(5, { isBot: false });
		await seed(3, { isBot: true, path: '/' });

		const stats = await publicStats(database);

		expect(stats.views).toBe(5);
		expect(stats.visitors).toBe(5);
		expect(stats.botViews).toBe(3);
	});

	it('reports time no finer than a day', async () => {
		await seed(2);

		const { daily, windowDays } = await publicStats(database);

		expect(daily).toHaveLength(windowDays);
		for (const point of daily) expect(point.day).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		expect(daily.at(-1)?.views).toBe(2);
	});

	it('keeps full fidelity in the private tier', async () => {
		const secret = 'https://wiki.internal.example.test/people/hiring/candidate-42';
		await seed(1, { referrer: secret });

		const stats = await privateStats(database);

		expect(labels(stats.referrers)).toContain(secret);
		expect(stats.recent[0]?.ua).toBe(UA);
		expect(stats.hourly[0]?.hour).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:00$/);
	});
});

describe.skipIf(!url)('retention sweep', () => {
	let database: Db;
	beforeAll(() => {
		database = createDb(url as string);
	});

	beforeEach(async () => {
		await database.execute(sql`truncate table event restart identity`);
		await database.execute(sql`truncate table salt`);
	});

	it('nulls old user agents without deleting the rows', async () => {
		const old = new Date(Date.now() - (UA_RETENTION_DAYS + 1) * 24 * 60 * 60 * 1000);
		const row = {
			path: '/',
			referrer: 'https://google.com/',
			country: 'CA',
			device: 'desktop',
			ua: UA,
			isBot: false,
			visitorDay: 'old-visitor',
		};

		await database.insert(event).values([
			{ ...row, ts: old },
			{ ...row, ts: new Date(), visitorDay: 'fresh-visitor' },
		]);

		const result = await sweep(database);

		expect(result.scrubbed).toBe(1);

		const rows = await database.select().from(event).orderBy(event.ts);
		expect(rows).toHaveLength(2);
		expect(rows[0]?.ua).toBeNull();
		// Referrers are retained indefinitely, by decision, not by omission (§7).
		expect(rows[0]?.referrer).toBe('https://google.com/');
		expect(rows[1]?.ua).toBe(UA);
	});

	it('destroys salts for past days', async () => {
		await database.insert(salt).values([
			{ day: '2020-01-01', val: new Uint8Array(32).fill(1) },
			{ day: new Date().toISOString().slice(0, 10), val: new Uint8Array(32).fill(2) },
		]);

		const result = await sweep(database);

		expect(result.saltsDropped).toBe(1);
		const remaining = await database.select().from(salt);
		expect(remaining).toHaveLength(1);
		expect(remaining[0]?.val).toEqual(new Uint8Array(32).fill(2));
	});
});
