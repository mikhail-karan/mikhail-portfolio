# og/

Sources for the social preview images. Each file is a 1200×630 page styled with the
site's own tokens (`og.css` mirrors the dark half of `src/lib/styles/app.css`), so a
screenshot of it is the card.

| source       | output                 | used by  |
| ------------ | ---------------------- | -------- |
| `home.html`  | `static/og.png`        | `/`      |
| `links.html` | `static/og-links.png`  | `/links` |

Render after editing — no repo dependency, Playwright is fetched on demand:

```sh
npx playwright@1.56.0 screenshot --browser=chromium --viewport-size=1200,630 \
  "file://$PWD/og/home.html" static/og.png
npx playwright@1.56.0 screenshot --browser=chromium --viewport-size=1200,630 \
  "file://$PWD/og/links.html" static/og-links.png
```

The text is hand-maintained, not read from `content.ts` — these are images, and copy
that has to fit a fixed box is better edited by eye. The brand paths in `links.html`
are copied from `src/lib/icons.ts`; if an icon changes there, update it here too.

Cards render with the system monospace font of whatever machine takes the
screenshot, matching the site's no-web-font approach.
