/* Walks the episode always preferring the choice Perry actually made.
   Proves the player can reproduce his run exactly, beat for beat. */
const R = '/home/user/tales-of-the-dm/';
global.window = undefined;
require(R + 'js/data/character-options.js');
require(R + 'js/data/items.js');
require(R + 'js/engine.js');
require(R + 'js/data/episode1.js');
require(R + 'js/data/episode1-crew.js');
require(R + 'js/data/episode1-bake.js');
require(R + 'js/data/episode1-assemble.js');
require(R + 'js/data/goblins.js');
require(R + 'js/data/perry-run.js');

const TDM = global.TDM, E = TDM.engine, ep = TDM.EPISODES.ep1_apple_pie;
const want = TDM.PERRY_RUN.majors.map(m => m.key);
const wantSet = new Set(want);

const char = {
  id: 'p', name: 'Perry', race: 'elf', class: 'fighter', subclass: 'gunslinger', origin: 'soldier',
  stats: { STR: 17, DEX: 14, CON: 14, INT: 8, WIS: 10, CHA: 12 }, level: 1, xp: 0,
  look: {}, startItems: ['revolver'], startGold: 25,
  pronouns: { subject: 'he', object: 'him', possessive: 'his', is: 'is' }, episodesCompleted: []
};
const save = E.newSave(ep, char, 'Perry');

// Perry's real dice, in order. Stealth 10 (fail) is the famous one.
const rolls = [...TDM.PERRY_RUN.rolls];
function nextRoll(label) {
  const i = rolls.findIndex(r => r.label === label);
  return i >= 0 ? rolls.splice(i, 1)[0] : null;
}

const keyOf = (b) => (b && b.effects && b.effects.chronicleKey) || null;
const path = [];
let steps = 0, got = [];

while (steps++ < 200) {
  const id = save.sceneId;
  const sc = ep.scenes[id];
  if (!sc) { console.log('✗ missing scene', id); break; }
  path.push(id);
  if (id === 'epilogue' || !sc.choices || !sc.choices.length) break;

  const avail = [];
  sc.choices.forEach((c, i) => {
    let ok = true;
    try { if (c.if) ok = !!c.if(E.view(save)); } catch (e) { ok = false; }
    if (ok) avail.push(i);
  });
  if (!avail.length) { console.log('✗ dead end at', id); break; }

  // Prefer a choice whose outcome is one of Perry's defining moments.
  let pick = avail.find(i => {
    const c = sc.choices[i];
    return [c, c.success, c.fail].some(b => wantSet.has(keyOf(b)));
  });
  if (pick === undefined) pick = avail[0];

  const c = sc.choices[pick];
  let branch = c, roll = null;
  if (c.check) {
    const r = nextRoll(c.check.label);
    const ok = r ? r.ok : true;
    branch = ok ? (c.success || c) : (c.fail || c.success || c);
    roll = r ? { label: c.check.label, kept: r.d20s ? r.d20s[0] : r.total, mod: 0, total: r.total, dc: c.check.dc, ok: r.ok } : null;
    if (r) console.log(`   🎲 ${r.label} ${r.total} vs DC ${c.check.dc} → ${r.ok ? 'success' : 'FAILURE'}`);
  }
  const k = keyOf(branch);
  if (k && wantSet.has(k) && !got.includes(k)) got.push(k);
  try { E.commit(save, ep, id, pick, branch, roll); }
  catch (e) { console.log('✗ commit failed at', id, e.message); break; }
}

console.log('\nscenes walked   :', path.length);
console.log('ended at        :', save.sceneId);
console.log('majors recorded :', save.majors.length);
const recorded = save.majors.map(m => m.key);
const missed = want.filter(k => !recorded.includes(k));
console.log('\nPerry beats hit :', want.filter(k => recorded.includes(k)).length + '/' + want.length);
if (missed.length) console.log('MISSED          :', missed.join(', '));
console.log('\n--- the run, in order ---');
save.majors.forEach((m, i) => console.log(`  ${String(i + 1).padStart(2)}. ${m.text}`));
console.log('\nlevel', save.level, '| xp', save.xp, '| gold', save.gold, '| hp', save.hp + '/' + save.maxHp);
console.log(save.sceneId === 'epilogue' && !missed.length
  ? '\n✅ Perry\'s exact run is reproducible end to end.'
  : '\n✗ Perry\'s run is NOT fully reproducible.');
