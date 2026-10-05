# Catalog of deceptive captures

Every pattern below is **listed with status 200** in the Wayback calendar endpoint, yet the
content is not a real page. This is why every candidate must be opened and read rather than
trusted on its status code. All examples below were genuinely encountered.

## Fast detection

In a `one()` result, watch three signals: **HTML length (`L…`)**, **the title**, and the
**first 160 characters of body text**. Deceptive pages almost always give themselves away
through that combination.

| Length | Almost certainly |
|---|---|
| < 1 KB | parking page, error page, or an empty file |
| 1–3 KB | "coming soon", under construction, hosting placeholder |
| 15–30 KB with no text | an SPA whose content was never archived |

## The patterns

### Error pages listed as status 200

- **429 Too Many Requests (nginx)** — body reads `429 Too Many Requests nginx`, around 564
  bytes. The most common one by far. It was once a domain's **only** capture
  (`melihaalagoz.com` → unfit). It also cut `flydancerhythm.com` down to two usable pages, and
  eliminated one `spatialityblog.com` capture plus two `cruisintikisdeale.com` captures.
- **404 Not Found (LiteSpeed)** — around 1.2 KB, mentions "LiteSpeed Web Server".
  Example: `chestandallergy.com`, 26 Aug 2024.
- **Generic server error** — "Error. Page cannot be displayed. Please contact your service
  provider". Example: `floridianrv.com`, 11 Jul 2025.

### Parking pages and domain-for-sale ads

- **Registrar parking** — "This domain is registered at Namecheap", "Domain Bank",
  "registered to our customer at 123cheapdomains", "Your domain is expired. Renew the domain
  to activate the website".
  Examples: `eshepherd.org` (2011, 2012), `bio-sites.com` (2002),
  `themountainnetwork.com` (2011), `lakshithagroup.com` (12 Jul 2025).
- **For-sale listings** — "This domain is for sale", "Click here to make an offer",
  "Re-visit the page to contact the owner".
  Examples: `themountainnetwork.com` (2016), `cabaneladouceparenthese.com` (7 Jun 2026).
- **Localized parking pages** — e.g. Croatian "domena je parkirana", Turkish "yapım
  aşamasında" from IsimTescil.NET.
  Examples: `restaurantmandrac.com` (2011), `batutemizlik.com` (11 Oct 2013).

### Hosting and control-panel defaults

- **Plesk** — title "Domain Default page", body "This is a default webpage generated for by
  Plesk", **exactly 464 bytes**. This once masked **15 straight months**:
  `enjoy-restaurant.com` from March 2023 through June 2024. Three dates were tested, all
  three empty. If you find one, test several other dates to locate the real era boundary.
- **"Site en construction"** — a French hosting provider's page with a Guides / FAQ / Forum /
  Espace Client menu. All six `bio-sites.com` captures were this → unfit.
- **Index of /** — an empty Apache directory listing, only `cgi-bin/`. Means the site was
  never installed. Example: `cbhomehealthcare.com`, 27 Aug 2024.
- **ISP placeholder** — "This Site is hosted by International Hosting Company" / "Powerful
  hosting - surprisingly easy". All thirteen `playinfo.net` captures were this → unfit.

### Not-yet-built pages

- **Coming soon / WEB EN CONSTRUCCIÓN / BIENTÔT DISPONIBLE** — examples: `santano.net`
  (2003), `soloviaja.com` (2004), `meliterranea.com` (12 Sep 2020, 1.3 KB), `eshepherd.org`
  (Nov 2011).
- **Default WordPress install** — title "Just another WordPress site" with no content.
  Example: `heartytongue.com` across 2018–2019, which means that domain's effective age as a
  real blog starts only in 2022.
- **Bare splash page** — just "Click here to enter". Example: `carmichaelsclub.com` (2026).

### Bot verification

- **"One moment, please… Please wait while your request is being verified"** — Cloudflare or
  similar. Examples: `restaurantmandrac.com` (Dec 2022, May 2024, Sep 2025),
  `udrugaeterico.com` (6 Feb 2026).

### Empty body despite a large file

This is the most deceptive group, because the capture count can be high and the metrics look
excellent.

- **SPA loading shell** — `carmichaelsclub.com` had **39 status-200 captures** spanning
  2023–2026 and looked like the strongest candidate in its batch. Opening the raw HTML: a
  62 KB file that is almost entirely `<script>`, with a `<body>` containing nothing but
  `<div class="loading-view">` and animated dots. Zero text, zero links, zero images → unfit.
  **How to confirm:** count `doc.querySelectorAll('a').length`, `img.length`, `div.length`,
  and `body.textContent.length`. If links and images are zero, the content was never archived.
  `scripts/harness.js` exposes this as `shell()`.
- **Empty "React App" shell** — example: `bjlaptophub.com`, Jan 2025.
- **Title present, body empty** — `poemhome.net`'s last capture reads only "Loading…".
- **Empty files** — `farmerafoods.com`'s two captures were 263 and 2,570 bytes with no text
  at all → unfit.

### JavaScript-rendered content (not deceptive, but recognize it)

Wix and similar platforms embed content inside JSON/JS, so `body.textContent` after stripping
scripts can look like code. This is **not** grounds for rejection — the content is there and
renders in Wayback's replay. To confirm: remove `script,style,noscript` from the document and
read `textContent`; if menus and page copy appear ("top of page", menu names, descriptions),
the content is intact.

Examples that all turned out fine: `kidiwinkkidz.com`,
`lessolutionsaunatureldaurore.com`, `shannonvistahoa.com`, `elfpilates.com`,
`kolektiv22.com`.

### Business-closure announcements

Not a broken page, but don't use it as a snapshot: `kolektiv22.com`'s Jul 2026 capture is a
notice that the coffee roastery has shut down, not a normal shop page.

## The calendar trap

The Wayback calendar shows years that have **any** capture, not years with status-200
captures. The gap is often large and should always be reported to the user:

| Domain | Calendar shows | Actual status 200 |
|---|---|---|
| `coctelybebida.com` | 2009–2025 | only 2, both in 2009 |
| `plexi-sur-mesure-paris.com` | 2014–2025 | 14, all in 2014 |
| `polveredifata.com` | 2010–2025 | 1 |
| `otstypki.com` | 2007–2025 | stops Nov 2016 |
| `wildly-fit.com` | 2012–2025 | stops Dec 2022 |
| `helcrea.com` | 2018–2026 | stops Dec 2019 |
| `truejute.com` | 2020–2026 | 4, all in 2020 |
| `moscanegrasunglasses.com` | 2014–2024 | stops Dec 2021 |
| `lagastore.com` | 2017–2026 | starts Feb 2024 |
| `car-use.org` | 2020–2026 | **zero** → unfit |
