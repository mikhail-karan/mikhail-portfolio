import {
	contact,
	experience,
	highlights,
	identity,
	meta,
	podcast,
	practice,
	projects,
	sideProjects,
	site,
	stack,
} from '../content';

export const NEGOTIATED_VARY = 'Accept, Accept-Encoding';
export const HOME_RESOURCE_URI = `${site.url}/`;

const link = (label: string, href: string) => `[${label}](${href})`;
const list = (items: readonly string[]) => items.map((item) => `- ${item}`).join('\n');

export const homeMarkdown = `# ${identity.name}

${meta.description}

${identity.sideRole.title} of ${link(identity.sideRole.show, identity.sideRole.href)} (${identity.sideRole.note}).
${identity.role} at ${link(identity.company, 'https://www.cyfrin.io')} in ${identity.location}.

${identity.intro.join('\n\n')}

## ${podcast.name}

${podcast.blurb}

${list(podcast.stats.map((stat) => `${stat.value} ${stat.label}`))}

${podcast.links.map((item) => link(item.label, item.href)).join(' · ')}

## Highlights

${highlights.map((item) => `### ${item.title}\n\n${item.body}`).join('\n\n')}

## What I've built

${projects
	.map(
		(
			project,
		) => `### ${project.href ? link(project.name, project.href) : project.name} (${project.period})

**${project.role}.** ${project.summary}

${list(project.details)}

Stack: ${project.stack.join(', ')}.`,
	)
	.join('\n\n')}

## Nights and weekends

${sideProjects
	.map(
		(
			project,
		) => `### ${project.href ? link(project.name, project.href) : project.name} — ${project.status}

${project.summary}

${project.note}

Stack: ${project.stack.join(', ')}.`,
	)
	.join('\n\n')}

## Leading, and the unglamorous parts

${practice.map((item) => `### ${item.title}\n\n${item.body}`).join('\n\n')}

## What I work with

${list(stack.map((group) => `**${group.label}:** ${group.items.join(', ')}`))}

## Experience

${experience
	.map(
		(
			role,
		) => `### ${role.href ? link(role.org, role.href) : role.org} — ${role.title} (${role.period})

${role.body}`,
	)
	.join('\n\n')}

## Get in touch

${list(contact.map((item) => `${item.label}: ${link(item.value, item.href)}`))}

## Agent resources

- [All links](${site.url}/links)
- [Traffic and analytics methodology](${site.url}/analytics)
- [Agent navigation file](${site.url}/llms.txt)
- [MCP endpoint](${site.url}/mcp)
`;

export const notFoundMarkdown = `# 404 — Not found

The requested path does not exist on ${site.url}.

## Where to look next

- [Homepage](${site.url}/)
- [All links](${site.url}/links)
- [Traffic and analytics methodology](${site.url}/analytics)
- [Agent navigation file](${site.url}/llms.txt)
- [MCP endpoint](${site.url}/mcp)
`;

type Representation = 'html' | 'markdown' | 'not-acceptable';

type MediaRange = {
	type: string;
	subtype: string;
	quality: number;
	index: number;
};

function parseAccept(accept: string): MediaRange[] {
	return accept
		.split(',')
		.map((value, index) => {
			const [mediaType = '', ...parameters] = value.trim().toLowerCase().split(';');
			const [type = '', subtype = ''] = mediaType.split('/');
			const qualityParameter = parameters.find((parameter) => parameter.trim().startsWith('q='));
			const parsedQuality = qualityParameter
				? Number.parseFloat(qualityParameter.trim().slice(2))
				: 1;

			return {
				type,
				subtype,
				quality:
					Number.isFinite(parsedQuality) && parsedQuality >= 0 && parsedQuality <= 1
						? parsedQuality
						: 0,
				index,
			};
		})
		.filter((range) => range.type && range.subtype);
}

function matchScore(ranges: MediaRange[], type: string, subtype: string) {
	return ranges
		.filter(
			(range) =>
				(range.type === '*' || range.type === type) &&
				(range.subtype === '*' || range.subtype === subtype),
		)
		.map((range) => ({
			quality: range.quality,
			specificity: Number(range.type !== '*') + Number(range.subtype !== '*'),
			index: range.index,
		}))
		.sort((a, b) => b.specificity - a.specificity || b.quality - a.quality || a.index - b.index)[0];
}

/** Selects between the two representations using RFC 9110 media ranges and q-values. */
export function negotiateRepresentation(accept: string | null): Representation {
	if (!accept) return 'html';

	const ranges = parseAccept(accept);
	const candidates = [
		{ representation: 'html' as const, score: matchScore(ranges, 'text', 'html') },
		{ representation: 'markdown' as const, score: matchScore(ranges, 'text', 'markdown') },
	]
		.filter((candidate) => candidate.score && candidate.score.quality > 0)
		.sort((a, b) => {
			const aScore = a.score!;
			const bScore = b.score!;
			return (
				bScore.quality - aScore.quality ||
				bScore.specificity - aScore.specificity ||
				aScore.index - bScore.index
			);
		});

	return candidates[0]?.representation ?? 'not-acceptable';
}

export function markdownResponse(body: string, status = 200, method = 'GET'): Response {
	return new Response(method === 'HEAD' ? null : body, {
		status,
		headers: {
			'Content-Type': 'text/markdown; charset=utf-8',
			Vary: NEGOTIATED_VARY,
		},
	});
}

export function notAcceptableResponse(method = 'GET'): Response {
	return new Response(
		method === 'HEAD' ? null : 'Not acceptable. Available: text/html, text/markdown.\n',
		{
			status: 406,
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
				Vary: NEGOTIATED_VARY,
			},
		},
	);
}

export function withVary(response: Response): Response {
	const headers = new Headers(response.headers);
	const vary = new Set(
		(headers.get('Vary') ?? '')
			.split(',')
			.map((value) => value.trim())
			.filter(Boolean),
	);
	vary.add('Accept');
	vary.add('Accept-Encoding');
	headers.set('Vary', [...vary].join(', '));

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}
