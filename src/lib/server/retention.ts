/**
 * The daily sweep (§7).
 *
 * Events are never deleted — the whole point of an append-only log is that a chart invented
 * next year can be backfilled against it. What expires is the user agent string, the only
 * remaining per-request identifier once the salt for that day is gone.
 *
 * `referrer` is deliberately not scrubbed. Raw referrers can contain third-party internal
 * URLs; they stay in the database and stay visible to the private tier, which is why the
 * public page's privacy claim is scoped to identifiers rather than stated broadly.
 */

import { sql } from 'drizzle-orm';

import type { Db } from './db/client';

export const UA_RETENTION_DAYS = 30;

export type SweepResult = {
	/** Rows whose `ua` was nulled. */
	scrubbed: number;
	/** Salt rows for past days that were still present. */
	saltsDropped: number;
};

export async function sweep(database: Db): Promise<SweepResult> {
	const scrub = await database.execute(
		sql`update event
		    set ua = null
		    where ua is not null
		      and ts < now() - make_interval(days => ${sql.raw(String(UA_RETENTION_DAYS))})`,
	);

	// Normally the collector has already dropped these at the first request after rollover.
	// This catches a day with no traffic at all, where nothing triggered that path.
	const salts = await database.execute(
		sql`delete from salt where day < (now() at time zone 'UTC')::date`,
	);

	return { scrubbed: scrub.rowCount ?? 0, saltsDropped: salts.rowCount ?? 0 };
}
