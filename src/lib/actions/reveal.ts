/**
 * Calls back once, the first time the element scrolls into view.
 *
 * Fires immediately when the visitor prefers reduced motion or the browser has
 * no IntersectionObserver, so content is never trapped behind a failed
 * animation. Disconnects after firing — no lingering observers.
 */
export function reveal(node: HTMLElement, onReveal: () => void) {
	if (
		window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
		!('IntersectionObserver' in window)
	) {
		onReveal();
		return;
	}

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				observer.disconnect();
				onReveal();
			}
		},
		{ rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
	);

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		},
	};
}
