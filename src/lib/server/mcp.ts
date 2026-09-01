import { HOME_RESOURCE_URI, homeMarkdown } from './agent-content';

export const MODERN_PROTOCOL_VERSION = '2026-07-28';
export const LEGACY_PROTOCOL_VERSIONS = ['2025-11-25', '2025-06-18', '2025-03-26'] as const;
export const SUPPORTED_PROTOCOL_VERSIONS = [
	MODERN_PROTOCOL_VERSION,
	...LEGACY_PROTOCOL_VERSIONS,
] as const;

const supportsProtocolVersion = (version: unknown): version is string =>
	typeof version === 'string' &&
	(SUPPORTED_PROTOCOL_VERSIONS as readonly string[]).includes(version);

const supportsLegacyProtocolVersion = (version: unknown): version is string =>
	typeof version === 'string' && (LEGACY_PROTOCOL_VERSIONS as readonly string[]).includes(version);

const SERVER_INFO = {
	name: 'mikek-portfolio',
	title: 'Mikhail Karan Portfolio',
	version: '1.0.0',
	description: 'Public, read-only portfolio resources for Mikhail Karan.',
	websiteUrl: 'https://mikek.me/',
} as const;

const RESOURCE = {
	uri: HOME_RESOURCE_URI,
	name: 'mikhail-karan-portfolio',
	title: 'Mikhail Karan — portfolio',
	description:
		'Work, side projects, engineering leadership practice, technical stack, experience, and contact details.',
	mimeType: 'text/markdown',
	size: new TextEncoder().encode(homeMarkdown).byteLength,
} as const;

type JsonRpcId = string | number | null;

type JsonRpcRequest = {
	jsonrpc: '2.0';
	id?: JsonRpcId;
	method: string;
	params?: Record<string, unknown>;
};

function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			'Cache-Control': 'no-store',
			'Content-Type': 'application/json; charset=utf-8',
		},
	});
}

function rpcResult(id: JsonRpcId, result: unknown, status = 200): Response {
	return jsonResponse({ jsonrpc: '2.0', id, result }, status);
}

function rpcError(
	id: JsonRpcId | undefined,
	code: number,
	message: string,
	status = 200,
	data?: unknown,
): Response {
	return jsonResponse(
		{
			jsonrpc: '2.0',
			...(id === undefined ? {} : { id }),
			error: { code, message, ...(data === undefined ? {} : { data }) },
		},
		status,
	);
}

function acceptsMcpResponse(accept: string | null): boolean {
	if (!accept) return false;
	const mediaTypes = accept
		.toLowerCase()
		.split(',')
		.map((part) => part.trim().split(';')[0]);
	return mediaTypes.includes('application/json') && mediaTypes.includes('text/event-stream');
}

function isJsonRpcRequest(value: unknown): value is JsonRpcRequest {
	if (!value || typeof value !== 'object') return false;
	const candidate = value as Record<string, unknown>;
	return (
		candidate.jsonrpc === '2.0' &&
		typeof candidate.method === 'string' &&
		(candidate.id === undefined ||
			candidate.id === null ||
			typeof candidate.id === 'string' ||
			typeof candidate.id === 'number') &&
		(candidate.params === undefined ||
			(candidate.params !== null &&
				typeof candidate.params === 'object' &&
				!Array.isArray(candidate.params)))
	);
}

function decodeHeaderValue(value: string): string | null {
	if (!value.startsWith('=?base64?') || !value.endsWith('?=')) return value;

	try {
		const decoded = atob(value.slice(10, -2));
		return new TextDecoder().decode(
			Uint8Array.from(decoded, (character) => character.charCodeAt(0)),
		);
	} catch {
		return null;
	}
}

function requestMeta(message: JsonRpcRequest): Record<string, unknown> | undefined {
	const meta = message.params?._meta;
	return meta && typeof meta === 'object' && !Array.isArray(meta)
		? (meta as Record<string, unknown>)
		: undefined;
}

function modernValidationError(request: Request, message: JsonRpcRequest): Response | undefined {
	const meta = requestMeta(message);
	const bodyVersion = meta?.['io.modelcontextprotocol/protocolVersion'];
	const headerVersion = request.headers.get('MCP-Protocol-Version');
	const methodHeader = request.headers.get('Mcp-Method');

	if (bodyVersion !== MODERN_PROTOCOL_VERSION || headerVersion !== bodyVersion) {
		if (typeof bodyVersion === 'string' && !supportsProtocolVersion(bodyVersion)) {
			return rpcError(message.id, -32022, 'Unsupported protocol version', 400, {
				supported: [...SUPPORTED_PROTOCOL_VERSIONS],
				requested: bodyVersion,
			});
		}
		return rpcError(
			message.id,
			-32020,
			'Header mismatch: MCP-Protocol-Version is missing or does not match request metadata',
			400,
		);
	}

	if (!meta || typeof meta['io.modelcontextprotocol/clientCapabilities'] !== 'object') {
		return rpcError(
			message.id,
			-32602,
			'Invalid params: required modern MCP request metadata is missing',
			400,
		);
	}

	if (methodHeader !== message.method) {
		return rpcError(
			message.id,
			-32020,
			'Header mismatch: Mcp-Method is missing or does not match the request method',
			400,
		);
	}

	if (message.method === 'resources/read') {
		const uri = message.params?.uri;
		const nameHeader = request.headers.get('Mcp-Name');
		if (typeof uri !== 'string' || !nameHeader || decodeHeaderValue(nameHeader) !== uri) {
			return rpcError(
				message.id,
				-32020,
				'Header mismatch: Mcp-Name is missing, malformed, or does not match the resource URI',
				400,
			);
		}
	}
}

