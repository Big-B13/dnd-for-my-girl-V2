global.window = undefined;
require('/home/user/tales-of-the-dm/js/data/character-options.js');
require('/home/user/tales-of-the-dm/js/data/items.js');
require('/home/user/tales-of-the-dm/js/engine.js');
require('/home/user/tales-of-the-dm/js/data/episode1.js');
require('/home/user/tales-of-the-dm/js/data/episode1-crew.js');
require('/home/user/tales-of-the-dm/js/data/episode1-bake.js');
require('/home/user/tales-of-the-dm/js/data/episode1-assemble.js');
require('/home/user/tales-of-the-dm/js/data/goblins.js');
const TDM = global.TDM, E = TDM.engine, O = TDM.CHAR_OPTIONS;
const ep = TDM.EPISODES.ep1_apple_pie;

function mkChar(i) {
  const race = O.RACES[i % O.RACES.length], cls = O.CLASSES[i % O.CLASSES.length], org = O.ORIGINS[i % O.ORIGINS.length];
  const rec = cls.recommended;
  // Rotate through subclasses too, so reqTag-gated choices (the Gunslinger's
  // revolver, for one) actually get exercised by the simulation.
  const subs = (O.SUBCLASSES || {})[cls.id] || [];
  const sub = subs.length ? subs[i % subs.length] : null;
  return { id:'c'+i, name:'Test'+i, race:race.id, class:cls.id, subclass: sub && sub.id, origin:org.id, level:1, xp:0,
    stats: Object.assign({}, rec), startItems:[org.item, 'travelers_pack'], startGold:25,
    pronouns:{subject:'she',object:'her',possessive:'her',is:'is'} };
}

let runs=0, finished=0, kos=0, maxSteps=0, errors=[], endings={}, deadends=0;
const visited = new Set();
for (let i=0;i<1200;i++){
  const save = E.newSave(ep, mkChar(i));
  E.enterScene(save, ep, ep.start);
  let steps=0;
  try {
    while (steps < 400) {
      steps++;
      visited.add(save.sceneId);
      const scene = ep.scenes[save.sceneId];
      if (!scene) { errors.push('missing scene '+save.sceneId); break; }
      const vis = E.visibleChoices(save, ep, scene).filter(c => !E.choiceLocked(save, c));
      if (!vis.length) {
        const all = (scene.choices||[]);
        if (all.length && all.every(c => E.choiceLocked(save,c) || (c.if && !c.if(E.view(save))))) { deadends++; errors.push('dead end (all locked) at '+save.sceneId); }
        endings[save.sceneId]=(endings[save.sceneId]||0)+1;
        if (save.flags.completed) finished++;
        break;
      }
      const choice = vis[Math.floor(Math.random()*vis.length)];
      const idx = scene.choices.indexOf(choice);
      const plan = E.planChoice(save, ep, save.sceneId, idx);
      if (plan.kind === 'check') {
        const r = E.makeCheck(save, plan.check);
        const branch = r.ok ? plan.success : plan.fail;
        const res = E.commit(save, ep, save.sceneId, idx, branch, r);
        if (res.res.ko) kos++;
      } else {
        if (plan.goto === null || plan.goto === undefined) { endings[save.sceneId]=(endings[save.sceneId]||0)+1; if (save.flags.completed) finished++; break; }
        const res = E.commit(save, ep, save.sceneId, idx, plan, null);
        if (res.res.ko) kos++;
      }
    }
  } catch(e){ errors.push(save.sceneId+': '+e.message); }
  if (steps>maxSteps) maxSteps=steps;
  runs++;
}
console.log(`runs=${runs} reachedEnding=${finished} KOs=${kos} maxSteps=${maxSteps} deadEnds=${deadends}`);
console.log(`scenes visited: ${visited.size}/${Object.keys(ep.scenes).length}`);
const never = Object.keys(ep.scenes).filter(s=>!visited.has(s));
if (never.length) console.log('never visited:', never.join(', '));
console.log('\nending scenes:', JSON.stringify(endings));
if (errors.length){ console.log('\nERRORS ('+errors.length+'):'); [...new Set(errors)].slice(0,20).forEach(e=>console.log('  ✗ '+e)); process.exit(1);}
else console.log('\n✓ no errors');
