const stateClass = { ok: "", warn: "state-warn", bad: "state-bad" };

const wrap = document.getElementById("cards");
DATA.forEach(d => {
  const card = document.createElement("div");
  card.className = "card " + stateClass[d.state];

  const snapsHtml = d.snaps.map(([yr, dt, orig, ts]) => {
    const url = `https://web.archive.org/web/${ts}/${orig}`;
    return `<a class="snap" href="${url}" target="_blank" rel="noopener">
      <span class="yr">${yr}</span>
      <span class="dt">${dt}</span>
      <span class="go">buka snapshot &rarr;</span>
    </a>`;
  }).join("");

  card.innerHTML = `
    <div class="card-top">
      <div class="domain">${d.domain}</div>
      <div class="badge">${d.badge}</div>
    </div>
    <p class="niche">${d.niche}</p>
    <div class="meta">${d.meta}</div>
    <div class="snaps">${snapsHtml}</div>
    ${d.note ? `<div class="note">${d.note}</div>` : ""}
  `;
  wrap.appendChild(card);
});
</script>
