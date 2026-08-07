/** `2026-08-06 19:20 UTC`. Timestamps are formatted on the server — no JavaScript runs here. */
export function utcStamp(date: Date): string {
	return `${date.toISOString().slice(0, 16).replace('T', ' ')} UTC`;
}
