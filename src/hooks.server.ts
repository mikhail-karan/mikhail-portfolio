/**
 * Three jobs: the private-tier backstop, development collection, and agent responses.
 *
 * The private-tier gate runs in every environment. §10 puts enforcement in middleware and that
 * is where the 401 is normally returned, at the edge, before a function is invoked — but the
 * matcher is a routing rule, and an unsuppressed dataset should not be one routing rule away
 * from public. This is the same `isAuthorized` check, one layer further in.
 *
 * Collection runs only in development, because `vite dev` does not execute Vercel middleware.
 * In production the middleware has already recorded the request and doing it again here would
 * double-count every pageview.
 *
 * In development this hook also negotiates the homepage representation because Vite does not run
 * routing middleware. Production middleware handles `/` before serving its prerendered HTML file.
 * Dynamic 404s continue to negotiate here in every environment.
 */

import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import type { Handle } from '@sveltejs/kit';

import { isAuthorized, isPrivateTier, unauthorized } from '$lib/server/auth';
import {
	homeMarkdown,
	markdownResponse,
	negotiateRepresentation,
	notAcceptableResponse,
	notFoundMarkdown,
	withVary,
} from '$lib/server/agent-content';
import { COLLECTED_PATHS } from '$lib/server/collected-paths';
import { recordPageview } from '$lib/server/record-pageview';

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
		await recordPageview(event.request.headers, event.url);
	}

	const canNegotiate = event.request.method === 'GET' || event.request.method === 'HEAD';
	const representation = canNegotiate
		? negotiateRepresentation(event.request.headers.get('Accept'))
		: 'html';

	if (event.url.pathname === '/' && representation === 'markdown') {
		return markdownResponse(homeMarkdown, 200, event.request.method);
	}

	if (event.url.pathname === '/' && representation === 'not-acceptable') {
		return notAcceptableResponse(event.request.method);
	}

	const response = await resolve(event);

	if (response.status === 404 && representation === 'markdown') {
		return markdownResponse(notFoundMarkdown, 404, event.request.method);
	}

	return event.url.pathname === '/' ? withVary(response) : response;
};
