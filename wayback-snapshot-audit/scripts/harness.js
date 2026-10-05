// Wayback audit harness — inject this ENTIRE file into a tab whose origin is
// web.archive.org via javascript_tool, then call window.runset(...).
//
// Navigate to https://web.archive.org/robots.txt first so the origin is correct.
// That page returns 404; this is normal and harmless.
//
// Results are stored in window.name (as JSON) so they survive the page reloading itself.
// If after a reload typeof window.tf === "undefined" but window.name still holds data,
// just re-inject this file — nothing was lost.

window.tf = (u, ms) => {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms || 35000);
  return fetch(u, { signal: c.signal }).then(r => { clearTimeout(t); return r; });
};

window.sl = ms => new Promise(r => setTimeout(r, ms));

// Do not add streaming|subtitle|nonton|torrent|qq — far too noisy.
// Piracy is detected through structural signals, not these words.
window.bad = /(slot|casino|judi|poker|togel|gacor|bandar|betting|porn|xxx|escort|viagra|cialis|sportsbook|baccarat|roulette|replica|bokep|skachat|yuklab)/gi;

window.put = (k, v) => {
  let o = {};
  try { o = JSON.parse(window.name || "{}"); } catch (e) {}
  o[k] = v;
  window.name = JSON.stringify(o);
};

// Fetch one snapshot. Reports HTML length (L…) because that is the fastest signal for
// spotting parking pages, error pages, and empty shells.
window.one = async (d, t) => {
  try {
    const r = await window.tf(`https://web.archive.org/web/${t}id_/http://${d}/`, 40000);
    const h = await r.text();
    const doc = new DOMParser().parseFromString(h, 'text/html');
    const ti = (doc.title || '').trim().slice(0, 85);
    doc.querySelectorAll('script,style,noscript').forEach(e => e.remove());
    const bd = (doc.body && doc.body.textContent || '').replace(/\s+/g, ' ').trim();
    let fl = [];
    const m = h.match(window.bad);
    if (m) fl = [...new Set(m.map(x => x.toLowerCase()))].slice(0, 6);
    return `${t} ${r.status} [${ti}] FL{${fl.join(',')}} L${h.length} :: ${bd.slice(0, 160)}`;
  } catch (e) { return `${t} ERR ${e.name}`; }
};

// Pull the raw context around each keyword. MANDATORY before treating any flag as real.
window.ctx = async (d, t, ws) => {
  try {
    const r = await window.tf(`https://web.archive.org/web/${t}id_/http://${d}/`, 40000);
    const h = await r.text();
    let out = [];
    for (const w of ws) {
      const i = h.toLowerCase().indexOf(w);
      out.push(w + '>' + (i < 0 ? 'none' : h.slice(Math.max(0, i - 38), i + 16).replace(/\s+/g, ' ')));
    }
    return out.join(' | ');
  } catch (e) { return 'ERR ' + e.name; }
};

// Determine whether a page has real content or is just an SPA shell.
// Use this when body.textContent is empty despite a large file.
window.shell = async (d, t) => {
  try {
    const r = await window.tf(`https://web.archive.org/web/${t}id_/http://${d}/`, 40000);
    const h = await r.text();
    const doc = new DOMParser().parseFromString(h, 'text/html');
    const txt = (doc.body && doc.body.textContent || '').replace(/\s+/g, ' ').trim();
    const bi = h.toLowerCase().indexOf('<body');
    return `L${h.length} txt${txt.length} a${doc.querySelectorAll('a').length} ` +
           `img${doc.querySelectorAll('img').length} script${doc.querySelectorAll('script').length} ` +
           `bodyAt${bi} :: ${h.slice(bi, bi + 240).replace(/\s+/g, ' ')}`;
  } catch (e) { return 'ERR ' + e.name; }
};

// One domain's history: sparkline -> per-year calendarcaptures -> keep status 200 only
// -> pick first/middle/last -> open each one.
window.hist = async (d) => {
  try {
    const sp = await (await window.tf(
      `https://web.archive.org/__wb/sparkline?output=json&url=${d}&collection=web`, 35000)).json();
    const yrs = Object.keys(sp.years || {}).filter(y => sp.years[y].some(n => n > 0)).sort();
    if (!yrs.length) return { d, err: 'NOCAP' };
    let ts = [];
    for (const y of yrs) {
      try {
        const cc = await (await window.tf(
          `https://web.archive.org/__wb/calendarcaptures/2?url=${d}&date=${y}`, 35000)).json();
        for (const it of (cc.items || [])) {
          if (String(it[1]) === '200') ts.push(y + String(it[0]).padStart(10, '0'));
        }
      } catch (e) {}
      await window.sl(400);
    }
    if (!ts.length) return { d, yrs: yrs.join(','), err: 'NO200' };
    ts.sort();
    const pick = [...new Set([ts[0], ts[Math.floor(ts.length / 2)], ts[ts.length - 1]])];
    const out = [];
    for (const t of pick) { out.push(await window.one(d, t)); await window.sl(700); }
    return { d, yrs: yrs.join(','), n: ts.length, all: ts.join(','), snaps: out };
  } catch (e) { return { d, err: 'EX ' + e.name }; }
};

// Run one set of domains. Split 10 domains into two sets of 5; that survives rate limiting
// best. EX SyntaxError means archive.org returned HTML instead of JSON -> retry.
window.runset = async (list, flag) => {
  for (const d of list) {
    window.put('CUR', d);
    let r = null;
    for (let a = 0; a < 4; a++) {
      r = await window.hist(d);
      if (!r.err || r.err === 'NOCAP' || r.err === 'NO200') break;
      await window.sl(13000);
    }
    window.put(d, r);
    await window.sl(3000);
  }
  window.put(flag, 1);
};

"harness ready";
