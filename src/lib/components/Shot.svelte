<script lang="ts">
	import { tick } from 'svelte';
	import type { Shot } from '$lib/content';

	let { shot }: { shot: Shot } = $props();

	let viewer = $state<HTMLDialogElement>();
	let open = $state(false);

	/**
	 * The trigger is a plain link to the image file, so it still does something useful with no
	 * JS and with a modifier key held. Everything else opens the viewer instead.
	 */
	async function expand(event: MouseEvent) {
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		event.preventDefault();
		open = true;
		await tick();
		viewer?.showModal();
	}

	/** Clicks land on the dialog itself only when they miss the figure inside it — the backdrop. */
	function dismissBackdrop(event: MouseEvent) {
		if (event.target === viewer) viewer?.close();
	}
</script>

<a
	class="shot"
	href={shot.src}
	aria-label="Expand screenshot: {shot.label}"
	style="--ratio: {shot.width} / {shot.height}"
	onclick={expand}
>
	<span class="bar">
		<span class="label">{shot.label}</span>
		<span class="hint" aria-hidden="true">[ expand ]</span>
	</span>
	<span class="pane">
		<img
			src={shot.src}
			alt={shot.alt}
			width={shot.width}
			height={shot.height}
			loading="lazy"
			decoding="async"
		/>
	</span>
</a>

<dialog bind:this={viewer} onclose={() => (open = false)} onclick={dismissBackdrop}>
	{#if open}
		<figure>
			<div class="bar">
				<span class="label">{shot.label}</span>
				<button type="button" onclick={() => viewer?.close()}>[ esc ]</button>
			</div>
			<img
				src={shot.src}
				alt={shot.alt}
				width={shot.width}
				height={shot.height}
				decoding="async"
			/>
		</figure>
	{/if}
</dialog>

<style>
	/* A window pane, not an illustration: a title bar over a slice of the app. The full frame is
	   a click away. */
	.shot {
		display: block;
		margin-top: 1.15rem;
		max-width: 38rem;
		border: var(--rule) solid var(--border-bright);
		background: var(--bg-raised);
	}

	.bar {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.3rem 0.6rem;
		font-size: 0.75em;
		border-bottom: var(--rule) solid var(--border);
		background: var(--bg);
	}

	.label {
		color: var(--fg-dim);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.label::before {
		content: '// ';
		color: var(--accent);
	}

	.hint {
		color: var(--fg-faint);
		white-space: nowrap;
		transition: color 120ms linear;
	}

	/* The pane takes the screenshot's own ratio, so the resting state is the whole screen at a
	   smaller size rather than a slice of it. The viewer is for reading the detail. */
	.pane {
		display: block;
		overflow: hidden;
		aspect-ratio: var(--ratio);
	}

	.pane img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: saturate(0.75) contrast(0.94);
		transition:
			transform 400ms ease,
			filter 200ms linear;
	}

	.shot:hover,
	.shot:focus-visible {
		border-color: var(--accent-dim);
	}

	.shot:hover .hint,
	.shot:focus-visible .hint {
		color: var(--accent);
	}

	/* Nothing is hidden at rest, so hover leans in rather than revealing: full colour and a
	   nudge closer, inside the frame, without shoving the rest of the page around. */
	.shot:hover .pane img,
	.shot:focus-visible .pane img {
		transform: scale(1.04);
		filter: none;
	}

	/* The viewer escapes the page's reading measure — these are wide, dense product screens and
	   shrinking one to 84ch is what made it worth cropping in the first place. */
	dialog {
		max-width: min(96vw, 1600px);
		max-height: 94vh;
		padding: 0;
		border: var(--rule) solid var(--accent-dim);
		background: var(--bg-raised);
		color: var(--fg);
		font-family: inherit;
	}

	dialog::backdrop {
		background: rgb(0 0 0 / 0.78);
	}

	dialog figure {
		margin: 0;
	}

	dialog .bar {
		font-size: 0.8125em;
		padding: 0.4rem 0.7rem;
	}

	dialog button {
		font: inherit;
		padding: 0;
		color: var(--fg-faint);
		background: none;
		border: 0;
		cursor: pointer;
	}

	dialog button:hover,
	dialog button:focus-visible {
		color: var(--accent);
	}

	dialog img {
		display: block;
		width: auto;
		height: auto;
		max-width: min(96vw, 1600px);
		/* Leave the title bar its room so the image never overflows the dialog. */
		max-height: calc(94vh - 2.4rem);
	}

	@media (prefers-reduced-motion: reduce) {
		.pane img {
			transition-property: filter;
		}

		.shot:hover .pane img,
		.shot:focus-visible .pane img {
			transform: none;
		}
	}

	/* There is nothing to click on paper. */
	@media print {
		.shot {
			max-width: none;
		}

		.pane img {
			transform: none;
			filter: none;
		}

		.hint {
			display: none;
		}
	}
</style>
