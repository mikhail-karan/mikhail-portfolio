/**
 * All page content in one place.
 *
 * Metrics are kept deliberately qualitative — no revenue figures, no internal
 * dashboard numbers. See the career-achievements repo for the sourced versions.
 */

import type { IconName } from './icons';

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
		"Cyfrin's first engineering hire. I built the team, the platform, and most of the products on it.",
		'Six products, one monorepo, a small remote team, and a lot of Svelte.',
	],
} as const;

/** Canonical origin. The apex redirects here, so links and og:url use the www host. */
export const site = {
	url: 'https://www.mikek.me',
} as const;

export type PageMeta = {
	title: string;
	description: string;
	/** Path on `site.url`, for canonical and og:url. */
	path: string;
	/** 1200×630 card in static/ — sources live in og/. */
	image: string;
	imageAlt: string;
};

export const meta: PageMeta = {
	title: 'Mikhail Karan — Head of Engineering, Cyfrin',
	description:
		'Head of Engineering & Lead Developer at Cyfrin. First engineering hire turned eng lead across six web3 security products. Co-host of the HTML All The Things podcast.',
	path: '/',
	image: '/og.png',
	imageAlt:
		'Terminal window reading: mikhail@cyfrin:~$ whoami — Mikhail Karan, Head of Engineering & Lead Developer at Cyfrin.',
};

export type Highlight = {
	title: string;
	body: string;
};

export const highlights: Highlight[] = [
	{
		title: 'First engineer → Head of Engineering',
		body: 'Hire #1, no engineering org to inherit. Grew and led a remote, async-first team of nine across six concurrent products — hiring, on-call, delivery, and the hard conversations.',
	},
	{
		title: 'Six products, built or led every one',
		body: 'Competitive audits, education, unified SSO, an acquired vulnerability database, a jobs board, and an AI security agent — one Turborepo monorepo.',
	},
	{
		title: 'Designed to run itself',
		body: 'Tens of thousands of active users, roughly one bug fix a quarter. Non-engineers ship through self-serve pipelines instead of tickets.',
	},
	{
		title: 'AI in production, not in a deck',
		body: 'Cygent, first commit to paying customers in seven months: per-tenant sandboxed agents, blue-green orchestration, self-serve provisioning, and the evals to know it got better.',
	},
	{
		title: 'Security is the job, not a checklist',
		body: 'SOC 2 Type II owned solo. Ad-hoc white-hat reports turned into a standing pen-test program. Incident commander on every severe incident, retro every time.',
	},
	{
		title: '~500 episodes and counting',
		body: 'Co-host of HTML All The Things since 2018 — weekly, on web development, AI, and building a career in this industry.',
	},
];

/**
 * A screenshot of the thing itself, in static/screenshots/.
 *
 * `label` titles the window frame — which screen this is, since the project name is already
 * the heading above it. Dimensions are the file's, so nothing reflows once it loads.
 */
export type Shot = {
	src: string;
	alt: string;
	label: string;
	width: number;
	height: number;
};

export type Project = {
	name: string;
	period: string;
	role: string;
	summary: string;
	details: string[];
	stack: string[];
	href?: string;
	shot?: Shot;
};

