<script lang="ts">
	import Shot from '$lib/components/Shot.svelte';
	import { sideProjects } from '$lib/content';
</script>

<ul class="list">
	{#each sideProjects as project (project.name)}
		<li>
			<div class="head">
				<h3>
					{#if project.href}
						<a href={project.href} rel="noreferrer">{project.name}</a>
					{:else}
						{project.name}
					{/if}
				</h3>
				<span class="status">[{project.status}]</span>
			</div>

			<p class="summary">{project.summary}</p>
			<p class="note">{project.note}</p>

			{#if project.shot}
				<Shot shot={project.shot} />
			{/if}

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
		gap: 1rem;
	}

	/* Boxed rather than the left-ruled list the work section uses — these are a different kind of
	   thing and shouldn't read as more of the same. */
	.list > li {
		padding: 1.1rem 1.25rem;
		border: var(--rule) solid var(--border);
		background: var(--bg-raised);
	}

	.head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.25rem 0.75rem;
	}

	h3 {
		font-size: 1.0625em;
	}

	h3::before {
		content: '~/';
		color: var(--accent);
	}

	h3 a {
		color: var(--fg);
	}

	h3 a:hover,
	h3 a:focus-visible {
		color: var(--accent);
	}

	.status {
		color: var(--accent-dim);
		font-size: 0.75em;
	}

	.summary {
		margin-top: 0.6rem;
		color: var(--fg-dim);
		text-wrap: pretty;
	}

	/* --fg-dim, not --fg-faint: this is a paragraph of body text, and faint doesn't clear 4.5:1
	   against the raised background in either theme. */
	.note {
		margin-top: 0.6rem;
		color: var(--fg-dim);
		font-size: 0.9375em;
		text-wrap: pretty;
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
		background: var(--bg);
	}
</style>
