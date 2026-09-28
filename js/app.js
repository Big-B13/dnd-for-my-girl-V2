/* ============================================================
   TALES OF THE DM — application / UI controller
   ============================================================ */
(function () {
  const TDM = window.TDM;
  const E = TDM.engine, OPT = TDM.CHAR_OPTIONS, APP = OPT.APPEARANCE, DB = TDM.db;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- app state ---------- */
  const S = {
    player: null,         // current player name (lowercase key)
    playerData: null,     // { name, display, characters:{}, saves:{}, createdAt }
    roster: [],
    draft: null,          // character under construction
    step: 0,
    appTab: 'body',
    save: null,           // active run
    episode: null,
    pending: null,        // pending check state
    saveTimer: null
  };

  const STEPS = ['Identity', 'Race', 'Class', 'Path', 'Origin', 'Abilities', 'Appearance', 'Story', 'Review'];
  const POINT_BUDGET = 27;
  const POINT_COST = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };

  /* ============================================================
     BOOT
     ============================================================ */
  async function boot() {
    makeEmbers();
    DB.onStatus = renderDbChip;
    await DB.init();
    renderDbChip(DB.mode, DB.reason);
    // Seed the original table run once, so the comparison screen has
    // something to compare against from the very first playthrough.
    if (TDM.seedPerry) {
      try { await TDM.seedPerry(DB, TDM.EPISODES[TDM.EPISODE_ORDER[0]]); } catch (e) {}
    }
    S.roster = await DB.listPlayers();
    if (!S.roster.includes('nergis')) S.roster.unshift('nergis');
    if (!S.roster.includes('perry')) S.roster.push('perry');
    renderStart();
    show('start');
    wireGlobal();
  }

  function renderDbChip(mode, reason, fix) {
    const el = $('#dbchip');
    if (!el) return;
    const cloud = mode !== 'local';
    el.className = 'dbchip ' + (cloud ? 'cloud' : 'local');
    el.innerHTML = `<span class="led"></span><span>${cloud ? (mode === 'rtdb' ? 'Cloud · Realtime DB' : 'Cloud · Firestore') : 'Offline · this device'}</span>`
      + (cloud ? '' : `<span class="why">why?</span>`);
    el.title = reason || (cloud ? 'Progress is syncing to your Firebase project.' : 'Progress is saved on this device.');
    el.onclick = () => showDbDetails(mode, reason, fix || DB.fix);
  }

  function showDbDetails(mode, reason, fix) {
    const cloud = mode !== 'local';
    let body = `<p>${esc(reason || (cloud ? 'Everything is syncing to your Firebase project.' : 'Progress is being saved on this device.'))}</p>`;
    if (!cloud) {
      body += `<p style="color:var(--ink)"><b>Nothing is lost.</b> Every choice is saved locally right now, and the moment the cloud connects it all uploads automatically.</p>`;
    }
    if (fix) {
      body += `<div class="feature-list" style="margin-bottom:18px"><h4>${esc(fix.title)}</h4>
        <ol style="margin:0;padding-left:20px;font-size:14px;line-height:1.85">${fix.steps.map(s => `<li>${s}</li>`).join('')}</ol></div>`;
    }
    const actions = [{ label: 'Got it', cls: 'primary', fn: closeModal }];
    if (fix && fix.link) actions.unshift({ label: 'Open Firebase console ↗', cls: '', fn: () => { window.open(fix.link, '_blank', 'noopener'); } });
    modal({ title: cloud ? 'Cloud sync is on' : 'Playing offline', body, actions });
  }

  function makeEmbers() {
    const box = $('#embers');
    if (!box) return;
    for (let i = 0; i < 26; i++) {
      const e = document.createElement('div');
      e.className = 'ember';
      e.style.left = Math.random() * 100 + '%';
      e.style.animationDuration = (7 + Math.random() * 9) + 's';
      e.style.animationDelay = (Math.random() * 12) + 's';
      const sz = 3 + Math.random() * 4;
      e.style.width = e.style.height = sz + 'px';
      e.style.setProperty('--dx', (Math.random() * 90 - 45) + 'px');
      box.appendChild(e);
    }
  }

  function show(id) {
    $$('.screen').forEach(s => s.classList.remove('active'));
    const el = $('#screen-' + id);
    if (el) el.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }

  function wireGlobal() {
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        const ov = $('.overlay.show');
        if (ov && ov.id === 'modal') closeModal();
      }
    });
  }

  /* ============================================================
     PLAYER DATA
     ============================================================ */
  function blankPlayer(display) {
    return { name: display.toLowerCase().replace(/[^a-z0-9_-]/g, ''), display, characters: {}, saves: {}, createdAt: Date.now(), updatedAt: Date.now() };
  }

  async function loadPlayer(nameKey, displayFallback) {
    let data = await DB.loadPlayer(nameKey);
    if (!data) data = blankPlayer(displayFallback || cap(nameKey));
    data.characters = data.characters || {};
    data.saves = data.saves || {};
    if (!data.display) data.display = cap(nameKey);
    return data;
  }

  function isReadOnlyPlayer(key) { return key === 'perry'; }

  async function persist(quiet) {
    if (!S.playerData) return;
    // The archived table run is never written back to, no matter what.
    if (isReadOnlyPlayer(S.playerData.name)) return;
    try {
      await DB.savePlayer(S.playerData.name, S.playerData);
      if (!quiet) flashSaved();
    } catch (e) {
      console.warn('save failed', e);
      toast({ type: 'note', text: 'Could not reach the cloud — progress kept on this device.' });
    }
  }

  function flashSaved() {
    const c = $('#savechip');
    if (!c) return;
    c.classList.add('show');
    clearTimeout(S.saveTimer);
    S.saveTimer = setTimeout(() => c.classList.remove('show'), 1700);
  }

  const cap = (s) => String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1);

  /* ============================================================
     START SCREEN
     ============================================================ */
  function renderStart() {
    const row = $('#whoRow');
    row.innerHTML = S.roster.map(n =>
      `<button class="who-chip${S.player === n ? ' on' : ''}" data-player="${esc(n)}"><span class="dot"></span>${esc(cap(n))}</button>`
    ).join('') + `<button class="who-chip add" id="addPlayer">+ Another player</button>`;

    $$('#whoRow .who-chip[data-player]').forEach(b => b.onclick = () => selectPlayer(b.dataset.player));
    $('#addPlayer').onclick = promptNewPlayer;

    const isNergis = !S.player || S.player === 'nergis';
    const isArchive = S.player === 'perry';   // the original table run — look, don't touch
    $('#welcomeTitle').textContent = S.player ? `Welcome back, ${cap(S.playerData ? S.playerData.display : S.player)}` : 'Welcome, Nergis';
    $('#welcomeText').innerHTML = isArchive
      ? `This is the original run at the original table — Perry, the elf gunslinger who reopened Grammy's Bakery.<br>It is kept here so you can compare your story against his. It cannot be played or overwritten.`
      : isNergis
      ? `A world of old wizards, stubborn trees and very good pie is waiting for you.<br>Make a hero who looks exactly the way you want — then find out what she does when it counts.`
      : `Your choices are yours alone. They will be remembered.`;

    const cont = $('#btnContinue');
    const runs = (S.playerData && !isArchive) ? Object.values(S.playerData.saves || {}).filter(r => r && !r.completed) : [];
    cont.style.display = runs.length ? 'inline-flex' : 'none';
    if (runs.length) {
      const r = runs.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0];
      cont.innerHTML = `▸ Continue — ${esc(r.char.name)}`;
      cont.onclick = () => resumeRun(r);
    }
    const newBtn = $('#btnNew');
    newBtn.style.display = isArchive ? 'none' : 'inline-flex';
    newBtn.onclick = () => { if (!S.player) return selectPlayer('nergis', true); goEpisodes(); };
    $('#btnChron').textContent = isArchive ? "Read Perry's chronicle" : 'The chronicle';
    $('#btnChron').onclick = () => { if (!S.player) return selectPlayer('nergis', true); openChronicle(); };
  }

  async function selectPlayer(name, thenEpisodes) {
    S.player = name;
    S.playerData = await loadPlayer(name);
    if (DB.mode !== 'local') { try { await DB.migrateLocalToCloud(name); S.playerData = await loadPlayer(name); } catch (e) {} }
    if (!S.roster.includes(name)) S.roster.push(name);
    renderStart();
    if (thenEpisodes) goEpisodes();
  }

  function promptNewPlayer() {
    modal({
      title: 'Who else is playing?',
      body: `<div class="field"><label>Player name</label><input class="input" id="npName" placeholder="Brian" maxlength="24" autocomplete="off"></div>
             <p style="font-size:13.5px;color:var(--ink-faint);margin:0">Each player gets their own characters, their own saves, and their own chronicle of choices.</p>`,
      actions: [
        { label: 'Cancel', cls: 'ghost', fn: closeModal },
        { label: 'Add player', cls: 'primary', fn: async () => {
            const v = $('#npName').value.trim();
            if (!v) return;
            const key = v.toLowerCase().replace(/[^a-z0-9_-]/g, '');
            if (!key) return;
            closeModal();
            S.player = key;
            S.playerData = await loadPlayer(key, v);
            S.playerData.display = v;
            if (!S.roster.includes(key)) S.roster.push(key);
            await persist(true);
            renderStart();
          } }
      ]
    });
    setTimeout(() => { const i = $('#npName'); if (i) i.focus(); }, 60);
  }

  /* ============================================================
     EPISODE SELECT
     ============================================================ */
  function goEpisodes() {
    renderEpisodes();
    show('episodes');
  }

  function renderEpisodes() {
    $('#epWho').textContent = S.playerData ? S.playerData.display : cap(S.player);
    const grid = $('#epGrid');
    let html = '';

    TDM.EPISODE_ORDER.forEach(id => {
      const ep = TDM.EPISODES[id];
      const run = S.playerData.saves[id];
      const done = run && run.completed;
      const prog = run && !run.completed;
      html += `
      <div class="ep-card playable" data-ep="${esc(id)}">
        <div class="ep-cover ${esc(ep.cover)}">
          <span class="emoji">🥧</span>
          <span class="ep-badge ${done ? 'done' : prog ? 'prog' : ''}">${done ? 'Completed' : prog ? 'In progress' : 'Episode ' + ep.number}</span>
        </div>
        <div class="ep-body">
          <h3>${esc(ep.title)}</h3>
          <div class="ep-meta">Episode ${ep.number} · ${esc(ep.levels)} · ${esc(ep.length)}</div>
          <p>${esc(ep.blurb)}</p>
          ${prog ? `<div class="ep-progress">▸ ${esc(run.char.name)} — ${run.choices.length} choice${run.choices.length === 1 ? '' : 's'} made</div>` : ''}
          ${done ? `<div class="ep-progress">✓ Finished with ${esc(run.char.name)} — ${run.majors.length} defining moment${run.majors.length === 1 ? '' : 's'}</div>` : ''}
          <div class="ep-credit">${esc(ep.credit)}</div>
          <div class="ep-foot">
            ${prog ? `<button class="btn primary sm" data-act="resume">▸ Continue</button><button class="btn ghost sm" data-act="restart">Start over</button>`
                   : done ? `<button class="btn primary sm" data-act="new">Play again</button><button class="btn ghost sm" data-act="chron">View choices</button>`
                          : `<button class="btn primary sm" data-act="new">Begin episode</button>`}
          </div>
        </div>
      </div>`;
    });

    (TDM.COMING_SOON || []).forEach(cs => {
      const secret = !cs.title || cs.title === '???';
      html += `
      <div class="ep-card locked${secret ? ' secret' : ''}">
        <div class="ep-cover soon"><span class="emoji">${secret ? '✉️' : '🔒'}</span><span class="ep-badge">Episode ${cs.number}</span></div>
        <div class="ep-body">
          <h3>${secret ? '<span class="qmark">???</span>' : esc(cs.title)}</h3>
          <div class="ep-meta">${esc(cs.eta || 'Coming soon')}</div>
          <p>${secret
              ? '<span class="redact">The Dungeon Master has not written this one yet.</span>'
              : esc(cs.blurb)}</p>
          <div class="ep-foot"><button class="btn sm" disabled>${secret ? 'Sealed' : 'Locked'}</button></div>
        </div>
      </div>`;
    });

    grid.innerHTML = html;

    $$('#epGrid .ep-card.playable').forEach(card => {
      const id = card.dataset.ep;
      card.querySelectorAll('[data-act]').forEach(b => {
        b.onclick = (ev) => {
          ev.stopPropagation();
          const act = b.dataset.act;
          if (act === 'resume') resumeRun(S.playerData.saves[id]);
          else if (act === 'chron') openChronicle();
          else if (act === 'restart') confirmRestart(id);
          else startNewRun(id);
        };
      });
      card.onclick = () => {
        const run = S.playerData.saves[id];
        if (run && !run.completed) resumeRun(run); else startNewRun(id);
      };
    });

    $('#epBack').onclick = () => { renderStart(); show('start'); };
  }

  function confirmRestart(epId) {
    modal({
      title: 'Start this episode over?',
      body: `<p>Your current run will be erased — every choice, every roll, every consequence. This cannot be undone.</p><p style="color:var(--wine)"><b>The chronicle of what already happened will be lost too.</b></p>`,
      actions: [
        { label: 'Keep playing', cls: 'ghost', fn: closeModal },
        { label: 'Erase and restart', cls: 'wine', fn: async () => { closeModal(); delete S.playerData.saves[epId]; await persist(true); startNewRun(epId); } }
      ]
    });
  }

  /* ============================================================
     CHARACTER CREATION
     ============================================================ */
  function startNewRun(epId) {
    S.episode = TDM.EPISODES[epId];
    const chars = Object.values(S.playerData.characters || {});
    if (chars.length) {
      modal({
        title: 'Who is playing this episode?',
        body: `<p>You already have ${chars.length === 1 ? 'a hero' : 'heroes'}. Bring one back — they keep their level and everything they earned — or make someone new.</p>
               <div style="display:flex;flex-direction:column;gap:9px;margin-top:6px">
               ${chars.map(c => `<button class="btn block" data-char="${esc(c.id)}" style="justify-content:flex-start;text-align:left">
                 <span style="font-family:var(--display);font-size:16px">${esc(c.name)}</span>
                 <span style="font-size:12.5px;color:var(--ink-faint);margin-left:auto">Level ${c.level} ${esc((OPT.RACES.find(r => r.id === c.race) || {}).name || '')} ${esc(classLabel(c))}</span>
               </button>`).join('')}
               </div>`,
        actions: [
          { label: 'Create someone new', cls: 'primary', fn: () => { closeModal(); openCreator(); } },
          { label: 'Cancel', cls: 'ghost', fn: closeModal }
        ]
      });
      setTimeout(() => {
        $$('#modal [data-char]').forEach(b => b.onclick = () => { closeModal(); beginRun(S.playerData.characters[b.dataset.char]); });
      }, 40);
    } else openCreator();
  }

  function openCreator() {
    S.draft = {
      id: 'ch_' + E.util.uid(),
      name: '', pronouns: { subject: 'she', object: 'her', possessive: 'her', is: 'is' },
      race: null, ancestry: null, class: null, subclass: null, origin: null,
      stats: { STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8 },
      look: null, backstory: '', quirk: '',
      level: 1, xp: 0, episodesCompleted: [], createdAt: Date.now()
    };
    S.step = 0;
    S.appTab = 'body';
    renderCreator();
    show('create');
  }

  function renderCreator() {
    $('#ccSteps').innerHTML = STEPS.map((s, i) =>
      `<div class="cc-step ${i === S.step ? 'on' : i < S.step ? 'done' : ''}">${esc(s)}</div>`).join('');
    const body = $('#ccBody');
    body.innerHTML = [stepIdentity, stepRace, stepClass, stepSubclass, stepOrigin, stepAbilities, stepAppearance, stepStory, stepReview][S.step]();
    [wireIdentity, wireRace, wireClass, wireSubclass, wireOrigin, wireAbilities, wireAppearance, wireStory, wireReview][S.step]();
    renderPreview();
    renderCcNav();
  }

  function renderCcNav() {
    const nav = $('#ccNav');
    const last = S.step === STEPS.length - 1;
    nav.innerHTML =
      `<button class="btn ghost" id="ccBack">${S.step === 0 ? '← Episodes' : '← Back'}</button>
       <button class="btn primary" id="ccNext" ${canAdvance() ? '' : 'disabled'}>${last ? "Begin the adventure ▸" : 'Continue →'}</button>`;
    $('#ccBack').onclick = () => { if (S.step === 0) { renderEpisodes(); show('episodes'); } else { S.step--; renderCreator(); } };
    $('#ccNext').onclick = () => {
      if (!canAdvance()) return;
      if (S.step === STEPS.length - 1) finishCreation();
      else { S.step++; ensureLook(); renderCreator(); }
    };
  }

  function canAdvance() {
    const d = S.draft;
    switch (S.step) {
      case 0: return d.name.trim().length > 0;
      case 1: return !!d.race;
      case 2: return !!d.class;
      case 3: return !!d.subclass;
      case 4: return !!d.origin;
      case 5: return pointsLeft() === 0;
      default: return true;
    }
  }

  function ensureLook() {
    const d = S.draft;
    if (!d.race || !d.class) return;
    if (!d.look) d.look = TDM.avatar.defaultsFor(d.race, d.class);
    d.look.race = d.race;
    d.look.ancestry = d.ancestry;
    const race = OPT.RACES.find(r => r.id === d.race);
    if (race.look.customHead) d.look.hairStyle = d.look.hairStyle || 'short';
  }

  function renderPreview() {
    const d = S.draft;
    const box = $('#ccPortrait');
    if (d.look) box.innerHTML = TDM.avatar.svg(d.look, { width: 250 });
    else box.innerHTML = `<div style="width:250px;height:292px;border-radius:16px;display:flex;align-items:center;justify-content:center;background:rgba(201,178,138,.25);border:2px dashed var(--edge-dark);color:var(--ink-faint);font-size:14px;text-align:center;padding:20px">Choose a race and class<br>to see your hero</div>`;

    const race = OPT.RACES.find(r => r.id === d.race);
    const cls = OPT.CLASSES.find(c => c.id === d.class);
    $('#ccNamePrev').innerHTML = `<div class="nm">${esc(d.name || 'Unnamed Hero')}</div>
      <div class="rc">${race ? esc(race.name) : '—'} ${cls ? esc(classLabel(d)) : ''}</div>`;

    const fin = finalStats();
    $('#ccStatsMini').innerHTML = Object.keys(OPT.ABILITIES).map(k => {
      const v = fin[k], m = Math.floor((v - 10) / 2);
      return `<div class="cc-stat-mini"><div class="k">${k}</div><div class="v">${v}</div><div class="m">${m >= 0 ? '+' : ''}${m}</div></div>`;
    }).join('');
  }

  function subOf(char) {
    return ((OPT.SUBCLASSES || {})[char && char.class] || []).find(x => x.id === (char && char.subclass)) || null;
  }
  /* "Elf Gunslinger" reads better than "Elf Fighter" once a path is chosen. */
  function classLabel(char) {
    const cls = OPT.CLASSES.find(c => c.id === (char && char.class));
    const sc = subOf(char);
    if (!cls) return '';
    return sc ? sc.name : cls.name;
  }

  function finalStats() {
    const d = S.draft, out = {};
    const race = OPT.RACES.find(r => r.id === d.race);
    Object.keys(OPT.ABILITIES).forEach(k => out[k] = (d.stats[k] || 8) + ((race && race.bonuses[k]) || 0));
    return out;
  }
  function pointsLeft() {
    let spent = 0;
    Object.values(S.draft.stats).forEach(v => spent += (POINT_COST[v] || 0));
    return POINT_BUDGET - spent;
  }

  /* ---------- step 0: identity ---------- */
  function stepIdentity() {
    const sug = OPT.NAME_SUGGESTIONS.slice().sort(() => Math.random() - .5).slice(0, 6);
    return `<div class="cc-panel">
      <h3>Who are you?</h3>
      <p class="hint">Every legend starts with a name. This is the hero you'll carry through every episode — she grows, she remembers, and so does the world.</p>
      <div class="field">
        <label>Character name</label>
        <input class="input" id="fName" value="${esc(S.draft.name)}" placeholder="Speak it aloud — does it sound like a hero?" maxlength="28" autocomplete="off">
      </div>
      <div class="sparks">${sug.map(n => `<button class="chip" data-sug="${esc(n)}">${esc(n)}</button>`).join('')}</div>
      <div class="field">
        <label>How should the story refer to you?</label>
        <div class="chips" id="pronChips">
          ${[['she', 'she / her'], ['he', 'he / him'], ['they', 'they / them']].map(([k, l]) =>
            `<button class="chip${S.draft.pronouns.subject === k ? ' on' : ''}" data-pron="${k}">${l}</button>`).join('')}
        </div>
      </div>
    </div>`;
  }
  function wireIdentity() {
    const inp = $('#fName');
    inp.oninput = () => { S.draft.name = inp.value; renderPreview(); $('#ccNext').disabled = !canAdvance(); };
    $$('[data-sug]').forEach(b => b.onclick = () => { S.draft.name = b.dataset.sug; inp.value = b.dataset.sug; renderPreview(); $('#ccNext').disabled = !canAdvance(); });
    $$('[data-pron]').forEach(b => b.onclick = () => {
      const k = b.dataset.pron;
      S.draft.pronouns = k === 'she' ? { subject: 'she', object: 'her', possessive: 'her', is: 'is' }
        : k === 'he' ? { subject: 'he', object: 'him', possessive: 'his', is: 'is' }
          : { subject: 'they', object: 'them', possessive: 'their', is: 'are' };
      $$('[data-pron]').forEach(x => x.classList.toggle('on', x === b));
    });
    setTimeout(() => inp.focus(), 50);
  }

  /* ---------- step 1: race ---------- */
  function stepRace() {
    const d = S.draft;
    const sel = OPT.RACES.find(r => r.id === d.race);
    return `<div class="cc-panel">
      <h3>What blood runs in you?</h3>
      <p class="hint">Your people shape your body, your gifts, and how the world greets you at the door.</p>
      <div class="opt-grid">
        ${OPT.RACES.map(r => `<button class="opt${d.race === r.id ? ' on' : ''}" data-race="${r.id}">
          <span class="oi">${r.icon}</span>
          <span class="on-name">${esc(r.name)}</span>
          <span class="otag">${esc(r.tagline)}</span>
          <div class="od">${esc(r.blurb)}</div>
          <div class="obonus">${Object.entries(r.bonuses).map(([k, v]) => `${k} +${v}`).join(' · ')}</div>
        </button>`).join('')}
      </div>
      ${sel ? `<div class="feature-list"><h4>${esc(sel.name)} features</h4>
        ${sel.features.map(f => `<div class="feature"><b>${esc(f.name)}.</b> ${esc(f.desc)}</div>`).join('')}
        ${(sel.perks || []).map(p => `<div class="feature"><b>${esc(p.name)}.</b> ${esc(p.desc)}</div>`).join('')}
        ${sel.ancestries ? `<div style="margin-top:14px"><label style="font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-faint);font-weight:600;display:block;margin-bottom:8px">Draconic ancestry</label>
          <div class="chips">${sel.ancestries.map(a => `<button class="chip${d.ancestry === a.id ? ' on' : ''}" data-anc="${a.id}"><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:${a.scale};margin-right:6px;vertical-align:-1px"></span>${esc(a.name)} · ${esc(a.breath)}</button>`).join('')}</div></div>` : ''}
      </div>` : ''}
    </div>`;
  }
  function wireRace() {
    $$('[data-race]').forEach(b => b.onclick = () => {
      S.draft.race = b.dataset.race;
      const r = OPT.RACES.find(x => x.id === b.dataset.race);
      S.draft.ancestry = r.ancestries ? (S.draft.ancestry || r.ancestries[0].id) : null;
      if (S.draft.look) { S.draft.look.race = r.id; S.draft.look.ancestry = S.draft.ancestry; }
      renderCreator();
    });
    $$('[data-anc]').forEach(b => b.onclick = () => {
      S.draft.ancestry = b.dataset.anc;
      if (S.draft.look) S.draft.look.ancestry = b.dataset.anc;
      renderCreator();
    });
  }

  /* ---------- step 2: class ---------- */
  function stepClass() {
    const d = S.draft;
    const sel = OPT.CLASSES.find(c => c.id === d.class);
    return `<div class="cc-panel">
      <h3>What do you do when it matters?</h3>
      <p class="hint">Your class is your answer to trouble — the thing your hands reach for without being told.</p>
      <div class="opt-grid">
        ${OPT.CLASSES.map(c => `<button class="opt${d.class === c.id ? ' on' : ''}" data-class="${c.id}">
          <span class="oi">${c.icon}</span>
          <span class="on-name">${esc(c.name)}</span>
          <span class="otag">${esc(c.tagline)}</span>
          <div class="od">${esc(c.blurb)}</div>
          <div class="oskills">Skilled in ${c.skills.map(s => OPT.SKILLS[s].name).join(' & ')}</div>
        </button>`).join('')}
      </div>
      ${sel ? `<div class="feature-list"><h4>${esc(sel.name)}</h4>
        <div class="feature"><b>Hit points.</b> ${sel.hp} + your Constitution modifier.</div>
        <div class="feature"><b>Weapon.</b> ${esc(sel.weaponName)}</div>
        <div class="feature"><b>${esc(sel.perk.name)}.</b> ${esc(sel.perk.desc)}</div>
        <div class="feature" style="margin-top:10px;color:var(--ink-faint);font-size:12.5px">Suggested spread: ${Object.entries(sel.recommended).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => k + ' ' + v).join(', ')} — you can use it as a shortcut on the next step.</div>
      </div>` : ''}
    </div>`;
  }
  function wireClass() {
    $$('[data-class]').forEach(b => b.onclick = () => {
      if (S.draft.class !== b.dataset.class) S.draft.subclass = null;  // a path belongs to its class
      S.draft.class = b.dataset.class;
      const cls = OPT.CLASSES.find(c => c.id === b.dataset.class);
      if (S.draft.look) {
        S.draft.look.outfit = cls.outfit;
        S.draft.look.weaponKind = cls.weapon;
        S.draft.look.outfitPrimary = cls.colors.primary;
        S.draft.look.outfitAccent = cls.colors.accent;
      }
      renderCreator();
    });
  }


  /* ---------- step 3: subclass / path ---------- */
  function stepSubclass() {
    const d = S.draft;
    const cls = OPT.CLASSES.find(c => c.id === d.class);
    const subs = (OPT.SUBCLASSES || {})[d.class] || [];
    const sel = subs.find(x => x.id === d.subclass);
    return `<div class="cc-panel">
      <h3>What kind of ${esc(cls ? cls.name : 'hero')} are you?</h3>
      <p class="hint">Two ${esc(cls ? cls.name.toLowerCase() : 'hero')}s can be nothing alike. Your path decides how you solve the problems your class hands you — and it gives you a second special ability on top of <b>${esc(cls ? cls.perk.name : '')}</b>.</p>
      <div class="opt-grid">
        ${subs.map(sc => `<button class="opt${d.subclass === sc.id ? ' on' : ''}" data-sub="${sc.id}">
          <span class="oi">${sc.icon}</span>
          <span class="on-name">${esc(sc.name)}</span>
          <span class="otag">${esc(sc.tagline)}</span>
          <div class="od">${esc(sc.blurb)}</div>
          <div class="oskills">${esc(sc.perk.name)}${sc.weaponName ? ' · carries a ' + esc(sc.weaponName) : ''}</div>
        </button>`).join('')}
      </div>
      ${sel ? `<div class="feature-list"><h4>${esc(cls.name)} — ${esc(sel.name)}</h4>
        <div class="feature"><b>${esc(cls.perk.name)}.</b> ${esc(cls.perk.desc)}</div>
        <div class="feature"><b>${esc(sel.perk.name)}.</b> ${esc(sel.perk.desc)}</div>
        ${sel.weaponName ? `<div class="feature"><b>Signature weapon.</b> You carry a ${esc(sel.weaponName)} instead of the usual ${esc(cls.weaponName)}.</div>` : ''}
        ${sel.tag ? `<div class="feature"><b>Doors only you can open.</b> Some moments in the story will offer you choices no one else gets.</div>` : ''}
      </div>` : ''}
    </div>`;
  }
  function wireSubclass() {
    $$('[data-sub]').forEach(b => b.onclick = () => {
      S.draft.subclass = b.dataset.sub;
      const subs = (OPT.SUBCLASSES || {})[S.draft.class] || [];
      const sc = subs.find(x => x.id === b.dataset.sub);
      if (sc && sc.weapon && S.draft.look) S.draft.look.weaponKind = sc.weapon;
      else if (S.draft.look) {
        const cls = OPT.CLASSES.find(c => c.id === S.draft.class);
        if (cls) S.draft.look.weaponKind = cls.weapon;
      }
      renderCreator();
    });
  }

  /* ---------- step 4: origin ---------- */
  function stepOrigin() {
    const d = S.draft;
    const sel = OPT.ORIGINS.find(o => o.id === d.origin);
    return `<div class="cc-panel">
      <h3>Where do you come from?</h3>
      <p class="hint">Your past is not decoration. It opens doors mid-story that nothing else can — and the world will call back to it.</p>
      <div class="opt-grid">
        ${OPT.ORIGINS.map(o => `<button class="opt${d.origin === o.id ? ' on' : ''}" data-origin="${o.id}">
          <span class="oi">${o.icon}</span>
          <span class="on-name">${esc(o.name)}</span>
          <span class="otag">${esc(o.tagline)}</span>
          <div class="od">${esc(o.blurb)}</div>
          <div class="oskills">${o.skills.map(s => OPT.SKILLS[s].name).join(' & ')} · ${esc(TDM.ITEMS[o.item].name)}</div>
        </button>`).join('')}
      </div>
      ${sel ? `<div class="feature-list"><h4>What ${esc(sel.name)} gives you</h4>
        <div class="feature"><b>In the story.</b> ${esc(sel.hook)}</div>
        <div class="feature"><b>You carry.</b> ${TDM.ITEMS[sel.item].icon} ${esc(TDM.ITEMS[sel.item].name)} — ${esc(TDM.ITEMS[sel.item].desc)}</div>
      </div>` : ''}
    </div>`;
  }
  function wireOrigin() {
    $$('[data-origin]').forEach(b => b.onclick = () => { S.draft.origin = b.dataset.origin; renderCreator(); });
  }

  /* ---------- step 4: abilities ---------- */
  function stepAbilities() {
    const d = S.draft;
    const race = OPT.RACES.find(r => r.id === d.race);
    const left = pointsLeft();
    return `<div class="cc-panel">
      <h3>What are you made of?</h3>
      <p class="hint">Spend 27 points. Higher scores cost more — 14 and 15 are expensive on purpose. These numbers decide what you can attempt when the dice come out.</p>
      <div class="points-left ${left === 0 ? 'zero' : ''}">${left === 0 ? '✓ All points spent' : `${left} point${left === 1 ? '' : 's'} left to spend`}</div>
      <div style="margin-bottom:16px"><button class="btn sm ghost" id="useRec">Use ${esc((OPT.CLASSES.find(c => c.id === d.class) || {}).name || '')} suggestion</button>
      <button class="btn sm ghost" id="resetAb">Reset</button></div>
      <div class="abil-grid">
        ${Object.entries(OPT.ABILITIES).map(([k, a]) => {
          const base = d.stats[k], bonus = (race && race.bonuses[k]) || 0, tot = base + bonus, mod = Math.floor((tot - 10) / 2);
          const upCost = POINT_COST[base + 1] != null ? POINT_COST[base + 1] - POINT_COST[base] : null;
          return `<div class="abil">
            <div class="abil-top"><span class="ai">${a.icon}</span><span class="an">${esc(a.name)}</span>
              ${bonus ? `<span class="abil-race">${esc(race.name)} +${bonus}</span>` : ''}</div>
            <div class="abil-blurb">${esc(a.blurb)}</div>
            <div class="abil-ctl">
              <button class="stepper" data-dn="${k}" ${base <= 8 ? 'disabled' : ''}>−</button>
              <span class="abil-val">${tot}</span>
              <button class="stepper" data-up="${k}" ${(base >= 15 || upCost == null || upCost > left) ? 'disabled' : ''}>+</button>
              <span class="abil-mod">${mod >= 0 ? '+' : ''}${mod}</span>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }
  function wireAbilities() {
    $$('[data-up]').forEach(b => b.onclick = () => {
      const k = b.dataset.up, v = S.draft.stats[k];
      const cost = POINT_COST[v + 1] - POINT_COST[v];
      if (v < 15 && cost <= pointsLeft()) { S.draft.stats[k] = v + 1; renderCreator(); }
    });
    $$('[data-dn]').forEach(b => b.onclick = () => {
      const k = b.dataset.dn;
      if (S.draft.stats[k] > 8) { S.draft.stats[k]--; renderCreator(); }
    });
    const rec = $('#useRec');
    if (rec) rec.onclick = () => {
      const cls = OPT.CLASSES.find(c => c.id === S.draft.class);
      if (cls) { S.draft.stats = Object.assign({}, cls.recommended); renderCreator(); }
    };
    const rst = $('#resetAb');
    if (rst) rst.onclick = () => { S.draft.stats = { STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8 }; renderCreator(); };
  }

  /* ---------- step 5: appearance ---------- */
  function stepAppearance() {
    ensureLook();
    const L = S.draft.look, race = OPT.RACES.find(r => r.id === S.draft.race);
    const tabs = [['body', 'Body & Skin'], ['hair', 'Hair'], ['face', 'Face'], ['outfit', 'Outfit'], ['extras', 'Extras'], ['scene', 'Backdrop']];
    let panel = '';

    if (S.appTab === 'body') {
      panel = sec('Build', chips(APP.builds, L.build, 'build'))
        + sec('Skin tone', swatches(APP.skinTones, L.skin, 'skin'))
        + (race.look.customHead ? sec('Scale color', chips((race.ancestries || []), S.draft.ancestry, 'ancestry')) : '')
        + (race.look.customHead ? sec('Head crest', chips([{ id: 'none', name: 'None' }, { id: 'fin', name: 'Dorsal Fin' }, { id: 'frills', name: 'Cheek Frills' }], L.crest, 'crest')) : '')
        + (race.look.horns ? sec('Horns', chips([{ id: 'curved', name: 'Curved Back' }, { id: 'swept', name: 'Swept Wide' }, { id: 'crown', name: 'Crown of Points' }], L.horns, 'horns')) : '');
    } else if (S.appTab === 'hair') {
      panel = race.look.customHead
        ? `<p class="hint">Dragonborn have scales rather than hair — try the Body tab for crests and scale color.</p>`
        : sec('Style', chips(APP.hairStyles, L.hairStyle, 'hairStyle'))
        + sec('Color', swatches(APP.hairColors, L.hairColor, 'hairColor'))
        + (race.look.beardOption ? sec('Beard', chips([{ id: 'no', name: 'Clean-shaven' }, { id: 'yes', name: 'Full Beard' }], L.beard ? 'yes' : 'no', 'beard')) : '');
    } else if (S.appTab === 'face') {
      panel = sec('Eye color', swatches(APP.eyeColors, L.eyes, 'eyes'))
        + sec('Expression', chips(APP.mouths, L.mouth, 'mouth'))
        + sec('Freckles', chips(APP.freckles, L.freckles, 'freckles'))
        + sec('Blush', chips([{ id: 'no', name: 'None' }, { id: 'yes', name: 'Rosy Cheeks' }], L.blush ? 'yes' : 'no', 'blush'))
        + sec('Scars', chips(APP.scars, L.scar, 'scar'))
        + sec('Face paint', swatches(APP.warpaints.filter(w => w.hex), L.warpaint, 'warpaint', true));
    } else if (S.appTab === 'outfit') {
      panel = sec('Outfit', chips(APP.outfits, L.outfit, 'outfit'))
        + sec('Main color', swatches(APP.outfitColors, L.outfitPrimary, 'outfitPrimary'))
        + sec('Trim & accent', swatches(APP.outfitColors, L.outfitAccent, 'outfitAccent'))
        + sec('Cape', chips(APP.capes, L.cape, 'cape'))
        + (L.cape !== 'none' ? sec('Cape color', swatches(APP.outfitColors, L.capeColor, 'capeColor')) : '');
    } else if (S.appTab === 'extras') {
      panel = sec('Glasses', chips(APP.glassesOptions, L.glasses, 'glasses'))
        + sec('Earrings', chips(APP.earrings, L.earrings, 'earrings'))
        + sec('Show weapon', chips([{ id: 'yes', name: 'Yes' }, { id: 'no', name: 'Hidden' }], L.weapon === false ? 'no' : 'yes', 'weapon'));
    } else {
      panel = sec('Portrait backdrop', chips(APP.backdrops, L.backdrop, 'backdrop'));
    }

    return `<div class="cc-panel">
      <h3>What do you look like?</h3>
      <p class="hint">Take your time here. This portrait follows you through every episode, and it's yours to fuss over.</p>
      <div class="app-tabs">${tabs.map(([k, l]) => `<button class="app-tab${S.appTab === k ? ' on' : ''}" data-tab="${k}">${l}</button>`).join('')}</div>
      ${panel}
      <div style="margin-top:20px;display:flex;gap:9px;flex-wrap:wrap">
        <button class="btn sm ghost" id="randLook">🎲 Surprise me</button>
        <button class="btn sm ghost" id="resetLook">Reset to class default</button>
      </div>
    </div>`;
  }
  function sec(label, inner) { return `<div class="app-section"><label>${esc(label)}</label>${inner}</div>`; }
  function chips(list, cur, key) {
    return `<div class="chips">${list.map(o => `<button class="chip${cur === o.id ? ' on' : ''}" data-set="${key}" data-val="${esc(o.id)}">${esc(o.name)}</button>`).join('')}</div>`;
  }
  function swatches(list, cur, key) {
    return `<div class="swatches">${list.map(o => `<button class="sw${cur === o.id || cur === o.hex ? ' on' : ''}" style="background:${o.hex}" title="${esc(o.name)}" data-set="${key}" data-val="${esc(o.id)}"><span class="sr">${esc(o.name)}</span></button>`).join('')}</div>`;
  }
  function wireAppearance() {
    $$('[data-tab]').forEach(b => b.onclick = () => { S.appTab = b.dataset.tab; renderCreator(); });
    $$('[data-set]').forEach(b => b.onclick = () => {
      const k = b.dataset.set, v = b.dataset.val;
      const L = S.draft.look;
      if (k === 'beard') L.beard = (v === 'yes');
      else if (k === 'blush') L.blush = (v === 'yes');
      else if (k === 'weapon') L.weapon = (v === 'yes');
      else if (k === 'ancestry') { S.draft.ancestry = v; L.ancestry = v; }
      else L[k] = v;
      renderCreator();
    });
    const r = $('#randLook');
    if (r) r.onclick = () => { S.draft.look = TDM.avatar.randomLook(S.draft.race, S.draft.class); S.draft.look.ancestry = S.draft.ancestry; renderCreator(); };
    const rs = $('#resetLook');
    if (rs) rs.onclick = () => { S.draft.look = TDM.avatar.defaultsFor(S.draft.race, S.draft.class); S.draft.look.ancestry = S.draft.ancestry; renderCreator(); };
  }

  /* ---------- step 6: story ---------- */
  function stepStory() {
    return `<div class="cc-panel">
      <h3>Where have you been?</h3>
      <p class="hint">Optional — but the Dungeon Master reads it. Write a line or a page, or press the sparks below and let fate suggest something.</p>
      <div class="field">
        <label>Backstory</label>
        <textarea class="input" id="fBack" placeholder="She was the quiet one in a family of eleven...">${esc(S.draft.backstory)}</textarea>
      </div>
      <div class="sparks">
        <button class="btn sm ghost" id="sparkBack">✦ Suggest a backstory</button>
        <button class="btn sm ghost" id="clearBack">Clear</button>
      </div>
      <div class="field" style="margin-top:22px">
        <label>A small quirk (optional)</label>
        <input class="input" id="fQuirk" value="${esc(S.draft.quirk)}" placeholder="Apologizes to doors before picking their locks." maxlength="90">
      </div>
      <div class="sparks">${OPT.QUIRKS.slice().sort(() => Math.random() - .5).slice(0, 4).map(q => `<button class="chip" data-quirk="${esc(q)}">${esc(q)}</button>`).join('')}</div>
    </div>`;
  }
  function wireStory() {
    const ta = $('#fBack'), qi = $('#fQuirk');
    ta.oninput = () => S.draft.backstory = ta.value;
    qi.oninput = () => S.draft.quirk = qi.value;
    $('#sparkBack').onclick = () => {
      const B = OPT.BACKSTORY_SPARKS, pick = a => a[Math.floor(Math.random() * a.length)];
      const t = `${pick(B.openers)}, ${pick(B.middles)}, ${pick(B.closers)}`;
      S.draft.backstory = t.charAt(0).toUpperCase() + t.slice(1);
      ta.value = S.draft.backstory;
    };
    $('#clearBack').onclick = () => { S.draft.backstory = ''; ta.value = ''; };
    $$('[data-quirk]').forEach(b => b.onclick = () => { S.draft.quirk = b.dataset.quirk; qi.value = b.dataset.quirk; });
  }

  /* ---------- step 7: review ---------- */
  function stepReview() {
    const d = S.draft;
    const race = OPT.RACES.find(r => r.id === d.race), cls = OPT.CLASSES.find(c => c.id === d.class), org = OPT.ORIGINS.find(o => o.id === d.origin);
    const fin = finalStats();
    const tmp = Object.assign({}, d, { stats: fin });
    const hp = E.maxHpFor(tmp);
    const skills = new Set([].concat(cls.skills, org.skills));
    return `<div class="cc-panel">
      <h3>${esc(d.name)}</h3>
      <p class="hint">This is your hero. Once the adventure begins, her choices are permanent — so give her one last look.</p>
      <div class="review-grid">
        <div class="rev"><div class="rk">People</div><div class="rv">${race.icon} ${esc(race.name)}</div><div class="rd">${esc(race.tagline)}</div></div>
        <div class="rev"><div class="rk">Calling</div><div class="rv">${cls.icon} ${esc(cls.name)}</div><div class="rd">${esc(cls.tagline)}</div></div>
        ${subOf(d) ? `<div class="rev"><div class="rk">Path</div><div class="rv">${subOf(d).icon} ${esc(subOf(d).name)}</div><div class="rd">${esc(subOf(d).tagline)}</div></div>` : ''}
        <div class="rev"><div class="rk">Origin</div><div class="rv">${org.icon} ${esc(org.name)}</div><div class="rd">${esc(org.tagline)}</div></div>
        <div class="rev"><div class="rk">Hit points</div><div class="rv">❤️ ${hp}</div><div class="rd">Level ${d.level}</div></div>
      </div>
      <div class="feature-list">
        <h4>Trained skills</h4>
        <div style="display:flex;flex-wrap:wrap;gap:8px">${Array.from(skills).map(s => `<span class="chip on" style="cursor:default">${OPT.SKILLS[s].icon} ${esc(OPT.SKILLS[s].name)}</span>`).join('')}</div>
      </div>
      <div class="feature-list" style="margin-top:14px">
        <h4>Once per episode</h4>
        <div class="feature"><b>${esc(cls.perk.name)}.</b> ${esc(cls.perk.desc)}</div>
        ${subOf(d) ? `<div class="feature"><b>${esc(subOf(d).perk.name)}.</b> ${esc(subOf(d).perk.desc)}</div>` : ''}
        ${(race.perks || []).map(p => `<div class="feature"><b>${esc(p.name)}.</b> ${esc(p.desc)}</div>`).join('')}
      </div>
      <div class="feature-list" style="margin-top:14px">
        <h4>You set out carrying</h4>
        <div class="feature">${TDM.ITEMS[org.item].icon} <b>${esc(TDM.ITEMS[org.item].name)}</b> — ${esc(TDM.ITEMS[org.item].desc)}</div>
        <div class="feature">${TDM.ITEMS.travelers_pack.icon} <b>Traveler's Pack</b> — ${esc(TDM.ITEMS.travelers_pack.desc)}</div>
        <div class="feature">🪙 <b>25 gold pieces</b></div>
      </div>
      ${d.backstory ? `<div class="feature-list" style="margin-top:14px"><h4>Her story so far</h4><div style="font-size:14.5px;line-height:1.75;white-space:pre-wrap">${esc(d.backstory)}</div></div>` : ''}
      ${d.quirk ? `<div class="feature-list" style="margin-top:14px"><h4>Quirk</h4><div class="feature">${esc(d.quirk)}</div></div>` : ''}
    </div>`;
  }
  function wireReview() {}

  async function finishCreation() {
    const d = S.draft;
    const cls = OPT.CLASSES.find(c => c.id === d.class), org = OPT.ORIGINS.find(o => o.id === d.origin);
    const subDef = ((OPT.SUBCLASSES || {})[d.class] || []).find(x => x.id === d.subclass);
    const subWeaponItem = { revolver: 'revolver' }[subDef && subDef.weapon];
    const weaponItem = { fighter: 'longsword', rogue: 'twin_daggers', wizard: 'arcane_staff', cleric: 'blessed_mace', bard: 'beloved_lute', ranger: 'longbow', barbarian: 'greataxe', druid: 'mistletoe_sickle', paladin: 'sword_and_shield', monk: 'quarterstaff', warlock: 'pact_wand', sorcerer: 'storm_orb' }[cls.id];
    const char = {
      id: d.id, name: d.name.trim(), pronouns: d.pronouns,
      race: d.race, ancestry: d.ancestry, class: d.class, subclass: d.subclass, origin: d.origin,
      stats: finalStats(), look: d.look, backstory: d.backstory, quirk: d.quirk,
      level: 1, xp: 0, episodesCompleted: [],
      startItems: [org.item, subWeaponItem || weaponItem, 'travelers_pack'].filter(Boolean),
      startGold: 25, createdAt: Date.now()
    };
    S.playerData.characters[char.id] = char;
    await persist(true);
    beginRun(char);
  }

  /* ============================================================
     RUN LIFECYCLE
     ============================================================ */
  function beginRun(char) {
    const ep = S.episode || TDM.EPISODES[TDM.EPISODE_ORDER[0]];
    S.episode = ep;
    S.save = E.newSave(ep, char, S.playerData.display);
    E.enterScene(S.save, ep, ep.start);
    S.playerData.saves[ep.id] = S.save;
    persist(true);
    show('game');
    renderScene();
  }

  function resumeRun(run) {
    S.save = run;
    S.episode = TDM.EPISODES[run.episodeId];
    if (!S.episode) { toast({ type: 'note', text: 'That episode is no longer available.' }); return; }
    show('game');
    renderScene();
    toast({ type: 'note', text: `Welcome back. ${run.char.name} is exactly where you left her.` });
  }

  /* ============================================================
     GAME RENDER
     ============================================================ */
  function renderScene() {
    const save = S.save, ep = S.episode;
    const scene = ep.scenes[save.sceneId];
    if (!scene) { console.error('missing scene', save.sceneId); return; }
    const V = E.view(save);

    $('#gEpTitle').innerHTML = `${esc(ep.title)}<small>Episode ${ep.number} · ${esc(scene.title || '')}</small>`;

    const art = $('#sceneArt');
    art.className = 'scene-art art-' + (scene.art || 'bakery');
    art.innerHTML = `<span class="art-emoji">${artEmoji(scene.art)}</span><div class="art-title">${esc(scene.title || '')}</div>`;

    const txt = typeof scene.text === 'function' ? scene.text(V) : scene.text;
    const paras = (Array.isArray(txt) ? txt : [txt]).filter(t => t && String(t).trim());
    $('#sceneText').innerHTML = paras.map(p => `<p>${esc(p)}</p>`).join('');

    renderChoices(scene);
    renderSidebar();
    save.updatedAt = Date.now();
    persist(true);
  }

  function artEmoji(a) {
    return ({ tower: '🧙', road: '🌾', boat: '⛵', bakery: '🏚️', mac: '🌳', orchard: '🍎', waste: '🍄',
      dock: '🛒', shop: '🏪', office: '📜', guardroom: '🛡️', floor: '🥧', stairs: '🪜', apartment: '🛏️', ko: '💫' }[a] || '🥧');
  }

  function renderChoices(scene) {
    const save = S.save, V = E.view(save);
    const box = $('#choices');
    const list = (scene.choices || []).filter(c => !c.if || c.if(V));
    if (!list.length) { box.innerHTML = ''; return; }

    let html = `<div class="choices-label"><span>What do you do?</span><span class="ln"></span></div>`;
    list.forEach((c) => {
      const realIdx = scene.choices.indexOf(c);
      const locked = E.choiceLocked(save, c);
      const special = !!c.req && !locked;
      let meta = '';
      if (c.check) {
        const preview = previewCheck(save, c.check);
        meta = `<span class="ccheck${preview.adv ? ' adv' : preview.dis ? ' dis' : ''}">${c.check.skill ? OPT.SKILLS[c.check.skill].icon : OPT.ABILITIES[c.check.stat].icon} ${esc(c.check.label || (c.check.skill ? OPT.SKILLS[c.check.skill].name : OPT.ABILITIES[c.check.stat].name))} · DC ${c.check.dc} · ${preview.mod >= 0 ? '+' : ''}${preview.mod}${preview.adv ? ' · advantage' : preview.dis ? ' · disadvantage' : ''}</span>`;
      }
      if (c.req) {
        const reqs = (Array.isArray(c.req) ? c.req : [c.req]).map(E.condLabel).join(' + ');
        meta += `<span class="creq">${locked ? '🔒 Requires ' + esc(reqs) : '✦ ' + esc(reqs) + ' only'}</span>`;
      }
      html += `<button class="choice${locked ? ' locked' : ''}${special ? ' special' : ''}" data-choice="${realIdx}" ${locked ? 'disabled' : ''}>
        <span class="ctext">${esc(c.text)}</span>
        ${c.hint ? `<span class="chint">${esc(c.hint)}</span>` : ''}
        ${meta}
      </button>`;
    });
    html += `<div class="choice-warn"><span>⚠</span><span>Whatever you choose, you cannot take it back. The story remembers.</span></div>`;
    box.innerHTML = html;

    $$('#choices .choice:not(.locked)').forEach(b => b.onclick = () => onChoice(parseInt(b.dataset.choice, 10)));
  }

  function previewCheck(save, def) {
    const mods = E.abilityMods(save.char);
    let mod = mods[def.stat] || 0;
    if (def.skill && E.profSkills(save.char).has(def.skill)) mod += E.profBonus(save.level);
    let adv = !!def.adv, dis = !!def.dis;
    (def.advIf || []).forEach(c => { if (E.evalCond(save, c)) adv = true; });
    (def.disIf || []).forEach(c => { if (E.evalCond(save, c)) dis = true; });
    if (save.char.race === 'elf' && def.skill === 'perception') adv = true;
    if (save.char.race === 'half_orc' && def.skill === 'intimidation') adv = true;
    if (save.poisoned > 0) dis = true;
    if (adv && dis) { adv = false; dis = false; }
    return { mod, adv, dis };
  }

  /* ---------- choice resolution ---------- */
  function onChoice(idx) {
    const save = S.save, ep = S.episode;
    const plan = E.planChoice(save, ep, save.sceneId, idx);
    if (!plan) return;
    if (plan.kind === 'plain') {
      const r = E.commit(save, ep, save.sceneId, idx, plan, null);
      afterCommit(r, plan);
      return;
    }
    const result = E.makeCheck(save, plan.check);
    S.pending = { idx, plan, result };
    showDice(plan.check, result);
  }

  function afterCommit(r, branch) {
    (r.res.toasts || []).forEach(t => toast(t, S.save));
    (r.res.saves || []).forEach(sv => toast({ type: 'save', roll: sv.roll, label: sv.label }));
    if (r.res.leveledUp) toast({ type: 'level', text: `Level ${S.save.level}! You feel steadier, sharper, harder to stop.` });
    if (branch && branch.goto === null) { endEpisode(); return; }
    if (S.save.flags.completed && S.save.sceneId === 'epilogue') { renderScene(); return; }
    renderScene();
  }

  /* ---------- dice overlay ---------- */
  function showDice(def, result) {
    const ov = $('#diceOverlay');
    ov.classList.add('show');
    const name = def.label || (def.skill ? OPT.SKILLS[def.skill].name : OPT.ABILITIES[def.stat].name);
    $('#diceName').textContent = name;
    $('#diceDc').textContent = `Difficulty ${def.dc} · your bonus ${result.mod >= 0 ? '+' : ''}${result.mod}`;
    $('#diceAdv').textContent = result.adv ? `Advantage — ${result.advSrc || 'rolling twice, keeping the best'}` : result.dis ? `Disadvantage — ${result.disSrc || 'rolling twice, keeping the worst'}` : '';
    $('#diceAdv').className = 'dice-adv ' + (result.adv ? 'adv' : result.dis ? 'dis' : '');
    $('#diceMath').innerHTML = '';
    $('#diceResult').innerHTML = '';
    $('#diceResult').className = 'dice-result';
    $('#diceFlavor').textContent = '';
    $('#diceActions').innerHTML = '';
    $('#perkOffer').innerHTML = '';

    const die = $('#d20');
    die.classList.add('rolling');
    $('#d20num').textContent = '';
    let tick = 0;
    const iv = setInterval(() => { $('#d20num').textContent = 1 + Math.floor(Math.random() * 20); tick++; }, 62);

    setTimeout(() => {
      clearInterval(iv);
      die.classList.remove('rolling');
      revealRoll(def, result);
    }, 680);
  }

  function revealRoll(def, result, isReroll) {
    $('#d20num').textContent = result.kept;
    const rollsTxt = result.d20s.length > 1 ? ` (rolled ${result.d20s.join(' and ')})` : '';
    $('#diceMath').innerHTML = `<b>${result.kept}</b>${rollsTxt} ${result.mod >= 0 ? '+' : '−'} ${Math.abs(result.mod)} = <b>${result.total}</b> vs DC ${result.dc}`;
    if (result.luckNote) $('#diceAdv').textContent = result.luckNote;

    const res = $('#diceResult');
    if (result.nat20) { res.textContent = '✦ CRITICAL SUCCESS ✦'; res.className = 'dice-result crit'; }
    else if (result.nat1) { res.textContent = '✦ CRITICAL FAILURE ✦'; res.className = 'dice-result crit'; }
    else { res.textContent = result.ok ? 'SUCCESS' : 'FAILURE'; res.className = 'dice-result ' + (result.ok ? 'ok' : 'no'); }
    $('#diceFlavor').textContent = flavor(result);

    const perks = result.ok ? [] : E.usablePerks(S.save, def);
    const acts = $('#diceActions');

    if (!result.ok && perks.length && !isReroll) {
      const p = perks[0];
      $('#perkOffer').innerHTML = `<div class="po-h">You still have one card to play</div>
        <div class="po-n">${esc(p.name)}</div><div class="po-d">${esc(p.desc)}</div>
        <div style="display:flex;gap:9px;flex-wrap:wrap"><button class="btn primary sm" id="usePerk">Use ${esc(p.name)}</button>
        <button class="btn ghost sm" id="acceptFail">Accept the failure</button></div>`;
      setTimeout(() => {
        $('#usePerk').onclick = () => {
          $('#perkOffer').innerHTML = '';
          const die = $('#d20'); die.classList.add('rolling');
          let iv2 = setInterval(() => $('#d20num').textContent = 1 + Math.floor(Math.random() * 20), 62);
          setTimeout(() => {
            clearInterval(iv2); die.classList.remove('rolling');
            const rr = E.perkReroll(S.save, Object.assign({}, def, { trigger: p.trigger }), p);
            const merged = Object.assign({}, result, rr, { adv: false, dis: false, nat20: rr.kept === 20, nat1: rr.kept === 1, luckNote: null });
            toast({ type: 'perk', text: `${p.name} spent.` });
            revealRoll(def, merged, true);
          }, 680);
        };
        $('#acceptFail').onclick = () => finishDice();
      }, 30);
      acts.innerHTML = '';
    } else {
      acts.innerHTML = `<button class="btn primary" id="diceGo">${result.ok ? 'Go on →' : 'Live with it →'}</button>`;
      setTimeout(() => { const g = $('#diceGo'); if (g) g.onclick = () => finishDice(result); }, 20);
    }
    S.pending.result = result;
  }

  function flavor(r) {
    if (r.nat20) return 'The dice have decided to be generous. Everything goes exactly right.';
    if (r.nat1) return 'The dice have decided to be funny. It goes wrong in a way you will be telling people about.';
    if (r.ok && r.total - r.dc >= 8) return 'Comfortably, elegantly done.';
    if (r.ok && r.total - r.dc <= 1) return 'By a hair. By the absolute width of a hair.';
    if (r.ok) return 'That works.';
    if (r.dc - r.total <= 1) return 'So close you can taste it. It is not enough.';
    return 'Not this time.';
  }

  function finishDice() {
    const ov = $('#diceOverlay');
    ov.classList.remove('show');
    const { idx, plan, result } = S.pending;
    const branch = result.ok ? plan.success : plan.fail;
    const r = E.commit(S.save, S.episode, S.save.sceneId, idx, branch, result);
    S.pending = null;
    afterCommit(r, branch);
  }

  /* ---------- sidebar ---------- */
  function renderSidebar() {
    const save = S.save, V = E.view(save), char = save.char;
    const cls = OPT.CLASSES.find(c => c.id === char.class), race = OPT.RACES.find(r => r.id === char.race);

    $('#sideHero').innerHTML = `<div class="hero-row">
      ${TDM.avatar.svg(char.look, { width: 66 })}
      <div class="hero-info">
        <div class="hn">${esc(char.name)}</div>
        <div class="hr">${esc(race.name)} ${esc(classLabel(char))}</div>
        ${subOf(char) ? `<div class="hsub">${subOf(char).icon} ${esc(cls.name)} · ${esc(subOf(char).name)}</div>` : ''}
        <div class="hl">Level ${save.level} · ${save.xp} XP</div>
      </div></div>
      <div style="margin-top:13px">
        <div class="stat-line"><span>Hit points</span><span class="sv">${save.hp} / ${save.maxHp}</span></div>
        <div class="bar hp ${save.hp / save.maxHp <= .34 ? 'low' : ''}"><div class="fill" style="width:${Math.max(0, Math.min(100, save.hp / save.maxHp * 100))}%"></div></div>
      </div>
      <div style="margin-top:11px">
        <div class="stat-line"><span>Experience</span><span class="sv">${save.xp}${E.XP_LEVELS[save.level] ? ' / ' + E.XP_LEVELS[save.level] : ''}</span></div>
        <div class="bar xp"><div class="fill" style="width:${xpPct(save)}%"></div></div>
      </div>
      ${save.poisoned > 0 ? `<div style="margin-top:11px;padding:8px 11px;border-radius:9px;background:rgba(90,120,60,.16);border:1px solid rgba(90,120,60,.32);font-size:12.5px;color:#4a6b2a"><b>☠ Poisoned</b> — disadvantage on checks (${save.poisoned} more scene${save.poisoned === 1 ? '' : 's'})</div>` : ''}
      <div class="mini-stats">
        ${Object.keys(OPT.ABILITIES).map(k => {
          const m = V.mod(k);
          return `<div class="ms"><div class="k">${k}</div><div class="v">${char.stats[k]}</div><div style="font-size:10px;color:var(--green);font-weight:700">${m >= 0 ? '+' : ''}${m}</div></div>`;
        }).join('')}
      </div>
      <div class="purse"><div class="p"><b>${save.gold}</b><span>Gold</span></div><div class="p"><b>${save.choices.length}</b><span>Choices</span></div></div>`;

    const items = save.items.filter(i => i.qty > 0);
    $('#sideInv').innerHTML = items.length
      ? items.map(i => {
        const d = TDM.ITEMS[i.id] || { name: i.id, icon: '📦', desc: '' };
        return `<div class="inv-item"><span class="ii">${d.icon}</span><div><div class="inm">${esc(d.name)}${i.qty > 1 ? ` <span class="iq">×${i.qty}</span>` : ''}</div><div class="idesc">${esc(d.desc || '')}</div></div></div>`;
      }).join('')
      : `<div class="inv-empty">Your pack is empty.</div>`;

    const bonds = Object.entries(save.bonds).filter(([, v]) => v !== 0);
    const bondCard = $('#sideBonds');
    if (bonds.length) {
      bondCard.style.display = '';
      $('#bondList').innerHTML = bonds.map(([k, v]) => {
        const pct = Math.min(50, Math.abs(v) * 8);
        return `<div class="bond"><span class="bn">${esc(k.replace(/_/g, ' '))}</span>
          <span class="bb"><i class="${v > 0 ? 'pos' : 'neg'}" style="${v > 0 ? `left:50%;width:${pct}%` : `right:50%;left:auto;width:${pct}%`}"></i></span>
          <span style="font-size:11.5px;font-weight:700;color:${v > 0 ? 'var(--ok)' : 'var(--bad)'};width:26px;text-align:right">${v > 0 ? '+' : ''}${v}</span></div>`;
      }).join('');
    } else bondCard.style.display = 'none';

    const perks = E.allPerks(char);
    $('#sidePerks').innerHTML = perks.map(p =>
      `<div class="perk-item${save.perksUsed[p.id] ? ' used' : ''}"><b>${esc(p.name)}</b>${esc(p.desc)}</div>`).join('')
      || `<div class="inv-empty">None.</div>`;

    $('#gBack').onclick = () => { renderStart(); show('start'); };
    $('#gEpisodes').onclick = () => { renderEpisodes(); show('episodes'); };
    $('#gChron').onclick = openChronicle;
  }

  function xpPct(save) {
    const cur = E.XP_LEVELS[save.level - 1] || 0, next = E.XP_LEVELS[save.level] || (cur + 300);
    return Math.max(0, Math.min(100, (save.xp - cur) / (next - cur) * 100));
  }

  /* ---------- toasts ---------- */
  function toast(t, save) {
    const box = $('#toasts');
    const el = document.createElement('div');
    let cls = 'toast', html = '';
    if (t.type === 'remember') {
      cls += ' remember';
      const who = (save && save.char.name) || (S.save && S.save.char.name) || 'The world';
      html = `<span class="ti">🖋️</span><span class="tt">${esc(who)} will remember that.</span>`;
    } else if (t.type === 'damage') { cls += ' dmg'; html = `<span class="ti">💔</span><span><b>−${t.amount} hit points</b>${t.detail ? `<span style="font-size:11.5px;color:var(--ink-faint)">rolled ${t.detail.join(', ')}</span>` : ''}</span>`; }
    else if (t.type === 'heal') { cls += ' heal'; html = `<span class="ti">💚</span><span><b>+${t.amount} hit points</b></span>`; }
    else if (t.type === 'gold') { cls += ' gold'; html = `<span class="ti">🪙</span><span><b>${t.amount > 0 ? '+' : ''}${t.amount} gold</b></span>`; }
    else if (t.type === 'item') { cls += ' item'; html = `<span class="ti">${t.icon}</span><span><b>Gained</b>${esc(t.text)}</span>`; }
    else if (t.type === 'bond') { html = `<span class="ti">${t.delta > 0 ? '💞' : '💢'}</span><span><b>${esc(cap(t.who.replace(/_/g, ' ')))}</b>${t.delta > 0 ? 'thinks better of you' : 'will not forget this'}</span>`; }
    else if (t.type === 'level') { cls += ' level'; html = `<span class="ti">⬆️</span><span><b>Level up!</b>${esc(t.text)}</span>`; }
    else if (t.type === 'perk') { html = `<span class="ti">✨</span><span>${esc(t.text)}</span>`; }
    else if (t.type === 'immune') { html = `<span class="ti">🛡️</span><span>${esc(t.text)}</span>`; }
    else if (t.type === 'save') {
      const r = t.roll;
      cls += r.ok ? ' heal' : ' dmg';
      html = `<span class="ti">${r.ok ? '🎲' : '☠️'}</span><span><b>${esc(t.label)}: ${r.kept}${r.mod >= 0 ? '+' : ''}${r.mod} = ${r.total} vs ${r.dc}</b>${r.ok ? 'You resist it.' : 'It takes hold.'}</span>`;
    }
    else html = `<span class="ti">📖</span><span>${esc(t.text || '')}</span>`;
    el.className = cls;
    el.innerHTML = html;
    box.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, t.type === 'remember' ? 4200 : 3400);
  }

  /* ============================================================
     EPISODE END
     ============================================================ */
  async function endEpisode() {
    const save = S.save, ep = S.episode;
    // Clear any toasts still fading out, so they don't hang over the summary.
    const tb = $('#toasts'); if (tb) tb.innerHTML = '';
    save.completed = true;
    save.completedAt = Date.now();
    E.syncCharFromSave(save);
    S.playerData.characters[save.char.id] = Object.assign(S.playerData.characters[save.char.id] || {}, {
      level: save.level, xp: save.xp, episodesCompleted: save.char.episodesCompleted
    });
    await persist(true);

    const peaceful = !save.flags.killed_chief && !save.flags.killed_kitchen_goblins && !save.flags.killed_road_patrol
      && !save.flags.killed_patrol && !save.flags.killed_dock_pair && !save.flags.burned_bakery;
    const complete = save.items.some(i => i.id === 'recipe_half_office') && save.items.some(i => i.id === 'recipe_half_apartment');

    $('#endBody').innerHTML = `
      <div class="end-hero">
        <div class="eh-k">Episode ${ep.number} complete</div>
        <h2>${esc(ep.title)}</h2>
        <p>${complete ? 'Tyndareus got his pie. Whatever it cost, the old gnome has tasted his childhood one more time.' : 'The old gnome did not get his pie. He poured the tea anyway.'}</p>
      </div>
      <div class="end-stats">
        <div class="es"><div class="esv">${save.choices.length}</div><div class="esk">Choices made</div></div>
        <div class="es"><div class="esv">${save.rolls.length}</div><div class="esk">Dice rolled</div></div>
        <div class="es"><div class="esv">${save.xp}</div><div class="esk">Experience</div></div>
        <div class="es"><div class="esv">${save.gold}</div><div class="esk">Gold</div></div>
        <div class="es"><div class="esv">${save.level}</div><div class="esk">Level</div></div>
        <div class="es"><div class="esv">${peaceful ? 'Yes' : 'No'}</div><div class="esk">Bloodless</div></div>
      </div>
      <div class="panel pad" style="margin-bottom:20px">
        <h3 style="font-size:19px;color:var(--wine);margin-bottom:14px">${esc(save.char.name)}'s defining choices</h3>
        ${save.majors.length ? save.majors.map(m =>
          `<div class="major"><span class="mi">🖋️</span><span><span class="mw">${esc(save.char.name)}</span> ${esc(m.text)}.</span></div>`).join('')
          : `<div class="inv-empty">No defining moments were recorded.</div>`}
      </div>
      <div id="endCompare"></div>
      <div style="display:flex;gap:11px;justify-content:center;flex-wrap:wrap">
        <button class="btn primary" id="endEpisodes">Episode select</button>
        <button class="btn" id="endChron">Open the chronicle</button>
        <button class="btn ghost" id="endHome">Main menu</button>
      </div>`;
    show('end');
    renderEndCompare(ep, save);   // async, fills itself in when the data arrives
    $('#endEpisodes').onclick = () => { renderEpisodes(); show('episodes'); };
    $('#endChron').onclick = openChronicle;
    $('#endHome').onclick = () => { renderStart(); show('start'); };
  }

  /* ============================================================
     CHRONICLE
     ============================================================ */
  let chronPlayer = null;
  async function openChronicle() {
    chronPlayer = chronPlayer || S.player;
    await renderChronicle();
    show('chronicle');
  }

  async function renderChronicle() {
    const names = Array.from(new Set(S.roster.concat(S.player ? [S.player] : [])));
    $('#chronTabs').innerHTML = names.map(n =>
      `<button class="chron-player${chronPlayer === n ? ' on' : ''}" data-cp="${esc(n)}">${esc(cap(n))}</button>`).join('')
      + (names.length > 1 ? `<button class="chron-player${chronPlayer === '__cmp' ? ' on' : ''}" data-cp="__cmp">⚖️ Compare</button>` : '');
    $$('#chronTabs [data-cp]').forEach(b => b.onclick = async () => { chronPlayer = b.dataset.cp; await renderChronicle(); });

    const body = $('#chronBody');
    body.innerHTML = `<div class="spinner"></div>`;

    if (chronPlayer === '__cmp') { await renderCompare(names); return; }

    const data = (chronPlayer === S.player && S.playerData) ? S.playerData : await loadPlayer(chronPlayer);
    const saves = Object.values(data.saves || {});
    if (!saves.length) {
      body.innerHTML = `<div class="empty-state"><div class="es-i">📖</div><p><b>${esc(data.display)}</b> hasn't written anything into the chronicle yet. Choices made during an episode will appear here — the ones that mattered.</p></div>`;
      return;
    }
    body.innerHTML = saves.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)).map(run => {
      const ep = TDM.EPISODES[run.episodeId] || { title: run.episodeId, number: '?' };
      return `<div class="chron-ep panel pad">
        <div class="chron-ep-h">
          <h3>${esc(ep.title)}</h3>
          <span class="st ${run.completed ? 'done' : 'prog'}">${run.completed ? 'Completed' : 'In progress'}</span>
          <span style="font-size:13px;color:var(--ink-faint);margin-left:auto">${esc(run.char.name)} · Level ${run.level} · ${run.choices.length} choices</span>
        </div>
        ${run.majors.length ? run.majors.map(m =>
          `<div class="major"><span class="mi">🖋️</span><span><span class="mw">${esc(run.char.name)}</span> ${esc(m.text)}.</span></div>`).join('')
        : `<div class="inv-empty">Nothing defining yet — the big choices are still ahead.</div>`}
      </div>`;
    }).join('');
  }

  async function renderCompare(names) {
    const body = $('#chronBody');
    const datas = {};
    for (const n of names) datas[n] = (n === S.player && S.playerData) ? S.playerData : await loadPlayer(n);

    const epIds = new Set();
    Object.values(datas).forEach(d => Object.keys(d.saves || {}).forEach(k => epIds.add(k)));
    if (!epIds.size) {
      body.innerHTML = `<div class="empty-state"><div class="es-i">⚖️</div><p>Nobody has played an episode yet. Once two people have, you'll see exactly where your stories split.</p></div>`;
      return;
    }

    let html = '';
    epIds.forEach(epId => {
      const ep = TDM.EPISODES[epId] || { title: epId };
      const withRun = names.filter(n => datas[n].saves && datas[n].saves[epId]);
      if (withRun.length < 2) return;
      const sets = {};
      withRun.forEach(n => sets[n] = idSet(datas[n].saves[epId].majors));
      html += `<div class="chron-ep panel pad">
        <div class="chron-ep-h"><h3>${esc(ep.title)}</h3><span class="st done">${withRun.length} players</span></div>
        <div class="compare">
        ${withRun.map(n => {
          const run = datas[n].saves[epId];
          const others = withRun.filter(x => x !== n);
          return `<div class="cmp-col"><h4>${esc(datas[n].display)} — ${esc(run.char.name)}</h4>
            ${(run.majors || []).length ? run.majors.map(m => {
              const uniq = others.every(o => !inSet(sets[o], m));
              return `<div class="cmp-item ${uniq ? 'uniq' : 'same'}">${uniq ? '<b>Only ' + esc(datas[n].display) + ':</b> ' : ''}${esc(cap(run.char.name))} ${esc(m.text)}.</div>`;
            }).join('') : `<div class="inv-empty">No defining choices recorded.</div>`}
          </div>`;
        }).join('')}
        </div></div>`;
    });
    body.innerHTML = html || `<div class="empty-state"><div class="es-i">⚖️</div><p>Only one player has reached this episode so far. Once someone else plays it, their choices will line up here beside yours.</p></div>`;
  }

  /* ------------------------------------------------------------
     "How everyone else played it" — shown automatically on the end
     screen, so you never have to go hunting for it in the chronicle.
     Only the majors (defining choices), never every single click.
     ------------------------------------------------------------ */
  /* Two players "did the same thing" when their chronicle entries share a key.
     The key defaults to the chronicle text, so normalise curly vs straight
     quotes and casing — otherwise a stray ’ makes identical choices look different. */
  function normTxt(v) {
    return String(v == null ? '' : v)
      .replace(/[\u2018\u2019\u02bc]/g, "'")
      .replace(/[\u201c\u201d]/g, '"')
      .replace(/\s+/g, ' ')
      .trim().toLowerCase();
  }

  /* An entry may be identified by its key OR its text: the engine normally sets
     key = chronicle text, but an episode can supply a short explicit
     chronicleKey. Match on either so both styles compare correctly. */
  function majorIds(m) {
    const ids = [];
    const k = normTxt(m.chronicleKey || m.key);
    const t = normTxt(m.text);
    if (k) ids.push(k);
    if (t && t !== k) ids.push(t);
    return ids;
  }
  function majorKey(m) { return majorIds(m)[0] || ''; }
  function idSet(list) {
    const s = new Set();
    (list || []).forEach(m => majorIds(m).forEach(i => s.add(i)));
    return s;
  }
  function inSet(set, m) { return majorIds(m).some(i => set.has(i)); }

  async function renderEndCompare(ep, save) {
    const host = $('#endCompare');
    if (!host) return;
    const epId = ep.id;

    let others = [];
    try {
      const names = Array.from(new Set((S.roster || []).concat(S.player ? [S.player] : [])))
        .filter(n => n !== S.player);
      for (const n of names) {
        const d = await loadPlayer(n);
        const run = d && d.saves && d.saves[epId];
        if (run && run.completed) others.push({ key: n, display: d.display || cap(n), run });
      }
    } catch (e) { /* offline or unreadable — just skip the section */ }

    if (!others.length) {
      host.innerHTML = `<div class="panel pad endcmp-wait">
        <h3>Nobody else has finished this episode yet</h3>
        <p>When ${S.player === 'nergis' ? 'Brian' : 'Nergis'} plays it too, their defining choices
           will appear here beside yours — and you'll see exactly where your two stories split.</p>
      </div>`;
      return;
    }

    const mine = idSet(save.majors);

    host.innerHTML = others.map(o => {
      const theirs = o.run.majors || [];
      const theirSet = idSet(theirs);
      const shared    = theirs.filter(m => inSet(mine, m));
      const onlyThem  = theirs.filter(m => !inSet(mine, m));
      const onlyMine  = (save.majors || []).filter(m => !inSet(theirSet, m));
      const cn = cap(o.run.char.name), mn = cap(save.char.name);

      return `<div class="panel pad endcmp">
        <div class="endcmp-h">
          <h3>How ${esc(o.display)} played it</h3>
          <span class="st done">${esc(o.run.char.name)}, level ${o.run.level || 1}</span>
        </div>

        ${onlyThem.length ? `<h4 class="ec-k diff">Only ${esc(o.display)} did this</h4>
          ${onlyThem.map(m => `<div class="cmp-item uniq">${esc(cn)} ${esc(m.text)}.</div>`).join('')}` : ''}

        ${onlyMine.length ? `<h4 class="ec-k diff">Only you did this</h4>
          ${onlyMine.map(m => `<div class="cmp-item uniq">${esc(mn)} ${esc(m.text)}.</div>`).join('')}` : ''}

        ${shared.length ? `<h4 class="ec-k same">You both did this</h4>
          ${shared.map(m => `<div class="cmp-item same">${esc(m.text)}.</div>`).join('')}` : ''}

        ${!theirs.length && !onlyMine.length
          ? `<div class="inv-empty">No defining choices were recorded on either side.</div>` : ''}

        <div class="ec-foot">
          <span>${esc(o.display)} finished in ${o.run.choices ? o.run.choices.length : '?'} choices ·
          ${o.run.gold != null ? o.run.gold + ' gold' : ''}</span>
        </div>
      </div>`;
    }).join('');
  }

  /* ============================================================
     MODAL
     ============================================================ */
  function modal({ title, body, actions }) {
    const ov = $('#modal');
    $('#modalBox').innerHTML = `<h3>${esc(title)}</h3><div>${body}</div>
      <div class="modal-actions">${(actions || []).map((a, i) => `<button class="btn ${a.cls || ''}" data-mi="${i}">${esc(a.label)}</button>`).join('')}</div>`;
    ov.classList.add('show');
    $$('#modalBox [data-mi]').forEach(b => b.onclick = () => (actions[parseInt(b.dataset.mi, 10)].fn || closeModal)());
  }
  function closeModal() { $('#modal').classList.remove('show'); }

  /* ---------- go ---------- */
  document.addEventListener('DOMContentLoaded', boot);
  window.TDM_APP = { S, renderScene, toast };
})();
