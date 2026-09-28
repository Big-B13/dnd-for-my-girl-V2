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

  const ep = TDM.EPISODES && TDM.EPISODES.ep1_apple_pie;
  if (!ep) return;
  const SC = ep.scenes;

  /* ---------------- surgical helpers ---------------- */
  function setText(id, text) { if (SC[id]) SC[id].text = text; }

  /* Merge extra effects into an existing choice without touching its routing. */
  function addFx(id, idx, fx) {
    const sc = SC[id]; if (!sc || !sc.choices || !sc.choices[idx]) return;
    const c = sc.choices[idx];
    const targets = [];
    if (c.effects) targets.push(c.effects);
    if (c.success && c.success.effects) targets.push(c.success.effects);
    if (!targets.length) { c.effects = {}; targets.push(c.effects); }
    targets.forEach(t => {
      if (fx.bond) t.bond = Object.assign({}, t.bond, fx.bond);
      if (fx.flags) t.flags = Object.assign({}, t.flags, fx.flags);
    });
  }
  function addFxFail(id, idx, fx) {
    const sc = SC[id]; if (!sc || !sc.choices || !sc.choices[idx]) return;
    const c = sc.choices[idx];
    if (!c.fail) return;
    c.fail.effects = c.fail.effects || {};
    if (fx.bond) c.fail.effects.bond = Object.assign({}, c.fail.effects.bond, fx.bond);
    if (fx.flags) c.fail.effects.flags = Object.assign({}, c.fail.effects.flags, fx.flags);
  }
  function addChoice(id, choice, at) {
    const sc = SC[id]; if (!sc || !sc.choices) return;
    if (sc.choices.some(c => c.text === choice.text)) return;
    if (typeof at === 'number') sc.choices.splice(at, 0, choice); else sc.choices.push(choice);
  }

  /* ============================================================
     THE ROAD — you meet Pot-Helmet before you ever see the bakery
     ============================================================ */
  setText('road_goblins', [
    `Four goblins burst out of the grass — and stop dead, as surprised as you are. They are thin, scarred, and carrying a sack that smells overwhelmingly of apples.`,
    `The one in front is wearing a cooking pot on its head. Not a helmet shaped like a pot: an actual cooking pot, with the handle still on, worn with tremendous confidence.`,
    `It has flour on its face. All four are staring at you the way a cat stares when it has been caught on the table.`,
    `"WE ARE NOT STEALING," announces the one in the pot, at a volume suitable for addressing a parade ground.`
  ]);
  addFx('road_goblins', 0, { bond: { pot_helmet: 2 }, flags: { met_pot_helmet: true } });
  addFx('road_goblins', 1, { bond: { pot_helmet: -2 }, flags: { met_pot_helmet: true } });
  addFx('road_goblins', 3, { bond: { pot_helmet: 3 }, flags: { met_pot_helmet: true } });

  setText('road_goblins_apples', (S) => {
    const l = [];
    l.push(`You point at the sack. The pot-helmeted one's face does something complicated — it has clearly been told, repeatedly, not to answer this question.`);
    l.push(`"Orchard," it says. Then, unable to stop itself: "For the BAKING. We are a BAKERY now. We are going to be the most famous bakery in the—"`);
    l.push(`One of the others steps on its foot.`);
    l.push(`"...We are not going to be anything," it finishes, miserably. "Ignore me. I am Pot-Helmet and I talk too much. Everyone says so."`);
    return l;
  });
  addFx('road_goblins_apples', 0, { bond: { pot_helmet: 3 } });

  setText('road_goblins_pass', [
    `You step off the road and wave them past.`,
    `They go, quickly, in the manner of people who cannot believe their luck. The one in the cooking pot looks back twice.`,
    `The third time, it stops, puts down the sack, takes an apple off the top, and rolls it along the road to your feet. Then it runs to catch up with the others without waiting to see what you do.`
  ]);
  addFx('road_goblins_pass', 0, { bond: { pot_helmet: 4 }, flags: { pot_helmet_apple: true } });

  setText('road_goblins_flee', [
    `You make yourself large and expensive, and four goblins reconsider their afternoon at speed.`,
    `Three of them are gone into the grass before you finish the gesture. The fourth — the one in the cooking pot — drops the sack, picks it up, drops it again, and finally abandons it entirely to sprint after the others.`,
    `Apples roll everywhere. You hear it shouting apologies to its friends all the way down the valley.`
  ]);
  addFx('road_goblins_flee', 0, { bond: { pot_helmet: -3 } });

  /* ============================================================
     THE LOADING DOCK — Nib notices things
     ============================================================ */
  setText('dock_sniffed', [
    `One of the goblins stops mid-argument. It is much smaller than the other, and it has been carefully — very carefully — stacking butter crocks in a pyramid.`,
    `Its nose goes up. It sniffs, once, twice, and turns very slowly toward the wagon.`,
    `"...Is not apples," it says. Quietly. It does not raise the alarm. It just keeps looking at exactly the spot where you are, with the unhurried certainty of something that is never wrong about a smell.`,
    `"Nib," says the other one, "what."`,
    `Both of them are looking straight at you now.`
  ]);
  addFx('dock_sniffed', 0, { bond: { nib: 3 }, flags: { met_nib: true } });
  addFx('dock_sniffed', 1, { bond: { nib: 4 }, flags: { met_nib: true } });
  addFx('dock_sniffed', 2, { bond: { nib: -6 }, flags: { met_nib: true, hurt_nib: true } });

  setText('dock_parley', (S) => {
    const l = [];
    l.push(`You come out with your hands open and empty, and the small one does not run.`);
    l.push(`It looks at you for a long moment, then at the butter crocks, then back at you, performing some private arithmetic.`);
    l.push(`"You are not here to burn it," it decides. Not a question.`);
    l.push(`"No."`);
    l.push(`"Good." It goes back to its pyramid. "I am Nib. That is Skritch, he is having a bad day, he has them most days." A pause. "Do not touch the butter."`);
    if (S.flags.pot_helmet_apple) l.push(`It notices the apple in your pack — the one rolled to you on the road — and says nothing at all, but something in its posture settles.`);
    return l;
  });
  addFx('dock_parley', 0, { bond: { nib: 3, skritch: 1 }, flags: { met_nib: true, met_skritch: true } });

  /* ============================================================
     THE SHOP AND THE OFFICE — Skritch has been keeping records
     ============================================================ */
  setText('shop', [
    `The front of the house. A small room where the famous pies were sold over a counter, with shelves on every wall.`,
    `The shelves have been ransacked — paper boxes, ribbon and twine litter the floor like a party that ended badly a decade ago.`,
    `But somebody has been *tidying*. Recently, and badly, and with enormous effort. The boxes have been sorted by size. There is a list nailed to the wall in three different inks, headed — in painstaking, wobbling Common — **STOCK WHAT WE HAVE**, and under it, in a column: *flour (some). sugar (not much). butter (NIB HAS IT). apples (many). hope (?)*`,
    `Somebody rubbed out the last line and wrote it again anyway.`
  ]);

  setText('shop_cashbox', [
    `The cashbox is under the counter, locked, and thoroughly uninteresting to whoever has been living here — there is dust on it, and the dust has been disturbed exactly once, by a single careful finger, and then left alone.`,
    `Someone opened this drawer, looked at the money, decided it was not theirs, and shut it again.`,
    `There is a scrap of paper on the lid. It reads: *COINS. NOT OURS. DO NOT.* It is signed, with great formality, **SKRITCH**.`
  ]);
  addChoice('shop_cashbox', {
    text: 'Leave it exactly where it is.',
    goto: 'shop_hub',
    effects: { xp: 60, bond: { skritch: 6, goblins: 2 }, flags: { respected_skritch_note: true },
      chronicle: 'left the cashbox alone because Skritch had asked, in writing, that nobody take it', remember: true }
  }, 0);

  setText('office', (S) => {
    const l = [];
    l.push(`Grammy's office. A desk, a chair too small for you, and sixty years of dust disturbed in a narrow path from door to shelf.`);
    l.push(`The path is small-footed and much-walked. Somebody comes in here often, and touches nothing.`);
    l.push(`On the desk, squared up precisely with the corner, is a clipboard. The top sheet is headed **THINGS WE HAVE TRIED** and runs to four pages, each attempt dated, described, and marked with a result. The last forty entries all end with the same three words, in increasingly small handwriting:`);
    l.push(`*it was wrong.*`);
    return l;
  });
  addChoice('office', {
    text: 'Read all four pages of Skritch\'s notes.',
    goto: 'office',
    if: (S) => !S.flags.read_skritch_notes,
    effects: { xp: 70, bond: { skritch: 5 }, flags: { read_skritch_notes: true, knows_goblins_bake: true },
      note: 'Two years of failed attempts, recorded honestly. Nobody made him do this.',
      chronicle: 'read all four pages of Skritch\'s failures, and understood what the goblins had been trying to do', remember: true }
  }, 0);

  /* ============================================================
     THE BAKERY FLOOR — Rolling-Pin guards the benches
     ============================================================ */
  setText('floor_disturb', [
    `You get one hand on a rolling pin — and three goblins drop from the rafters in perfect, practised unison, landing in a ring around you.`,
    `They are not attacking. They are between you and the benches, arms spread, and the look on their faces is not rage.`,
    `It is panic. It is the face of someone watching a stranger pick up something precious.`,
    `The biggest one plants itself directly in front of you. It is holding a rolling pin of its own, gripped like a sword, in a stance that somebody has clearly practised alone.`,
    `"NO," it says, in Common. "Not those. Those is Grammy's."`,
    `Behind it, the smallest one has both hands over its mouth. The one in the cooking pot is bouncing on the spot, unable to decide whether this is a disaster or the most exciting thing that has ever happened.`
  ]);
  addFx('floor_disturb', 0, { bond: { rolling_pin: 5, nib: 3 }, flags: { met_rolling_pin: true } });
  addFx('floor_disturb', 1, { bond: { rolling_pin: 2 }, flags: { met_rolling_pin: true } });
  addFx('floor_disturb', 2, { bond: { rolling_pin: -5, nib: -4, pot_helmet: -3 }, flags: { met_rolling_pin: true } });
  addFx('floor_disturb', 3, { bond: { rolling_pin: -3 }, flags: { met_rolling_pin: true } });
  addFx('floor_disturb', 4, { bond: { rolling_pin: -10, nib: -8, pot_helmet: -8 }, flags: { met_rolling_pin: true } });

  setText('goblin_standoff', [
    `Whatever you tried does not take. The ring tightens. Scimitars come out — old ones, notched, but perfectly capable.`,
    `The big one with the rolling pin does not draw a blade. It just steps further in front of the benches, which is somehow worse.`,
    `Behind it, the small one — Nib — has not moved at all. It is standing in front of a bowl of butter with its arms out, which is either very brave or the least useful thing anyone has ever done.`,
    `There is one breath left in which this does not have to happen.`
  ]);

  setText('goblin_cowed', [
    `You make it clear, without much effort, that this ends badly for everyone who stays.`,
    `They back off. The one in the cooking pot goes first, then the others, then — last, walking backwards, still facing you — the big one with the rolling pin, who does not stop looking at you until it is out of the room.`,
    `The smallest one stays exactly where it is, in front of a bowl of butter, shaking, until one of the others comes back and pulls it away by the arm.`,
    `You have the bakery floor. You have never felt worse about winning anything.`
  ]);
  addFx('goblin_cowed', 0, { bond: { rolling_pin: -6, nib: -6 } });

  /* ============================================================
     THE STAIRS — Rolling-Pin on duty
     ============================================================ */
  setText('apartment_knock', [
    `You knock.`,
    `There is a long pause, some frantic whispering, and the sound of something heavy being dragged and then hurriedly dragged back.`,
    `The door opens four inches. The goblin with the rolling pin is on the other side of it, standing at what it evidently believes is attention.`,
    `"The chief is IN CONFERENCE," it says. It has clearly been waiting years to say this to somebody. "I am Rolling-Pin. Assistant Crust Commander. State your business."`,
    `Somewhere behind it, a voice that is definitely the chief says "who is it", and Rolling-Pin says "NOBODY, CHIEF", without breaking eye contact with you.`
  ]);
  addFx('apartment_knock', 0, { bond: { rolling_pin: 3 }, flags: { met_rolling_pin: true } });

  /* ============================================================
     A QUIET MOMENT WITH EACH OF THEM
     ============================================================ */
  const MOMENTS = {
    crew_nib: {
      title: 'Nib, and the Butter',
      art: 'bakery',
      text: [
        `You find the small one alone at the end of a bench, doing something with enormous concentration.`,
        `He is dividing a single block of butter into portions with a knife almost as long as he is, and he is measuring each one by eye against the last, and when one comes out slightly larger he starts the whole block again.`,
        `"Why you not eat it?" you ask. It is the wrong question and you know it as you say it.`,
        `Nib does not look up. "Everyone eats it," he says. "That is why there is never enough for the baking. So I hold it." A pause. "Somebody has to hold it."`,
        `He has been holding the butter for two years so that a pie he has never tasted might one day be possible.`
      ],
      choices: [
        { text: 'Tell him that is the most important job in the building.',
          goto: 'bakery_floor',
          effects: { xp: 80, bond: { nib: 8, goblins: 2 },
            chronicle: 'told Nib that holding the butter was the most important job in the bakery', remember: true } },
        { text: 'Sit down and help him portion it.',
          goto: 'bakery_floor',
          effects: { xp: 90, bond: { nib: 10 }, flags: { helped_nib: true },
            chronicle: 'sat down and portioned butter with Nib without being asked', remember: true } },
        { text: 'Leave him to it.', goto: 'bakery_floor', effects: {} }
      ]
    },

    crew_skritch: {
      title: 'Skritch, and the Ledger',
      art: 'shop',
      text: [
        `You find the lanky one hunched over his clipboard in the corner where the light is worst, writing.`,
        `He flinches when he notices you, and covers the page — then, visibly, makes himself uncover it again.`,
        `"It is a record," he says. "Of the attempts. So that when we do it right we will know which thing was the thing." He turns a page. There are hundreds of entries. "Nobody reads it."`,
        `"You read it."`,
        `"I write it," says Skritch, as though these are different activities, "which is not the same."`
      ],
      choices: [
        { text: 'Read it properly, in front of him, all the way through.',
          goto: 'bakery_floor',
          effects: { xp: 90, bond: { skritch: 10 }, flags: { read_skritch_notes: true },
            chronicle: 'read Skritch\'s ledger all the way through while he watched', remember: true } },
        { text: 'Ask him what he thinks the missing thing is. Nobody has asked him.',
          goto: 'bakery_floor',
          effects: { xp: 100, bond: { skritch: 12 }, flags: { asked_skritch: true },
            note: 'He says: "It is not an ingredient. I have checked. I have checked everything."',
            chronicle: 'asked Skritch what he thought was missing — the first person ever to ask him', remember: true } },
        { text: 'Leave him to his paperwork.', goto: 'bakery_floor', effects: {} }
      ]
    },

    crew_rolling_pin: {
      title: 'Rolling-Pin, Off Duty',
      art: 'floor',
      text: [
        `The big one is at the far bench, alone, working dough that is far past the point of needing work.`,
        `He is not kneading it. He is *laminating* it — folding, turning, folding, turning, with a precision that has clearly been arrived at by two years of trying and no instruction whatsoever.`,
        `"Crust," he says, when he notices you watching. He does not stop. "Everyone thinks it is the filling. It is not the filling."`,
        `He folds it again.`,
        `"I have never had one," he says. "A good one. I do not know what I am aiming at. I just know it is not this."`
      ],
      choices: [
        { text: 'Tell him the fold is right. Because it is.',
          goto: 'bakery_floor',
          effects: { xp: 90, bond: { rolling_pin: 10 },
            chronicle: 'told Rolling-Pin his lamination was right, and watched a goblin be told he was good at something', remember: true } },
        { text: 'Promise him he will taste a good one before you leave.',
          goto: 'bakery_floor',
          effects: { xp: 100, bond: { rolling_pin: 12 }, flags: { promised_rolling_pin: true },
            chronicle: 'promised Rolling-Pin he would taste a proper crust before the day was out', remember: true } },
        { text: 'Correct his technique.',
          goto: 'bakery_floor',
          effects: { xp: 40, bond: { rolling_pin: -2 },
            chronicle: 'corrected Rolling-Pin\'s crust technique', remember: true } }
      ]
    },

    crew_pot_helmet: {
      title: 'Pot-Helmet Has a Plan',
      art: 'shop',
      text: [
        `The one in the cooking pot corners you by the front counter with the air of someone who has been waiting all day for this.`,
        `"I have made SIGNS," he says.`,
        `He has made signs. There are eleven of them, on boards, in charcoal. They say things like **PIE SOON** and **GRAMMY IS BACK (NOT REALLY)** and, on the largest one, **COME IN WE ARE NOT DANGEROUS ANYMORE**.`,
        `"For the town," he explains. "For when we are good. I have been making them for a year and a half."`,
        `He has stacked them carefully. They have been dusted.`
      ],
      choices: [
        { text: 'Tell him the signs are good and you will help him hang them.',
          goto: 'bakery_floor',
          effects: { xp: 90, bond: { pot_helmet: 12 }, flags: { signs_hung: true },
            chronicle: 'helped Pot-Helmet hang the signs he had been making for a year and a half', remember: true } },
        { text: 'Gently suggest editing "NOT DANGEROUS ANYMORE".',
          goto: 'bakery_floor',
          effects: { xp: 70, bond: { pot_helmet: 6 },
            chronicle: 'talked Pot-Helmet out of the sign reading COME IN WE ARE NOT DANGEROUS ANYMORE', remember: true } },
        { text: 'Tell him the town will never come.',
          goto: 'bakery_floor',
          effects: { bond: { pot_helmet: -10 }, flags: { crushed_pot_helmet: true },
            chronicle: 'told Pot-Helmet the town would never come', remember: true } }
      ]
    }
  };
  Object.keys(MOMENTS).forEach(k => { SC[k] = MOMENTS[k]; });

  /* Reachable once each, from the bakery floor, only after the fighting is over. */
  const calm = (S) => !S.flags.killed_kitchen_goblins && !S.flags.attacked_goblins;
  addChoice('bakery_floor', { text: 'The small one is portioning butter alone at the end of a bench.',
    if: (S) => calm(S) && !S.flags.seen_nib_moment, goto: 'crew_nib',
    effects: { flags: { seen_nib_moment: true, met_nib: true } } });
  addChoice('bakery_floor', { text: 'The lanky one is writing in a ledger in the worst light in the room.',
    if: (S) => calm(S) && !S.flags.seen_skritch_moment, goto: 'crew_skritch',
    effects: { flags: { seen_skritch_moment: true, met_skritch: true } } });
  addChoice('bakery_floor', { text: 'The big one is folding dough at the far bench, over and over.',
    if: (S) => calm(S) && !S.flags.seen_rp_moment, goto: 'crew_rolling_pin',
    effects: { flags: { seen_rp_moment: true, met_rolling_pin: true } } });
  addChoice('shop_hub', { text: 'The one in the cooking pot is trying to get your attention. Urgently.',
    if: (S) => calm(S) && !S.flags.seen_ph_moment, goto: 'crew_pot_helmet',
    effects: { flags: { seen_ph_moment: true, met_pot_helmet: true } } });

  /* ============================================================
     PAY IT OFF AT THE END
     ============================================================ */
  const origBake = SC.the_great_bake && SC.the_great_bake.text;
  if (SC.the_great_bake) {
    SC.the_great_bake.text = (S) => {
      const l = (typeof origBake === 'function' ? origBake(S) : (origBake || [])).slice();
      if (S.flags.promised_rolling_pin) l.push(`Rolling-Pin takes his first bite of a proper crust, stops, and has to put the plate down.`);
      if (S.bonds && (S.bonds.nib || 0) >= 8) l.push(`Nib is given the first piece of the second pie, on the grounds that he held the butter for two years, and he eats it very slowly with both hands.`);
      if (S.flags.signs_hung) l.push(`Outside, eleven charcoal signs are doing exactly the job they were made for.`);
      return l;
    };
  }

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
