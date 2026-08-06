<script lang="ts">
	/**
	 * A bar chart made of characters.
	 *
	 * Marked up as a table because that is what it is — a screen reader gets labelled rows and
	 * real numbers, and the bars are decoration on top. Widths are in `ch`, so the columns line
	 * up in the monospace stack the rest of the site already uses, and it prints as it renders.
	 */

	type Row = { label: string; views: number };

	type Props = {
		caption: string;
		labelHead: string;
		rows: readonly Row[];
		empty?: string;
	};

	let { caption, labelHead, rows, empty = 'No data yet.' }: Props = $props();

	const BAR_WIDTH = 20;

	let total = $derived(rows.reduce((sum, row) => sum + row.views, 0));
	let max = $derived(Math.max(1, ...rows.map((row) => row.views)));

	/** At least one block for anything non-zero, so a small bucket is visible rather than blank. */
	const bar = (views: number, peak: number) =>
		'█'.repeat(views === 0 ? 0 : Math.max(1, Math.round((views / peak) * BAR_WIDTH)));

	const share = (views: number, sum: number) =>
		sum === 0 ? '0.0%' : `${((views / sum) * 100).toFixed(1)}%`;
</script>

{#if rows.length === 0}
	<p class="faint empty">{empty}</p>
{:else}
	<table>
		<caption>{caption}</caption>
		<thead>
			<tr>
				<th scope="col">{labelHead}</th>
				<th scope="col" class="num">views</th>
				<th scope="col" class="num">share</th>
				<th scope="col"><span class="sr">distribution</span></th>
			</tr>
		</thead>
		<tbody>
			{#each rows as row (row.label)}
				<tr>
					<th scope="row">{row.label}</th>
					<td class="num">{row.views}</td>
					<td class="num faint">{share(row.views, total)}</td>
					<td class="bar" aria-hidden="true">{bar(row.views, max)}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}

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
		padding: 0.15rem 0.75rem 0.15rem 0;
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
		max-width: 28ch;
		overflow-wrap: anywhere;
	}

	.num {
		text-align: right;
		width: 7ch;
		font-variant-numeric: tabular-nums;
	}

	.bar {
		color: var(--accent-dim);
		width: 20ch;
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

	.empty {
		font-size: 0.875em;
	}

	@media print {
		.bar {
			color: #000;
		}
	}
</style>
