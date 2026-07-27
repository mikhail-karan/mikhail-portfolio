<script lang="ts">
	import Prompt from '$lib/components/Prompt.svelte';
	import { identity } from '$lib/content';
</script>

<header class="hero">
	<Prompt command="whoami" cursor />

	<h1 style="--step: 1">{identity.name}</h1>

	<p class="role" style="--step: 2">
		{identity.role} <span class="faint">at</span>
		<a href="https://www.cyfrin.io">{identity.company}</a>
		<span class="faint">·</span> {identity.location}
	</p>

	<p class="role" style="--step: 3">
		{identity.sideRole.title} <span class="faint">of</span>
		<a href={identity.sideRole.href} rel="noreferrer">{identity.sideRole.show}</a>
		<span class="faint">·</span> {identity.sideRole.note}
	</p>

	<div class="intro">
		{#each identity.intro as line, i (line)}
			<p style="--step: {4 + i}">
				<span class="bullet" aria-hidden="true">&gt;</span>
				{line}
			</p>
		{/each}
	</div>

	<nav aria-label="Sections" style="--step: {4 + identity.intro.length}">
		<a href="#highlights">highlights</a>
		<a href="#work">work</a>
		<a href="#leading">leading</a>
		<a href="#stack">stack</a>
		<a href="#podcast">podcast</a>
		<a href="#contact">contact</a>
	</nav>
</header>

<style>
	.hero {
		padding: clamp(3.5rem, 12vh, 7rem) 0 0;
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	h1 {
		font-size: clamp(1.85rem, 1.2rem + 4vw, 3rem);
		letter-spacing: -0.03em;
		line-height: 1.1;
	}

	.role {
		color: var(--fg-dim);
	}

	.intro {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		margin-top: 0.75rem;
		max-width: 62ch;
	}

	.intro p {
		display: grid;
		grid-template-columns: 1.4em 1fr;
		text-wrap: pretty;
	}

	.bullet {
		color: var(--accent);
	}

	nav {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem 1.1rem;
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: var(--rule) solid var(--border);
		font-size: 0.875em;
	}

	nav a {
		color: var(--fg-dim);
	}

	nav a::before {
		content: './';
		color: var(--fg-faint);
	}

	nav a:hover,
	nav a:focus-visible {
		color: var(--accent);
	}

	/* One fast staggered entrance, then never again. */
	h1,
	.role,
	.intro p,
	nav {
		animation: rise 300ms ease-out backwards;
		animation-delay: calc(var(--step) * 55ms);
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		h1,
		.role,
		.intro p,
		nav {
			animation: none;
		}
	}
</style>
