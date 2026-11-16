/* Zone — match streams (table match_streams). Admins add/delete from the bottom of a match page. Loaded after app.js/auth.js. */
(function () {
  "use strict";
  let isAdmin = false, uid = null, hlsList = [], hlsLoading = null, lastKey = "";
  const HLS_SRC = "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";
  const loadHls = () => window.Hls ? Promise.resolve() : (hlsLoading ||= new Promise((ok, no) => { const s = document.createElement("script"); s.src = HLS_SRC; s.onload = ok; s.onerror = no; document.head.appendChild(s); }));
  const matchId = () => { const m = location.hash.match(/^#\/match\/([^/?]+)/); return m ? decodeURIComponent(m[1]) : null; };
  const kindOf = (u, k) => k && k !== "auto" ? k : /\.m3u8(\?|$)/i.test(u) ? "hls" : /\.(mp4|webm|mov)(\?|$)/i.test(u) ? "mp4" : "iframe";
  const killPlayers = () => { hlsList.forEach((h) => { try { h.destroy(); } catch (e) {} }); hlsList = []; };

  async function checkAdmin() {
    try { const { data: s } = await sbAuth.auth.getSession(); uid = s?.session?.user?.id || null; isAdmin = false;
      if (uid) { const { data } = await sbAuth.rpc("is_admin"); isAdmin = data === true; } } catch (e) { isAdmin = false; }
  }

  async function mountPlayer(box, s) {
    const url = s.url, k = kindOf(url, s.kind);
    if (k === "iframe") { box.innerHTML = `<iframe src="${esc(url)}" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen referrerpolicy="no-referrer"></iframe>`; return; }
    box.innerHTML = `<video controls playsinline preload="metadata"></video>`;
    const v = box.firstChild, fail = (t) => { box.innerHTML = `<div class="st-err">${esc(t)}</div>`; };
    if (k === "mp4" || v.canPlayType("application/vnd.apple.mpegurl") && k === "hls" && !window.Hls) { v.src = url; return; }
    try { await loadHls(); } catch (e) { if (v.canPlayType("application/vnd.apple.mpegurl")) { v.src = url; return; } return fail("Не удалось загрузить плеер"); }
    if (window.Hls && Hls.isSupported()) {
      const h = new Hls(); hlsList.push(h); h.loadSource(url); h.attachMedia(v);
      h.on(Hls.Events.ERROR, (_, d) => { if (d.fatal) fail("Трансляция недоступна"); });
    } else if (v.canPlayType("application/vnd.apple.mpegurl")) v.src = url; else fail("Формат не поддерживается");
  }

  async function render(force) {
    const id = matchId(), wrap = $("#app .wrap");
    if (!id || !wrap || !$("#mcontent")) { if (!id) { killPlayers(); lastKey = ""; } return; }
    const key = id + "|" + isAdmin;
    if (!force && $("#mstream-top, #mstreams") && lastKey === key) return;
    killPlayers(); $("#mstream-top")?.remove(); $("#mstreams")?.remove(); lastKey = key;
    let rows = [];
    try { rows = await run(sb.from("match_streams").select("*").eq("match_id", id).order("sort_order", { ascending: true }).order("created_at", { ascending: true })); } catch (e) { console.warn("[streams]", e.message); }
    if (matchId() !== id || !$("#app .wrap")) return;
    const w = $("#app .wrap"), nav = $(".localnav", w);

    /* ---- player: at the top, under the match header ---- */
    if (rows.length) {
      const top = document.createElement("div"); top.id = "mstream-top"; top.className = "card stream-card"; top.style.marginTop = "16px";
      top.innerHTML = `<div class="card-h">Трансляция<span class="live-dot" style="margin-left:8px"></span>${rows.length > 1 ? `<span class="st-srcs">${rows.map((s, i) => `<button type="button" data-i="${i}" class="${i ? "" : "on"}">${esc(s.title || "Поток " + (i + 1))}</button>`).join("")}</span>` : ""}</div><div class="st-item"><div class="st-box"></div></div>`;
      if (nav) nav.before(top); else w.appendChild(top);
      const box = $(".st-box", top), play = (i) => { killPlayers(); mountPlayer(box, rows[i]); };
      play(0);
      $$(".st-srcs button", top).forEach((b) => b.onclick = () => { $$(".st-srcs button", top).forEach((x) => x.classList.toggle("on", x === b)); play(+b.dataset.i); });
    }
    if (!isAdmin) return;

    /* ---- admin panel: at the bottom ---- */
    const sec = document.createElement("div"); sec.id = "mstreams"; sec.style.marginTop = "16px";
    sec.innerHTML = `<div class="card"><div class="card-h">Трансляции (админ)</div>
      ${rows.length ? rows.map((s, i) => `<div class="st-item"><div class="st-head"><b>${esc(s.title || "Трансляция " + (i + 1))}</b><small>${[s.language, s.quality, s.commentator].filter(Boolean).map(esc).join(" · ")}</small><button type="button" class="adm-btn del" data-del="${s.id}">Убрать</button></div><small style="opacity:.6;word-break:break-all">${esc(s.url)}</small></div>`).join("") : `<div class="st-item"><small style="opacity:.6">Трансляций пока нет</small></div>`}
      <div class="adm-bar"><button type="button" class="adm-btn" id="admOpen">Добавить трансляцию</button></div>
      <form id="admForm" class="adm-form" hidden novalidate>
        <div class="full"><label>Ссылка на трансляцию *</label><input name="url" placeholder="https://… (.m3u8 / .mp4 / страница плеера)" autocomplete="off" autocapitalize="off"></div>
        <div class="full"><label>Название</label><input name="title" placeholder="Например: Основной поток"></div>
        <div><label>Тип</label><select name="kind"><option value="auto">Авто</option><option value="hls">HLS (.m3u8)</option><option value="mp4">Видео (mp4)</option><option value="iframe">Встраиваемая страница</option></select></div>
        <div><label>Язык</label><input name="language" placeholder="RU"></div>
        <div><label>Качество</label><input name="quality" placeholder="1080p"></div>
        <div><label>Комментатор</label><input name="commentator"></div>
        <div class="full"><div class="adm-msg" id="admMsg" style="padding:0"></div><button type="submit" class="adm-btn">Добавить трансляцию</button> <button type="button" class="adm-btn ghost" id="admCancel">Отмена</button></div>
      </form></div>`;
    w.appendChild(sec);
    const form = $("#admForm", sec), msg = $("#admMsg", sec), say = (t, ok) => { msg.textContent = t; msg.classList.toggle("ok", !!ok); };
    $("#admOpen", sec).onclick = () => { form.hidden = !form.hidden; if (!form.hidden) form.url.focus(); };
    $("#admCancel", sec).onclick = () => { form.hidden = true; say(""); };
    sec.addEventListener("click", async (e) => {
      const b = e.target.closest("[data-del]"); if (!b || !confirm("Убрать эту трансляцию?")) return;
      b.disabled = true; const { error } = await sbAuth.from("match_streams").delete().eq("id", b.dataset.del);
      if (error) { b.disabled = false; return toast("Ошибка: " + error.message); } toast("Трансляция убрана"); render(true);
    });
    form.addEventListener("submit", async (e) => {
      e.preventDefault(); const f = form, url = f.url.value.trim();
      if (!/^https?:\/\/\S+$/i.test(url)) return say("Вставьте ссылку, начинающуюся с http(s)://");
      const row = { match_id: id, url, kind: f.kind.value };
      for (const k of ["title", "language", "quality", "commentator"]) { const v = f[k].value.trim(); if (v) row[k] = v; }
      row.sort_order = rows.length; const btn = $("button[type=submit]", f); btn.disabled = true; say("");
      const { error } = await sbAuth.from("match_streams").insert(row); btn.disabled = false;
      if (error) return say(/row-level|permission/i.test(error.message) ? "Нет прав: аккаунт не админ" : error.message);
      toast("Трансляция добавлена"); render(true);
    });
  }

  let t = 0; const kick = (force) => { clearTimeout(t); t = setTimeout(() => render(force), 60); };
  new MutationObserver(() => kick(false)).observe($("#app"), { childList: true });
  addEventListener("hashchange", () => kick(false));
  sbAuth.auth.onAuthStateChange(() => { setTimeout(async () => { await checkAdmin(); kick(true); }, 0); });
  checkAdmin().then(() => kick(true));
})();
