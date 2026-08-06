<script lang="ts">
	import BarTable from '$lib/components/BarTable.svelte';
	import DailyChart from '$lib/components/DailyChart.svelte';
	import Head from '$lib/components/Head.svelte';
	import Prompt from '$lib/components/Prompt.svelte';
	import { analytics } from '$lib/content';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let stats = $derived(data.stats);
</script>

<Head page={analytics.meta} />

<a class="skip-link" href="#numbers">Skip to the numbers</a>

<main class="shell">
	<header>
		<Prompt command="./analytics --public" cursor />
		<h1>Traffic</h1>
		<p class="blurb">{analytics.blurb}</p>
	</header>

	<section id="numbers" aria-labelledby="numbers-heading">
		<h2 id="numbers-heading">
			<span class="accent">last {stats.windowDays} days</span>
			<span class="faint">rendered {data.renderedAt}</span>
		</h2>

		<ul class="totals">
			<li>
				<span class="value">{stats.views}</span>
				<span class="faint">views</span>
			</li>
			<li>
				<span class="value">{stats.visitors}</span>
				<span class="faint">visitors</span>
			</li>
			<li>
				<span class="value">{stats.botViews}</span>
				<span class="faint">bot views</span>
			</li>
			<li>
				<span class="value">{stats.since ?? '—'}</span>
				<span class="faint">counting since</span>
			</li>
		</ul>

		<p class="note faint">
			A visitor is one identifier on one day. Two days of the same person count as two, which is
			why there is no returning-visitor number below.
		</p>
	</section>

	<section aria-label="Charts">
		<div class="charts">
			<DailyChart caption="views and visitors per day, UTC" points={stats.daily} />
			<BarTable caption="pages" labelHead="path" rows={stats.paths} />
			<BarTable caption="where visits came from" labelHead="source" rows={stats.sources} />
			<BarTable caption="countries" labelHead="country" rows={stats.countries} />
			<BarTable caption="devices" labelHead="device" rows={stats.devices} />
		</div>
	</section>

	<section aria-labelledby="method-heading">
		<h2 id="method-heading"><span class="accent">how it works</span></h2>

		<dl class="method">
			{#each analytics.method as item (item.title)}
				<div>
					<dt>{item.title}</dt>
					<dd>{item.body}</dd>
				</div>
			{/each}
		</dl>
	</section>

	<section aria-labelledby="limits-heading">
		<h2 id="limits-heading"><span class="accent">what these numbers are not</span></h2>

		<ul class="limits">
			{#each analytics.limits as limit (limit)}
				<li>{limit}</li>
			{/each}
		</ul>
	</section>

	<footer>
		<p class="faint">
			<a href="/">portfolio</a> · <a href="/links">all my links</a> · rendered {data.renderedAt}
		</p>
	</footer>
</main>

<style>
	main {
		padding-top: clamp(2.5rem, 8vw, 4.5rem);
		padding-bottom: 4rem;
	}

	header {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	h1 {
		font-size: 1.75em;
		letter-spacing: -0.02em;
	}

	.blurb {
		color: var(--fg-dim);
		max-width: 62ch;
	}

	section {
		padding-top: clamp(2.25rem, 6vw, 3.5rem);
	}

	h2 {
		display: flex;
		flex-wrap: wrap;
		gap: 0 1rem;
		align-items: baseline;
		font-size: 1em;
		padding-bottom: 1rem;
		border-bottom: var(--rule) solid var(--border);
	}

	h2 .faint {
		font-weight: 400;
		font-size: 0.8125em;
	}

	.totals {
		display: flex;
		flex-wrap: wrap;
		gap: 1.25rem 2.5rem;
		padding-top: 1.25rem;
	}

	.totals li {
		display: flex;
		flex-direction: column;
	}

	.value {
		font-size: 1.5em;
		font-variant-numeric: tabular-nums;
		color: var(--accent);
	}

	.totals .faint {
		font-size: 0.8125em;
	}

	.note {
		padding-top: 1.25rem;
		font-size: 0.875em;
		max-width: 62ch;
	}

	.charts {
		display: flex;
		flex-direction: column;
		gap: clamp(2rem, 5vw, 3rem);
	}

	.method {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		padding-top: 1.25rem;
		margin: 0;
	}

	dt {
		color: var(--fg);
		font-weight: 700;
		font-size: 0.9375em;
	}

	dd {
		margin: 0.25rem 0 0;
		color: var(--fg-dim);
		font-size: 0.9375em;
		max-width: 68ch;
	}

	.limits {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding-top: 1.25rem;
		color: var(--fg-dim);
		font-size: 0.9375em;
		max-width: 68ch;
	}

	.limits li::before {
		content: '- ';
		color: var(--fg-faint);
	}

	footer {
		margin-top: clamp(3rem, 8vw, 5rem);
		padding-top: 1.25rem;
		border-top: var(--rule) solid var(--border);
		font-size: 0.8125em;
	}
</style>
