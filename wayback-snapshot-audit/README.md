# wayback-snapshot-audit

A skill for auditing batches of expired domains against the Wayback Machine and selecting the
best snapshots for restoration or resale.

## Installing on another Claude account

1. Extract this zip.
2. In the target account, open **Settings → Capabilities → Skills**, choose **Upload skill**,
   and upload the `wayback-snapshot-audit/` folder (or the zip itself if a zip is requested).
3. For Claude Code / Cowork, drop the `wayback-snapshot-audit/` folder into
   `~/.claude/skills/` or into `.claude/skills/` inside a project.

The skill triggers on its own when the user pastes a list of domain names, or mentions snapshot
selection, Wayback auditing, or a "Snapshot Selection" report.

## Contents

```
SKILL.md                            main instructions
README.md                           this file
references/deceptive-captures.md    pages that return status 200 but aren't real pages
references/false-positives.md       red-flag keywords that turned out innocent
references/risk-categories.md       non-content risks (trademark, personal names, YMYL, …)
references/output-format.md         summary format, text block, and artifact card structure
scripts/harness.js                  in-page fetch harness for web.archive.org
scripts/build_report.py             the report-builder pattern
assets/report-head.html             report head + CSS (for the first batch on a new account)
assets/report-tail.js               the card-rendering JS
```

## Requirements

Needs a browser tool capable of running JavaScript inside a page — Claude in Chrome
(`mcp__claude-in-chrome__*`) or the built-in browser pane. `WebFetch` and shell HTTP clients
cannot be used against web.archive.org.

## Note on language

The skill's instructions are in English. The **report output** defaults to Indonesian, matching
the workflow this skill was built from — labels (BERSIH / HATI-HATI / TIDAK LAYAK), the artifact
copy, and the chat summary. Both `SKILL.md` and `references/output-format.md` explain how to
switch the output language, and `scripts/build_report.py` has a `LABELS` dict at the top for
exactly that.

## Why the references matter

The `references/` files were assembled from dozens of real audit batches. The two most valuable
are `deceptive-captures.md` and `false-positives.md`. Together they prevent the two most common
mistakes: trusting a status-200 code at face value, and rejecting a domain because a red-flag
regex matched an ordinary word such as "socialista" or "spécialiste".
