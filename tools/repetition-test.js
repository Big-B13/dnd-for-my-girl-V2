/* Measures how repetitive a playthrough is, with and without the flow patch.
   A "revisit" is entering a scene you have already been in during the same run. */
const R = '/home/user/tales-of-the-dm/';

function load(withFlow) {
  for (const k of Object.keys(require.cache)) delete require.cache[k];
  global.window = undefined; global.TDM = undefined;
  require(R + 'js/data/character-options.js');
  require(R + 'js/data/items.js');
  require(R + 'js/engine.js');
  require(R + 'js/data/episode1.js');
  require(R + 'js/data/episode1-perry.js');
  require(R + 'js/data/goblins.js');
  if (withFlow) require(R + 'js/data/flow.js');
  return global.TDM;
}

function run(TDM, seedRand) {
  const E = TDM.engine, ep = TDM.EPISODES.ep1_apple_pie;
  const OPT = TDM.CHAR_OPTIONS;
  const char = {
    id: 'x', name: 'Tester', race: 'half_elf', class: 'fighter', origin: 'soldier',
    stats: { STR: 15, DEX: 14, CON: 14, INT: 10, WIS: 12, CHA: 13 }, level: 1, xp: 0,
    look: {}, startItems: [], startGold: 25,
    pronouns: { subject: 'they', object: 'them', possessive: 'their', is: 'are' }, episodesCompleted: []
  };
  const save = E.newSave(ep, char, 'Tester');
  const counts = {};
  let steps = 0; let why = 'cap';
  while (steps < 400) {
    const id = save.sceneId;
    counts[id] = (counts[id] || 0) + 1;
    const sc = ep.scenes[id];
    if (!sc || !sc.choices || !sc.choices.length) { why='no-choices'; break; }
    if (id === 'epilogue') { why='ending'; break; }
    const avail = [];
    sc.choices.forEach((c, i) => {
      let ok = true;
      try { if (c.if) ok = !!c.if(E.view ? E.view(save) : save); } catch (e) { ok = false; }
      if (ok) avail.push(i);
    });
    if (!avail.length) { why='all-locked'; break; }
    const idx = avail[Math.floor(seedRand() * avail.length)];
    const ch = sc.choices[idx];
    let branch = ch, roll = null;
    if (ch.check) {
      const res = E.rollCheck ? null : null;
      branch = (seedRand() < 0.55 && ch.success) ? ch.success : (ch.fail || ch.success || ch);
    }
    try { E.commit(save, ep, id, idx, branch, roll); } catch (e) { why='throw:'+String(e.message).slice(0,40); break; }
    steps++;
  }
  const visits = Object.values(counts).reduce((a, b) => a + b, 0);
  const distinct = Object.keys(counts).length;
  const worst = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  return { visits, distinct, revisits: visits - distinct, worst, done: save.sceneId === 'epilogue', why, last: save.sceneId };
}

function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

const N = 400;
const out = {};
for (const mode of ['without flow patch', 'with flow patch']) {
  const TDM = load(mode.startsWith('with '));
  let visits = 0, distinct = 0, revisits = 0, done = 0;
  const hot = {}; const why = {}; const lastAt = {};
  for (let i = 0; i < N; i++) {
    const r = run(TDM, mulberry(i + 1));
    visits += r.visits; distinct += r.distinct; revisits += r.revisits; done += r.done ? 1 : 0;
    r.worst.forEach(([s, c]) => { if (c > 1) hot[s] = (hot[s] || 0) + (c - 1); });
    why[r.why]=(why[r.why]||0)+1; if(r.why!=='ending') lastAt[r.last]=(lastAt[r.last]||0)+1;
  }
  out[mode] = {
    avgSceneEntries: (visits / N).toFixed(1),
    avgDistinct: (distinct / N).toFixed(1),
    avgRepeatedEntries: (revisits / N).toFixed(1),
    pctRepeated: ((revisits / visits) * 100).toFixed(1) + '%',
    finished: done + '/' + N,
    endedBecause: why,
    stoppedAt: Object.entries(lastAt).sort((a,b)=>b[1]-a[1]).slice(0,4),
    worstOffenders: Object.entries(hot).sort((a, b) => b[1] - a[1]).slice(0, 6)
      .map(([s, c]) => s + ' (' + (c / N).toFixed(1) + '× re-entered per run)')
  };
}
console.log('\n=== REPETITION: ' + N + ' random playthroughs each ===\n');
for (const [k, v] of Object.entries(out)) {
  console.log(k.toUpperCase());
  console.log('  scene entries per run : ' + v.avgSceneEntries + '  (distinct ' + v.avgDistinct + ')');
  console.log('  REPEATED entries/run  : ' + v.avgRepeatedEntries + '   = ' + v.pctRepeated + ' of the playthrough');
  console.log('  reached the ending    : ' + v.finished);
  console.log('  ended because        : ' + JSON.stringify(v.endedBecause));
  if(v.stoppedAt.length) console.log('  stopped at           : ' + JSON.stringify(v.stoppedAt));
  v.worstOffenders.forEach(o => console.log('     · ' + o));
  console.log('');
}
const a = parseFloat(out['without flow patch'].avgRepeatedEntries);
const b = parseFloat(out['with flow patch'].avgRepeatedEntries);
console.log('→ repeated scene entries cut by ' + (100 * (a - b) / a).toFixed(0) + '% (' + a + ' → ' + b + ' per run)');
