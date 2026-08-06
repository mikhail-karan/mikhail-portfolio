import { utcStamp } from '$lib/format';
import { db } from '$lib/server/db/client';
import { privateStats } from '$lib/server/queries';
import type { PageServerLoad } from './$types';

export const prerender = false;

/**
 * No `config.isr` here, deliberately: this tier is unsuppressed and must never be written to
 * a shared cache. Access is gated by Basic Auth in middleware.ts (§10).
 */
export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders({ 'cache-control': 'no-store' });

	return {
		stats: await privateStats(db()),
		renderedAt: utcStamp(new Date()),
	};
};
