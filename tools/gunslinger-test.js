const puppeteer=require('puppeteer'); const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const URL='http://localhost:8080/index.html?local=1';
(async()=>{
 const b=await puppeteer.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
 const p=await b.newPage(); await p.setViewport({width:1400,height:1000});
 const errs=[];
 p.on('pageerror',e=>errs.push('PAGEERROR: '+e.message));
 p.on('console',m=>{if(m.type()==='error'){const t=m.text();if(!/gstatic|firebase|ERR_|Failed to load/i.test(t))errs.push('CONSOLE: '+t);}});
 const click=async s=>{await p.waitForSelector(s,{visible:true,timeout:12000});await p.click(s);};

 await p.goto(URL,{waitUntil:'networkidle2',timeout:40000});
 await p.waitForSelector('.who-chip'); await sleep(2500);
 const chips=await p.$$eval('.who-chip',e=>e.map(x=>x.textContent.trim()));
 console.log('profiles on start screen:',chips.join(' | '));

 // Perry must be read-only
 await click('.who-chip[data-player="perry"]'); await sleep(1500);
 const ro=await p.evaluate(()=>({
   newHidden:getComputedStyle(document.querySelector('#btnNew')).display==='none',
   chron:document.querySelector('#btnChron').textContent.trim(),
   welcome:document.querySelector('#welcomeText').textContent.slice(0,60)}));
 console.log('Perry: New Game hidden =',ro.newHidden,'| button:',ro.chron);

 // now play as Nergis, a GUNSLINGER
 await click('.who-chip[data-player="nergis"]');
 await p.waitForFunction(()=>{const c=document.querySelector('.who-chip[data-player="nergis"]');return c&&c.classList.contains('on')&&document.querySelector('#btnNew');},{timeout:20000});
 await click('#btnNew');
 await p.waitForSelector('.ep-card'); await click('.ep-card.playable [data-act]');
 await p.waitForSelector('#fName'); await p.type('#fName','Nergis Nightsong');
 await p.waitForFunction(()=>!document.querySelector('#ccNext').disabled); await click('#ccNext');
 await click('[data-race="elf"]'); await sleep(200); await click('#ccNext');
 await p.waitForSelector('[data-class="fighter"]'); await click('[data-class="fighter"]'); await sleep(200); await click('#ccNext');

 // ---- the new Path step ----
 await p.waitForSelector('[data-sub]');
 const subs=await p.$$eval('[data-sub]',e=>e.map(x=>x.querySelector('.on-name').textContent.trim()));
 console.log('fighter paths offered  :',subs.join(', '));
 await click('[data-sub="gunslinger"]'); await sleep(400);
 const feat=await p.$$eval('.feature-list .feature',e=>e.map(x=>x.textContent.trim().slice(0,70)));
 console.log('perks shown            :',feat.length);
 feat.forEach(f=>console.log('   ·',f));
 await p.screenshot({path:'/tmp/path-step.png'});
 await click('#ccNext');

 await p.waitForSelector('[data-origin="soldier"]'); await click('[data-origin="soldier"]'); await sleep(200); await click('#ccNext');
 await p.waitForSelector('#useRec'); await click('#useRec'); await sleep(300); await click('#ccNext');
 await p.waitForSelector('.app-tab'); await sleep(300); await click('#ccNext');
 await p.waitForSelector('#sparkBack'); await sleep(200); await click('#ccNext');
 await p.waitForSelector('.review-grid');
 const rev=await p.$$eval('.rev',e=>e.map(x=>x.textContent.replace(/\s+/g,' ').trim().slice(0,46)));
 console.log('review cards           :',rev.join(' | '));
 await p.screenshot({path:'/tmp/review.png'});
 await click('#ccNext');

 await p.waitForSelector('#screen-game.active .choice'); await sleep(400);
 const side=await p.$eval('#sideHero',e=>e.textContent.replace(/\s+/g,' ').trim());
 console.log('sidebar                :',side.slice(0,70));

 // play to the end, preferring the new Perry-path scenes
 const WANT=/tree|oven|grammy|trial|song|slice|crimp|bake|share|apolog|recipe/i;
 let n=0,ended=false,gunshot=false;const seen=new Set();
 for(;n<900;n++){
   if(await p.$eval('#screen-end',e=>e.classList.contains('active'))){ended=true;break;}
   const bs=await p.$$('#choices .choice:not(.locked)');
   if(!bs.length)break;
   const texts=await Promise.all(bs.map(x=>p.evaluate(e=>e.textContent,x)));
   const gi=texts.findIndex(t=>/revolver|Draw and put a round/i.test(t));
   let i;
   if(gi>=0){i=gi;gunshot=true;}
   else if(n<8&&texts.some(t=>/arguing trees|shouting at each other/i.test(t))){i=texts.findIndex(t=>/arguing trees|shouting at each other/i.test(t));}
   else if(n<45){ // early on, steer into the new Perry-path content...
     const pref=texts.map((t,j)=>WANT.test(t)?j:-1).filter(j=>j>=0);
     i=pref.length?pref[Math.floor(Math.random()*pref.length)]:Math.floor(Math.random()*bs.length);
   } else { // ...then walk randomly so the run actually terminates
     i=Math.floor(Math.random()*bs.length);
   }
   const t=await p.$eval('.art-title',e=>e.textContent).catch(()=>'');
   if(t)seen.add(t);
   await bs[i].click(); await sleep(80);
   if(await p.$eval('#diceOverlay',e=>e.classList.contains('show'))){
     await p.waitForFunction(()=>{const a=document.querySelector('#diceActions');return (a&&a.children.length)||document.querySelector('#usePerk');},{timeout:6000}).catch(()=>{});
     const acc=await p.$('#acceptFail'); if(acc)await acc.click();
     await p.waitForFunction(()=>{const a=document.querySelector('#diceActions');return a&&a.querySelector('#diceGo');},{timeout:6000}).catch(()=>{});
     const go=await p.$('#diceGo'); if(go)await go.click();
     await p.waitForFunction(()=>!document.querySelector('#diceOverlay').classList.contains('show'),{timeout:6000}).catch(()=>{});
     await sleep(80);
   }
 }
 console.log('gunslinger-only choice offered:',gunshot);
 console.log(ended?`✓ episode completed in ${n} choices`:'⚠ did not finish');
 console.log('distinct scenes seen   :',seen.size);
 const perrySeen=[...seen].filter(t=>/Tree|Oven|Grammy|Trial|Song|Slice|Share|Argument|Crimp|Morning|Red|Green|Crew|Warm|SHARE/i.test(t));
 console.log('Perry-path scenes hit  :',perrySeen.length);
 perrySeen.slice(0,14).forEach(t=>console.log('   ·',t));
 if(!ended)console.log('stuck at               :',await p.$eval('.art-title',e=>e.textContent).catch(()=>'?'));
 if(!ended){await b.close();process.exit(1);}

 await p.waitForFunction(()=>{const e=document.querySelector('#endCompare');return e&&e.children.length;},{timeout:20000});
 await sleep(800);
 const cmp=await p.evaluate(()=>{
   const h=document.querySelector('#endCompare');
   return {heads:[...h.querySelectorAll('h3')].map(x=>x.textContent.trim()),
     keys:[...h.querySelectorAll('.ec-k')].map(x=>x.textContent.trim()),
     only:[...h.querySelectorAll('.cmp-item.uniq')].length,
     same:[...h.querySelectorAll('.cmp-item.same')].map(x=>x.textContent.trim())};
 });
 console.log('\n--- END COMPARISON ---');
 cmp.heads.forEach(h=>console.log('  ',h));
 cmp.keys.forEach(k=>console.log('   section:',k));
 console.log('   unique entries:',cmp.only,'| shared:',cmp.same.length);
 cmp.same.slice(0,4).forEach(x=>console.log('     = '+x));
 await p.evaluate(()=>document.querySelector('#endCompare').scrollIntoView({block:'center'}));
 await sleep(400); await p.screenshot({path:'/tmp/compare-perry.png'});
 console.log('\nJS errors:',errs.length?errs.join('\n'):'none');
 await b.close();
})();
