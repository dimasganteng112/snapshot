# Output format

## Step order

1. Create a task list (audit → build report → verify & deliver).
2. Open a tab to `https://web.archive.org/robots.txt` and inject `scripts/harness.js`.
3. Run `runset` on sets of 5 domains, polling with `Bash sleep`.
4. Verify every keyword hit with `ctx()`, and every suspicious candidate with `shell()`.
5. Build the HTML using the `scripts/build_report.py` pattern; validate its JS with `node`.
6. Publish as an artifact.
7. Reply with a prose summary plus one copy-paste-ready text block.

## The chat summary

Two to four short paragraphs, in this order:

1. One line of results: "Batch NN: X clean, Y caution, Z unfit", plus a phrase that captures
   the character of this batch.
2. The most important finding, explained along with **how you confirmed it**. This is the part
   the user values most — not "there's a red flag" but "I opened the raw HTML and found this".
3. Anything needing a decision from the user, stated as a recommendation with its reasoning.
4. Any pattern or operational note worth raising.

Don't restate the text block. Don't paste the artifact URL unless asked. Don't use bullets
here — write it flowing.

## The copy-paste text block

One code block, fixed structure:

```
SNAPSHOT SELECTION [ROMAN] — Batch NN (date)
Result: X clean · Y caution · Z unfit

=== CLEAN ===

1. domain-name.com — CLEAN
   Niche: business description, location, page contents
   Archive: first YYYY · last YYYY · N status-200 captures
   Snapshots:
   - 10 Jan 2018 : https://web.archive.org/web/20180110071117/http://domain-name.com/
   - 14 Feb 2022 : https://web.archive.org/web/20220214195727/http://domain-name.com/
   Notes: which era to use, DATES TO AVOID and what they contain, typos or leftover template
   text needing cleanup, and the result of any keyword verification.

=== CAUTION ===
...

=== UNFIT ===

N. domain-name.com — UNFIT
   Niche: ...
   Archive: ...
   Snapshots: NONE usable
   Notes: why it was rejected, with the evidence.

=== METHODOLOGY ===
- Capture history from the Wayback calendar endpoints __wb/sparkline & calendarcaptures.
- Only status-200 captures considered — AND every candidate still opened and read.
- Every red-flag keyword had its raw HTML context checked — state the outcome.
- Visual rendering NOT checked via screenshot; verdicts from titles + raw page text.
- Broken styling / missing images are not grounds for rejection, per your rule — what counts
  is whether the content is relevant to the domain name.
```

Conventions applied consistently:

- Snapshot URLs always use the full form
  `https://web.archive.org/web/{timestamp}/http://{domain}/` — without `id_`, so the user sees
  the normal replay with its toolbar.
- Mark the most notable finding with `★` on its heading line.
- Write "MUST AVOID" and "AVOID" in capitals so they can't be missed.
- Order: CLEAN first (best at the top), then CAUTION, then UNFIT.
- If the output language is Indonesian, the labels become BERSIH / HATI-HATI / TIDAK LAYAK,
  dates use short Indonesian months (Jan, Feb, Mar, Apr, Mei, Jun, Jul, Agu, Sep, Okt, Nov,
  Des), and the headers become `=== BERSIH ===` and so on. Keep technical terms in English.

## Artifact card structure

Each `DATA` item contains:

| Field | Contents |
|---|---|
| `domain` | the domain name |
| `niche` | business description and page contents |
| `state` | `ok` / `warn` / `bad` |
| `badge` | the display label, derived automatically from `state` |
| `meta` | archive summary: first/last capture and status-200 count |
| `snaps` | list of `[year, display date, original url, wayback timestamp]`; empty for `bad` |
| `note` | the judgment, dates to avoid, restoration notes |

`stateClass` maps `ok` to an empty class, `warn` to `state-warn`, `bad` to `state-bad`. Cards
render each date as a link to `https://web.archive.org/web/${ts}/${orig}`, opening in a new tab.

## Roman numerals

Batches are numbered sequentially and the artifact title uses Roman numerals. Reference points
already used: batch 40 = XL, 41 = XLI, 42 = XLII, 43 = XLIII, 44 = XLIV, 45 = XLV, 49 = XLIX,
50 = L. If continuing on a new account without knowing the last number, ask the user once, or
start from the number they give.

## If the pipeline fails mid-run

Don't publish a half-finished report. Report the state honestly in a single block: which
domains were collected and what was found, which were never reached, and which findings remain
unverified — call out explicitly any keyword hit whose context wasn't checked, since that is the
one thing that must never be guessed. Ask the user to reload the extension, then resume from
that point; data in `window.name` usually survives, so a full rescan isn't needed.
