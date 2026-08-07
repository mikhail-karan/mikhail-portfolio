import { utcStamp } from '$lib/format';
import { db } from '$lib/server/db/client';
import { publicStats } from '$lib/server/queries';
import type { PageServerLoad } from './$types';

export const prerender = false;

/**
 * One regeneration an hour, so rendering costs at most 24 database reads a day no matter how
 * many requests arrive. Without it this is an unauthenticated endpoint that runs SQL on demand.
 */
export const config = { isr: { expiration: 3600 } };

export const load: PageServerLoad = async () => ({
	stats: await publicStats(db()),
	// The generation time, not the request time — the page says how stale it is (§9).
	renderedAt: utcStamp(new Date()),
});
