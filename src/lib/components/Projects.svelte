<script lang="ts">
	import { projects } from '$lib/content';
</script>

<ul class="list">
	{#each projects as project (project.name)}
		<li>
			<div class="head">
				<h3>
					{#if project.href}
						<a href={project.href} rel="noreferrer">{project.name}</a>
					{:else}
						{project.name}
					{/if}
				</h3>
				<span class="period faint">{project.period}</span>
			</div>

			<p class="role">{project.role}</p>
			<p class="summary">{project.summary}</p>

			<ul class="details">
				{#each project.details as detail (detail)}
					<li><span class="marker" aria-hidden="true">–</span>{detail}</li>
				{/each}
			</ul>

			<ul class="tags">
				{#each project.stack as tag (tag)}
					<li>{tag}</li>
				{/each}
			</ul>
		</li>
	{/each}
</ul>

<style>
	.list {
		display: flex;
		flex-direction: column;
		gap: 2.25rem;
	}

	.list > li {
		padding-left: 1.1rem;
		border-left: 2px solid var(--border-bright);
	}

	.head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.25rem 0.9rem;
	}

	h3 {
		font-size: 1.0625em;
	}

	h3::before {
		content: '▸ ';
		color: var(--accent);
	}

	h3 a {
		color: var(--fg);
	}

	h3 a:hover,
	h3 a:focus-visible {
		color: var(--accent);
	}

	.period {
		font-size: 0.8125em;
	}

	.role {
		color: var(--accent-dim);
		font-size: 0.8125em;
		text-transform: lowercase;
	}

	.summary {
		margin-top: 0.6rem;
		color: var(--fg-dim);
		text-wrap: pretty;
	}

	.details {
		margin-top: 0.85rem;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		font-size: 0.9375em;
	}

	.details li {
		display: grid;
		grid-template-columns: 1.3em 1fr;
		color: var(--fg-dim);
		text-wrap: pretty;
	}

	.marker {
		color: var(--fg-faint);
	}

	.tags {
		margin-top: 1rem;
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}

	.tags li {
		font-size: 0.75em;
		padding: 0.1rem 0.45rem;
		color: var(--fg-faint);
		border: var(--rule) solid var(--border);
		background: var(--bg-raised);
	}
</style>
