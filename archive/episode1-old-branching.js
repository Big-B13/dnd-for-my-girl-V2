/* ============================================================
   EPISODE 1 — GRAMMY'S COUNTRY APPLE PIE
   Adapted from the adventure by Jennifer Adcock
   (Wildemount edit by Johnny Johnson) into branching form.

   Scene shape:
     { title, art, text(S) or text:string, onEnter, choices:[...] }
   Choice shape:
     { text, hint, if(S), req, check:{stat,skill,dc,...},
       success:{goto,effects}, fail:{goto,effects},
       goto, effects }
   Effects: flags, bond, give, take, gold, xp, damage, heal,
            poisoned, save, remember, chronicle, note
   ============================================================ */
(function () {
  const TDM = (typeof window !== 'undefined')
    ? (window.TDM = window.TDM || {})
    : (global.TDM = global.TDM || {});

  const EP = {
    id: 'ep1_apple_pie',
    number: 1,
    title: "Grammy's Country Apple Pie",
    subtitle: 'A two-hour adventure for the hungry and the brave',
    blurb: 'An ancient gnome wizard wants one last taste of the best pie in the world. The bakery that made it has been silent for a lifetime — and something has moved in.',
    credit: 'Adventure by Jennifer Adcock · Wildemount edit by Johnny Johnson',
    levels: '1st–4th level',
    length: '~2 hours',
    cover: 'pie',
    available: true,
    start: 'tower',
    koScene: 'ko',
    endScene: 'finale',

    scenes: {

      /* ══════════════ ACT I — THE TOWER ══════════════ */

      tower: {
        title: "The Wizard's Study",
        art: 'tower',
        onEnter: { flags: { act: 1 } },
        text: (S) => [
          `You were suspicious when the imp answered the door — small, red, unreasonably polite, and introducing himself as CRIMP with the weariness of someone who has said it ten thousand times — but the tower has been nothing but wonders since. Floating candles. A staircase that hums. A cat made of folded paper that watched you climb.`,
          `At the top is a study lined floor to ceiling with books. A desk holds bubbling potions, mysterious trinkets, and ink-stained scraps of parchment. Behind it, in a very cozy chair, sits an elderly gnome with long wispy white hair, a great hooked nose, and eyes that twinkle like he knows a joke you haven't heard yet.`,
          `"Tyndareus the Green," he says, rising very slowly. "And you must be ${S.name}." He pours you a cup of tea without asking whether you wanted one. It is, annoyingly, exactly how you like it.`
        ],
        choices: [
          { text: '"Thank you. Now — why am I here?"', hint: 'Straight to business.',
            goto: 'tower_pitch', effects: { flags: { polite_start: true } } },
          { text: 'Sip the tea first. Let the old man come to it.', hint: 'Patience is a kind of courtesy.',
            goto: 'tower_pitch', effects: { flags: { patient_start: true }, bond: { tyndareus: 1 } } },
          { text: 'Study the room while he settles — what does a wizard leave lying about?',
            check: { stat: 'INT', skill: 'investigation', dc: 12, label: 'Investigation' },
            success: { goto: 'tower_snoop', effects: { xp: 25, flags: { saw_portrait: true } } },
            fail: { goto: 'tower_pitch', effects: { note: 'Too many marvels, too little time — you take in everything and notice nothing.' } } }
        ]
      },

      tower_snoop: {
        title: 'A Small Discovery',
        art: 'tower',
        text: [
          `Among the clutter you find a portrait, face-down, dusted in a way that says it is picked up often. A gnome boy, perhaps eight, grinning with a missing tooth. He is holding a pie almost as wide as he is.`,
          `Behind him, in the doorway of a bakery, an old woman is caught mid-laugh with flour on her hands.`,
          `Tyndareus sees you looking. For a moment the twinkle goes out of his eyes, and he just looks old.`
        ],
        choices: [
          { text: '"Is this her? Grammy?"', hint: 'Gentle.',
            goto: 'tower_pitch', effects: { bond: { tyndareus: 2 }, flags: { asked_about_grammy: true }, remember: true } },
          { text: 'Set it back down gently and say nothing.', hint: 'Some things are not yours to open.',
            goto: 'tower_pitch', effects: { bond: { tyndareus: 1 } } }
        ]
      },

      tower_pitch: {
        title: 'The Job',
        art: 'tower',
        text: (S) => {
          const lines = [
            `"When I was a boy," he says, smacking his lips, "I tasted the most wonderful treat in all the Material Plane. I remember it like it was yesterday. Grammy's Country Apple Pies." He trails off, somewhere far away. "The bakery was near my village. You could smell the spices all day and night, no matter where you stood in town."`,
            `"Alas — when I went away to wizard college, the place was overrun by the undead. No one has dared go back since." He looks at his hands. "I would like to taste those pies just once more before I depart for the Celestial Plane. If I give you a map, will you go in and find Grammy's secret recipe for me?"`
          ];
          if (S.flags.asked_about_grammy) lines.push(`"And yes," he adds quietly. "That was her."`);
          return lines;
        },
        choices: [
          { text: '"What does it pay?"', hint: 'A professional question.',
            goto: 'tower_terms', effects: { flags: { asked_pay: true } } },
          { text: '"I\'ll do it. An old man should get his pie."', hint: 'Warm, and slightly reckless.',
            goto: 'tower_terms', effects: { bond: { tyndareus: 2 }, flags: { kind_yes: true }, chronicle: 'took the job for kindness, not coin', remember: true } },
          { text: '"Undead. You led with tea and finished with undead."',
            check: { stat: 'CHA', skill: 'insight', dc: 11, label: 'Insight' },
            success: { goto: 'tower_honest', effects: { xp: 25, flags: { warned_truth: true } } },
            fail: { goto: 'tower_terms', effects: { note: 'He spreads his hands innocently, and you cannot catch the lie — if there was one.' } } }
        ]
      },

      tower_honest: {
        title: 'The Part He Left Out',
        art: 'tower',
        text: [
          `You hold his gaze. The twinkle flickers.`,
          `"...The undead are gone," he admits. "Cleared out years ago. By goblins, I'm told, who then stayed." He shrugs, entirely unrepentant. "Goblins are a less romantic hazard. I worried it would not sound like an adventure."`,
          `"They have been living in that bakery a long time. Be careful. And—" he hesitates, "—they are not zombies. Whatever that means to you."`
        ],
        choices: [
          { text: '"It means I\'ll decide when I get there."',
            goto: 'tower_terms', effects: { bond: { tyndareus: 1 }, flags: { knows_goblins: true } } },
          { text: '"It means I don\'t kill anything that can be talked to."',
            goto: 'tower_terms', effects: { bond: { tyndareus: 2 }, flags: { knows_goblins: true, vow_mercy: true }, chronicle: 'vowed not to kill anything that could be reasoned with', remember: true } }
        ]
      },

      tower_terms: {
        title: 'Terms',
        art: 'tower',
        text: [
          `"A large sum of gold when you return," he says. "And keep anything of value you find in the bakery — I have no use for old cash boxes." He raises one finger. "One more thing. If you can find a peaceful way to get that recipe, I will add a bonus. I am old enough to prefer stories where nobody dies over the correct number of apples."`,
          `He pushes a rolled map across the desk. "Four days by road. Two by boat. The imp will see you out."`
        ],
        choices: [
          { text: 'Take the map. Travel by road — four days, feet on the ground.',
            goto: 'road', effects: { give: 'tyndareus_map', flags: { travel: 'road' } } },
          { text: 'Take the map. Travel by boat — two days, and the river is faster.',
            goto: 'boat', effects: { give: 'tyndareus_map', flags: { travel: 'boat' } } },
          { text: 'Ask for coin up front for supplies.',
            check: { stat: 'CHA', skill: 'persuasion', dc: 12, label: 'Persuasion' },
            success: { goto: 'tower_advance', effects: { gold: 25, xp: 25, flags: { got_advance: true } } },
            fail: { goto: 'tower_advance_fail', effects: { bond: { tyndareus: -1 } } } }
        ]
      },

      tower_advance: {
        title: 'An Advance',
        art: 'tower',
        text: [`"Sensible," Tyndareus says, and counts out coins with surprising speed for a man who stands up so slowly. "Buy rope. Everyone always wishes they had bought rope."`],
        choices: [
          { text: 'Travel by road — four days, feet on the ground.', goto: 'road', effects: { give: 'tyndareus_map', flags: { travel: 'road' } } },
          { text: 'Travel by boat — two days on the river.', goto: 'boat', effects: { give: 'tyndareus_map', flags: { travel: 'boat' } } }
        ]
      },

      tower_advance_fail: {
        title: 'No Advance',
        art: 'tower',
        text: [`"After," he says, pleasantly, and the pleasantness has a floor of stone under it. "I have funded a great many adventurers who then discovered urgent business elsewhere."`],
        choices: [
          { text: 'Fair enough. Travel by road.', goto: 'road', effects: { give: 'tyndareus_map', flags: { travel: 'road' } } },
          { text: 'Fair enough. Travel by boat.', goto: 'boat', effects: { give: 'tyndareus_map', flags: { travel: 'boat' } } }
        ]
      },

      /* ══════════════ ACT II — THE ROAD ══════════════ */

      road: {
        title: 'Four Days by Road',
        art: 'road',
        onEnter: { flags: { act: 2 } },
        text: (S) => [
          `The road out of Trostenwald runs through hedgerows gone wild and fields nobody has claimed in years. You walk. It is, for three days, wonderfully boring — the kind of boring you will remember fondly later.`,
          `On the fourth morning, something moves in the tall grass ahead. Small. Quick. Definitely watching you.`
        ],
        choices: [
          { text: 'Freeze and look properly before reacting.',
            check: { stat: 'WIS', skill: 'perception', dc: 12, label: 'Perception' },
            success: { goto: 'road_squirrel', effects: { xp: 25 } },
            fail: { goto: 'road_goblins', effects: {} } },
          { text: 'Keep walking, hand near your weapon.', goto: 'road_goblins', effects: {} },
          { text: 'Call out a friendly greeting to whatever it is.',
            goto: 'road_squirrel', effects: { flags: { friendly_road: true } } }
        ]
      },

      road_squirrel: {
        title: 'A Council of Squirrels',
        art: 'road',
        text: (S) => [
          `It is a squirrel. It is, in fact, six squirrels, standing in the road in a formation that looks uncomfortably deliberate.`,
          `The largest one holds a walnut. It turns the walnut over. It looks at you. It looks at the walnut.`,
          S.hasPassive('speak_with_plants')
            ? `The hedgerow beside you murmurs, in the slow way of hedges, that the squirrels have been waiting here all morning "for the one with the good boots."`
            : `You get the distinct impression you are being appraised.`
        ],
        choices: [
          { text: 'Offer a piece of your rations.',
            goto: 'road_arrive', effects: { bond: { nature: 1 }, flags: { fed_squirrels: true }, xp: 25, note: 'The squirrels accept your tribute and escort you a quarter mile down the road, which is either an honor guard or a shakedown.' } },
          { text: 'Bow, very seriously, to the squirrel council.',
            goto: 'road_arrive', effects: { bond: { nature: 1 }, flags: { bowed_squirrels: true }, xp: 25, note: 'The large squirrel returns the bow. You will think about this for years.' } },
          { text: 'Walk on. It is a squirrel.', goto: 'road_arrive', effects: {} }
        ]
      },

      road_goblins: {
        title: 'Goblin Patrol',
        art: 'road',
        text: [
          `Four goblins burst out of the grass — and stop dead, as surprised as you are. They are thin, scarred, and carrying a sack that smells overwhelmingly of apples.`,
          `One of them has flour on its face. All four are staring at you the way a cat stares when it has been caught on the table.`
        ],
        choices: [
          { text: '"I\'m not here for you. Go home."',
            check: { stat: 'CHA', skill: 'persuasion', dc: 13, label: 'Persuasion' },
            success: { goto: 'road_goblins_pass', effects: { xp: 50, flags: { goblins_met_peacefully: true }, chronicle: 'let a goblin patrol walk away on the road', remember: true } },
            fail: { goto: 'road_goblins_tense', effects: {} } },
          { text: 'Loom. Make yourself the most expensive option available.',
            check: { stat: 'CHA', skill: 'intimidation', dc: 13, label: 'Intimidation' },
            success: { goto: 'road_goblins_flee', effects: { xp: 50, flags: { scared_patrol: true }, chronicle: 'frightened a goblin patrol off the road', remember: true } },
            fail: { goto: 'road_goblins_tense', effects: {} } },
          { text: 'Draw steel.',
            goto: 'road_fight', effects: { flags: { drew_first_road: true }, chronicle: 'drew a blade on the goblins before a word was spoken', remember: true } },
          { text: 'Point at the apple sack. "Where did you get those?"',
            check: { stat: 'INT', skill: 'investigation', dc: 11, label: 'Investigation' },
            success: { goto: 'road_goblins_apples', effects: { xp: 50, flags: { knows_orchard: true } } },
            fail: { goto: 'road_goblins_tense', effects: {} } }
        ]
      },

      road_goblins_pass: {
        title: 'Passage',
        art: 'road',
        text: [
          `The smallest goblin says something in a language of clicks and edges. The tallest one — clearly in charge, wearing a soup ladle on a string like a badge of office — considers you for a long moment.`,
          `Then it steps aside. The others follow. As they pass, the floury one holds out a slightly bruised apple, drops it at your feet, and scurries off.`,
          `Goblins, it turns out, understand tolls. And gifts.`
        ],
        choices: [
          { text: 'Pick up the apple. Eat it. It is a very good apple.',
            goto: 'road_arrive', effects: { bond: { goblins: 2 }, flags: { ate_goblin_apple: true }, note: 'It is the best apple you have had in your life, and you have not even reached the orchard.' } },
          { text: 'Pick it up and pocket it for later.',
            goto: 'road_arrive', effects: { bond: { goblins: 1 }, give: 'apple_of_mac' } }
        ]
      },

      road_goblins_flee: {
        title: 'They Run',
        art: 'road',
        text: [
          `You do not shout. You simply let them see, in your face, exactly how much of a problem you are willing to be.`,
          `They drop the sack and scatter into the grass. Apples roll everywhere.`,
          `Somewhere in that bakery, four goblins are going to describe you to everyone they know.`
        ],
        choices: [
          { text: 'Take an apple from the sack and move on.', goto: 'road_arrive', effects: { give: 'apple_of_mac', bond: { goblins: -1 } } },
          { text: 'Leave the sack where it fell. They will come back for it.',
            goto: 'road_arrive', effects: { bond: { goblins: 1 }, note: 'A small mercy, noted by at least one pair of eyes still in the grass.' } }
        ]
      },

      road_goblins_apples: {
        title: 'Where the Apples Come From',
        art: 'road',
        text: [
          `You point. The goblins look at the sack, then at each other, with the guilt of a creature caught doing something it has been told off for before.`,
          `"Orchard," the tall one says in thick Common. "Ours. Tree-ladies say no. We take anyway." It lifts its chin, daring you to care.`,
          `Tree-ladies. Dryads, then, and they don't like the goblins. Useful.`
        ],
        choices: [
          { text: '"I won\'t tell them." (Let it lie.)',
            goto: 'road_arrive', effects: { bond: { goblins: 2 }, flags: { knows_orchard: true, apple_secret: true }, chronicle: 'kept a goblin secret from the dryads', remember: true } },
          { text: '"Then you should stop stealing from them."',
            goto: 'road_arrive', effects: { bond: { goblins: -1 }, flags: { knows_orchard: true }, note: 'The goblin says a word you do not know, but you understand it perfectly.' } }
        ]
      },

      road_goblins_tense: {
        title: 'A Bad Silence',
        art: 'road',
        text: [
          `Whatever you were going for does not land. The goblins fan out, weapons up. The one with flour on its face is shaking, and a shaking creature with a knife is the most dangerous thing on this road.`,
          `Nobody has swung yet. There is still a door open here, but it is closing.`
        ],
        choices: [
          { text: 'Slowly. Put your hands where they can see them.',
            check: { stat: 'WIS', skill: 'animal_handling', dc: 12, label: 'Steady Hands', advIf: [{ origin: 'folk_hero' }, { cls: 'druid' }] },
            success: { goto: 'road_goblins_pass', effects: { xp: 50, flags: { goblins_met_peacefully: true }, chronicle: 'talked a frightened goblin patrol down from violence', remember: true } },
            fail: { goto: 'road_fight', effects: {} } },
          { text: 'Back away down the road. Give them the ground.',
            goto: 'road_arrive', effects: { flags: { backed_off_road: true }, bond: { goblins: 1 }, note: 'You give way. They watch you go, and nobody bleeds. Not every victory looks like one.' } },
          { text: 'Strike first.', goto: 'road_fight', effects: { flags: { drew_first_road: true }, chronicle: 'struck the first blow on the road', remember: true } }
        ]
      },

      road_fight: {
        title: 'Steel and Grass',
        art: 'road',
        text: [
          `It is fast, ugly, and over in under a minute — the way real fights are, not the way songs tell it.`,
          `Make it count.`
        ],
        choices: [
          { text: 'Fight to drive them off, not to kill.',
            check: { stat: 'STR', skill: 'athletics', dc: 12, label: 'Athletics', advIf: [{ cls: 'fighter' }, { cls: 'barbarian' }, { cls: 'paladin' }] },
            success: { goto: 'road_fight_win', effects: { xp: 75, flags: { spared_road_patrol: true }, chronicle: 'beat the road patrol bloody but spared every one of them', remember: true } },
            fail: { goto: 'road_fight_hurt', effects: { damage: '1d6+1' } } },
          { text: 'Fight properly. They chose this.',
            check: { stat: 'DEX', skill: 'acrobatics', dc: 12, label: 'Combat', advIf: [{ cls: 'rogue' }, { cls: 'ranger' }, { cls: 'monk' }] },
            success: { goto: 'road_fight_kill', effects: { xp: 75, flags: { killed_road_patrol: true }, bond: { goblins: -3 }, chronicle: 'killed the goblin patrol on the road', remember: true } },
            fail: { goto: 'road_fight_hurt', effects: { damage: '1d6+1' } } }
        ]
      },

      road_fight_win: {
        title: 'Driven Off',
        art: 'road',
        text: [
          `You break their line without breaking their bones. The tall one goes down winded, stares up at you, and finds you already stepping back — hands open, blade lowered.`,
          `It takes the offer. They vanish into the grass, dragging their sack, leaving a trail of apples and a story they will absolutely exaggerate.`
        ],
        choices: [{ text: 'Walk on toward the bakery.', goto: 'road_arrive', effects: { bond: { goblins: -1 } } }]
      },

      road_fight_kill: {
        title: 'Four in the Grass',
        art: 'road',
        text: [
          `When it is done, the road is very quiet. The apples have rolled into the ditch. One of them still has flour on its face.`,
          `You clean your weapon. Nobody saw. That, you will learn, is not the same as nobody knowing.`
        ],
        choices: [{ text: 'Walk on toward the bakery.', goto: 'road_arrive', effects: { flags: { has_blood_debt: true } } }]
      },

      road_fight_hurt: {
        title: 'They Get a Hit In',
        art: 'road',
        text: [
          `A scimitar finds the gap in your guard and you feel it — bright, hot, and educational.`,
          `The goblins don't press. They grab their sack and run while they are ahead, shrieking triumphantly about the mighty wound they inflicted.`
        ],
        choices: [{ text: 'Bind it up and keep walking.', goto: 'road_arrive', effects: { bond: { goblins: -1 } } }]
      },

      boat: {
        title: 'Two Days on the River',
        art: 'boat',
        onEnter: { flags: { act: 2 } },
        text: (S) => [
          `The riverboat is called the Second Breakfast, and its captain is a halfling who has strong opinions about everything, including you.`,
          `The water does the walking. Willow branches drag the surface. On the second evening, the captain points her pipe at the bank: a collapsed stone wall, a chimney with a tree growing through it, and beyond it — unmistakably — rows and rows of apple trees.`,
          S.isOrigin('sailor') ? `You know this stretch of water. You worked a run like this once, and your hands still remember the rope.` : `"That's your stop," she says. "I'll not tie up there. Nothing personal — just the place hums wrong."`
        ],
        choices: [
          { text: 'Ask what she knows about the bakery.',
            check: { stat: 'CHA', skill: 'persuasion', dc: 11, label: 'Persuasion', advIf: [{ origin: 'sailor' }] },
            success: { goto: 'boat_lore', effects: { xp: 50 } },
            fail: { goto: 'boat_arrive', effects: { note: '"I know I don\'t go there," she says, and that is the end of it.' } } },
          { text: 'Work the ropes for passage and keep your coin.',
            check: { stat: 'STR', skill: 'athletics', dc: 10, label: 'Athletics', advIf: [{ origin: 'sailor' }] },
            success: { goto: 'boat_arrive', effects: { gold: 10, xp: 25, note: 'She knocks the fare off and calls you "useful", which from her is a knighthood.' } },
            fail: { goto: 'boat_arrive', effects: { note: 'You tangle the line spectacularly. She takes the full fare and calls you "decorative".' } } },
          { text: 'Sit on the deck and watch the water go by.',
            goto: 'boat_arrive', effects: { heal: '1d4', flags: { rested_river: true }, note: 'Two quiet days. You arrive steadier than you left.' } }
        ]
      },

      boat_lore: {
        title: 'What the Captain Knows',
        art: 'boat',
        text: [
          `She refills her pipe. "Undead, once. Everyone knows that. What everyone forgets is that the undead went away, and something else came in and stayed."`,
          `"Green things. Little ones. They come down to the water at dusk and wash. Wash! Zombies never washed." She snorts. "And there's a tree in the front yard that turns to watch the boats. I've seen it. Don't you go swinging an axe near that tree."`,
          `She jabs the pipe stem at you. "One more thing. The orchard out back sings sometimes. If it's singing, it's got company."`
        ],
        choices: [
          { text: '"Thank you. Truly."', goto: 'boat_arrive',
            effects: { flags: { knows_goblins: true, knows_mac: true, knows_orchard: true }, xp: 25, bond: { captain: 1 } } }
        ]
      },

      boat_arrive: { title: 'Ashore', art: 'boat',
        text: [`She puts you ashore on a gravel bar downriver and pushes off before you have both feet out of the boat.`, `"Second Breakfast passes back through in three days," she calls. "Be alive."`],
        choices: [{ text: 'Walk up toward the bakery.', goto: 'arrival', effects: {} }] },

      road_arrive: { title: 'The Ruined Village', art: 'road',
        text: [`By afternoon the road stops pretending to be a road. You pass the bones of a village: a well, a wall, a doorway standing on its own with nothing left to open into.`, `And then the smell hits you. Apples. Warm, sweet, ripening apples — thick enough to lean on.`],
        choices: [{ text: 'Follow your nose.', goto: 'arrival', effects: {} }] },

      /* ══════════════ ACT III — OUTSIDE THE BAKERY ══════════════ */

      arrival: {
        title: "Grammy's Bakery",
        art: 'bakery',
        onEnter: { flags: { act: 3 } },
        text: (S) => [
          `The road turns to gravel, running through a lawn that has forgotten what a lawn is, toward a large stone building with a great set of wooden double doors.`,
          `The fragrance of ripening apples is overwhelming — it comes from the old orchard behind. And there, near the path, stands one massive apple tree, older and broader than the rest.`,
          `As the wind moves through the long grass, you notice something about the bark of that tree. The pattern of it. The whorls and knots.`,
          `It looks almost exactly like an ancient, wizened face.`,
          S.flags.knows_mac ? `The captain's warning comes back to you: don't you go swinging an axe near that tree.` : ``
        ],
        choices: [
          { text: 'Greet the tree. Out loud. Like a person.',
            goto: 'mac_greet', effects: { flags: { greeted_mac: true } } },
          { text: 'Study the tree carefully before doing anything.',
            check: { stat: 'INT', skill: 'nature', dc: 11, label: 'Nature', advIf: [{ cls: 'druid' }, { cls: 'ranger' }, { origin: 'outlander' }] },
            success: { goto: 'mac_identified', effects: { xp: 25, flags: { identified_treant: true } } },
            fail: { goto: 'mac_greet', effects: { note: 'It is a tree. A very large tree. Probably.' } } },
          { text: 'Ignore the tree. Head for the front doors.',
            goto: 'front_doors', effects: { flags: { ignored_mac: true } } },
          { text: 'Circle around back toward the orchard instead.',
            goto: 'orchard', effects: { flags: { went_orchard_first: true } } }
        ]
      },

      mac_identified: {
        title: 'That Is Not a Tree',
        art: 'mac',
        text: [
          `The trunk breathes. Not quickly — once, perhaps, in the time it takes you to count to thirty. But it breathes.`,
          `A treant. An apple treant, ancient and enormous, with roots sunk so deep into this hillside that he has probably watched the bakery built, filled, emptied, and overrun.`,
          `He is pretending, very transparently, to be asleep.`
        ],
        choices: [
          { text: '"I know what you are. Good afternoon."', goto: 'mac_greet', effects: { flags: { greeted_mac: true, impressed_mac: true }, bond: { mac: 1 } } },
          { text: 'Let him pretend. Head for the doors.', goto: 'front_doors', effects: { flags: { ignored_mac: true } } }
        ]
      },

      mac_greet: {
        title: 'Mac',
        art: 'mac',
        onEnter: { flags: { met_mac: true } },
        text: (S) => [
          `For a long moment, nothing.`,
          `Then bark creaks like a door in a storm, and two knots the size of dinner plates slide open into eyes. A mouth cracks apart in the trunk, full of splinters.`,
          `"Hrrrmph." The voice comes from somewhere underground. "Another one. Young, too. You're all young." A pause. "I am Macintosh. Mac, if you must. And before you ask — no, I don't know about any secret recipes. Nobody ever tells the tree anything."`,
          S.flags.impressed_mac ? `He squints. "Though you knew what I was before I opened my eyes. That's more than most."` : ``
        ],
        choices: [
          { text: '"What can you tell me about this place?"',
            check: { stat: 'CHA', skill: 'persuasion', dc: 12, label: 'Persuasion', advIf: [{ flag: 'impressed_mac' }, { cls: 'druid' }] },
            success: { goto: 'mac_talks', effects: { xp: 50, bond: { mac: 1 } } },
            fail: { goto: 'mac_grumpy', effects: {} } },
          { text: 'Ask him about the goblins.',
            check: { stat: 'INT', skill: 'investigation', dc: 12, label: 'Investigation' },
            success: { goto: 'mac_goblins', effects: { xp: 50, flags: { knows_goblins: true } } },
            fail: { goto: 'mac_grumpy', effects: {} } },
          { text: 'Compliment the orchard. Sincerely.', if: (S) => true,
            goto: 'mac_talks', effects: { bond: { mac: 2 }, flags: { flattered_mac: true }, note: 'Mac makes a sound like a landslide clearing its throat. He is trying very hard not to look pleased.' } },
          { text: '(Druid) Speak to him in the old green tongue.', req: { cls: 'druid' },
            goto: 'mac_druid', effects: { bond: { mac: 3 }, xp: 50, flags: { mac_ally: true }, chronicle: 'spoke to the treant Mac in Druidic and won his friendship', remember: true } }
        ]
      },

      mac_druid: {
        title: 'The Old Green Tongue',
        art: 'mac',
        text: [
          `You speak, and it is not Common that comes out. It is the language of root-pressure and slow water and the particular grief of a tree that has outlived its orchard-keeper.`,
          `Mac goes completely still. Then, with a groan of timber, he leans down until that vast wooden face is level with yours.`,
          `"It has been ninety-one years," he says, "since anyone spoke to me properly." Sap wells in the corners of his eyes, thick and amber and slow. "Ask me anything, child. Anything at all."`
        ],
        choices: [
          { text: '"Tell me everything."', goto: 'mac_talks', effects: { flags: { mac_told_all: true } } }
        ]
      },

      mac_talks: {
        title: 'What the Tree Remembers',
        art: 'mac',
        text: (S) => {
          const l = [
            `"Grammy," he says, and the word comes out gentler than the rest of him. "Every single morning, before the ovens. She would come out with two cups — one for her, one poured into my roots, which is not how tea works, but I appreciated the gesture."`,
            `"And every morning she'd walk out back and chat with the dryads in the old orchard. Hours, sometimes." He creaks. "If anyone knows her business, it's those three. They're mischievous little terrors and they'll pelt you with fruit, but they liked her."`
          ];
          if (S.flags.mac_told_all) l.push(`"One more thing. The goblins inside — they kill the undead that wandered here, and they leave my trees alone. Mostly. I do not love them. But I would not have you kill them for me. I have seen enough of this hill die."`);
          return l;
        },
        choices: [
          { text: '"Thank you, Mac." Head for the orchard.', goto: 'orchard', effects: { flags: { mac_sent_orchard: true } } },
          { text: 'Ask about the goblins first.', goto: 'mac_goblins', effects: { flags: { knows_goblins: true } } },
          { text: 'Head for the front doors instead.', goto: 'front_doors', effects: {} }
        ]
      },

      mac_goblins: {
        title: 'On the Subject of Goblins',
        art: 'mac',
        text: [
          `"The green ones?" Mac rustles dismissively. "They came after the dead ones. Killed them, which I'll grant was useful. Then they moved in and started... baking." A long, disgusted pause. "Badly. The smell some mornings could curdle rain."`,
          `"They mostly ignore me and I mostly ignore them. They've not taken an axe to a single one of my trees in eleven years." He fixes you with a knot-eyed stare. "Which is eleven years more consideration than most of your lot have shown me. Bear that in mind, whatever you're planning."`
        ],
        choices: [
          { text: '"I don\'t plan to hurt them."', goto: 'orchard', effects: { bond: { mac: 2 }, flags: { promised_mac_peace: true }, chronicle: 'promised the treant Mac not to harm the goblins', remember: true } },
          { text: '"I\'ll do what the job needs."', goto: 'orchard', effects: { note: 'Mac says nothing. Trees are very good at saying nothing loudly.' } },
          { text: 'Ask about Grammy instead.', goto: 'mac_talks', effects: {} }
        ]
      },

      mac_grumpy: {
        title: 'Hrrmph',
        art: 'mac',
        text: [
          `"Nobody tells the tree anything," Mac repeats, and closes one eye. "Ninety years I stand here. Do they consult me? They do not."`,
          `He is sulking. You could stand here and wait out a sulk that has lasted nine decades, or you could get on with it.`
        ],
        choices: [
          { text: 'Try once more, kindly.',
            check: { stat: 'CHA', skill: 'persuasion', dc: 10, label: 'Persuasion' },
            success: { goto: 'mac_talks', effects: { xp: 25, bond: { mac: 1 } } },
            fail: { goto: 'arrival_hub', effects: { note: 'Mac begins, pointedly, to pretend to be a tree again.' } } },
          { text: 'Leave him to it.', goto: 'arrival_hub', effects: {} }
        ]
      },

      arrival_hub: {
        title: 'The Grounds',
        art: 'bakery',
        text: [`The bakery waits. Front doors, barred and rotting. The orchard out back, whispering. And a heaped, reeking mound of old waste along the side wall.`],
        choices: [
          { text: 'The apple orchard out back.', goto: 'orchard', effects: {} },
          { text: 'The front double doors.', goto: 'front_doors', effects: {} },
          { text: 'The waste pile along the wall.', goto: 'waste', effects: {} }
        ]
      },

      /* ---------- Orchard & dryads ---------- */

      orchard: {
        title: 'The Apple Orchard',
        art: 'orchard',
        onEnter: { flags: { reached_orchard: true } },
        text: (S) => [
          `The scent here is almost a solid thing. Older trees stand in neat rows; young saplings have sprung up everywhere in between, wild and unbothered.`,
          `There is a whispering that is not the leaves. Early-ripened apples litter the grass.`,
          `One of them sails past your head — close enough to feel — and thumps into the turf behind you. The whispering becomes giggling.`
        ],
        choices: [
          { text: 'Laugh. Pick up the apple and offer it back with a bow.',
            goto: 'dryads_charmed', effects: { bond: { dryads: 2 }, xp: 50, flags: { dryads_amused: true } } },
          { text: 'Offer a gift — something from your own pack.',
            goto: 'dryads_gift', effects: {} },
          { text: 'Call out politely and ask them to show themselves.',
            check: { stat: 'CHA', skill: 'persuasion', dc: 13, label: 'Persuasion', advIf: [{ race: 'elf' }, { race: 'half_elf' }, { cls: 'druid' }] },
            success: { goto: 'dryads_appear', effects: { xp: 50 } },
            fail: { goto: 'dryads_hidden', effects: {} } },
          { text: 'Throw the apple back into the trees.',
            goto: 'dryads_offended', effects: { flags: { dryads_offended: true }, bond: { dryads: -2 }, chronicle: 'started an apple fight with the dryads of the orchard', remember: true } },
          { text: 'Leave the orchard alone and try the building.', goto: 'front_doors', effects: {} }
        ]
      },

      dryads_gift: {
        title: 'An Offering',
        art: 'orchard',
        text: [`You crouch, set something down in the grass where the whispering is loudest, and step back.`],
        choices: [
          { text: 'Your rations — honest food, freely given.',
            goto: 'dryads_appear', effects: { bond: { dryads: 2 }, xp: 25, flags: { gave_dryads_food: true } } },
          { text: 'Sing to them instead — you have nothing worth giving but this.', req: { cls: 'bard' },
            goto: 'dryads_song', effects: { bond: { dryads: 4 }, xp: 75, flags: { dryads_love: true }, chronicle: 'sang to the dryads and was adored for it', remember: true } },
          { text: 'A coin. It is what you have.',
            goto: 'dryads_appear', effects: { gold: -5, bond: { dryads: 1 }, note: 'Something small and green takes the coin, examines it, and appears deeply unimpressed by the concept of money.' } },
          { text: 'Plant a sapling that has sprouted in the path where it will not be trodden.',
            goto: 'dryads_appear', effects: { bond: { dryads: 3 }, xp: 50, flags: { planted_sapling: true }, chronicle: 'replanted a trampled sapling in the orchard', remember: true } }
        ]
      },

      dryads_song: {
        title: 'The Orchard Listens',
        art: 'orchard',
        text: [
          `You sing. Nothing grand — something old and small, the kind of song sung while working.`,
          `The giggling stops. The whispering stops. Even the wind seems to hold.`,
          `Three figures step out of three trunks as though the bark were a curtain: green-gold hair, skin like young birch, eyes with no whites at all. They come very close, all three at once, and listen with an intensity that would be frightening if it were not so purely delighted.`,
          `When you finish, the tallest one takes your face in both cool hands and says: "Again. Later. You must come back and do that again."`
        ],
        choices: [{ text: '"I will. But first — I need your help."', goto: 'dryads_appear', effects: {} }]
      },

      dryads_charmed: {
        title: 'Well Thrown',
        art: 'orchard',
        text: [
          `You bow, apple extended, like a courtier returning a dropped glove.`,
          `The giggling redoubles — and then three dryads are simply there, having stepped out of the trees without any of the intervening business of walking. Green-gold hair. Bark-pale skin. Eyes like deep wells.`,
          `"It bowed," one whispers, scandalized. "Nobody bows."`
        ],
        choices: [{ text: 'Get to business.', goto: 'dryads_appear', effects: {} }]
      },

      dryads_appear: {
        title: 'Three of the Orchard',
        art: 'orchard',
        onEnter: { flags: { met_dryads: true, fey_audience: true } },
        text: (S) => [
          `They circle you, curious, unhurried. Up close they smell of cut grass and cold water.`,
          `"You want something," says the tallest. "Everyone who comes wants something. The green ones want apples and never ask. They take and take." Her mouth thins. "We hate them. We hated the dead ones more, so." A shrug that ripples through all three of them at once.`,
          `"Ask, then. Quickly. We are extremely busy." She is very obviously not busy at all.`
        ],
        choices: [
          { text: 'Ask about Grammy and her recipe.',
            check: { stat: 'CHA', skill: 'persuasion', dc: 17, label: 'Persuasion',
              advIf: [{ flag: 'dryads_love' }, { flag: 'gave_dryads_food' }, { flag: 'planted_sapling' }, { race: 'elf' }] },
            success: { goto: 'dryads_secret', effects: { xp: 100, flags: { knows_recipe_halves: true }, chronicle: 'charmed the dryads into revealing where the recipe was hidden', remember: true } },
            fail: { goto: 'dryads_coy', effects: {} } },
          { text: 'Search their faces for what they are not saying.',
            check: { stat: 'INT', skill: 'investigation', dc: 17, label: 'Investigation' },
            success: { goto: 'dryads_secret', effects: { xp: 100, flags: { knows_recipe_halves: true } } },
            fail: { goto: 'dryads_coy', effects: {} } },
          { text: 'Ask the safer question: how do I get inside unseen?',
            check: { stat: 'CHA', skill: 'persuasion', dc: 13, label: 'Persuasion' },
            success: { goto: 'dryads_dock', effects: { xp: 50, flags: { knows_loading_dock: true } } },
            fail: { goto: 'dryads_coy', effects: {} } },
          { text: '(Speak with Plants) Ask the orchard itself, not the dryads.', req: { passive: 'speak_with_plants' },
            goto: 'dryads_secret', effects: { xp: 100, flags: { knows_recipe_halves: true, asked_the_trees: true }, chronicle: 'asked the orchard itself where Grammy hid her recipe', remember: true } }
        ]
      },

      dryads_secret: {
        title: 'Half and Half',
        art: 'orchard',
        text: (S) => [
          S.flags.asked_the_trees
            ? `You do not ask the dryads. You put your hand flat on the oldest apple tree and ask it, and the answer comes up through your palm like cold water through a root.`
            : `The tall one exchanges a look with the others. Something is decided in a language of eyebrows.`,
          `"She was careful, our Grammy. She never wrote the whole thing in one place — not once in sixty years." A sly smile. "Half of it lives in the front office. The other half in her own rooms, upstairs, where she slept."`,
          `"Both halves, or nothing. And the green ones have made a nest of her rooms."`,
          `The smallest dryad adds, helpfully: "If you go in the big front doors, they will hear you. Everyone hears the front doors. Go round the back — the loading dock. They never watch it."`
        ],
        choices: [
          { text: '"Thank you. Genuinely."',
            goto: 'orchard_hub', effects: { flags: { knows_loading_dock: true }, bond: { dryads: 1 }, give: 'dryad_token', note: 'The tall one plucks three strands of her own hair, braids them into a ring, and presses it into your palm. "So the orchard knows you."' } }
        ]
      },

      dryads_dock: {
        title: 'The Back Way',
        art: 'orchard',
        text: [
          `"The front doors," the tall dryad says, with enormous contempt, "are for people who want to be noticed. They are barred, they are loud, and the green ones will hear you coming the moment you touch them."`,
          `"Round the back there is a loading dock where the carts used to come. Big sliding door. They never watch it, because nothing has ever come in that way in eleven years." She grins, all teeth. "Be the first."`
        ],
        choices: [{ text: 'Noted.', goto: 'orchard_hub', effects: { flags: { knows_loading_dock: true } } }]
      },

      dryads_coy: {
        title: 'Not Today',
        art: 'orchard',
        text: [
          `"Mmmm," says the tall one, and the other two make the same noise a half-second later, like an echo that has been rehearsed.`,
          `"We don't think we'll say. We like knowing things you don't." She pats your cheek with a hand like cool bark. "Try being more interesting."`,
          `They melt back into the trunks. The whispering resumes, slightly smug.`
        ],
        choices: [
          { text: 'Try once more, differently.',
            check: { stat: 'CHA', skill: 'performance', dc: 13, label: 'Performance', advIf: [{ cls: 'bard' }, { origin: 'entertainer' }] },
            success: { goto: 'dryads_dock', effects: { xp: 50, flags: { knows_loading_dock: true } } },
            fail: { goto: 'orchard_hub', effects: { note: 'The orchard giggles at you. It is not unkind. It is just not helpful.' } } },
          { text: 'Leave it. You will find it yourself.', goto: 'orchard_hub', effects: {} }
        ]
      },

      dryads_hidden: {
        title: 'They Do Not Come Out',
        art: 'orchard',
        text: [
          `You call out, politely, into the trees. Nothing answers but the whispering, which takes on a distinctly unimpressed quality.`,
          `A single apple drops out of a branch above you and lands, with great precision, on your foot.`,
          `They are not coming out for a stranger who has given them nothing and shown them nothing worth seeing.`
        ],
        choices: [
          { text: 'Try again — offer them something of yours.', goto: 'dryads_gift', effects: {} },
          { text: 'Sit down in the grass and wait them out.',
            check: { stat: 'WIS', skill: 'survival', dc: 12, label: 'Patience' },
            success: { goto: 'dryads_appear', effects: { xp: 50, note: 'You sit for the better part of an hour, doing nothing, wanting nothing. Curiosity beats them in the end — it always does.' } },
            fail: { goto: 'orchard_hub', effects: { note: 'They out-wait you comfortably. They have had centuries of practice.' } } },
          { text: 'Give up on the orchard.', goto: 'orchard_hub', effects: {} }
        ]
      },

      dryads_offended: {
        title: 'Apple War',
        art: 'orchard',
        text: [
          `Your throw is good. Your throw is, in fact, excellent.`,
          `The orchard's response is overwhelming. Apples come from every direction at once — half-rotten, perfectly aimed, and apparently infinite. You retreat under a barrage of fruit and shrieking fey laughter, sticky, humiliated, and no wiser.`,
          `Something to bear in mind: the dryads knew things. They are not going to tell you now.`
        ],
        choices: [{ text: 'Retreat with what dignity remains.', goto: 'orchard_hub', effects: { note: 'You will be finding apple in your hair for days.' } }]
      },

      orchard_hub: {
        title: 'Behind the Bakery',
        art: 'orchard',
        text: (S) => [
          `The orchard falls quiet behind you.`,
          S.flags.knows_loading_dock
            ? `The loading dock is round the back — a wide sliding door, exactly where they said it would be.`
            : `The building presents two ways in that you can see: the big front doors, and a heap of waste along the side wall that you would rather not think about.`
        ],
        choices: [
          { text: 'The loading dock, round the back.', if: (S) => !!S.flags.knows_loading_dock, goto: 'dock', effects: {} },
          { text: 'Walk the walls and look for another way in.',
            check: { stat: 'WIS', skill: 'perception', dc: 12, label: 'Perception' },
            success: { goto: 'dock', effects: { xp: 25, flags: { knows_loading_dock: true }, note: 'Round the back you find it: a wide sliding cart door, dusty and unwatched.' } },
            fail: { goto: 'patrol_risk', effects: {} } },
          { text: 'The front double doors.', goto: 'front_doors', effects: {} },
          { text: 'Examine the waste pile.', goto: 'waste', effects: {} }
        ]
      },

      patrol_risk: {
        title: 'Company',
        art: 'bakery',
        text: [
          `You spend ten long minutes circling the building in the open, and the bakery notices.`,
          `Three goblins come around the corner at a trot — and all four of you stop dead. One of them is holding a rolling pin. None of you expected this.`
        ],
        choices: [
          { text: 'Duck out of sight, fast.',
            check: { stat: 'DEX', skill: 'stealth', dc: 13, label: 'Stealth', advIf: [{ cls: 'rogue' }, { origin: 'urchin' }, { race: 'halfling' }] },
            success: { goto: 'orchard_hub', effects: { xp: 50, note: 'You are behind a water butt before they finish blinking. They wander off, arguing about whether they saw anything.' } },
            fail: { goto: 'patrol_spotted', effects: {} } },
          { text: 'Raise your empty hands and say hello.',
            goto: 'patrol_parley', effects: { flags: { hailed_patrol: true } } },
          { text: 'Attack before they can raise the alarm.',
            goto: 'patrol_fight', effects: { flags: { attacked_patrol: true }, bond: { goblins: -3 }, chronicle: 'ambushed a goblin patrol outside the bakery', remember: true } }
        ]
      },

      patrol_spotted: {
        title: 'Alarm',
        art: 'bakery',
        onEnter: { flags: { bakery_alerted: true } },
        text: [
          `The one with the rolling pin screams — a genuinely impressive sound — and all three bolt for the back door, shrieking a word you don't know but can translate perfectly.`,
          `Whatever surprise you had is gone. Inside, doors are slamming.`
        ],
        choices: [
          { text: 'Go in after them, now, before they can organize.', goto: 'dock', effects: { flags: { knows_loading_dock: true, rushed_in: true } } },
          { text: 'Wait. Let them calm down. Then move.',
            goto: 'orchard_hub', effects: { flags: { waited_out_alarm: true }, note: 'You give it an hour in the long grass. The shouting dies down. They are still nervous — but they are not watching every door anymore.' } }
        ]
      },

      patrol_parley: {
        title: 'Hands Up',
        art: 'bakery',
        text: (S) => [
          `You show them your palms. It is such an unexpected thing to do that all three of them stop.`,
          `The one with the rolling pin holds it up like a warding charm. "You not dead-thing," it says, in Common you can just about follow. "Dead-things don't wave."`,
          S.bond('goblins') > 0 ? `One of the others whispers something and points at you — and you realize with a start that you have been recognized from the road.` : ``
        ],
        choices: [
          { text: '"I\'m here for a recipe. Nothing else. Nobody has to bleed."',
            check: { stat: 'CHA', skill: 'persuasion', dc: 13, label: 'Persuasion', advIf: [{ flag: 'goblins_met_peacefully' }, { flag: 'apple_secret' }] },
            success: { goto: 'patrol_escort', effects: { xp: 75, bond: { goblins: 2 }, flags: { goblin_escort: true }, chronicle: 'walked into the bakery as a guest of the goblins, not an intruder', remember: true } },
            fail: { goto: 'patrol_spotted', effects: {} } },
          { text: 'Show them the apple you were given on the road.', req: { item: 'apple_of_mac' },
            goto: 'patrol_escort', effects: { xp: 75, bond: { goblins: 3 }, flags: { goblin_escort: true }, chronicle: 'proved friendship to the goblins with an apple given freely', remember: true } },
          { text: 'Lie. "Your chief sent for me."',
            check: { stat: 'CHA', skill: 'deception', dc: 14, label: 'Deception', advIf: [{ origin: 'charlatan' }, { cls: 'rogue' }, { cls: 'warlock' }] },
            success: { goto: 'patrol_escort', effects: { xp: 75, flags: { lied_to_goblins: true, goblin_escort: true }, chronicle: 'lied to the goblins about being summoned by their chief', remember: true, note: 'Goblins are not smart. But they have very, very long memories for a lie.' } },
            fail: { goto: 'patrol_spotted', effects: { flags: { caught_lying: true } } } }
        ]
      },

      patrol_escort: {
        title: 'An Unlikely Welcome',
        art: 'bakery',
        text: [
          `The three of them confer in a huddle of clicks and hisses. Then the rolling-pin one gestures with its whole arm — an enormous, formal, deeply silly bow — and points around the back.`,
          `"Come. Not front. Front is stuck." It considers. "Also chief say front doors is for guests and we never have guests so." A shrug. "Dock."`,
          `You are being escorted into a goblin-held building by goblins. Tyndareus would be thrilled.`
        ],
        choices: [{ text: 'Follow them in.', goto: 'dock', effects: { flags: { knows_loading_dock: true } } }]
      },

      patrol_fight: {
        title: 'Three in the Yard',
        art: 'bakery',
        text: [`You move first. They are not ready.`],
        choices: [
          { text: 'End it quickly and quietly.',
            check: { stat: 'DEX', skill: 'stealth', dc: 14, label: 'Silent Kill', advIf: [{ cls: 'rogue' }, { cls: 'monk' }] },
            success: { goto: 'patrol_fight_quiet', effects: { xp: 75, flags: { killed_patrol: true, has_blood_debt: true }, chronicle: 'killed three goblins in the yard without a sound', remember: true } },
            fail: { goto: 'patrol_fight_loud', effects: { damage: '1d6', flags: { killed_patrol: true, bakery_alerted: true, has_blood_debt: true }, chronicle: 'killed three goblins in the yard — and the whole bakery heard it', remember: true } } },
          { text: 'Beat them down without killing.',
            check: { stat: 'STR', skill: 'athletics', dc: 14, label: 'Athletics' },
            success: { goto: 'patrol_fight_spare', effects: { xp: 75, flags: { beat_patrol: true }, bond: { goblins: -1 }, chronicle: 'knocked out a goblin patrol but left them breathing', remember: true } },
            fail: { goto: 'patrol_fight_loud', effects: { damage: '1d6', flags: { bakery_alerted: true }, chronicle: 'started a brawl in the yard that woke the whole bakery', remember: true } } }
        ]
      },

      patrol_fight_quiet: { title: 'Quiet Work', art: 'bakery',
        text: [`It is over in seconds, and the loudest sound is a rolling pin hitting the grass.`, `You drag them behind the water butt. The bakery does not stir.`, `You notice, because you cannot help noticing, that one of them had flour on its hands.`],
        choices: [{ text: 'Find the back way in.', goto: 'dock', effects: { flags: { knows_loading_dock: true } } }] },

      patrol_fight_spare: { title: 'Down but Breathing', art: 'bakery',
        text: [`Three goblins lie groaning in the grass, disarmed and thoroughly discouraged. One gives you a look of such profound betrayal that you feel it somewhere under the ribs.`, `They will wake up. They will remember.`],
        choices: [{ text: 'Find the back way in.', goto: 'dock', effects: { flags: { knows_loading_dock: true } } }] },

      patrol_fight_loud: { title: 'Loud Work', art: 'bakery',
        onEnter: { flags: { bakery_alerted: true } },
        text: [`It goes badly, and it goes loudly. By the time the yard is still, every goblin in that building knows something is outside.`, `Doors slam. Something heavy is dragged across a floor.`],
        choices: [{ text: 'Go in anyway.', goto: 'dock', effects: { flags: { knows_loading_dock: true, rushed_in: true } } }] },

      /* ---------- Waste pile & front doors ---------- */

      waste: {
        title: 'The Waste Pile',
        art: 'waste',
        text: [
          `What was once an orderly row of compost and waste bins has long since heaped into a single reeking mountain. It is furred over with fungus and decomposers thriving on eleven years of easy living.`,
          `The smell arrives before you do, and lingers after you leave.`,
          `Something in the mound is a slightly wrong shade of purple. And you are fairly sure it just moved a few inches closer.`
        ],
        choices: [
          { text: 'Back away. Immediately. Nope.',
            goto: 'arrival_hub', effects: { note: 'Correct answer. The violet fungus oozes back into the heap, disappointed.' } },
          { text: 'Search the pile anyway — people throw away useful things.',
            check: { stat: 'WIS', skill: 'perception', dc: 13, label: 'Perception', disIf: [{ race: 'elf' }] },
            success: { goto: 'waste_find', effects: { xp: 50 } },
            fail: { goto: 'waste_fungus', effects: {} } },
          { text: '(Nature) Identify the purple thing before touching anything.', req: { prof: 'nature' },
            goto: 'waste_identified', effects: { xp: 50, flags: { knows_fungus: true } } }
        ]
      },

      waste_identified: {
        title: 'Violet Fungus',
        art: 'waste',
        text: [
          `Violet fungus. Four stalks, root-like feelers, and a touch that rots flesh on contact. Blind beyond thirty feet, slow as a bad idea, and absolutely lethal if you let it get its stalks on you.`,
          `It is also, crucially, slower than you. Everything about this encounter is optional.`
        ],
        choices: [
          { text: 'Lure it out and rob the pile behind it.',
            check: { stat: 'DEX', skill: 'acrobatics', dc: 12, label: 'Acrobatics' },
            success: { goto: 'waste_find', effects: { xp: 75, flags: { outwitted_fungus: true } } },
            fail: { goto: 'waste_fungus', effects: {} } },
          { text: 'Leave it. It is a mushroom minding its own business.', goto: 'arrival_hub', effects: { note: 'You leave the fungus to its rot. It does not thank you, being a fungus.' } }
        ]
      },

      waste_find: {
        title: 'One Good Thing',
        art: 'waste',
        text: [
          `Under a sheet of rotted canvas, in a crate that never made it inside, you find a bundle wrapped in oilcloth — dry, sealed, and forgotten.`,
          `Inside: four small bags of spices, still fiercely fragrant after all these years. Cinnamon. Nutmeg. Ginger. Cloves.`,
          `Somebody dropped a delivery eleven years ago and never came back for it.`
        ],
        choices: [{ text: 'Take them.', goto: 'arrival_hub', effects: { give: 'exotic_spices', xp: 50, flags: { has_spices: true } } }]
      },

      waste_fungus: {
        title: 'Rotting Touch',
        art: 'waste',
        text: [
          `Your hand closes on something that is not canvas, and the pile erupts. A violet fungus heaves itself upright, four stalks lashing.`,
          `One catches your forearm and the pain is instant and wrong — not a cut, but a spoiling.`
        ],
        choices: [
          { text: 'Get clear. Nothing in there is worth this.',
            goto: 'arrival_hub', effects: { damage: '1d8', note: 'You tear free and stumble back out of reach. The fungus settles, patient, to wait for someone stupider.' } },
          { text: 'Destroy it.',
            check: { stat: 'STR', skill: 'athletics', dc: 12, label: 'Athletics' },
            success: { goto: 'waste_find', effects: { xp: 75, damage: '1d8', flags: { killed_fungus: true } } },
            fail: { goto: 'arrival_hub', effects: { damage: '2d8', note: 'It gets you twice more before you break away. You are going to feel this all day.' } } }
        ]
      },

      front_doors: {
        title: 'The Front Doors',
        art: 'bakery',
        text: (S) => [
          `A great set of wooden double doors, weathered silver-grey. A faded sign above reads, in curling letters: GRAMMY'S — FRESH DAILY.`,
          `They are barred from the inside. The wood, though, has had eleven wet winters to think about its choices, and it is rotting.`,
          S.flags.knows_loading_dock ? `(The dryads were clear: everyone hears the front doors.)` : ``
        ],
        choices: [
          { text: 'Force them. Shoulder first.',
            check: { stat: 'STR', skill: 'athletics', dc: 14, label: 'Strength', advIf: [{ cls: 'barbarian' }, { cls: 'fighter' }, { race: 'half_orc' }] },
            success: { goto: 'shop', effects: { xp: 50, flags: { bakery_alerted: true, forced_front: true }, chronicle: 'kicked in the front doors of the bakery', remember: true, note: 'The bar snaps. The doors boom open. Somewhere deep inside the building, something drops a pan.' } },
            fail: { goto: 'front_fail', effects: { damage: '1d4', flags: { bakery_alerted: true } } } },
          { text: 'Work the rotten wood away quietly and lift the bar.',
            check: { stat: 'DEX', skill: 'sleight_of_hand', dc: 15, label: 'Sleight of Hand', advIf: [{ item: 'thieves_tools' }, { cls: 'rogue' }] },
            success: { goto: 'shop', effects: { xp: 75, flags: { quiet_front: true }, chronicle: 'opened the barred front doors without making a sound', remember: true } },
            fail: { goto: 'front_fail', effects: { flags: { bakery_alerted: true } } } },
          { text: 'Try somewhere else instead.', goto: 'orchard_hub', effects: {} }
        ]
      },

      front_fail: {
        title: 'Loud and Stuck',
        art: 'bakery',
        onEnter: { flags: { bakery_alerted: true } },
        text: [
          `The doors shudder, boom, and hold. The noise rolls through the whole building like a drum.`,
          `Through the gap you can hear it: shouting. Small feet. Something being dragged into place.`,
          `The front is not happening quietly now.`
        ],
        choices: [
          { text: 'Put your back into it and finish the job.',
            check: { stat: 'STR', skill: 'athletics', dc: 12, label: 'Strength' },
            success: { goto: 'shop', effects: { xp: 50, flags: { forced_front: true } } },
            fail: { goto: 'orchard_hub', effects: { damage: '1d4', note: 'The doors win. Your shoulder loses. Try the back.' } } },
          { text: 'Give up on the front and go around the back.', goto: 'orchard_hub', effects: {} }
        ]
      },

      /* ══════════════ ACT IV — INSIDE ══════════════ */

      dock: {
        title: 'The Loading Dock',
        art: 'dock',
        onEnter: { flags: { act: 4, inside: true } },
        text: (S) => [
          `The sliding door runs on rollers thick with eleven years of grease and grit. It opens with a long, low grumble that you feel in your teeth.`,
          `Inside: bare stone floor, plain walls, and an empty wagon standing exactly where someone parked it before everything went wrong. Shipping pallets are still stacked, still waiting to be loaded.`,
          S.flags.goblin_escort
            ? `Your escort trots in ahead of you, entirely unbothered, and shouts something cheerful into the dark.`
            : `And through the inner doorway, walking past without a glance — two goblins on patrol, deep in an argument about something.`
        ],
        choices: [
          { text: 'Freeze. Let them pass.', if: (S) => !S.flags.goblin_escort,
            check: { stat: 'DEX', skill: 'stealth', dc: 13, label: 'Stealth', advIf: [{ cls: 'rogue' }, { race: 'halfling' }, { origin: 'urchin' }], disIf: [{ flag: 'bakery_alerted' }] },
            success: { goto: 'dock_clear', effects: { xp: 75 } },
            fail: { goto: 'dock_sniffed', effects: {} } },
          { text: 'Slip behind the wagon and wait for a better moment.', if: (S) => !S.flags.goblin_escort,
            check: { stat: 'WIS', skill: 'survival', dc: 12, label: 'Patience' },
            success: { goto: 'dock_clear', effects: { xp: 50 } },
            fail: { goto: 'dock_sniffed', effects: {} } },
          { text: 'Follow your escort in.', if: (S) => !!S.flags.goblin_escort, goto: 'bakery_floor', effects: {} },
          { text: 'Step out and hail them.', if: (S) => !S.flags.goblin_escort, goto: 'dock_sniffed', effects: { flags: { hailed_dock: true } } }
        ]
      },

      dock_clear: {
        title: 'Inside, Unseen',
        art: 'dock',
        text: [
          `You go still in the wagon's shadow and let the building move around you. The two goblins pass close enough that you can hear one of them insisting, with real passion, that the problem is the oven and not the recipe.`,
          `Then they are gone, and the loading dock is yours.`,
          `Three ways on from here: a door to the shop and offices at the front, the great open bakery floor, and a narrow stair going up.`
        ],
        choices: [
          { text: 'The front rooms — shop and offices.', goto: 'shop', effects: {} },
          { text: 'The bakery floor.', goto: 'bakery_floor', effects: {} },
          { text: 'Straight up the stairs.', goto: 'apartment_door', effects: {} }
        ]
      },

      dock_sniffed: {
        title: '"I Smell Something Funny"',
        art: 'dock',
        text: [
          `One of the goblins stops mid-argument. Its nose goes up. It sniffs — once, twice — and turns very slowly toward the wagon.`,
          `"...Is not apples," it says.`,
          `Both of them are looking straight at you now.`
        ],
        choices: [
          { text: 'Stand up. Hands open. "I\'m not here to hurt anyone."',
            check: { stat: 'CHA', skill: 'persuasion', dc: 13, label: 'Persuasion', advIf: [{ flag: 'goblins_met_peacefully' }, { flag: 'apple_secret' }], disIf: [{ flag: 'killed_patrol' }, { flag: 'killed_road_patrol' }] },
            success: { goto: 'dock_parley', effects: { xp: 75, bond: { goblins: 2 } } },
            fail: { goto: 'dock_alarm', effects: {} } },
          { text: 'Show them the apple.', req: { item: 'apple_of_mac' },
            goto: 'dock_parley', effects: { xp: 50, bond: { goblins: 2 } } },
          { text: 'Take them down before they shout.',
            check: { stat: 'DEX', skill: 'stealth', dc: 14, label: 'Ambush' },
            success: { goto: 'dock_clear', effects: { xp: 75, flags: { killed_dock_pair: true, has_blood_debt: true }, bond: { goblins: -3 }, chronicle: 'silenced two goblins on the loading dock', remember: true } },
            fail: { goto: 'dock_alarm', effects: { damage: '1d6' } } },
          { text: 'Run for the stairs.',
            check: { stat: 'DEX', skill: 'acrobatics', dc: 12, label: 'Acrobatics' },
            success: { goto: 'apartment_door', effects: { xp: 50, flags: { bakery_alerted: true } } },
            fail: { goto: 'dock_alarm', effects: {} } }
        ]
      },

      dock_parley: {
        title: 'Not Apples, But Not Trouble',
        art: 'dock',
        text: [
          `The goblins look at each other. There is a long, wary pause.`,
          `"You want what," says the taller one flatly.`,
          `"A recipe," you say.`,
          `It stares at you. "A recipe." It turns to its friend. "It wants a recipe." The friend makes a noise of complete disbelief. "Everybody want the recipe! WE want the recipe! Eleven years we want the recipe!"`,
          `Something has shifted. You are no longer an intruder. You are, apparently, a colleague.`
        ],
        choices: [
          { text: '"Then let\'s find it together."',
            goto: 'bakery_floor', effects: { bond: { goblins: 3 }, flags: { goblin_alliance: true }, xp: 100, chronicle: 'made common cause with the goblins over the lost recipe', remember: true } },
          { text: '"Where does your chief sleep? The old woman\'s rooms?"',
            check: { stat: 'CHA', skill: 'insight', dc: 12, label: 'Insight' },
            success: { goto: 'dock_clear', effects: { xp: 50, flags: { knows_chief_upstairs: true }, bond: { goblins: 1 } } },
            fail: { goto: 'dock_clear', effects: { note: 'They clam up. Chief business is chief business.' } } }
        ]
      },

      dock_alarm: {
        title: 'The Building Wakes',
        art: 'dock',
        onEnter: { flags: { bakery_alerted: true } },
        text: [
          `The shriek goes up and is answered from three directions at once. Feet drum on floorboards above you. Somewhere a bell — an actual bell, salvaged from who knows where — starts clanging.`,
          `Eleven years of quiet, ended by you.`
        ],
        choices: [
          { text: 'Move fast. The front offices, before they organize.', goto: 'shop', effects: { flags: { rushed_in: true } } },
          { text: 'Go up. Get to the apartment first.', goto: 'apartment_door', effects: { flags: { rushed_in: true } } },
          { text: 'Stand your ground on the bakery floor and face them.', goto: 'bakery_floor', effects: { flags: { stood_ground: true } } }
        ]
      },

      /* ---------- The shop ---------- */

      shop: {
        title: 'The Shop',
        art: 'shop',
        onEnter: { flags: { inside: true } },
        text: [
          `The front of the house. A small room where the famous pies were sold over a counter, with shelves on every wall.`,
          `The shelves have been thoroughly ransacked — paper boxes, bits of ribbon and twine litter the floor like a party that ended badly a decade ago. Two small tables lie overturned in the middle of the room.`,
          `There is a door on either side, plus the great double doors to the outside. And everywhere, unmistakable: the signs of goblin habitation.`
        ],
        choices: [
          { text: 'Search the counter.',
            check: { stat: 'WIS', skill: 'perception', dc: 12, label: 'Perception' },
            success: { goto: 'shop_cashbox', effects: { xp: 50 } },
            fail: { goto: 'shop_hub', effects: { note: 'Boxes, ribbon, twine, and dust. Nothing that will help.' } } },
          { text: 'Read the room — how many live here, and where do they go?',
            check: { stat: 'WIS', skill: 'survival', dc: 12, label: 'Survival', advIf: [{ cls: 'ranger' }, { origin: 'outlander' }, { origin: 'soldier' }] },
            success: { goto: 'shop_tracks', effects: { xp: 50, flags: { knows_goblin_count: true } } },
            fail: { goto: 'shop_hub', effects: {} } },
          { text: 'Get on with it.', goto: 'shop_hub', effects: {} }
        ]
      },

      shop_tracks: {
        title: 'Reading the Floor',
        art: 'shop',
        text: [
          `Dust tells the truth. You crouch and read it.`,
          `Eight or nine sets of tracks, small and bare-footed. Most traffic goes two ways: out to the loading dock, and up the narrow stairs at the back. The heaviest, deepest set — a bigger creature, wearing actual boots — goes almost exclusively upstairs.`,
          `The chief lives up there. In her rooms.`
        ],
        choices: [{ text: 'Useful.', goto: 'shop_hub', effects: { flags: { knows_chief_upstairs: true } } }]
      },

      shop_cashbox: {
        title: 'The Cashbox',
        art: 'shop',
        text: [`Behind the counter, on a low shelf that has been overlooked for eleven years because goblins do not care about money, sits a small iron cashbox. Locked.`],
        choices: [
          { text: 'Pick the lock.',
            check: { stat: 'DEX', skill: 'sleight_of_hand', dc: 14, label: 'Sleight of Hand', advIf: [{ item: 'thieves_tools' }] },
            success: { goto: 'shop_hub', effects: { xp: 50, gold: 10, give: 'cashbox_coin', note: 'It opens with a click like a satisfied sigh. Inside: 8 gold, 11 silver, 21 copper.' } },
            fail: { goto: 'shop_cashbox_stuck', effects: {} } },
          { text: 'Smash it open.',
            check: { stat: 'STR', skill: 'athletics', dc: 16, label: 'Strength' },
            success: { goto: 'shop_hub', effects: { xp: 50, gold: 10, give: 'cashbox_coin', flags: { made_noise: true }, note: 'The lid gives with a bang that echoes through the whole front of the building.' } },
            fail: { goto: 'shop_cashbox_stuck', effects: { flags: { made_noise: true } } } },
          { text: 'Leave it. You are not here for petty cash.', goto: 'shop_hub', effects: {} }
        ]
      },

      shop_cashbox_stuck: { title: 'It Holds', art: 'shop',
        text: [`Eleven years of rust have fused the mechanism into a single sullen lump. The box wins.`],
        choices: [{ text: 'Leave it.', goto: 'shop_hub', effects: {} }] },

      shop_hub: {
        title: 'Front of House',
        art: 'shop',
        text: (S) => [
          `Doors on either side of the shop: one into the office, one into a smaller room that smells of old sweat and older leather.`,
          S.flags.knows_recipe_halves ? `Half the recipe is in the office. You know that much for certain.` : `The recipe is somewhere. You will have to search.`
        ],
        choices: [
          { text: 'The office.', goto: 'office', effects: {} },
          { text: 'The guard room.', goto: 'guardroom', effects: {} },
          { text: 'On to the bakery floor.', goto: 'bakery_floor', effects: {} },
          { text: 'Up the narrow stairs.', goto: 'apartment_door', effects: {} }
        ]
      },

      /* ---------- The office ---------- */

      office: {
        title: 'The Office',
        art: 'office',
        text: [
          `This is the nicest room in the building by a wide margin: sturdy mahogany furniture, heavy velvet curtains, two paper-strewn desks with their chairs overturned. Bookshelves and filing cabinets line the walls.`,
          `Notably, the goblin smell is much fainter here. They do not come in. There is nothing in here they want — the goblins cannot read, and there is plenty of kindling outside.`,
          `Eleven years of business records sit undisturbed. Grammy was, by the look of these ledgers, doing extremely well.`
        ],
        choices: [
          { text: 'Search the bookshelves.',
            check: { stat: 'WIS', skill: 'perception', dc: 13, label: 'Perception', advIf: [{ race: 'elf' }, { origin: 'sage' }] },
            success: { goto: 'office_safe', effects: { xp: 50, flags: { found_safe: true } } },
            fail: { goto: 'office_desks', effects: { note: 'Ledgers, inventories, and the dullest correspondence ever written. Nothing hidden that you can see.' } } },
          { text: 'Go through the desks.', goto: 'office_desks', effects: {} },
          { text: 'Take the velvet curtains — they are worth good coin.',
            goto: 'office', effects: { give: 'velvet_curtains', flags: { took_curtains: true }, note: 'Heavy, dusty, and genuinely valuable. Carrying them around is going to be its own adventure.' },
            if: (S) => !S.flags.took_curtains },
          { text: 'Leave the office.', goto: 'shop_hub', effects: {} }
        ]
      },

      office_desks: {
        title: 'The Desks',
        art: 'office',
        text: [
          `Two desks, both buried in paper. Blank sheets, quills gone to fluff, ink dried to tar. In a cup: one silver signet ring, stamped with a lattice pattern.`,
          `Most of the drawers slide open easily.`,
          `One does not. One has a keyhole, and sits a fraction prouder in its frame than the others.`
        ],
        choices: [
          { text: 'Pocket the signet ring.', if: (S) => !S.flags.took_signet,
            goto: 'office_desks', effects: { give: 'silver_signet', flags: { took_signet: true }, xp: 25 } },
          { text: 'Examine the stubborn drawer before touching it.',
            check: { stat: 'WIS', skill: 'perception', dc: 13, label: 'Perception', advIf: [{ origin: 'criminal' }, { cls: 'rogue' }, { item: 'thieves_tools' }] },
            success: { goto: 'office_trap_found', effects: { xp: 50, flags: { spotted_trap: true } } },
            fail: { goto: 'office_drawer_open', effects: { flags: { trap_armed: true } } } },
          { text: 'Just open it.', goto: 'office_drawer_open', effects: { flags: { trap_armed: true } } },
          { text: 'Step back and look at the room again.', goto: 'office', effects: {} }
        ]
      },

      office_trap_found: {
        title: 'A Needle in the Dark',
        art: 'office',
        text: [
          `You crouch until your eye is level with the drawer front, and there it is: a hair-thin gap where the wood was fitted after the desk was built, and inside it the dull gleam of a brass mechanism.`,
          `A spring-loaded poison needle. Grammy, it seems, protected this drawer specifically.`,
          `Which tells you something wonderful about what is inside it.`
        ],
        choices: [
          { text: 'Disarm it.',
            check: { stat: 'DEX', skill: 'sleight_of_hand', dc: 16, label: 'Dexterity', advIf: [{ item: 'thieves_tools' }, { cls: 'rogue' }] },
            success: { goto: 'office_recipe', effects: { xp: 100, flags: { disarmed_trap: true }, chronicle: 'disarmed the poison needle in Grammy\'s desk', remember: true } },
            fail: { goto: 'office_trap_sprung', effects: {} } },
          { text: 'Pry the whole drawer front off from the side instead.',
            check: { stat: 'STR', skill: 'athletics', dc: 14, label: 'Strength' },
            success: { goto: 'office_recipe', effects: { xp: 75, flags: { made_noise: true }, note: 'The needle fires harmlessly into the air as the drawer front comes away in your hands.' } },
            fail: { goto: 'office_trap_sprung', effects: {} } },
          { text: 'Trigger it deliberately with something that is not your hand.',
            check: { stat: 'INT', skill: 'investigation', dc: 12, label: 'Investigation' },
            success: { goto: 'office_recipe', effects: { xp: 75, note: 'You jam a quill into the mechanism and let it fire into the wood. Clean. Professional. Nobody bleeds.' } },
            fail: { goto: 'office_trap_sprung', effects: {} } }
        ]
      },

      office_drawer_open: {
        title: 'Click',
        art: 'office',
        text: [`You pull the drawer. There is a small, mechanical click, exactly the sort of sound a person hopes not to hear.`],
        choices: [
          { text: '...',
            check: { stat: 'DEX', dc: 13, label: 'Reflexes', advIf: [{ cls: 'monk' }, { cls: 'rogue' }] },
            success: { goto: 'office_recipe', effects: { xp: 50, note: 'You snatch your hand back and the needle snaps through the air where it was. Close.' } },
            fail: { goto: 'office_trap_sprung', effects: {} } }
        ]
      },

      office_trap_sprung: {
        title: 'Poison Needle',
        art: 'office',
        text: [
          `The needle punches into the meat of your thumb — a small, bright, insulting pain — and something cold goes up your arm immediately after.`
        ],
        onEnter: {
          damage: '1', note: 'The needle draws blood.',
          save: { stat: 'CON', dc: 15, label: 'Constitution Save', poison: true,
            failEffects: { damage: '1d10', poisoned: 3 },
            onFailText: 'The poison takes hold. Your vision swims and your hands will not stop shaking. (Poisoned — disadvantage on checks for a while.)',
            onSuccessText: 'Your body burns it out with nothing worse than a cold sweat and a bad few seconds.' }
        },
        choices: [
          { text: 'Open the drawer. It had better be worth it.', goto: 'office_recipe', effects: {} }
        ]
      },

      office_recipe: {
        title: 'Half a Secret',
        art: 'office',
        onEnter: { flags: { has_office_half: true } },
        text: [
          `Inside the drawer, alone on the bare wood, lies a piece of parchment that has been torn cleanly in half down its length.`,
          `The handwriting is round, careful, and unmistakably fond. You can read the left-hand column: six apples of three different kinds, cold butter worked in with the fingertips and never the palms, and a list of spices that runs off the torn edge mid-word.`,
          `Half of it. Exactly half.`,
          `At the bottom of the fragment, in a different ink, a note to herself: "The other half where I sleep. Never both together. — G."`
        ],
        choices: [
          { text: 'Take it and head upstairs.',
            goto: 'shop_hub', effects: { give: 'recipe_half_office', xp: 100, flags: { knows_recipe_halves: true }, chronicle: 'found the first half of Grammy\'s recipe in the office desk', remember: true } }
        ]
      },

      office_safe: {
        title: 'The Safe',
        art: 'office',
        text: [
          `Behind the third bookshelf, where the wall should be, there is instead a squat iron safe set flush into the stonework.`,
          `It is a good safe. It was expensive. The bakery, clearly, was doing very well indeed.`
        ],
        choices: [
          { text: 'Pick the lock.',
            check: { stat: 'DEX', skill: 'sleight_of_hand', dc: 15, label: 'Sleight of Hand', advIf: [{ item: 'thieves_tools' }, { cls: 'rogue' }] },
            success: { goto: 'office_safe_open', effects: { xp: 100 } },
            fail: { goto: 'office_desks', effects: { note: 'The tumblers will not fall. Whoever built this safe was better at their job than you are at yours, today.' } } },
          { text: 'Pry it open by force.',
            check: { stat: 'STR', skill: 'athletics', dc: 17, label: 'Strength', advIf: [{ cls: 'barbarian' }, { race: 'half_orc' }] },
            success: { goto: 'office_safe_open', effects: { xp: 100, flags: { made_noise: true } } },
            fail: { goto: 'office_desks', effects: { damage: '1d4', flags: { made_noise: true }, note: 'The safe does not move. Your fingers, briefly and painfully, do.' } } },
          { text: 'Leave it and search the desks.', goto: 'office_desks', effects: {} }
        ]
      },

      office_safe_open: {
        title: "The Bakery's Savings",
        art: 'office',
        text: [
          `The door swings open on a lifetime of careful takings: 75 gold, 50 silver, 25 copper, stacked in neat paper rolls, each labelled in that same round handwriting.`,
          `One roll is labelled, in slightly shakier letters: "FOR THE ROOF — DO IT THIS SPRING."`,
          `She never got to.`
        ],
        choices: [
          { text: 'Take it all.', goto: 'office_desks', effects: { gold: 80, xp: 50, flags: { took_savings: true }, chronicle: 'emptied Grammy\'s safe', remember: true } },
          { text: 'Take what you need. Leave the roof money.',
            goto: 'office_desks', effects: { gold: 55, xp: 75, flags: { left_roof_money: true }, chronicle: 'left the roof money in Grammy\'s safe, untouched', remember: true, note: 'You put the roof roll back and close the door on it. You could not say exactly why, except that it felt like the right thing.' } }
        ]
      },

      /* ---------- Guard room ---------- */

      guardroom: {
        title: 'The Guard Room',
        art: 'guardroom',
        text: [
          `A small, plain room that smells of old leather. Grammy kept two or three young men from the nearby town on the payroll as guards — mostly, by all accounts, to keep them out of trouble.`,
          `Three quarterstaffs have fallen from where they leaned against the wall. A table and two chairs lie overturned. Opposite the staffs sits a locked chest.`,
          `Someone scratched a tally into the tabletop, counting down to something. It stops at four.`
        ],
        choices: [
          { text: 'Open the chest.', goto: 'guard_chest', effects: {} },
          { text: 'Take a quarterstaff.',
            goto: 'guardroom', if: (S) => !S.flags.took_staff,
            effects: { flags: { took_staff: true }, note: 'The wood has not been preserved. It will serve — but it will not serve long.' } },
          { text: 'Leave.', goto: 'shop_hub', effects: {} }
        ]
      },

      guard_chest: {
        title: 'The Locked Chest',
        art: 'guardroom',
        text: [`Iron-bound, waist-high, and locked. Eleven years of damp have not been kind to the hinges.`],
        choices: [
          { text: 'Pick the lock.',
            check: { stat: 'DEX', skill: 'sleight_of_hand', dc: 15, label: 'Sleight of Hand', advIf: [{ item: 'thieves_tools' }, { cls: 'rogue' }] },
            success: { goto: 'guard_chest_open', effects: { xp: 75 } },
            fail: { goto: 'guardroom', effects: { note: 'The lock holds. Rust has opinions.' } } },
          { text: 'Smash the lock off.',
            check: { stat: 'STR', skill: 'athletics', dc: 17, label: 'Strength', advIf: [{ cls: 'barbarian' }, { race: 'half_orc' }] },
            success: { goto: 'guard_chest_open', effects: { xp: 75, flags: { made_noise: true } } },
            fail: { goto: 'guardroom', effects: { damage: '1d4', flags: { made_noise: true } } } },
          { text: 'Leave it.', goto: 'guardroom', effects: {} }
        ]
      },

      guard_chest_open: {
        title: 'Shillelagh Oil',
        art: 'guardroom',
        text: [
          `Inside, packed in straw: three small bottles of thick green oil that moves slower than it should.`,
          `Shillelagh oil. Rub it on a club or a quarterstaff and the wood remembers, briefly and furiously, that it used to be a tree.`,
          `Grammy armed her guards with druidcraft. Of course she did.`
        ],
        choices: [
          { text: 'Take all three.', goto: 'shop_hub', effects: { give: { id: 'shillelagh_oil', qty: 3 }, xp: 50 } }
        ]
      },

      /* ---------- Bakery floor ---------- */

      bakery_floor: {
        title: 'The Bakery Floor',
        art: 'floor',
        onEnter: { flags: { inside: true, saw_floor: true } },
        text: (S) => [
          `The heart of the building: a wide open space with high ceilings and exposed wooden beams, where every sound goes up and comes back changed.`,
          `Six long work benches fill the center, covered with pie tins, rolling pins, and baking equipment. Some of the rolling pins are still rolling — slowly, lazily, back and forth — kept going by an enchantment that has outlived everyone who cast it. Dulled knives chop rhythmically at apples that have not been there in eleven years.`,
          `Against one wall stand six massive ovens, their doors still swinging open at intervals, as if remembering they are supposed to. Two stone rooms with heavy barred doors stand to one side, and between them a small glass cabinet with a tiny mallet hanging on a chain.`,
          `And it is a mess. Not a baker's mess. Flour everywhere, burnt trays, collapsed lumps in pie tins. Someone has been trying — really, genuinely trying — to teach themselves to bake, and failing for a very long time.`,
          S.flags.goblin_alliance || S.flags.goblin_escort ? `Your escort gestures around at the disaster with something that might be embarrassment.` : ``
        ],
        choices: [
          { text: 'Examine the failed baking attempts.', goto: 'floor_attempts', effects: {} },
          { text: 'The glass cabinet with the little mallet.', goto: 'floor_cabinet', effects: {} },
          { text: 'The stone cold-rooms.', goto: 'floor_coldroom', effects: {} },
          { text: 'The ovens.', goto: 'floor_ovens', effects: {} },
          { text: 'Take the magical rolling pins and knives.',
            goto: 'floor_disturb', effects: { flags: { disturbed_magic: true } } },
          { text: 'Head for the stairs.', goto: 'apartment_door', effects: {} }
        ]
      },

      floor_attempts: {
        title: 'Eleven Years of Trying',
        art: 'floor',
        text: [
          `You look closer, and the story assembles itself.`,
          `Dozens of attempts. Scores. The earliest are barely recognizable as food — charcoal, raw dough, one tin containing what appears to be an entire unpeeled apple and nothing else.`,
          `But they get better. Slowly, clumsily, across years, they get better. Someone worked out that the apples need slicing. Someone worked out butter. The most recent attempt, sitting on the end bench under a cloth, is almost — almost — a pie.`,
          `Scratched into the bench beside it, over and over in crude letters, someone has been practising a word: GRAMY. GRAMMY. GRAMY.`,
          `They are not squatting here. They are trying to learn from a dead woman who never got to teach them.`
        ],
        choices: [
          { text: 'Sit with that for a moment.',
            goto: 'bakery_floor', effects: { flags: { understands_goblins: true }, xp: 50, remember: true, chronicle: 'understood what the goblins were really doing in that bakery' } },
          { text: 'It changes nothing. Keep moving.', goto: 'bakery_floor', effects: { flags: { hardened: true } } }
        ]
      },

      floor_cabinet: {
        title: 'Break Glass',
        art: 'floor',
        text: [
          `A small glass cabinet mounted between the two cold-rooms, with a tiny mallet hanging beside it on a chain.`,
          `Inside: two red potions in stoppered bottles. A faded card reads, in that round handwriting: "FOR BURNS, CUTS, AND DAFT BOYS."`
        ],
        choices: [
          { text: 'Use the mallet. Take both potions.',
            goto: 'bakery_floor', effects: { give: { id: 'healing_potion', qty: 2 }, xp: 50, flags: { made_noise: true, took_potions: true }, note: 'The glass breaks with a bright, carrying crack.' } },
          { text: 'Open it carefully instead, without the noise.',
            check: { stat: 'DEX', skill: 'sleight_of_hand', dc: 13, label: 'Sleight of Hand' },
            success: { goto: 'bakery_floor', effects: { give: { id: 'healing_potion', qty: 2 }, xp: 75, flags: { took_potions: true } } },
            fail: { goto: 'bakery_floor', effects: { give: { id: 'healing_potion', qty: 2 }, flags: { made_noise: true, took_potions: true }, note: 'The pane gives way with a crash. You have the potions. You also have everyone\'s attention.' } } },
          { text: 'Leave them. Someone here may need them more.',
            goto: 'bakery_floor', effects: { flags: { left_potions: true }, remember: true, chronicle: 'left the healing potions behind for whoever lives there now' } }
        ]
      },

      floor_coldroom: {
        title: 'The Cold Rooms',
        art: 'floor',
        text: [
          `Two stone chambers, one for ingredients and one for finished pies. Both are largely empty — but the moment you step through the doorway, the temperature drops hard.`,
          `The stone is carved with runes that are still, after eleven unattended years, holding a perfect chill.`
        ],
        choices: [
          { text: 'Search the corners properly.',
            check: { stat: 'WIS', skill: 'perception', dc: 15, label: 'Perception', advIf: [{ race: 'elf' }] },
            success: { goto: 'coldroom_spices', effects: { xp: 75 } },
            fail: { goto: 'bakery_floor', effects: { note: 'Empty shelves and cold stone. Whatever was in here is long gone.' } } },
          { text: 'Copy the runes — that is a spell worth having.',
            check: { stat: 'INT', skill: 'arcana', dc: 13, label: 'Arcana', advIf: [{ cls: 'wizard' }, { origin: 'sage' }, { cls: 'sorcerer' }, { cls: 'warlock' }] },
            success: { goto: 'coldroom_rune', effects: { xp: 100 } },
            fail: { goto: 'bakery_floor', effects: { note: 'The rune-work is subtle and layered, and you cannot hold the shape of it in your head. Not today.' } } },
          { text: 'Back to the floor.', goto: 'bakery_floor', effects: {} }
        ]
      },

      coldroom_spices: {
        title: 'Hidden in the Corner',
        art: 'floor',
        text: [
          `Tucked behind a loose stone at the back of the ingredient room, wrapped in waxed cloth against exactly this kind of long absence: four small bags.`,
          `Cinnamon. Nutmeg. Ginger. Cloves. Still fragrant, still perfect, kept flawless by eleven years of magical cold.`,
          `This is the good stuff. This is what that smell in the air used to be.`
        ],
        choices: [{ text: 'Take them.', goto: 'bakery_floor', effects: { give: 'exotic_spices', xp: 50, flags: { has_spices: true } } }]
      },

      coldroom_rune: {
        title: 'A Small, Perfect Spell',
        art: 'floor',
        text: [
          `You copy it down, line by line, and as you work you start grinning.`,
          `It is a second-level variation on Cone of Cold — beautifully, elegantly constructed — that has been deliberately weakened. It lowers temperature just enough to keep food fresh. Not one degree more. It could never hurt anybody.`,
          `Someone took a war spell and patiently, lovingly turned it into a refrigerator.`
        ],
        choices: [{ text: 'Pocket the copy.', goto: 'bakery_floor', effects: { give: 'chill_rune', xp: 50, flags: { copied_rune: true }, chronicle: 'copied Grammy\'s chill rune — a war spell turned into a refrigerator' } }]
      },

      floor_ovens: {
        title: 'The Ovens',
        art: 'floor',
        text: [
          `Six great ovens, chimneys rising through the ceiling. Their doors still open and close at intervals, unhurried, like something breathing in its sleep.`,
          `They are warm. Not hot — nowhere near hot enough to bake, as the half-raw disasters sitting on top of them prove — but warm.`,
          `That warmth is not enchantment. Something is living in them. You can see the glow of small eyes at the back of oven four, watching you without much concern.`
        ],
        choices: [
          { text: 'Leave them be. Everyone deserves a warm bed.',
            goto: 'bakery_floor', effects: { xp: 25, flags: { left_ovens: true }, note: 'The eyes blink slowly and withdraw. Whatever it is, it goes back to sleep.' } },
          { text: 'Get a proper look at what is in there.',
            check: { stat: 'INT', skill: 'arcana', dc: 12, label: 'Arcana', advIf: [{ cls: 'wizard' }, { cls: 'sorcerer' }, { origin: 'sage' }] },
            success: { goto: 'ovens_identified', effects: { xp: 50 } },
            fail: { goto: 'ovens_provoked', effects: {} } },
          { text: 'Reach in and see what happens.', goto: 'ovens_provoked', effects: {} }
        ]
      },

      ovens_identified: {
        title: 'Tenants',
        art: 'floor',
        text: [
          `Magmins. Three of them, small and cheerful and made of cooling rock, curled up in oven four like cats in a sunbeam.`,
          `They are not hostile. They are, in fact, deeply relaxed. They found a warm stone box a decade ago and have been congratulating themselves ever since.`,
          `One raises a small molten hand and waves.`
        ],
        choices: [
          { text: 'Wave back.',
            goto: 'bakery_floor', effects: { xp: 50, flags: { magmin_friends: true }, remember: true, chronicle: 'made friends with the magmins living in the ovens' } },
          { text: 'Ask if they could burn a little hotter, as a favor.',
            check: { stat: 'CHA', skill: 'persuasion', dc: 13, label: 'Persuasion' },
            success: { goto: 'bakery_floor', effects: { xp: 75, flags: { ovens_hot: true, magmin_friends: true }, chronicle: 'talked the oven-magmins into stoking the fires properly', note: 'They consider this the most exciting thing that has happened in eleven years. The ovens begin, slowly, to glow.' } },
            fail: { goto: 'bakery_floor', effects: { note: 'They look at you. They look at each other. They go back to sleep. The answer is no.' } } }
        ]
      },

      ovens_provoked: {
        title: 'Hot',
        art: 'floor',
        text: [
          `Something small and furious made of molten rock objects to being disturbed, and objects at speed.`,
          `You get your arm back, but not before the heat finds it.`
        ],
        onEnter: { damage: '1d6', fire: true },
        choices: [
          { text: 'Back off. Apologize, even.',
            goto: 'bakery_floor', effects: { note: 'It grumbles, glowing, and settles back into the oven. Honors even.' } }
        ]
      },

      floor_disturb: {
        title: 'Three from the Rafters',
        art: 'floor',
        onEnter: { flags: { goblins_confronted: true } },
        text: (S) => [
          `You get one hand on a rolling pin — and three goblins drop from the rafters in perfect, practised unison, landing in a ring around you.`,
          `They are not attacking. They are between you and the benches, arms spread, and the look on their faces is not rage.`,
          `It is panic. It is the face of someone watching a stranger pick up something precious.`,
          `"NO," says the biggest one, in Common. "Not those. Those is Grammy's."`,
          S.flags.understands_goblins ? `You know exactly what those benches mean to them now. You have seen the practice word scratched into the wood.` : ``
        ],
        choices: [
          { text: 'Put it down. Slowly. "You\'re right. I\'m sorry."',
            goto: 'goblin_parley', effects: { bond: { goblins: 3 }, xp: 75, flags: { apologized_goblins: true }, chronicle: 'put down what was not theirs and apologized to the goblins', remember: true } },
          { text: '"I\'m looking for her recipe. Do you want to find it or not?"',
            check: { stat: 'CHA', skill: 'persuasion', dc: 14, label: 'Persuasion', advIf: [{ flag: 'understands_goblins' }, { flag: 'goblins_met_peacefully' }], disIf: [{ flag: 'has_blood_debt' }] },
            success: { goto: 'goblin_parley', effects: { xp: 100, bond: { goblins: 3 }, flags: { goblin_alliance: true }, chronicle: 'offered the goblins a share in the recipe', remember: true } },
            fail: { goto: 'goblin_standoff', effects: {} } },
          { text: 'Threaten them. You outmatch three goblins.',
            check: { stat: 'CHA', skill: 'intimidation', dc: 14, label: 'Intimidation', advIf: [{ race: 'half_orc' }, { cls: 'barbarian' }] },
            success: { goto: 'goblin_cowed', effects: { xp: 75, bond: { goblins: -3 }, flags: { cowed_goblins: true }, chronicle: 'terrified the goblins into backing down on the bakery floor', remember: true } },
            fail: { goto: 'goblin_standoff', effects: {} } },
          { text: 'Lie: "The old woman sent me. I knew her."',
            check: { stat: 'CHA', skill: 'deception', dc: 14, label: 'Deception', advIf: [{ origin: 'charlatan' }] },
            success: { goto: 'goblin_duped', effects: { xp: 75, flags: { lied_about_grammy: true }, chronicle: 'told the goblins that Grammy had sent you', remember: true } },
            fail: { goto: 'goblin_standoff', effects: { flags: { caught_lying: true } } } },
          { text: 'Fight.', goto: 'goblin_fight', effects: { flags: { chose_violence: true } } }
        ]
      },

      goblin_parley: {
        title: 'Snaggle',
        art: 'floor',
        onEnter: { flags: { met_snaggle: true } },
        text: [
          `The big one lowers its arms. It is missing an ear and most of one eyebrow, and it is wearing — you notice now — an apron. An actual apron, cut down and re-stitched to fit, stained with eleven years of failure.`,
          `"Snaggle," it says, tapping its chest. "I is head baker." It says the title with such enormous, fragile dignity that you would not laugh for all the gold in Wildemount.`,
          `"We try. Every day we try. It never come out right." It looks at the collapsed thing under the cloth on the end bench. "We know she had a paper. We look everywhere. We cannot read it if we find it." A pause. "You can read?"`
        ],
        choices: [
          { text: '"I can read. Help me find it, and I\'ll read it to you."',
            goto: 'goblin_deal', effects: { bond: { goblins: 4 }, xp: 100, flags: { goblin_alliance: true, promised_to_read: true }, chronicle: 'promised the goblins you would read them Grammy\'s recipe', remember: true } },
          { text: '"I can read. I\'m taking it to the man who hired me."',
            goto: 'goblin_honest', effects: { bond: { goblins: 1 }, xp: 75, flags: { honest_with_goblins: true }, chronicle: 'told the goblins the truth: the recipe was leaving with you', remember: true } },
          { text: '"Why do you care so much about one old woman\'s pie?"',
            goto: 'goblin_story', effects: { xp: 50 } }
        ]
      },

      goblin_story: {
        title: 'Why They Stayed',
        art: 'floor',
        text: [
          `Snaggle is quiet for a moment. Then it points at the ovens.`,
          `"We come here starving. Winter. Dead things everywhere — we kill them, all of them, took four days." It shrugs, as if clearing out a horde of undead were a chore like any other. "Then we find kitchen. Cold. Empty. But the smell still in the walls."`,
          `"One of us, old one, she remember. Before. She say she smell that smell from the road when she was small and she never forget it. She say the human woman used to leave the burnt ones out the back." Snaggle looks at the floor. "For us. She knew we take them. She leave them anyway."`,
          `"Old one died two winters back. We still trying to make the smell come back."`
        ],
        choices: [
          { text: '"Then let\'s make it come back. Together."',
            goto: 'goblin_deal', effects: { bond: { goblins: 4 }, xp: 100, flags: { goblin_alliance: true, promised_to_read: true, knows_full_story: true }, chronicle: 'learned why the goblins stayed — and promised to bring the smell back', remember: true } },
          { text: 'Say nothing. Some stories do not need an answer.',
            goto: 'goblin_deal', effects: { bond: { goblins: 2 }, flags: { goblin_alliance: true, knows_full_story: true } } }
        ]
      },

      goblin_deal: {
        title: 'An Alliance',
        art: 'floor',
        text: [
          `Snaggle spits in its palm and holds it out. You have a decision to make about hygiene, and you make the right one.`,
          `"Chief upstairs," it says. "In her rooms. Chief say the rooms is chief's and nobody go in." A meaningful pause. "Chief is not good chief. Chief is big and shouty and cannot bake." Snaggle's remaining eyebrow rises. "If you go up there, we did not see you go up there."`,
          `It presses something into your hand: a tooth on a string. "You show this, any of us, is fine. Is treaty."`
        ],
        choices: [
          { text: 'Take the treaty and go upstairs.',
            goto: 'apartment_door', effects: { give: 'goblin_charm', xp: 50, flags: { has_treaty: true } } }
        ]
      },

      goblin_honest: {
        title: 'The Hard Truth',
        art: 'floor',
        text: [
          `Snaggle absorbs this. The apron suddenly looks very small on it.`,
          `"Oh," it says. "Yes. Of course." It steps out of your way, and the other two follow. "Is not ours. Was never ours." It turns back toward the ruined bench and the failed pie under its cloth. "Go on, then."`,
          `Nobody stops you. Somehow that is worse.`
        ],
        choices: [
          { text: 'Go upstairs.', goto: 'apartment_door', effects: {} },
          { text: 'Wait — change your mind. "I could copy it out for you first."',
            goto: 'goblin_deal', effects: { bond: { goblins: 4 }, xp: 100, flags: { goblin_alliance: true, promised_to_read: true }, chronicle: 'changed your mind and promised the goblins a copy of the recipe', remember: true } }
        ]
      },

      goblin_cowed: {
        title: 'Backed Down',
        art: 'floor',
        text: [
          `You make yourself large and loud and absolutely certain, and three goblins remember that they are three goblins.`,
          `They back away from the benches with their hands up, pressing themselves against the wall. The big one in the apron keeps its eyes on the floor.`,
          `You can take whatever you want. That is what winning looks like, and it tastes like nothing at all.`
        ],
        choices: [
          { text: 'Take what you came for and go upstairs.', goto: 'apartment_door', effects: { flags: { goblins_hostile: true } } },
          { text: 'Actually — stand down. Apologize.',
            goto: 'goblin_parley', effects: { bond: { goblins: 2 }, flags: { relented: true }, chronicle: 'backed down after frightening the goblins, and apologized', remember: true } }
        ]
      },

      goblin_duped: {
        title: 'A Lie That Lands',
        art: 'floor',
        text: [
          `The effect is instant and terrible. All three of them go absolutely still.`,
          `"...She sent you," Snaggle whispers. Its remaining eyebrow is trembling. "She is alive? She is coming back?"`,
          `The others start chattering at a frantic pitch, and one of them runs to the end bench and begins frantically tidying, brushing eleven years of flour off the wood with its bare hands so the kitchen will look right when she gets here.`,
          `They are not smart. But they will remember this. They will remember this for a very long time.`
        ],
        choices: [
          { text: 'Let it stand. Go upstairs.',
            goto: 'apartment_door', effects: { flags: { lie_stands: true }, chronicle: 'let the goblins believe Grammy was coming home', remember: true } },
          { text: 'You cannot do it. Tell them the truth.',
            goto: 'goblin_truth', effects: { xp: 75, flags: { confessed_lie: true }, bond: { goblins: 2 }, chronicle: 'confessed the lie about Grammy rather than let them hope', remember: true } }
        ]
      },

      goblin_truth: {
        title: 'Taking It Back',
        art: 'floor',
        text: [
          `"No," you say. "I\'m sorry. She\'s gone. She\'s been gone a long time. I lied to get past you."`,
          `The tidying stops. Snaggle looks at you for a long moment with an expression you cannot read, and then nods slowly.`,
          `"Is good you say," it says. "Is bad you lie. But is good you say." It steps aside. "Chief upstairs. We did not see you."`
        ],
        choices: [{ text: 'Go up.', goto: 'apartment_door', effects: { flags: { goblin_alliance: true }, give: 'goblin_charm' } }]
      },

      goblin_standoff: {
        title: 'Nobody Moves',
        art: 'floor',
        text: [
          `Whatever you tried does not take. The ring of goblins tightens. Scimitars come out — old ones, notched, but perfectly capable.`,
          `There is one breath left in which this does not have to happen.`
        ],
        choices: [
          { text: 'Drop your weapon. Entirely. Right now.',
            goto: 'goblin_parley', effects: { xp: 100, flags: { disarmed_self: true }, bond: { goblins: 3 }, chronicle: 'dropped your weapon rather than fight three goblins over a rolling pin', remember: true } },
          { text: 'Talk faster.',
            check: { stat: 'CHA', skill: 'persuasion', dc: 13, label: 'Desperate Persuasion' },
            success: { goto: 'goblin_parley', effects: { xp: 75 } },
            fail: { goto: 'goblin_fight', effects: {} } },
          { text: 'Fight.', goto: 'goblin_fight', effects: { flags: { chose_violence: true } } }
        ]
      },

      goblin_fight: {
        title: 'Blades on the Bakery Floor',
        art: 'floor',
        onEnter: { flags: { bakery_alerted: true, fought_goblins: true } },
        text: [
          `The rolling pins keep rolling. The knives keep chopping at apples that are not there. The ovens keep opening and closing, patient as breathing.`,
          `And underneath all of it, three goblins in a stranger's kitchen fight for the only thing they have left.`
        ],
        choices: [
          { text: 'Fight to disable. Nobody dies today.',
            check: { stat: 'STR', skill: 'athletics', dc: 14, label: 'Athletics', advIf: [{ cls: 'fighter' }, { cls: 'monk' }, { cls: 'paladin' }] },
            success: { goto: 'goblin_fight_spare', effects: { xp: 100, flags: { spared_kitchen_goblins: true }, chronicle: 'beat the kitchen goblins senseless but spared all three', remember: true } },
            fail: { goto: 'goblin_fight_bad', effects: { damage: '2d6' } } },
          { text: 'Fight properly.',
            check: { stat: 'DEX', skill: 'acrobatics', dc: 13, label: 'Combat' },
            success: { goto: 'goblin_fight_kill', effects: { xp: 100, flags: { killed_kitchen_goblins: true, has_blood_debt: true }, bond: { goblins: -5 }, chronicle: 'killed the three goblin bakers on the kitchen floor', remember: true } },
            fail: { goto: 'goblin_fight_bad', effects: { damage: '2d6' } } }
        ]
      },

      goblin_fight_spare: {
        title: 'Down, Not Out',
        art: 'floor',
        text: [
          `You end it with the flat, the pommel, and a very deliberate lack of edge. Three goblins lie groaning among the flour.`,
          `The one in the apron is still conscious. It watches you step over it toward the stairs, and it does not look afraid anymore. It looks like it is filing you away.`
        ],
        choices: [{ text: 'Go upstairs.', goto: 'apartment_door', effects: { flags: { goblins_hostile: true } } }]
      },

      goblin_fight_kill: {
        title: 'The Kitchen Goes Quiet',
        art: 'floor',
        text: [
          `It does not take long.`,
          `Afterward the rolling pins are still rolling. The knives still chop. The ovens still open and close.`,
          `The apron is lying in the flour near the end bench, next to a covered tin holding a pie that is almost — almost — right.`
        ],
        choices: [{ text: 'Go upstairs.', goto: 'apartment_door', effects: { flags: { goblins_hostile: true, kitchen_massacre: true } } }]
      },

      goblin_fight_bad: {
        title: 'They Fight Harder Than You Expected',
        art: 'floor',
        text: [
          `Three scimitars in a confined space, and every one of them knows this room better than you do. You give ground, take a cut across the arm and another across the ribs, and end up with your back to an oven.`,
          `They are not pressing the advantage. They are just standing there, between you and the benches, breathing hard.`,
          `"Go," says the one in the apron. "Just go."`
        ],
        choices: [
          { text: 'Take the stairs and leave them their kitchen.',
            goto: 'apartment_door', effects: { flags: { goblins_hostile: true, lost_kitchen_fight: true }, chronicle: 'lost a fight on the bakery floor and was let go', remember: true } },
          { text: 'Drink a potion and try again.', req: { item: 'healing_potion' },
            goto: 'goblin_fight', effects: { take: 'healing_potion', heal: '2d4+2' } }
        ]
      },

      /* ---------- Upstairs ---------- */

      apartment_door: {
        title: 'The Narrow Stair',
        art: 'stairs',
        onEnter: { flags: { act: 5 } },
        text: (S) => [
          `The stair is narrow, wooden, and worn into a shallow curve down the middle of each tread by sixty years of the same feet going up and down.`,
          `At the top: a door. Behind it, voices — three of them, and one is much louder than the others.`,
          S.flags.has_treaty ? `You have Snaggle's tooth on its string. Downstairs, nobody saw you come up.` : ``,
          S.flags.bakery_alerted ? `They know someone is in the building. They are waiting.` : `They do not know you are here.`
        ],
        choices: [
          { text: 'Listen at the door first.',
            check: { stat: 'WIS', skill: 'perception', dc: 12, label: 'Perception', advIf: [{ race: 'elf' }] },
            success: { goto: 'apartment_listen', effects: { xp: 50 } },
            fail: { goto: 'apartment', effects: { note: 'Just noise through thick old wood. You cannot make out the words.' } } },
          { text: 'Open the door and walk in.', goto: 'apartment', effects: {} },
          { text: 'Knock.', goto: 'apartment_knock', effects: { flags: { knocked: true }, xp: 25 } }
        ]
      },

      apartment_listen: {
        title: 'Through the Door',
        art: 'stairs',
        text: [
          `"—say again we look in the walls—"`,
          `"WE LOOK IN THE WALLS. We look in the walls TWICE. Is not in the walls!" A heavy thud, like a fist on a desk. "Is not in the walls, is not in the bed, is not in the floor. Maybe is no paper. Maybe old one make it up."`,
          `A third voice, very small: "...Snaggle say there is paper."`,
          `"SNAGGLE SAY. Snaggle is head baker of NOTHING. Snaggle burn everything he touch." A pause, and then, quieter, tired: "...Snaggle try, though. Snaggle try harder than me."`,
          `The chief, whoever they are, is looking for the same thing you are. And is not entirely a monster about it.`
        ],
        choices: [
          { text: 'Open the door.', goto: 'apartment', effects: { flags: { heard_chief: true } } },
          { text: 'Knock.', goto: 'apartment_knock', effects: { flags: { heard_chief: true, knocked: true }, xp: 25 } }
        ]
      },

      apartment_knock: {
        title: 'You Knock',
        art: 'apartment',
        text: [
          `You knock on the door of a goblin-held room in an abandoned bakery, and every voice inside stops at once.`,
          `A long silence. Then footsteps, and the door opens a crack, and one large yellow eye looks out at you.`,
          `"...You knock," it says. It sounds genuinely thrown. "Nobody knock. Dead things never knock."`,
          `The door opens wider.`
        ],
        choices: [{ text: 'Step inside.', goto: 'apartment', effects: { bond: { goblins: 2 }, flags: { knocked_politely: true }, chronicle: 'knocked before entering the goblin chief\'s room', remember: true } }]
      },

      apartment: {
        title: "Grammy's Apartment",
        art: 'apartment',
        onEnter: { flags: { reached_apartment: true } },
        text: (S) => [
          `Once, this was a homey little apartment above a bakery. Now it is a goblin hovel — but a hovel with strange care in it.`,
          `The ancient mahogany furniture is still here, too heavy to move. A bed stands in one corner, stripped of its mattress. A wardrobe in the opposite corner has been filled with crude weapons. Against one wall is a desk covered in animal pelts and hunting trophies.`,
          `Two goblins and their leader stand in the middle of the room, staring at you. The chief is nearly twice the size of the others, wearing a breastplate three sizes too big and a woman's shawl knotted around the shoulders like a cloak of office.`,
          S.flags.knocked_politely ? `Nobody has drawn a weapon. Yet.` : `Weapons come up. Nobody swings.`
        ],
        choices: [
          { text: 'Show the treaty tooth.', req: { item: 'goblin_charm' },
            goto: 'chief_parley', effects: { bond: { goblins: 2 }, xp: 50, flags: { showed_treaty: true } } },
          { text: '"I\'m looking for a piece of paper. So are you. Let\'s talk."',
            check: { stat: 'CHA', skill: 'persuasion', dc: 14, label: 'Persuasion', advIf: [{ flag: 'heard_chief' }, { flag: 'goblin_alliance' }, { flag: 'knocked_politely' }], disIf: [{ flag: 'goblins_hostile' }, { flag: 'has_blood_debt' }] },
            success: { goto: 'chief_parley', effects: { xp: 100, bond: { goblins: 2 } } },
            fail: { goto: 'chief_hostile', effects: {} } },
          { text: 'Intimidate the chief in front of its people.',
            check: { stat: 'CHA', skill: 'intimidation', dc: 14, label: 'Intimidation', advIf: [{ race: 'half_orc' }, { cls: 'barbarian' }] },
            success: { goto: 'chief_cowed', effects: { xp: 75, bond: { goblins: -3 }, flags: { humiliated_chief: true }, chronicle: 'humiliated the goblin chief in front of its own people', remember: true } },
            fail: { goto: 'chief_hostile', effects: {} } },
          { text: 'Attack.', goto: 'chief_fight', effects: { flags: { attacked_chief: true } } },
          { text: 'Search the room for the desk while they watch.',
            check: { stat: 'DEX', skill: 'sleight_of_hand', dc: 15, label: 'Misdirection', advIf: [{ cls: 'rogue' }, { origin: 'charlatan' }] },
            success: { goto: 'apartment_desk', effects: { xp: 100, flags: { slick: true }, note: 'You keep talking, keep moving, and have the drawer open behind your back before anyone registers what your hands are doing.' } },
            fail: { goto: 'chief_hostile', effects: {} } }
        ]
      },

      chief_parley: {
        title: 'Grubnash',
        art: 'apartment',
        onEnter: { flags: { met_chief: true } },
        text: (S) => [
          `The chief lowers its cleaver. Up close, the breastplate is dented in a hundred places and the shawl is neatly darned — over and over, carefully, by someone who did not want it to fall apart.`,
          `"Grubnash," it says. "I is chief." It eyes you. "You is here for paper. Everybody is here for paper. Eleven years I look for paper."`,
          `It gestures at the room — at the gouged floorboards, the holes knocked in the plaster, the wardrobe dragged away from the wall.`,
          `"Is not here. We look everywhere in here."`,
          S.flags.has_office_half ? `You have the other half in your pack. You could tell it that.` : ``
        ],
        choices: [
          { text: 'Show Grubnash the half you already have.', req: { item: 'recipe_half_office' },
            goto: 'chief_together', effects: { xp: 100, bond: { goblins: 4 }, flags: { showed_half: true }, chronicle: 'showed the goblin chief the half-recipe instead of hiding it', remember: true } },
          { text: '"You looked everywhere in here. Did you look where she slept?"',
            check: { stat: 'INT', skill: 'investigation', dc: 13, label: 'Investigation' },
            success: { goto: 'apartment_desk', effects: { xp: 100, flags: { deduced_desk: true } } },
            fail: { goto: 'apartment_search', effects: {} } },
          { text: '"Let me look. I can read — you can\'t. You need me."',
            check: { stat: 'CHA', skill: 'persuasion', dc: 12, label: 'Persuasion' },
            success: { goto: 'apartment_search', effects: { xp: 75, flags: { permission_to_search: true }, bond: { goblins: 1 } } },
            fail: { goto: 'chief_hostile', effects: { note: 'You have just told a chief, in its own room, in front of its people, that it is stupid. It does not go well.' } } }
        ]
      },

      chief_together: {
        title: 'Two Halves',
        art: 'apartment',
        text: [
          `You take out the torn parchment and hold it up.`,
          `Grubnash goes absolutely silent. It reaches out with one enormous green hand and does not quite touch the paper, the way you might not quite touch something holy.`,
          `"Is real," it breathes. "Is real paper. Old one was right." Its huge head comes up. "Where is other half? Is other half!"`,
          `"That\'s what I\'m here for," you say.`,
          `And the chief of the goblins steps aside from the desk it has been sleeping in front of for eleven years, and says: "Then look. Look everywhere. We help."`
        ],
        choices: [{ text: 'Search the desk.', goto: 'apartment_desk', effects: { flags: { goblin_alliance: true, searched_together: true } } }]
      },

      chief_cowed: {
        title: 'The Chief Backs Down',
        art: 'apartment',
        text: [
          `You break Grubnash in front of its own people. It takes about nine seconds.`,
          `The cleaver clatters to the floor. The chief backs against the desk, and the two smaller goblins look between you and their leader with an expression that is going to change how this room works forever, whatever else happens today.`,
          `"Take," Grubnash says. "Take what you want. Go."`
        ],
        choices: [
          { text: 'Search the desk.', goto: 'apartment_desk', effects: { flags: { goblins_hostile: true } } },
          { text: 'Stop. Pick up the cleaver and hand it back.',
            goto: 'chief_parley', effects: { xp: 100, bond: { goblins: 3 }, flags: { returned_cleaver: true }, chronicle: 'handed the goblin chief its weapon back after breaking it', remember: true } }
        ]
      },

      chief_hostile: {
        title: 'No Deal',
        art: 'apartment',
        text: [
          `Grubnash's face closes like a door.`,
          `"No," it says. "Is ours. Is our house. You go now or you not go at all." The cleaver comes up. The two others spread out to flank you.`,
          `Last chance.`
        ],
        choices: [
          { text: 'Leave the room. Find another way.',
            goto: 'apartment_retreat', effects: { flags: { backed_off_chief: true } } },
          { text: 'Offer something of real value in trade.', req: { item: 'exotic_spices' },
            goto: 'chief_trade', effects: { take: 'exotic_spices', xp: 100, bond: { goblins: 3 }, flags: { traded_spices: true }, chronicle: 'traded Grammy\'s hidden spices to the goblin chief for peace', remember: true } },
          { text: 'Fight.', goto: 'chief_fight', effects: { flags: { attacked_chief: true } } }
        ]
      },

      chief_trade: {
        title: 'The Spices',
        art: 'apartment',
        text: [
          `You hold out the four small bags, and you open one.`,
          `Cinnamon fills the room.`,
          `Every goblin in it stops dead. Grubnash's cleaver lowers by degrees, entirely without its owner's permission. The chief inhales — a long, shuddering pull — and when it speaks its voice has gone strange.`,
          `"That," it says. "That is the smell. That is the smell from the road." It takes the bags in both hands like a newborn. "You want paper? Take paper. Take whole house. You bring back the smell."`
        ],
        choices: [{ text: 'Search the desk.', goto: 'apartment_desk', effects: { flags: { goblin_alliance: true } } }]
      },

      apartment_retreat: {
        title: 'Back Down the Stairs',
        art: 'stairs',
        text: [
          `You back out of the room and down the narrow stair with three goblins watching you the whole way.`,
          `You are not getting into that apartment by walking in the front. Not today.`
        ],
        choices: [
          { text: 'Wait for the chief to leave, then go back up.',
            check: { stat: 'WIS', skill: 'survival', dc: 13, label: 'Patience' },
            success: { goto: 'apartment_empty', effects: { xp: 100, flags: { waited_out_chief: true }, chronicle: 'waited hours in the dark for the goblin chief to leave its room', remember: true } },
            fail: { goto: 'bakery_floor', effects: { note: 'Hours pass. The chief does not leave. Eventually you have to move.' } } },
          { text: 'Go back to the bakery floor and think.', goto: 'bakery_floor', effects: {} }
        ]
      },

      apartment_empty: {
        title: 'An Empty Room',
        art: 'apartment',
        text: [
          `You wait in the dark at the bottom of the stairs until your legs go numb, and eventually — grumbling, with both its guards in tow — Grubnash clumps down past you and out toward the orchard.`,
          `The room above is empty. It is yours for exactly as long as it takes them to come back.`
        ],
        choices: [{ text: 'Get in there. Fast.', goto: 'apartment_desk', effects: { flags: { snuck_in: true } } }]
      },

      chief_fight: {
        title: 'The Chief',
        art: 'apartment',
        onEnter: { flags: { bakery_alerted: true } },
        text: [
          `Grubnash is bigger than you expected and faster than something that size has any right to be, and it is fighting in its own home with its people behind it.`,
          `The shawl flies loose in the first exchange. Underneath, the breastplate is held together with wire.`
        ],
        choices: [
          { text: 'Beat it down without killing it.',
            check: { stat: 'STR', skill: 'athletics', dc: 15, label: 'Athletics', advIf: [{ cls: 'fighter' }, { cls: 'barbarian' }, { cls: 'paladin' }] },
            success: { goto: 'chief_beaten', effects: { xp: 150, flags: { beat_chief: true }, chronicle: 'beat the goblin chief Grubnash but left it alive', remember: true } },
            fail: { goto: 'chief_fight_hurt', effects: { damage: '2d6' } } },
          { text: 'Kill it.',
            check: { stat: 'DEX', skill: 'acrobatics', dc: 14, label: 'Combat' },
            success: { goto: 'chief_dead', effects: { xp: 150, flags: { killed_chief: true, has_blood_debt: true }, bond: { goblins: -8 }, chronicle: 'killed Grubnash, chief of the goblins, in Grammy\'s bedroom', remember: true } },
            fail: { goto: 'chief_fight_hurt', effects: { damage: '2d6' } } }
        ]
      },

      chief_beaten: {
        title: 'Down',
        art: 'apartment',
        text: [
          `Grubnash goes down on one knee, then onto its hands, and stays there breathing hard while the cleaver lies out of reach.`,
          `It does not ask for mercy. It just watches you, waiting to find out what kind of person you are.`,
          `The two smaller goblins have not moved. They are watching too.`
        ],
        choices: [
          { text: 'Step back. Let it stand up.',
            goto: 'apartment_desk', effects: { xp: 100, bond: { goblins: 2 }, flags: { spared_chief: true }, chronicle: 'spared Grubnash and let it stand', remember: true } },
          { text: 'Take what you came for and ignore it.',
            goto: 'apartment_desk', effects: { flags: { goblins_hostile: true } } }
        ]
      },

      chief_dead: {
        title: 'The Chief Falls',
        art: 'apartment',
        text: [
          `It goes down hard, in the middle of the room, under the window where the light comes in.`,
          `The two smaller goblins do not attack. They do not run either. They just stand there looking at the body of the largest thing they have ever known, and then at you.`,
          `One of them picks up the shawl off the floor and holds it against its chest.`
        ],
        choices: [{ text: 'Search the desk.', goto: 'apartment_desk', effects: { flags: { goblins_hostile: true, kitchen_massacre: true } } }]
      },

      chief_fight_hurt: {
        title: 'That Cleaver Is Real',
        art: 'apartment',
        text: [`The cleaver catches you across the ribs and the world goes white for a second. You get clear, but you are hurt, and Grubnash is still standing.`],
        choices: [
          { text: 'Keep fighting.', goto: 'chief_fight', effects: {} },
          { text: 'Drink a potion.', req: { item: 'healing_potion' }, goto: 'chief_fight', effects: { take: 'healing_potion', heal: '2d4+2' } },
          { text: 'Yield. Put up your hands.',
            goto: 'chief_parley', effects: { xp: 75, flags: { yielded: true }, bond: { goblins: 1 }, chronicle: 'yielded to the goblin chief mid-fight', remember: true, note: 'Grubnash stops. Lowers the cleaver. "Huh," it says. Apparently nobody has ever done that either.' } }
        ]
      },

      apartment_search: {
        title: 'Searching the Room',
        art: 'apartment',
        text: [
          `You go over the apartment properly. The bed frame: nothing. The floorboards: pried up and re-laid a dozen times by goblins who had the same idea. The walls: full of holes.`,
          `Grubnash was right. They have been thorough.`,
          `Which leaves the desk — the big mahogany one under the pelts and the hunting trophies. It is far too heavy for goblins to move, and they have been using it as a table for eleven years.`
        ],
        choices: [
          { text: 'Clear the desk and go through it.', goto: 'apartment_desk', effects: {} }
        ]
      },

      apartment_desk: {
        title: 'The Desk',
        art: 'apartment',
        text: [
          `You sweep the pelts aside. Underneath, the mahogany is beautiful — and identical in make to the desks downstairs in the office.`,
          `The same maker. The same year. And, when you crouch to look, the same row of drawers with the same brass fittings.`,
          `One of them sits a fraction prouder in its frame than the others.`
        ],
        choices: [
          { text: 'Check for a needle trap first. You know this desk.',
            check: { stat: 'WIS', skill: 'perception', dc: 13, label: 'Perception', advIf: [{ flag: 'spotted_trap' }, { flag: 'trap_armed' }, { item: 'thieves_tools' }] },
            success: { goto: 'apartment_trap_found', effects: { xp: 75, flags: { spotted_trap2: true } } },
            fail: { goto: 'apartment_trap_sprung', effects: {} } },
          { text: 'Open it.', goto: 'apartment_trap_sprung', effects: {} },
          { text: '(You have already been stabbed by one of these today.) Jam it open from the side.',
            if: (S) => !!S.flags.trap_armed || !!S.flags.spotted_trap,
            goto: 'apartment_recipe', effects: { xp: 75, note: 'You lever the drawer front off from the side. The needle fires into empty air, and you feel nothing but professional satisfaction.' } }
        ]
      },

      apartment_trap_found: {
        title: 'The Same Trick Twice',
        art: 'apartment',
        text: [`There it is — the same hair-thin gap, the same dull gleam of brass. She had both desks fitted with the same mechanism, which is either extremely paranoid or extremely sensible.`],
        choices: [
          { text: 'Disarm it.',
            check: { stat: 'DEX', skill: 'sleight_of_hand', dc: 16, label: 'Dexterity', advIf: [{ item: 'thieves_tools' }, { cls: 'rogue' }, { flag: 'disarmed_trap' }] },
            success: { goto: 'apartment_recipe', effects: { xp: 100, flags: { disarmed_trap2: true } } },
            fail: { goto: 'apartment_trap_sprung', effects: {} } },
          { text: 'Trigger it safely with something that is not your hand.',
            check: { stat: 'INT', skill: 'investigation', dc: 12, label: 'Investigation' },
            success: { goto: 'apartment_recipe', effects: { xp: 75 } },
            fail: { goto: 'apartment_trap_sprung', effects: {} } }
        ]
      },

      apartment_trap_sprung: {
        title: 'Needle, Again',
        art: 'apartment',
        onEnter: {
          damage: '1',
          save: { stat: 'CON', dc: 15, label: 'Constitution Save', poison: true,
            failEffects: { damage: '1d10', poisoned: 3 },
            onFailText: 'Poison, and this time you have less left to give. Everything goes grey at the edges.',
            onSuccessText: 'You sweat it out. Barely.' }
        },
        text: [`The needle finds your hand before you find the mechanism.`],
        choices: [{ text: 'Open the drawer anyway.', goto: 'apartment_recipe', effects: {} }]
      },

      apartment_recipe: {
        title: 'The Other Half',
        art: 'apartment',
        onEnter: { flags: { has_apartment_half: true } },
        text: (S) => [
          `Inside the drawer: a torn half-sheet of parchment, and a small green notebook.`,
          `The parchment is the right-hand column — the torn edge matches, you can see it without even holding them together. Here are the spices, and the oven temperature, and the note about resting the pastry in the cold room for exactly one hour.`,
          `And at the bottom, in that round and careful hand:`,
          `"and one thing more, which I shall never write down. — G."`,
          S.flags.goblin_alliance || S.flags.searched_together ? `Behind you, Grubnash makes a small noise. It has understood, from your face, that you found it.` : ``
        ],
        choices: [
          { text: 'Take both. Look at the notebook.',
            goto: 'apartment_notebook', effects: { give: ['recipe_half_apartment', 'grammy_spellbook'], xp: 150, chronicle: 'found the second half of Grammy\'s recipe in her bedroom desk', remember: true } }
        ]
      },

      apartment_notebook: {
        title: "Grammy's Notebook",
        art: 'apartment',
        text: [
          `The little green notebook is a kitchen spellbook — not a wizard's grimoire, just the few small magics one baker taught herself over sixty years:`,
          `Druidcraft, for coaxing the apple trees. Entangle, "for the boys who come round the back after dark." Purify Food and Drink. And Speak with Plants, annotated in the margin: "the orchard girls do prefer to be asked."`,
          `On the last used page, in handwriting that has gone shaky with age, there is one more note. It is dated the spring before the undead came.`,
          `"If I am not here — the trick is you must talk to them while you work. The apples. It sounds like nonsense and it is not. They know when they are wanted. That is the whole secret and I will not write it down twice."`,
          `That is the thing she never wrote down. And you are holding it.`
        ],
        choices: [
          { text: 'You have both halves. Time to leave.',
            if: (S) => S.has('recipe_half_office'),
            goto: 'both_halves', effects: { flags: { has_both: true } } },
          { text: 'You still need the other half — from the office downstairs.',
            if: (S) => !S.has('recipe_half_office'),
            goto: 'shop_hub', effects: { note: 'One half is not a recipe. The office downstairs is still unsearched.' } }
        ]
      },

      both_halves: {
        title: 'Both Halves',
        art: 'apartment',
        onEnter: { flags: { has_both: true } },
        text: (S) => [
          `You hold the two pieces together and the torn edges marry perfectly, sixty years of one woman's work reassembled in your hands in a ruined bedroom above a bakery.`,
          `Six apples of three kinds. Cold butter, fingertips only. Cinnamon, nutmeg, ginger, cloves. One hour in the cold room. And talk to them while you work.`,
          S.flags.promised_to_read ? `Downstairs, a goblin in a stitched-down apron is waiting for you to come back and read it out loud. You promised.` : ``,
          S.flags.goblin_alliance ? `Grubnash is looking at the paper in your hands with eleven years of hunger.` : ``
        ],
        choices: [
          { text: 'Read it aloud. To all of them. Right now.',
            if: (S) => !!(S.flags.goblin_alliance || S.flags.promised_to_read || S.flags.showed_treaty),
            goto: 'reading', effects: { xp: 200, flags: { read_to_goblins: true }, chronicle: 'read Grammy\'s recipe aloud to the goblins who had been trying for eleven years', remember: true } },
          { text: 'Copy it out for them, then take the original.',
            if: (S) => !!(S.flags.goblin_alliance || S.flags.promised_to_read || S.flags.met_snaggle),
            goto: 'copy_out', effects: { xp: 150, flags: { copied_for_goblins: true }, chronicle: 'copied the recipe out for the goblins before leaving', remember: true } },
          { text: 'Take it and go. The job is the job.',
            goto: 'departure', effects: { flags: { took_and_left: true }, chronicle: 'took the recipe and left without a word', remember: true } },
          { text: 'Take it and burn the bakery behind you.',
            if: (S) => !!S.flags.goblins_hostile,
            goto: 'burn', effects: { flags: { burned_bakery: true }, chronicle: 'burned Grammy\'s bakery to the ground on the way out', remember: true } }
        ]
      },

      reading: {
        title: 'The Reading',
        art: 'floor',
        text: [
          `You go down to the bakery floor and you make them all sit.`,
          `Nine goblins. Snaggle in its apron at the front, Grubnash filling a doorway at the back with the shawl back on its shoulders. Somebody has lit every lamp in the building.`,
          `You read it out. Slowly. Twice. You read the part about the six apples of three kinds, and Snaggle mouths it silently after you. You read the part about the cold butter and the fingertips, and one of them makes a noise of pure revelation and smacks another one on the arm.`,
          `And then you read the last line.`,
          `"You must talk to them while you work. The apples. They know when they are wanted."`,
          `The room goes completely quiet.`,
          `"...We never talk to them," Snaggle says. Its voice cracks straight down the middle. "Eleven years. We never say one word."`,
          `It sits down on the floor of the kitchen it has been failing in for over a decade and puts its face in its hands, and the others crowd around it, and something in that room finally, finally breaks open.`
        ],
        choices: [
          { text: 'Stay. Help them bake one.',
            goto: 'bake_together', effects: { xp: 200, flags: { baked_with_goblins: true }, chronicle: 'stayed and baked the first real pie in eleven years with the goblins', remember: true } },
          { text: 'Leave them to it. This part is theirs.',
            goto: 'departure', effects: { xp: 100, bond: { goblins: 3 }, flags: { left_them_to_it: true }, chronicle: 'left the goblins to bake it themselves', remember: true } }
        ]
      },

      bake_together: {
        title: 'One Good Pie',
        art: 'floor',
        onEnter: { flags: { act: 6 } },
        text: (S) => [
          `It takes four hours and it is a complete disaster and it is the best afternoon you have had in years.`,
          `Grubnash turns out to have surprisingly delicate hands for the pastry. Two of the smaller ones are dispatched to the orchard for apples and come back with the dryads, who arrive prepared to be extremely annoyed and instead stay to supervise, criticize, and eventually help.`,
          S.flags.magmin_friends ? `The magmins, informed that this is Important, stoke oven four until it glows like a forge.` : `They light oven four the old way, with wood, and it takes an hour to come up to heat.`,
          `And the whole time, Snaggle stands at the bench talking quietly to a bowl of sliced apples, feeling ridiculous, and not stopping.`,
          `When it comes out of the oven the smell goes through the whole building. It goes out the windows and across the yard and into the orchard. It reaches the road.`,
          `Mac, outside, is heard to say — to nobody, in a voice like a rockslide — "oh, THERE it is."`
        ],
        choices: [
          { text: 'Take your slice.',
            goto: 'departure', effects: { give: 'pie_slice', xp: 250, heal: 'full', flags: { perfect_ending: true }, chronicle: 'baked the perfect pie in Grammy\'s kitchen and shared it with everyone who lived there', remember: true } }
        ]
      },

      copy_out: {
        title: 'A Fair Copy',
        art: 'apartment',
        text: [
          `You borrow a quill, find a blank page in the back of the green notebook, and copy the whole thing out in your clearest hand — both halves, all of it, including the last line.`,
          `You press the copy into Snaggle's hands. It cannot read a word of it. It holds it like a relic anyway.`,
          `"We find someone," it says fiercely. "We find someone who read. We find someone." It clutches the paper to the apron. "Thank you."`
        ],
        choices: [
          { text: 'Head out.',
            goto: 'departure', effects: { xp: 100, bond: { goblins: 3 } } },
          { text: 'Actually — sit down and read it to them first.',
            goto: 'reading', effects: { xp: 100, flags: { read_to_goblins: true } } }
        ]
      },

      burn: {
        title: 'Fire',
        art: 'floor',
        onEnter: { flags: { act: 6 } },
        text: [
          `You take a lamp off the wall on the way out and you drop it on the bakery floor, and eleven years of flour dust does the rest.`,
          `It goes up fast. Faster than you expected. By the time you are across the yard the windows are bright and something inside is screaming — you tell yourself it is the beams.`,
          `Outside, Mac has turned to watch. The treant says nothing at all. The orchard, at your back, has gone completely silent for the first time since you arrived.`,
          `You have the recipe. It is in your pack, and the pack is on your shoulders, and you walk down the gravel path with it while the place that made it burns.`
        ],
        choices: [
          { text: 'Do not look back.',
            goto: 'departure', effects: { flags: { arsonist: true }, bond: { goblins: -10, dryads: -10, mac: -10 }, xp: 50 } }
        ]
      },

      departure: {
        title: 'The Long Road Back',
        art: 'road',
        onEnter: { flags: { act: 6 } },
        text: (S) => {
          const l = [`You walk out down the gravel path, between the overgrown lawn and the smell of apples, with a sixty-year-old secret folded in your pack.`];
          if (S.flags.burned_bakery) l.push(`Behind you the sky is orange. You can see the glow on the road for a long time.`);
          else if (S.flags.met_mac) l.push(`Mac watches you go. As you reach the road, the great trunk creaks and the old treant says, gruffly: "Don't be a stranger. Ninety years is a long time between visitors."`);
          if (S.flags.baked_with_goblins) l.push(`There is a warm weight in your pack, wrapped in cloth, and you know exactly who you are saving it for.`);
          if (S.flags.dryads_love) l.push(`From the orchard, three voices call after you in unison: "COME BACK AND SING."`);
          l.push(`Four days by road, or two by river, and then a tower in Trostenwald with a light in the top window.`);
          return l;
        },
        choices: [
          { text: 'Go and see the old man.', goto: 'finale', effects: {} }
        ]
      },

      /* ══════════════ FINALE ══════════════ */

      finale: {
        title: 'Tyndareus',
        art: 'tower',
        onEnter: { flags: { act: 7, finished: true } },
        text: (S) => {
          const complete = S.has('recipe_half_office') && S.has('recipe_half_apartment');
          const l = [];
          if (complete) {
            l.push(`The imp lets you in without a word and leads you up the long, winding stair.`);
            l.push(`Tyndareus takes the two halves in his small, spotted hands and holds them together, and his whole face changes. Ninety years falls off him at once.`);
            l.push(`"Of course," he says. "Of course. It all makes sense." He reads it again, lips moving, and then laughs out loud — a startled, delighted bark of a laugh. "Six apples of THREE KINDS. The old fraud. She told my mother it was four."`);
            l.push(`He casts Mending. The tear seals as if it had never been. He hands it to the imp, who vanishes at frankly unreasonable speed, and then he rummages in a drawer and comes up with a rust-colored leather bag.`);
            l.push(`"I think you'll find that quite entertaining," he says, eyes twinkling. "And a thousand gold, which is what we agreed."`);
          } else {
            l.push(`The imp lets you in. The climb feels longer than it did the first time.`);
            l.push(`Tyndareus takes what you have and turns it over, and over, and the light goes out of his face by degrees.`);
            l.push(`"Half," he says quietly. "This is half." He sets it down very gently, as though it might tear further. "You would have to go back for the rest."`);
            l.push(`When you tell him what happened, he listens all the way through without interrupting. Then he nods, and pours the tea anyway.`);
            l.push(`"Well," he says. "I am ninety-four and I have wanted this for eighty-six years. I suppose I can want it a while longer." He pats your hand. "You came back and told me yourself. Most would not have."`);
          }
          return l;
        },
        choices: [
          { text: 'Take the reward.', if: (S) => S.has('recipe_half_office') && S.has('recipe_half_apartment'),
            goto: 'epilogue', effects: { gold: 1000, give: 'bag_of_tricks', xp: 300 } },
          { text: 'Tell him how you got it — all of it.', if: (S) => S.has('recipe_half_office') && S.has('recipe_half_apartment'),
            goto: 'finale_bonus', effects: { xp: 100 } },
          { text: 'Accept that you did not finish it.', if: (S) => !(S.has('recipe_half_office') && S.has('recipe_half_apartment')),
            goto: 'epilogue', effects: { gold: 150, xp: 100, flags: { partial: true } } }
        ]
      },

      finale_bonus: {
        title: 'The Bonus',
        art: 'tower',
        text: (S) => {
          const peaceful = !S.flags.killed_chief && !S.flags.killed_kitchen_goblins && !S.flags.killed_road_patrol && !S.flags.killed_patrol && !S.flags.killed_dock_pair && !S.flags.burned_bakery;
          const l = [];
          if (peaceful) {
            l.push(`You tell him everything — the tree, the dryads, the apron, the word scratched into the bench a hundred times.`);
            l.push(`Tyndareus does not interrupt once. When you finish he takes off his spectacles and polishes them for rather longer than they need.`);
            l.push(`"Nobody died," he says. It is not a question. "In a goblin-held ruin, over a piece of paper, and nobody died."`);
            l.push(`He gets up — quickly, this time — and goes to a cabinet. "I said there would be a bonus for a peaceful solution. I confess I did not expect to pay it."`);
            if (S.flags.baked_with_goblins) l.push(`When you mention that you stayed and baked one with them, the old gnome has to sit down. "You— with the goblins. In her kitchen." He laughs until he has to wipe his eyes. "Oh, she would have liked that. She would have liked that enormously."`);
          } else {
            l.push(`You tell him everything, including the parts you would rather not.`);
            l.push(`Tyndareus listens without judgment, which is somehow worse than if he had judged.`);
            l.push(`"I see," he says at last. "Well. You did what the job needed. That is what jobs are." He counts out the agreed gold precisely. "There was to be a bonus for a peaceful resolution. I am sorry not to be paying it."`);
            l.push(`He is not angry. He is just quieter than he was.`);
          }
          return l;
        },
        choices: [
          { text: 'Take the reward.',
            goto: 'epilogue',
            effects: (function () { return { gold: 1000, give: 'bag_of_tricks', xp: 300 }; })() },
          { text: 'Accept the peaceful bonus.', if: (S) => !S.flags.killed_chief && !S.flags.killed_kitchen_goblins && !S.flags.killed_road_patrol && !S.flags.killed_patrol && !S.flags.killed_dock_pair && !S.flags.burned_bakery,
            goto: 'epilogue', effects: { gold: 1500, give: ['bag_of_tricks', 'healing_potion'], xp: 400, flags: { peaceful_bonus: true }, chronicle: 'earned Tyndareus\'s peaceful-resolution bonus — nobody died' } }
        ]
      },

      epilogue: {
        title: 'Pie',
        art: 'tower',
        onEnter: { flags: { completed: true } },
        text: (S) => {
          const l = [];
          l.push(`The imp returns impossibly fast, carrying a pie.`);
          l.push(`The smell fills the study — apples and cinnamon and something underneath it that you cannot name and will think about for weeks.`);
          l.push(`Tyndareus cuts it himself, badly, and gives you the bigger piece.`);
          l.push(`It is, without question, the best thing you have ever eaten.`);
          if (S.flags.baked_with_goblins) l.push(`It tastes exactly like the one you made in a ruined kitchen with nine goblins and three dryads and a treant shouting encouragement through the window. Exactly. To the crumb.`);
          if (S.flags.peaceful_bonus) l.push(`"Tell me again," the old gnome says, with his mouth full, "about the one in the apron."`);
          if (S.flags.burned_bakery) l.push(`Halfway through his slice, Tyndareus pauses. "You know," he says, "I had thought I might go and see the place. Now that I know it is safe." He takes another bite, entirely content, and you say nothing at all.`);
          if (S.flags.partial) l.push(`He does not have his pie. He pours the tea anyway, and asks you about the orchard, and listens as though the story alone were worth the fee.`);
          l.push(`Outside the window, Trostenwald is going about its evening. Somewhere down there is a tavern, a bed, and tomorrow.`);
          return l;
        },
        choices: [
          { text: 'End the episode.', goto: null, effects: {} }
        ]
      },

      /* ---------- KO ---------- */

      ko: {
        title: 'Down',
        art: 'ko',
        text: [
          `The world tips sideways and the floor arrives without warning.`,
          `You are not dead. You wake some time later, somewhere else — propped against a wall with your pack beside you, lighter than it was, and a headache like a cathedral bell.`,
          `Someone dragged you out of there. Someone took a few coins for the trouble. Nobody finished you off.`,
          `You are going to have to think harder about the next part.`
        ],
        choices: [
          { text: 'Get up. Go again.', goto: 'orchard_hub', effects: { note: 'You are hurt, but you are standing, and the bakery is still there.' } }
        ]
      }
    }
  };

  TDM.EPISODES = TDM.EPISODES || {};
  TDM.EPISODES[EP.id] = EP;
  TDM.EPISODE_ORDER = TDM.EPISODE_ORDER || [];
  if (!TDM.EPISODE_ORDER.includes(EP.id)) TDM.EPISODE_ORDER.push(EP.id);

  /* Placeholder entries for future episodes (start screen shows them locked) */
  /* Upcoming episodes.
     Leave `title` and `blurb` as '???' to keep them a surprise — the card will
     render as a sealed, unreadable letter. Fill them in whenever you've decided
     what the episode actually is, and the card reveals the real text. */
  TDM.COMING_SOON = [
    { number: 2, title: '???', blurb: '???', eta: 'Not yet written' },
    { number: 3, title: '???', blurb: '???', eta: 'Not yet written' }
  ];
})();
