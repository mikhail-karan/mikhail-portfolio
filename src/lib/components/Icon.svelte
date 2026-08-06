<script lang="ts">
	import { icons, type IconName } from '$lib/icons';

	type Props = {
		name: IconName;
	};

	let { name }: Props = $props();

	let icon = $derived(icons[name]);
</script>

{#if icon.kind === 'path'}
	<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
		<path d={icon.d} fill="currentColor" />
	</svg>
{:else}
	<span class="glyph" aria-hidden="true">{icon.char}</span>
{/if}

<style>
	svg {
		display: block;
		width: 1.0625rem;
		height: 1.0625rem;
	}

	.glyph {
		font-size: 0.875rem;
		font-weight: 700;
		letter-spacing: -0.04em;
		line-height: 1;
	}
</style>
