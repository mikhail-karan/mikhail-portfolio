<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status} — Mikhail Karan</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="shell error-page">
	<p class="prompt"><span>mikhail@cyfrin</span>:~$ resolve {page.url.pathname}</p>
	<h1>{page.status}</h1>
	<p class="message">{page.status === 404 ? 'That path does not exist.' : page.error?.message}</p>

	<nav aria-label="Recovery links">
		<p>Try one of these:</p>
		<ul>
			<li><a href="/">homepage</a></li>
			<li><a href="/links">all links</a></li>
			<li><a href="/llms.txt">agent navigation</a></li>
			<li><a href="/mcp">MCP endpoint</a></li>
		</ul>
	</nav>
</main>

<style>
	.error-page {
		padding-top: clamp(3.5rem, 12vh, 7rem);
		padding-bottom: 4rem;
	}

	.prompt,
	.message,
	nav p {
		color: var(--fg-dim);
	}

	.prompt span,
	h1 {
		color: var(--accent);
	}

	h1 {
		margin-top: 1rem;
		font-size: clamp(1.85rem, 1.2rem + 4vw, 3rem);
	}

	.message {
		margin-top: 0.5rem;
	}

	nav {
		margin-top: 2rem;
		padding-top: 1.25rem;
		border-top: var(--rule) solid var(--border);
	}

	ul {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem 1.1rem;
		margin-top: 0.5rem;
	}

	li::before {
		content: './';
		color: var(--fg-faint);
	}
</style>
