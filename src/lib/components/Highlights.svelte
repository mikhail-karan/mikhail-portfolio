<script lang="ts">
	import { highlights } from '$lib/content';
</script>

<ul class="grid">
	{#each highlights as item, i (item.title)}
		<li>
			<span class="index" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
			<h3>{item.title}</h3>
			<p>{item.body}</p>
		</li>
	{/each}
</ul>

<style>
	.grid {
		display: grid;
		gap: var(--rule);
		background: var(--border);
		border: var(--rule) solid var(--border);
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
	}

	li {
		background: var(--bg-raised);
		padding: 1.25rem 1.35rem 1.4rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.index {
		color: var(--accent-dim);
		font-size: 0.8em;
	}

	h3 {
		font-size: 1em;
		text-wrap: balance;
	}

	p {
		color: var(--fg-dim);
		font-size: 0.9375em;
		text-wrap: pretty;
	}
</style>
