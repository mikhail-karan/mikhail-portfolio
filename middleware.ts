/**
 * Routing middleware: homepage representation negotiation, collection (§8), and
 * the private-tier gate (§10).
 *
 * Vercel bundles this file itself, outside the SvelteKit build, so the imports below are
 * relative paths rather than `$lib` — the alias does not exist here. The logic they reach is
 * the same code `src/hooks.server.ts` runs in `vite dev`, where no middleware executes.
 *
 * This never rewrites. The negotiated Markdown and 401 responses short-circuit routing;
 * normal HTML requests continue to the prerendered file.
 */

import { next, waitUntil } from '@vercel/functions';

import { isAuthorized, isPrivateTier, unauthorized } from './src/lib/server/auth';
import {
	NEGOTIATED_VARY,
	homeMarkdown,
	markdownResponse,
	negotiateRepresentation,
	notAcceptableResponse,
} from './src/lib/server/agent-content';
import { COLLECTED_PATHS } from './src/lib/server/collected-paths';

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
		// The dynamic import is part of the deferred task: even loading Neon, Drizzle, and
		// the collector stays off the visitor's response path.
		waitUntil(recordPageviewInBackground(request.headers, url));
	}

	const canNegotiate = request.method === 'GET' || request.method === 'HEAD';
	if (url.pathname === '/' && canNegotiate) {
		const representation = negotiateRepresentation(request.headers.get('Accept'));

		if (representation === 'markdown') {
			return markdownResponse(homeMarkdown, 200, request.method);
		}

		if (representation === 'not-acceptable') {
			return notAcceptableResponse(request.method);
		}
	}

	return next(url.pathname === '/' ? { headers: { Vary: NEGOTIATED_VARY } } : undefined);
}

async function recordPageviewInBackground(headers: Headers, url: URL) {
	const { recordPageview } = await import('./src/lib/server/record-pageview');
	return recordPageview(headers, url);
}
