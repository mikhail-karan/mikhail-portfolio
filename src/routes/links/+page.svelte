<script lang="ts">
	import Head from '$lib/components/Head.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Prompt from '$lib/components/Prompt.svelte';
	import { identity, links } from '$lib/content';

	/** Flat row counter, so the entrance cascade carries on across group boundaries. */
	let step = 0;
	const groups = links.groups.map((group) => ({
		...group,
		entries: group.entries.map((entry) => ({ ...entry, step: (step += 1) })),
	}));

	const isInternal = (href: string) => href.startsWith('/');
</script>

<Head page={links.meta} />

<main class="shell">
	<div class="column">
		<header>
			<Prompt command="cat ~/links.json" cursor />
			<h1>{identity.name}</h1>
			<p class="blurb">{links.blurb}</p>
		</header>

		<a class="featured" href={links.featured.href} rel="me noreferrer">
			<span class="tag" aria-hidden="true">// featured</span>
			<span class="title">{links.featured.label}</span>
			<span class="detail">{links.featured.detail}</span>
			<span class="stats">
				{#each links.featured.stats as stat (stat.label)}
					<span class="stat">
						<span class="value">{stat.value}</span>
						<span class="faint">{stat.label}</span>
					</span>
				{/each}
			</span>
			<span class="arrow" aria-hidden="true">↗</span>
		</a>

		{#each groups as group (group.label)}
			<section>
				<h2>
					<span class="accent">{group.label}/</span>
					<span class="faint">{group.note}</span>
					<span class="count">[{group.entries.length}]</span>
				</h2>

				<ul>
					{#each group.entries as entry (entry.href)}
						<li style="--step: {entry.step}">
							<a href={entry.href} rel={isInternal(entry.href) ? undefined : 'me noreferrer'}>
								<span class="mark"><Icon name={entry.icon} /></span>
								<span class="text">
									<span class="label">{entry.label}</span>
									<span class="detail">{entry.detail}</span>
								</span>
								<span class="arrow" aria-hidden="true">{isInternal(entry.href) ? '→' : '↗'}</span>
							</a>
						</li>
					{/each}
				</ul>
			</section>
		{/each}

		<footer>
			<p class="faint">{identity.name} · {identity.location}</p>
			<p><a href="/">cd ~ <span class="faint">back to the portfolio</span></a></p>
		</footer>
	</div>
</main>

<style>
	/* padding-block only — the shell owns the horizontal gutter. */
	main {
		padding-block: clamp(2.5rem, 9vh, 4.5rem) 4rem;
	}

	/* Narrow on purpose — this page is opened from a phone, from a bio link. */
	.column {
		max-width: 31rem;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: clamp(1.75rem, 5vw, 2.5rem);
	}

	header {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	h1 {
		font-size: clamp(1.6rem, 1.2rem + 2.5vw, 2.15rem);
		letter-spacing: -0.03em;
		line-height: 1.1;
	}

	.blurb {
		color: var(--fg-dim);
		text-wrap: pretty;
	}

	h2 {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		font-size: 0.875em;
		padding-bottom: 0.75rem;
	}

	.count {
		margin-left: auto;
		color: var(--fg-faint);
	}

	ul {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	li a,
	.featured {
		position: relative;
		display: grid;
		border: var(--rule) solid var(--border);
		background: var(--bg-raised);
		color: var(--fg);
		overflow: hidden;
		transition:
			border-color 110ms linear,
			background-color 110ms linear;
	}

	/* The bar that lights up the left edge on hover, terminal-caret style. */
	li a::before,
	.featured::before {
		content: '';
		position: absolute;
		inset: 0 auto 0 0;
		width: 2px;
		background: var(--accent);
		transform: scaleY(0);
		transform-origin: center;
		transition: transform 140ms ease-out;
	}

	li a:hover,
	li a:focus-visible,
	.featured:hover,
	.featured:focus-visible {
		border-color: var(--border-bright);
		background: color-mix(in oklab, var(--bg-raised) 93%, var(--accent));
	}

	li a:hover::before,
	li a:focus-visible::before,
	.featured:hover::before,
	.featured:focus-visible::before {
		transform: scaleY(1);
	}

	li a {
		grid-template-columns: 2.25rem 1fr auto;
		align-items: center;
		gap: 0 0.9rem;
		padding: 0.7rem 0.9rem;
	}

	.mark {
		display: grid;
		place-items: center;
		height: 2.25rem;
		border: var(--rule) solid var(--border);
		color: var(--fg-dim);
		transition:
			color 110ms linear,
			border-color 110ms linear;
	}

	li a:hover .mark,
	li a:focus-visible .mark {
		color: var(--accent);
		border-color: var(--accent-dim);
	}

	.text {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.label {
		line-height: 1.4;
	}

	.detail {
		color: var(--fg-faint);
		font-size: 0.8125em;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.arrow {
		color: var(--fg-faint);
		transition:
			transform 140ms ease-out,
			color 110ms linear;
	}

	li a:hover .arrow,
	li a:focus-visible .arrow,
	.featured:hover .arrow,
	.featured:focus-visible .arrow {
		color: var(--accent);
		transform: translateX(3px);
	}

	.featured {
		grid-template-columns: 1fr auto;
		gap: 0.35rem 1rem;
		padding: 1.1rem 1.15rem 1.2rem;
		border-color: var(--border-bright);
	}

	.featured .tag {
		grid-column: 1;
		color: var(--accent-dim);
		font-size: 0.75em;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.featured .title {
		grid-column: 1;
		font-size: 1.15em;
		font-weight: 700;
		letter-spacing: -0.01em;
	}

	.featured .detail {
		grid-column: 1 / -1;
		color: var(--fg-dim);
		font-size: 0.875em;
		white-space: normal;
		text-wrap: pretty;
	}

	.featured .arrow {
		grid-row: 1 / span 2;
		grid-column: 2;
		align-self: start;
	}

	.stats {
		grid-column: 1 / -1;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1.5rem;
		margin-top: 0.85rem;
		padding-top: 0.85rem;
		border-top: var(--rule) solid var(--border);
		font-size: 0.8125em;
	}

	.stat .value {
		color: var(--accent);
		font-weight: 700;
		margin-right: 0.4em;
	}

	footer {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.35rem 1.5rem;
		padding-top: 1.25rem;
		border-top: var(--rule) solid var(--border);
		font-size: 0.8125em;
	}

	footer a {
		color: var(--fg-dim);
	}

	/* Same one-shot cascade as the home page hero, nothing on scroll. */
	.featured,
	li {
		animation: rise 280ms ease-out backwards;
		animation-delay: calc(var(--step, 0) * 35ms);
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.featured,
		li {
			animation: none;
		}

		li a::before,
		.featured::before,
		.arrow {
			transition: none;
		}
	}
</style>