export const projects: Project[] = [
	{
		name: 'Cygent',
		period: '2025 → now',
		role: 'Engineering lead',
		summary:
			'An AI security engineer you hire like a team member. It joins Slack, Discord, Telegram, GitHub and Linear, builds context on your codebase, flags smart-contract foot-guns during development, and runs full audits.',
		details: [
			'One isolated, sandboxed Docker environment per agent — own compute, own privileges, running 24/7',
			'Orchestrator for per-tenant lifecycle: provisioning, health checks, blue-green deploys, webhook routing',
			'Self-serve portal — Stripe checkout to a provisioned agent in seconds',
			'Agentic tool loop with engagement scoring, conversation state, and per-user memory',
			'Custom Postgres primitives — job queue, KV with TTL, vector search — instead of three more vendors',
			'Auto pen-test "battle system": red/blue team exploit testing in ephemeral sandboxes',
			'First commit to paying customers in ~7 months',
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
		shot: {
			src: '/screenshots/cygent.webp',
			label: 'agent dashboard',
			alt: 'The Cygent dashboard for a project called bug-bench: counters for audits, active issues and findings by severity, quick actions to start an audit or a pen-test, the agent behaviour panel, and a feed of completed audits and scheduled threat scans.',
			width: 1600,
			height: 946,
		},
	},
	{
		name: 'Cyfrin Updraft',
		period: '2023 → now',
		role: 'Led development',
		summary:
			'The leading web3 education platform — fully custom, not an off-the-shelf LMS. Tens of thousands of active users on essentially no marketing spend.',
		details: [
			'Video player built bottom-to-top, delivery and analytics through Mux',
			'Course progression engine for mixed video and written lessons, plus a custom quiz system',
			'Proctored certification flow with payments — industry certs that generate direct revenue',
			'Video-level and platform-level sponsorships with their own analytics pipelines',
			'Self-serve course launching, so the education team ships without engineering',
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
		shot: {
			src: '/screenshots/updraft.webp',
			label: 'lesson player',
			alt: 'A Blockchain Basics lesson on Cyfrin Updraft: video and written lesson tabs above the player, the lesson description below it, and a course outline in the sidebar with section progress and per-lesson durations.',
			width: 1600,
			height: 964,
		},
	},
	{
		name: 'CodeHawks',
		period: '2023 → now',
		role: 'Built from zero as first engineering hire',
		summary:
			"Cyfrin's first product bet and the reason I was hired: companies post codebases as contests, independent security researchers compete to find vulnerabilities for rewards.",
		details: [
			'Contest dashboard from codebase analysis through findings submission',
			'From-scratch judging system for every finding — validity, severity, duplicates',
			'Rewards calculator computing payout splits across finding counts, severity, and duplicates',
			'Hired the first additional engineer within months, then moved into tech lead on the product',
		],
		stack: ['SvelteKit', 'TypeScript', 'tRPC', 'TanStack Query', 'Prisma', 'Postgres', 'Vercel'],
		href: 'https://codehawks.cyfrin.io',
		shot: {
			src: '/screenshots/codehawks.webp',
			label: 'contest page',
			alt: 'A CodeHawks contest page for an audit called BattleChain Confidence Pools: scope tags and contest dates on the left, a prize pool breakdown with the per-severity payout split on the right, and the contest timeline running from live through judging and appeals to rewards distribution.',
			width: 1600,
			height: 954,
		},
	},
	{
		name: 'Solodit',
		period: '2024',
		role: 'Solo migration',
		summary:
			'An acquired React app — a searchable database of smart contract vulnerabilities pulled from audit reports across the industry. I rebuilt and migrated it single-handedly.',
		details: [
			'Backend and frontend rebuilt from the ground up, React → SvelteKit',
			'Wired into the shared profiles/SSO system',
			'Per-firm scrapers ingesting vulnerability reports, plus a GitHub submission pipeline for firms',
			'Done pre-agentic-AI — hand-written, ChatGPT-era at best',
		],
		stack: ['SvelteKit', 'TypeScript', 'tRPC', 'Prisma', 'web scraping', 'ingestion pipelines'],
		href: 'https://solodit.cyfrin.io',
		shot: {
			src: '/screenshots/solodit.webp',
			label: 'findings search',
			alt: 'Solodit searching smart contract vulnerabilities: impact, quality, rarity and source filters down the left, a results list of over fifty thousand findings in the middle, and the selected finding’s severity, description and affected code on the right.',
			width: 1600,
			height: 966,
		},
	},
	{
		name: 'Unified identity',
		period: '2024',
		role: 'Architected, managed the owning engineer',
		summary:
			'Four separate apps became one platform. A standalone profiles app as the SSO hub for the whole ecosystem — log in once, logged in everywhere.',
		details: [
			'One account across education, competitive audits, vulnerability research, and jobs',
			'Dedicated profiles service and schema behind it',
			'Hired and managed the engineer who owned it',
		],
		stack: ['SvelteKit', 'tRPC', 'Prisma', 'auth/session architecture'],
		shot: {
			src: '/screenshots/profiles.webp',
			label: 'shared profile',
			alt: 'A Cyfrin profile page: one account showing CodeHawks earnings, ranking and finding counts next to Updraft course progress, with cross-links into both products from the sidebar.',
			width: 1600,
			height: 960,
		},
	},
	{
		name: 'Jobs board',
		period: '2025',
		role: 'Led development',
		summary:
			'A hiring platform tied to Cyfrin profiles: companies buy and post jobs, candidates apply, an LLM pre-screens before handoff to the company ATS.',
		details: [
			'Full purchasing workflow for companies posting jobs',
			'Integrations syncing companies’ own listings into the board',
		],
		stack: ['SvelteKit', 'Stripe', 'LLM screening', 'ATS integrations'],
	},
];

export type SideProject = {
	name: string;
	/** What state it is actually in — playable, in use, prototype. Not what it aspires to be. */
	status: string;
	summary: string;
	/** The part that was interesting to build. */
	note: string;
	stack: string[];
	href?: string;
	/** Shown whole, unlike the work screenshots — a game board and a phone-width app lose their
	 *  point when you crop them to a corner. */
	shot?: Shot;
};

/** Things built outside work hours, currently being worked on. */
export const sideProjects: SideProject[] = [
	{
		name: 'Elevator Operator',
		status: 'playable',
		summary:
			'A browser game where you are the elevator. Passengers spawn with a destination and a patience meter — batch the pickups well or eat a strike when someone gives up waiting.',
		note: 'The simulation is a pure, deterministic, tick-based module with no DOM imports: tick(state, commands, dt) returns the next state and the events. Game logic stays unit-tested, the renderer stays swappable. Canvas 2D, seeded RNG, zero runtime dependencies.',
		stack: ['TypeScript', 'Vite', 'Canvas 2D', 'Vitest', 'no runtime deps'],
		href: 'https://elevator-operator.mikek.me',
		shot: {
			src: '/screenshots/elevator-operator.webp',
			label: 'a shift in progress',
			alt: 'Elevator Operator mid-game: a cutaway of an eight-floor building with passengers waiting on floors 1, 4 and 8, the car stopped at floor 6 with its doors open and three riders inside, a brass call panel beside the shaft, and a side panel showing a score of 159, one strike, and forty seconds elapsed.',
			width: 1600,
			height: 950,
		},
	},
	{
		name: 'Language Learner',
		status: 'invite-only, in use',
		summary:
			'A voice tutor built for one person — a Russian speaker learning elementary English talks to an AI tutor out loud, and gets a written review afterwards.',
		note: 'OpenAI Realtime over WebRTC: audio goes browser to OpenAI, the server only signals. Sessions persist transcripts, a learner profile, and corrections that feed the next warm-up. Tests apply the real migrations to an in-process PGlite database, so they cannot drift from what deploys to Neon.',
		stack: [
			'SvelteKit',
			'TypeScript',
			'OpenAI Realtime',
			'WebRTC',
			'Drizzle',
			'Neon',
			'Better Auth',
			'PWA',
		],
		href: 'https://language-learner.mikek.me',
		shot: {
			src: '/screenshots/language-learner.webp',
			label: 'a session in progress',
			alt: 'A live session in Language Learner: a running transcript alternating between the tutor and the learner in English, pause and end buttons under it, a note that saying “pause please” out loud works too, and a privacy notice in Russian explaining that the administrator can see the conversations.',
			width: 1600,
			height: 926,
		},
	},
	{
		name: 'Drain',
		status: 'prototype',
		summary:
			'A macOS menu bar app that tells you why the battery is draining. I lost 20% in an hour to a runaway node process and two editor extension hosts, and nothing surfaced it.',
		note: 'Samples power draw through IOPowerSources, per-process CPU and memory through proc_pidinfo, compressor pressure through host_statistics64. When the thresholds hold for a minute it fires one notification with Kill, Snooze and Ignore on it. The rest of the time it says nothing, which is the actual feature.',
		stack: ['Swift', 'SwiftUI', 'IOKit', 'macOS'],
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
		body: 'Nobody hands a bot their repos and Slack without it, and Cyfrin had no compliance function, no HR, no IT. Stood the program up, drove the company to audit-ready in two months, then through the observation window and the audit. Certified with zero findings, alongside leading engineering.',
	},
	{
		title: 'Incident command',
		body: 'Led every severe-issue war room over three years: called it, coordinated the response, handled messaging, ran the retro. Hot-fixes inside the hour — a self-inflicted API stampede patched 33 minutes after the first user report. No root cause ever repeated.',
	},
	{
		title: 'A continuous pen-test program',
		body: 'Turned organic white-hat reports into a standing group attacking our platforms, paid per bug. Every new app got the same treatment. A grey-box assessment of the agent container isolation surfaced critical escape vectors — in dev, before any customer exposure.',
	},
	{
		title: 'DDoS mitigation that held',
		body: 'A high-traffic public platform in an adversarial space gets attacked. Mitigated with Vercel, then designed our own protection on top. The attacks kept coming and stopped landing.',
	},
	{
		title: 'Culture that shipped features',
		body: 'Internal hackathons as both morale reset and product pipeline — projects graduated into production platform features. Weekly show-and-tell to keep a distributed team connected.',
	},
	{
		title: 'Sales engineering',
		body: 'Cygent is a technical product sold to technical buyers, with no sales-engineering function to lean on. Ran demos and technical Q&A on ~30 calls — sandboxing, permissions, integrations, the questions that decide whether a security company gives you repo access — converting half to trials. Then built the demo flow so sales could run those calls without an engineer.',
	},
	{
		title: 'Engineering the go-to-market motion',
		body: 'The other half of that job is building the machine instead of sitting in every call. Shipped the self-serve funnel — Stripe checkout to a live, provisioned agent, no human in the loop — plus LLM pre-screening into customer ATSs, sponsorship pipelines, and course-launch tooling. Same pattern every time: find the manual step, automate it, instrument it.',
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
		body: 'First engineering hire → tech lead → Head of Engineering. Architecture and delivery across the whole product platform, still hands-on as lead developer.',
		href: 'https://www.cyfrin.io',
	},
	{
		org: 'HTML All The Things',
		title: 'Co-host',
		period: '2018 → now',
		body: 'Weekly web development podcast with Matt Lawrence. Nearly 500 episodes on web dev, AI, freelancing, and careers in tech.',
		href: 'https://www.htmlallthethings.com',
	},
	{
		org: 'Molekule',
		title: 'Senior Frontend Developer',
		period: '2022 – 2023',
		body: 'Contract, remote. Brought in to fix the e-commerce frontend and led the team doing it — less UI friction, more sales. The bottleneck then moved to the backend, so I moved with it. Nuxt and Vue on the front, Magento behind it.',
		href: 'https://molekule.com',
	},
	{
		org: 'Solarians',
		title: 'Project Lead Developer',
		period: '2021 – 2022',
		body: 'Remote, on-call. Solana NFT project: designed the on-chain interaction systems, built the TypeScript endpoints for wallet connection, and shipped an app for customizing animated on-chain NFTs. Ran a team of developers and designers, and fronted dev updates to the community.',
	},
	{
		org: 'Contentlinq',
		title: 'Technical Lead',
		period: '2018 – 2021',
		body: 'Contract, full-time. Designed the frontend systems and led four developers and a designer, building VueJS, Cordova, Flutter and PHP applications for corporations deploying into secure environments.',
	},
	{
		org: 'Digital Dynasty Design',
		title: 'Co-founder',
		// TODO: swap in the real start/end years — LinkedIn has them, I didn't want to guess.
		period: 'before Cyfrin',
		body: 'Started a web development agency out of college and ran it for the better part of a decade — client work, small business realities, the responsive-web era end to end.',
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
		'A podcast for developers navigating the modern web industry, with my co-host Matt Lawrence. Started in 2018 to find community and never stopped — web development, the AI-driven shifts, freelancing, and what building a career in this field actually takes.',
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

export type LinkEntry = {
	icon: IconName;
	label: string;
	detail: string;
	href: string;
};

export type LinkGroup = {
	label: string;
	note: string;
	entries: LinkEntry[];
};

/** Everything the /links page renders — the link-in-bio destination. */
export const links = {
	meta: {
		title: 'Mikhail Karan — links',
		description:
			'Every place to find Mikhail Karan: the HTML All The Things podcast, the show’s socials, code, writing, and how to get in touch.',
		path: '/links',
		image: '/og-links.png',
		imageAlt:
			'Terminal window reading: mikhail@cyfrin:~$ cat ~/links.json — Mikhail Karan, the podcast, the socials, the code, every link on one page.',
	} satisfies PageMeta,
	blurb:
		'Head of Engineering at Cyfrin, co-host of HTML All The Things. Everything worth linking, one page.',
	featured: {
		label: podcast.name,
		detail: 'Weekly web development podcast with Matt Lawrence. New episode every week since 2018.',
		href: 'https://www.htmlallthethings.com',
		/* Podcast numbers only — the DEV article count has its own row below. */
		stats: podcast.stats.slice(0, 3),
	},
	groups: [
		{
			label: 'listen',
			note: 'the podcast',
			entries: [
				{
					icon: 'spotify',
					label: 'Spotify',
					detail: 'HTML All The Things',
					href: 'https://open.spotify.com/show/2MWqU5ZbO69jy3RZ74wgdM',
				},
				{
					icon: 'applepodcasts',
					label: 'Apple Podcasts',
					detail: 'HTML All The Things',
					href: 'https://podcasts.apple.com/us/podcast/html-all-the-things-web-development-ai-and/id1412209136',
				},
				{
					icon: 'youtube',
					label: 'YouTube',
					detail: '@htmlallthethings',
					href: 'https://www.youtube.com/@htmlallthethings',
				},
				{
					icon: 'rss',
					label: 'Every episode',
					detail: 'the full back catalogue',
					href: 'https://www.htmlallthethings.com/landing/podcast',
				},
			],
		},
		{
			label: 'follow',
			note: 'the show',
			entries: [
				{ icon: 'x', label: 'X', detail: '@htmleverything', href: 'https://x.com/htmleverything' },
				{
					icon: 'instagram',
					label: 'Instagram',
					detail: '@htmlallthethings',
					href: 'https://www.instagram.com/htmlallthethings/',
				},
				{
					icon: 'tiktok',
					label: 'TikTok',
					detail: '@htmlallthethings',
					href: 'https://www.tiktok.com/@htmlallthethings',
				},
				{
					icon: 'twitch',
					label: 'Twitch',
					detail: 'live streams',
					href: 'https://www.twitch.tv/htmlallthethings',
				},
				{
					icon: 'patreon',
					label: 'Patreon',
					detail: 'support the show',
					href: 'https://www.patreon.com/htmlallthethings',
				},
			],
		},
		{
			label: 'me',
			note: 'work, code, contact',
			entries: [
				{ icon: 'home', label: 'Portfolio', detail: 'what I build and lead', href: '/' },
				{
					icon: 'github',
					label: 'GitHub',
					detail: 'mikhail-karan',
					href: 'https://github.com/mikhail-karan',
				},
				{
					icon: 'linkedin',
					label: 'LinkedIn',
					detail: 'mikhail-karan-hatt',
					href: 'https://www.linkedin.com/in/mikhail-karan-hatt/',
				},
				{
					icon: 'devdotto',
					label: 'DEV',
					detail: '117 articles',
					href: 'https://dev.to/mikehtmlallthethings',
				},
				{
					icon: 'mail',
					label: 'Email',
					detail: 'mikhail.karan@gmail.com',
					href: 'mailto:mikhail.karan@gmail.com',
				},
			],
		},
	] satisfies LinkGroup[],
} as const;

/**
 * Everything /analytics renders except the numbers themselves.
 *
 * The page is a writeup that happens to have live figures in it, not a dashboard with a
 * disclaimer bolted on, so the method and the limits are content — see docs/analytics-spec.md.
 */
export const analytics = {
	meta: {
		title: 'Traffic — Mikhail Karan',
		description:
			'How this site counts its own traffic: no cookies, no third-party analytics, no JavaScript in the page, and a visitor identifier that stops existing at midnight. With the live numbers.',
		path: '/analytics',
		image: '/og.png',
		imageAlt:
			'Terminal window reading: mikhail@cyfrin:~$ whoami — Mikhail Karan, Head of Engineering & Lead Developer at Cyfrin.',
	} satisfies PageMeta,
	heading: 'Traffic',
	blurb:
		'This site counts its own visitors. At this traffic volume the numbers are not the interesting part — the method is, so here it is alongside the evidence.',
	/** Labels for the four headline figures, in the order the page renders them. */
	totals: {
		views: 'views',
		visitors: 'visitors',
		botViews: 'bot views',
		since: 'counting since',
	},
	visitorNote:
		'A visitor is one identifier on one day. Two days of the same person count as two, which is why there is no returning-visitor number below.',
	dailyCaption: 'views and visitors per day, UTC',
	/** `key` indexes the suppressed dimension buckets on PublicStats. */
	charts: [
		{ key: 'paths', caption: 'pages', labelHead: 'path' },
		{ key: 'sources', caption: 'where visits came from', labelHead: 'source' },
		{ key: 'countries', caption: 'countries', labelHead: 'country' },
		{ key: 'devices', caption: 'devices', labelHead: 'device' },
	],
	methodHeading: 'how it works',
	method: [
		{
			title: 'Nothing is stored on your device',
			body: 'No cookies, no localStorage, and no analytics script. The count happens at the edge, before this page is served, so an ad blocker changes nothing about what is recorded — and there is nothing on your machine to consent to.',
		},
		{
			title: 'The identifier expires at midnight',
			body: 'A visitor is a SHA-256 of a random 32-byte daily salt plus host, IP address and user agent. The raw IP is never written down. The salt is generated once per UTC day and destroyed when the day rolls over, so yesterday’s identifiers cannot be recomputed by anyone — me included.',
		},
		{
			title: 'Which means returning visitors are uncountable',
			body: 'The same person on two days is two unrelated identifiers. There is no way to join them, so there is no returning-visitor number here. That is a consequence of the design, not an omission.',
		},
		{
			title: 'Small numbers are collapsed before they leave the database',
			body: 'Any bucket with fewer than five views is folded into “Other”, and that happens in SQL — a suppressed value never reaches this page in any form. At this traffic volume, an unsuppressed public dashboard would just be publishing individual browsing sessions.',
		},
		{
			title: 'Referrers are checked against an allowlist',
			body: 'A referrer is reduced to its registrable domain and reported only if that domain is somewhere already public. Everything else — including anything unrecognised — is reported as “Direct / private”, because raw referrers can carry links to private wikis, workspaces and hiring systems.',
		},
		{
			title: 'One SvelteKit app, one Postgres, no vendor',
			body: 'Vercel edge middleware writes one row per pageview through Neon’s HTTP driver. This page is regenerated at most once an hour, which is what keeps an unauthenticated public dashboard from being a free SQL endpoint.',
		},
	],
	limitsHeading: 'what these numbers are not',
	limits: [
		'Time is never reported finer than one day, and there is no live feed.',
		'These dimensions cannot be cross-filtered, on purpose.',
		'Bot detection is best-effort pattern matching. Some crawlers are counted as people and some people are counted as crawlers.',
		'No identifier is retained past 30 days. That is the specific claim — the event log itself is kept, and referrer URLs are kept with it, visible only to me.',
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

/** Machine-readable identity for the homepage. Keep this derived from the same public copy. */
export const personJsonLd = {
	'@context': 'https://schema.org',
	'@type': 'Person',
	'@id': `${site.url}/#person`,
	name: identity.name,
	url: `${site.url}/`,
	description: meta.description,
	jobTitle: identity.role,
	worksFor: {
		'@type': 'Organization',
		name: identity.company,
		url: 'https://www.cyfrin.io',
	},
	address: {
		'@type': 'PostalAddress',
		addressLocality: 'Milton',
		addressRegion: 'Ontario',
		addressCountry: 'CA',
	},
	sameAs: contact.filter((entry) => entry.label !== 'email').map((entry) => entry.href),
} as const;
