/**
 * Two jobs, both delegating to code shared with `middleware.ts` (§8.1).
 *
 * The private-tier gate runs in every environment. §10 puts enforcement in middleware and that
 * is where the 401 is normally returned, at the edge, before a function is invoked — but the
 * matcher is a routing rule, and an unsuppressed dataset should not be one routing rule away
 * from public. This is the same `isAuthorized` check, one layer further in.
 *
 * Collection runs only in development, because `vite dev` does not execute Vercel middleware.
 * In production the middleware has already recorded the request and doing it again here would
 * double-count every pageview.
 */

import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import type { Handle } from '@sveltejs/kit';

import { isAuthorized, isPrivateTier, unauthorized } from '$lib/server/auth';
import { COLLECTED_PATHS, recordEvent } from '$lib/server/collect';
import { db } from '$lib/server/db/client';
import { saltCache } from '$lib/server/salt';
import { createStore } from '$lib/server/store';

export const handle: Handle = async ({ event, resolve }) => {
	if (isPrivateTier(event.url.pathname)) {
		if (!(await isAuthorized(event.request.headers, env.ANALYTICS_PRIVATE_AUTH))) {
			return unauthorized();
		}
		return resolve(event);
	}

	if (dev && COLLECTED_PATHS.has(event.url.pathname)) {
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
