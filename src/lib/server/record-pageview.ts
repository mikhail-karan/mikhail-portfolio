/**
 * Production wiring for one analytics event.
 *
 * Routing middleware imports this module dynamically inside `waitUntil`, keeping the
 * database, ORM, bot classifier, and hashing implementation off the response path.
 * The development hook imports the same wiring normally because Vite has no middleware.
 */

import { recordEvent } from './collect';
import { db } from './db/client';
import { saltCache } from './salt';
import { createStore } from './store';

export function recordPageview(headers: Headers, url: URL, now = new Date()) {
	return recordEvent({
		headers,
		url,
		now,
		store: createStore(db),
		salts: saltCache,
		log: (message, error) => console.error(message, error),
	});
}
