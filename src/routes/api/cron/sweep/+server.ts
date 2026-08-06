import { env } from '$env/dynamic/private';
import { error, json } from '@sveltejs/kit';

import { constantTimeEqual } from '$lib/server/auth';
import { db } from '$lib/server/db/client';
import { sweep } from '$lib/server/retention';
import type { RequestHandler } from './$types';

export const prerender = false;

/**
 * Daily retention sweep (§7), invoked by the cron in vercel.json.
 *
 * Vercel sends `Authorization: Bearer $CRON_SECRET` when that variable is set on the project.
 * Without the check this is a public endpoint that mutates the log, so a missing secret is
 * treated as a failure rather than as permission.
 */
export const GET: RequestHandler = async ({ request }) => {
	const secret = env.CRON_SECRET;
	const header = request.headers.get('authorization') ?? '';

	if (!secret || !(await constantTimeEqual(header, `Bearer ${secret}`))) {
		error(401, 'Unauthorized');
	}

	const result = await sweep(db());
	console.info('Retention sweep complete', result);

	return json(result);
};
