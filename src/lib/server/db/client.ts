/**
 * Neon over HTTP. Every statement is a one-shot request, so there is no pool to open,
 * hold, or drain — which is what makes this usable from both the edge middleware and the
 * SvelteKit function without either one owning a connection lifecycle.
 */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import * as schema from './schema';

export type Db = ReturnType<typeof createDb>;

export function createDb(url: string) {
	return drizzle(neon(url), { schema });
}

let cached: Db | undefined;

/** The process-wide client. Warm instances reuse it; cold ones build it on first use. */
export function db(): Db {
	if (!cached) {
		const url = process.env.DATABASE_URL;
		if (!url) throw new Error('DATABASE_URL is not set — analytics cannot reach Neon.');
		cached = createDb(url);
	}
	return cached;
}
