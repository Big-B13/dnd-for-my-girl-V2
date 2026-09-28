const puppeteer=require('puppeteer'); const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
 const p=await b.newPage(); await p.setViewport({width:1400,height:1000});
 const errs=[];
 p.on('pageerror',e=>errs.push('PAGEERROR: '+e.message));
 p.on('console',m=>{if(m.type()==='error'){const t=m.text();if(!/gstatic|firebase|ERR_|Failed to load/i.test(t))errs.push('CONSOLE: '+t);}});
 const click=async s=>{await p.waitForSelector(s,{visible:true,timeout:9000});await p.click(s);};


 // --- seed Brian's completed run FIRST, so the end screen can compare ---
 await p.goto('http://localhost:8080/index.html?local=1',{waitUntil:'networkidle2'});
 await p.waitForFunction(()=>window.TDM&&window.TDM.db,{timeout:15000});
 await p.evaluate(async ()=>{
   const TDM=window.TDM,E=TDM.engine,ep=TDM.EPISODES.ep1_apple_pie;
   const char={id:'brian1',name:'Grimm Oakenshield',race:'half_orc',class:'barbarian',origin:'soldier',
     stats:{STR:17,DEX:13,CON:15,INT:8,WIS:12,CHA:10},level:1,xp:0,
     look:TDM.avatar.defaultsFor('half_orc','barbarian'),startItems:['greataxe'],startGold:25,
     pronouns:{subject:'he',object:'him',possessive:'his',is:'is'},episodesCompleted:[]};
   const save=E.newSave(ep,char,'Brian');
   save.majors=[
     {key:'road',text:'killed the goblin patrol on the road',at:Date.now()},
     {key:'door',text:'kicked in the front doors of the bakery',at:Date.now()},
     {key:'chief',text:'killed Grutt, chief of the goblins, in Grammy\u2019s bedroom',at:Date.now()},
     {key:'why',text:'took the job for the coin',at:Date.now()},
     // deliberately uses a CURLY apostrophe where the episode uses a straight one,
     // to prove the normalisation in majorKey() works
     {key:'r1',text:'found the first half of Grammy\u2019s recipe in the office desk',at:Date.now()}
   ];
   save.completed=true;save.level=3;save.xp=1200;save.gold=310;save.choices=new Array(41).fill({});
   await TDM.db.savePlayer('brian',{name:'brian',display:'Brian',characters:{brian1:char},
     saves:{ep1_apple_pie:save},createdAt:Date.now(),updatedAt:Date.now()});
 });
 console.log('\u2713 seeded Brian as having already finished Episode 1');
 await p.reload({waitUntil:'networkidle2'});
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

 
 // play to completion
 let n=0, ended=false;
 for(;n<300;n++){
   if(await p.$eval('#screen-end',e=>e.classList.contains('active'))){ended=true;break;}
   const bs=await p.$$('#choices .choice:not(.locked)');
   if(!bs.length) break;
   await bs[Math.floor(Math.random()*bs.length)].click();
   await sleep(90);
   if(await p.$eval('#diceOverlay',e=>e.classList.contains('show'))){
     await p.waitForFunction(()=>{const a=document.querySelector('#diceActions');return (a&&a.children.length)||document.querySelector('#usePerk');},{timeout:6000}).catch(()=>{});
     const acc=await p.$('#acceptFail'); if(acc) await acc.click();
     await p.waitForFunction(()=>{const a=document.querySelector('#diceActions');return a&&a.querySelector('#diceGo');},{timeout:6000}).catch(()=>{});
     const go=await p.$('#diceGo'); if(go) await go.click();
     await p.waitForFunction(()=>!document.querySelector('#diceOverlay').classList.contains('show'),{timeout:6000}).catch(()=>{});
     await sleep(90);
   }
 }
 console.log(ended?`\u2713 episode completed in ${n} choices`:'\u26a0 did not finish');
 if(!ended){await b.close();process.exit(1);}

 await p.waitForFunction(()=>{const e=document.querySelector('#endCompare');return e&&e.children.length;},{timeout:15000});
 await sleep(600);
 const cmp=await p.evaluate(()=>{
   const h=document.querySelector('#endCompare');
   return {heading:(h.querySelector('h3')||{}).textContent,
     keys:[...h.querySelectorAll('.ec-k')].map(x=>x.textContent.trim()),
     items:[...h.querySelectorAll('.cmp-item')].map(x=>x.textContent.trim()),
     shared:[...h.querySelectorAll('.cmp-item.same')].map(x=>x.textContent.trim())};
 });
 console.log('\n--- END-SCREEN COMPARISON ---');
 console.log('heading:',cmp.heading);
 cmp.keys.forEach(k=>console.log('  section:',k));
 console.log('  SHARED entries:',cmp.shared.length);
 cmp.shared.forEach(i=>console.log('   =',i));
 if(!cmp.shared.length) console.log('  (no overlap this run \u2014 rerun)');
 await p.evaluate(()=>{const e=document.querySelector('#endCompare');e.scrollIntoView({block:'center'});});
 await sleep(400); await p.screenshot({path:'/tmp/endcmp.png'});
 await p.evaluate(()=>{document.querySelector('#endEpisodes').click();});
 await sleep(700);
 await p.screenshot({path:'/tmp/eps.png'});
 await p.evaluate(()=>window.scrollTo(0,0));
 const dbg=await p.evaluate(async ()=>{
   const S=window.TDM.__state||null;
   const bd=await window.TDM.db.loadPlayer('brian');
   return {brianKeys:(bd&&bd.saves&&bd.saves.ep1_apple_pie&&bd.saves.ep1_apple_pie.majors||[]).map(m=>m.key||m.text),
           brianCompleted:!!(bd&&bd.saves&&bd.saves.ep1_apple_pie&&bd.saves.ep1_apple_pie.completed)};
 });
 console.log('\nBrian completed flag:',dbg.brianCompleted);
 console.log('Brian keys:',JSON.stringify(dbg.brianKeys,null,1));
 console.log('\nJS errors:',errs.length?errs.join('\n'):'none');
 await b.close();
})();
