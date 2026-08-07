/**
 * HTTP Basic Auth for /analytics/private (§10).
 *
 * Basic Auth rather than a token in the path or query string: either of those would leak
 * through the `Referer` header on an outbound click, into browser history, and — the part
 * that makes it circular — into this system's own `event.referrer` column.
 */

export const PRIVATE_PATH = '/analytics/private';

const REALM = 'analytics';

/**
 * Whether a request path belongs to the private tier.
 *
 * A prefix test, not equality: SvelteKit also serves the route's load data at
 * `/analytics/private/__data.json`, and that URL returns the same unsuppressed payload as the
 * page. Gating only the exact path would leave the data behind the gate reachable without it.
 */
export function isPrivateTier(pathname: string): boolean {
	return pathname === PRIVATE_PATH || pathname.startsWith(`${PRIVATE_PATH}/`);
}

/** 401 with the challenge browsers need to prompt, and no caching of the rejection. */
export function unauthorized(): Response {
	return new Response('401 Unauthorized\n', {
		status: 401,
		headers: {
			'www-authenticate': `Basic realm="${REALM}", charset="UTF-8"`,
			'cache-control': 'no-store',
			'content-type': 'text/plain; charset=utf-8',
		},
	});
}

/**
 * Whether the request carries the configured credentials.
 *
 * Returns false when the credentials are unset, so a misconfigured deployment fails closed
 * rather than publishing the unsuppressed tier.
 */
export async function isAuthorized(
	headers: Headers,
	expected: string | undefined,
): Promise<boolean> {
	if (!expected) return false;

	const header = headers.get('authorization');
	if (!header?.toLowerCase().startsWith('basic ')) return false;

	return constantTimeEqual(header.slice('basic '.length).trim(), btoa(expected));
}

/**
 * Compare two strings without leaking where they diverge.
 *
 * Digesting first gives both sides a fixed 32-byte comparison, so the loop below leaks
 * neither the position of the first difference nor the length of the secret.
 */
export async function constantTimeEqual(a: string, b: string): Promise<boolean> {
	const encoder = new TextEncoder();
	const [left, right] = await Promise.all([
		crypto.subtle.digest('SHA-256', encoder.encode(a)),
		crypto.subtle.digest('SHA-256', encoder.encode(b)),
	]);

	const x = new Uint8Array(left);
	const y = new Uint8Array(right);

	let diff = 0;
	for (let i = 0; i < x.length; i += 1) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
	return diff === 0;
}
