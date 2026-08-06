<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/styles/app.css';

	let { children } = $props();
</script>

<!-- Per-page tags live in Head.svelte; only what's identical on every page is here. -->
<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="theme-color" content="#0b0f10" media="(prefers-color-scheme: dark)" />
	<meta name="theme-color" content="#f4f6f5" media="(prefers-color-scheme: light)" />
	<meta property="og:type" content="profile" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

{@render children()}
