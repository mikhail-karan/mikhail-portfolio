<script lang="ts">
	import { practice } from '$lib/content';
</script>

<ul class="list">
	{#each practice as item (item.title)}
		<li>
			<h3>{item.title}</h3>
			<p>{item.body}</p>
		</li>
	{/each}
</ul>

<style>
	.list {
		display: flex;
		flex-direction: column;
	}

	li {
		padding: 1.15rem 0;
		border-top: var(--rule) solid var(--border);
		display: grid;
		gap: 0.4rem 1.5rem;
	}

	li:last-child {
		border-bottom: var(--rule) solid var(--border);
	}

	h3 {
		font-size: 0.9375em;
		color: var(--fg);
		text-wrap: balance;
	}

	h3::before {
		content: '$ ';
		color: var(--accent);
	}

	p {
		color: var(--fg-dim);
		font-size: 0.9375em;
		text-wrap: pretty;
	}

	@media (min-width: 46rem) {
		li {
			grid-template-columns: 13rem 1fr;
		}
	}
</style>
