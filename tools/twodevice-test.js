const puppeteer=require('puppeteer'); const fs=require('fs');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const URL='http://localhost:8080/index.html';

async function fresh(dir){
  if(fs.existsSync(dir)) fs.rmSync(dir,{recursive:true,force:true});
  const b=await puppeteer.launch({userDataDir:dir,args:['--no-sandbox','--disable-dev-shm-usage']});
  const p=await b.newPage(); await p.setViewport({width:1350,height:950});
  await p.goto(URL,{waitUntil:'networkidle2',timeout:40000});
  await p.waitForFunction(()=>window.TDM&&TDM.db&&TDM.db.mode!=='pending',{timeout:20000});
  await sleep(2500);
  return {b,p};
}
(async()=>{
 // ---------- DEVICE A : Brian finishes the episode ----------
 const A=await fresh('/tmp/devA');
 console.log('DEVICE A mode:',await A.p.evaluate(()=>TDM.db.mode));
 await A.p.evaluate(async()=>{
   const ep=TDM.EPISODES.ep1_apple_pie;
   const char={id:'brian1',name:'Grimm Oakenshield',race:'half_orc',class:'barbarian',origin:'soldier',
     stats:{STR:17,DEX:13,CON:15,INT:8,WIS:12,CHA:10},level:1,xp:0,
     look:TDM.avatar.defaultsFor('half_orc','barbarian'),startItems:['greataxe'],startGold:25,
     pronouns:{subject:'he',object:'him',possessive:'his',is:'is'},episodesCompleted:[]};
   const s=TDM.engine.newSave(ep,char,'Brian');
   s.majors=[{key:'m1',text:'killed Grutt, chief of the goblins, in Grammy\u2019s bedroom',at:Date.now()},
             {key:'m2',text:'took the job for the coin',at:Date.now()},
             {key:'m3',text:'found the first half of Grammy\u2019s recipe in the office desk',at:Date.now()}];
   s.completed=true;s.level=3;s.xp=1200;s.gold=310;s.choices=new Array(41).fill({});
   await TDM.db.savePlayer('brian',{name:'brian',display:'Brian',characters:{brian1:char},
     saves:{ep1_apple_pie:s},createdAt:Date.now(),updatedAt:Date.now()});
 });
 console.log('✓ Brian saved his run from device A');
 await A.b.close();

 // ---------- DEVICE B : Nergis, totally separate profile ----------
 const B=await fresh('/tmp/devB');
 console.log('DEVICE B mode:',await B.p.evaluate(()=>TDM.db.mode));
 const seen=await B.p.evaluate(async()=>{
   const names=await TDM.db.listPlayers();
   const bd=await TDM.db.loadPlayer('brian');
   return {names, hasBrian:!!bd,
     majors:bd&&bd.saves&&bd.saves.ep1_apple_pie?bd.saves.ep1_apple_pie.majors.map(m=>m.text):[]};
 });
 console.log('players device B can see :',JSON.stringify(seen.names));
 console.log('Brian\'s run visible      :',seen.hasBrian);
 seen.majors.forEach(m=>console.log('   •',m));

 const chips=await B.p.$$eval('.who-chip',e=>e.map(x=>x.textContent.trim()));
 console.log('start-screen profiles    :',chips.join(' | '));
 await B.p.screenshot({path:'/tmp/devB-start.png'});
 await B.b.close();
 console.log(seen.hasBrian&&seen.majors.length===3
   ? '\n✅ CROSS-DEVICE SYNC CONFIRMED — device B read device A\'s run out of the cloud'
   : '\n❌ sync failed');
})();
