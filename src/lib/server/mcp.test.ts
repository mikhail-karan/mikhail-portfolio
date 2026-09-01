import { describe, expect, it } from 'vitest';

import { HOME_RESOURCE_URI, homeMarkdown } from './agent-content';
import { MODERN_PROTOCOL_VERSION, handleMcpPost, mcpMethodNotAllowed } from './mcp';

const endpoint = 'https://mikek.me/mcp';
const legacyHeaders = {
	Accept: 'application/json, text/event-stream',
	'Content-Type': 'application/json',
};

function post(body: unknown, headers: Record<string, string> = legacyHeaders) {
	return handleMcpPost(
		new Request(endpoint, {
			method: 'POST',
			headers,
			body: JSON.stringify(body),
		}),
	);
}

function modernRequest(id: number, method: string, params: Record<string, unknown> = {}) {
	return {
		jsonrpc: '2.0',
		id,
		method,
		params: {
			...params,
			_meta: {
				'io.modelcontextprotocol/protocolVersion': MODERN_PROTOCOL_VERSION,
				'io.modelcontextprotocol/clientInfo': { name: 'vitest', version: '1.0.0' },
				'io.modelcontextprotocol/clientCapabilities': {},
			},
		},
	};
}

describe('MCP portfolio resources', () => {
	it('completes the legacy initialize handshake and advertises resources', async () => {
		const response = await post({
			jsonrpc: '2.0',
			id: 1,
			method: 'initialize',
			params: {
				protocolVersion: '2025-11-25',
				capabilities: {},
				clientInfo: { name: 'vitest', version: '1.0.0' },
			},
		});
		const body = await response.json();

		expect(response.status).toBe(200);
		expect(body.result).toMatchObject({
			protocolVersion: '2025-11-25',
			capabilities: { resources: {} },
		});
	});

	it('lists and reads a non-empty resource for legacy clients', async () => {
		const listResponse = await post({
			jsonrpc: '2.0',
			id: 2,
			method: 'resources/list',
			params: {},
		});
		const listBody = await listResponse.json();
		expect(listBody.result.resources).toEqual([
			expect.objectContaining({ uri: HOME_RESOURCE_URI, mimeType: 'text/markdown' }),
		]);

		const readResponse = await post({
			jsonrpc: '2.0',
			id: 3,
			method: 'resources/read',
			params: { uri: HOME_RESOURCE_URI },
		});
		const readBody = await readResponse.json();
		expect(readBody.result.contents[0]).toEqual({
			uri: HOME_RESOURCE_URI,
			mimeType: 'text/markdown',
			text: homeMarkdown,
		});
	});

	it('supports current discovery and resource listing metadata', async () => {
		const message = modernRequest(4, 'server/discover');
		const response = await post(message, {
			...legacyHeaders,
			'MCP-Protocol-Version': MODERN_PROTOCOL_VERSION,
			'Mcp-Method': 'server/discover',
		});
		const body = await response.json();

		expect(body.result).toMatchObject({
			resultType: 'complete',
			capabilities: { resources: {} },
			supportedVersions: expect.arrayContaining([MODERN_PROTOCOL_VERSION, '2025-11-25']),
		});

		const listMessage = modernRequest(5, 'resources/list');
		const listResponse = await post(listMessage, {
			...legacyHeaders,
			'MCP-Protocol-Version': MODERN_PROTOCOL_VERSION,
			'Mcp-Method': 'resources/list',
		});
		const listBody = await listResponse.json();
		expect(listBody.result).toMatchObject({
			resultType: 'complete',
			resources: [expect.objectContaining({ uri: HOME_RESOURCE_URI })],
		});
	});

	it('validates current protocol mirrored headers', async () => {
		const message = modernRequest(6, 'resources/read', { uri: HOME_RESOURCE_URI });
		const response = await post(message, {
			...legacyHeaders,
			'MCP-Protocol-Version': MODERN_PROTOCOL_VERSION,
			'Mcp-Method': 'resources/read',
		});
		const body = await response.json();

		expect(response.status).toBe(400);
		expect(body.error.code).toBe(-32020);
	});

	it('rejects cross-origin browser requests and unsupported response types', async () => {
		const crossOrigin = await post(
			{ jsonrpc: '2.0', id: 7, method: 'resources/list', params: {} },
			{ ...legacyHeaders, Origin: 'https://attacker.example' },
		);
		expect(crossOrigin.status).toBe(403);

		const badAccept = await post(
			{ jsonrpc: '2.0', id: 8, method: 'resources/list', params: {} },
			{ Accept: 'application/json', 'Content-Type': 'application/json' },
		);
		expect(badAccept.status).toBe(406);
	});

	it('accepts notifications without creating a session identifier', async () => {
		const response = await post({ jsonrpc: '2.0', method: 'notifications/initialized' });
		expect(response.status).toBe(202);
		expect(response.headers.has('Mcp-Session-Id')).toBe(false);
		expect(await response.text()).toBe('');
	});

	it('rejects GET and DELETE because the server has no standalone event stream', () => {
		const response = mcpMethodNotAllowed();
		expect(response.status).toBe(405);
		expect(response.headers.get('Allow')).toBe('POST');
	});
});
