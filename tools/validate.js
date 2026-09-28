global.window = undefined;
require('/home/user/tales-of-the-dm/js/data/character-options.js');
require('/home/user/tales-of-the-dm/js/data/items.js');
require('/home/user/tales-of-the-dm/js/engine.js');
require('/home/user/tales-of-the-dm/js/data/episode1.js');
require('/home/user/tales-of-the-dm/js/data/episode1-perry.js');
require('/home/user/tales-of-the-dm/js/data/goblins.js');
const TDM = global.TDM;
let bad = 0;
for (const id of TDM.EPISODE_ORDER) {
  const ep = TDM.EPISODES[id];
  const errs = TDM.engine.validateEpisode(ep);
  console.log(`\n=== ${ep.id} — ${Object.keys(ep.scenes).length} scenes ===`);
  if (errs.length) { bad += errs.length; errs.forEach(e => console.log('  ✗ ' + e)); }
  else console.log('  ✓ structure valid');
  // reachability
  const seen = new Set([ep.start]); const q = [ep.start];
  while (q.length) {
    const s = ep.scenes[q.shift()]; if (!s) continue;
    (s.choices||[]).forEach(c => {
      const t = [];
      if (typeof c.goto === 'string') t.push(c.goto);
      if (c.success && typeof c.success.goto === 'string') t.push(c.success.goto);
      if (c.fail && typeof c.fail.goto === 'string') t.push(c.fail.goto);
      t.forEach(x => { if (!seen.has(x)) { seen.add(x); q.push(x); } });
    });
  }
  const unreach = Object.keys(ep.scenes).filter(s => !seen.has(s));
  if (unreach.length) { console.log('  ⚠ unreachable: ' + unreach.join(', ')); }
  else console.log('  ✓ all scenes reachable');
}
process.exit(bad ? 1 : 0);
