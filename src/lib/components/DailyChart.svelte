<script lang="ts">
	/**
	 * Views and visitors per UTC day — the finest granularity this system reports (§9).
	 *
	 * Same construction as BarTable: a real table, character bars, `ch` widths.
	 */

	type Point = { day: string; views: number; visitors: number };

	type Props = {
		caption: string;
		points: readonly Point[];
	};

	let { caption, points }: Props = $props();

	const BAR_WIDTH = 24;

	let max = $derived(Math.max(1, ...points.map((point) => point.views)));

	const bar = (views: number, peak: number) =>
		'█'.repeat(views === 0 ? 0 : Math.max(1, Math.round((views / peak) * BAR_WIDTH)));
</script>

<table>
	<caption>{caption}</caption>
	<thead>
		<tr>
			<th scope="col">day</th>
			<th scope="col" class="num">views</th>
			<th scope="col" class="num">visitors</th>
			<th scope="col"><span class="sr">distribution</span></th>
		</tr>
	</thead>
	<tbody>
		{#each points as point (point.day)}
			<tr class:quiet={point.views === 0}>
				<th scope="row">{point.day}</th>
				<td class="num">{point.views}</td>
				<td class="num faint">{point.visitors}</td>
				<td class="bar" aria-hidden="true">{bar(point.views, max)}</td>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875em;
		text-align: left;
	}

	caption {
		text-align: left;
		padding-bottom: 0.5rem;
		color: var(--fg-dim);
	}

	caption::before {
		content: '// ';
		color: var(--accent);
	}

	th,
	td {
		padding: 0.1rem 0.75rem 0.1rem 0;
		font-weight: 400;
		vertical-align: baseline;
	}

	thead th {
		color: var(--fg-faint);
		border-bottom: var(--rule) solid var(--border);
		padding-bottom: 0.35rem;
	}

	tbody th {
		color: var(--fg);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	.quiet th,
	.quiet td {
		color: var(--fg-faint);
	}

	.num {
		text-align: right;
		width: 8ch;
		font-variant-numeric: tabular-nums;
	}

	.bar {
		color: var(--accent-dim);
		width: 24ch;
		white-space: pre;
		letter-spacing: -0.05em;
	}

	.sr {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}

	@media print {
		.bar {
			color: #000;
		}
	}
</style>
