/**
 * Development-only stand-in for `middleware.ts` (§8.1).
 *
 * `vite dev` does not run Vercel middleware, so without this nothing would be collected while
 * developing and `/analytics/private` would be open. It calls the same `recordEvent` and the
 * same auth check the middleware does — no second implementation.
 */

import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import type { Handle } from '@sveltejs/kit';

import { isAuthorized, PRIVATE_PATH, unauthorized } from '$lib/server/auth';
import { COLLECTED_PATHS, recordEvent } from '$lib/server/collect';
import { db } from '$lib/server/db/client';
import { saltCache } from '$lib/server/salt';
import { createStore } from '$lib/server/store';

export const handle: Handle = async ({ event, resolve }) => {
	if (!dev) return resolve(event);

	if (event.url.pathname === PRIVATE_PATH) {
		if (!(await isAuthorized(event.request.headers, env.ANALYTICS_PRIVATE_AUTH))) {
			return unauthorized();
		}
		return resolve(event);
	}

	if (COLLECTED_PATHS.has(event.url.pathname)) {
		// Awaited rather than deferred: there is no `waitUntil` here, and a dev server has no
		// latency budget worth protecting.
		await recordEvent({
			headers: event.request.headers,
			url: event.url,
			now: new Date(),
			store: createStore(db),
			salts: saltCache,
			log: (message, error) => console.error(message, error),
		});
	}

	return resolve(event);
};
