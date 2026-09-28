global.window=undefined;
require('/home/user/tales-of-the-dm/js/data/character-options.js');
require('/home/user/tales-of-the-dm/js/data/items.js');
require('/home/user/tales-of-the-dm/js/engine.js');
require('/home/user/tales-of-the-dm/js/data/episode1.js');
require('/home/user/tales-of-the-dm/js/data/episode1-perry.js');
const TDM=global.TDM,E=TDM.engine;
const ep=TDM.EPISODES.ep1_apple_pie;
const char={id:'t',name:'T',race:'human',class:'bard',origin:'sage',stats:{STR:10,DEX:14,CON:14,INT:12,WIS:12,CHA:16},level:1,xp:0,startItems:['letter_of_note'],startGold:25};
let worst=0, runs=0, dupTotal=0;
for(let i=0;i<300;i++){
  const save=E.newSave(ep,char); E.enterScene(save,ep,ep.start);
  for(let s=0;s<300;s++){
    const scene=ep.scenes[save.sceneId]; if(!scene) break;
    const vis=E.visibleChoices(save,ep,scene).filter(c=>!E.choiceLocked(save,c)); if(!vis.length) break;
    const c=vis[Math.floor(Math.random()*vis.length)]; const idx=scene.choices.indexOf(c);
    const plan=E.planChoice(save,ep,save.sceneId,idx);
    if(plan.kind==='check'){const r=E.makeCheck(save,plan.check);E.commit(save,ep,save.sceneId,idx,r.ok?plan.success:plan.fail,r);}
    else {if(plan.goto===null)break;E.commit(save,ep,save.sceneId,idx,plan,null);}
  }
  const keys=save.majors.map(m=>m.key);
  const dups=keys.length-new Set(keys).size;
  dupTotal+=dups; if(dups>worst)worst=dups; runs++;
}
console.log(`runs=${runs}  total duplicate chronicle entries=${dupTotal}  worst single run=${worst}`);
console.log(dupTotal===0?'✓ chronicle entries are unique in every run':'✗ duplicates remain');
process.exit(dupTotal===0?0:1);
