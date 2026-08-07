import { describe, expect, it } from 'vitest';

import { isAuthorized, isPrivateTier, unauthorized } from './auth';

const CREDENTIALS = 'mikhail:correct-horse-battery-staple';

function basic(value: string): Headers {
	return new Headers({ authorization: `Basic ${btoa(value)}` });
}

describe('isAuthorized', () => {
	it('accepts the configured credentials', async () => {
		await expect(isAuthorized(basic(CREDENTIALS), CREDENTIALS)).resolves.toBe(true);
	});

	it('accepts a scheme in any casing', async () => {
		const headers = new Headers({ authorization: `basic ${btoa(CREDENTIALS)}` });
		await expect(isAuthorized(headers, CREDENTIALS)).resolves.toBe(true);
	});

	it('rejects a wrong password', async () => {
		await expect(isAuthorized(basic('mikhail:wrong'), CREDENTIALS)).resolves.toBe(false);
	});

	it('rejects a wrong user', async () => {
		const wrongUser = CREDENTIALS.replace('mikhail', 'someone');
		await expect(isAuthorized(basic(wrongUser), CREDENTIALS)).resolves.toBe(false);
	});

	it('rejects a correct prefix', async () => {
		await expect(isAuthorized(basic(CREDENTIALS.slice(0, -1)), CREDENTIALS)).resolves.toBe(false);
	});

	it('rejects a missing header', async () => {
		await expect(isAuthorized(new Headers(), CREDENTIALS)).resolves.toBe(false);
	});

	it('rejects a non-Basic scheme', async () => {
		const headers = new Headers({ authorization: `Bearer ${btoa(CREDENTIALS)}` });
		await expect(isAuthorized(headers, CREDENTIALS)).resolves.toBe(false);
	});

	it('fails closed when no credentials are configured', async () => {
		await expect(isAuthorized(basic(CREDENTIALS), undefined)).resolves.toBe(false);
		await expect(isAuthorized(new Headers(), undefined)).resolves.toBe(false);
	});
});

describe('isPrivateTier', () => {
	it('covers the page itself', () => {
		expect(isPrivateTier('/analytics/private')).toBe(true);
		expect(isPrivateTier('/analytics/private/')).toBe(true);
	});

	it("covers the route's load data, which returns the same unsuppressed payload", () => {
		expect(isPrivateTier('/analytics/private/__data.json')).toBe(true);
		expect(isPrivateTier('/analytics/private//__data.json')).toBe(true);
	});

	it('leaves the public tier alone', () => {
		expect(isPrivateTier('/analytics')).toBe(false);
		expect(isPrivateTier('/analytics/__data.json')).toBe(false);
		expect(isPrivateTier('/')).toBe(false);
	});

	it('does not gate a lookalike sibling route', () => {
		expect(isPrivateTier('/analytics/private-notes')).toBe(false);
	});
});

describe('unauthorized', () => {
	it('challenges the client and forbids caching', () => {
		const response = unauthorized();

		expect(response.status).toBe(401);
		expect(response.headers.get('www-authenticate')).toContain('Basic realm=');
		expect(response.headers.get('cache-control')).toBe('no-store');
	});
});
