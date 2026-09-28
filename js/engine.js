/* ============================================================
   TALES OF THE DM — Game engine (pure logic, no DOM)
   Dice, checks, perks, effects, consequences, XP.
   ============================================================ */
(function () {
  const TDM = (typeof window !== 'undefined')
    ? (window.TDM = window.TDM || {})
    : (global.TDM = global.TDM || {});
  const OPT = TDM.CHAR_OPTIONS;

  const util = {
    uid: () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    now: () => Date.now(),
    clone: (o) => JSON.parse(JSON.stringify(o)),
    d: (n) => 1 + Math.floor(Math.random() * n),
    cap: (s) => s.charAt(0).toUpperCase() + s.slice(1)
  };

  /* ---------- dice ---------- */
  // parse "2d6+3", "1d10", "4", "1d4+1d2"
  function rollExpr(expr) {
    if (typeof expr === 'number') return { total: expr, rolls: [expr] };
    const rolls = []; let total = 0;
    const m = String(expr).match(/([+-]?\s*\d*d\d+|[+-]?\s*\d+)/gi) || [];
    for (const part of m) {
      const t = part.replace(/\s+/g, '');
      const dm = t.match(/^([+-]?)(\d*)d(\d+)$/i);
      if (dm) {
        const sign = dm[1] === '-' ? -1 : 1;
        const count = Math.min(parseInt(dm[2] || '1', 10), 50);
        for (let i = 0; i < count; i++) { const r = util.d(parseInt(dm[3], 10)); rolls.push(sign * r); total += sign * r; }
      } else {
        const v = parseInt(t, 10); rolls.push(v); total += v;
      }
    }
    return { total, rolls };
  }

  /* ---------- character derivation ---------- */

  function abilityMods(char) {
    const mods = {};
    for (const a of Object.keys(OPT.ABILITIES)) {
      const score = (char.stats && char.stats[a]) || 10;
      mods[a] = Math.floor(((score || 10) - 10) / 2);
    }
    return mods;
  }

  function profSkills(char) {
    const set = new Set();
    const cls = OPT.CLASSES.find(c => c.id === char.class);
    const origin = OPT.ORIGINS.find(o => o.id === char.origin);
    if (cls) cls.skills.forEach(s => set.add(s));
    if (origin) origin.skills.forEach(s => set.add(s));
    (char.extraSkills || []).forEach(s => set.add(s));
    return set;
  }

  function profBonus(level) { const l = level || 1; return l < 5 ? 2 : l < 9 ? 3 : l < 13 ? 4 : l < 17 ? 5 : 6; }

  function maxHpFor(char) {
    const cls = OPT.CLASSES.find(c => c.id === char.class) || OPT.CLASSES[0];
    const con = abilityMods(char).CON;
    let hp = cls.hp + con + ((char.level || 1) - 1) * 4;
    (char.boons || []).forEach(b => { if (b && b.hp) hp += b.hp; });
    return Math.max(4, hp);
  }

  function skillsFor(char) {
    const mods = abilityMods(char);
    const prof = profSkills(char);
    const pb = profBonus(char.level || 1);
    const out = {};
    for (const [id, stat] of Object.entries(OPT.SKILL_STATS)) {
      out[id] = mods[stat] + (prof.has(id) ? pb : 0);
    }
    return out;
  }

  function racePerks(char) {
    const race = OPT.RACES.find(r => r.id === char.race);
    return (race && race.perks) || [];
  }
  function classPerk(char) {
    const cls = OPT.CLASSES.find(c => c.id === char.class);
    return (cls && cls.perk) ? [cls.perk] : [];
  }
  /* A subclass grants its own perk on top of the base class perk. */
  function subclassDef(char) {
    const list = (OPT.SUBCLASSES || {})[char.class] || [];
    return list.find(sc => sc.id === char.subclass) || null;
  }
  function subclassPerk(char) {
    const sc = subclassDef(char);
    return (sc && sc.perk) ? [sc.perk] : [];
  }
  /* Tags a character carries — used by scenes via `reqTag` to open
     subclass-only choices (e.g. the Gunslinger's revolver). */
  function charTags(char) {
    const out = [];
    const sc = subclassDef(char);
    if (sc) { out.push('sub:' + sc.id); if (sc.tag) out.push(sc.tag); }
    if (char.class) out.push('class:' + char.class);
    if (char.race) out.push('race:' + char.race);
    return out;
  }
  function hasTag(char, tag) { return charTags(char).indexOf(tag) !== -1; }
  function allPerks(char) { return racePerks(char).concat(classPerk(char), subclassPerk(char)); }

  function hasPassive(char, id) {
    const cls = OPT.CLASSES.find(c => c.id === char.class);
    return !!(cls && cls.passive === id);
  }

  /* ---------- state views ---------- */

  function view(save) {
    const char = save.char;
    const mods = abilityMods(char);
    const skills = skillsFor(char);
    const pron = char.pronouns || { subject: 'they', object: 'them', possessive: 'their', is: 'are' };
    const race = OPT.RACES.find(r => r.id === char.race) || {};
    const cls = OPT.CLASSES.find(c => c.id === char.class) || {};
    return {
      char, save,
      name: char.name,
      pron,
      race, cls,
      raceName: race.name || '', className: cls.name || '', originName: (OPT.ORIGINS.find(o => o.id === char.origin) || {}).name || '',
      flags: save.flags,
      bonds: save.bonds,
      gold: save.gold,
      hp: save.hp, maxHp: save.maxHp,
      level: save.level, xp: save.xp,
      isRace: (id) => char.race === id,
      isClass: (id) => char.class === id,
      isOrigin: (id) => char.origin === id,
      hasPassive: (id) => hasPassive(char, id),
      has: (id) => save.items.some(it => it.id === id && it.qty > 0),
      itemQty: (id) => { const it = save.items.find(x => x.id === id); return it ? it.qty : 0; },
      bond: (n) => save.bonds[n] || 0,
      // Has this exact choice already been taken? Lets scenes stop offering
      // the same action twice, so hubs empty out instead of looping forever.
      taken: (scene, text) => save.choices.some(c => c.scene === scene && (text == null || c.text === text)),
      visited: (scene) => save.choices.some(c => c.scene === scene),
      mod: (a) => mods[a] || 0,
      skill: (id) => skills[id] || 0,
      skills, mods,
      t: (which) => pron[which] || which
    };
  }

  /* ---------- conditions ---------- */
  // {race, cls, origin, item, flag, noflag, prof, passive, level}
  function evalCond(save, c) {
    const S = view(save);
    if (c.race) return S.isRace(c.race);
    if (c.cls) return S.isClass(c.cls);
    if (c.origin) return S.isOrigin(c.origin);
    if (c.item) return S.has(c.item);
    if (c.flag !== undefined) return save.flags[c.flag] === (c.value !== undefined ? c.value : true);
    if (c.noflag !== undefined) return save.flags[c.noflag] !== (c.value !== undefined ? c.value : true);
    if (c.prof) return profSkills(save.char).has(c.prof);
    if (c.passive) return S.hasPassive(c.passive);
    if (c.level) return save.level >= c.level;
    if (c.any) return c.any.some(sub => evalCond(save, sub));
    if (c.all) return c.all.every(sub => evalCond(save, sub));
    return false;
  }
  function condLabel(c) {
    if (c.race) return OPT.RACES.find(r => r.id === c.race).name;
    if (c.cls) return OPT.CLASSES.find(x => x.id === c.cls).name;
    if (c.origin) return OPT.ORIGINS.find(x => x.id === c.origin).name;
    if (c.item) return (TDM.ITEMS[c.item] || {}).name || c.item;
    if (c.prof) return OPT.SKILLS[c.prof] ? OPT.SKILLS[c.prof].name : c.prof;
    if (c.passive) return 'a special gift';
    return 'something you lack';
  }

  /* ---------- checks ---------- */

  function racialAdvFor(save, def) {
    // passive racial advantages
    const race = save.char.race;
    if (race === 'elf' && def.skill === 'perception') return 'Keen Senses';
    if (race === 'half_orc' && def.skill === 'intimidation') return 'Menacing';
    if (race === 'half_elf' && def.skill === 'persuasion' && save.flags.fey_audience) return 'Two Worlds';
    if (race === 'gnome' && def.save && def.magic && ['INT', 'WIS', 'CHA'].includes(def.stat)) return 'Gnome Cunning';
    if (race === 'dwarf' && def.save && def.poison) return 'Dwarven Resilience';
    return null;
  }

  function makeCheck(save, def) {
    const mods = abilityMods(save.char);
    const skills = skillsFor(save.char);
    const pb = profBonus(save.level || 1);
    const stat = def.stat;
    let mod = mods[stat] || 0;
    if (def.skill && profSkills(save.char).has(def.skill)) mod += pb;

    // advantage/disadvantage
    let adv = !!def.adv, dis = !!def.dis;
    let advSrc = adv ? (def.advLabel || 'an edge') : null;
    const rAdv = racialAdvFor(save, def);
    if (rAdv && !dis) { adv = true; advSrc = rAdv; }
    (def.advIf || []).forEach(c => { if (evalCond(save, c)) { adv = true; advSrc = advSrc || condLabel(c); } });
    let disSrc = null;
    (def.disIf || []).forEach(c => { if (evalCond(save, c)) { dis = true; disSrc = disSrc || condLabel(c); } });
    if (save.poisoned > 0 && !def.noPoisonMalus) { dis = true; disSrc = disSrc || 'poison'; }
    if (adv && dis) { adv = false; dis = false; advSrc = null; disSrc = null; } // cancel out

    const nDice = (adv || dis) ? 2 : 1;
    let d20s = [];
    let luckNote = null;
    for (let i = 0; i < nDice; i++) {
      let r = util.d(20);
      // Halfling Luck: free reroll on natural 1
      if (r === 1 && save.char.race === 'halfling') { const r2 = util.d(20); luckNote = `Halfling Luck! A natural 1 flips to ${r2}.`; r = r2; }
      d20s.push(r);
    }
    const kept = adv ? Math.max(...d20s) : dis ? Math.min(...d20s) : d20s[0];
    const nat20 = kept === 20, nat1 = kept === 1;
    const total = kept + mod;
    let ok = nat20 ? true : nat1 ? false : total >= def.dc;
    return {
      stat, dc: def.dc, skill: def.skill || null,
      label: def.label || (def.skill ? OPT.SKILLS[def.skill].name : OPT.ABILITIES[stat].name),
      icon: def.skill ? OPT.SKILLS[def.skill].icon : OPT.ABILITIES[stat].icon,
      mod, d20s, kept, nat20, nat1, total, ok, adv, dis, advSrc, disSrc, luckNote,
      save: !!def.save, magic: !!def.magic
    };
  }

  function usablePerks(save, def) {
    const out = [];
    for (const p of allPerks(save.char)) {
      if (save.perksUsed[p.id]) continue;
      if (p.trigger !== 'fail_reroll' && p.trigger !== 'fail_succeed') continue;
      const scopeOk = p.scope === 'any' || (Array.isArray(p.scope) && p.scope.includes(def.stat));
      if (!scopeOk) continue;
      out.push(p);
    }
    return out;
  }

  function perkReroll(save, def, perk) {
    save.perksUsed[perk.id] = true;
    let r = util.d(20);
    if (r === 1 && save.char.race === 'halfling') r = util.d(20);
    const mods = abilityMods(save.char);
    let mod = mods[def.stat] || 0;
    if (def.skill && profSkills(save.char).has(def.skill)) mod += profBonus(save.level || 1);
    const total = r + mod;
    return { d20s: [r], kept: r, total, mod, ok: def.trigger === 'fail_succeed' ? true : (r === 20 ? true : r === 1 ? false : total >= def.dc), perkUsed: perk.id };
  }

  /* ---------- effects ---------- */

  const XP_LEVELS = [0, 300, 900, 2700, 6500, 14000];

  function addItem(save, id, qty) {
    const ex = save.items.find(x => x.id === id);
    if (ex) ex.qty += (qty || 1); else save.items.push({ id, qty: qty || 1 });
  }
  function removeItem(save, id, qty) {
    const ex = save.items.find(x => x.id === id);
    if (!ex) return;
    ex.qty -= (qty || 1);
    if (ex.qty <= 0) save.items = save.items.filter(x => x.id !== id);
  }
  function itemName(id) { return (TDM.ITEMS[id] && TDM.ITEMS[id].name) || id; }
  function itemIcon(id) { return (TDM.ITEMS[id] && TDM.ITEMS[id].icon) || '📦'; }

  // returns { toasts:[], saves:[rollInfo], leveledUp, ko, hpAfter }
  function applyEffects(save, effects, ctx) {
    const out = { toasts: [], saves: [], leveledUp: false, ko: false, hpAfter: save.hp };
    if (!effects) return out;
    const S = view(save);

    if (effects.flags) for (const [k, v] of Object.entries(effects.flags)) save.flags[k] = v;
    if (effects.bond) {
      for (const [k, v] of Object.entries(effects.bond)) {
        save.bonds[k] = (save.bonds[k] || 0) + v;
        out.toasts.push({ type: 'bond', who: k, delta: v, value: save.bonds[k] });
      }
    }
    if (effects.give) {
      const list = Array.isArray(effects.give) ? effects.give : [effects.give];
      list.forEach(g => {
        if (typeof g === 'string') { addItem(save, g, 1); out.toasts.push({ type: 'item', icon: itemIcon(g), text: itemName(g) }); }
        else { addItem(save, g.id, g.qty || 1); out.toasts.push({ type: 'item', icon: itemIcon(g.id), text: itemName(g.id) + (g.qty > 1 ? ' ×' + g.qty : '') }); }
      });
    }
    if (effects.take) {
      (Array.isArray(effects.take) ? effects.take : [effects.take]).forEach(t => removeItem(save, t, 1));
    }
    if (effects.gold) {
      save.gold = Math.max(0, save.gold + effects.gold);
      out.toasts.push({ type: 'gold', amount: effects.gold });
    }
    if (effects.xp) {
      const before = save.level;
      save.xp += effects.xp;
      while (save.level < XP_LEVELS.length && save.xp >= XP_LEVELS[save.level]) { save.level++; out.leveledUp = true; }
      if (out.leveledUp) {
        save.maxHp = maxHpFor(save.char) + (save.level - 1) * 0; // recomputed below with level
        save.maxHp = maxHpFor(save.char);
        save.hp = Math.min(save.maxHp, save.hp + 5);
      }
    }
    if (effects.damage) {
      const r = rollExpr(effects.damage);
      const immuneFire = save.char.race === 'tiefling' && effects.fire;
      if (!immuneFire) {
        save.hp -= r.total;
        out.toasts.push({ type: 'damage', amount: r.total, detail: r.rolls });
      } else {
        out.toasts.push({ type: 'immune', text: 'Hellish Resistance — the fire does not touch you.' });
      }
    }
    if (effects.heal) {
      if (effects.heal === 'full') save.hp = save.maxHp;
      else { const r = rollExpr(effects.heal); save.hp = Math.min(save.maxHp, save.hp + r.total); out.toasts.push({ type: 'heal', amount: save.maxHp - save.hp >= 0 ? r.total : r.total }); }
    }
    if (effects.poisoned) save.poisoned = Math.max(save.poisoned, effects.poisoned);

    // nested save (e.g., poison save after a trap)
    if (effects.save) {
      const sv = effects.save;
      const roll = makeCheck(save, { stat: sv.stat, dc: sv.dc, skill: sv.skill, label: sv.label, save: true, magic: sv.magic, poison: sv.poison });
      out.saves.push({ roll, label: sv.label || 'Saving Throw' });
      const branch = roll.ok ? sv.successEffects : sv.failEffects;
      if (branch) {
        const sub = applyEffects(save, branch, ctx);
        out.toasts = out.toasts.concat(sub.toasts);
        out.saves = out.saves.concat(sub.saves);
        if (sub.leveledUp) out.leveledUp = true;
      }
      if (!roll.ok && sv.onFailText) out.toasts.push({ type: 'note', text: sv.onFailText });
      if (roll.ok && sv.onSuccessText) out.toasts.push({ type: 'note', text: sv.onSuccessText });
    }

    if (effects.remember) out.toasts.push({ type: 'remember' });
    if (effects.chronicle) {
      // A scene can be revisited; a defining moment is only recorded once.
      const key = effects.chronicleKey || effects.chronicle;
      if (!save.majors.some(m => m.key === key)) {
        save.majors.push({ key, text: effects.chronicle, at: util.now() });
      }
    }
    if (effects.note) out.toasts.push({ type: 'note', text: effects.note });

    // KO check
    if (save.hp <= 0) {
      const rel = racePerks(save.char).find(p => p.trigger === 'ko_save' && !save.perksUsed[p.id]);
      if (rel) {
        save.perksUsed[rel.id] = true;
        save.hp = 1;
        out.toasts.push({ type: 'perk', text: `${rel.name} — you refuse to fall.` });
      } else {
        out.ko = true;
        save.hp = Math.max(1, Math.ceil(save.maxHp / 2));
        save.flags.__ko = (save.flags.__ko || 0) + 1;
        const lost = Math.min(save.gold, util.d(6));
        save.gold -= lost;
        if (lost > 0) out.toasts.push({ type: 'gold', amount: -lost });
        save.poisoned = 0;
      }
    }
    out.hpAfter = save.hp;
    return out;
  }

  /* ---------- choices & scenes ---------- */

  function sceneOf(episode, id) { return episode.scenes[id]; }

  function visibleChoices(save, episode, scene) {
    return (scene.choices || []).filter(c => {
      if (c.if && !c.if(view(save))) return false;
      // `reqTag` is a hard filter, not a lock: a Gunslinger's revolver option
      // simply does not exist for anyone else, rather than teasing them with
      // something they can never pick.
      if (c.reqTag) {
        const tags = Array.isArray(c.reqTag) ? c.reqTag : [c.reqTag];
        if (!tags.some(t => hasTag(save.char, t))) return false;
      }
      if (c.req) return true; // shown, possibly locked
      return true;
    });
  }

  function choiceLocked(save, choice) {
    if (!choice.req) return null;
    for (const c of (Array.isArray(choice.req) ? choice.req : [choice.req])) {
      if (!evalCond(save, c)) return condLabel(c);
    }
    return null;
  }

  // Resolve what happens when a choice is clicked (before any rolls animate)
  function planChoice(save, episode, sceneId, choiceIdx) {
    const scene = sceneOf(episode, sceneId);
    const choice = scene.choices[choiceIdx];
    if (!choice) return null;
    if (choice.check) {
      return {
        kind: 'check',
        check: choice.check,
        success: choice.success || { goto: choice.goto, effects: choice.effects },
        fail: choice.fail || { goto: choice.goto, effects: choice.failEffects },
        text: choice.text
      };
    }
    return { kind: 'plain', goto: choice.goto, effects: choice.effects, text: choice.text };
  }

  // Enter a scene: apply onEnter effects, return toast bundle
  function enterScene(save, episode, sceneId) {
    const scene = sceneOf(episode, sceneId);
    save.sceneId = sceneId;
    if (scene && scene.onEnter) {
      const fx = (typeof scene.onEnter === 'function') ? scene.onEnter(view(save)) : scene.onEnter;
      const res = applyEffects(save, fx);
      if (fx && fx.poisonTick !== false && save.poisoned > 0 && fx.poisoned === undefined) save.poisoned = Math.max(0, save.poisoned - 1);
      return res;
    }
    if (save.poisoned > 0) save.poisoned = Math.max(0, save.poisoned - 1);
    return { toasts: [], saves: [], leveledUp: false, ko: false };
  }

  // Commit a branch result (after animation): apply effects, log choice, route to next scene.
  // Returns { goto, res }
  function commit(save, episode, sceneId, choiceIdx, branch, checkResult) {
    const scene = sceneOf(episode, sceneId);
    const choice = scene.choices[choiceIdx];
    save.choices.push({
      scene: sceneId, text: choice.text,
      roll: checkResult ? { label: checkResult.label, d20: checkResult.kept, mod: checkResult.mod, total: checkResult.total, dc: checkResult.dc, ok: checkResult.ok } : null,
      at: util.now()
    });
    if (checkResult) save.rolls.push({ label: checkResult.label, d20: checkResult.kept, mod: checkResult.mod, total: checkResult.total, dc: checkResult.dc, ok: checkResult.ok, at: util.now() });
    const res = applyEffects(save, branch.effects);
    let gotoId = branch.goto;
    if (typeof gotoId === 'function') gotoId = gotoId(view(save), checkResult);
    if (res.ko) gotoId = episode.koScene || gotoId;
    if (gotoId) {
      const enterRes = enterScene(save, episode, gotoId);
      res.toasts = res.toasts.concat(enterRes.toasts);
      res.saves = res.saves.concat(enterRes.saves);
      if (enterRes.ko) { res.ko = true; save.sceneId = episode.koScene; }
    } else {
      save.sceneId = sceneId;
    }
    return { goto: save.sceneId, res };
  }

  /* ---------- new game state ---------- */

  function newSave(episode, char, playerName) {
    const save = {
      v: 1,
      episodeId: episode.id,
      playerName,
      charId: char.id,
      sceneId: episode.start,
      char: util.clone(char),
      flags: {}, bonds: {}, items: [], gold: char.startGold != null ? char.startGold : 25,
      hp: 0, maxHp: 0, level: char.level || 1, xp: char.xp || 0,
      perksUsed: {}, poisoned: 0,
      choices: [], majors: [], rolls: [],
      completed: false, startedAt: util.now(), updatedAt: util.now()
    };
    // starting inventory from character
    (char.startItems || []).forEach(id => addItem(save, id, 1));
    save.maxHp = maxHpFor(char);
    save.hp = save.maxHp;
    return save;
  }

  function syncCharFromSave(save) {
    // at episode end: character keeps level/xp/boons/spells/keepsakes
    const c = save.char;
    c.level = save.level;
    c.xp = save.xp;
    c.episodesCompleted = c.episodesCompleted || [];
    if (!c.episodesCompleted.includes(save.episodeId)) c.episodesCompleted.push(save.episodeId);
    return c;
  }

  /* ---------- episode validation (used by tools & dev console) ---------- */

  function validateEpisode(ep) {
    const errs = [];
    if (!ep.id) errs.push('episode missing id');
    if (!ep.start || !ep.scenes[ep.start]) errs.push('start scene invalid');
    if (!ep.koScene || !ep.scenes[ep.koScene]) errs.push('koScene invalid');
    const ids = new Map();
    for (const [sid, scene] of Object.entries(ep.scenes)) {
      (scene.choices || []).forEach((c, i) => {
        const targets = [];
        const isEnd = ('goto' in c) && c.goto === null;       // explicit "episode ends here"
        if (c.goto) targets.push(c.goto);
        if (c.check) { if (c.success) targets.push(c.success.goto); if (c.fail) targets.push(c.fail.goto); }
        if (targets.length === 0 && !isEnd) errs.push(`${sid} choice#${i}: no goto`);
        targets.forEach(t => { if (typeof t === 'string' && !ep.scenes[t]) errs.push(`${sid} choice#${i}: unknown scene "${t}"`); });
        if (c.check) {
          if (!OPT.ABILITIES[c.check.stat]) errs.push(`${sid} choice#${i}: bad stat ${c.check.stat}`);
          if (c.check.skill && !OPT.SKILLS[c.check.skill]) errs.push(`${sid} choice#${i}: bad skill ${c.check.skill}`);
        }
        if (c.effects && c.effects.give) {
          (Array.isArray(c.effects.give) ? c.effects.give : [c.effects.give]).forEach(g => {
            const id = typeof g === 'string' ? g : g.id;
            if (!TDM.ITEMS[id]) errs.push(`${sid} choice#${i}: unknown item "${id}"`);
          });
        }
        if (c.effects && c.effects.chronicle) {
          // The same deed may be reachable by more than one route. That is fine
          // as long as both routes agree on the key, so it records once.
          const ck = c.effects.chronicleKey || c.effects.chronicle;
          const prev = ids.get(c.effects.chronicle);
          if (prev !== undefined && prev !== ck) errs.push(`duplicate chronicle text with different keys: ${c.effects.chronicle}`);
          ids.set(c.effects.chronicle, ck);
        }
      });
      if (scene.onEnter && typeof scene.onEnter !== 'function' && scene.onEnter.give) {
        (Array.isArray(scene.onEnter.give) ? scene.onEnter.give : [scene.onEnter.give]).forEach(g => {
          const id = typeof g === 'string' ? g : g.id;
          if (!TDM.ITEMS[id]) errs.push(`${sid} onEnter: unknown item "${id}"`);
        });
      }
    }
    return errs;
  }

  TDM.engine = {
    util, rollExpr, abilityMods, profSkills, profBonus, skillsFor, maxHpFor,
    allPerks, hasPassive, view, evalCond, condLabel, makeCheck, usablePerks, perkReroll,
    subclassDef, subclassPerk, charTags, hasTag,
    applyEffects, visibleChoices, choiceLocked, planChoice, enterScene, commit,
    newSave, syncCharFromSave, validateEpisode, XP_LEVELS,
    addItem, removeItem, itemName, itemIcon
  };
})();
