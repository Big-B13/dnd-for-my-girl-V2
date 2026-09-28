/* ============================================================
   TALES OF THE DM — The Crew of Grammy's Bakery
   ------------------------------------------------------------
   Pot-Helmet, Rolling-Pin, Nib and Skritch were only present in
   the baking scenes. They are supposed to be in the whole story.

   This patch:
     · defines the four of them as real characters
     · rewrites the text of the goblin encounters so you meet
       them by name, from the road onward
     · tracks a SEPARATE bond with each one, so "the goblins"
       stops being a single number
     · adds a quiet character moment for each

   It only overrides scene TEXT and merges bond effects into
   existing choices — every `goto` in the episode is untouched.
   Loaded after episode1-perry.js.
   ============================================================ */
(function () {
  const TDM = (typeof window !== 'undefined')
    ? (window.TDM = window.TDM || {})
    : (global.TDM = global.TDM || {});

  /* ---------------- the crew ---------------- */
  const CREW = [
    {
      id: 'pot_helmet', name: 'Pot-Helmet', icon: '🥘',
      role: 'Marketing',
      tagline: 'Enthusiasm, weaponised.',
      desc: 'Wears a cooking pot as a helmet, at all times, including while sleeping. Has never had an indoor voice. Runs everywhere. Believes, sincerely and without evidence, that Grammy\'s is about to become the most famous bakery in the world.'
    },
    {
      id: 'rolling_pin', name: 'Rolling-Pin', icon: '🥖',
      role: 'Assistant Crust Commander',
      tagline: 'A rank he awarded himself.',
      desc: 'Self-appointed Assistant Crust Commander. Salutes. Guards things that do not need guarding. Takes the crust more seriously than anyone has ever taken anything, and would genuinely fight you over lamination.'
    },
    {
      id: 'nib', name: 'Nib', icon: '🧈',
      role: 'Butter and sugar',
      tagline: 'Tiny. Careful. Notices everything.',
      desc: 'The smallest of them, and the only one trusted with the butter and the sugar — because he is the only one who does not eat it. Speaks rarely. When he does, it is worth hearing.'
    },
    {
      id: 'skritch', name: 'Skritch', icon: '📋',
      role: 'Paperwork and inventory',
      tagline: 'Permanently, professionally nervous.',
      desc: 'Lanky, ink-stained, and in charge of the records nobody asked him to keep. Has inventoried every item in a building he does not legally own. The clipboard is load-bearing.'
    }
  ];
  const BY_ID = {};
  CREW.forEach(g => { BY_ID[g.id] = g; });
  TDM.CREW = CREW;
  TDM.CREW_BY_ID = BY_ID;

  /* Friendly label for a bond key, so toasts read "Nib" not "nib". */
  TDM.bondLabel = function (key) {
    if (BY_ID[key]) return BY_ID[key].name;
    return ({ goblins: 'The goblins', grammy: 'Grammy', crimp: 'Crimp', orchard: 'The orchard', dryads: 'The dryads' })[key]
      || (key.charAt(0).toUpperCase() + key.slice(1));
  };

  /* The crew now live natively in the episode files; this module is the
     roster, the display names, and the end-of-episode standings. */

  /* Crew standing, rendered on the end screen. */
  TDM.crewStanding = function (save) {
    const out = [];
    CREW.forEach(g => {
      const v = (save.bonds && save.bonds[g.id]) || 0;
      const met = !!(save.flags && save.flags['met_' + g.id]) || v !== 0;
      if (!met) return;
      let word, cls;
      if (v >= 10) { word = 'would follow you anywhere'; cls = 'good'; }
      else if (v >= 5) { word = 'trusts you'; cls = 'good'; }
      else if (v >= 1) { word = 'likes you'; cls = 'ok'; }
      else if (v === 0) { word = 'has not made up their mind'; cls = 'ok'; }
      else if (v > -6) { word = 'is wary of you'; cls = 'bad'; }
      else { word = 'is afraid of you'; cls = 'bad'; }
      out.push({ id: g.id, name: g.name, icon: g.icon, role: g.role, value: v, word, cls });
    });
    return out;
  };
})();
