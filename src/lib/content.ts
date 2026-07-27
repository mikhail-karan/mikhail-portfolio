/**
 * All page content in one place.
 *
 * Metrics are kept deliberately qualitative — no revenue figures, no internal
 * dashboard numbers. See the career-achievements repo for the sourced versions.
 */

export const identity = {
	name: 'Mikhail Karan',
	handle: 'mikhail',
	host: 'cyfrin',
	role: 'Head of Engineering & Lead Developer',
	company: 'Cyfrin',
	location: 'Milton, Ontario',
	tagline: 'I build and lead engineering teams that ship security products.',
	sideRole: {
		title: 'Co-host',
		show: 'HTML All The Things',
		href: 'https://www.htmlallthethings.com',
		note: 'weekly since 2018, ~500 episodes',
	},
	intro: [
		"I was Cyfrin's first engineering hire. I built the team, the platform, and most of the products running on it.",
		'Six products, one monorepo, a small remote team, and a lot of Svelte.',
	],
} as const;

export const meta = {
	title: 'Mikhail Karan — Head of Engineering, Cyfrin',
	description:
		'Head of Engineering & Lead Developer at Cyfrin. First engineering hire turned eng lead across six web3 security products. Co-host of the HTML All The Things podcast.',
} as const;

export type Highlight = {
	title: string;
	body: string;
};

export const highlights: Highlight[] = [
	{
		title: 'First engineer → Head of Engineering',
		body: 'Joined as hire #1 with no engineering org to inherit. Grew and led a fully remote, async-first team of roughly nine across six concurrent products — hiring, on-call, delivery, and the hard conversations included.',
	},
	{
		title: 'Six products, built or led every one',
		body: 'A competitive audit platform, an education platform, unified identity/SSO, an acquired vulnerability database, a jobs board, and an AI security agent — all on one Turborepo monorepo.',
	},
	{
		title: 'Designed to run itself',
		body: 'Tens of thousands of active users on a platform that needs roughly one bug fix a quarter. Self-serve pipelines for non-engineers instead of tickets that route through engineering.',
	},
	{
		title: 'AI in production, not in a deck',
		body: 'Led Cygent from first commit to paying customers in about seven months: per-tenant sandboxed agents, blue-green orchestration, self-serve provisioning, and the eval work to know it actually got better.',
	},
	{
		title: 'Security is the job, not a checklist',
		body: 'Owned SOC 2 Type II solo, end to end. Turned ad-hoc white-hat reports into a standing pen-test program. Incident commander for every severe incident, with a retro every single time.',
	},
	{
		title: '~500 episodes and counting',
		body: 'Co-host of HTML All The Things since 2018 — weekly conversations about web development, AI, and building a career in this industry. Still shipping every week.',
	},
];

export type Project = {
	name: string;
	period: string;
	role: string;
	summary: string;
	details: string[];
	stack: string[];
	href?: string;
};

