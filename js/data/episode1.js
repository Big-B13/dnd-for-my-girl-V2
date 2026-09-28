/* ============================================================
   TALES OF THE DUNGEON MASTER
   EPISODE ONE — "Grammy's Country Apple Pie"

   This is Perry's run, retold.

   Every beat here happened at the table: the failed Stealth roll
   that forced an apology to two trees, the front door, "I come
   here to buy a recipe book", the Oven's four words, the copied
   recipe left at home, the song, the torn page, the first slice
   to Crimp. The spine does not change.

   Nergis still plays it. At every beat she gets the choices
   Perry actually had — his, and the ones he turned down (taken
   from the crossroads log). She can walk his road or step off
   it. The warm road is the true one, and the game knows it.

   Scene shape:
     { title, art, text: [] | (S)=>[], onEnter?, choices: [
         { text, if?, check?, success?, fail?, goto, effects } ] }
   ============================================================ */
(function () {
  const TDM = (typeof window !== 'undefined')
    ? (window.TDM = window.TDM || {})
    : (global.TDM = global.TDM || {});
  TDM.EPISODES = TDM.EPISODES || {};

  /* Shorthand for a remembered, comparable choice. */
  const M = (key, text, extra) => Object.assign({ chronicleKey: key, chronicle: text, remember: true }, extra || {});

  const scenes = {

    /* ========================================================
       ACT ONE — THE TOWER
       ======================================================== */

    tower: {
      title: 'The Imp at the Door',
      art: 'tower',
      text: (S) => [
        `The tower leans out of the hillside like something that grew there rather than something built, and the door opens before you knock.`,
        `On the other side of it is an imp. Red waistcoat, brushed. Arms folded. He looks you up and down — the ${S.raceName.toLowerCase()}, the road dust, the weapon at your hip — with the expression of someone who has answered this door ten thousand times and been disappointed on nine thousand nine hundred of those occasions.`,
        `"He's expecting you," says the imp. "Upstairs. Mind the fourth step, it bites."`,
        `He does not introduce himself. He is clearly waiting to see whether you bother to ask.`
      ],
      choices: [
        {
          text: '"I didn\'t catch your name."',
          goto: 'tower_crimp',
          effects: Object.assign({ xp: 5, bond: { crimp: 4 }, flags: { asked_crimp_name: true } },
            M('asked_crimp_name', 'asked the imp at the door for his name'))
        },
        {
          text: 'Thank him, and follow him up.',
          goto: 'tower_crimp',
          effects: { xp: 5, bond: { crimp: 2 }, flags: { polite_to_crimp: true } }
        },
        {
          text: 'Say nothing. Walk past him and up the stairs.',
          goto: 'tower_stairs',
          effects: Object.assign({ bond: { crimp: -3 } },
            M('ignored_crimp', 'walked past the imp without a word'))
        }
      ]
    },

    tower_crimp: {
      title: 'Crimp',
      art: 'tower',
      text: (S) => {
        const l = [];
        if (S.flags.asked_crimp_name) {
          l.push(`The imp's eyebrows go up about a millimetre, which on him is a standing ovation.`);
          l.push(`"Crimp," he says. "Nobody asks."`);
          l.push(`"Nobody?"`);
          l.push(`"Nobody." He turns for the stairs. "Wizards, mostly. They think the furniture has names and the staff doesn't."`);
        } else {
          l.push(`"Crimp," he says, unprompted, as though getting an unpleasant formality out of the way. "Since you're in my hallway."`);
        }
        l.push(`He goes up ahead of you, fast — much faster than something that size has any business being — and talks the whole way without once looking back.`);
        l.push(`"He'll offer you tea. Take the tea. He's been practising the speech for a week and the tea is how you'll know he's got to the good part."`);
        return l;
      },
      choices: [
        { text: '"What\'s the job, really?"', goto: 'tower_stairs', effects: { xp: 5, bond: { crimp: 2 }, flags: { asked_crimp_job: true } } },
        { text: '"You don\'t think much of him."', goto: 'tower_stairs', effects: { xp: 5, bond: { crimp: 3 }, flags: { crimp_loyalty: true } } },
        { text: 'Let him talk. Climb the stairs.', goto: 'tower_stairs', effects: { bond: { crimp: 1 } } }
      ]
    },

    tower_stairs: {
      title: 'The Winding Stair',
      art: 'tower',
      text: (S) => {
        const l = [];
        if (S.flags.crimp_loyalty) {
          l.push(`Crimp stops on the landing. For one second the sarcasm drops clean off him like a coat.`);
          l.push(`"I've been with him four hundred years," he says. "I think a great deal of him. He just doesn't notice, and I've stopped waiting for it."`);
          l.push(`Then it's back on. "Fourth step. I did warn you."`);
        } else if (S.flags.asked_crimp_job) {
          l.push(`"The job," says Crimp, "is a pie."`);
          l.push(`You wait for the rest of it. There isn't any.`);
          l.push(`"I'm not being clever. It's a pie. He'll explain. It'll take longer than it needs to."`);
        } else {
          l.push(`The stair winds up through four hundred years of accumulated wizard: shelves, jars, a stuffed owlbear cub wearing a tiny hat, a door that hums.`);
        }
        l.push(`At the top, warm light and the smell of old paper.`);
        return l;
      },
      choices: [{ text: 'Go in.', goto: 'tyndareus', effects: {} }]
    },

    tyndareus: {
      title: 'Tyndareus the Green',
      art: 'tower',
      text: [
        `The study at the top is small, and crowded, and kind. A desk buried under bubbling potions and ink-stained scraps. A cosy chair with the shape of one man worn permanently into it.`,
        `In the chair: an ancient wizard. Long wispy white hair, milky eyes that do not quite find you on the first try, a large hooked nose. He is very old in the way that mountains are very old — not frail, just long.`,
        `"Sit, sit," says Tyndareus the Green. "Crimp — tea."`,
        `Crimp is already pouring. He was pouring before the sentence started.`
      ],
      choices: [
        { text: 'Take the tea. Let the old man get to it.', goto: 'tyndareus_tale', effects: { xp: 5, bond: { tyndareus: 2, crimp: 1 } } },
        { text: '"You could have sent a letter. Why me, and why in person?"', goto: 'tyndareus_tale', effects: { xp: 5, flags: { pressed_tyndareus: true } } }
      ]
    },

    tyndareus_tale: {
      title: 'The Wizard\'s Tale',
      art: 'tower',
      text: (S) => {
        const l = [];
        if (S.flags.pressed_tyndareus) l.push(`"Because," he says, "I am going to ask you for something foolish, and one should ask for foolish things to a person's face."`);
        l.push(`He wraps both hands round his cup and looks somewhere over your shoulder, about seventy years back.`);
        l.push(`"When I was a boy, I tasted the most wonderful treat in all the Material Plane. Grammy's Country Apple Pies."`);
        l.push(`"The bakery was near my hometown and you could smell the spices all day and night. Alas — when I went away to wizard college, the place was overrun by goblins, and no one has dared go back in since."`);
        l.push(`"I'd like to taste those heavenly pies just once more before I depart for the Celestial Plane."`);
        l.push(`He sets the cup down and finally looks straight at you.`);
        l.push(`"If I give you a map to the bakery — can you go in, and find Grammy's secret recipe for me?"`);
        return l;
      },
      choices: [
        {
          text: '"Yes." No haggling. An old man wants a taste of his childhood.',
          goto: 'the_offer_accept',
          effects: Object.assign({ xp: 10, bond: { tyndareus: 6 }, flags: { accepted_plainly: true } },
            M('accepted_quest', 'said yes to Tyndareus without haggling'))
        },
        {
          text: 'Ask what the pay is first.',
          goto: 'the_offer_haggle',
          effects: Object.assign({ xp: 5, flags: { haggled: true } },
            M('haggled', 'negotiated the price before agreeing'))
        },
        {
          text: '"Why don\'t you go yourself?"',
          goto: 'the_offer_why',
          effects: Object.assign({ xp: 5, flags: { asked_why_not_him: true } },
            M('asked_why_not_him', 'asked Tyndareus why he would not go himself'))
        },
        {
          text: '"Goblins have held it for decades. You want a recipe, or you want the building cleared?"',
          goto: 'the_offer_clear',
          effects: Object.assign({ xp: 5, flags: { offered_violence: true } },
            M('offered_to_clear', 'offered to clear the goblins out of the bakery'))
        }
      ]
    },

    the_offer_haggle: {
      title: 'Terms',
      art: 'tower',
      text: [
        `"Ah." He is not offended. If anything he looks relieved to be on solid ground. "Twenty-five gold pieces. I am rich in magic and poor in coin, I'm afraid."`,
        `"And anything of value in that bakery is yours to keep. I want the recipe. Only the recipe."`,
        `Behind him, Crimp mouths *twenty-five* at you with an expression of profound editorial comment.`
      ],
      choices: [
        { text: 'Take it. It was never about the money.', goto: 'the_offer_accept', effects: Object.assign({ xp: 5, bond: { tyndareus: 3 } }, M('accepted_quest', 'took the job for twenty-five gold and the run of the bakery')) },
        { text: 'Push for more.', goto: 'the_offer_accept', effects: Object.assign({ xp: 5, gold: 10, bond: { tyndareus: -2, crimp: 1 } }, M('pushed_for_more', 'pushed the old man up to thirty-five gold')) }
      ]
    },

    the_offer_why: {
      title: 'Why Not Him',
      art: 'tower',
      text: [
        `The milky eyes go somewhere else for a moment.`,
        `"Because I am ninety-six," he says, "and it is two days' ride, and I would not survive the disappointment of arriving to find it gone."`,
        `"Better to be told. Better to have it brought. That way the place stays as it was, in here" — he taps his temple — "which is the only place it still exists."`,
        `Crimp, refilling the pot, says nothing at all, very loudly.`
      ],
      choices: [
        { text: '"All right. I\'ll go."', goto: 'the_offer_accept', effects: Object.assign({ xp: 5, bond: { tyndareus: 5 }, flags: { knows_he_is_afraid: true } }, M('accepted_quest', 'agreed to go once Tyndareus admitted he was afraid to')) }
      ]
    },

    the_offer_clear: {
      title: 'A Different Offer',
      art: 'tower',
      text: [
        `Tyndareus waves a hand, distressed. "No, no. Goodness. No."`,
        `"They live there now. That is simply the fact of it. I want a piece of paper, not a battle." He hesitates. "Though if they will not give it up, I suppose — well. I would rather not know how it was got."`,
        `Crimp looks at you over the teapot with an expression that is suddenly not sarcastic at all.`
      ],
      choices: [
        { text: '"I\'ll do it without a fight."', goto: 'the_offer_accept', effects: Object.assign({ xp: 5, bond: { tyndareus: 4, crimp: 3 }, flags: { promised_no_fight: true } }, M('promised_no_fight', 'promised to get the recipe without a fight')) },
        { text: 'Say nothing, and take the map.', goto: 'the_offer_accept', effects: Object.assign({ xp: 5, bond: { crimp: -2 } }, M('accepted_quest', 'took the job and made no promises about how')) }
      ]
    },

    the_offer_accept: {
      title: 'The Map',
      art: 'tower',
      text: (S) => {
        const l = [];
        l.push(`The map is old and soft as cloth, folded so many times the creases have gone furry. Two days' ride, south and west, into apple country.`);
        l.push(`"Twenty-five gold on your return," says Tyndareus. "And whatever you find in there, keep. I want the recipe."`);
        if (S.bond('crimp') >= 4) l.push(`At the door, Crimp hands you your pack. "He'll wait up," he says. "He always waits up. Don't be clever about it."`);
        else l.push(`Crimp shows you out, and shuts the door behind you with great precision.`);
        return l;
      },
      onEnter: { item: 'map', flags: { has_map: true } },
      choices: [{ text: 'Ride south.', goto: 'road', effects: { xp: 5 } }]
    },

    road: {
      title: 'Two Days\' Ride',
      art: 'road',
      text: [
        `Two days of good road and bad weather, then good weather and worse road.`,
        `On the second afternoon the air changes. It goes sweet — properly sweet, the way air does near an orchard in autumn, apples going soft in the grass and nobody gathering them.`,
        `Then you come round the shoulder of a hill and there it is. A long low building of grey stone with a slate roof and a chimney like a church tower. The windows are boarded. The sign over the front door has weathered down to three letters and a painted apple.`,
        `And from the orchard beside it, quite distinctly, two voices are having a blazing row.`
      ],
      choices: [
        { text: 'Go and see who is shouting.', goto: 'orchard', effects: { xp: 5 } },
        { text: 'Ignore it. Head straight for the building.', goto: 'approach', effects: Object.assign({ flags: { skipped_trees: true } }, M('skipped_the_orchard', 'walked past the argument in the orchard without stopping')) }
      ]
    },

    /* ========================================================
       ACT TWO — THE ORCHARD
       ======================================================== */

    orchard: {
      title: 'The Argument in the Orchard',
      art: 'orchard',
      text: [
        `The orchard has not been pruned in fifty years and has taken full advantage. Grass to your waist. Apples underfoot going to cider where they lie.`,
        `Two trees are shouting at each other.`,
        `Not metaphorically. Two enormous ancient apple trees, one heavy with red fruit and one with green, have faces in their bark — knotholes for eyes, a split for a mouth — and they are bellowing, whipping their branches, and pelting one another with their own apples.`,
        `"—FORTY YEARS, ROOTILDA. FORTY YEARS AND NOT ONE WORD OF—"`,
        `"OH, *I* AM THE ONE WHO DOESN'T SPEAK, AM I—"`,
        `Neither has noticed you.`
      ],
      choices: [
        {
          text: 'Creep closer and listen before you announce yourself.',
          check: { stat: 'DEX', skill: 'stealth', dc: 13, label: 'Stealth' },
          success: { goto: 'trees_overheard', effects: { xp: 5, flags: { overheard_trees: true } } },
          fail: { goto: 'trees_caught', effects: { note: 'A twig goes off under your boot like a pistol shot.', flags: { snapped_twig: true } } }
        },
        { text: 'Walk straight up to them in plain sight.', goto: 'trees_caught', effects: { xp: 5, flags: { approached_openly: true } } },
        { text: 'Leave them to it and go to the building.', goto: 'approach', effects: Object.assign({ flags: { skipped_trees: true } }, M('skipped_the_orchard', 'left the two trees to their argument')) }
      ]
    },

    trees_overheard: {
      title: 'What the Trees Are Arguing About',
      art: 'orchard',
      text: [
        `You get within a few feet of the red one without a sound, and stand in the long grass, and listen.`,
        `It is not about anything. That is the remarkable part. Forty years ago Rootilda dropped an apple on Barktholomew during a conversation, and Barktholomew said something about it, and Rootilda said something back, and neither of them can now remember what either thing was.`,
        `"You said I was CARELESS."`,
        `"I said the APPLE was careless!"`,
        `"That is the same—"`,
        `"It is NOT the same, you enormous—"`,
        `Underneath all the shouting, they sound exhausted. They sound like two people who would very much like to stop and cannot find the door.`
      ],
      choices: [
        { text: 'Step out and tell them what you just heard.', goto: 'trees_caught', effects: { xp: 5, flags: { knows_the_grudge: true } } }
      ]
    },

    trees_caught: {
      title: 'Two Furious Trees',
      art: 'orchard',
      text: (S) => {
        const l = [];
        if (S.flags.snapped_twig) {
          l.push(`A twig goes off under your boot like a pistol shot.`);
          l.push(`Both trees stop dead. Two great knotted faces swivel round and fix on you at once.`);
        } else if (S.flags.knows_the_grudge) {
          l.push(`You stand up out of the long grass. Both trees stop dead and swivel round on you at once.`);
        } else {
          l.push(`You walk out into the open where they can both see you. Two great knotted faces swivel round and fix on you at once.`);
        }
        l.push(`"AND WHAT," says the red one, in a voice like a barn door, "IS THIS."`);
        l.push(`"A *person*," says the green one, with loathing. "Come to take the apples. They always come to take the apples."`);
        l.push(`Branches go back. Fruit is being selected. You are about to be pelted by two tons of furious orchard.`);
        return l;
      },
      choices: [
        {
          text: '"I\'m sorry." Apologise. To both of them.',
          goto: 'trees_apology',
          effects: Object.assign({ xp: 10, bond: { trees: 10 }, flags: { apologised: true } },
            M('apologised_trees', 'apologised to two feuding apple trees, and meant it'))
        },
        {
          text: 'Tell them what you overheard — that neither remembers what started it.',
          if: (S) => !!S.flags.knows_the_grudge,
          goto: 'trees_apology',
          effects: Object.assign({ xp: 10, bond: { trees: 12 }, flags: { apologised: true, named_the_grudge: true } },
            M('named_the_grudge', 'told two trees that neither of them remembered what the fight was about'))
        },
        {
          text: 'Take a side. The red one has the better case.',
          goto: 'trees_sided',
          effects: Object.assign({ xp: 5, bond: { trees: -4 }, flags: { took_a_side: true } },
            M('took_a_side', 'took Barktholomew\'s side in the orchard feud'))
        },
        {
          text: 'Draw on them.',
          goto: 'trees_threatened',
          effects: Object.assign({ xp: 5, bond: { trees: -10 }, flags: { threatened_trees: true } },
            M('threatened_trees', 'threatened the orchard trees'))
        },
        {
          text: 'Back away and leave. This is not your fight.',
          goto: 'approach',
          effects: Object.assign({ flags: { skipped_trees: true } }, M('left_the_trees', 'backed away and left the trees to it'))
        }
      ]
    },

    trees_apology: {
      title: 'Nobody Apologises to Trees',
      art: 'orchard',
      text: (S) => {
        const l = [];
        l.push(`You put your hands where they can be seen and you say it plainly. That you're sorry. For coming into their orchard unasked, for listening, for the twig — for all of it.`);
        if (S.flags.named_the_grudge) l.push(`And then you tell them what you heard. That forty years ago there was an apple, and a word about the apple, and that neither of them can now say what the word was.`);
        l.push(`The silence goes on for a long time.`);
        l.push(`Nobody apologises to trees. Nobody has ever apologised to these trees. People come with baskets and ladders and, on two memorable occasions, an axe. Nobody has ever stood in the grass and said sorry.`);
        l.push(`"...Oh," says Rootilda, in a much smaller voice.`);
        l.push(`Barktholomew makes a sound like a door settling. "Well," he says. "Well. Yes. Quite."`);
        l.push(`The branches come down. And then, with tremendous awkwardness, each of them reaches out and offers you something.`);
        l.push(`Barktholomew gives you **one red apple.** Rootilda gives you **one green apple.**`);
        l.push(`They are the best apples you have ever seen.`);
        return l;
      },
      onEnter: { item: 'red_apple', flags: { has_apples: true } },
      choices: [
        {
          text: 'Take both, with thanks.',
          goto: 'trees_gift',
          effects: Object.assign({ xp: 10, item: 'green_apple', bond: { trees: 5 }, flags: { took_both_apples: true } },
            M('tree_apples', 'was given an apple by each of the two arguing trees'))
        },
        {
          text: 'Take them — and ask the trees to make it up with each other.',
          goto: 'trees_reconciled',
          effects: Object.assign({ xp: 10, item: 'green_apple', bond: { trees: 10 }, flags: { took_both_apples: true, reconciled_trees: true } },
            M('reconciled_trees', 'talked Barktholomew and Rootilda into ending a forty-year feud'))
        }
      ]
    },

    trees_reconciled: {
      title: 'Forty Years',
      art: 'orchard',
      text: [
        `"You've been shouting at each other for forty years," you say, "about an apple neither of you can remember. You're the only two people here. Don't you get tired?"`,
        `Barktholomew and Rootilda look at each other for the first time in some while.`,
        `"...I may," says Barktholomew, with enormous difficulty, "have been somewhat sharp. At the time."`,
        `"I dropped it on your head," says Rootilda. "I did actually drop it on your head."`,
        `"You did."`,
        `"I'm sorry about that."`,
        `And that, apparently, is that. Two ancient trees lean very slightly toward one another, branches not quite touching, in the manner of two people who are not going to make a fuss about it.`,
        `"Go on then," says Barktholomew gruffly. "The goblins have the place. Mind yourself. They're not wicked, they're just *useless*."`
      ],
      choices: [{ text: 'Go to the bakery.', goto: 'trees_gift', effects: { xp: 5, flags: { trees_told_about_goblins: true } } }]
    },

    trees_gift: {
      title: 'Two Apples',
      art: 'orchard',
      text: (S) => {
        const l = [];
        l.push(`One red apple. One green apple. You put them in your pack where they will not bruise.`);
        if (S.flags.trees_told_about_goblins) l.push(`Rootilda calls after you: "And if the small one in the cooking pot offers you anything — take it. He means it."`);
        l.push(`The bakery is fifty yards off across the long grass, grey and shut and waiting.`);
        return l;
      },
      choices: [{ text: 'Cross to the bakery.', goto: 'approach', effects: {} }]
    },

    trees_sided: {
      title: 'Choosing Sides',
      art: 'orchard',
      text: [
        `You tell them, reasonably, that the red one seems to have the right of it.`,
        `This is a catastrophe.`,
        `Barktholomew swells with vindication. Rootilda goes absolutely silent, which is far worse than the shouting, and turns her whole crown away from you both.`,
        `"There," says Barktholomew. "THERE. You see." He does not sound happy. He sounds like a man who has won an argument and lost something else.`,
        `An apple hits you on the shoulder. It's from Barktholomew. He's not looking at you.`,
        `"...Take it and go," he says. "Go on."`
      ],
      onEnter: { item: 'red_apple' },
      choices: [{ text: 'Take the red apple and go.', goto: 'approach', effects: { flags: { has_apples: true, one_apple_only: true } } }]
    },

    trees_threatened: {
      title: 'Bark',
      art: 'orchard',
      text: [
        `You put a hand on your weapon and tell two ancient living trees exactly what will happen if they throw anything.`,
        `They believe you. That is the trouble.`,
        `The branches come down. The faces smooth out of the bark until there is nothing there but knotholes, and two very ordinary apple trees stand in the long grass in total silence, and will not look at you, and will not speak again.`,
        `You have won. You feel about it the way you'd expect.`
      ],
      choices: [{ text: 'Go to the bakery.', goto: 'approach', effects: { flags: { trees_silenced: true } } }]
    },

    /* ========================================================
       ACT THREE — THE DOOR
       ======================================================== */

    approach: {
      title: 'Three Ways In',
      art: 'bakery',
      text: (S) => {
        const l = [];
        l.push(`Up close the bakery is bigger than it looked. Grey stone, slate roof, that enormous chimney. Somebody has patched a window with a board and the patch is recent.`);
        l.push(`There is smoke coming out of the chimney.`);
        l.push(`You can see three ways in. A back door, well used, with a path worn to it through the grass. A loading dock round the side, shuttered, quiet, and obviously the sneaky way. And the front door — big, wooden, studded, facing the road like a dare.`);
        if (S.flags.skipped_trees) l.push(`Behind you the orchard is still arguing with itself.`);
        return l;
      },
      choices: [
        {
          text: 'The front door. Walk up and knock like a person.',
          goto: 'front_door',
          effects: Object.assign({ xp: 10, flags: { front_door: true } },
            M('front_door', 'walked up to the front door of a goblin-held building and knocked'))
        },
        {
          text: 'The loading dock. Get inside without being seen.',
          check: { stat: 'DEX', skill: 'stealth', dc: 13, label: 'Stealth' },
          success: { goto: 'dock_inside', effects: Object.assign({ xp: 5, flags: { snuck_in: true } }, M('snuck_in', 'slipped into the bakery through the loading dock')) },
          fail: { goto: 'dock_caught', effects: { note: 'The shutter is old and it screams.', flags: { caught_sneaking: true } } }
        },
        {
          text: 'The back door — the one they actually use.',
          goto: 'back_door',
          effects: Object.assign({ xp: 5, flags: { back_door: true } }, M('back_door', 'went in by the goblins\' own back door'))
        },
        {
          text: 'Wait for dark and scout the patrols first.',
          goto: 'wait_for_dark',
          effects: Object.assign({ xp: 5, flags: { waited: true } }, M('waited_for_dark', 'waited for dark and scouted before going in'))
        }
      ]
    },

    wait_for_dark: {
      title: 'Until Dark',
      art: 'bakery',
      text: [
        `You lie up in the long grass until the light goes, and you watch.`,
        `What you learn, over four cold hours, is this: there are perhaps a dozen goblins in there. They come out to the waste heap and back. Nobody patrols. Nobody watches the road. There are no sentries because it has not occurred to anyone here that they might need sentries.`,
        `At one point two of them come out to argue about something in a wheelbarrow, and one is wearing a cooking pot on its head, and they go back in still arguing.`,
        `At around midnight a light goes on in a downstairs window, and stays on, and you can hear — faintly — somebody inside singing tunelessly while they work.`,
        `This is not a fortress. This is a house with people in it.`
      ],
      choices: [
        { text: 'Then go to the front door in the morning, like a person.', goto: 'front_door', effects: Object.assign({ xp: 10, flags: { front_door: true, knows_they_are_harmless: true } }, M('front_door', 'watched all night, then knocked at the front door in the morning')) },
        { text: 'Use the dark. Go in the loading dock now.', goto: 'dock_inside', effects: Object.assign({ xp: 5, flags: { snuck_in: true } }, M('snuck_in', 'used the darkness to slip in through the loading dock')) }
      ]
    },

    front_door: {
      title: 'The Front Door',
      art: 'bakery',
      text: [
        `You walk up the path to the front door of a building that a dozen goblins have held for forty years, and you knock on it.`,
        `There is a very long pause.`,
        `Then a scraping, and a thump, and some frantic whispering, and the door hauls inward about a foot — and stops, because the goblin opening it has frozen solid at the sight of you.`,
        `It is not a warrior. It is wearing an apron. There is flour to its elbows.`,
        `Behind it, three more crowd into the gap, and their hands go to their belts — a cleaver, a mallet, something that might once have been a scimitar and is now mostly rust.`,
        `Nobody has knocked on this door in forty years.`
      ],
      choices: [
        {
          text: 'Raise both hands, empty. "I come here to buy a recipe book."',
          check: { stat: 'CHA', skill: 'persuasion', dc: 12, label: 'Persuasion' },
          success: { goto: 'the_apple', effects: Object.assign({ xp: 10, bond: { goblins: 6 }, flags: { said_the_line: true } }, M('buy_recipe_book', 'told a doorway full of armed goblins: "I come here to buy a recipe book"')) },
          fail: { goto: 'the_line_fumbled', effects: { note: 'It comes out sideways. But it comes out.', flags: { said_the_line: true } } }
        },
        {
          text: '"I\'m here for the recipe. Hand it over and nobody has a bad afternoon."',
          goto: 'door_threat',
          effects: Object.assign({ xp: 5, bond: { goblins: -6 }, flags: { threatened_door: true } }, M('threatened_at_the_door', 'demanded the recipe at the door with a threat behind it'))
        },
        {
          text: 'Offer gold for the recipe book.',
          goto: 'door_gold',
          effects: Object.assign({ xp: 5, flags: { offered_gold: true } }, M('offered_gold', 'offered the goblins money for the recipe'))
        },
        {
          text: 'Give them the apples the trees gave you.',
          if: (S) => !!S.flags.has_apples,
          goto: 'door_apples',
          effects: Object.assign({ xp: 10, bond: { goblins: 8 }, flags: { gave_apples_away: true } }, M('gave_the_apples', 'offered the orchard\'s own apples to the goblins at the door'))
        }
      ]
    },

    the_line_fumbled: {
      title: 'Said Sideways',
      art: 'bakery',
      text: [
        `"I come here," you say, "to buy — a recipe book."`,
        `It lands badly. Your voice does something unhelpful in the middle of it. One of the goblins at the back says, "*What?*"`,
        `"A recipe book," you say again. "I want to buy one."`,
        `There is a silence of a kind you have never personally caused before.`,
        `And then the one in the apron lowers the cleaver about four inches, entirely on its own, because whatever it was braced for, it was not this.`,
        `"...You what," it says.`
      ],
      choices: [{ text: 'Say it a third time. Mean it.', goto: 'the_apple', effects: { xp: 5, bond: { goblins: 4 } } }]
    },

    the_apple: {
      title: 'The Apple',
      art: 'bakery',
      text: (S) => {
        const l = [];
        l.push(`The goblins look at each other. Something passes between them that you are not party to.`);
        l.push(`Weapons go down — not away, down. The one in the apron steps back and, after some rummaging in a pocket, holds out **a red apple** at arm's length.`);
        l.push(`It is not a gift. It is not a threat either. It is a test, and an olive branch, and a handshake, all at once, and every one of them is watching to see what you do with it.`);
        if (S.flags.has_apples) l.push(`You are, at this moment, carrying two apples given to you by the trees these ones came off.`);
        return l;
      },
      choices: [
        {
          text: 'Take it. Take a bite.',
          goto: 'the_apple_taken',
          effects: Object.assign({ xp: 10, bond: { goblins: 8 }, flags: { took_the_apple: true } },
            M('apple_exchange', 'took the apple a goblin offered, and ate it in front of them'))
        },
        {
          text: 'Take it — and hand back one of the trees\' apples in exchange.',
          if: (S) => !!S.flags.has_apples,
          goto: 'the_apple_traded',
          effects: Object.assign({ xp: 15, bond: { goblins: 12, trees: 2 }, flags: { took_the_apple: true, traded_apples: true } },
            M('traded_apples', 'traded an apple with the goblins at the door, one for one'))
        },
        {
          text: 'Refuse it politely. You didn\'t come to eat.',
          goto: 'the_apple_refused',
          effects: Object.assign({ xp: 5, bond: { goblins: -4 } }, M('refused_the_apple', 'refused the apple the goblins offered'))
        }
      ]
    },

    the_apple_taken: {
      title: 'A Handshake, Across the Species Line',
      art: 'bakery',
      text: [
        `You take the apple and you bite it, standing in the doorway, in front of all of them.`,
        `It is a very good apple.`,
        `Something in the corridor relaxes all at once, like a held breath going out. The rusty scimitar goes back in its belt. Somebody at the back says something in Goblin and somebody else hits them.`,
        `"He's here about *baking*," says the one in the apron, to the others, in a tone of absolute disbelief.`,
        `Then, to you, standing aside: "You'd better come and see the chief."`
      ],
      choices: [{ text: 'Go in.', goto: 'grubnash', effects: { xp: 5, flags: { invited_in: true } } }]
    },

    the_apple_traded: {
      title: 'One for One',
      art: 'bakery',
      text: [
        `You take their apple. And then you go into your pack and you bring out one of the trees' apples — the red one, huge and perfect and faintly ridiculous — and you hold it out in exchange.`,
        `The goblin in the apron looks at it. Then at you. Then at the apple again.`,
        `"That's off Barktholomew," it says, in a hushed voice. "He don't give those to *no one*. He throws those."`,
        `"He gave it to me."`,
        `"...What did you do?"`,
        `"I said sorry."`,
        `The goblin takes the apple in both hands like it is being handed a crown, and turns round, and says something to the others in Goblin that makes all four of them look at you completely differently.`,
        `"Come on," it says. "Chief'll want to see you. Chief'll *definitely* want to see you."`
      ],
      choices: [{ text: 'Go in.', goto: 'grubnash', effects: { xp: 5, flags: { invited_in: true, impressed_the_door: true } } }]
    },

    the_apple_refused: {
      title: 'Declined',
      art: 'bakery',
      text: [
        `You tell them, politely, that you didn't come here to eat.`,
        `The apple hangs in the air between you for a second longer than is comfortable. Then it goes back in the pocket.`,
        `"Right," says the one in the apron. The warmth is gone out of it. "Right. Well. Chief's this way, then."`,
        `You have no idea what you just turned down. They all do.`
      ],
      choices: [{ text: 'Follow them in.', goto: 'grubnash', effects: { flags: { invited_in: true, cold_start: true } } }]
    },

    door_threat: {
      title: 'The Hard Way',
      art: 'bakery',
      text: [
        `You tell them what you want and you let them hear the rest of it underneath.`,
        `It works, in the sense that nobody attacks you. The door opens the rest of the way. They take you to the chief because they cannot think what else to do with you.`,
        `But they go in front of you and behind you and nobody turns their back, and the one in the apron keeps its hand on the cleaver the whole way, and every goblin you pass stops what it is doing and watches you go by.`,
        `You have been let in. You have not been welcomed.`
      ],
      choices: [{ text: 'Go to the chief.', goto: 'grubnash', effects: { flags: { invited_in: true, cold_start: true, came_in_hard: true } } }]
    },

    door_gold: {
      title: 'Coin',
      art: 'bakery',
      text: [
        `You offer money. A fair price, cash, for one old book.`,
        `The goblin in the apron looks at the coin in your hand with an expression you cannot read at all.`,
        `"We're not *selling* it," it says. Not offended — baffled. "What would we do with that? There's no one to buy anything off. There's no *shops*."`,
        `It thinks about this for a moment.`,
        `"You could come and see the chief," it offers, in the end. "He likes visitors. We don't get any."`
      ],
      choices: [{ text: 'Go and see the chief.', goto: 'grubnash', effects: { xp: 5, flags: { invited_in: true } } }]
    },

    door_apples: {
      title: 'A Gift First',
      art: 'bakery',
      text: [
        `Before anyone can decide what to do about the weapons, you take out the two apples — the red and the green, enormous, perfect — and hold them out.`,
        `The effect is instant and total.`,
        `"That's Barktholomew's," breathes one. "And that's Rootilda's. Off the *trees*. They don't— how did you—"`,
        `"They gave them to me."`,
        `Four goblins stare at you in the doorway of a building nobody has knocked on in forty years.`,
        `"You'd better come in," says the one in the apron, faintly. "You'd better come in and tell the chief that exact sentence."`
      ],
      choices: [{ text: 'Go in.', goto: 'grubnash', effects: { xp: 10, bond: { goblins: 4 }, flags: { invited_in: true, impressed_the_door: true } } }]
    },

    dock_inside: {
      title: 'In Through the Dock',
      art: 'dock',
      text: [
        `The shutter lifts a foot and a half and you go under it on your back, and you are inside Grammy's Bakery.`,
        `It is warm. That is the first surprise. It is warm and it smells of woodsmoke and burnt sugar and, underneath everything, of apples.`,
        `You are in a storeroom. Sacks of flour, most of them empty. A shelf of butter crocks stacked in a careful pyramid. Somebody has swept this floor. Recently.`,
        `Through the door ahead you can hear voices — a lot of them — and the clatter of a kitchen in use, and somebody counting aloud in Goblin, patiently, over and over, as though getting it wrong each time.`
      ],
      choices: [
        { text: 'Go through and show yourself.', goto: 'dock_reveal', effects: Object.assign({ xp: 5, flags: { chose_to_reveal: true } }, M('showed_yourself', 'crept in, then chose to walk out and be seen')) },
        { text: 'Keep out of sight and find the office.', goto: 'dock_sneak_on', effects: Object.assign({ xp: 5, flags: { staying_hidden: true } }, M('stayed_hidden', 'stayed hidden inside the bakery and went looking for the office')) }
      ]
    },

    dock_reveal: {
      title: 'Coming Out',
      art: 'floor',
      text: [
        `You push the door open and walk out into the middle of Grammy's bakery floor with your hands where they can be seen.`,
        `About nine goblins stop what they are doing at once. A bowl drops. Somebody screams, briefly, and is shushed.`,
        `"I came in the back," you say. "I should have knocked. I'm here about the recipe."`,
        `A long, appalled silence.`,
        `Then a voice from the far end, over the top of all of them: "Well don't just *stand* there, you're in the way of the benches. Come here where I can see you."`
      ],
      choices: [{ text: 'Go and see who said that.', goto: 'grubnash', effects: { xp: 5, flags: { invited_in: true } } }]
    },

    dock_sneak_on: {
      title: 'Along the Wall',
      art: 'floor',
      text: [
        `You go along the storeroom wall and get your eye to the crack of the door, and what you see stops you.`,
        `It is not a camp. It is a working bakery — badly. Nine or ten goblins at the long marble benches, every one of them covered in flour, every one of them busy. A small one guarding a bowl of butter with visible anxiety. A lanky one moving down the row with a clipboard, counting.`,
        `At the far end, a goblin in a chef's hat and an apron, with a necklace of measuring spoons, is holding a lump of dough up to the light and turning it over with an expression of complete despair.`,
        `They are trying to bake. They are trying very hard, and they are very bad at it, and nobody is laughing at anybody.`,
        `The office door is across the room. There is no way to it that does not go straight through all of them.`
      ],
      choices: [
        { text: 'Walk out and talk to them.', goto: 'dock_reveal', effects: Object.assign({ xp: 5, flags: { chose_to_reveal: true } }, M('showed_yourself', 'watched the goblins trying to bake, and decided to walk out and talk')) },
        { text: 'Wait for a gap and cross anyway.', check: { stat: 'DEX', skill: 'stealth', dc: 15, label: 'Stealth' },
          success: { goto: 'office_alone', effects: Object.assign({ xp: 5, flags: { reached_office_alone: true } }, M('crossed_unseen', 'crossed the bakery floor unseen')) },
          fail: { goto: 'dock_caught_inside', effects: { note: 'Halfway across, the small one with the butter looks up.' } } }
      ]
    },

    dock_caught: {
      title: 'The Shutter Screams',
      art: 'dock',
      text: [
        `The shutter is old and swollen and it goes up with a shriek that you feel in your teeth.`,
        `Inside, everything stops. Then everything starts at once — shouting, running, the bang of a dropped tray.`,
        `By the time you are upright in the storeroom there are five goblins in the doorway with kitchen implements held like weapons, and behind them more coming, and they are not attacking. They have put themselves between you and the rest of the building.`,
        `They are terrified. Every single one of them is terrified, and standing there anyway.`
      ],
      choices: [
        { text: 'Hands up. "I\'m sorry. I should have knocked."', goto: 'dock_apology', effects: Object.assign({ xp: 10, bond: { goblins: 6 } }, M('apologised_for_sneaking', 'apologised to the goblins for breaking in')) },
        { text: 'Hands up, but say nothing. Let them decide.', goto: 'dock_reveal', effects: { xp: 5 } },
        { text: 'Draw.', goto: 'dock_violence', effects: Object.assign({ xp: 5, bond: { goblins: -12 }, flags: { drew_on_them: true } }, M('drew_on_the_goblins', 'drew a weapon on the goblins in their own kitchen')) }
      ]
    },

    dock_caught_inside: {
      title: 'The Small One Looks Up',
      art: 'floor',
      text: [
        `Halfway across the open floor, the small one guarding the butter looks up.`,
        `It does not shout. It just looks at you — a long, level, unsurprised look — and then, very deliberately, it looks over at the goblin in the chef's hat, and back at you, and waits.`,
        `It is giving you the chance to speak first. You have no idea why.`
      ],
      choices: [
        { text: 'Take the chance. Say who you are and why you came.', goto: 'dock_reveal', effects: Object.assign({ xp: 10, bond: { nib: 6 } }, M('nib_gave_you_the_chance', 'was given a chance to speak first by a small goblin guarding the butter')) },
        { text: 'Run for the office door.', goto: 'office_alone', effects: Object.assign({ xp: 5, bond: { nib: -6, goblins: -6 } }, M('ran_for_the_office', 'ran for the office while the goblins watched')) }
      ]
    },

    dock_apology: {
      title: '"I Should Have Knocked"',
      art: 'dock',
      text: [
        `You put your hands up and you apologise to a room full of terrified goblins for coming in through their back window.`,
        `Nobody moves for a second. Then the crowd in the doorway parts, not because anyone ordered it, but because somebody is coming through — a goblin in a chef's hat with a necklace of measuring spoons and flour up to the elbows, wiping its hands on an apron.`,
        `It looks at you. It looks at the shutter. It looks back at you.`,
        `"You *should* have knocked," it agrees. "Forty years. Not one knock." It sighs. "Well. You're in now. What do you want?"`
      ],
      choices: [{ text: 'Tell him the truth.', goto: 'grubnash', effects: { xp: 5, flags: { invited_in: true } } }]
    },

    dock_violence: {
      title: 'The Wrong Turn',
      art: 'dock',
      text: [
        `You draw.`,
        `Nobody in that doorway is a fighter. They scatter — genuinely scatter, shoving each other out of the way, one of them tripping over a flour sack and going down hard and being dragged up by two others.`,
        `A cleaver clatters on the floor where somebody dropped it running.`,
        `And then the room is empty and echoing, and you are standing alone in a warm kitchen with a weapon out, listening to a dozen people barricade a door somewhere deeper in the building.`,
        `You can hear one of them crying.`
      ],
      choices: [
        { text: 'Put it away. Call out that you won\'t hurt anyone.', goto: 'dock_apology', effects: Object.assign({ xp: 5, bond: { goblins: 2 }, flags: { put_it_away: true } }, M('put_the_weapon_away', 'put the weapon away and called out an apology')) },
        { text: 'Go and find the office while they hide.', goto: 'office_alone', effects: Object.assign({ bond: { goblins: -8 }, flags: { hunting_alone: true } }, M('searched_while_they_hid', 'searched the bakery while the goblins hid from you')) }
      ]
    },

    back_door: {
      title: 'The Back Door',
      art: 'bakery',
      text: [
        `You take the path they use, round to the back, and you find the door standing half open with a broom propped against it.`,
        `Two goblins are sitting on the step shelling something into a bucket. They look up.`,
        `There is a pause of roughly the length it takes to decide whether to scream.`,
        `"...You're not a goblin," says one.`,
        `"No."`,
        `"Right." It puts the bucket down very carefully. "Right. Um. GRUBNASH! THERE'S A PERSON!"`
      ],
      choices: [{ text: 'Wait politely to be shouted about.', goto: 'grubnash', effects: { xp: 5, bond: { goblins: 3 }, flags: { invited_in: true } } }]
    },

    office_alone: {
      title: 'Grammy\'s Office, Alone',
      art: 'office',
      text: [
        `You get the office door shut behind you and you are alone in a small dusty room that has not changed in forty years.`,
        `A desk. A chair. A shelf of ledgers. And on the shelf above it, unmistakable, a fat book bound in green cloth with a faded apple stamped on the spine.`,
        `**Grammy's recipe book.** Right there. You could be out of the window with it in ninety seconds.`,
        `Behind you, through the door, you can hear the goblins. Not searching for you. Working. Somebody is counting aloud, patiently, getting it wrong, starting again.`,
        `And the room is cold in a way the rest of the building is not, and you have the very distinct feeling of being looked at.`
      ],
      choices: [
        { text: 'Take the book and go. The job is the job.', goto: 'heist_ending', effects: Object.assign({ xp: 5, flags: { stole_the_book: true } }, M('stole_the_book', 'took Grammy\'s recipe book off the shelf and left')) },
        { text: 'Put it down. Go and talk to them.', goto: 'dock_reveal', effects: Object.assign({ xp: 10, flags: { put_the_book_back: true } }, M('put_the_book_back', 'had the recipe book in hand, and put it back')) }
      ]
    },

    /* ========================================================
       ACT FOUR — THE CREW
       ======================================================== */

    grubnash: {
      title: 'Chief Grubnash',
      art: 'floor',
      text: (S) => {
        const l = [];
        l.push(`They take you through to the bakery floor, and it is enormous — long marble benches, flour ground into every seam of the stone, a ceiling lost in shadow and rafters.`);
        l.push(`And at the head of it, waiting for you, is the chief of the goblins.`);
        l.push(`He is wearing a flour-stained apron and a chef's hat. Around his neck, on a thong, hangs a necklace of measuring spoons. In one hand he carries a wooden spoon the way other chiefs carry a sceptre — and, you realise, for exactly the same reason.`);
        l.push(`This is not a warlord. This is **Chief Grubnash**, and he is a baker without a clue, and he is looking at you with the deep suspicion of a man who has been embarrassed before.`);
        if (S.flags.impressed_the_door) l.push(`One of the door-goblins is already whispering in his ear. His eyebrows are climbing.`);
        if (S.flags.came_in_hard) l.push(`Nobody has taken their hand off anything. The room is very quiet.`);
        l.push(`"Right then," says Grubnash. "You're here about a book."`);
        return l;
      },
      choices: [
        {
          text: '"I want to learn how to bake Grammy\'s pie."',
          goto: 'grubnash_wants_to_learn',
          effects: Object.assign({ xp: 15, bond: { grubnash: 12, goblins: 6 }, flags: { wants_to_bake: true } },
            M('wants_to_bake', 'told Chief Grubnash: "I want to learn how to bake Grammy\'s pie"'))
        },
        {
          text: '"I need the recipe. I\'ll pay, or I\'ll work for it — your choice."',
          goto: 'grubnash_deal',
          effects: Object.assign({ xp: 10, bond: { grubnash: 4 }, flags: { offered_a_deal: true } },
            M('offered_a_deal', 'offered Grubnash a straight deal for the recipe'))
        },
        {
          text: '"Hand over the book and I\'ll be gone by dark."',
          goto: 'grubnash_demand',
          effects: Object.assign({ xp: 5, bond: { grubnash: -8 }, flags: { demanded: true } },
            M('demanded_the_book', 'demanded the recipe book from Chief Grubnash'))
        },
        {
          text: 'Ask him what *he* has been trying to do here.',
          goto: 'grubnash_asked',
          effects: Object.assign({ xp: 10, bond: { grubnash: 10 }, flags: { asked_grubnash_first: true } },
            M('asked_grubnash_first', 'asked Grubnash what the goblins had been trying to do before asking for anything'))
        }
      ]
    },

    grubnash_asked: {
      title: 'What They Have Been Trying To Do',
      art: 'floor',
      text: [
        `You don't ask for the book. You ask him what they've been doing here, for forty years, in a bakery.`,
        `Grubnash opens his mouth. Shuts it. Puts the wooden spoon down on the bench, which from him is an enormous gesture.`,
        `"Baking," he says. "Trying to. We've been trying to."`,
        `He gestures at the room — the benches, the flour, ten goblins pretending very hard not to listen.`,
        `"We came in here in the winter because it was warm. And there was the book, and the Oven, and all the *things*, and we thought — well. How hard can it be." He laughs, once, without much in it. "Forty years. We've done thousands. Thousands of pies. Every one of them wrong."`,
        `"Wrong how?"`,
        `"Wrong," he says, "like they're sad. Can't explain it better than that. You eat one and you feel *worse*."`
      ],
      choices: [
        { text: '"Then let me learn it with you."', goto: 'grubnash_wants_to_learn', effects: Object.assign({ xp: 15, bond: { grubnash: 12, goblins: 6 }, flags: { wants_to_bake: true } }, M('wants_to_bake', 'having heard the whole story, asked to learn to bake Grammy\'s pie with them')) },
        { text: '"I might be able to help. But I do need the recipe."', goto: 'grubnash_deal', effects: Object.assign({ xp: 10, bond: { grubnash: 5 } }, M('offered_a_deal', 'offered to help in exchange for the recipe')) }
      ]
    },

    grubnash_wants_to_learn: {
      title: '"Learn?"',
      art: 'floor',
      text: [
        `Grubnash's eyes go very wide.`,
        `"*Learn?*" he says. "To— to *bake*? Grammy's?"`,
        `"Yes."`,
        `"With *us*?"`,
        `"With you."`,
        `The wooden spoon comes up and points at you, wavering slightly.`,
        `"Everybody who comes here," says Grubnash, "comes to get us *out*. Forty years. Every one of them. And you've come to—" He stops. He has to stop. He turns round and says something to the room in Goblin, loudly, and ten goblins make a sound you will remember for the rest of your life.`,
        `When he turns back his eyes are wet and he is pretending furiously that they are not.`,
        `"Right," he says. "RIGHT. Well. You'd best meet the crew."`
      ],
      choices: [{ text: 'Meet the crew.', goto: 'crew', effects: { xp: 10, bond: { grubnash: 6 }, flags: { allied_with_grubnash: true } } }]
    },

    grubnash_deal: {
      title: 'A Deal',
      art: 'floor',
      text: [
        `Grubnash considers you for a long moment, turning the wooden spoon over in his hands.`,
        `"A deal," he says. "All right. I like a deal. Here's mine."`,
        `"That book's no good to us. Forty years we've had it and every pie comes out wrong. So you can have your recipe — *after* you help us make one that isn't."`,
        `He points the spoon at you.`,
        `"One good pie. Out of that oven. Then you can copy whatever you like and go home to your wizard."`
      ],
      choices: [{ text: '"Deal."', goto: 'crew', effects: Object.assign({ xp: 10, bond: { grubnash: 6 }, flags: { allied_with_grubnash: true, struck_deal: true } }, M('struck_the_deal', 'agreed to bake one good pie before taking the recipe')) }]
    },

    grubnash_demand: {
      title: 'The Spoon Comes Down',
      art: 'floor',
      text: [
        `Grubnash listens to you demand the book. Then he puts the wooden spoon down on the bench, very gently, and the sound it makes is louder than shouting.`,
        `"No," he says.`,
        `The room has gone absolutely still.`,
        `"You can take it off me. I know that. Look at you and look at me. But you'll be taking it, and you'll know you took it, and so will everyone in this room." He folds his arms. "Or you can ask me properly, like a person, and we can talk about what it's *for*."`,
        `He waits. Ten goblins wait. Somewhere at the back of the building, something enormous shifts, and a little flour comes down out of the rafters.`
      ],
      choices: [
        { text: 'Ask him properly. "I want to learn how to bake Grammy\'s pie."', goto: 'grubnash_wants_to_learn', effects: Object.assign({ xp: 15, bond: { grubnash: 10, goblins: 4 }, flags: { wants_to_bake: true, backed_down: true } }, M('wants_to_bake', 'backed down, asked properly, and said: "I want to learn how to bake Grammy\'s pie"')) },
        { text: 'Take it off him.', goto: 'heist_ending', effects: Object.assign({ bond: { grubnash: -20, goblins: -20 }, flags: { took_it_by_force: true } }, M('took_it_by_force', 'took Grammy\'s recipe book from Grubnash by force')) }
      ]
    }
  };

  TDM.EP1_SCENES_A = scenes;
})();
