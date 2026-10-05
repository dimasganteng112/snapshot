# Catalog of keyword false positives

The red-flag scanner uses regexes without word boundaries, so it matches in entirely harmless
places. **Across dozens of batches, nearly every hit turned out to be false.** Only two were
ever genuine (last section).

The rule: every keyword hit **must** have its raw context checked with `ctx()` before it
influences a verdict. Never reject a domain because a regex matched.

## "cialis" — almost always an ordinary word

`cialis` hides inside many European words:

| Source | Language | Example domain |
|---|---|---|
| so**cialis**ta | Spanish | `santano.net` |
| espe**cialis**ta / espe**cialis**tas | Spanish, Portuguese | `limpiamostucasa.com`, `loacosmeticos.com` |
| spé**cialis**te | French | `lagastore.com` |
| spé**cialis**tés | French | `plexi-sur-mesure-paris.com` |
| spe**cialis**t / spe**cialis**ts | English | `chestandallergy.com`, `hcapconference.org` |
| "Essential Oils Spe**cialis**t_Icon.png" (an image filename) | — | `lessolutionsaunatureldaurore.com` |

## "slot" — plugin and ad code

| Source | What it is | Example domain |
|---|---|---|
| `data-slotamount` | Revolution Slider attribute | `scperrl.org`, `xcorset.com`, `csyildizi.com`, `hasmijakarta.org`, `truejute.com` |
| `google_ad_slot`, `data-ad-slot` | AdSense code | `coctelybebida.com`, `soloviaja.com` |
| `GA_googleAddSlot` | legacy AdSense | `otstypki.com` |
| `wpml-ls-slot-NN` | WPML language-switcher CSS class | `vintageconnector.com`, `paolanuttiofficial.com` |
| `slot-placeholder-…`, `data-hook="slot-…"` | Wix internals | `kidiwinkkidz.com`, `shannonvistahoa.com`, `elfpilates.com` |
| a coincidental run of letters inside base64 data | coincidence | `dorams.org` |

## "xxx" — templates and placeholders

| Source | Example domain |
|---|---|
| `crypto.randomUUID()` template: `"xxxxxxxx-xxxx-4xxx-…"` | `kidiwinkkidz.com`, `northernvermontyouthfootball.com`, `truejute.com` |
| a fragment of a reCAPTCHA site key (e.g. `…TXXXSM4BUPE`) | `udrugaeterico.com` |
| an unfinished placeholder link `<a href="xxx">` | `uitzendbureausuriname.com` |

## "porn" — a run of letters inside base64

`confetticarpets.com`'s Dec 2022 capture flagged `porn`. Opening the raw HTML showed it was
simply a random fragment in the middle of an inlined base64 image. That Turkish carpet
manufacturer went on to be the best domain in its batch. **Lesson: even the most serious
keyword must have its context checked first.**

## "qq" — brand names and YouTube IDs

| Source | Example domain |
|---|---|
| the site's own brand name ("Kursus Komputer QQ") | `kursuskomputerqq.com` |
| a fragment of a YouTube embed ID (`4tQgJJ9ImqQ`) | `hasmijakarta.org` |
| a `…@qq.com` email address | `flydancerhythm.com` |

Separate point: even when the content is clean, a "qq" suffix in the domain name is worth
mentioning to the user, because in Indonesian SEO it is strongly associated with gambling
sites. That's a backlink-profile concern, not a content one.

## "nonton", "streaming", "subtitle", "torrent"

These words are far too common to use as signals. Hits that turned out innocent:

| Source | Example domain |
|---|---|
| a community-event article slug `/nonton-bareng-…` ("watch together") | `hasmijakarta.org` |
| MediaElement.js player language string: "Diretta streaming" | `ilariabarbetti.com` |
| the CSS class `.the-subtitle` | `urbansweekly.com` |
| the Wix CSS variable `--wst-color-subtitle` | `hcapconference.org` |

To detect piracy, don't use these words. Use structural signals instead: `skachat` /
`yuklab oling` slugs, a `/serialy/` catalog section, `720p`/`1080p` resolution labels, episode
numbering, and video-player classes such as `.fplayer-title` or DataLife Engine markers.

## The two that were GENUINE

Only two, across dozens of batches:

1. **`calismahayatindan.com`** — the 2017 capture carried planted outbound links to an escort
   site (`<a href="http://…" title="izmir escort">`). The 2022-onward era is clean, so the
   domain wasn't rejected; it was flagged caution with instructions to avoid the 2017 era and a
   recommendation to check the backlink profile before buying.
2. **Piracy sites** — `kinobom.net` (Uzbek films, `skachat` / `yuklab oling` slugs, 720p HD
   labels, DataLife Engine player) and `dorams.org` (Russian-dubbed Asian dramas, `/serialy/`
   catalog, "серия" episode references, `.fplayer-title` class). Both rejected.

## Recommended regex

```js
/(slot|casino|judi|poker|togel|gacor|bandar|betting|porn|xxx|escort|viagra|cialis|
sportsbook|baccarat|roulette|replica|bokep|skachat|yuklab)/gi
```

Do not add `streaming`, `subtitle`, `nonton`, `torrent`, or `qq` to the regex — too much
noise. Detect piracy through structural signals instead.
