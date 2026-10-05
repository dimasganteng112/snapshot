---
name: wayback-snapshot-audit
description: Audit a batch of expired domains against the Wayback Machine and select up to 3 best snapshots per domain for restoration or resale. Use whenever the user pastes a bare list of domain names with no commentary, or asks for snapshot selection, archive auditing, red-flag checks, or a "Snapshot Selection" report. Includes a verified catalog of deceptive captures and keyword false positives.
---

# Expired Domain Snapshot Audit & Selection

A recurring workflow: the user pastes a list of 7–13 domain names **with no commentary at
all**. That by itself is the complete request. Do not ask clarifying questions — run the
pipeline.

## Deliverables

Every batch produces **two** things. Both are required:

1. **An interactive HTML artifact** titled `Snapshot Selection [Roman numeral]` — numbered
   sequentially from the last batch. Template and builder live in `assets/` and
   `scripts/build_report.py`.
2. **A prose summary in chat**, followed by **one copy-paste-ready text block** listing every
   domain, its verdict, snapshot URLs, and notes. The user specifically wants a format they
   can copy directly — that block is part of the deliverable, not a nice-to-have.

Write the chat summary as flowing prose, not a list: lead with the single most important
finding, then anything that needs a decision from the user, then the rest. Don't restate what
the text block already says.

### Output language

Set this once per account and stay consistent. The convention this skill was built from
produces **Indonesian** summaries and report copy, with technical terms left in English
(capture, status 200, backlink, YMYL). If the user writes in another language, match theirs
instead — but don't switch mid-project without saying so.

## The user's standing rule (do not violate)

**Broken styling and missing images are NOT grounds for rejecting a domain.** What matters is
whether the content inside the snapshot is still relevant to the domain name. Domains were
once skipped over broken CSS; the user explicitly overruled that. If the styling is broken but
the content fits the domain, still provide snapshots — at most mark it caution with a note.

Legitimate grounds for rejection (UNFIT) are only:
- A genuine content red flag (see Red Flags).
- Zero status-200 captures, or every status-200 capture turns out not to be a real page.
- The niche changed completely after expiry and no intact earlier era exists.

## Technical pipeline

### Access constraints you must respect

- `WebFetch` against web.archive.org is **blocked** (`SITE_BLOCKED`). Do not work around it.
- `curl`, `wget`, `requests`, or any other HTTP client from the shell is **also off-limits**
  for archive.org. This is a legal restriction, not a technical one.
- The only route: run `fetch()` **inside a page** whose origin is web.archive.org, via a
  browser tool. Navigate to `https://web.archive.org/robots.txt` first so the origin is
  right (that page returns 404 — normal and harmless).

### Endpoints

```
/__wb/sparkline?output=json&url=DOMAIN&collection=web
  → {years:{YYYY:[12 monthly counts]}, first_ts, last_ts}

/__wb/calendarcaptures/2?url=DOMAIN&date=YYYY
  → {items:[[MMDDhhmmss_int, status, count], …]}
  rebuild timestamp as: YYYY + String(item[0]).padStart(10,"0")

/web/{ts}id_/http://{domain}/
  → raw archived HTML with no Wayback toolbar (the id_ suffix matters)
```

The CDX endpoint (`/cdx/search/cdx`) was used earlier but started returning 503 — **do not
use it**; use calendarcaptures instead.

### Harness

