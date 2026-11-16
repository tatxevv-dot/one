/* Zone skin v3 — lineups: two connected half-pitches, nothing overlaps (loaded after app.js) */
(function () {
  const avg = (ps) => { const r = ps.map((p) => +p.rating).filter(Boolean); return r.length ? r.reduce((a, b) => a + b, 0) / r.length : null; };
  window.matchLineups = function ({ m, pms, evs, H, A }, box) {
    if (!pms.length) { box.innerHTML = noData("Составы появятся примерно за час до начала матча."); return; }
    const goalsBy = {}, cardsBy = {};
    for (const e of evs) {
      if (!e.player_id) continue;
      if (e.type === "goal" || e.type === "penalty_goal") goalsBy[e.player_id] = (goalsBy[e.player_id] || 0) + 1;
      if (e.type === "yellow" || e.type === "red") cardsBy[e.player_id] = e.type;
    }
    const last = (p) => p.player?.raw?.last || (p.player?.name || "").split(" ").slice(-1)[0] || "";
    const dot = (p, x, y) => {
      const g = goalsBy[p.player_id], c = cardsBy[p.player_id];
      return `<a class="pl" href="#/player/${p.player_id}" style="left:${x}%;top:${y}%"><span class="ph"><span>${esc(p.raw?.jersey || "")}</span><img src="${headshot(p.player_id)}" alt="" loading="lazy" onerror="this.remove()">`
        + (p.rating ? `<i class="rt rating ${ratingCls(p.rating)}">${Number(p.rating).toFixed(1)}</i>` : "")
        + (p.raw?.subOut ? `<i class="so"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></i>${p.raw.outM != null ? `<em class="sm">${p.raw.outM}'</em>` : ""}` : "")
        + (c ? `<i class="cd ${c === "red" ? "card-r" : "card-y"}"></i>` : "")
        + (g ? `<i class="gl">${ICON.ball}${g > 1 ? `<b>${g}</b>` : ""}</i>` : "")
        + `</span><span class="nm">${esc(last(p))}</span></a>`;
    };
    const half = (tid, away) => {
      const f = (tid === m.home_team_id ? H : A)?.raw?.formation;
      const lines = layoutXI(pms.filter((p) => p.team_id === tid), f).filter((l) => l.length);
      return lines.map((ln, li) => {
        const y0 = 9 + (li / Math.max(1, lines.length - 1)) * 74, y = away ? y0 : 100 - y0;
        return ln.map((p, pi) => { const x0 = 8 + ((pi + 0.5) / ln.length) * 84; return dot(p, away ? 100 - x0 : x0, y); }).join("");
      }).join("");
    };
    const head = (t, tid) => {
      const f = (tid === m.home_team_id ? H : A)?.raw?.formation;
      const a = avg(pms.filter((p) => p.team_id === tid && p.raw?.starter));
      return `<a class="lu-head" href="#/team/${t.id}">${crest(t, "crest sm")}<b>${esc(t.name)}</b><span class="fm">${esc(f || "")}</span>${a ? `<span class="rating ${ratingCls(a)}">${a.toFixed(1)}</span>` : ""}</a>`;
    };
    const bench = (t, tid) => {
      const rows = pms.filter((p) => p.team_id === tid && !p.raw?.starter).sort((a, b) => (b.minutes || 0) - (a.minutes || 0))
        .map((p) => `<a class="brow" href="#/player/${p.player_id}"><span class="no">${esc(p.raw?.jersey || "")}</span>${avatar(p.player_id, p.player?.name)}<span class="grow">${esc(p.player?.name)}<br><small>${esc(p.raw?.pos || "")}${p.raw?.subIn ? ` · <span style="color:var(--win)">↑ ${p.raw.inM}'</span>` : ""}</small></span>${p.minutes ? ratingChip(p.rating) : ""}</a>`).join("");
      return rows ? `<div class="lu-sub">Запасные · ${esc(t.short_name || t.name)}</div><div class="bench1">${rows}</div>` : "";
    };
    box.innerHTML = `<div class="lu card">${head(m.away, m.away_team_id)}<div class="lu-pitch"><div class="lu-half">${halfLines}${half(m.away_team_id, true)}</div><div class="lu-half flip">${halfLines}${half(m.home_team_id, false)}</div></div>${head(m.home, m.home_team_id)}${bench(m.away, m.away_team_id)}${bench(m.home, m.home_team_id)}</div>`;
  };
})();
