/* ============================================================
   TALES OF THE DM — Perry's original run
   ------------------------------------------------------------
   The real playthrough, at the real table: Perry, Elf Fighter
   (Gunslinger), DM'd by Rex. Transcribed from
   uploads/perry-grammys-apple-pie-full-story.txt.

   This is seeded as a read-only third profile so that when
   anyone finishes Episode 1, the end-of-episode comparison can
   show them what Perry did at every fork.

   It is seeded ONCE per database. If the Perry profile already
   exists it is left alone, so replaying never overwrites it.
   ============================================================ */
(function () {
  const TDM = (typeof window !== 'undefined')
    ? (window.TDM = window.TDM || {})
    : (global.TDM = global.TDM || {});

  const NOW = Date.UTC(2025, 0, 1); // fixed: this run happened before the app existed

  const CHAR = {
    id: 'perry_original',
    name: 'Perry',
    race: 'elf',
    class: 'fighter',
    subclass: 'gunslinger',
    origin: 'soldier',
    stats: { STR: 17, DEX: 14, CON: 14, INT: 8, WIS: 10, CHA: 12 },
    level: 2,
    xp: 900,
    pronouns: { subject: 'he', object: 'him', possessive: 'his', is: 'is' },
    backstory: 'A soldier before he was anything else, and compassionate in a way the army never quite trained out of him. Carries a revolver almost nobody in these parts has seen, and keeps it holstered.',
    quirk: 'Apologises to things that are not usually apologised to.',
    startItems: ['soldier_tag', 'revolver', 'travelers_pack'],
    startGold: 25,
    episodesCompleted: ['ep1_apple_pie'],
    createdAt: NOW,
    look: null   // filled in at runtime from avatar defaults
  };

  /* The defining choices, in the order they happened. Keys are stable so
     re-wording the text later will not break comparisons. */
  const MAJORS = [
    ['accepted_quest',     'said yes to Tyndareus without haggling'],
    ['apologised_trees',   'apologised to two feuding apple trees, and meant it'],
    ['tree_apples',        'was given an apple by each of the two arguing trees'],
    ['front_door',         'walked up to the front door of a goblin-held building and knocked'],
    ['buy_recipe_book',    'told a doorway full of armed goblins: "I come here to buy a recipe book"'],
    ['apple_exchange',     'took the apple a goblin offered, and ate it in front of them'],
    ['wants_to_bake',      'told Chief Grubnash: "I want to learn how to bake Grammy\'s pie"'],
    ['met_the_crew',       'met Pot-Helmet, Rolling-Pin, Nib and Skritch as crewmates, one by one'],
    ['helped_oven',        'walked up to the living Oven and offered to help it'],
    ['oven_promise',       'told the Oven: "I want to help everyone here, including you"'],
    ['investigated',       'searched the bakery with Grubnash\'s help, and found it'],
    ['all_goblins_bake',   'asked permission to take the recipe, and asked that every goblin help bake'],
    ['grammy_yes',         'answered Grammy Smithwick\'s spirit with one word: "Yes"'],
    ['asked_about_grammy', 'asked Grammy Smithwick what had happened to her'],
    ['promised_to_share',  'promised Grammy Smithwick to share the pie with the goblins and with Tyndareus'],
    ['copied_recipe',      'copied the recipe out by hand and left Grammy\'s book at the bakery'],
    ['organised_crew',     'turned a chaotic goblin kitchen into a working production line'],
    ['town_told',          'sent Pot-Helmet and Skritch running into town to announce that Grammy\'s was baking again'],
    ['cast_lights',        'filled the bakery with drifting autumn lights while the crew worked'],
    ['goblins_chose_spice','handed the cinnamon tin back and let the goblins decide how much'],
    ['sang',               'sang an old soldiers\' song over the Oven, and the goblins joined in one by one'],
    ['shared_the_pies',    'shared the pies with the goblins, the town, and the orchard'],
    ['reopened',           'reopened Grammy\'s Bakery'],
    ['tore_recipe',        'tore up the copied recipe in front of Tyndareus'],
    ['said_the_words',     'told Tyndareus: "If he ever really wants to find this pie again, he goes with me to the bakery in the morning"'],
    ['slice_to_crimp',     'gave the first slice of Grammy\'s pie to Crimp, not to the wizard'],
    ['said_last_words',    'told Tyndareus: "don\'t forget about the people you do have around you"']
  ].map(([key, text], i) => ({ key, text, at: NOW + i * 1000 }));

  /* The dice that were actually rolled. */
  const ROLLS = [
    { label: 'Stealth',       total: 10, dc: 13, ok: false },
    { label: 'Persuasion',    total: 13, dc: 12, ok: true },
    { label: 'Investigation', total: 19, dc: 14, ok: true },
    { label: 'Athletics',     total: 15, dc: 12, ok: true },
    { label: 'Performance',   total: 20, dc: 12, ok: true, advantage: true, d20s: [19, 16] }
  ];

  TDM.PERRY_RUN = {
    playerKey: 'perry',
    display: 'Perry',
    note: 'The original table run — Perry, Elf Gunslinger, DM\'d by Rex.',
    char: CHAR,
    majors: MAJORS,
    rolls: ROLLS,
    summary: {
      choices: 27, level: 2, xp: 900, gold: 25, hp: 20, maxHp: 20,
      bloodless: true,
      rewards: ['25 gold pieces', 'Free pie at Grammy\'s, forever', '"The elf who reopened Grammy\'s Bakery"']
    }
  };

  /* Build a save object shaped exactly like a real one. */
  TDM.buildPerrySave = function (episode) {
    const E = TDM.engine;
    const char = Object.assign({}, CHAR);
    if (!char.look && TDM.avatar) {
      char.look = TDM.avatar.defaultsFor('elf', 'fighter');
      char.look.weaponKind = 'revolver';
    }
    const save = E.newSave(episode, char, 'Perry');
    save.majors = MAJORS.slice();
    save.rolls = ROLLS.slice();
    save.choices = new Array(TDM.PERRY_RUN.summary.choices).fill(null).map((_, i) => ({ at: NOW + i * 500 }));
    save.completed = true;
    save.completedAt = NOW + 100000;
    save.level = 2; save.xp = 900; save.gold = 25;
    save.hp = 20; save.maxHp = 20;
    save.readOnly = true;
    save.flags = Object.assign(save.flags || {}, {
      apologised_to_trees: true, has_tree_apples: true, made_peace_trees: true,
      oven_pact: true, all_hands: true, met_grammy: true, grammy_yes: true,
      asked_about_grammy: true, promised_to_share: true, copied_recipe: true,
      book_stays: true, town_told: true, goblins_chose_spice: true,
      song_landed: true, bakery_reopened: true, tore_recipe: true,
      slice_to: 'crimp', said_the_words: true
    });
    return save;
  };

  /* Seed once. Never overwrite an existing Perry. */
  TDM.seedPerry = async function (db, episode) {
    if (!db || !episode) return false;
    try {
      const existing = await db.loadPlayer('perry');
      if (existing && existing.saves && existing.saves[episode.id]) return false;
      const save = TDM.buildPerrySave(episode);
      const data = {
        name: 'perry',
        display: 'Perry',
        readOnly: true,
        note: TDM.PERRY_RUN.note,
        characters: { [CHAR.id]: Object.assign({}, CHAR, { look: save.char.look }) },
        saves: { [episode.id]: save },
        createdAt: NOW,
        updatedAt: Date.now()
      };
      await db.savePlayer('perry', data);
      return true;
    } catch (e) {
      console.warn('[TDM] could not seed Perry:', e && e.message);
      return false;
    }
  };
})();
