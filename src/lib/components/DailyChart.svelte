<script lang="ts">
	/**
	 * Views and visitors per UTC day — the finest granularity this system reports (§9).
	 *
	 * Same construction as BarTable, sharing its `.chart` styling from `app.css`.
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

<table class="chart chart--daily">
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
				<th scope="row" class="day">{point.day}</th>
				<td class="num">{point.views}</td>
				<td class="num faint">{point.visitors}</td>
				<td class="bar" aria-hidden="true">{bar(point.views, max)}</td>
			</tr>
		{/each}
	</tbody>
</table>
