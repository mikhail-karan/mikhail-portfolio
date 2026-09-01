import { beforeEach, describe, expect, it, vi } from 'vitest';

const vercel = vi.hoisted(() => ({
	next: vi.fn(
		(init?: ResponseInit) =>
			new Response(null, {
				...init,
				headers: { ...Object.fromEntries(new Headers(init?.headers)), 'x-middleware-next': '1' },
			}),
	),
	waitUntil: vi.fn(),
}));

vi.mock('@vercel/functions', () => vercel);
vi.mock('./lib/server/collect', () => ({
	COLLECTED_PATHS: new Set(['/', '/links', '/analytics']),
	recordEvent: vi.fn(() => Promise.resolve()),
}));
vi.mock('./lib/server/db/client', () => ({ db: vi.fn() }));
vi.mock('./lib/server/salt', () => ({ saltCache: {} }));
vi.mock('./lib/server/store', () => ({ createStore: vi.fn() }));

import middleware from '../middleware';

describe('routing middleware', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('continues HTML homepage requests to the prerendered file with negotiated caching', async () => {
		const response = await middleware(
			new Request('https://www.mikek.me/', { headers: { Accept: 'text/html' } }),
		);

		expect(response.headers.get('x-middleware-next')).toBe('1');
		expect(response.headers.get('Vary')).toBe('Accept, Accept-Encoding');
		expect(vercel.waitUntil).toHaveBeenCalledOnce();
	});

	it('serves the Markdown representation before static-file routing', async () => {
		const response = await middleware(
			new Request('https://www.mikek.me/', { headers: { Accept: 'text/markdown' } }),
		);

		expect(response.status).toBe(200);
		expect(response.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8');
		expect(response.headers.get('Vary')).toBe('Accept, Accept-Encoding');
		expect(await response.text()).toContain('# Mikhail Karan');
		expect(vercel.next).not.toHaveBeenCalled();
		expect(vercel.waitUntil).toHaveBeenCalledOnce();
	});

	it('rejects unsupported homepage representations', async () => {
		const response = await middleware(
			new Request('https://www.mikek.me/', { headers: { Accept: 'application/json' } }),
		);

		expect(response.status).toBe(406);
		expect(response.headers.get('Vary')).toBe('Accept, Accept-Encoding');
		expect(vercel.next).not.toHaveBeenCalled();
	});

	it('enforces private analytics auth before scheduling background work', async () => {
		const response = await middleware(new Request('https://www.mikek.me/analytics/private'));

		expect(response.status).toBe(401);
		expect(vercel.waitUntil).not.toHaveBeenCalled();
		expect(vercel.next).not.toHaveBeenCalled();
	});
});
