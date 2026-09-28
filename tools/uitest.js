const puppeteer = require('puppeteer');
const sleep = ms => new Promise(r=>setTimeout(r,ms));
(async () => {
  const browser = await puppeteer.launch({ args:['--no-sandbox','--disable-dev-shm-usage'] });
  const page = await browser.newPage();
  await page.setViewport({ width:1400, height:1000 });
  const errors = [];
  page.on('console', m => { if(m.type()==='error'){const t=m.text(); if(!/gstatic|firebase|ERR_|Failed to load resource/i.test(t)) errors.push('CONSOLE: '+t);} });
  page.on('pageerror', e => errors.push('PAGEERROR: '+e.message));

  const click = async (sel) => { await page.waitForSelector(sel,{visible:true,timeout:8000}); await page.click(sel); };
  const step = async (sel) => { await page.waitForFunction(s=>{const e=document.querySelector('#ccNext');return e&&!e.disabled&&document.querySelector(s);}, {timeout:8000}, sel); };

  await page.goto('http://localhost:8080/index.html?local=1',{waitUntil:'networkidle2',timeout:30000});
  await page.waitForSelector('.who-chip[data-player="nergis"]');
  console.log('✓ start screen:', await page.$eval('#welcomeTitle',e=>e.textContent));
  await page.screenshot({path:'/tmp/s1-start.png'});

  await click('.who-chip[data-player="nergis"]');
  // In cloud mode selecting a player is a network round-trip that re-renders the
  // start screen. Wait for the selection to actually land before clicking on.
  await page.waitForFunction(()=>{
    const c=document.querySelector('.who-chip[data-player="nergis"]');
    return c && c.classList.contains('on') && document.querySelector('#btnNew');
  },{timeout:20000});
  await click('#btnNew');
  await page.waitForSelector('.ep-card');
  console.log('✓ episode cards:', await page.$$eval('.ep-card',e=>e.length));
  await page.screenshot({path:'/tmp/s2-episodes.png'});

  await click('.ep-card.playable [data-act]');
  await page.waitForSelector('#fName');
  await page.type('#fName','Nergis the Bold');
  await page.waitForFunction(()=>!document.querySelector('#ccNext').disabled);
  await click('#ccNext');

  await click('[data-race="tiefling"]');          await sleep(150);
  await page.waitForSelector('[data-race="tiefling"].on'); await click('#ccNext');
  await page.waitForSelector('[data-class="bard"]');
  await click('[data-class="bard"]');             await sleep(150);
  await page.waitForSelector('[data-class="bard"].on'); await click('#ccNext');
  // subclass / Path step
  await page.waitForSelector('[data-sub]');
  const paths = await page.$$eval('[data-sub]', e => e.map(x => x.dataset.sub));
  console.log('✓ bard paths:', paths.join(', '));
  await click('[data-sub="lore"]'); await sleep(150);
  await page.waitForSelector('[data-sub="lore"].on'); await click('#ccNext');
  await page.waitForSelector('[data-origin="entertainer"]');
  await click('[data-origin="entertainer"]');     await sleep(150);
  await page.waitForSelector('[data-origin="entertainer"].on'); await click('#ccNext');

  await page.waitForSelector('#useRec');
  await click('#useRec');
  await page.waitForFunction(()=>/All points spent/.test(document.querySelector('.points-left').textContent));
  console.log('✓ abilities:', await page.$eval('.points-left',e=>e.textContent.trim()));
  await click('#ccNext');

  await page.waitForSelector('.app-tab');
  console.log('✓ appearance tabs:', await page.$$eval('.app-tab',e=>e.length));
  await click('[data-tab="outfit"]');
  await page.waitForSelector('.sw');
  console.log('✓ outfit swatches:', await page.$$eval('.sw',e=>e.length));
  await page.screenshot({path:'/tmp/s3-appearance.png'});
  await click('[data-tab="hair"]'); await page.waitForSelector('.chip');
  console.log('✓ hair styles:', await page.$$eval('.chips .chip',e=>e.length));
  await click('#ccNext');

  await page.waitForSelector('#sparkBack');
  await click('#sparkBack');
  await page.waitForFunction(()=>document.querySelector('#fBack').value.length>20);
  console.log('✓ backstory generated');
  await click('#ccNext');

  await page.waitForSelector('.review-grid');
  console.log('✓ review screen');
  await page.screenshot({path:'/tmp/s4-review.png'});
  await click('#ccNext');

  await page.waitForSelector('#screen-game.active #choices .choice');
  console.log('✓ game started');
  await page.screenshot({path:'/tmp/s5-game.png'});

  let checks=0, plains=0, ended=false, gotDiceShot=false;
  for(let i=0;i<60;i++){
    if(await page.$eval('#screen-end',e=>e.classList.contains('active'))){ended=true;console.log('✓ reached episode END at choice',i);break;}
    const btns = await page.$$('#choices .choice:not(.locked)');
    if(!btns.length){console.log('⚠ no choices available at step',i);break;}
    await btns[Math.floor(Math.random()*btns.length)].click();
    await sleep(140);
    if(await page.$eval('#diceOverlay',e=>e.classList.contains('show'))){
      checks++;
      await page.waitForFunction(()=>{const a=document.querySelector('#diceActions');const p=document.querySelector('#usePerk');return (a&&a.children.length)||p;},{timeout:6000});
      if(!gotDiceShot){await page.screenshot({path:'/tmp/s6-dice.png'});gotDiceShot=true;}
      const perk = await page.$('#acceptFail');
      if(perk) await perk.click(); else await click('#diceGo');
      await page.waitForFunction(()=>!document.querySelector('#diceOverlay').classList.contains('show'),{timeout:6000});
      await sleep(120);
    } else plains++;
  }
  console.log(`✓ played ${checks} skill checks + ${plains} plain choices`);
  await page.screenshot({path:'/tmp/s7-mid.png'});

  if(!ended){
    console.log('  sidebar:', (await page.$eval('#sideHero',e=>e.textContent.replace(/\s+/g,' '))).slice(0,80));
    await click('#gChron');
  } else {
    await click('#endChron');
  }
  await page.waitForSelector('#screen-chronicle.active');
  await sleep(600);
  console.log('✓ chronicle opens');
  await page.screenshot({path:'/tmp/s8-chronicle.png'});

  // reload → continue persistence
  await page.goto('http://localhost:8080/index.html?local=1',{waitUntil:'networkidle2'});
  await page.waitForSelector('.who-chip[data-player="nergis"]');
  await click('.who-chip[data-player="nergis"]');
  await sleep(700);
  const contVisible = await page.$eval('#btnContinue',e=>e.style.display!=='none');
  console.log(contVisible ? '✓ save persisted across reload (Continue shown)' : (ended?'✓ episode completed (no continue expected)':'✗ save did NOT persist'));

  console.log(errors.length ? '\n✗ ERRORS:\n'+[...new Set(errors)].slice(0,12).join('\n') : '\n✓ NO JS ERRORS');
  await browser.close();
  process.exit(errors.length?1:0);
})();
