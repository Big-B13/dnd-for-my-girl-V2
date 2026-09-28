const puppeteer=require('puppeteer'); const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
 const p=await b.newPage(); await p.setViewport({width:1400,height:1000});
 const errs=[];
 p.on('pageerror',e=>errs.push('PAGEERROR: '+e.message));
 p.on('console',m=>{if(m.type()==='error'){const t=m.text();if(!/gstatic|firebase|ERR_|Failed to load/i.test(t))errs.push('CONSOLE: '+t);}});
 const click=async s=>{await p.waitForSelector(s,{visible:true,timeout:9000});await p.click(s);};

 await p.goto('http://localhost:8080/index.html?local=1',{waitUntil:'networkidle2'});
 await p.waitForSelector('.who-chip'); await click('.who-chip[data-player="nergis"]');
 await p.waitForFunction(()=>{const c=document.querySelector('.who-chip[data-player="nergis"]');return c&&c.classList.contains('on')&&document.querySelector('#btnNew');},{timeout:20000});
 await click('#btnNew');
 await p.waitForSelector('.ep-card'); await click('.ep-card.playable [data-act]');
 await p.waitForSelector('#fName'); await p.type('#fName','Nergis Nightsong');
 await p.waitForFunction(()=>!document.querySelector('#ccNext').disabled); await click('#ccNext');
 await click('[data-race="half_elf"]'); await sleep(180); await click('#ccNext');
 await p.waitForSelector('[data-class="druid"]'); await click('[data-class="druid"]'); await sleep(180); await click('#ccNext');
 // subclass / Path step (added with SUBCLASSES)
 await p.waitForSelector('[data-sub]'); const sub0=await p.$eval('[data-sub]',e=>e.dataset.sub);
 await click(`[data-sub="${sub0}"]`); await sleep(180); await click('#ccNext');
 await p.waitForSelector('[data-origin="folk_hero"]'); await click('[data-origin="folk_hero"]'); await sleep(180); await click('#ccNext');
 await p.waitForSelector('#useRec'); await click('#useRec'); await sleep(250); await click('#ccNext');
 await p.waitForSelector('.app-tab'); await sleep(200); await click('#ccNext');
 await p.waitForSelector('#sparkBack'); await click('#sparkBack'); await sleep(200); await click('#ccNext');
 await p.waitForSelector('.review-grid'); await click('#ccNext');
 await p.waitForSelector('#screen-game.active .choice');
 console.log('✓ character created & episode started');

 // play to completion, preferring forward progress
 let n=0, ended=false, remembers=0;
 for(;n<260;n++){
   if(await p.$eval('#screen-end',e=>e.classList.contains('active'))){ended=true;break;}
   const bs=await p.$$('#choices .choice:not(.locked)');
   if(!bs.length) break;
   await bs[Math.floor(Math.random()*bs.length)].click();
   await sleep(110);
   if(await p.$eval('#diceOverlay',e=>e.classList.contains('show'))){
     await p.waitForFunction(()=>{const a=document.querySelector('#diceActions');const k=document.querySelector('#usePerk');return (a&&a.children.length)||k;},{timeout:6000});
     const perk=await p.$('#usePerk'); const acc=await p.$('#acceptFail');
     if(perk && Math.random()<0.5) await perk.click(); else if(acc) await acc.click();
     await p.waitForFunction(()=>{const a=document.querySelector('#diceActions');return a&&a.querySelector('#diceGo');},{timeout:6000}).catch(()=>{});
     const go=await p.$('#diceGo'); if(go) await go.click();
     await p.waitForFunction(()=>!document.querySelector('#diceOverlay').classList.contains('show'),{timeout:6000}).catch(()=>{});
     await sleep(100);
   }
 }
 console.log(ended?`✓ EPISODE COMPLETED in ${n} choices`:`⚠ did not finish in ${n} choices`);
 if(ended){
   await sleep(500);
   await p.screenshot({path:'/tmp/f1-end.png'});
   const stats=await p.$$eval('.es',e=>e.map(x=>x.textContent.replace(/\s+/g,' ').trim()));
   console.log('  end stats:', stats.join(' | '));
   const majors=await p.$$eval('.major',e=>e.length);
   console.log('  defining choices recorded:', majors);
 }

 // seed a second player "Brian" with his own completed run, then compare
 await p.evaluate(async ()=>{
   const TDM=window.TDM, E=TDM.engine;
   const ep=TDM.EPISODES.ep1_apple_pie;
   const char={id:'brian1',name:'Grimm Oakenshield',race:'half_orc',class:'barbarian',origin:'soldier',
     stats:{STR:17,DEX:13,CON:15,INT:8,WIS:12,CHA:10},level:1,xp:0,
     look:TDM.avatar.defaultsFor('half_orc','barbarian'),startItems:['soldier_tag','greataxe','travelers_pack'],startGold:25,
     pronouns:{subject:'he',object:'him',possessive:'his',is:'is'},episodesCompleted:[]};
   const save=E.newSave(ep,char,'Brian');
   save.majors=[
     {key:'a',text:'killed the goblin patrol on the road',at:Date.now()},
     {key:'b',text:'kicked in the front doors of the bakery',at:Date.now()},
     {key:'c',text:'killed the three goblin bakers on the kitchen floor',at:Date.now()},
     {key:'d',text:'killed Grutt, chief of the goblins, in Grammy\u2019s bedroom',at:Date.now()},
     {key:'e',text:'took the recipe and left without a word',at:Date.now()}
   ];
   save.completed=true; save.level=3; save.xp=1200; save.choices=new Array(41).fill({});
   const data={name:'brian',display:'Brian',characters:{brian1:char},saves:{ep1_apple_pie:save},createdAt:Date.now(),updatedAt:Date.now()};
   await TDM.db.savePlayer('brian',data);
 });
 console.log('✓ seeded second player (Brian)');

 await p.goto('http://localhost:8080/index.html?local=1',{waitUntil:'networkidle2'});
 await p.waitForSelector('.who-chip'); await sleep(400);
 const chips=await p.$$eval('.who-chip',e=>e.map(x=>x.textContent.trim()));
 console.log('  players on start screen:', chips.join(', '));
 await click('.who-chip[data-player="nergis"]'); await sleep(400);
 await click('#btnChron');
 await p.waitForSelector('#screen-chronicle.active'); await sleep(700);
 const tabs=await p.$$eval('.chron-player',e=>e.map(x=>x.textContent.trim()));
 console.log('  chronicle tabs:', tabs.join(' | '));
 const cmp=await p.$('[data-cp="__cmp"]');
 if(cmp){ await cmp.click(); await sleep(900);
   await p.screenshot({path:'/tmp/f2-compare.png',fullPage:true});
   const cols=await p.$$eval('.cmp-col h4',e=>e.map(x=>x.textContent.trim()));
   const uniq=await p.$$eval('.cmp-item.uniq',e=>e.map(x=>x.textContent.trim()));
   console.log('✓ comparison columns:', cols.join('  VS  '));
   console.log('  sample unique choices:'); uniq.slice(0,4).forEach(u=>console.log('    · '+u));
 } else console.log('✗ no compare tab');

 console.log(errs.length?'\n✗ ERRORS:\n'+[...new Set(errs)].slice(0,8).join('\n'):'\n✓ NO JS ERRORS');
 await b.close(); process.exit(errs.length?1:0);
})();
