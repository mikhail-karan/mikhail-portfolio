<script lang="ts">
	/**
	 * A dimension bucket chart made of characters.
	 *
	 * Marked up as a table because that is what it is — a screen reader gets labelled rows and
	 * real numbers, and the bars are decoration on top. Shared table styling lives in
	 * `app.css` under `.chart`; only what is specific to this chart is below.
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
	<table class="chart chart--buckets">
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
					<th scope="row" class="label">{row.label}</th>
					<td class="num">{row.views}</td>
					<td class="num faint">{share(row.views, total)}</td>
					<td class="bar" aria-hidden="true">{bar(row.views, max)}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}

<style>
	.empty {
		font-size: 0.875em;
	}
</style>
