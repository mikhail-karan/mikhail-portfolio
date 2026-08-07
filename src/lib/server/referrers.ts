/**
 * Referrer allowlist for the public tier (§9).
 *
 * A raw referrer can carry an applicant tracking link, a private wiki page, or a workspace
 * URL. Those are kept in the database (§7) but must never be published, so the public page
 * reports a referrer only when its registrable domain is somewhere already public. Everything
 * else — including anything unparseable — is reported as one bucket.
 *
 * There is no public-suffix list here. The allowlist *is* the list of registrable domains, so
 * matching against it reduces and filters in a single step, and it is short enough to read.
 */

export const PRIVATE_SOURCE = 'Direct / private';

export const PUBLIC_SOURCES = [
	'bing.com',
	'bsky.app',
	'chatgpt.com',
	'claude.ai',
	'cyfrin.io',
	'dev.to',
	'duckduckgo.com',
	'ecosia.org',
	'facebook.com',
	'github.com',
	'google.com',
	'htmlallthethings.com',
	'linkedin.com',
	'mastodon.social',
	'medium.com',
	'perplexity.ai',
	'reddit.com',
	'spotify.com',
	't.co',
	'threads.net',
	'twitter.com',
	'x.com',
	'ycombinator.com',
	'youtube.com',
] as const;

const REGISTRABLE_DOMAIN = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;

/**
 * A `~*` pattern matching URLs whose host is `domain` or a subdomain of it.
 *
 * Anchored at the scheme and terminated at the authority so that `mikek.me.evil.test` and
 * `evil.test/?x=google.com` both fail to match.
 */
export function sourcePattern(domain: string): string {
	if (!REGISTRABLE_DOMAIN.test(domain)) {
		throw new Error(`Not a registrable domain, refusing to build a pattern from it: ${domain}`);
	}

	const escaped = domain.replaceAll('.', '\\.');
	return `^https?://([^/@]*@)?([^/:?#]*\\.)?${escaped}(:[0-9]+)?([/?#]|$)`;
}
