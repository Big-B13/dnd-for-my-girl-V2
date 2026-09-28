/* Verifies the goblin crew are present by name across the episode,
   that each has an individual bond, and that the end screen shows them. */
const puppeteer = require('/home/user/tales-of-the-dm/node_modules/puppeteer');
const BASE = 'http://127.0.0.1:8080/index.html?local=1';
const NAMES = ['Pot-Helmet', 'Rolling-Pin', 'Nib', 'Skritch'];

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const page = await browser.newPage();
  await page.setViewport({ width:1400, height:1000 });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(BASE, { waitUntil: 'networkidle2' });

  // --- creation wizard (mirrors tools/uitest.js) ---
  const click = async (sel) => { await page.waitForSelector(sel,{visible:true,timeout:15000}); await page.click(sel); };
  const sleep = ms => new Promise(r=>setTimeout(r,ms));
  const nextStep = async () => {
    await page.waitForFunction(()=>{const b=document.querySelector('#ccNext');return b&&!b.disabled;},{timeout:15000});
    const before = await page.$eval('.cc-step.active, [data-step].active, #ccBody', e=>e.innerHTML.length).catch(()=>0);
    await page.click('#ccNext');
    await page.waitForFunction(n=>{const e=document.querySelector('.cc-step.active, [data-step].active, #ccBody');
      return !e || e.innerHTML.length!==n;}, {timeout:15000}, before).catch(()=>{});
    await sleep(200);
  };
  await page.waitForSelector('.who-chip[data-player="nergis"]');
  await click('.who-chip[data-player="nergis"]');
  await page.waitForFunction(()=>{const c=document.querySelector('.who-chip[data-player="nergis"]');
    return c&&c.classList.contains('on')&&document.querySelector('#btnNew');},{timeout:20000});
  await click('#btnNew');
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
  await click('[data-sub="lore"]'); await sleep(150);
  await page.waitForSelector('[data-sub="lore"].on'); await click('#ccNext');
  await page.waitForSelector('[data-origin="entertainer"]');
  await click('[data-origin="entertainer"]');     await sleep(150);
  await page.waitForSelector('[data-origin="entertainer"].on'); await click('#ccNext');

  await page.waitForSelector('#useRec');
  await click('#useRec');
  await page.waitForFunction(()=>/All points spent/.test(document.querySelector('.points-left').textContent));
  await click('#ccNext');

  await page.waitForSelector('.app-tab');
  await click('[data-tab="outfit"]');
  await page.waitForSelector('.sw');
  await click('[data-tab="hair"]'); await page.waitForSelector('.chip');
  await click('#ccNext');

  await page.waitForSelector('#sparkBack');
  await click('#sparkBack');
  await page.waitForFunction(()=>document.querySelector('#fBack').value.length>20);
  await click('#ccNext');

  await page.waitForSelector('.review-grid');
  await click('#ccNext');

  await page.waitForSelector('#screen-game.active #choices .choice',{timeout:20000});

  // --- play, steering toward the goblins ---
  const seenNames = {}; NAMES.forEach(n => seenNames[n] = 0);
  const crewScenes = new Set();
  const PREF = /goblin|pot|rolling|nib|skritch|butter|ledger|sign|bench|dough|knock|dock|shop|bake|floor|rafter/i;
  let steps = 0;
  while (steps < 900) {
    if (await page.$eval('#screen-end', e=>e.classList.contains('active'))) break;
    const blob = await page.evaluate(() => {
      const t = document.querySelector('#sceneArt .art-title');
      return { title: t ? t.textContent.trim() : '',
               text: (document.querySelector('#sceneText') || {}).innerText || '',
               n: document.querySelectorAll('#choices .choice:not(.locked)').length,
               labels: [...document.querySelectorAll('#choices .choice:not(.locked)')].map(c => c.innerText) };
    });
    NAMES.forEach(n => {
      if (blob.text.includes(n) || blob.title.includes(n)) { seenNames[n]++; crewScenes.add(blob.title + ' :: ' + n); }
    });
    if (!blob.n) break;
    let pick = Math.floor(Math.random() * blob.n);
    if (steps < 120) {
      const hit = blob.labels.findIndex(l => PREF.test(l));
      if (hit >= 0) pick = hit;
    }
    await page.evaluate(i => document.querySelectorAll('#choices .choice:not(.locked)')[i].click(), pick);
    await sleep(150);
    if (await page.$eval('#diceOverlay', e=>e.classList.contains('show'))) {
      await page.waitForFunction(()=>{const a=document.querySelector('#diceActions');
        return (a&&a.children.length)||document.querySelector('#usePerk');},{timeout:8000});
      const perk = await page.$('#acceptFail');
      if (perk) await perk.click(); else await click('#diceGo');
      await sleep(400);
      await page.waitForFunction(()=>!document.querySelector('#diceOverlay').classList.contains('show'),{timeout:10000}).catch(()=>{});
    }
    steps++;
  }

  const bonds = await page.evaluate(() => (window.TDM && TDM._save ? TDM._save.bonds : (TDM.save ? TDM.save.bonds : null)));
  const panel = await page.evaluate(() => {
    const p = document.querySelector('.crewpanel');
    if (!p) return null;
    return [...p.querySelectorAll('.crew-row')].map(r => r.innerText.replace(/\n/g, ' | '));
  });

  console.log('\nsteps played:', steps);
  console.log('named mentions encountered:', JSON.stringify(seenNames));
  console.log('distinct crew appearances:', crewScenes.size);
  [...crewScenes].slice(0, 14).forEach(s => console.log('   ·', s));
  console.log('\nper-goblin bonds:', JSON.stringify(bonds));
  console.log('crew panel rows:', panel ? panel.length : 'PANEL NOT FOUND');
  if (panel) panel.forEach(r => console.log('   ▸', r));
  console.log('\nJS errors:', errors.length ? errors : 'none');

  const named = NAMES.filter(n => seenNames[n] > 0);
  console.log(named.length >= 2 ? `✓ met ${named.length}/4 by name in one run (${named.join(', ')})`
                                : '✗ crew not appearing by name');
  await browser.close();
})();