export const projects: Project[] = [
	{
		name: 'Cygent',
		period: '2025 → now',
		role: 'Engineering lead',
		summary:
			'An AI security engineer a company hires like a team member — it joins your Slack, Discord, Telegram, GitHub and Linear, builds context on your codebase continuously, flags smart-contract foot-guns during development, and runs full audits.',
		details: [
			'Security-hardened agentic system: one isolated, sandboxed Docker environment per agent, each with its own compute and privileges, running 24/7',
			'Orchestrator handling per-tenant instance lifecycle — provisioning, health checks, blue-green deploys, webhook routing, multi-host',
			'Self-serve portal: Stripe purchase to a provisioned agent in seconds',
			'Agentic tool loop with engagement scoring, conversation state, and a per-user memory system',
			'Custom Postgres primitives — job queue, KV with TTL, and vector search — instead of three more vendors',
			'Auto pen-test "battle system": red/blue team exploit testing in ephemeral sandboxes',
			'From first commit to paying customers in ~7 months',
		],
		stack: [
			'Bun',
			'TypeScript',
			'SvelteKit',
			'Drizzle',
			'Postgres + pgvector',
			'Docker',
			'E2B',
			'MCP',
		],
		href: 'https://www.cygent.dev/',
	},
	{
		name: 'Cyfrin Updraft',
		period: '2023 → now',
		role: 'Led development',
		summary:
			'The leading web3 education platform — fully custom, not an off-the-shelf LMS. Tens of thousands of active users and consistent monthly signups with essentially no marketing spend.',
		details: [
			'Video player built bottom-to-top, with delivery and analytics through Mux',
			'Course progression engine handling mixed video and written lessons, plus a custom quiz system',
			'Fully proctored certification flow with payments — industry certifications that generate direct revenue',
			'Video-level and platform-level sponsorships with their own analytics pipelines',
			'Self-serve course-launching pipeline so the education team ships courses without engineering',
		],
		stack: [
			'SvelteKit',
			'Svelte 5',
			'TypeScript',
			'Statamic CMS',
			'Mux',
			'Stripe',
			'tRPC',
			'Prisma',
		],
		href: 'https://updraft.cyfrin.io',
	},
	{
		name: 'CodeHawks',
		period: '2023 → now',
		role: 'Built from zero as first engineering hire',
		summary:
			"Cyfrin's first product bet and the reason I was hired: a competitive audit platform where companies post codebases as contests and independent security researchers compete to find vulnerabilities for rewards.",
		details: [
			'Contest dashboard covering codebase analysis through findings submission',
			'From-scratch judging system for evaluating every finding — validity, severity, duplicates',
			'Automated rewards calculator computing payout splits across finding counts, severity, and duplicates',
			'Hired the first additional engineer within months and moved into a tech-lead role on the product',
		],
		stack: ['SvelteKit', 'TypeScript', 'tRPC', 'TanStack Query', 'Prisma', 'Postgres', 'Vercel'],
		href: 'https://codehawks.cyfrin.io',
	},
	{
		name: 'Solodit',
		period: '2024',
		role: 'Solo migration',
		summary:
			'An acquired React app — a searchable database of smart contract vulnerabilities aggregated from audit reports across the industry. I rebuilt and migrated it single-handedly.',
		details: [
			'Rebuilt backend and frontend from the ground up, React → SvelteKit',
			'Wired into the shared profiles/SSO system',
			'Custom scrapers per audit firm to ingest vulnerability reports, plus a GitHub-based submission pipeline for firms to submit their own',
			'Done pre-agentic-AI — hand-written, ChatGPT-era at best',
		],
		stack: ['SvelteKit', 'TypeScript', 'tRPC', 'Prisma', 'web scraping', 'ingestion pipelines'],
		href: 'https://solodit.cyfrin.io',
	},
	{
		name: 'Unified identity',
		period: '2024',
		role: 'Architected, managed the owning engineer',
		summary:
			'Four separate apps became one platform. A standalone profiles application acting as the SSO/identity hub for the whole ecosystem — log in once, logged in everywhere.',
		details: [
			'One account across education, competitive audits, vulnerability research, and jobs',
			'Dedicated profiles service and schema behind it',
			'Hired and managed the engineer who owned it',
		],
		stack: ['SvelteKit', 'tRPC', 'Prisma', 'auth/session architecture'],
	},
	{
		name: 'Jobs board',
		period: '2025',
		role: 'Rescued and delivered',
		summary:
			'An end-to-end hiring platform tied to Cyfrin profiles: companies purchase and post jobs, candidates apply, an LLM pre-screens before handoff to the company ATS. It was off track; I stepped in late and drove it to an on-time launch.',
		details: [
			'Full purchasing workflow for companies posting jobs',
			'LLM candidate pre-screening ahead of ATS handoff, with integrations syncing companies’ own listings into the board',
			'Made the speed-vs-longevity calls, managed the tech debt deliberately, re-organized the work',
			'Shipped on schedule. Traction was modest — the rescue and the trade-off management are the achievement, not the outcome',
		],
		stack: ['SvelteKit', 'Stripe', 'LLM screening', 'ATS integrations'],
	},
];

export type Practice = {
	title: string;
	body: string;
};

/** Leadership / process work that isn't a product. */
export const practice: Practice[] = [
	{
		title: 'SOC 2 Type II, owned solo',
		body: 'Enterprise deals for an AI agent need it — nobody hands a bot their repos and Slack without one. Cyfrin had no compliance function, no HR, no IT, so the whole program needed a single owner. Stood it up, drove the company to audit-ready in about two months, then through the observation window and the audit itself. Certified with zero findings, alongside leading engineering.',
	},
	{
		title: 'Incident command',
		body: 'Led every severe-issue war room over three years: called it, coordinated the response, handled messaging, delegated workstreams, and closed with a retrospective every time. Hot-fixes inside the hour — a self-inflicted API stampede diagnosed and patched 33 minutes after the first user report. No war room ever repeated a root cause.',
	},
	{
		title: 'A continuous pen-test program',
		body: 'White-hat researchers were reporting issues organically, so I turned those relationships into a standing group continuously attacking our platforms, paid per bug. Every new app shipped got the same adversarial treatment. A grey-box assessment of the agent container isolation surfaced critical escape vectors — in the dev environment, before any customer exposure.',
	},
	{
		title: 'DDoS mitigation that held',
		body: 'A high-traffic public platform in an adversarial space gets attacked. Worked with Vercel on initial mitigation, then designed our own protection layered on top. The attacks kept coming and stopped landing.',
	},
	{
		title: 'Culture that shipped features',
		body: 'Internal hackathons run as both a morale reset and a real product pipeline — projects graduated into production platform features. Weekly show-and-tell to keep a distributed team connected to each other’s work.',
	},
	{
		title: 'Sales engineering',
		body: 'Cygent is a technical product sold to technical buyers, with no sales-engineering function to lean on. Ran live demos and technical Q&A on roughly thirty calls — sandboxing, permissions, integrations, the questions that decide whether a security company gives you repo access — converting half to trials. Then built the demo flow and materials so sales could run those calls without an engineer in the room.',
	},
	{
		title: 'Engineering the go-to-market motion',
		body: 'The other half of that job is building the machine instead of sitting in every call. Shipped the self-serve funnel that turns a Stripe checkout into a live, provisioned agent in seconds — no human in the loop. Built LLM pre-screening wired into customer ATSs, sponsorship pipelines with their own analytics, and course-launch tooling the education team runs without filing a ticket. Same pattern every time: sit in the revenue conversation, find the manual step, automate it, instrument it so you know whether it worked.',
	},
];

