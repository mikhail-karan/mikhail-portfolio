<script lang="ts">
	import { identity } from '$lib/content';

	type Props = {
		command: string;
		cursor?: boolean;
	};

	let { command, cursor = false }: Props = $props();
</script>

<span class="prompt">
	<span class="who">{identity.handle}@{identity.host}</span><span class="sep">:</span><span
		class="path">~</span
	><span class="sigil">$</span>
	<span class="command">{command}</span>{#if cursor}<span class="cursor" aria-hidden="true"></span
		>{/if}
</span>

<style>
	.prompt {
		font-size: 0.875em;
		white-space: nowrap;
	}

	.who {
		color: var(--accent-dim);
	}

	.sep,
	.path {
		color: var(--fg-faint);
	}

	.sigil {
		color: var(--accent);
		margin-left: 0.15em;
	}

	.command {
		color: var(--fg-dim);
	}

	.cursor {
		display: inline-block;
		width: 0.55em;
		height: 1em;
		margin-left: 0.15em;
		background: var(--accent);
		vertical-align: text-bottom;
		animation: blink 1.1s steps(1, end) infinite;
	}

	@keyframes blink {
		0%,
		50% {
			opacity: 1;
		}
		50.01%,
		100% {
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.cursor {
			animation: none;
		}
	}
</style>
