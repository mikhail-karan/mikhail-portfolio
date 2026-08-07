/**
 * Edge middleware: collection (§8) and the private-tier gate (§10).
 *
 * Vercel bundles this file itself, outside the SvelteKit build, so the imports below are
 * relative paths rather than `$lib` — the alias does not exist here. The logic they reach is
 * the same code `src/hooks.server.ts` runs in `vite dev`, where no middleware executes.
 *
 * This never rewrites. Vercel middleware on SvelteKit does not support URL rewrites; the 401
 * is a short-circuit response, which is a different thing and is supported.
 */

import { next, waitUntil } from '@vercel/functions';

import { isAuthorized, isPrivateTier, unauthorized } from './src/lib/server/auth';
import { COLLECTED_PATHS, recordEvent } from './src/lib/server/collect';
import { db } from './src/lib/server/db/client';
import { saltCache } from './src/lib/server/salt';
import { createStore } from './src/lib/server/store';

/**
 * Middleware bills per invocation, so this deliberately excludes `/_app/*` and every static
 * asset. Keep in sync with COLLECTED_PATHS in src/lib/server/collect.ts.
 *
 * The private tier is matched as a subtree rather than an exact path, because SvelteKit serves
 * its load data at `/analytics/private/__data.json` and that has to be behind the same gate.
 */
export const config = {
	matcher: ['/', '/links', '/analytics', '/analytics/private', '/analytics/private/:path*'],
};

export default async function middleware(request: Request) {
	const url = new URL(request.url);

	if (isPrivateTier(url.pathname)) {
		if (!(await isAuthorized(request.headers, process.env.ANALYTICS_PRIVATE_AUTH))) {
			return unauthorized();
		}

		// The private tier is not recorded. It has exactly one reader, and putting that reader's
		// IP into the dataset would show up on the public page as a visitor.
		return next();
	}

	if (COLLECTED_PATHS.has(url.pathname)) {
		// Deferred, so the write is never on the path of the visitor's response (§8).
		waitUntil(
			recordEvent({
				headers: request.headers,
				url,
				now: new Date(),
				store: createStore(db),
				salts: saltCache,
				log: (message, error) => console.error(message, error),
			}),
		);
	}

	return next();
}
