/* ============================================================
   TALES OF THE DM — Database adapter
   Supports Cloud Firestore, Realtime Database, and a local
   (localStorage / in-memory) fallback. Whole-player documents
   keep reads/writes simple and atomic.

   Cloud layout (identical shape in both databases):
     players/{playerName}   → full player data (profile, characters, saves)
     meta/roster            → { names: { nergis: timestamp, ... } }
   Local layout:
     tdm.players.{name}     → same player object
     tdm.roster             → [names]
   ============================================================ */
(function () {
  const TDM = (typeof window !== 'undefined')
    ? (window.TDM = window.TDM || {})
    : (global.TDM = global.TDM || {});

  const CFG = (typeof window !== 'undefined' ? window.TDM_CONFIG : null) || { DB_MODE: 'local', FIREBASE: {} };
  const KEY = (n) => 'tdm.players.' + n;

  /* ---------- safe local storage (sandboxed iframes may block it) ---------- */
  const mem = {};
  const localStore = {
    ok: (function () {
      try { const t = '__tdm_test__'; window.localStorage.setItem(t, '1'); window.localStorage.removeItem(t); return true; }
      catch (e) { return false; }
    })(),
    get(k) {
      if (this.ok) { try { return window.localStorage.getItem(k); } catch (e) { return mem[k] || null; } }
      return mem[k] || null;
    },
    set(k, v) {
      mem[k] = v;
      if (this.ok) { try { window.localStorage.setItem(k, v); } catch (e) { /* full or blocked */ } }
    },
    del(k) { delete mem[k]; if (this.ok) { try { window.localStorage.removeItem(k); } catch (e) {} } },
    keys() {
      if (this.ok) {
        try { return Object.keys(window.localStorage).filter(k => k.startsWith('tdm.players.')).map(k => k.slice('tdm.players.'.length)); } catch (e) {}
      }
      return Object.keys(mem).filter(k => k.startsWith('tdm.players.')).map(k => k.slice('tdm.players.'.length));
    }
  };

  const db = {
    mode: 'local',        // 'firestore' | 'rtdb' | 'local'
    cloudReady: false,
    reason: '',           // human readable reason for local mode
    onStatus: null,       // callback(mode, reason)

    _fs: null, _rt: null,

    async init() {
      const fb = (typeof firebase !== 'undefined') ? firebase : null;
      const conf = (CFG && CFG.FIREBASE) || {};
      const complete = !!(conf.apiKey && conf.projectId && conf.appId);
      let want = (CFG.DB_MODE || 'auto');

      // ?local=1 forces offline mode. Automated tests use this so they never
      // write practice characters into the real database.
      try {
        if (typeof location !== 'undefined' && /[?&]local=1\b/.test(location.search)) want = 'local';
      } catch (e) {}

      if (!fb || want === 'local' || !complete) {
        if (!complete && want !== 'local') this.reason = fb ? 'Firebase config incomplete — playing in offline mode. (Fill in js/firebase-config.js to sync.)' : 'Playing in offline mode.';
        else if (!fb) this.reason = 'Could not reach Firebase — playing in offline mode.';
        this.mode = 'local';
        if (this.onStatus) this.onStatus(this.mode, this.reason);
        return this.mode;
      }

      try {
        if (!fb.apps || !fb.apps.length) fb.initializeApp(conf);
        if (want === 'auto') want = conf.databaseURL ? 'rtdb' : 'firestore';

        // Preflight over REST first. The SDK just hangs when the database
        // doesn't exist, so this turns a vague timeout into a precise,
        // actionable message.
        const pre = (want === 'rtdb') ? await preflightRtdb(conf) : await preflightFirestore(conf);
        if (!pre.ok) {
          this.mode = 'local';
          this.reason = pre.reason;
          this.fix = pre.fix || null;
          if (this.onStatus) this.onStatus(this.mode, this.reason, this.fix);
          return this.mode;
        }

        if (want === 'rtdb') {
          this._rt = fb.database();
          await withTimeout(this._rt.ref('meta/heartbeat').set({ t: Date.now() }), 6000);
          this.mode = 'rtdb';
        } else {
          this._fs = fb.firestore();
          await withTimeout(this._fs.collection('meta').doc('heartbeat').set({ t: Date.now() }), 6000);
          this.mode = 'firestore';
        }
        this.cloudReady = true;
      } catch (e) {
        console.warn('[TDM] Cloud unavailable, falling back to local:', e && e.message);
        this.mode = 'local';
        this.reason = 'Cloud database unreachable (' + ((e && e.code) || (e && e.message) || 'error') + ') — playing in offline mode.';
        this._fs = null; this._rt = null;
      }
      if (this.onStatus) this.onStatus(this.mode, this.reason);
      return this.mode;
    },

    async loadPlayer(name) {
      const key = norm(name);
      if (this.mode === 'firestore') {
        const snap = await this._fs.collection('players').doc(key).get();
        return snap.exists ? snap.data() : null;
      }
      if (this.mode === 'rtdb') {
        const snap = await this._rt.ref('players/' + key).once('value');
        return snap.exists() ? snap.val() : null;
      }
      const raw = localStore.get(KEY(key));
      return raw ? JSON.parse(raw) : null;
    },

    async savePlayer(name, data) {
      const key = norm(name);
      data.updatedAt = Date.now();
      if (this.mode === 'firestore') {
        const batch = this._fs.batch();
        batch.set(this._fs.collection('players').doc(key), JSON.parse(JSON.stringify(data)));
        batch.set(this._fs.collection('meta').doc('roster'), { [key]: Date.now() }, { merge: true });
        await batch.commit();
        return;
      }
      if (this.mode === 'rtdb') {
        await this._rt.ref('players/' + key).set(JSON.parse(JSON.stringify(data)));
        await this._rt.ref('meta/roster/' + key).set(Date.now());
        return;
      }
      localStore.set(KEY(key), JSON.stringify(data));
      const roster = JSON.parse(localStore.get('tdm.roster') || '[]');
      if (!roster.includes(key)) { roster.push(key); localStore.set('tdm.roster', JSON.stringify(roster)); }
    },

    async listPlayers() {
      if (this.mode === 'firestore') {
        try {
          const snap = await this._fs.collection('meta').doc('roster').get();
          return snap.exists ? Object.keys(snap.data() || {}) : [];
        } catch (e) { return []; }
      }
      if (this.mode === 'rtdb') {
        try {
          const snap = await this._rt.ref('meta/roster').once('value');
          return snap.exists() ? Object.keys(snap.val() || {}) : [];
        } catch (e) { return []; }
      }
      return JSON.parse(localStore.get('tdm.roster') || '[]');
    },

    // If cloud just became available and the device has local progress for a
    // player the cloud has never seen, push it up.
    async migrateLocalToCloud(name) {
      if (this.mode === 'local') return false;
      const key = norm(name);
      const raw = localStore.get(KEY(key));
      if (!raw) return false;
      const local = JSON.parse(raw);
      const cloud = await this.loadPlayer(key);
      if (!cloud) { await this.savePlayer(key, local); return true; }
      // cloud wins if it exists; otherwise keep newer
      if ((local.updatedAt || 0) > (cloud.updatedAt || 0)) { await this.savePlayer(key, local); return true; }
      return false;
    }
  };

  /* Realtime Database preflight. Crucially this tests a READ, not just a write:
     the common default rule set allows writes but denies reads, which would let
     the game look connected while never being able to load a save back. */
  async function preflightRtdb(conf) {
    const base = String(conf.databaseURL || '').replace(/\/+$/, '');
    const rulesFix = {
      title: 'Publish the database rules',
      steps: [
        'Open <b>Realtime Database → Rules</b> in the Firebase console.',
        'Paste the rules from <code>firebase-rules.txt</code> (Realtime Database section).',
        'Press <b>Publish</b>, then reload this page.'
      ],
      link: `https://console.firebase.google.com/project/${encodeURIComponent(conf.projectId)}/database/${encodeURIComponent(conf.projectId)}-default-rtdb/rules`
    };
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 9000);
      const res = await fetch(base + '/meta/heartbeat.json', { signal: ctrl.signal });
      clearTimeout(t);

      if (res.ok) return { ok: true };

      let body = {};
      try { body = await res.json(); } catch (e) {}

      if (body.correctUrl) {
        return {
          ok: false,
          reason: 'The database URL points at the wrong region — playing offline for now.',
          fix: {
            title: 'Fix the database URL',
            steps: [`Set <code>databaseURL</code> in <code>js/firebase-config.js</code> to:<br><code>${body.correctUrl}</code>`],
            link: null
          }
        };
      }
      if (res.status === 401 || res.status === 403) {
        return {
          ok: false,
          reason: 'The database is refusing reads (security rules) — playing offline for now.',
          fix: rulesFix
        };
      }
      if (res.status === 404) {
        return {
          ok: false,
          reason: 'No Realtime Database found at that URL — playing offline for now.',
          fix: {
            title: 'Create the database',
            steps: ['Firebase console → <b>Build → Realtime Database</b> → <b>Create database</b>, then reload.'],
            link: `https://console.firebase.google.com/project/${encodeURIComponent(conf.projectId)}/database`
          }
        };
      }
      return { ok: false, reason: `The database returned an unexpected error (${res.status}) — playing offline for now.` };
    } catch (e) {
      if (e && e.name === 'AbortError') return { ok: false, reason: 'The database did not respond in time — playing offline for now.' };
      return { ok: false, reason: 'No network connection to the database — playing offline for now.' };
    }
  }

  /* Ask Firestore over plain REST whether it's actually usable, and translate
     Google's error codes into something a human can act on. */
  async function preflightFirestore(conf) {
    const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(conf.projectId)}`
      + `/databases/(default)/documents/meta?pageSize=1&key=${encodeURIComponent(conf.apiKey)}`;
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 9000);
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(t);

      if (res.ok) return { ok: true };

      let body = {};
      try { body = await res.json(); } catch (e) {}
      const err = body.error || {};
      const reason = (err.details && err.details[0] && err.details[0].reason) || '';
      const msg = err.message || '';

      if (res.status === 403 && (reason === 'SERVICE_DISABLED' || /has not been used in project|is disabled/i.test(msg))) {
        return {
          ok: false,
          reason: 'Firestore has not been created in this Firebase project yet — playing offline for now.',
          fix: {
            title: 'One step left: create the database',
            steps: [
              'Open the Firebase console and pick the <b>dnd-game-2</b> project.',
              'In the left sidebar choose <b>Build → Firestore Database</b>.',
              'Click <b>Create database</b>. Pick a location close to you (<b>eur3 (europe-west)</b> is right for the Netherlands).',
              'Choose <b>Start in test mode</b> for now, then paste the proper rules from <code>firebase-rules.txt</code>.',
              'Reload this page — the badge turns green and everything syncs.'
            ],
            link: 'https://console.firebase.google.com/project/dnd-game-2/firestore'
          }
        };
      }
      if (res.status === 403 || res.status === 401) {
        return {
          ok: false,
          reason: 'Firestore refused the connection (security rules) — playing offline for now.',
          fix: {
            title: 'Your security rules are blocking the game',
            steps: [
              'Open <b>Firestore Database → Rules</b> in the Firebase console.',
              'Paste the rules from <code>firebase-rules.txt</code> (section 1).',
              'Press <b>Publish</b>, then reload this page.'
            ],
            link: 'https://console.firebase.google.com/project/dnd-game-2/firestore/rules'
          }
        };
      }
      if (res.status === 404) {
        return {
          ok: false,
          reason: 'No Firestore database found for this project — playing offline for now.',
          fix: {
            title: 'Create the database',
            steps: ['Firebase console → <b>Build → Firestore Database</b> → <b>Create database</b>, then reload.'],
            link: 'https://console.firebase.google.com/project/dnd-game-2/firestore'
          }
        };
      }
      return { ok: false, reason: `Firestore returned an unexpected error (${res.status}) — playing offline for now.` };
    } catch (e) {
      if (e && e.name === 'AbortError') return { ok: false, reason: 'Firestore did not respond in time — playing offline for now.' };
      return { ok: false, reason: 'No network connection to Firestore — playing offline for now.' };
    }
  }

  function norm(name) { return String(name || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, ''); }
  function withTimeout(p, ms) {
    return Promise.race([
      p,
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))
    ]);
  }

  TDM.db = db;
})();
