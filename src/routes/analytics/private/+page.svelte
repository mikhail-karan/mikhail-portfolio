<script lang="ts">
	import Prompt from '$lib/components/Prompt.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let stats = $derived(data.stats);
</script>

<svelte:head>
	<title>Traffic (private)</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="shell">
	<header>
		<Prompt command="./analytics --private" cursor />
		<h1>Traffic, unsuppressed</h1>
		<p class="faint">
			Last {stats.windowDays} days · {stats.views} views · {stats.visitors} visitors · {stats.botViews}
			bot views · rendered {data.renderedAt}
		</p>
	</header>

	<section>
		<h2>referrers, raw</h2>
		<table class="chart chart--buckets">
			<thead>
				<tr><th scope="col">referrer</th><th scope="col" class="num">views</th></tr>
			</thead>
			<tbody>
				{#each stats.referrers as row (row.label)}
					<tr><th scope="row" class="wrap">{row.label}</th><td class="num">{row.views}</td></tr>
				{:else}
					<tr><td colspan="2" class="faint">Nothing yet.</td></tr>
				{/each}
			</tbody>
		</table>
	</section>

	<section>
		<h2>paths</h2>
		<table class="chart chart--buckets">
			<thead>
				<tr><th scope="col">path</th><th scope="col" class="num">views</th></tr>
			</thead>
			<tbody>
				{#each stats.paths as row (row.label)}
					<tr><th scope="row">{row.label}</th><td class="num">{row.views}</td></tr>
				{:else}
					<tr><td colspan="2" class="faint">Nothing yet.</td></tr>
				{/each}
			</tbody>
		</table>
	</section>

	<section>
		<h2>hourly</h2>
		<table class="chart chart--buckets">
			<thead>
				<tr>
					<th scope="col">hour (UTC)</th>
					<th scope="col" class="num">views</th>
					<th scope="col" class="num">visitors</th>
				</tr>
			</thead>
			<tbody>
				{#each stats.hourly as point (point.hour)}
					<tr>
						<th scope="row">{point.hour}</th>
						<td class="num">{point.views}</td>
						<td class="num">{point.visitors}</td>
					</tr>
				{:else}
					<tr><td colspan="3" class="faint">Nothing yet.</td></tr>
				{/each}
			</tbody>
		</table>
	</section>

	<section>
		<h2>most recent {stats.recent.length}</h2>
		<table class="chart chart--buckets">
			<thead>
				<tr>
					<th scope="col">ts</th>
					<th scope="col">path</th>
					<th scope="col">country</th>
					<th scope="col">device</th>
					<th scope="col">bot</th>
					<th scope="col">visitor</th>
					<th scope="col">referrer</th>
					<th scope="col">ua</th>
				</tr>
			</thead>
			<tbody>
				{#each stats.recent as row (row.ts + row.visitorDay + row.path)}
					<tr>
						<td class="nowrap">{row.ts}</td>
						<td>{row.path}</td>
						<td>{row.country ?? '—'}</td>
						<td>{row.device ?? '—'}</td>
						<td>{row.isBot ? 'yes' : ''}</td>
						<td class="nowrap" title={row.visitorDay}>{row.visitorDay.slice(0, 8)}</td>
						<td class="wrap">{row.referrer ?? '—'}</td>
						<td class="wrap faint">{row.ua ?? '—'}</td>
					</tr>
				{:else}
					<tr><td colspan="8" class="faint">Nothing yet.</td></tr>
				{/each}
			</tbody>
		</table>
	</section>
</main>

<style>
	main {
		max-width: none;
		padding-top: 2rem;
		padding-bottom: 4rem;
	}

	header {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	h1 {
		font-size: 1.5em;
	}

	section {
		padding-top: 2.5rem;
	}

	h2 {
		font-size: 0.9375em;
		padding-bottom: 0.75rem;
		color: var(--fg-dim);
	}

	h2::before {
		content: '// ';
		color: var(--accent);
	}

	/* Base table styling comes from `.chart` in app.css; this tier is denser. */
	:global(.chart) {
		font-size: 0.8125em;
	}

	.nowrap {
		white-space: nowrap;
	}

	.wrap {
		overflow-wrap: anywhere;
		max-width: 40ch;
	}
</style>
