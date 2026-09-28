/* ============================================================
   TALES OF THE DM — Character options catalog
   Races, classes, origins, skills, appearance choices.
   ============================================================ */
(function () {
  const TDM = (typeof window !== 'undefined')
    ? (window.TDM = window.TDM || {})
    : (global.TDM = global.TDM || {});

  /* ---------- Abilities & skills ---------- */

  const ABILITIES = {
    STR: { name: 'Strength',     icon: '💪', blurb: 'Raw muscle — forcing doors, swinging axes, wrestling.' },
    DEX: { name: 'Dexterity',    icon: '🏹', blurb: 'Agility and quick fingers — sneaking, lock-picking, dodging.' },
    CON: { name: 'Constitution', icon: '❤️', blurb: 'Toughness and stamina — enduring poison, wounds, long roads.' },
    INT: { name: 'Intelligence', icon: '🧠', blurb: 'Reason and memory — lore, magic theory, spotting mechanisms.' },
    WIS: { name: 'Wisdom',       icon: '🦉', blurb: 'Instinct and awareness — perception, insight, calm.' },
    CHA: { name: 'Charisma',     icon: '🎭', blurb: 'Presence and heart — persuasion, performance, nerve.' }
  };

  const SKILL_STATS = {
    athletics: 'STR',
    acrobatics: 'DEX', sleight_of_hand: 'DEX', stealth: 'DEX',
    arcana: 'INT', history: 'INT', investigation: 'INT', nature: 'INT', religion: 'INT',
    animal_handling: 'WIS', insight: 'WIS', medicine: 'WIS', perception: 'WIS', survival: 'WIS',
    deception: 'CHA', intimidation: 'CHA', performance: 'CHA', persuasion: 'CHA'
  };

  const SKILLS = {
    athletics:      { name: 'Athletics',       icon: '💪' },
    acrobatics:     { name: 'Acrobatics',      icon: '🤸' },
    sleight_of_hand:{ name: 'Sleight of Hand', icon: '🖐️' },
    stealth:        { name: 'Stealth',         icon: '👣' },
    arcana:         { name: 'Arcana',          icon: '🔮' },
    history:        { name: 'History',         icon: '📜' },
    investigation:  { name: 'Investigation',   icon: '🔎' },
    nature:         { name: 'Nature',          icon: '🌿' },
    religion:       { name: 'Religion',        icon: '🕯️' },
    animal_handling:{ name: 'Animal Handling', icon: '🐾' },
    insight:        { name: 'Insight',         icon: '🦉' },
    medicine:       { name: 'Medicine',        icon: '💊' },
    perception:     { name: 'Perception',      icon: '👁️' },
    survival:       { name: 'Survival',        icon: '🧭' },
    deception:      { name: 'Deception',       icon: '🃏' },
    intimidation:   { name: 'Intimidation',    icon: '😤' },
    performance:    { name: 'Performance',     icon: '🎵' },
    persuasion:     { name: 'Persuasion',      icon: '💬' }
  };

  /* ---------- Races ---------- */

  const RACES = [
    {
      id: 'human', name: 'Human', icon: '🧍', tagline: 'The Versatile',
      blurb: 'Ambitious, adaptable, stubborn to a fault. Humans leave their fingerprints on every corner of the world — and every story worth telling.',
      bonuses: { STR: 1, DEX: 1, CON: 1, INT: 1, WIS: 1, CHA: 1 },
      features: [
        { name: 'Well-Rounded', desc: '+1 to every ability score.' },
        { name: 'Darkvision', desc: 'You see in dim light as if it were bright.' }
      ],
      perks: [{ id: 'indomitable', name: 'Indomitable Spirit', trigger: 'fail_reroll', scope: 'any', uses: 1,
        desc: 'Once per episode, when a check fails, sheer stubbornness lets you reroll it.' }],
      look: { ears: 'round' }
    },
    {
      id: 'elf', name: 'Elf', icon: '🍃', tagline: 'The Timeless',
      blurb: 'Elves dance to the long, slow music of the centuries. You have seen empires sleep and wake, and still the wind in new leaves can stop your heart.',
      bonuses: { DEX: 2, INT: 1 },
      features: [
        { name: 'Keen Senses', desc: 'Advantage on Perception checks.' },
        { name: 'Fey Ancestry', desc: 'Advantage against being charmed — fey magic finds it hard to grip your heart.' },
        { name: 'Trance', desc: 'You rest your mind in hours instead of a full night\'s sleep.' }
      ],
      perks: [],
      look: { ears: 'pointed' }
    },
    {
      id: 'half_elf', name: 'Half-Elf', icon: '🎭', tagline: 'The Bridge',
      blurb: 'Belonging everywhere and nowhere, half-elves collect languages, friends, and second chances. Your warmth opens doors that keys cannot.',
      bonuses: { CHA: 2, DEX: 1, WIS: 1 },
      features: [
        { name: 'Two Worlds', desc: 'Advantage on Persuasion with fey and elves.' },
        { name: 'Skill Versatility', desc: 'You pick up a little of everything (+1 extra skill).' }
      ],
      perks: [],
      look: { ears: 'slight' }
    },
    {
      id: 'dwarf', name: 'Dwarf', icon: '⛏️', tagline: 'The Unbroken',
      blurb: 'Carved from the bones of mountains, dwarves remember every grudge and every kindness in stone-deep detail. Loyalty is their strongest ore.',
      bonuses: { CON: 2, WIS: 1 },
      features: [
        { name: 'Dwarven Resilience', desc: 'Advantage on saves against poison.' },
        { name: 'Darkvision', desc: 'You see in dim light as if it were bright.' },
        { name: 'Stonecunning', desc: 'You read stonework the way others read letters.' }
      ],
      perks: [],
      look: { ears: 'round', beardOption: true }
    },
    {
      id: 'halfling', name: 'Halfling', icon: '🍀', tagline: 'The Lucky',
      blurb: 'Small, cheerful, and improbably fortunate. Halflings fall into adventures the way they fall into pantries — and land on their feet every time.',
      bonuses: { DEX: 2, CHA: 1 },
      features: [
        { name: 'Lucky', desc: 'Whenever you roll a natural 1 on the d20, you immediately reroll it.' },
        { name: 'Brave', desc: 'Advantage against being frightened.' },
        { name: 'Small Stature', desc: 'You fit through gaps others cannot.' }
      ],
      perks: [],
      look: { ears: 'slight', small: true }
    },
    {
      id: 'gnome', name: 'Gnome', icon: '🍄', tagline: 'The Curious',
      blurb: 'Curiosity with legs. Gnomes tinker, gossip with badgers, and poke precisely the things that say DO NOT POKE. It usually works out.',
      bonuses: { INT: 2, DEX: 1 },
      features: [
        { name: 'Gnome Cunning', desc: 'Advantage on INT, WIS and CHA checks against magic.' },
        { name: 'Darkvision', desc: 'You see in dim light as if it were bright.' }
      ],
      perks: [],
      look: { ears: 'pointed', small: true }
    },
    {
      id: 'half_orc', name: 'Half-Orc', icon: '🪓', tagline: 'The Relentless',
      blurb: 'Storms given shoulders. Half-orcs are told what they cannot be their whole lives, and then go be it anyway, grinning.',
      bonuses: { STR: 2, CON: 1 },
      features: [
        { name: 'Menacing', desc: 'Advantage on Intimidation checks.' },
        { name: 'Darkvision', desc: 'You see in dim light as if it were bright.' }
      ],
      perks: [{ id: 'relentless', name: 'Relentless Endurance', trigger: 'ko_save', uses: 1,
        desc: 'Once per episode, when a failure would knock you down, you drop to 1 hit point instead — and keep standing.' }],
      look: { ears: 'round', tusks: true }
    },
    {
      id: 'tiefling', name: 'Tiefling', icon: '🔥', tagline: 'The Infernal Heir',
      blurb: 'An old pact echoes in your blood: horns, a tail, a gaze like banked coals. You choose, every single day, what that inheritance is worth.',
      bonuses: { CHA: 2, INT: 1 },
      features: [
        { name: 'Hellish Resistance', desc: 'Fire cannot harm you.' },
        { name: 'Infernal Legacy', desc: 'You know small, unsettling tricks of smoke and sound.' },
        { name: 'Darkvision', desc: 'You see in dim light as if it were bright.' }
      ],
      perks: [],
      look: { ears: 'round', horns: true, tail: true }
    },
    {
      id: 'dragonborn', name: 'Dragonborn', icon: '🐉', tagline: 'The Scaled',
      blurb: 'Proud, honorable, walking temples of dragonkind. Your ancestors burned kingdoms — your breath still remembers how.',
      bonuses: { STR: 2, CHA: 1 },
      features: [
        { name: 'Draconic Ancestry', desc: 'Choose an ancestry — it colors your scales and your breath.' },
        { name: 'Breath Weapon', desc: 'Once per episode, roar your ancestry across a failed check and turn it into a success.' }
      ],
      perks: [{ id: 'breath', name: 'Breath Weapon', trigger: 'fail_succeed', scope: 'any', uses: 1,
        desc: 'Once per episode, turn one failed check into a success — with elemental flair.' }],
      look: { customHead: true },
      ancestries: [
        { id: 'red',    name: 'Red',    scale: '#b0453a', horn: '#7d3340', breath: 'fire' },
        { id: 'blue',   name: 'Blue',   scale: '#4a6fae', horn: '#33507d', breath: 'lightning' },
        { id: 'green',  name: 'Green',  scale: '#4f8a4f', horn: '#3a6b3a', breath: 'poison' },
        { id: 'gold',   name: 'Gold',   scale: '#c99a3f', horn: '#9a732f', breath: 'fire' },
        { id: 'silver', name: 'Silver', scale: '#9aa5b5', horn: '#6b7686', breath: 'cold' },
        { id: 'white',  name: 'White',  scale: '#d9dee6', horn: '#aeb6c2', breath: 'cold' },
        { id: 'black',  name: 'Black',  scale: '#3a3a42', horn: '#26262e', breath: 'acid' },
        { id: 'bronze', name: 'Bronze', scale: '#a8783f', horn: '#7d5a2f', breath: 'lightning' }
      ]
    }
  ];

  /* ---------- Classes ---------- */

  const CLASSES = [
    {
      id: 'fighter', name: 'Fighter', icon: '⚔️', tagline: 'The Shieldwall',
      blurb: 'Every army needs a legend; every legend started with a sword held steady when hands wanted to shake.',
      hp: 12, weapon: 'sword', outfit: 'plate', weaponName: 'Longsword',
      skills: ['athletics', 'intimidation'],
      recommended: { STR: 15, CON: 14, DEX: 13, WIS: 12, CHA: 10, INT: 8 },
      colors: { primary: '#3a3a44', accent: '#c9a13f' },
      perk: { id: 'second_wind', name: 'Second Wind', trigger: 'fail_reroll', scope: ['STR', 'CON'], uses: 1,
        desc: 'Once per episode, when a Strength or Constitution check fails, you catch a second wind and reroll it.' }
    },
    {
      id: 'rogue', name: 'Rogue', icon: '🗡️', tagline: 'The Shadow',
      blurb: 'Locks, laws, and hearts — all three open if you know exactly where to press.',
      hp: 9, weapon: 'twin_daggers', outfit: 'shadow', weaponName: 'Twin Daggers',
      skills: ['stealth', 'sleight_of_hand'],
      recommended: { DEX: 15, CON: 14, CHA: 13, WIS: 12, INT: 10, STR: 8 },
      colors: { primary: '#363640', accent: '#a33a3a' },
      perk: { id: 'cunning', name: 'Cunning Action', trigger: 'fail_reroll', scope: ['DEX'], uses: 1,
        desc: 'Once per episode, when a Dexterity check fails, you dash, disengage — and reroll it.' }
    },
    {
      id: 'wizard', name: 'Wizard', icon: '🧙', tagline: 'The Scholar of Storms',
      blurb: 'Magic is a language, and you intend to be fluent — even if fluency occasionally involves small explosions.',
      hp: 8, weapon: 'staff', outfit: 'arcanist', weaponName: 'Arcane Staff',
      skills: ['arcana', 'investigation'],
      recommended: { INT: 15, CON: 14, DEX: 13, WIS: 12, CHA: 10, STR: 8 },
      colors: { primary: '#4a4a7a', accent: '#e0d0a6' },
      perk: { id: 'arcane_recovery', name: 'Arcane Recovery', trigger: 'fail_reroll', scope: ['INT'], uses: 1,
        desc: 'Once per episode, when an Intelligence check fails, the formulas realign and you reroll it.' }
    },
    {
      id: 'cleric', name: 'Cleric', icon: '✨', tagline: 'The Devoted',
      blurb: 'You carry someone\'s light through dark rooms. Faith is just love that learned to fight.',
      hp: 10, weapon: 'mace', outfit: 'vestment', weaponName: 'Blessed Mace',
      skills: ['insight', 'religion'],
      recommended: { WIS: 15, CON: 14, STR: 13, CHA: 12, INT: 10, DEX: 8 },
      colors: { primary: '#e8dcc0', accent: '#c9a13f' },
      perk: { id: 'divine_insight', name: 'Divine Insight', trigger: 'fail_reroll', scope: ['WIS'], uses: 1,
        desc: 'Once per episode, when a Wisdom check fails, a quiet voice offers another way — reroll it.' }
    },
    {
      id: 'bard', name: 'Bard', icon: '🎵', tagline: 'The Spark',
      blurb: 'You have never lost an argument, a card game, or a room. The lute is optional but highly recommended.',
      hp: 9, weapon: 'lute', outfit: 'finery', weaponName: 'Beloved Lute',
      skills: ['performance', 'persuasion'],
      recommended: { CHA: 15, DEX: 14, CON: 13, WIS: 12, INT: 10, STR: 8 },
      colors: { primary: '#7d3340', accent: '#e3c987' },
      perk: { id: 'bardic_inspiration', name: 'Bardic Inspiration', trigger: 'fail_reroll', scope: ['CHA'], uses: 1,
        desc: 'Once per episode, when a Charisma check fails, you hum your own theme song and reroll it.' }
    },
    {
      id: 'ranger', name: 'Ranger', icon: '🏹', tagline: 'The Wandering Eye',
      blurb: 'Somewhere between the wild and the road, you learned that the wilderness keeps score.',
      hp: 10, weapon: 'bow', outfit: 'wayfinder', weaponName: 'Longbow',
      skills: ['survival', 'perception'],
      recommended: { DEX: 15, WIS: 14, CON: 13, STR: 12, INT: 10, CHA: 8 },
      colors: { primary: '#3f6b4a', accent: '#a9743f' },
      perk: { id: 'hunters_eye', name: 'Hunter\'s Eye', trigger: 'fail_reroll', scope: ['DEX', 'WIS'], uses: 1,
        desc: 'Once per episode, when a Dexterity or Wisdom check fails, you read the wind and reroll it.' }
    },
    {
      id: 'barbarian', name: 'Barbarian', icon: '🪓', tagline: 'The Storm',
      blurb: 'Some people count to ten. You count to one, loudly, with an axe.',
      hp: 14, weapon: 'greataxe', outfit: 'warchief', weaponName: 'Greataxe',
      skills: ['athletics', 'survival'],
      recommended: { STR: 15, CON: 14, DEX: 13, WIS: 12, CHA: 10, INT: 8 },
      colors: { primary: '#7a5236', accent: '#a33d3d' },
      perk: { id: 'rage', name: 'RAGE', trigger: 'fail_reroll', scope: ['STR'], uses: 1,
        desc: 'Once per episode, when a Strength check fails, you get ANGRY — and reroll it. (Volume included.)' }
    },
    {
      id: 'druid', name: 'Druid', icon: '🌿', tagline: 'The Green Tongue',
      blurb: 'You speak with rivers, oaks, and the occasional mushroom. Nature listens back — it gossips, actually.',
      hp: 10, weapon: 'sickle', outfit: 'verdant', weaponName: 'Mistletoe Sickle',
      skills: ['nature', 'animal_handling'],
      recommended: { WIS: 15, CON: 14, INT: 13, DEX: 12, CHA: 10, STR: 8 },
      colors: { primary: '#3f6b4a', accent: '#9caf88' },
      passive: 'speak_with_plants',
      perk: { id: 'wild_whisper', name: 'Whisper of the Wilds', trigger: 'fail_reroll', scope: ['WIS'], uses: 1,
        desc: 'Once per episode, when a Wisdom check fails, the wilds whisper the answer — reroll it.' }
    },
    {
      id: 'paladin', name: 'Paladin', icon: '🛡️', tagline: 'The Oathbound',
      blurb: 'You swore an oath so loudly that heaven cleared its throat and took notes. Now you keep it, step by step.',
      hp: 12, weapon: 'swordshield', outfit: 'oathplate', weaponName: 'Sword & Shield',
      skills: ['insight', 'persuasion'],
      recommended: { STR: 15, CHA: 14, CON: 13, WIS: 12, INT: 10, DEX: 8 },
      colors: { primary: '#4a5d78', accent: '#e3c987' },
      perk: { id: 'divine_favor', name: 'Divine Favor', trigger: 'fail_reroll', scope: ['STR', 'WIS', 'CHA'], uses: 1,
        desc: 'Once per episode, when a Strength, Wisdom or Charisma check fails, your oath flares — reroll it.' }
    },
    {
      id: 'monk', name: 'Monk', icon: '☯️', tagline: 'The Still Water',
      blurb: 'You have made peace with the universe. The universe has not necessarily made peace with you.',
      hp: 10, weapon: 'quarterstaff', outfit: 'gi', weaponName: 'Quarterstaff',
      skills: ['acrobatics', 'insight'],
      recommended: { DEX: 15, WIS: 14, STR: 13, CON: 12, INT: 10, CHA: 8 },
      colors: { primary: '#e8dcc0', accent: '#7d3340' },
      passive: 'deflect_missiles',
      perk: { id: 'deflect', name: 'Deflect Missiles', trigger: 'fail_reroll', scope: ['DEX'], uses: 1,
        desc: 'Once per episode, when a Dexterity check fails, you flow like water and reroll it.' }
    },
    {
      id: 'warlock', name: 'Warlock', icon: '👁️', tagline: 'The Pact-Bound',
      blurb: 'Someone on the other side of reality answered when you called. They\’ve been wonderfully cooperative. Suspiciously so.',
      hp: 9, weapon: 'wand', outfit: 'pactweave', weaponName: 'Pact Wand',
      skills: ['arcana', 'deception'],
      recommended: { CHA: 15, CON: 14, WIS: 13, DEX: 12, INT: 10, STR: 8 },
      colors: { primary: '#2f2a3f', accent: '#b06bc9' },
      perk: { id: 'dark_luck', name: 'Dark One\'s Own Luck', trigger: 'fail_reroll', scope: 'any', uses: 1,
        desc: 'Once per episode, when any check fails, your patron lends a hand — reroll it. (Interest rates apply.)' }
    },
    {
      id: 'sorcerer', name: 'Sorcerer', icon: '🌟', tagline: 'The Wild Spark',
      blurb: 'You didn\'t study magic. You woke up one morning and magic was already wearing your pajamas.',
      hp: 8, weapon: 'orb', outfit: 'stormcaller', weaponName: 'Storm Orb',
      skills: ['arcana', 'intimidation'],
      recommended: { CHA: 15, CON: 14, DEX: 13, WIS: 12, INT: 10, STR: 8 },
      colors: { primary: '#5a4a72', accent: '#4fa8b8' },
      perk: { id: 'wild_magic', name: 'Wild Magic', trigger: 'fail_reroll', scope: 'any', uses: 1,
        desc: 'Once per episode, when any check fails, you shrug and let the chaos out — reroll it.' }
    }
  ];

  /* ---------- Origins ---------- */

  /* ------------------------------------------------------------------
     SUBCLASSES — three per class. Chosen during character creation.
     Each grants its own perk IN ADDITION to the base class perk, and may
     override the starting weapon and add a `tag` that story scenes can
     check with `reqTag` to unlock subclass-only choices.
     ------------------------------------------------------------------ */
  const SUBCLASSES = {
    fighter: [
      { id: 'gunslinger', name: 'Gunslinger', icon: '🔫', tagline: 'The Hand on the Hammer',
        blurb: 'A weapon of powder and patience, rare enough that most folk have only heard rumours. You keep it clean, and you keep it holstered — until you don\'t.',
        perk: { id: 'deadeye', name: 'Deadeye', trigger: 'fail_reroll', scope: ['DEX'], uses: 1, desc: 'Once per episode, when a Dexterity check fails, you steady the barrel and reroll it.' }, weapon: 'revolver', weaponName: 'Revolver', tag: 'gunslinger' },
      { id: 'champion', name: 'Champion', icon: '🛡️', tagline: 'The Unbroken Line',
        blurb: 'No tricks. No flourish. You simply do not fall down, and eventually that is the same as winning.',
        perk: { id: 'second_wind_plus', name: 'Indomitable', trigger: 'fail_reroll', scope: ['STR', 'CON'], uses: 2, desc: 'Twice per episode, a failed Strength or Constitution check can be rerolled.' } },
      { id: 'battlemaster', name: 'Battle Master', icon: '📯', tagline: 'The Reader of Rooms',
        blurb: 'You see the fight three moves before it starts — the loose flagstone, the nervous one at the back, the door nobody is watching.',
        perk: { id: 'tactics', name: 'Know Your Ground', trigger: 'advantage', scope: ['INT', 'WIS'], uses: 1, desc: 'Once per episode, take advantage on an Intelligence or Wisdom check by reading the room first.' } },
    ],
    rogue: [
      { id: 'thief', name: 'Thief', icon: '🪝', tagline: 'The Quiet Withdrawal',
        blurb: 'Locks are suggestions. Windows are doors. You have never once used the front entrance on purpose.',
        perk: { id: 'fast_hands', name: 'Fast Hands', trigger: 'fail_reroll', scope: ['DEX'], uses: 2, desc: 'Twice per episode, reroll a failed Dexterity check — your hands are quicker than your doubts.' } },
      { id: 'assassin', name: 'Assassin', icon: '🎯', tagline: 'The First and Only Strike',
        blurb: 'You are very good at something you would rather not discuss over dinner.',
        perk: { id: 'first_strike', name: 'First Strike', trigger: 'advantage', scope: ['DEX', 'STR'], uses: 1, desc: 'Once per episode, strike before anyone realises the fight began — advantage on a Dexterity or Strength check.' } },
      { id: 'mastermind', name: 'Mastermind', icon: '🎭', tagline: 'The Borrowed Face',
        blurb: 'Why break in when someone will hold the door for you and apologise for the wait?',
        perk: { id: 'insight', name: 'Read the Mark', trigger: 'advantage', scope: ['CHA', 'INT'], uses: 1, desc: 'Once per episode, take advantage on a Charisma or Intelligence check — you already know what they want to hear.' } },
    ],
    wizard: [
      { id: 'evocation', name: 'Evoker', icon: '💥', tagline: 'The Loud Answer',
        blurb: 'Some problems are delicate. You have not met one yet.',
        perk: { id: 'overchannel', name: 'Overchannel', trigger: 'advantage', scope: ['INT'], uses: 1, desc: 'Once per episode, pour everything into one working — advantage on an Intelligence check.' } },
      { id: 'divination', name: 'Diviner', icon: '🔮', tagline: 'The One Who Already Knew',
        blurb: 'You have seen this moment before, in a dream you only half remember.',
        perk: { id: 'portent', name: 'Portent', trigger: 'fail_reroll', scope: ['INT', 'WIS', 'CHA', 'STR', 'DEX', 'CON'], uses: 1, desc: 'Once per episode, reroll ANY failed check — you glimpsed this outcome and rejected it.' } },
      { id: 'illusion', name: 'Illusionist', icon: '🌫️', tagline: 'The Convenient Lie',
        blurb: 'Truth is a matter of lighting, and you control the lighting.',
        perk: { id: 'minor_illusion', name: 'Minor Illusion', trigger: 'advantage', scope: ['CHA', 'DEX'], uses: 1, desc: 'Once per episode, bend what someone sees — advantage on a Charisma or Dexterity check.' } },
    ],
    cleric: [
      { id: 'life', name: 'Life Domain', icon: '💗', tagline: 'The Hand That Mends',
        blurb: 'You have carried people who could not carry themselves, and never once found it heavy.',
        perk: { id: 'preserve_life', name: 'Preserve Life', trigger: 'heal', uses: 1, amount: 8, desc: 'Once per episode, call on your god to close a wound — restore 8 hit points.' } },
      { id: 'light', name: 'Light Domain', icon: '🕯️', tagline: 'The Lantern Held High',
        blurb: 'Darkness is not evil. It is simply what happens when nobody bothers to bring a light.',
        perk: { id: 'warding_flare', name: 'Warding Flare', trigger: 'fail_reroll', scope: ['WIS', 'CHA'], uses: 1, desc: 'Once per episode, a burst of light buys you a second chance — reroll a failed Wisdom or Charisma check.' } },
      { id: 'trickery', name: 'Trickery Domain', icon: '🃏', tagline: 'The Sacred Misdirection',
        blurb: 'Your god finds piety funniest when it is slightly dishonest.',
        perk: { id: 'blessing_of_the_trickster', name: 'Blessing of the Trickster', trigger: 'advantage', scope: ['DEX', 'CHA'], uses: 1, desc: 'Once per episode, advantage on a Dexterity or Charisma check — your god is covering for you.' } },
    ],
    bard: [
      { id: 'lore', name: 'College of Lore', icon: '📚', tagline: 'The One Who Remembers',
        blurb: 'You know a song about this. You know a song about everything.',
        perk: { id: 'cutting_words', name: 'Cutting Words', trigger: 'advantage', scope: ['CHA', 'INT'], uses: 1, desc: 'Once per episode, a perfectly chosen word tips the scene — advantage on a Charisma or Intelligence check.' } },
      { id: 'valor', name: 'College of Valour', icon: '🎺', tagline: 'The Song in the Line',
        blurb: 'You sing loudest where it is least advisable.',
        perk: { id: 'combat_inspiration', name: 'Combat Inspiration', trigger: 'fail_reroll', scope: ['STR', 'CON', 'DEX'], uses: 1, desc: 'Once per episode, your own song steadies you — reroll a failed physical check.' } },
      { id: 'whispers', name: 'College of Whispers', icon: '🤫', tagline: 'The Pleasant Threat',
        blurb: 'You are charming. That is the frightening part.',
        perk: { id: 'psychic_blades', name: 'Words That Land', trigger: 'advantage', scope: ['CHA'], uses: 2, desc: 'Twice per episode, take advantage on a Charisma check.' } },
    ],
    ranger: [
      { id: 'hunter', name: 'Hunter', icon: '🏹', tagline: 'The Patient Mile',
        blurb: 'You have waited longer than this for less than this.',
        perk: { id: 'colossus_slayer', name: 'Hunter\'s Mark', trigger: 'advantage', scope: ['DEX', 'WIS'], uses: 1, desc: 'Once per episode, mark your quarry — advantage on a Dexterity or Wisdom check.' } },
      { id: 'beastmaster', name: 'Beast Master', icon: '🐾', tagline: 'The Two of You',
        blurb: 'You do not travel alone and you never have.',
        perk: { id: 'companion', name: 'Faithful Companion', trigger: 'fail_reroll', scope: ['WIS', 'DEX', 'STR'], uses: 1, desc: 'Once per episode, your companion saves the moment — reroll a failed check.' } },
      { id: 'gloomstalker', name: 'Gloom Stalker', icon: '🌑', tagline: 'The Thing in the Dark',
        blurb: 'Something out there is afraid, and for once it is not you.',
        perk: { id: 'dread_ambusher', name: 'Dread Ambusher', trigger: 'advantage', scope: ['DEX', 'STR'], uses: 1, desc: 'Once per episode, move before anyone else can — advantage on a Dexterity or Strength check.' } },
    ],
    barbarian: [
      { id: 'berserker', name: 'Berserker', icon: '🪓', tagline: 'The Red Hour',
        blurb: 'There is a door in you. You try not to open it.',
        perk: { id: 'frenzy', name: 'Frenzy', trigger: 'advantage', scope: ['STR'], uses: 2, desc: 'Twice per episode, advantage on a Strength check — you stop thinking and start moving.' } },
      { id: 'totem', name: 'Totem Warrior', icon: '🐻', tagline: 'The Borrowed Heart',
        blurb: 'Bear for endurance, wolf for the pack, eagle for the long view.',
        perk: { id: 'bear_spirit', name: 'Spirit of the Bear', trigger: 'heal', uses: 1, amount: 10, desc: 'Once per episode, the bear\'s endurance closes your wounds — restore 10 hit points.' } },
      { id: 'ancestral', name: 'Ancestral Guardian', icon: '👻', tagline: 'The Ones Behind You',
        blurb: 'Your dead have opinions, and they are loud.',
        perk: { id: 'ancestral_protectors', name: 'Ancestral Protectors', trigger: 'fail_reroll', scope: ['STR', 'CON', 'WIS'], uses: 1, desc: 'Once per episode, your ancestors steady your hand — reroll a failed check.' } },
    ],
    druid: [
      { id: 'land', name: 'Circle of the Land', icon: '🌿', tagline: 'The Memory of Places',
        blurb: 'Every field remembers what was done to it. You are on speaking terms.',
        perk: { id: 'natural_recovery', name: 'Natural Recovery', trigger: 'fail_reroll', scope: ['WIS', 'INT'], uses: 2, desc: 'Twice per episode, the land offers you a second chance — reroll a failed Wisdom or Intelligence check.' } },
      { id: 'moon', name: 'Circle of the Moon', icon: '🐺', tagline: 'The Other Shape',
        blurb: 'You are never quite sure which shape is the costume.',
        perk: { id: 'wild_shape', name: 'Wild Shape', trigger: 'advantage', scope: ['STR', 'DEX', 'CON'], uses: 1, desc: 'Once per episode, take another form — advantage on a physical check.' } },
      { id: 'dreams', name: 'Circle of Dreams', icon: '✨', tagline: 'The Kind Green',
        blurb: 'Somewhere there is a place where nothing has ever been hurt. You have been there.',
        perk: { id: 'balm', name: 'Balm of the Summer Court', trigger: 'heal', uses: 1, amount: 9, desc: 'Once per episode, summer light knits you back together — restore 9 hit points.' } },
    ],
    paladin: [
      { id: 'devotion', name: 'Oath of Devotion', icon: '✨', tagline: 'The Straight Road',
        blurb: 'You made a promise out loud, in front of people, and you meant it.',
        perk: { id: 'sacred_weapon', name: 'Sacred Weapon', trigger: 'advantage', scope: ['STR', 'CHA'], uses: 1, desc: 'Once per episode, your oath lights your hands — advantage on a Strength or Charisma check.' } },
      { id: 'ancients', name: 'Oath of the Ancients', icon: '🍃', tagline: 'The Green Flame',
        blurb: 'You fight for the things worth keeping — light, laughter, growing things.',
        perk: { id: 'natures_wrath', name: 'Nature\'s Wrath', trigger: 'heal', uses: 1, amount: 8, desc: 'Once per episode, old green magic mends you — restore 8 hit points.' } },
      { id: 'vengeance', name: 'Oath of Vengeance', icon: '⚖️', tagline: 'The Long Memory',
        blurb: 'Someone did something. You were there. You have not let it go.',
        perk: { id: 'vow_of_enmity', name: 'Vow of Enmity', trigger: 'advantage', scope: ['STR', 'DEX'], uses: 1, desc: 'Once per episode, swear a vow against one foe — advantage on a physical check.' } },
    ],
    monk: [
      { id: 'open_hand', name: 'Way of the Open Hand', icon: '✋', tagline: 'The Honest Fist',
        blurb: 'No weapon, no armour, no excuses.',
        perk: { id: 'open_hand_technique', name: 'Open Hand Technique', trigger: 'advantage', scope: ['DEX', 'STR'], uses: 1, desc: 'Once per episode, advantage on a Dexterity or Strength check.' } },
      { id: 'shadow', name: 'Way of Shadow', icon: '🌘', tagline: 'The Step Between',
        blurb: 'You are where the lamplight isn\'t.',
        perk: { id: 'shadow_step', name: 'Shadow Step', trigger: 'fail_reroll', scope: ['DEX', 'STR'], uses: 2, desc: 'Twice per episode, step through shadow and reroll a failed Dexterity or Strength check.' } },
      { id: 'four_elements', name: 'Way of the Four Elements', icon: '🌊', tagline: 'The Borrowed Storm',
        blurb: 'You hold a little weather in your chest.',
        perk: { id: 'elemental_attunement', name: 'Elemental Attunement', trigger: 'advantage', scope: ['WIS', 'CON'], uses: 1, desc: 'Once per episode, advantage on a Wisdom or Constitution check.' } },
    ],
    warlock: [
      { id: 'fiend', name: 'The Fiend', icon: '🔥', tagline: 'The Bad Bargain',
        blurb: 'You signed. You read it first, which is more than most.',
        perk: { id: 'dark_ones_blessing', name: 'Dark One\'s Blessing', trigger: 'heal', uses: 1, amount: 10, desc: 'Once per episode, your patron pays out — restore 10 hit points.' } },
      { id: 'archfey', name: 'The Archfey', icon: '🦋', tagline: 'The Beautiful Trap',
        blurb: 'Your patron is charming, generous, and absolutely not your friend.',
        perk: { id: 'fey_presence', name: 'Fey Presence', trigger: 'advantage', scope: ['CHA'], uses: 2, desc: 'Twice per episode, advantage on a Charisma check — fey glamour does the work.' } },
      { id: 'great_old_one', name: 'The Great Old One', icon: '🐙', tagline: 'The Long Listener',
        blurb: 'Something enormous is paying attention to you. It has been for years.',
        perk: { id: 'awakened_mind', name: 'Awakened Mind', trigger: 'fail_reroll', scope: ['INT', 'WIS', 'CHA'], uses: 1, desc: 'Once per episode, a voice not your own offers the answer — reroll a failed mental check.' } },
    ],
    sorcerer: [
      { id: 'draconic', name: 'Draconic Bloodline', icon: '🐉', tagline: 'The Scale Beneath',
        blurb: 'Somewhere back there, something enormous and golden made a choice.',
        perk: { id: 'draconic_resilience', name: 'Draconic Resilience', trigger: 'heal', uses: 1, amount: 9, desc: 'Once per episode, dragon blood closes the wound — restore 9 hit points.' } },
      { id: 'wild_magic_sub', name: 'Wild Magic', icon: '🎲', tagline: 'The Unreliable Gift',
        blurb: 'Your magic works. That is all anyone can promise.',
        perk: { id: 'tides_of_chaos', name: 'Tides of Chaos', trigger: 'advantage', scope: ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'], uses: 1, desc: 'Once per episode, take advantage on ANY check — chaos happens to favour you.' } },
      { id: 'storm', name: 'Storm Sorcery', icon: '⛈️', tagline: 'The Weather in the Room',
        blurb: 'The air pressure drops when you are upset. People have noticed.',
        perk: { id: 'heart_of_the_storm', name: 'Heart of the Storm', trigger: 'fail_reroll', scope: ['CHA', 'CON', 'DEX'], uses: 1, desc: 'Once per episode, the storm answers — reroll a failed check.' } },
    ],
  };

  const ORIGINS = [
    { id: 'acolyte',      name: 'Acolyte',       icon: '🕯️', tagline: 'Raised in the temple',
      blurb: 'You grew up in incense and hushed choirs, copying prayers you didn\'t yet understand.',
      skills: ['insight', 'religion'], item: 'prayer_beads',
      hook: 'Holy symbols, old rites, and consecrated ground hold no secrets from you.' },
    { id: 'charlatan',    name: 'Charlatan',     icon: '🃏', tagline: 'There\'s a sucker born every minute',
      blurb: 'Ten towns know your smile. Nine of them regret it. One still writes letters.',
      skills: ['deception', 'sleight_of_hand'], item: 'forgery_kit',
      hook: 'You can smell a con — and run one. Forged documents are practically a love language.' },
    { id: 'criminal',     name: 'Criminal',      icon: '🗝️', tagline: 'You know how locks think',
      blurb: 'The guild taught you that every door is just a question, politely asked with a crowbar.',
      skills: ['stealth', 'deception'], item: 'thieves_tools',
      hook: 'Traps, locks, and hidden compartments introduce themselves to you first.' },
    { id: 'entertainer',  name: 'Entertainer',   icon: '🎭', tagline: 'The show follows you',
      blurb: 'You\'ve played taverns where they threw both coins and chairs. You kept both counts.',
      skills: ['performance', 'acrobatics'], item: 'lucky_cloak',
      hook: 'A song, a jest, a backflip — you can hold a crowd of almost any species.' },
    { id: 'folk_hero',    name: 'Folk Hero',     icon: '🌾', tagline: 'The commonwealth remembers',
      blurb: 'You once stood up when it mattered, and the small folk have told the story ever since — bigger each time.',
      skills: ['animal_handling', 'survival'], item: 'iron_skillet',
      hook: 'Common folk trust you, and frightened creatures sense kindness in your hands.' },
    { id: 'guild_artisan',name: 'Guild Artisan', icon: '🔨', tagline: 'A maker\'s eye',
      blurb: 'You know the worth of things — and the honest pride of a well-run family business.',
      skills: ['insight', 'persuasion'], item: 'guild_seal',
      hook: 'You read ledgers like sagas, and haggling is a noble art form.' },
    { id: 'noble',        name: 'Noble',         icon: '👑', tagline: 'Blood, name, and debts',
      blurb: 'You were raised on silver and expectations. You carry one comfortably and flee the other.',
      skills: ['history', 'persuasion'], item: 'signet_of_house',
      hook: 'Heraldry, etiquette, and old family rings — you know what they mean to people.' },
    { id: 'outlander',    name: 'Outlander',     icon: '🧭', tagline: 'The map ends, you begin',
      blurb: 'You grew up where the roads give up. The wild raised you roughly, but honestly.',
      skills: ['athletics', 'survival'], item: 'travelers_pack',
      hook: 'Trails, weather, and wild things speak plainly to you.' },
    { id: 'sage',         name: 'Sage',          icon: '📜', tagline: 'The answer is in a book somewhere',
      blurb: 'You have spent more nights with dusty tomes than with people, and regret nothing. Much.',
      skills: ['arcana', 'history'], item: 'letter_of_note',
      hook: 'Enchantments, old magic, and animated objects are old study-friends of yours.' },
    { id: 'sailor',       name: 'Sailor',        icon: '⚓', tagline: 'Salt in the blood',
      blurb: 'You\'ve worked rivers and coastlines, and learned the water is always the faster road.',
      skills: ['athletics', 'perception'], item: 'lucky_fish_charm',
      hook: 'River routes, boat schedules, and sailor superstitions are yours to command.' },
    { id: 'soldier',      name: 'Soldier',       icon: '🎖️', tagline: 'You held the line',
      blurb: 'Drill, mud, brothers-in-arms. You know what discipline costs — and what it buys.',
      skills: ['athletics', 'intimidation'], item: 'soldier_tag',
      hook: 'You read patrols, sentries, and the sound of someone walking a round.' },
    { id: 'urchin',       name: 'Urchin',        icon: '🐀', tagline: 'The city raised you',
      blurb: 'You grew up invisible in plain sight, fed by alleys and raised by rooftops.',
      skills: ['sleight_of_hand', 'stealth'], item: 'lucky_rats_foot',
      hook: 'Back doors, loading docks, and quiet ways in — a city whispers its shortcuts to you.' }
  ];

  /* ---------- Items granted at creation ---------- */

  const ITEMS = {
    travelers_pack: { name: "Traveler's Pack", icon: '🎒', kind: 'gear', desc: 'Bedroll, rations, a waterskin, two torches, and a tin cup that has seen things.' },
    longsword:      { name: 'Longsword', icon: '⚔️', kind: 'weapon', desc: 'Straight, honest steel. The pommel is worn shiny from a thumb that fidgets.' },
    revolver:       { name: 'Revolver', icon: '🔫', kind: 'weapon', desc: 'Six chambers, a walnut grip worn smooth, and a smell of oil and powder. Almost nobody in these parts has seen one — which is half of what makes it work.' },
    twin_daggers:   { name: 'Twin Daggers', icon: '🗡️', kind: 'weapon', desc: 'A matched pair. One for hello, one for goodbye.' },
    arcane_staff:   { name: 'Arcane Staff', icon: '🪄', kind: 'weapon', desc: 'Ash wood, silver-capped, faintly warm to the touch.' },
    blessed_mace:   { name: 'Blessed Mace', icon: '🔨', kind: 'weapon', desc: 'Heavy at the head, light in the hand. Engraved with a small sun.' },
    beloved_lute:   { name: 'Beloved Lute', icon: '🪕', kind: 'weapon', desc: 'Seven strings, one slightly opinionated. It has never once been out of tune in a fight.' },
    longbow:        { name: 'Longbow', icon: '🏹', kind: 'weapon', desc: 'Yew and sinew, strung with care. The grip fits like a handshake.' },
    greataxe:       { name: 'Greataxe', icon: '🪓', kind: 'weapon', desc: 'It has a name. Of course it has a name.' },
    mistletoe_sickle: { name: 'Mistletoe Sickle', icon: '🌿', kind: 'weapon', desc: 'A crescent of bronze-green metal, wrapped in living ivy.' },
    sword_and_shield:{ name: 'Sword & Shield', icon: '🛡️', kind: 'weapon', desc: 'The shield bears your oath. The sword keeps it.' },
    quarterstaff:   { name: 'Quarterstaff', icon: '🎋', kind: 'weapon', desc: 'Simple wood, perfectly balanced. The universe respects it.' },
    pact_wand:      { name: 'Pact Wand', icon: '✨', kind: 'weapon', desc: 'It hums when you lie. You\'ve learned to hum louder.' },
    storm_orb:      { name: 'Storm Orb', icon: '🔮', kind: 'weapon', desc: 'A marble of captured weather. Tiny lightning lives inside, rent free.' },
    prayer_beads:   { name: 'Prayer Beads', icon: '📿', kind: 'gear', desc: 'Fifty-nine beads, each a small promise. You count them when you need courage.' },
    forgery_kit:    { name: 'Forgery Kit', icon: '🖋️', kind: 'gear', desc: 'Inks, seals, and steady hands. The paperwork says whatever you need it to say.' },
    thieves_tools:  { name: "Thieves' Tools", icon: '🔧', kind: 'gear', desc: 'Picks, tension bars, a tiny mirror. Every lock is a conversation.' },
    lucky_cloak:    { name: 'Lucky Cloak', icon: '🧥', kind: 'gear', desc: 'It has survived three fires and one very unhappy noblewoman. Lucky, verified.' },
    iron_skillet:   { name: 'Grandmother\'s Skillet', icon: '🍳', kind: 'gear', desc: 'Seasoned by decades of honest cooking. Also a devastating argument.' },
    guild_seal:     { name: 'Guild Seal', icon: '🔖', kind: 'gear', desc: 'Wax-stamped proof that you make things properly, or you make them again.' },
    signet_of_house:{ name: 'Signet of Your House', icon: '💍', kind: 'gear', desc: 'A ring that opens doors your knuckles cannot.' },
    letter_of_note: { name: 'Letter of Introduction', icon: '✉️', kind: 'gear', desc: 'From a respected scholar to... someone, presumably important. Ink slightly smudged.' },
    lucky_fish_charm: { name: 'Lucky Fish Charm', icon: '🐠', kind: 'gear', desc: 'Carved bone, blue as deep water. The sea looks after its own.' },
    soldier_tag:    { name: 'Soldier\'s Tag', icon: '🏷️', kind: 'gear', desc: 'Name, rank, and a vow. Standard issue; anything but standard.' },
    lucky_rats_foot:{ name: 'Lucky Rat\'s Foot', icon: '🐾', kind: 'gear', desc: 'The rat is fine, actually. It just had a spare.' }
  };

  /* ---------- Appearance catalog ---------- */

  const APPEARANCE = {
    builds: [
      { id: 'petite', name: 'Petite' }, { id: 'lithe', name: 'Lithe' }, { id: 'average', name: 'Average' },
      { id: 'sturdy', name: 'Sturdy' }, { id: 'tall', name: 'Tall' }
    ],
    skinTones: [
      { id: 'porcelain', hex: '#ffe8d9', name: 'Porcelain' }, { id: 'ivory', hex: '#ffdcc0', name: 'Warm Ivory' },
      { id: 'golden', hex: '#f5c79e', name: 'Golden' }, { id: 'honey', hex: '#eab585', name: 'Honey' },
      { id: 'amber', hex: '#d99e6e', name: 'Amber' }, { id: 'chestnut', hex: '#c68a5e', name: 'Chestnut' },
      { id: 'sienna', hex: '#b0714a', name: 'Sienna' }, { id: 'umber', hex: '#99603f', name: 'Umber' },
      { id: 'deepumber', hex: '#7d4c33', name: 'Deep Umber' }, { id: 'cocoa', hex: '#633b27', name: 'Rich Cocoa' },
      { id: 'rose', hex: '#f2bfc4', name: 'Rose' }, { id: 'lavash', hex: '#cbb8dc', name: 'Lavender Ash' },
      { id: 'verdant', hex: '#a8c6b0', name: 'Verdant' }, { id: 'moonstone', hex: '#d9d2e9', name: 'Moonstone' }
    ],
    hairStyles: [
      { id: 'bald', name: 'Bald' }, { id: 'buzz', name: 'Buzzcut' }, { id: 'short', name: 'Short' },
      { id: 'sidepart', name: 'Side Part' }, { id: 'messy', name: 'Messy' }, { id: 'bob', name: 'Bob' },
      { id: 'longstraight', name: 'Long & Straight' }, { id: 'longwavy', name: 'Long & Wavy' },
      { id: 'curly', name: 'Curly' }, { id: 'ponytail', name: 'Ponytail' }, { id: 'highponytail', name: 'High Ponytail' },
      { id: 'twinbraids', name: 'Twin Braids' }, { id: 'braid', name: 'Side Braid' }, { id: 'bun', name: 'Bun' },
      { id: 'pigtails', name: 'Pigtails' }, { id: 'mohawk', name: 'Mohawk' }
    ],
    hairColors: [
      { id: 'raven', hex: '#23222b', name: 'Raven' }, { id: 'espresso', hex: '#3a2b22', name: 'Espresso' },
      { id: 'walnut', hex: '#523726', name: 'Walnut' }, { id: 'chestnuthair', hex: '#6e4a2f', name: 'Chestnut' },
      { id: 'russet', hex: '#8c5a33', name: 'Russet' }, { id: 'copper', hex: '#a86c38', name: 'Copper' },
      { id: 'caramel', hex: '#c68d4c', name: 'Caramel' }, { id: 'honeyblonde', hex: '#dfae62', name: 'Honey Blonde' },
      { id: 'goldenblonde', hex: '#eccd85', name: 'Golden Blonde' }, { id: 'platinum', hex: '#f0e6cf', name: 'Platinum' },
      { id: 'silver', hex: '#c9cdd6', name: 'Silver' }, { id: 'snow', hex: '#f2f4f8', name: 'Snow' },
      { id: 'crimson', hex: '#a63d3d', name: 'Crimson' }, { id: 'rose', hex: '#cf6e8a', name: 'Rose' },
      { id: 'orchid', hex: '#b06bc9', name: 'Orchid' }, { id: 'indigo', hex: '#5a6fd0', name: 'Indigo' },
      { id: 'teal', hex: '#4fa8b8', name: 'Teal' }, { id: 'moss', hex: '#6fa25c', name: 'Moss' }
    ],
    eyeColors: [
      { id: 'darkbrown', hex: '#35251b', name: 'Dark Brown' }, { id: 'brown', hex: '#5a3a24', name: 'Brown' },
      { id: 'hazel', hex: '#8a6a35', name: 'Hazel' }, { id: 'amber', hex: '#b97b2e', name: 'Amber' },
      { id: 'forest', hex: '#4c7a44', name: 'Forest' }, { id: 'moss', hex: '#6b9c4f', name: 'Moss' },
      { id: 'seagreen', hex: '#3f8a78', name: 'Sea Green' }, { id: 'sky', hex: '#5b8fc9', name: 'Sky' },
      { id: 'steel', hex: '#8c9aae', name: 'Steel' }, { id: 'storm', hex: '#5f6b7a', name: 'Storm' },
      { id: 'violet', hex: '#7d5bb0', name: 'Violet' }, { id: 'crimson', hex: '#b0453f', name: 'Crimson' },
      { id: 'gold', hex: '#c9a13f', name: 'Gold' }
    ],
    mouths: [
      { id: 'soft', name: 'Soft Smile' }, { id: 'smile', name: 'Warm Smile' }, { id: 'grin', name: 'Big Grin' },
      { id: 'smirk', name: 'Smirk' }, { id: 'neutral', name: 'Quiet' }
    ],
    freckles: [ { id: 'none', name: 'None' }, { id: 'light', name: 'Light' }, { id: 'bold', name: 'Bold' } ],
    scars: [ { id: 'none', name: 'None' }, { id: 'brow', name: 'Brow Scar' }, { id: 'cheek', name: 'Cheek Scar' } ],
    glassesOptions: [ { id: 'none', name: 'None' }, { id: 'round', name: 'Round' }, { id: 'sharp', name: 'Sharp' } ],
    earrings: [ { id: 'none', name: 'None' }, { id: 'studs', name: 'Studs' }, { id: 'hoops', name: 'Hoops' }, { id: 'dangles', name: 'Dangles' } ],
    warpaints: [
      { id: 'none', hex: null, name: 'None' }, { id: 'scar', hex: '#a33a3a', name: 'Scarlet' }, { id: 'dusk', hex: '#3f4a7a', name: 'Dusk' },
      { id: 'moss', hex: '#3f6b4a', name: 'Moss' }, { id: 'plum', hex: '#6e3a52', name: 'Plum' }, { id: 'gold', hex: '#c9a13f', name: 'Gold' },
      { id: 'bone', hex: '#e8dcc0', name: 'Bone' }, { id: 'ink', hex: '#26262e', name: 'Ink' }
    ],
    capes: [ { id: 'none', name: 'None' }, { id: 'short', name: 'Short Cape' }, { id: 'long', name: 'Long Cape' } ],
    outfits: [
      { id: 'traveler',  name: "Traveler's Comfort", classes: [] },
      { id: 'plate',     name: 'Plate Vanguard',      classes: ['fighter'] },
      { id: 'shadow',    name: 'Shadowgarb',          classes: ['rogue'] },
      { id: 'arcanist',  name: 'Arcanist Robes',      classes: ['wizard'] },
      { id: 'vestment',  name: 'Vestments',           classes: ['cleric'] },
      { id: 'finery',    name: "Performer's Finery",  classes: ['bard'] },
      { id: 'wayfinder', name: 'Wayfinder Leathers',  classes: ['ranger'] },
      { id: 'warchief',  name: 'Warchief Wraps',      classes: ['barbarian'] },
      { id: 'verdant',   name: 'Verdant Mantle',      classes: ['druid'] },
      { id: 'oathplate', name: 'Oathplate',           classes: ['paladin'] },
      { id: 'gi',        name: 'Flowing Gi',          classes: ['monk'] },
      { id: 'pactweave', name: 'Pactweave',           classes: ['warlock'] },
      { id: 'stormcaller', name: 'Stormcaller Silks', classes: ['sorcerer'] }
    ],
    outfitColors: [
      { id: 'bark', hex: '#5a4030', name: 'Bark' }, { id: 'umber', hex: '#7a5236', name: 'Umber' },
      { id: 'saddle', hex: '#96613a', name: 'Saddle' }, { id: 'chestnutLeather', hex: '#a9743f', name: 'Chestnut Leather' },
      { id: 'cream', hex: '#e8dcc0', name: 'Cream' }, { id: 'ivory', hex: '#f4ecd8', name: 'Ivory' },
      { id: 'sand', hex: '#d9c49a', name: 'Sand' }, { id: 'sage', hex: '#9caf88', name: 'Sage' },
      { id: 'forest', hex: '#3f6b4a', name: 'Forest' }, { id: 'deeppine', hex: '#2f5240', name: 'Deep Pine' },
      { id: 'olive', hex: '#6b7248', name: 'Olive' }, { id: 'riverteal', hex: '#3f7a7a', name: 'River Teal' },
      { id: 'midnight', hex: '#2f3a52', name: 'Midnight' }, { id: 'stormblue', hex: '#4a5d78', name: 'Storm Blue' },
      { id: 'duskpurple', hex: '#5a4a72', name: 'Dusk' }, { id: 'plum', hex: '#6e3a52', name: 'Plum' },
      { id: 'wine', hex: '#7d3340', name: 'Wine' }, { id: 'brick', hex: '#a05038', name: 'Brick' },
      { id: 'charcoal', hex: '#363640', name: 'Charcoal' }, { id: 'ink', hex: '#26262e', name: 'Ink' },
      { id: 'rose', hex: '#c98a94', name: 'Rose' }, { id: 'butter', hex: '#e3c987', name: 'Butter' }
    ],
    backdrops: [
      { id: 'meadow', name: 'Meadow' }, { id: 'dusk', name: 'Dusk' },
      { id: 'arcane', name: 'Arcane' }, { id: 'parchment', name: 'Parchment' }
    ]
  };

  /* ---------- Name suggestions, quirks, backstory sparks ---------- */

  const NAME_SUGGESTIONS = [
    'Aurelia', 'Bramble', 'Cassia', 'Dorian', 'Elowen', 'Fenwick', 'Gwenllian', 'Hesper',
    'Isolde', 'Jasper', 'Katriel', 'Liora', 'Meridian', 'Nyra', 'Orien', 'Persephone',
    'Quill', 'Rowan', 'Sylvie', 'Thistle', 'Ulric', 'Vesper', 'Wren', 'Yarrow'
  ];

  const QUIRKS = [
    'Talks to animals — and swears they answer.',
    'Cannot walk past a mysterious button without pressing it.',
    'Keeps a diary written in an unbreakable cipher.',
    'Names every weapon after a dessert.',
    'Collects teaspoons from every tavern visited.',
    'Hums battle-songs while thinking.',
    'Must touch every mossy stone "for luck".',
    'Apologizes to doors before picking their locks.',
    'Believes all maps are merely suggestions.',
    'Keeps receipts. Emotional and financial.',
    'Naps anywhere, anytime, with total confidence.',
    'Counts stairs out loud, always.',
    'Tells fortunes with apple seeds.',
    'Refuses to step on cracks, cobblestone or otherwise.',
    'Gives small speeches to the sunrise.',
    'Adopts every stray within a fifty-foot radius.'
  ];

  const BACKSTORY_SPARKS = {
    openers: [
      'They say you were found under a harvest moon, wrapped in a traveler\'s cloak',
      'Your first word was a curse in a language nobody in the village knew',
      'You learned to read from stolen letters and to run from the consequences',
      'The old folks swore the forest watched you grow up, and occasionally graded you',
      'You were the quiet one in a family of eleven, which is its own kind of survival',
      'You left home with a full heart, a light pack, and a door that closed softly behind you'
    ],
    middles: [
      'you learned your craft the hard way: badly, publicly, then brilliantly',
      'a stranger once paid your debts and vanished before you could say thank you',
      'you\'ve kept a promise for years that no one else remembers was ever made',
      'you lost something precious once, and you\'ve been quietly training to be un-loseable ever since',
      'you found a half-burnt letter in the road, and you\'ve carried its question ever since',
      'you are still, technically, banned from one very specific tavern'
    ],
    closers: [
      'now the road reads your name like an invitation.',
      'and the dice have been rolling your way ever since.',
      'which is how you ended up answering odd want-ads from old wizards.',
      'and you have never once regretted the mornings since.',
      'so when a talking imp knocked on your door, of course you said yes.',
      'somewhere out there, a story has been waiting for you specifically.'
    ]
  };

  TDM.CHAR_OPTIONS = {
    ABILITIES, SKILLS, SKILL_STATS, RACES, CLASSES, SUBCLASSES, ORIGINS, ITEMS, APPEARANCE,
    NAME_SUGGESTIONS, QUIRKS, BACKSTORY_SPARKS
  };
})();
