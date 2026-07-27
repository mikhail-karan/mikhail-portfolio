<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { meta } from '$lib/content';
	import '$lib/styles/app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{meta.title}</title>
	<meta name="description" content={meta.description} />
	<meta name="theme-color" content="#0b0f10" media="(prefers-color-scheme: dark)" />
	<meta name="theme-color" content="#f4f6f5" media="(prefers-color-scheme: light)" />
	<meta property="og:type" content="profile" />
	<meta property="og:title" content={meta.title} />
	<meta property="og:description" content={meta.description} />
	<meta name="twitter:card" content="summary" />
</svelte:head>

<a class="skip-link" href="#highlights">Skip to content</a>

{@render children()}
