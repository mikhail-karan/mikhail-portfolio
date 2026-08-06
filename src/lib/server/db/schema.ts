/**
 * Analytics schema. See docs/analytics-spec.md §6.
 *
 * `event` is append-only: nothing updates a row after insert except the retention sweep,
 * which nulls `ua` (§7). No table stores a raw IP address (§5).
 */

import { bigserial, boolean, date, index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { bytea } from './bytea';

export const event = pgTable(
	'event',
	{
		id: bigserial('id', { mode: 'number' }).primaryKey(),
		ts: timestamp('ts', { withTimezone: true }).notNull().defaultNow(),
		path: text('path').notNull(),
		referrer: text('referrer'),
		country: text('country'),
		device: text('device'),
		ua: text('ua'),
		isBot: boolean('is_bot').notNull(),
		visitorDay: text('visitor_day').notNull(),
	},
	(t) => [index('event_ts_idx').on(t.ts.desc())],
);

/** One row per UTC day. Rows for past days are destroyed by the sweep, which is what makes
 * historical `visitor_day` values unrecoverable (§5). */
export const salt = pgTable('salt', {
	day: date('day').primaryKey(),
	val: bytea('val').notNull(),
});

export type EventInsert = typeof event.$inferInsert;
