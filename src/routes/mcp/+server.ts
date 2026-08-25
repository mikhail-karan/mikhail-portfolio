import type { RequestHandler } from './$types';

import { handleMcpPost, mcpMethodNotAllowed } from '$lib/server/mcp';

export const prerender = false;

export const POST: RequestHandler = ({ request }) => handleMcpPost(request);
export const GET: RequestHandler = () => mcpMethodNotAllowed();
export const DELETE: RequestHandler = () => mcpMethodNotAllowed();