function isModernRequest(request: Request, message: JsonRpcRequest): boolean {
	const headerVersion = request.headers.get('MCP-Protocol-Version');
	const bodyVersion = requestMeta(message)?.['io.modelcontextprotocol/protocolVersion'];
	return (
		typeof bodyVersion === 'string' ||
		(headerVersion !== null && !supportsLegacyProtocolVersion(headerVersion))
	);
}

function modernResult(result: Record<string, unknown>): Record<string, unknown> {
	return {
		resultType: 'complete',
		...result,
		ttlMs: 300_000,
		cacheScope: 'public',
	};
}

function allowedOrigin(request: Request): boolean {
	const origin = request.headers.get('Origin');
	if (!origin) return true;

	const requestUrl = new URL(request.url);
	const allowed = new Set(['https://mikek.me', 'https://www.mikek.me']);
	if (requestUrl.hostname === 'localhost' || requestUrl.hostname === '127.0.0.1') {
		allowed.add(requestUrl.origin);
	}
	return allowed.has(origin);
}

export async function handleMcpPost(request: Request): Promise<Response> {
	if (!allowedOrigin(request)) {
		return rpcError(undefined, -32000, 'Forbidden origin', 403);
	}

	if (!acceptsMcpResponse(request.headers.get('Accept'))) {
		return rpcError(
			undefined,
			-32000,
			'Accept must include application/json and text/event-stream',
			406,
		);
	}

	if (
		request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json'
	) {
		return rpcError(undefined, -32700, 'Content-Type must be application/json', 415);
	}

	let parsed: unknown;
	try {
		parsed = await request.json();
	} catch {
		return rpcError(null, -32700, 'Parse error', 400);
	}

	if (!isJsonRpcRequest(parsed)) {
		return rpcError(null, -32600, 'Invalid Request', 400);
	}

	if (parsed.id === undefined) {
		return new Response(null, { status: 202, headers: { 'Cache-Control': 'no-store' } });
	}

	if (parsed.method === 'initialize') {
		const requestedVersion = parsed.params?.protocolVersion;
		const protocolVersion = supportsLegacyProtocolVersion(requestedVersion)
			? requestedVersion
			: LEGACY_PROTOCOL_VERSIONS[0];

		return rpcResult(parsed.id, {
			protocolVersion,
			capabilities: { resources: {} },
			serverInfo: SERVER_INFO,
			instructions: 'Read the portfolio resource for public information about Mikhail Karan.',
		});
	}

	const modern = isModernRequest(request, parsed);
	if (modern) {
		const validationError = modernValidationError(request, parsed);
		if (validationError) return validationError;
	} else {
		const protocolVersion = request.headers.get('MCP-Protocol-Version') ?? '2025-03-26';
		if (!supportsLegacyProtocolVersion(protocolVersion)) {
			return rpcError(parsed.id, -32602, 'Unsupported protocol version', 400, {
				supported: [...SUPPORTED_PROTOCOL_VERSIONS],
				requested: protocolVersion,
			});
		}
	}

	switch (parsed.method) {
		case 'server/discover':
			if (!modern) return rpcError(parsed.id, -32601, 'Method not found');
			return rpcResult(
				parsed.id,
				modernResult({
					supportedVersions: [...SUPPORTED_PROTOCOL_VERSIONS],
					capabilities: { resources: {} },
					_meta: { 'io.modelcontextprotocol/serverInfo': SERVER_INFO },
					instructions: 'Read the portfolio resource for public information about Mikhail Karan.',
				}),
			);

		case 'resources/list':
			return rpcResult(
				parsed.id,
				modern ? modernResult({ resources: [RESOURCE] }) : { resources: [RESOURCE] },
			);

		case 'resources/read': {
			const uri = parsed.params?.uri;
			if (uri !== HOME_RESOURCE_URI) {
				return rpcError(parsed.id, -32002, 'Resource not found');
			}
			const contents = [{ uri: HOME_RESOURCE_URI, mimeType: 'text/markdown', text: homeMarkdown }];
			return rpcResult(parsed.id, modern ? modernResult({ contents }) : { contents });
		}

		case 'resources/templates/list':
			return rpcResult(
				parsed.id,
				modern ? modernResult({ resourceTemplates: [] }) : { resourceTemplates: [] },
			);

		case 'ping':
			return rpcResult(parsed.id, {});

		default:
			return rpcError(parsed.id, -32601, 'Method not found', modern ? 404 : 200);
	}
}

export function mcpMethodNotAllowed(): Response {
	return new Response(null, { status: 405, headers: { Allow: 'POST' } });
}
