<script lang="ts">
	import type { Snippet } from 'svelte';
	import Prompt from '$lib/components/Prompt.svelte';
	import { reveal } from '$lib/actions/reveal';

	type Props = {
		id: string;
		command: string;
		heading: string;
		children: Snippet;
	};

	let { id, command, heading, children }: Props = $props();

	let revealed = $state(false);
</script>

<section {id} class:revealed use:reveal={() => (revealed = true)}>
	<header>
		<Prompt {command} />
		<h2>{heading}</h2>
	</header>
	{@render children()}
</section>

<style>
	section {
		padding: clamp(3rem, 8vw, 5.5rem) 0 0;
	}

	:global(html.js) section {
		opacity: 0;
		transform: translateY(10px);
		transition: opacity 260ms ease-out, transform 260ms ease-out;
	}

	:global(html.js) section.revealed {
		opacity: 1;
		transform: none;
	}

	/* Never let a scroll reveal swallow content on paper. */
	@media print {
		:global(html.js) section {
			opacity: 1;
			transform: none;
		}
	}

	header {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		padding-bottom: 1.75rem;
	}

	h2 {
		font-size: 1.25em;
		letter-spacing: -0.01em;
	}

	h2::before {
		content: '# ';
		color: var(--accent);
	}
</style>
