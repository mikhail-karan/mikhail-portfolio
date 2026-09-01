/**
 * Public routes recorded by the production middleware and the development hook.
 *
 * This lives apart from the collector so middleware can decide whether to schedule
 * collection without eagerly loading isbot, Drizzle, or the Neon client.
 */
export const COLLECTED_PATHS: ReadonlySet<string> = new Set(['/', '/links', '/analytics']);
