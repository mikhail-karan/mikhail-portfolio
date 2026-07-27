<script lang="ts">
	import { experience } from '$lib/content';
</script>

<ol>
	{#each experience as role (role.org)}
		<li>
			<span class="period faint">{role.period}</span>
			<div>
				<h3>
					{#if role.href}
						<a href={role.href} rel="noreferrer">{role.org}</a>
					{:else}
						{role.org}
					{/if}
					<span class="faint">—</span>
					<span class="title dim">{role.title}</span>
				</h3>
				<p>{role.body}</p>
			</div>
		</li>
	{/each}
</ol>

<style>
	ol {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	li {
		display: grid;
		gap: 0.25rem 1.5rem;
	}

	.period {
		font-size: 0.8125em;
		padding-top: 0.2em;
	}

	h3 {
		font-size: 0.9375em;
		font-weight: 400;
		text-wrap: pretty;
	}

	h3 a {
		color: var(--fg);
		font-weight: 700;
	}

	h3 a:hover,
	h3 a:focus-visible {
		color: var(--accent);
	}

	.title {
		font-weight: 400;
	}

	p {
		margin-top: 0.35rem;
		color: var(--fg-dim);
		font-size: 0.9375em;
		text-wrap: pretty;
	}

	@media (min-width: 40rem) {
		li {
			grid-template-columns: 9rem 1fr;
		}
	}
</style>
