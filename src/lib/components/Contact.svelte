<script lang="ts">
	import { contact } from '$lib/content';
</script>

<ul>
	{#each contact as row (row.label)}
		<li>
			<span class="key">{row.label}</span>
			<a href={row.href} rel="me noreferrer">{row.value}</a>
		</li>
	{/each}
</ul>

<style>
	ul {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		font-size: 0.9375em;
	}

	li {
		display: grid;
		grid-template-columns: 6.5rem 1fr;
		gap: 0 1rem;
	}

	.key {
		color: var(--accent);
	}

	.key::after {
		content: '=';
		color: var(--fg-faint);
		margin-left: 0.5em;
	}
</style>
