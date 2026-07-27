<script lang="ts">
	import { stack } from '$lib/content';
</script>

<dl>
	{#each stack as group (group.label)}
		<div class="row">
			<dt>{group.label}/</dt>
			<dd>
				{#each group.items as item (item)}
					<span>{item}</span>
				{/each}
			</dd>
		</div>
	{/each}
</dl>

<style>
	dl {
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
		font-size: 0.9375em;
	}

	.row {
		display: grid;
		gap: 0 1rem;
	}

	dt {
		color: var(--accent);
	}

	/* Each item is its own flex item so long lists wrap instead of overflowing. */
	dd {
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		column-gap: 0.5rem;
		color: var(--fg-dim);
	}

	dd span:not(:last-child)::after {
		content: ' ·';
		color: var(--fg-faint);
	}

	@media (min-width: 34rem) {
		.row {
			grid-template-columns: 8rem 1fr;
		}
	}
</style>
