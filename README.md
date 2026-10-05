# Claude Skills — Wayback Snapshot Audit

A Claude skill for auditing batches of expired domains against the Wayback Machine and
selecting the best snapshots for restoration or resale.

Built from dozens of real audit batches. The valuable part isn't the pipeline — it's the two
reference catalogs that encode mistakes already made and corrected.

## Install

**claude.ai** — Settings → Capabilities → Skills → Upload skill, then upload the
`wayback-snapshot-audit/` folder (zip it first if a zip is required).

**Claude Code / Cowork** — copy the folder into `~/.claude/skills/` for all projects, or into
`.claude/skills/` inside a single project:

```bash
git clone https://github.com/dimasganteng112/snapshot.git
cp -r snapshot/wayback-snapshot-audit ~/.claude/skills/
```

The skill triggers on its own when you paste a list of domain names, or mention snapshot
selection, Wayback auditing, or a snapshot-selection report.

## Requirements

A browser tool that can run JavaScript inside a page — Claude in Chrome
(`mcp__claude-in-chrome__*`) or the built-in browser pane. `WebFetch` and shell HTTP clients
cannot reach web.archive.org.

## The two catalogs worth reading on their own

**[`references/deceptive-captures.md`](wayback-snapshot-audit/references/deceptive-captures.md)**
— pages that the Wayback calendar reports as status 200 but which aren't real pages at all:
nginx 429 errors, Plesk defaults at exactly 464 bytes, Apache `Index of /` listings, SPA
loading shells, ISP placeholders, bot-verification pages, domain-for-sale ads, default
WordPress installs. Includes byte-length heuristics for fast triage and a table of the
"calendar trap" — the gap between years Wayback displays and years that actually have
status-200 captures.

One case shows why this matters: a domain presented 39 status-200 captures across four years
and looked like the strongest candidate in its batch. Its `<body>` contained nothing but a
loading spinner. Zero text, zero links, zero images.

**[`references/false-positives.md`](wayback-snapshot-audit/references/false-positives.md)**
— red-flag keywords that matched harmless text, grouped by source. `cialis` inside
*socialista*, *especialista*, *spécialiste*, *specialist*. `slot` from Revolution Slider,
AdSense, WPML, and Wix internals. `xxx` from UUID templates and reCAPTCHA keys. And one case
where `porn` was a random run of letters inside an inlined base64 image — on a legitimate
Turkish carpet manufacturer's site.

It also records the two hits that were genuinely real, so the skill doesn't swing too
permissive in the other direction.

## Contents

```
wayback-snapshot-audit/
  SKILL.md                            main instructions
  README.md                           install notes
  references/deceptive-captures.md    status-200 pages that aren't real pages
  references/false-positives.md       red-flag keywords that were innocent
  references/risk-categories.md       trademark, personal names, YMYL, regulated products
  references/output-format.md         summary format, text block, artifact card structure
  scripts/harness.js                  in-page fetch harness for web.archive.org
  scripts/build_report.py             report-builder pattern
  assets/report-head.html             report head + CSS
  assets/report-tail.js               card-rendering JS
```

## Report output language

The skill's instructions are in English. The **report output** — verdict labels, the artifact
copy, and the chat summary — defaults to Indonesian, matching the workflow this skill was
built from. `SKILL.md` and `references/output-format.md` explain how to switch it, and
`scripts/build_report.py` has a `LABELS` dict at the top for exactly that.

## License

MIT — see [LICENSE](LICENSE).