export type StackGroup = {
	label: string;
	items: string[];
};

export const stack: StackGroup[] = [
	{ label: 'core', items: ['TypeScript', 'JavaScript', 'Node', 'Bun', 'Python'] },
	{ label: 'frontend', items: ['Svelte 5', 'SvelteKit', 'Vue', 'React', 'Storybook', 'CSS'] },
	{
		label: 'backend',
		items: ['tRPC', 'Prisma', 'Drizzle', 'Postgres', 'pgvector', 'REST', 'webhooks'],
	},
	{
		label: 'infra',
		items: ['Vercel', 'Docker', 'Turborepo', 'pnpm', 'Cloudflare', 'Datadog', 'Vitest'],
	},
	{ label: 'ai', items: ['LLM orchestration', 'agent evals', 'MCP', 'E2B sandboxes', 'RAG'] },
	{
		label: 'leading',
		items: ['hiring', 'remote/async teams', 'on-call design', 'incident command', 'SOC 2'],
	},
];

export type Role = {
	org: string;
	title: string;
	period: string;
	body: string;
	href?: string;
};

export const experience: Role[] = [
	{
		org: 'Cyfrin',
		title: 'Head of Engineering & Lead Developer',
		period: '2023 → now',
		body: 'First engineering hire → tech lead → Head of Engineering. All of engineering: architecture and delivery across the whole product platform, while staying hands-on as lead developer.',
		href: 'https://www.cyfrin.io',
	},
	{
		org: 'HTML All The Things',
		title: 'Co-host',
		period: '2018 → now',
		body: 'Weekly web development podcast with Matt Lawrence. Nearly 500 episodes on web dev, AI, freelancing, and building a sustainable career in tech.',
		href: 'https://www.htmlallthethings.com',
	},
	{
		org: 'Digital Dynasty Design',
		title: 'Co-founder',
		// TODO: swap in the real start/end years — LinkedIn has them, I didn't want to guess.
		period: 'before Cyfrin',
		body: 'Started a web development agency straight out of college and ran it for the better part of a decade — client work, small business realities, and the responsive-web-design era end to end.',
	},
	{
		org: 'McMaster University',
		title: 'B.Tech, Software Engineering Technology',
		period: '2014 – 2017',
		body: 'Where the agency idea started.',
	},
];

export const podcast = {
	name: 'HTML All The Things',
	blurb:
		'A podcast for developers navigating the modern web industry, with my co-host Matt Lawrence. We started it in 2018 partly to find community, and never stopped — web development, the AI-driven shifts in the industry, freelancing, and what it actually takes to build a career in this field.',
	stats: [
		{ value: '~500', label: 'episodes' },
		{ value: '1M+', label: 'downloads' },
		{ value: 'weekly', label: 'since 2018' },
		{ value: '117', label: 'articles on DEV' },
	],
	links: [
		{ label: 'htmlallthethings.com', href: 'https://www.htmlallthethings.com' },
		{ label: 'Spotify', href: 'https://open.spotify.com/show/2MWqU5ZbO69jy3RZ74wgdM' },
		{
			label: 'Apple Podcasts',
			href: 'https://podcasts.apple.com/us/podcast/html-all-the-things-web-development-ai-and/id1412209136',
		},
		{ label: 'YouTube', href: 'https://www.youtube.com/channel/UCvvIv5sF75td95a3NC3atAw' },
	],
} as const;

export const contact = [
	{ label: 'email', value: 'mikhail.karan@gmail.com', href: 'mailto:mikhail.karan@gmail.com' },
	{ label: 'github', value: 'mikhail-karan', href: 'https://github.com/mikhail-karan' },
	{
		label: 'linkedin',
		value: 'mikhail-karan-hatt',
		href: 'https://www.linkedin.com/in/mikhail-karan-hatt/',
	},
	{
		label: 'podcast',
		value: 'htmlallthethings.com',
		href: 'https://www.htmlallthethings.com',
	},
	{ label: 'dev.to', value: 'mikehtmlallthethings', href: 'https://dev.to/mikehtmlallthethings' },
	{ label: 'x', value: '@htmleverything', href: 'https://x.com/htmleverything' },
] as const;
