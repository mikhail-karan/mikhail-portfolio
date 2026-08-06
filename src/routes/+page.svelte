<script lang="ts">
	import Contact from '$lib/components/Contact.svelte';
	import Experience from '$lib/components/Experience.svelte';
	import Head from '$lib/components/Head.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import Highlights from '$lib/components/Highlights.svelte';
	import Podcast from '$lib/components/Podcast.svelte';
	import Practice from '$lib/components/Practice.svelte';
	import Projects from '$lib/components/Projects.svelte';
	import Section from '$lib/components/Section.svelte';
	import Stack from '$lib/components/Stack.svelte';
	import { identity, meta } from '$lib/content';
</script>

<Head page={meta} />

<a class="skip-link" href="#highlights">Skip to content</a>

<main class="shell">
	<Hero />

	<Section id="highlights" command="cat highlights.md" heading="The short version">
		<Highlights />
	</Section>

	<Section id="work" command="ls -l ~/work" heading="What I've built">
		<Projects />
	</Section>

	<Section id="leading" command="cat leading.md" heading="Leading, and the unglamorous parts">
		<Practice />
	</Section>

	<Section id="stack" command="tree ~/stack" heading="What I work with">
		<Stack />
	</Section>

	<Section id="experience" command="cat experience.log" heading="Where I've been">
		<Experience />
	</Section>

	<Section id="podcast" command="./podcast --stats" heading="HTML All The Things">
		<Podcast />
	</Section>

	<Section id="contact" command="cat contact.env" heading="Get in touch">
		<Contact />
	</Section>

	<footer>
		<p class="faint">
			{identity.name} · {identity.location} · <a href="/links">all my links</a> · built with SvelteKit
		</p>
	</footer>
</main>

<style>
	main {
		padding-bottom: 4rem;
	}

	footer {
		margin-top: clamp(3.5rem, 9vw, 6rem);
		padding-top: 1.25rem;
		border-top: var(--rule) solid var(--border);
		font-size: 0.8125em;
	}
</style>
