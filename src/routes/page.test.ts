import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import Page from './+page.svelte';
import { prerender } from './+page';

describe('server-rendered homepage', () => {
	it('is emitted as a static file instead of requiring a function invocation', () => {
		expect(prerender).toBe(true);
	});

	it('renders the identity heading and substantial content without client JavaScript', () => {
		const { body, head } = render(Page);
		const visibleText = body
			.replace(/<[^>]+>/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();
		const jsonLdMatch = head.match(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/s);

		expect(body).toContain('<h1');
		expect(body).toContain('Mikhail Karan</h1>');
		expect(visibleText.length).toBeGreaterThan(500);
		expect(jsonLdMatch).not.toBeNull();
		expect(JSON.parse(jsonLdMatch![1])).toMatchObject({
			'@type': 'Person',
			name: 'Mikhail Karan',
			jobTitle: 'Head of Engineering & Lead Developer',
		});
	});
});
