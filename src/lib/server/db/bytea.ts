/**
 * Postgres `bytea` for drizzle.
 *
 * Imported by `middleware.ts` through `collect.ts`, so this file and everything under
 * `src/lib/server/` that the collector touches use same-directory relative imports rather
 * than `$lib` — Vercel bundles the middleware itself and does not resolve SvelteKit aliases.
 */

import { customType } from 'drizzle-orm/pg-core';

const HEX_PREFIX = '\\x';

/** Postgres accepts `\x<hex>` as bytea input in text format, which is what the HTTP driver sends. */
export function encodeBytea(value: Uint8Array): string {
	let hex = '';
	for (const byte of value) hex += byte.toString(16).padStart(2, '0');
	return `${HEX_PREFIX}${hex}`;
}

/**
 * Decode a bytea column value.
 *
 * The Neon driver parses oid 17 with its own Buffer shim, so on Node this arrives as a
 * Buffer and in workers as a plain Uint8Array. Both are already bytes. Only the escaped
 * text form needs unwrapping.
 */
export function decodeBytea(value: string | Uint8Array): Uint8Array {
	if (typeof value !== 'string') return new Uint8Array(value);

	if (!value.startsWith(HEX_PREFIX)) {
		throw new Error(`Unsupported bytea encoding: expected a ${HEX_PREFIX} prefix`);
	}

	const hex = value.slice(HEX_PREFIX.length);
	const bytes = new Uint8Array(hex.length / 2);
	for (let i = 0; i < bytes.length; i += 1) {
		bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
	}
	return bytes;
}

export const bytea = customType<{ data: Uint8Array; driverData: string }>({
	dataType: () => 'bytea',
	toDriver: encodeBytea,
	fromDriver: decodeBytea,
});
