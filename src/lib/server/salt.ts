/**
 * Per-day salt, cached in module scope (§5.1).
 *
 * The cache holds the in-flight promise rather than the resolved value, so the many requests
 * a cold instance takes in its first milliseconds share one upsert instead of racing.
 */

import type { CollectStore } from './store';

const SALT_BYTES = 32;

export type SaltCache = {
	get(day: string, store: Pick<CollectStore, 'claimSalt'>): Promise<Uint8Array>;
};

/** The UTC calendar day a timestamp belongs to, as `YYYY-MM-DD`. */
export function utcDay(now: Date): string {
	return now.toISOString().slice(0, 10);
}

function newSalt(): Uint8Array {
	return crypto.getRandomValues(new Uint8Array(SALT_BYTES));
}

/**
 * Build a cache. Production uses the module-scope `saltCache` below; tests build their own
 * so that one test's cached day cannot leak into the next.
 */
export function createSaltCache(generate: () => Uint8Array = newSalt): SaltCache {
	let cachedDay: string | undefined;
	let pending: Promise<Uint8Array> | undefined;

	return {
		get(day, store) {
			if (cachedDay === day && pending) return pending;

			cachedDay = day;
			pending = store.claimSalt(day, generate()).catch((error: unknown) => {
				// A failed lookup must not pin the cache — the next request has to retry.
				if (cachedDay === day) {
					cachedDay = undefined;
					pending = undefined;
				}
				throw error;
			});

			return pending;
		},
	};
}

export const saltCache = createSaltCache();