`scripts/harness.js` provides `tf` (timeout fetch), `sl` (sleep), `put` (persist a result),
`one` (fetch one snapshot), `ctx` (pull keyword context), `shell` (detect an empty SPA shell),
`hist` (one domain's history), and `runset` (run a set of domains). Inject the whole file into
the tab via `javascript_tool`, then call `runset`.

Three things keep this harness alive. Don't change them:

- **Results live in `window.name`**, not in `window.X` variables. The page sometimes reloads
  itself and wipes every variable, but `window.name` survives. If after a reload
  `typeof window.tf === "undefined"` while `window.name` still holds data, just re-inject the
  harness — nothing was lost.
- **Read results in small slices.** The extension truncates JS results at roughly 1,000
  characters, so never request the whole object at once.
- **Sanitize output** with `.replace(/[?=&](?!\d)/g,"_")`. Without it the extension replies
  `[BLOCKED: Cookie/query string data]`. For non-Latin text (Arabic, Cyrillic, CJK,
  Vietnamese) use only that replacement — never an `[^A-Za-z0-9]` whitelist, which would strip
  the actual letters.

### Polling pattern

Never wait inside JS. Fire an async IIFE into the page, then `Bash sleep 240–290` (cheap), and
only then read `window.name`. For 10 domains, split into two sets of 5 and run them in
sequence; that survives rate limiting best.

### Handling failures

- `EX SyntaxError` from `hist` means archive.org returned HTML (rate limit or 503) instead of
  JSON. Retry that domain with 9–15 second gaps between attempts.
- `ERR TypeError` / `Failed to fetch` is also rate limiting. Pause 90–180 seconds and retry.
- If an async loop stops making progress for more than ~8 minutes, it's wedged: reload the
  tab (data in `window.name` survives), re-inject the harness, and run the remainder.
- If the extension itself times out repeatedly, **stop and report honestly**: name which
  domains were collected, which weren't, and which findings are still unverified. Do not
  publish a half-finished report. Ask the user to reload the extension. Never suggest routing
  around the restriction with curl.
- Screenshots frequently fail or capture the wrong tab. Don't depend on them. Every report
  must state plainly that visual rendering was not checked via screenshot.

## Choosing candidates

1. Keep only timestamps with status **200**.
2. Sort them, then take three: first, middle, last — this catches era changes.
3. **Open all three.** Status 200 does not mean a page exists. See
   `references/deceptive-captures.md` — this is the most valuable part of the skill.
4. If one turns out deceptive, test other dates in the same range until you find the real era
   boundary, then report that boundary explicitly ("AVOID every date before August 2024").
5. If the status-200 count is far lower than the calendar suggests, say so plainly — this is
   the single most frequently misleading pattern and the user needs to know.

## Content red flags

Reject (UNFIT) on:

- Online gambling, slots, casino, lottery, bookmaking, sportsbook.
- Adult / pornographic content.
- Phishing, malware, scams.
- PBN spam or manipulative backlink schemes.
- **Piracy** — unlicensed streaming or download sites for films, dramas, or software. How to
  confirm: inspect URL slugs and page structure for `skachat`, `yuklab oling`, `/serialy/`,
  `720p`/`1080p` labels, episode numbering, and video-player CSS classes
  (`.fplayer-title`, DataLife Engine markers). Two that were rejected on this basis:
  `kinobom.net` (Uzbek films) and `dorams.org` (Russian-dubbed dramas).
- **Injected spam links.** Found genuinely once: `calismahayatindan.com`'s 2017 era carried
  planted outbound links to an escort site. The site was clean from 2022 on, so it wasn't
  rejected outright — flagged caution, with the bad era named and a recommendation to check
  the backlink profile before buying. When only one era is affected, don't discard the whole
  domain.

**Always verify raw context before deciding.** Nearly every keyword the scanner catches turns
out to be innocent. See `references/false-positives.md` for the verified catalog. Never reject
a domain just because a regex matched.

## Non-content risk categories

These aren't red flags, but they change the user's decision, so they must be surfaced. Details
in `references/risk-categories.md`: trademark in the domain name, a real person's name,
government-service intermediaries, online pharmacies carrying prescription drugs, YMYL
(health/finance/legal), partisan political content, minors' personal data, thin affiliate
patterns, mass-produced content farms, and the "qq" suffix in Indonesian SEO context.

## Verdict taxonomy

| Label | When to use |
|---|---|
| **CLEAN** | Clean content, niche consistent with the domain name, adequate archive, still reasonably active. |
| **CAUTION** | Content is clean but something nags: thin archive, archive stopped years ago, sensitive/YMYL niche, trademark or personal-name risk, deceptive captures to avoid, or a weak content pattern. |
| **UNFIT** | Content red flag, zero recoverable pages, or a total niche change with no intact earlier era. |

Thresholds applied consistently throughout: a **still-active** archive lifts a domain to clean
even with a middling capture count (~14); an archive that **stopped years ago** drops it to
caution even with many captures; one or two usable captures is always caution; zero usable
captures is unfit.

## Writing per-domain notes

A useful note states: the niche and the business's location, the capture count and year span,
which era was chosen and why, **which dates to avoid and what they actually contain**, and any
typos or leftover template text that need fixing during restoration. That last one comes up
often and the user values it — examples found in the wild: a title reading "Expoter",
"Coffeee", leftover "Edit Template" text from a page builder, a site-builder's name still
stuck in the header.

Write with judgment, not description. If a domain has strong metrics but carries risk, say
both and hand the decision to the user — don't disguise it.

## Building the report

`scripts/build_report.py` is the proven pattern. The gist: read the previous batch's report,
slice `head` up to `<div class="wrap">` (replacing the Roman numeral in `<title>`), slice
`tail` from `const stateClass`, build `data` as a list of dicts, and serialize each item with
`json.dumps(o, ensure_ascii=False)`.

For the first batch on a new account, use `assets/report-head.html` and
`assets/report-tail.js` in place of a previous report.

Two things that broke this before and are now baked into the pattern:
- **Write the Python to a file via heredoc.** Don't use inline `python3 - <<EOF` with `\\"`
  escapes — that corrupts the strings.
- **Use curly quotes `“ ”`** inside note text rather than straight quotes, so they don't
  collide with JSON/JS escaping.

Validate before publishing:

```bash
python3 -c "
s=open('domain-snapshot-report-NN.html').read()
i=s.index('<script>')+8
open('/tmp/chk.js','w').write(s[i:s.rindex('</script>')])
"
node -e "const fs=require('fs');new Function(fs.readFileSync('/tmp/chk.js','utf8'));console.log('JS OK')"
```

Then recount the domains and badges so the stat-box numbers match the actual `DATA` contents.

If the artifact fails to load for the user, republishing the same path produces **no** new
version — write a differently named file (`-NNb.html`) to get a fresh URL, and also deliver
the HTML file directly.

## Small things that save time

- If the user includes a domain already audited in an earlier batch, **don't rescan it** —
  reuse the earlier result, show it in the report so the list stays complete, and mention in
  the summary that it's a duplicate.
- If a batch is dominated by domains whose captures all cluster in the last year, name that
  pattern at the end of the summary and suggest filtering the list by domain age before
  auditing.
