<script lang="ts">
	import { site, type PageMeta } from '$lib/content';

	type Props = {
		page: PageMeta;
	};

	let { page }: Props = $props();

	let url = $derived(`${site.url}${page.path}`);
	let image = $derived(`${site.url}${page.image}`);
</script>

<svelte:head>
	<title>{page.title}</title>
	<meta name="description" content={page.description} />
	<link rel="canonical" href={url} />
	<meta property="og:url" content={url} />
	<meta property="og:title" content={page.title} />
	<meta property="og:description" content={page.description} />
	<meta property="og:image" content={image} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={page.imageAlt} />
</svelte:head>
