/**
 * The two writes the collector needs, behind a port.
 *
 * Keeping this narrow is what lets `collect.ts` be unit-tested without a database and
 * without mocking drizzle: the tests pass a different object with the same two methods.
 */

import { lt, sql } from 'drizzle-orm';

import type { Db } from './db/client';
import { event, salt, type EventInsert } from './db/schema';

export type CollectStore = {
	insertEvent(row: EventInsert): Promise<void>;
	/**
	 * Return the salt for `day`, creating it from `candidate` if this caller is the first.
	 *
	 * Every edge region racing at UTC rollover has to come away with the winning row, so the
	 * conflict clause is a no-op update rather than `do nothing` — the latter returns no rows
	 * to the losers and leaves them with no salt (§5.1).
	 */
	claimSalt(day: string, candidate: Uint8Array): Promise<Uint8Array>;
};

/**
 * `getDb` is a thunk, not a client, so that a missing `DATABASE_URL` surfaces inside the
 * collector's own try/catch rather than as a throw at wiring time — where it would reach the
 * visitor's response (§8).
 */
export function createStore(getDb: () => Db): CollectStore {
	return {
		async insertEvent(row) {
			await getDb().insert(event).values(row);
		},

		async claimSalt(day, candidate) {
			const database = getDb();
			const [row] = await database
				.insert(salt)
				.values({ day, val: candidate })
				.onConflictDoUpdate({ target: salt.day, set: { val: sql`${salt.val}` } })
				.returning({ val: salt.val });

			if (!row) throw new Error(`Salt upsert for ${day} returned no row.`);

			// Yesterday's salt is what would make yesterday's visitor_day values re-derivable, so
			// it goes as soon as a request proves the day has rolled over. The sweep repeats this
			// for stretches with no traffic at all.
			await database.delete(salt).where(lt(salt.day, day));

			return row.val;
		},
	};
}
