/**
 * The allowlist patterns on their own. They are executed by Postgres as `~*`, so these
 * assertions are a proxy for the real thing — queries.test.ts checks the SQL against a
 * database. What is worth pinning here is which URLs the pattern is supposed to accept.
 */

import { describe, expect, it } from 'vitest';

import { PUBLIC_SOURCES, sourcePattern } from './referrers';

const matches = (domain: string, url: string) => new RegExp(sourcePattern(domain), 'i').test(url);

describe('sourcePattern', () => {
	it('matches the domain itself', () => {
		expect(matches('google.com', 'https://google.com/')).toBe(true);
	});

	it('matches a subdomain', () => {
		expect(matches('ycombinator.com', 'https://news.ycombinator.com/item?id=1')).toBe(true);
	});

	it('matches with a port and with http', () => {
		expect(matches('x.com', 'http://x.com:8080/home')).toBe(true);
	});

	it('matches a bare origin with no trailing slash', () => {
		expect(matches('dev.to', 'https://dev.to')).toBe(true);
	});

	it('does not match a suffix lookalike', () => {
		expect(matches('google.com', 'https://google.com.evil.test/')).toBe(false);
		expect(matches('x.com', 'https://notx.com/')).toBe(false);
	});

	it('does not match the domain appearing in a path or query', () => {
		expect(matches('google.com', 'https://evil.test/google.com')).toBe(false);
		expect(matches('google.com', 'https://evil.test/?ref=google.com')).toBe(false);
	});

	it('does not match the domain smuggled through userinfo', () => {
		expect(matches('google.com', 'https://google.com@evil.test/')).toBe(false);
	});

	it('rejects anything that is not a registrable domain', () => {
		expect(() => sourcePattern('not a domain')).toThrow(/registrable domain/);
		expect(() => sourcePattern("x.com'; drop table event; --")).toThrow(/registrable domain/);
	});

	it('accepts every entry in the allowlist', () => {
		for (const domain of PUBLIC_SOURCES) {
			expect(() => sourcePattern(domain)).not.toThrow();
		}
	});
});
