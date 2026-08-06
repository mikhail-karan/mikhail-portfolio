/**
 * Read models for both tiers (§9, §10).
 *
 * Every suppression rule is applied in SQL, so a suppressed value never exists in the render
 * tree, never reaches a template, and cannot be recovered from the page source. Each tier is
 * one statement: the HTTP driver has no pipelining, and the public page's cache budget is
 * stated in reads, not renders.
 */

import { sql, type SQL } from 'drizzle-orm';

import type { Db } from './db/client';
import { PRIVATE_SOURCE, PUBLIC_SOURCES, sourcePattern } from './referrers';

/** Reporting window for both tiers. */
export const WINDOW_DAYS = 30;

/** Buckets smaller than this are indistinguishable from a single person's afternoon. */
export const MIN_BUCKET = 5;

export const OTHER_BUCKET = 'Other';

const UNKNOWN = 'Unknown';

export type Bucket = { label: string; views: number };
export type DayPoint = { day: string; views: number; visitors: number };

export type PublicStats = {
	windowDays: number;
	views: number;
	visitors: number;
	botViews: number;
	/** Day the first event was recorded, or null before there is one. */
	since: string | null;
	daily: DayPoint[];
	paths: Bucket[];
	sources: Bucket[];
	countries: Bucket[];
	devices: Bucket[];
};

export type HourPoint = { hour: string; views: number; visitors: number };

export type PrivateEvent = {
	ts: string;
	path: string;
	referrer: string | null;
	country: string | null;
	device: string | null;
	ua: string | null;
	isBot: boolean;
	visitorDay: string;
};

export type PrivateStats = {
	windowDays: number;
	views: number;
	visitors: number;
	botViews: number;
	hourly: HourPoint[];
	referrers: Bucket[];
	paths: Bucket[];
	recent: PrivateEvent[];
};

const RECENT_LIMIT = 200;

/** A Postgres text literal. These are module constants, but escaping costs nothing. */
function lit(value: string): SQL {
	return sql.raw(`'${value.replaceAll("'", "''")}'`);
}

function int(value: number): SQL {
	if (!Number.isSafeInteger(value)) throw new Error(`Not an integer: ${value}`);
	return sql.raw(String(value));
}

/**
 * Map a referrer to an allowlisted registrable domain, or to the one catch-all bucket.
 *
 * `referrer` is null for both direct traffic and internal navigation, and both belong in the
 * catch-all, so no branch is needed for them.
 */
function sourceExpression(): SQL {
	const branches = PUBLIC_SOURCES.map(
		(domain) => sql`when referrer ~* ${lit(sourcePattern(domain))} then ${lit(domain)}`,
	);

	return sql`case ${sql.join(branches, sql` `)} else ${lit(PRIVATE_SOURCE)} end`;
}

/** A dimension CTE with the `n < 5` collapse applied before anything can select from it. */
function bucketCte(name: string, label: SQL): SQL {
	return sql`
		${sql.raw(name)} as (
			with base as (select ${label} as label, count(*)::int as views from live group by 1)
			select
				case when views >= ${int(MIN_BUCKET)} then label else ${lit(OTHER_BUCKET)} end as label,
				sum(views)::int as views
			from base
			group by 1
		)`;
}

function bucketJson(name: string): SQL {
	return sql`coalesce(
		(select json_agg(row_to_json(x) order by x.views desc, x.label) from ${sql.raw(name)} x),
		'[]'::json
	)`;
}

/** The public tier. Day granularity, suppressed buckets, no raw referrer, no UA. */
export async function publicStats(database: Db): Promise<PublicStats> {
	const result = await database.execute<{ stats: Omit<PublicStats, 'windowDays'> }>(sql`
		with
		scope as (
			select * from event where ts >= now() - make_interval(days => ${int(WINDOW_DAYS)})
		),
		live as (select * from scope where not is_bot),
		${bucketCte('paths', sql`path`)},
		${bucketCte('sources', sourceExpression())},
		${bucketCte('countries', sql`coalesce(country, ${lit(UNKNOWN)})`)},
		${bucketCte('devices', sql`coalesce(device, ${lit(UNKNOWN)})`)},
		days as (
			select generate_series(
				date_trunc('day', now() at time zone 'UTC') - make_interval(days => ${int(WINDOW_DAYS - 1)}),
				date_trunc('day', now() at time zone 'UTC'),
				make_interval(days => 1)
			) as day
		),
		daily as (
			select
				to_char(d.day, 'YYYY-MM-DD') as day,
				count(l.id)::int as views,
				count(distinct l.visitor_day)::int as visitors
			from days d
			left join live l on date_trunc('day', l.ts at time zone 'UTC') = d.day
			group by d.day
		)
		select json_build_object(
			'views', (select count(*)::int from live),
			'visitors', (select count(distinct visitor_day)::int from live),
			'botViews', (select count(*)::int from scope where is_bot),
			'since', (select to_char(min(ts) at time zone 'UTC', 'YYYY-MM-DD') from event),
			'daily', coalesce((select json_agg(row_to_json(x) order by x.day) from daily x), '[]'::json),
			'paths', ${bucketJson('paths')},
			'sources', ${bucketJson('sources')},
			'countries', ${bucketJson('countries')},
			'devices', ${bucketJson('devices')}
		) as stats
	`);

	const stats = result.rows[0]?.stats;
	if (!stats) throw new Error('Public analytics query returned no row.');

	return { windowDays: WINDOW_DAYS, ...stats };
}

/** The private tier. Everything the public tier withholds, for an audience of one. */
export async function privateStats(database: Db): Promise<PrivateStats> {
	const result = await database.execute<{ stats: Omit<PrivateStats, 'windowDays'> }>(sql`
		with
		scope as (
			select * from event where ts >= now() - make_interval(days => ${int(WINDOW_DAYS)})
		),
		hourly as (
			select
				to_char(date_trunc('hour', ts at time zone 'UTC'), 'YYYY-MM-DD HH24:00') as hour,
				count(*)::int as views,
				count(distinct visitor_day)::int as visitors
			from scope
			where not is_bot
			group by 1
		),
		referrers as (
			select referrer as label, count(*)::int as views
			from scope
			where referrer is not null
			group by 1
		),
		paths as (select path as label, count(*)::int as views from scope group by 1),
		recent as (
			select
				to_char(ts at time zone 'UTC', 'YYYY-MM-DD HH24:MI:SS') as ts,
				path, referrer, country, device, ua,
				is_bot as "isBot",
				visitor_day as "visitorDay"
			from event
			order by ts desc
			limit ${int(RECENT_LIMIT)}
		)
		select json_build_object(
			'views', (select count(*)::int from scope where not is_bot),
			'visitors', (select count(distinct visitor_day)::int from scope where not is_bot),
			'botViews', (select count(*)::int from scope where is_bot),
			'hourly', coalesce((select json_agg(row_to_json(x) order by x.hour) from hourly x), '[]'::json),
			'referrers', coalesce(
				(select json_agg(row_to_json(x) order by x.views desc, x.label) from referrers x), '[]'::json
			),
			'paths', coalesce(
				(select json_agg(row_to_json(x) order by x.views desc, x.label) from paths x), '[]'::json
			),
			'recent', coalesce((select json_agg(row_to_json(x) order by x.ts desc) from recent x), '[]'::json)
		) as stats
	`);

	const stats = result.rows[0]?.stats;
	if (!stats) throw new Error('Private analytics query returned no row.');

	return { windowDays: WINDOW_DAYS, ...stats };
}
