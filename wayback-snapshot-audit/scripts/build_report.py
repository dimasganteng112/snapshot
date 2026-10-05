#!/usr/bin/env python3
"""
The report builder pattern for "Snapshot Selection".

How to use: COPY this file into your scratchpad, replace `data` and `lede`, then run it.
Don't run it as-is — this is a template.

Two things that broke this before and are avoided here:
  1. The script is written to a file via a heredoc, NOT inline `python3 - <<EOF` with \\"
     escapes — those escapes corrupt Python strings.
  2. Note text uses curly quotes " " rather than straight quotes, so they don't collide with
     JSON/JS escaping.

Where head/tail come from:
  - Continuing batches: read the previous batch's report (most accurate, keeps the styling
    consistent).
  - First batch on a new account: use assets/report-head.html + assets/report-tail.js from
    this skill.

Output language: LABELS and the UI copy below default to Indonesian, matching the convention
this skill was built from. Switch them to the user's language if different — see
references/output-format.md.
"""

import json
import os

os.chdir('/home/claude')

PREV = 'domain-snapshot-report-44.html'   # change: previous batch's report
OUT = 'domain-snapshot-report-45.html'    # change: this batch's number
ROMAN_FROM = 'Seleksi Snapshot Domain XLIV'
ROMAN_TO = 'Seleksi Snapshot Domain XLV'
BATCH_NO = 45
REPORT_DATE = '6 Okt 2026'

# Verdict labels. Indonesian by default; swap to CLEAN / CAUTION / UNFIT for English output.
LABELS = {"ok": "BERSIH", "warn": "HATI-HATI", "bad": "TIDAK LAYAK"}

# --- head & tail -------------------------------------------------------------
# Continuing batch:
src = open(PREV).read()
head = src[:src.index('<div class="wrap">')].replace(ROMAN_FROM, ROMAN_TO)
tail = src[src.index('const stateClass'):]

# First batch on a new account — use this instead:
# head = open('assets/report-head.html').read().replace('Seleksi Snapshot Domain XLIV', ROMAN_TO)
# tail = open('assets/report-tail.js').read()


def S(y, dt, dom, ts):
    """One snapshot row: [year, display date, original url, wayback timestamp]."""
    return [y, dt, "http://%s/" % dom, ts]


# --- report contents ---------------------------------------------------------
# state: "ok" = clean, "warn" = caution, "bad" = unfit
# snaps: leave empty ([]) for unfit domains.
data = [
    dict(
        domain="example-domain.com",
        niche="Describe the business, its location, and what the pages actually contain.",
        state="ok",
        meta="First capture 2018 · Last capture 2026 · 44 status-200 captures",
        snaps=[
            S("2018", "10 Jan 2018", "example-domain.com", "20180110071117"),
            S("2022", "14 Feb 2022", "example-domain.com", "20220214195727"),
            S("2026", "01 Jan 2026", "example-domain.com", "20260101040445"),
        ],
        note=(
            "State the capture count and year span, which era was chosen and why, WHICH DATES "
            "TO AVOID and what they contain, plus any typos or leftover template text needing "
            "cleanup. Use curly quotes when quoting page text."
        ),
    ),
]

STATS = {
    "total": len(data),
    "ok": sum(1 for d in data if d["state"] == "ok"),
    "warn": sum(1 for d in data if d["state"] == "warn"),
    "bad": sum(1 for d in data if d["state"] == "bad"),
}


def js(d):
    o = dict(d)
    o["badge"] = LABELS[d["state"]]
    return "  " + json.dumps(o, ensure_ascii=False)


# Lede: lead with the most important finding, then what needs a decision, then the rest.
# Use <code> for domain names and <strong> for one headline finding only.
lede = (
    'Hasil: {ok} bersih, {warn} perlu hati-hati, {bad} tidak layak. '
    'Klik tanggal mana pun untuk membuka snapshot aslinya di tab baru.'
).format(**STATS)

MONO = ("font-family:'JetBrains Mono',monospace;background:var(--accent-bg);"
        "color:var(--accent-ink);padding:0.1em 0.4em;border-radius:4px;")

body = '''<div class="wrap">

  <header class="page">
    <p class="eyebrow">Restorasi Domain · Audit Wayback Machine · Batch {batch}</p>
    <h1>Seleksi Snapshot Terbaik</h1>
    <p class="lede">{lede}</p>
    <div class="stats">
      <div class="stat"><div class="n">{total}</div><div class="l">domain diaudit</div></div>
      <div class="stat accent"><div class="n">{ok}</div><div class="l">bersih</div></div>
      <div class="stat warn"><div class="n">{warn}</div><div class="l">perlu hati-hati</div></div>
      <div class="stat bad"><div class="n">{bad}</div><div class="l">tidak layak</div></div>
    </div>
  </header>

  <div class="grid" id="cards"></div>

  <footer>
    Metodologi: histori capture dari endpoint kalender Wayback (<code style="{mono}">__wb/sparkline</code>
    &amp; <code style="{mono}">calendarcaptures</code>), hanya capture berstatus 200 yang
    dipertimbangkan — dan tiap kandidat tetap dibuka isinya, karena halaman default hosting
    maupun halaman error bisa terdaftar berstatus 200. HTML mentah tiap kandidat dipindai
    untuk judul, isi teks, dan kata kunci red flag; setiap kata kunci yang tertangkap
    diperiksa konteks mentahnya sebelum diputuskan. Tampilan tidak dicek lewat screenshot.
    Disusun {date}.
  </footer>
</div>

<script>
const DATA = [
{rows}
];

'''.format(batch=BATCH_NO, lede=lede, mono=MONO, date=REPORT_DATE,
           rows=",\n".join(js(d) for d in data), **STATS)

open(OUT, 'w').write(head + body + tail)
print("written", OUT, len(head + body + tail), STATS)
