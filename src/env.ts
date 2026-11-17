import { defineEnvVars } from '@sveltejs/kit/env';

// Optional on purpose: the private tier and the cron route each fail closed when unset.
const optional = (value: string | undefined) => value;

export const variables = defineEnvVars({
	ANALYTICS_PRIVATE_AUTH: {
		schema: optional,
		description: 'Basic Auth credentials for /analytics/private, as user:password.',
	},
	CRON_SECRET: {
		schema: optional,
		description: 'Bearer token Vercel sends on scheduled invocations of /api/cron/sweep.',
	},
});
