<script lang="ts">
	import { podcast } from '$lib/content';
</script>

<div class="wrap">
	<p class="blurb">{podcast.blurb}</p>

	<ul class="stats">
		{#each podcast.stats as stat (stat.label)}
			<li>
				<span class="value">{stat.value}</span>
				<span class="label faint">{stat.label}</span>
			</li>
		{/each}
	</ul>

	<ul class="links">
		{#each podcast.links as link (link.href)}
			<li><a href={link.href} rel="noreferrer">{link.label}</a></li>
		{/each}
	</ul>
</div>

<style>
	.wrap {
		border: var(--rule) solid var(--border);
		background: var(--bg-raised);
		padding: 1.35rem 1.4rem;
	}

	.blurb {
		color: var(--fg-dim);
		max-width: 66ch;
		text-wrap: pretty;
	}

	.stats {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem 2.5rem;
		margin-top: 1.35rem;
		padding-top: 1.25rem;
		border-top: var(--rule) solid var(--border);
	}

	.stats li {
		min-width: 7rem;
	}

	.value {
		display: block;
		color: var(--accent);
		font-size: 1.35em;
		font-weight: 700;
		line-height: 1.2;
	}

	.label {
		font-size: 0.8125em;
	}

	.links {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem 1.1rem;
		margin-top: 1.25rem;
		font-size: 0.875em;
	}
</style>
