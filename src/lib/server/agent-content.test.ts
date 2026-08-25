import { describe, expect, it } from 'vitest';

import { personJsonLd } from '../content';
import {
	NEGOTIATED_VARY,
	homeMarkdown,
	markdownResponse,
	negotiateRepresentation,
	notFoundMarkdown,
	withVary,
} from './agent-content';

describe('agent-facing content', () => {
	it('provides a substantial Markdown homepage with one top-level identity heading', () => {
		expect(homeMarkdown.length).toBeGreaterThan(500);
		expect(homeMarkdown.match(/^# .+$/gm)).toEqual(['# Mikhail Karan']);
		expect(homeMarkdown).toContain("## What I've built");
	});

	it('provides recovery links in a Markdown 404 body', () => {
		expect(notFoundMarkdown).toMatch(/^# 404/);
		expect(notFoundMarkdown).toContain('https://www.mikek.me/llms.txt');
		expect(notFoundMarkdown).toContain('https://www.mikek.me/mcp');
	});

	it.each([
		[null, 'html'],
		['*/*', 'html'],
		['text/markdown', 'markdown'],
		['text/markdown, text/html;q=0.8', 'markdown'],
		['text/markdown;q=0.5, text/html;q=0.9', 'html'],
		['text/html, text/markdown', 'html'],
		['application/json', 'not-acceptable'],
		['text/markdown;q=0, text/html;q=0', 'not-acceptable'],
	])('negotiates %s as %s', (accept, expected) => {
		expect(negotiateRepresentation(accept)).toBe(expected);
	});

	it('marks Markdown responses as negotiated and omits HEAD bodies', async () => {
		const getResponse = markdownResponse(homeMarkdown);
		expect(getResponse.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8');
		expect(getResponse.headers.get('Vary')).toBe(NEGOTIATED_VARY);
		expect(await getResponse.text()).toBe(homeMarkdown);

		const headResponse = markdownResponse(homeMarkdown, 200, 'HEAD');
		expect(await headResponse.text()).toBe('');
	});

	it('preserves existing Vary fields while adding representation and encoding', () => {
		const response = withVary(
			new Response('html', { headers: { Vary: 'Cookie', 'Content-Type': 'text/html' } }),
		);
		expect(response.headers.get('Vary')).toBe('Cookie, Accept, Accept-Encoding');
	});

	it('publishes a schema.org Person identity from public site data', () => {
		expect(personJsonLd).toMatchObject({
			'@context': 'https://schema.org',
			'@type': 'Person',
			name: 'Mikhail Karan',
			url: 'https://www.mikek.me/',
			jobTitle: 'Head of Engineering & Lead Developer',
		});
		expect(personJsonLd.sameAs).toContain('https://github.com/mikhail-karan');
	});
});
