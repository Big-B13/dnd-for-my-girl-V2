/* ============================================================
   TALES OF THE DM — Episode 1 : "The Kinder Road"
   ------------------------------------------------------------
   An expansion patch for ep1_apple_pie, built from the way the
   adventure was ACTUALLY played at the table (see
   uploads/perry-grammys-apple-pie-full-story.txt).

   It adds, without removing anything:
     · Barktholomew & Rootilda, the two arguing apple trees
     · THE OVEN — sentient, ancient, speaks in single words
     · Grammy Smithwick's spirit and her three questions
     · The three baking trials (organise / magic / song)
     · The tower finale: what you do with the recipe, and who
       gets the first slice

   Loaded AFTER episode1.js; it merges new scenes in and rewires
   a handful of existing choices to reach them.
   ============================================================ */
(function () {
  const TDM = (typeof window !== 'undefined')
    ? (window.TDM = window.TDM || {})
    : (global.TDM = global.TDM || {});

  const ep = TDM.EPISODES && TDM.EPISODES.ep1_apple_pie;
  if (!ep) return;
  const S_ = ep.scenes;

  /* ------------------------------------------------------------------
     NEW SCENES
     ------------------------------------------------------------------ */
  const ADD = {

    /* ============== THE ARGUING TREES ============== */
    trees_argue: {
      title: 'The Argument in the Orchard',
      art: 'orchard',
      text: [
        `You hear them long before you see them, and what you hear is this:`,
        `"—PUT IT BACK." "I DID NOT TAKE IT." "YOU HAVE HAD IT SINCE THE FROST." "THAT WAS NINETY YEARS AGO, ROOTILDA."`,
        `Two enormous apple trees stand about twenty feet apart, and they are shouting. One is heavy with red fruit, knotted and broad-shouldered. The other is green-appled, taller, and leaning forward in the manner of someone who has been waiting three centuries to finish a sentence.`,
        `Branches whip. Apples fly. Neither has noticed you at all.`
      ],
      choices: [
        { text: 'Creep closer and listen before they see you.',
          check: { stat: 'DEX', skill: 'stealth', dc: 13, label: 'Stealth',
            advIf: [{ cls: 'rogue' }, { race: 'halfling' }, { origin: 'urchin' }] },
          success: { goto: 'trees_overheard', effects: { xp: 40, flags: { heard_tree_feud: true } } },
          fail: { goto: 'trees_spotted', effects: {} } },
        { text: 'Walk up in the open and wait to be noticed.', goto: 'trees_spotted', effects: {} },
        { text: 'Leave them to it. This is not your argument.',
          goto: 'orchard_hub',
          effects: { flags: { declined_trees: true },
            chronicle: 'walked past the arguing trees without a word', remember: false } }
      ]
    },

    trees_overheard: {
      title: 'What the Trees Are Actually Arguing About',
      art: 'orchard',
      text: [
        `You get close enough to hear the shape of it, and the shape of it is heartbreaking.`,
        `They are not arguing about a theft. They are arguing about a woman. Grammy used to take one red apple and one green apple, every single morning, for the same pie. Since she stopped coming, each tree has decided the other must have done something to drive her away.`,
        `"She liked yours better," the red tree says, very quietly, in a lull.`,
        `"She liked them TOGETHER, you enormous idiot," says the green one. And then, smaller: "She liked them together."`
      ],
      choices: [
        { text: 'Step out and tell them what happened to Grammy.',
          goto: 'trees_truth', effects: { flags: { told_trees_truth: true }, xp: 50 } },
        { text: 'Step out and apologise for eavesdropping.',
          goto: 'trees_apology', effects: {} },
        { text: 'Slip away. Some grief is private.',
          goto: 'orchard_hub', effects: { chronicle: 'left the trees to their grief', remember: true } }
      ]
    },

    trees_spotted: {
      title: 'Two Hundred Years of Bark, Staring',
      art: 'orchard',
      text: [
        `A twig goes off under your heel like a dropped plate.`,
        `Both trees stop mid-syllable. Two ancient bark-faces swivel — slowly, with the terrible patience of things that measure time in seasons — and fix on you.`,
        `"AND WHO," says the red one, "IS THIS."`,
        `An apple the size of your fist thumps into the grass a hand's width from your boot. It was not a warning shot. It was a bad shot.`
      ],
      choices: [
        { text: 'Apologise. To both of them. Sincerely.',
          goto: 'trees_apology', effects: { flags: { apologised_to_trees: true } } },
        { text: 'Take a side — tell the red tree it is in the right.',
          goto: 'trees_took_side', effects: { flags: { took_tree_side: 'red' } } },
        { text: 'Take a side — tell the green tree it is in the right.',
          goto: 'trees_took_side', effects: { flags: { took_tree_side: 'green' } } },
        { text: 'Throw the apple back.',
          goto: 'trees_offended2', effects: { flags: { threw_apple: true }, chronicle: 'threw an apple back at a three-hundred-year-old tree', remember: true } },
        { text: 'Threaten them. You are armed and they are firewood.',
          goto: 'trees_threatened', effects: { flags: { threatened_trees: true }, chronicle: 'threatened the orchard trees', remember: true } },
        { text: 'Draw and put a round through a branch, just to be heard.',
          reqTag: 'gunslinger',
          goto: 'trees_gunshot', effects: { flags: { fired_at_trees: true }, chronicle: 'fired a revolver into Barktholomew\'s branches to end an argument', remember: true } }
      ]
    },

    trees_apology: {
      title: '"Nobody Has Ever Done That"',
      art: 'orchard',
      text: (S) => {
        const l = [];
        l.push(`You say you are sorry. For startling them. For walking into the middle of something. For the apple, which was honestly your fault for being where it landed.`);
        l.push(`The silence that follows goes on long enough to be uncomfortable, then long enough to be strange.`);
        l.push(`"He apologised," says the green tree, in a completely different voice.`);
        l.push(`"To a TREE," says the red one. "Nobody has ever done that. Not once. Not in three hundred years."`);
        if (S.flags.heard_tree_feud) l.push(`They look at each other. For the first time since you arrived, neither of them is shouting.`);
        return l;
      },
      choices: [
        { text: 'Ask them what they are fighting about.',
          goto: 'trees_truth', effects: { xp: 30 } },
        { text: 'Ask them about the bakery, and what moved in.',
          goto: 'trees_gift', effects: { xp: 40, flags: { knows_goblins_bake: true },
            note: 'The trees tell you the goblins are not raiding. They are BAKING. Badly, loudly, and at all hours.' } },
        { text: 'Tell them about Tyndareus, and the pie he has wanted for seventy years.',
          goto: 'trees_truth', effects: { xp: 40, flags: { told_trees_truth: true } } }
      ]
    },

    trees_truth: {
      title: 'What Happened to Grammy',
      art: 'orchard',
      text: [
        `You tell them the truth: that Grammy Smithwick is long dead, that no one drove her away, and that the bakery closed because people do not last as long as trees.`,
        `Barktholomew — the red one, you learn — makes a sound like a door settling in an empty house.`,
        `"Oh," says Rootilda. "Oh. Then it was nobody's fault."`,
        `"It was nobody's fault," Barktholomew agrees, and something three hundred years old goes quiet in him.`,
        `They have not stopped disliking each other. But they have stopped shouting, and for these two that is nearly the same as peace.`
      ],
      choices: [
        { text: 'Ask about the bakery before you go.',
          goto: 'trees_gift', effects: { xp: 60, flags: { knows_goblins_bake: true, made_peace_trees: true },
            chronicle: 'ended a three-hundred-year feud between two apple trees by telling them the truth', remember: true,
            note: 'The trees tell you the goblins are not raiding. They are BAKING.' } }
      ]
    },

    trees_gift: {
      title: 'One Red, One Green',
      art: 'orchard',
      text: [
        `As you turn to go, there is a creak of old wood bending in a way old wood should not bend.`,
        `Barktholomew lowers a branch and drops a single red apple into your hands. A moment later — grudgingly, and only after a pointed silence — Rootilda produces a green one.`,
        `"She took one of each," Rootilda says. "Every morning. One of each."`,
        `"If you are going in there," says Barktholomew, "take them with you."`
      ],
      choices: [
        { text: 'Take both apples, and thank them.',
          goto: 'orchard_hub',
          effects: { xp: 50, items: ['red_apple', 'green_apple'], flags: { has_tree_apples: true },
            chronicle: 'was given an apple by each of the two arguing orchard trees', remember: true } },
        { text: 'Take them, and promise to bring back a slice of whatever you bake.',
          goto: 'orchard_hub',
          effects: { xp: 70, items: ['red_apple', 'green_apple'], flags: { has_tree_apples: true, promised_trees_pie: true },
            chronicle: 'promised the orchard trees a slice of the pie', remember: true } }
      ]
    },

    trees_took_side: {
      title: 'A Verdict Nobody Asked For',
      art: 'orchard',
      text: (S) => {
        const red = S.flags.took_tree_side === 'red';
        return [
          `You deliver your judgement with the confidence of someone who arrived ninety seconds ago.`,
          red
            ? `Barktholomew swells with vindication. Rootilda goes absolutely silent, which is worse than the shouting was.`
            : `Rootilda rustles in triumph. Barktholomew says nothing at all, and every red apple on him seems to darken by a shade.`,
          `You have not ended the argument. You have joined it.`
        ];
      },
      choices: [
        { text: 'Leave before it gets worse.',
          goto: 'orchard_hub',
          effects: { flags: { tree_feud_worse: true },
            chronicle: 'took sides in the orchard feud and made it worse', remember: true } },
        { text: 'Take it back. Apologise to the one you slighted.',
          goto: 'trees_apology', effects: { xp: 20, flags: { took_tree_side: null } } }
      ]
    },

    trees_offended2: {
      title: 'The Apple Comes Back Harder',
      art: 'orchard',
      text: [
        `You lob the apple back. It bounces off Barktholomew's trunk with a hollow *bonk*.`,
        `Both trees turn to look at you with the unified outrage of two people who despise each other and have just found something they agree on.`,
        `Then the orchard starts throwing apples, and it turns out three hundred years of upper-body strength is not nothing.`
      ],
      choices: [
        { text: 'Run for the bakery.',
          check: { stat: 'DEX', skill: 'acrobatics', dc: 12, label: 'Acrobatics' },
          success: { goto: 'orchard_hub', effects: { xp: 30, note: 'You make the wall with only your dignity bruised.' } },
          fail: { goto: 'orchard_hub', effects: { damage: 3, flags: { tree_feud_worse: true }, note: 'An apple catches you square in the back of the head.' } } },
        { text: 'Stand your ground and shout an apology over the barrage.',
          check: { stat: 'CHA', skill: 'persuasion', dc: 14, label: 'Persuasion' },
          success: { goto: 'trees_apology', effects: { xp: 60, note: 'The barrage stops mid-air. Somebody has said sorry.' } },
          fail: { goto: 'orchard_hub', effects: { damage: 4, flags: { tree_feud_worse: true } } } }
      ]
    },

    trees_threatened: {
      title: 'Firewood',
      art: 'orchard',
      text: [
        `You say the word "firewood" out loud, to a pair of awakened trees, in their own orchard.`,
        `The temperature of the afternoon does not change, but something in the grass does. Roots shift. The light through the leaves goes hard and green.`,
        `"Firewood," Barktholomew repeats, tasting it.`,
        `They let you pass. They watch you go. Nothing in this orchard will ever help you now, and you will feel the shape of that later, when you need something that only a tree could have told you.`
      ],
      choices: [
        { text: 'Go to the bakery.',
          goto: 'orchard_hub',
          effects: { flags: { trees_hostile: true }, bond: { orchard: -10 },
            chronicle: 'threatened to turn the orchard trees into firewood', remember: true } }
      ]
    },

    trees_gunshot: {
      title: 'A Sound Nobody Here Has Heard Before',
      art: 'orchard',
      text: [
        `You draw, aim high, and squeeze.`,
        `The bang goes across the orchard like a slammed door in an empty house. Birds come off every tree in the valley at once. A branch of Barktholomew's splinters and swings down, and a fine drift of leaves comes after it.`,
        `The silence afterward is total. Both trees have gone rigid.`,
        `"What," says Rootilda, very carefully, "was THAT."`,
        `From the bakery behind you comes the sound of a great many small feet deciding, simultaneously, to hide.`
      ],
      choices: [
        { text: 'Holster it and apologise immediately.',
          goto: 'trees_apology', effects: { xp: 30, flags: { goblins_alerted: true } } },
        { text: 'Keep it out. Tell them you want no trouble — and that you are able to make some.',
          goto: 'orchard_hub',
          effects: { flags: { trees_hostile: true, goblins_alerted: true }, bond: { orchard: -6 },
            chronicle: 'cowed two ancient trees with a revolver', remember: true } }
      ]
    },

    /* ============== THE OVEN ============== */
    oven_awake: {
      title: 'The Thing at the Back of the Bakery',
      art: 'bakery',
      text: [
        `The oven takes up the whole back wall. Brick, iron, and a mouth you could walk into without stooping much.`,
        `It is lit. Nobody lit it.`,
        `As you come closer the coals brighten, the way a dog's eyes open without its head moving, and a voice comes out of the brick — not loud, but felt in the floorboards and the teeth:`,
        `"APPLES."`,
        `Flour drifts down from the rafters with the vibration of it. Behind you, the goblins have all stopped working.`
      ],
      choices: [
        { text: 'Answer it. Ask what it wants.',
          goto: 'oven_wants', effects: { xp: 40, flags: { spoke_to_oven: true } } },
        { text: 'Ask the goblins what it is before you say a word to it.',
          goto: 'oven_goblin_brief', effects: { xp: 30 } },
        { text: 'Offer it the apples you were given.',
          if: (S) => !!S.flags.has_tree_apples,
          goto: 'oven_apples_offered', effects: { xp: 50, flags: { offered_oven_apples: true } } },
        { text: 'Tell it to bake, and be quick about it.',
          goto: 'oven_commanded', effects: { flags: { commanded_oven: true } } },
        { text: 'Back away slowly and let sleeping ovens lie.',
          goto: 'bakery_floor', effects: { flags: { avoided_oven: true }, chronicle: 'backed away from the living oven without speaking to it', remember: true } }
      ]
    },

    oven_goblin_brief: {
      title: 'What the Goblins Know',
      art: 'bakery',
      text: [
        `You put the question to the room. The goblins look at each other, and then at the oven, and then at their feet.`,
        `"It talks," offers a small one with a cooking pot on its head — Pot-Helmet, apparently, and proud of it. "Says words. One at a time."`,
        `"It said APPLES," says a lanky one clutching a clipboard. Skritch. "We brought apples. Cartloads. It said APPLES again."`,
        `"It has said SONG twice," adds a very small goblin — Nib — from behind a sack of sugar. "We do not know what to do with SONG."`,
        `"And TRUTH," says Grubnash heavily. "It says TRUTH most of all. We have been feeding it apples for two years. It is not the apples."`
      ],
      choices: [
        { text: 'Speak to the oven now, knowing what it has asked for.',
          goto: 'oven_wants', effects: { xp: 50, flags: { spoke_to_oven: true, oven_briefed: true } } }
      ]
    },

    oven_apples_offered: {
      title: 'One Red, One Green',
      art: 'bakery',
      text: [
        `You hold up Barktholomew's red apple and Rootilda's green one.`,
        `The coals flare — genuinely flare, a foot of flame — and the whole bakery goes orange for a second.`,
        `"THEIRS," the oven says. And then, after a pause that feels like consideration: "GOOD."`,
        `It does not take them. It waits, with the patience of a thing built into a wall, for you to understand that the apples were never the problem.`
      ],
      choices: [
        { text: 'Ask it what it actually wants.',
          goto: 'oven_wants', effects: { xp: 60, flags: { spoke_to_oven: true, oven_likes_you: true } } }
      ]
    },

    oven_commanded: {
      title: '"NO."',
      art: 'bakery',
      text: [
        `You tell it to bake. You use the voice that has worked on quartermasters, innkeepers, and at least one minor noble.`,
        `The coals go dark. Not out — dark, the way a face goes when you have said the wrong thing at a funeral.`,
        `"NO," says the oven.`,
        `The word sits in the room. Behind you, Grubnash makes a small, pained sound, like a man watching someone kick a sleeping bear for no reason at all.`
      ],
      choices: [
        { text: 'Change your tone. Ask, instead of order.',
          goto: 'oven_wants', effects: { xp: 20, flags: { spoke_to_oven: true, oven_annoyed: true } } },
        { text: 'Leave it. You will find the recipe without a talking wall.',
          goto: 'bakery_floor', effects: { flags: { oven_refused: true }, chronicle: 'ordered the oven to bake and was refused', remember: true } }
      ]
    },

    oven_wants: {
      title: 'Three Words',
      art: 'bakery',
      text: (S) => {
        const l = [];
        l.push(`You ask it, plainly, what it wants.`);
        l.push(`The answer comes in three pieces, with long gaps between, like something dredging words up from a very deep place:`);
        l.push(`"APPLES." ... "SONG." ... "TRUTH."`);
        l.push(`Then, the longest pause of all, and the thing it has evidently been trying to say for two years:`);
        l.push(`"THE SECRET IS NOT THE APPLES."`);
        if (S.flags.oven_briefed) l.push(`Skritch drops his clipboard. "Two YEARS," he says, to nobody.`);
        return l;
      },
      choices: [
        { text: '"I want to help everyone here. Including you."',
          goto: 'oven_promise',
          effects: { xp: 90, flags: { oven_pact: true }, bond: { goblins: 4 },
            chronicle: 'promised the oven to help everyone in the bakery, including it', remember: true } },
        { text: 'Offer it a trade: a song for a pie.',
          goto: 'oven_bargain', effects: { xp: 30, flags: { oven_bargain: true } } },
        { text: 'Ask it to name its price.',
          goto: 'oven_bargain', effects: { xp: 20, flags: { oven_bargain: true } } },
        { text: 'Say nothing. Listen. Let it finish in its own time.',
          goto: 'oven_silence', effects: { xp: 50, flags: { oven_listened: true } } }
      ]
    },

    oven_bargain: {
      title: 'It Is Not a Merchant',
      art: 'bakery',
      text: [
        `You offer terms. A song for a pie. A fair exchange between professionals.`,
        `The coals shift, and you get the distinct impression of something enormous being patient with you.`,
        `"NOT TRADE," says the oven.`,
        `A pause.`,
        `"SHARE."`
      ],
      choices: [
        { text: 'Understand, and say it properly: you want to help everyone here.',
          goto: 'oven_promise', effects: { xp: 70, flags: { oven_pact: true }, bond: { goblins: 3 },
            chronicle: 'learned that the oven wanted sharing, not a bargain', remember: true } },
        { text: 'Give up on it and go looking for the recipe.',
          goto: 'bakery_floor', effects: { flags: { oven_refused: true } } }
      ]
    },

    oven_silence: {
      title: 'The Long Quiet',
      art: 'bakery',
      text: [
        `You say nothing at all. You sit down on an upturned crate in front of a talking oven and you wait.`,
        `It takes a while. The goblins get bored and drift back to work. The light through the high windows moves across the floor.`,
        `Then, unprompted: "SHE SANG."`,
        `And, later: "EVERY MORNING. SHE SANG. AND SHE GAVE IT AWAY."`,
        `And, last: "I HAVE BEEN HOT FOR SIXTY YEARS AND NOBODY HAS SUNG."`
      ],
      choices: [
        { text: '"I want to help everyone here. Including you."',
          goto: 'oven_promise',
          effects: { xp: 100, flags: { oven_pact: true, oven_likes_you: true }, bond: { goblins: 4 },
            chronicle: 'sat in silence until the oven was ready to talk, then promised to help it', remember: true } }
      ]
    },

    oven_promise: {
      title: 'Warm',
      art: 'bakery',
      text: [
        `The coals come up slowly, from dull red to gold, and the heat that rolls out of the mouth of it is not the heat of a fire. It is the heat of a kitchen with people in it.`,
        `"YES," says the oven.`,
        `Grubnash has taken his chef's hat off and is holding it against his chest with both hands.`,
        `"It never said yes before," he says. "Two years. It never said yes."`,
        `The oven adds one more word, and this one is instruction:`,
        `"ALL."`
      ],
      choices: [
        { text: 'Tell Grubnash: everyone bakes. Not watching. Helping.',
          goto: 'oven_all_hands',
          effects: { xp: 80, bond: { goblins: 6 }, flags: { all_hands: true },
            chronicle: 'insisted that every goblin in the bakery help with the baking', remember: true } },
        { text: 'Ask permission to fetch the recipe book first.',
          goto: 'oven_all_hands', effects: { xp: 40, flags: { asked_permission: true } } }
      ]
    },

    oven_all_hands: {
      title: 'The Crew',
      art: 'bakery',
      text: [
        `Grubnash lines them up, which takes some doing, because goblins do not line up so much as accumulate.`,
        `POT-HELMET, who wears a cooking pot as a helmet and describes himself, unprompted, as "marketing".`,
        `ROLLING-PIN, who has appointed himself Assistant Crust Commander and salutes.`,
        `NIB, who is very small and is trusted with the butter and the sugar because he is the only one who does not eat it.`,
        `SKRITCH, who has the clipboard, the inventory, and a permanent expression of a man doing sums he does not like.`,
        `"This is the crew," says Grubnash. "This is all of us. We are not very good."`,
        `"That's fine," you say. "Neither is the first pie."`
      ],
      choices: [
        { text: 'Go and find the recipe. Properly — with permission.',
          goto: 'office',
          effects: { xp: 60, flags: { oven_route: true }, bond: { goblins: 4 },
            note: 'Grubnash walks you to the office door himself and does not follow you in.' } }
      ]
    },

    /* ============== GRAMMY'S SPIRIT ============== */
    grammy_spirit: {
      title: 'The Woman at the Desk',
      art: 'office',
      text: [
        `You find the recipe book exactly where a recipe book should be, and when you put your hand on it the room gets colder by a degree and somebody behind you says:`,
        `"And what do you want it for?"`,
        `She is sitting on the edge of the desk that she is also, faintly, visible through. Apron. Flour to the elbow. The unimpressed patience of a woman who has thrown drunks out of her own shop.`,
        `"Sixty years," says Grammy Smithwick, "and the first one through that door who knocks is an adventurer. Go on then. Three questions."`
      ],
      choices: [
        { text: 'Stand still and answer them.', goto: 'grammy_q1', effects: { xp: 40, flags: { met_grammy: true } } },
        { text: 'Grab the book and run.',
          goto: 'grammy_theft', effects: { flags: { tried_to_rob_grammy: true }, chronicle: 'tried to steal the recipe book out from under Grammy\'s own ghost', remember: true } }
      ]
    },

    grammy_q1: {
      title: '"Do You Mean To Do This Properly?"',
      art: 'office',
      text: [
        `"First one," she says. "Do you mean to do this properly? Not fast. Not clever. Properly."`,
        `She is not reading your face. She is reading something behind it, and she has had sixty quiet years to get good at it.`
      ],
      choices: [
        { text: '"Yes."',
          goto: 'grammy_q2', effects: { xp: 50, flags: { grammy_yes: true } } },
        { text: '"I mean to do it fast. An old man is dying and he wants a pie."',
          goto: 'grammy_q2', effects: { xp: 30, flags: { grammy_honest_hurry: true } } },
        { text: 'Tell her what she wants to hear.',
          check: { stat: 'CHA', skill: 'deception', dc: 18, label: 'Deception' },
          success: { goto: 'grammy_q2', effects: { xp: 20, flags: { grammy_lied: true } } },
          fail: { goto: 'grammy_caught_lying', effects: {} } }
      ]
    },

    grammy_caught_lying: {
      title: 'She Has Heard Better Liars',
      art: 'office',
      text: [
        `"No," she says, before you have finished.`,
        `Not angry. Disappointed, which is considerably worse, and which you have not felt since you were nine.`,
        `"I ran a shop for forty years, love. Everybody lies to a baker. You get a nose for it, same as for a burnt bottom."`
      ],
      choices: [
        { text: 'Start again. Honestly.',
          goto: 'grammy_q2', effects: { xp: 20, flags: { grammy_second_chance: true } } },
        { text: 'Take the book anyway. She is a ghost; she cannot stop you.',
          goto: 'grammy_theft', effects: { flags: { tried_to_rob_grammy: true }, chronicle: 'took the recipe book after lying to Grammy\'s ghost', remember: true } }
      ]
    },

    grammy_q2: {
      title: '"Second One."',
      art: 'office',
      text: [
        `"Second one," she says. "Ask me something. Anything you like. I want to see what you reach for."`,
        `She folds her arms and waits, and the waiting is the test.`
      ],
      choices: [
        { text: 'Ask what happened to her.',
          goto: 'grammy_q3',
          effects: { xp: 90, flags: { asked_about_grammy: true }, bond: { grammy: 6 },
            chronicle: 'asked Grammy what happened to her, instead of asking about the recipe', remember: true } },
        { text: 'Ask what the secret ingredient is.',
          goto: 'grammy_q3', effects: { xp: 30, flags: { asked_secret: true } } },
        { text: 'Ask whether the goblins can be taught.',
          goto: 'grammy_q3', effects: { xp: 70, flags: { asked_about_goblins: true }, bond: { grammy: 4, goblins: 3 } } },
        { text: 'Ask what she wants, now, after sixty years.',
          goto: 'grammy_q3', effects: { xp: 80, flags: { asked_grammy_wish: true }, bond: { grammy: 5 } } }
      ]
    },

    grammy_q3: {
      title: '"Last One."',
      art: 'office',
      text: (S) => {
        const l = [];
        if (S.flags.asked_about_grammy) {
          l.push(`She looks at you for a long moment.`);
          l.push(`"Nothing dramatic," she says. "I got old. The town got smaller. One winter I didn't come in, and then I didn't come in again." She shrugs. "It's not a tragedy, love. It's just a Tuesday that went on."`);
          l.push(`"Nobody's asked me that. Sixty years. They all ask about the pie."`);
        } else if (S.flags.asked_secret) {
          l.push(`She laughs — a real one, surprised out of her.`);
          l.push(`"It's written down, love. It's been written down the whole time. That's not the same as knowing it."`);
        } else if (S.flags.asked_about_goblins) {
          l.push(`"They've been trying for two years," she says. "Two years, with no one to show them and a book they can't read. Of course they can be taught. Somebody has to bother."`);
        } else {
          l.push(`"What do I want." She considers it. "I want the ovens hot and the door open and somebody singing. That's all it ever was."`);
        }
        l.push(`"Last one," she says. "If I let you take that book — who eats the pie?"`);
        return l;
      },
      choices: [
        { text: '"Everyone. The goblins, the old wizard, the trees, anyone who comes hungry."',
          goto: 'grammy_blessing',
          effects: { xp: 120, flags: { promised_to_share: true }, bond: { grammy: 8, goblins: 4 },
            chronicle: 'promised Grammy that everyone would get a slice', remember: true } },
        { text: '"The man who is paying me. That was the arrangement."',
          goto: 'grammy_blessing',
          effects: { xp: 40, flags: { promised_client_only: true },
            chronicle: 'told Grammy the pie was for the paying client', remember: true } },
        { text: '"The goblins. They are the ones who live here now."',
          goto: 'grammy_blessing',
          effects: { xp: 100, flags: { promised_goblins: true }, bond: { grammy: 6, goblins: 8 },
            chronicle: 'told Grammy the bakery belongs to the goblins now', remember: true } }
      ]
    },

    grammy_blessing: {
      title: 'Her Blessing',
      art: 'office',
      text: (S) => {
        const l = [];
        if (S.flags.promised_to_share || S.flags.promised_goblins) {
          l.push(`She nods once, and something goes out of her shoulders that has been there a long time.`);
          l.push(`"Right then," she says. "Take it."`);
          l.push(`"One thing." She taps the book. "The recipe isn't the secret. I wrote every word of it down and it still isn't the secret. The secret is that I never once baked it alone."`);
        } else {
          l.push(`She looks at you a while, and then sighs the sigh of a woman who has decided not to make a fuss.`);
          l.push(`"Take it," she says. "It's only paper. You'll find out what it's worth."`);
          l.push(`She does not say the other thing. You can see her decide not to.`);
        }
        return l;
      },
      choices: [
        { text: 'Copy it out. Leave the book where it belongs.',
          goto: 'grammy_copied',
          effects: { xp: 130, items: ['copied_recipe'], flags: { copied_recipe: true, book_stays: true },
            bond: { grammy: 8, goblins: 6 },
            chronicle: 'copied the recipe out by hand and left Grammy\'s book at the bakery', remember: true } },
        { text: 'Take the book itself. It is what you were sent for.',
          goto: 'grammy_took_book',
          effects: { xp: 60, items: ['recipe_complete'], flags: { took_book: true },
            chronicle: 'took Grammy\'s recipe book away from the bakery', remember: true } },
        { text: 'Ask her to teach the goblins herself.',
          goto: 'grammy_teaches',
          effects: { xp: 110, flags: { grammy_teaches: true }, bond: { grammy: 6, goblins: 8 },
            chronicle: 'asked Grammy\'s ghost to teach the goblins to bake', remember: true } }
      ]
    },

    grammy_copied: {
      title: 'In Your Own Hand',
      art: 'office',
      text: [
        `It takes the better part of an hour. Skritch finds you paper — good paper, from the inventory nobody has touched in sixty years — and hovers, and eventually starts reading the ingredients aloud so you can write faster.`,
        `When you are done you close the book and put it back on the shelf, and Skritch makes a small noise.`,
        `"It stays?" he says.`,
        `"It stays."`,
        `He writes something on his clipboard with enormous care. Later you find out what: *BOOK — STAYS. PERMANENT.*`
      ],
      choices: [
        { text: 'Go back to the bakery floor. There is baking to do.',
          goto: 'trial_intro', effects: { xp: 50 } }
      ]
    },

    grammy_took_book: {
      title: 'Under Your Arm',
      art: 'office',
      text: [
        `You tuck the book under your arm. It is smaller and lighter than something this important ought to be.`,
        `Grammy watches you do it and says nothing at all, which is its own kind of comment.`,
        `In the doorway Skritch sees the book in your hand, and looks at the empty place on the shelf, and does not write anything on his clipboard.`
      ],
      choices: [
        { text: 'Go back to the bakery floor.',
          goto: 'trial_intro', effects: { bond: { goblins: -4 } } }
      ]
    },

    grammy_teaches: {
      title: 'The Teacher Returns',
      art: 'office',
      text: [
        `"Teach them," she repeats.`,
        `"They have been trying for two years," you say. "With your book, in your kitchen, and nobody to show them. You are right here."`,
        `Grammy Smithwick, who has been sitting on this desk for sixty years, gets up off it.`,
        `"Well," she says. "Nobody's asked me to do anything in a very long time."`,
        `She is still barely there. But when she walks out of the office ahead of you, the flour on the floor moves.`
      ],
      choices: [
        { text: 'Follow her to the bakery floor.',
          goto: 'trial_intro',
          effects: { xp: 90, items: ['copied_recipe'], flags: { copied_recipe: true, book_stays: true, grammy_present: true } } }
      ]
    },

    grammy_theft: {
      title: 'Sixty Years of Patience, Spent',
      art: 'office',
      text: [
        `You take the book and turn for the door and the door is shut. It was not shut a moment ago.`,
        `The cold in the room stops being a draught and starts being a presence.`,
        `"That," says Grammy Smithwick, "is MINE."`,
        `Every drawer in the office opens at once.`
      ],
      choices: [
        { text: 'Put it down. Apologise. Start again properly.',
          goto: 'grammy_q1', effects: { xp: 20, flags: { met_grammy: true, grammy_second_chance: true }, bond: { grammy: -4 } } },
        { text: 'Hold on to it and force the door.',
          check: { stat: 'STR', skill: 'athletics', dc: 15, label: 'Athletics' },
          success: { goto: 'trial_intro',
            effects: { xp: 40, items: ['recipe_complete'], damage: 4, flags: { took_book: true, robbed_grammy: true },
              bond: { grammy: -10, goblins: -6 },
              chronicle: 'forced the office door with Grammy\'s book under one arm and her ghost screaming', remember: true } },
          fail: { goto: 'grammy_q1',
            effects: { damage: 6, flags: { met_grammy: true }, bond: { grammy: -6 },
              note: 'The door does not move. Something cold goes straight through you, and you put the book down.' } } }
      ]
    },

    /* ============== THE THREE TRIALS ============== */
    trial_intro: {
      title: 'One Good Pie',
      art: 'floor',
      text: (S) => {
        const l = [];
        l.push(`The recipe is legible, the oven is willing, and there are five goblins standing in a row waiting to be told what to do.`);
        if (S.flags.grammy_present) l.push(`And there is a woman by the flour bins that only you can see, supervising.`);
        l.push(`The oven says one word, and it is not a request:`);
        l.push(`"ALL."`);
        l.push(`Three things stand between this bakery and one good pie: getting the crew organised, getting the filling right, and whatever it is the oven means by SONG.`);
        return l;
      },
      choices: [
        { text: 'Start with the crew. Get this floor organised.', goto: 'trial_organise', effects: {} }
      ]
    },

    trial_organise: {
      title: 'Trial One — The Organising',
      art: 'floor',
      text: [
        `The bakery floor is chaos of a specific goblin kind: five people each doing the same job, badly, in the same square foot.`,
        `Pot-Helmet is carrying one apple across the room with tremendous ceremony. Rolling-Pin is guarding a bowl. Nib has the butter and is defending it from Rolling-Pin, who wants it for reasons he cannot articulate.`
      ],
      choices: [
        { text: 'Run it like a company. Stations, orders, everyone moving.',
          check: { stat: 'STR', skill: 'athletics', dc: 12, label: 'Athletics',
            advIf: [{ origin: 'soldier' }, { cls: 'fighter' }, { cls: 'paladin' }] },
          success: { goto: 'trial_organise_win',
            effects: { xp: 90, flags: { organised: 'command' },
              chronicle: 'drilled the goblin bakery like a company of soldiers', remember: true } },
          fail: { goto: 'trial_organise_mess', effects: {} } },
        { text: 'Put Grubnash in command and serve under him.',
          goto: 'trial_organise_win',
          effects: { xp: 100, flags: { organised: 'grubnash' }, bond: { goblins: 8 },
            chronicle: 'put Grubnash in charge of the bake and took orders from a goblin', remember: true } },
        { text: 'Let them organise themselves. Chaos, but theirs.',
          goto: 'trial_organise_chaos', effects: { xp: 60, flags: { organised: 'theirs' } } },
        { text: 'Do it all yourself. Faster than teaching five goblins.',
          goto: 'trial_organise_alone',
          effects: { xp: 30, flags: { organised: 'alone' },
            chronicle: 'did the whole bake alone rather than teach the goblins', remember: true } }
      ]
    },

    trial_organise_win: {
      title: 'A Bakery That Works',
      art: 'floor',
      text: (S) => {
        const l = [];
        if (S.flags.organised === 'grubnash') {
          l.push(`Grubnash stares at you. "Me?"`);
          l.push(`"It's your bakery, chief."`);
          l.push(`Something happens to his posture. He puts the hat back on, straightens the measuring-spoon necklace, and starts giving orders — and they are good orders, because he has been watching this kitchen fail for two years and he knows exactly why.`);
          l.push(`You spend the next hour peeling apples where you are told to peel apples.`);
        } else {
          l.push(`You take the floor apart and put it back together: Nib on butter and sugar because he does not eat it, Skritch on the count because he has the clipboard anyway, Rolling-Pin on the crust he has been dreaming about, Pot-Helmet running between stations at a dead sprint because he is incapable of walking.`);
          l.push(`Within twenty minutes there are apples moving down a line and nobody is guarding anything.`);
        }
        l.push(`Grubnash looks around at a bakery that is, for the first time in two years, working.`);
        return l;
      },
      choices: [
        { text: 'Send someone into town to say the bakery is open.',
          goto: 'trial_filling',
          effects: { xp: 60, flags: { town_told: true }, bond: { goblins: 4 },
            chronicle: 'sent Pot-Helmet and Skritch into town to announce that Grammy\'s was baking again', remember: true } },
        { text: 'Keep it quiet. One pie first, then promises.',
          goto: 'trial_filling', effects: { xp: 30, flags: { town_told: false } } }
      ]
    },

    trial_organise_mess: {
      title: 'Parade Ground Manners',
      art: 'floor',
      text: [
        `You bark. It goes badly.`,
        `Goblins do not respond to a parade-ground voice the way recruits do; they respond to it the way cats do, which is by leaving. Rolling-Pin hides in a flour bin. Nib drops the butter.`,
        `Grubnash puts a floury hand on your arm. "They are not soldiers," he says, not unkindly. "They are bakers. Very bad bakers. Ask them."`
      ],
      choices: [
        { text: 'Ask them instead of ordering them.',
          goto: 'trial_organise_win',
          effects: { xp: 70, flags: { organised: 'asked' }, bond: { goblins: 5 },
            chronicle: 'learned to ask the goblins instead of ordering them', remember: true } },
        { text: 'Put Grubnash in charge — he clearly knows them better.',
          goto: 'trial_organise_win',
          effects: { xp: 80, flags: { organised: 'grubnash' }, bond: { goblins: 8 },
            chronicle: 'handed command of the bake to Grubnash', remember: true } }
      ]
    },

    trial_organise_chaos: {
      title: 'Their Chaos',
      art: 'floor',
      text: [
        `You step back and let it happen.`,
        `It is appalling. It is also, after about forty minutes, working — in a way you could not have designed and would never have permitted. Pot-Helmet's sprinting turns out to be a delivery system. Rolling-Pin's bowl-guarding turns out to be quality control.`,
        `They have been a crew for two years. They just have never been allowed to be one.`
      ],
      choices: [
        { text: 'Get out of the way and help where they point.',
          goto: 'trial_filling', effects: { xp: 70, bond: { goblins: 6 } } }
      ]
    },

    trial_organise_alone: {
      title: 'One Pair of Hands',
      art: 'floor',
      text: [
        `You do it yourself. You are faster than they are, and you do not have to explain anything, and it works.`,
        `The goblins stand along the wall and watch you do it.`,
        `About halfway through, Nib quietly puts the butter down and goes to sit outside.`,
        `The oven, which has been bright all morning, dims by a shade. It does not say anything. That is somehow worse.`
      ],
      choices: [
        { text: 'Keep going. The pie is what matters.',
          goto: 'trial_filling', effects: { bond: { goblins: -6 }, flags: { baked_alone: true } } },
        { text: 'Stop. Put the knife down and call them over.',
          goto: 'trial_organise_win',
          effects: { xp: 80, flags: { organised: 'asked' }, bond: { goblins: 6 },
            chronicle: 'stopped baking alone and called the goblins in', remember: true } }
      ]
    },

    trial_filling: {
      title: 'Trial Two — The Filling',
      art: 'floor',
      text: (S) => {
        const l = [];
        l.push(`The filling is where Grammy's recipe stops being arithmetic. There is a line in her hand that reads: *cinnamon — as much as the day needs.*`);
        l.push(`Skritch has read this line eleven times and is visibly upset by it.`);
        if (S.flags.has_tree_apples) l.push(`In your pack: one red apple from Barktholomew, one green from Rootilda. One of each. Every morning.`);
        return l;
      },
      choices: [
        { text: 'Let the goblins decide how much cinnamon.',
          goto: 'trial_filling_done',
          effects: { xp: 100, flags: { goblins_chose_spice: true }, bond: { goblins: 8 },
            chronicle: 'let the goblins decide the cinnamon', remember: true } },
        { text: 'Measure it precisely yourself. The recipe says what it says.',
          goto: 'trial_filling_done',
          effects: { xp: 40, flags: { measured_precisely: true },
            chronicle: 'measured every spice personally, to the gram', remember: true } },
        { text: "Bake the trees' two apples into the filling.",
          if: (S) => !!S.flags.has_tree_apples,
          goto: 'trial_filling_trees',
          effects: { xp: 120, flags: { tree_apples_baked: true }, bond: { orchard: 8 },
            chronicle: 'baked Barktholomew and Rootilda\'s apples into the pie together', remember: true } },
        { text: 'Put Nib in charge of every ingredient and trust him.',
          goto: 'trial_filling_done',
          effects: { xp: 80, flags: { nib_in_charge: true }, bond: { goblins: 6 },
            chronicle: 'put Nib in charge of all the ingredients', remember: true } }
      ]
    },

    trial_filling_trees: {
      title: 'One of Each',
      art: 'floor',
      text: [
        `You take out the red apple and the green apple and put them on the board together, and Grubnash goes very still.`,
        `"One of each," he says. "The book says one of each. We could never work out why — we have a whole orchard of red ones out there."`,
        `"They're from the two trees out front."`,
        `"The shouting ones?" He looks at the apples with new respect. "They gave them to you?"`,
        `You slice them into the same bowl. It is the first time in three hundred years that anything of Barktholomew's and anything of Rootilda's has been in the same place without an argument.`
      ],
      choices: [
        { text: 'And let the goblins call the cinnamon.',
          goto: 'trial_filling_done',
          effects: { xp: 90, flags: { goblins_chose_spice: true }, bond: { goblins: 8 },
            chronicle: 'let the goblins decide the cinnamon', remember: true } },
        { text: 'Measure the rest exactly as written.',
          goto: 'trial_filling_done', effects: { xp: 40, flags: { measured_precisely: true } } }
      ]
    },

    trial_filling_done: {
      title: 'As Much As The Day Needs',
      art: 'floor',
      text: (S) => {
        const l = [];
        if (S.flags.goblins_chose_spice) {
          l.push(`You hand the cinnamon to Grubnash and tell him it is his call.`);
          l.push(`The entire bakery stops. Five goblins look at their chief.`);
          l.push(`Grubnash takes the jar in both hands like it is a holy object, considers the light through the window, considers the smell of the room, and tips in roughly twice what the recipe would suggest.`);
          l.push(`"It is that kind of day," he says, defensively.`);
          l.push(`The oven, quietly: "YES."`);
        } else if (S.flags.measured_precisely) {
          l.push(`You measure it out to the grain, level the spoon with a knife, and add exactly what is written.`);
          l.push(`It is correct. Skritch is delighted; he has finally seen someone treat the inventory with respect.`);
          l.push(`The oven says nothing at all, which you decide not to think about.`);
        } else {
          l.push(`Nib takes charge of the ingredients with the gravity of a small accountant, and it turns out that the reason he never eats the butter is that he has been saving it for something.`);
          l.push(`He gets it right. Of course he gets it right.`);
        }
        return l;
      },
      choices: [
        { text: 'That leaves SONG.', goto: 'trial_song', effects: {} }
      ]
    },

    trial_song: {
      title: 'Trial Three — Song',
      art: 'floor',
      text: [
        `The pie goes in. The oven does not close its mouth.`,
        `"SONG," it says.`,
        `Everyone looks at you. Five goblins, one chief, and a wall of hot brick, all waiting for something none of them can do.`,
        `"We tried humming," Grubnash offers. "It did not count."`
      ],
      choices: [
        { text: 'Sing. An old marching song, the kind you sing to stay awake on watch.',
          check: { stat: 'CHA', skill: 'performance', dc: 12, label: 'Performance',
            advIf: [{ origin: 'soldier' }, { origin: 'entertainer' }, { cls: 'bard' }] },
          success: { goto: 'trial_song_win',
            effects: { xp: 140, flags: { sang: 'soldier' },
              chronicle: 'sang an old soldier\'s song to the oven, and the goblins joined in one by one', remember: true } },
          fail: { goto: 'trial_song_rough', effects: {} } },
        { text: 'Make a speech instead. You are better with words than notes.',
          check: { stat: 'CHA', skill: 'persuasion', dc: 13, label: 'Persuasion' },
          success: { goto: 'trial_song_win', effects: { xp: 110, flags: { sang: 'speech' },
            chronicle: 'gave a speech to a bakery full of goblins instead of singing', remember: true } },
          fail: { goto: 'trial_song_rough', effects: {} } },
        { text: 'Tell them about Tyndareus — a boy who tasted this pie seventy years ago.',
          goto: 'trial_song_story',
          effects: { xp: 130, flags: { sang: 'story' },
            chronicle: 'told the goblins the story of the boy who remembered the pie', remember: true } },
        { text: 'Say nothing. Let the work be the song — five people, one kitchen.',
          goto: 'trial_song_quiet',
          effects: { xp: 100, flags: { sang: 'silence' },
            chronicle: 'let the sound of the work be the song', remember: true } },
        { text: 'Let Pot-Helmet do his marketing jingle. Gods help us all.',
          goto: 'trial_song_jingle', effects: { xp: 90, flags: { sang: 'jingle' } } }
      ]
    },

    trial_song_win: {
      title: 'One By One',
      art: 'floor',
      text: (S) => {
        const l = [];
        if (S.flags.sang === 'speech') {
          l.push(`You do not sing. You talk — about crews, and long roads, and the fact that the people you end up beside are rarely the people you planned on.`);
          l.push(`Halfway through, Nib starts humming. Then Rolling-Pin. By the end you have stopped talking entirely and the bakery is doing the rest.`);
        } else {
          l.push(`You sing the one everybody in the regiment knew — the long slow one about marching beside people whose names you never learned.`);
          l.push(`Nib joins first, two bars in, badly. Then Rolling-Pin, who has no idea what the words are and commits fully anyway. Then Skritch, who turns out to have a genuinely beautiful voice and is mortified about it.`);
          l.push(`Pot-Helmet bangs his helmet. Grubnash comes in last, on the low part, and he knows the tune — he has heard it through the wall from the road, for years, and never known what it was.`);
        }
        l.push(`The coals go white.`);
        return l;
      },
      choices: [
        { text: 'Watch the oven work.', goto: 'the_great_bake', effects: { xp: 60, flags: { song_landed: true } } }
      ]
    },

    trial_song_story: {
      title: 'The Boy Who Remembered',
      art: 'floor',
      text: [
        `You tell them about Tyndareus. Not the wizard — the boy. A boy in a town that smelled of cinnamon every morning, who went away to learn magic and came back seventy years later to find the smell gone.`,
        `"He is going to die soon," you say. "And out of a whole life of magic, the thing he wanted one more time was your pie."`,
        `The bakery is completely silent.`,
        `"Our pie," says Grubnash. Not a question. He is holding his wooden spoon with both hands.`,
        `"It's the same kitchen," you say. "It's the same oven. It's your pie now."`,
        `Nib starts to cry, which sets off Rolling-Pin, and the oven goes from red to gold to white while they are all still snuffling.`
      ],
      choices: [
        { text: 'Watch the oven work.', goto: 'the_great_bake', effects: { xp: 70, flags: { song_landed: true, told_tyndareus_story: true } } }
      ]
    },

    trial_song_quiet: {
      title: 'The Sound of a Kitchen',
      art: 'floor',
      text: [
        `You do not sing. You pick up a knife and go back to work, and after a moment so does everyone else.`,
        `What the oven gets is this: six people working in one room. Knife on board. Spoon on bowl. Pot-Helmet's feet. Skritch counting under his breath. Somebody laughing at something small.`,
        `It turns out that is also a song. It may in fact be the one it was asking for.`,
        `"YES," says the oven, very quietly, and the coals turn white.`
      ],
      choices: [
        { text: 'Watch the oven work.', goto: 'the_great_bake', effects: { xp: 80, flags: { song_landed: true } } }
      ]
    },

    trial_song_jingle: {
      title: '"GRAMMY\'S! IT\'S GOT APPLES!"',
      art: 'floor',
      text: [
        `Pot-Helmet has been waiting his entire life for permission and he does not waste it.`,
        `The jingle is four words long. It is bellowed. It rhymes only by accident, it scans not at all, and he performs it while banging on his own head.`,
        `"GRAMMY'S! IT'S GOT APPLES!"`,
        `Rolling-Pin joins in. Then Nib. Then, with the air of a man whose professional standards are being dismantled, Skritch.`,
        `It is the worst song you have ever heard in your life. The coals go white anyway.`,
        `The oven, sounding almost amused: "YES."`
      ],
      choices: [
        { text: 'Watch the oven work.', goto: 'the_great_bake', effects: { xp: 70, flags: { song_landed: true } } }
      ]
    },

    trial_song_rough: {
      title: 'Not Your Best Work',
      art: 'floor',
      text: [
        `You are off-key from the first note and you know it, and knowing it makes it worse.`,
        `You get through maybe eight bars before your voice cracks on a high note you had no business attempting, and you stop.`,
        `The silence is total. Somewhere, Skritch writes something down.`,
        `Then Nib — small, careful Nib — picks up the tune from where you dropped it. He is also terrible. He does not appear to care.`
      ],
      choices: [
        { text: 'Join him. Badly, and loudly, and all the way to the end.',
          goto: 'trial_song_win',
          effects: { xp: 120, flags: { sang: 'badly_together' },
            chronicle: 'sang badly, and kept singing, and the goblins carried it', remember: true } },
        { text: 'Let Nib finish it alone. He is better at this than you.',
          goto: 'the_great_bake',
          effects: { xp: 90, flags: { song_landed: true, nib_sang: true },
            chronicle: 'stepped back and let Nib sing to the oven', remember: true } }
      ]
    },

    the_great_bake: {
      title: 'SHARE',
      art: 'floor',
      text: (S) => {
        const l = [];
        l.push(`The oven does not so much bake as *decide*.`);
        l.push(`Light comes out of the seams of it. The whole building smells, all at once, like every good autumn anyone in the room has ever had — and for the goblins, who have never had one, like the idea of one.`);
        if (S.flags.tree_apples_baked) l.push(`Out in the orchard, two very old trees stop talking at the same moment.`);
        l.push(`Pies come out in rows. Not one. Rows.`);
        l.push(`Grubnash cuts into the first with his wooden spoon because he cannot find a knife and will not wait, and the crust gives with a sound that makes Skritch sit down on the floor.`);
        l.push(`The oven says its last word of the day, and it is an instruction:`);
        l.push(`"SHARE."`);
        return l;
      },
      choices: [
        { text: 'Open the doors. Anyone who is hungry.',
          goto: 'bakery_reopens',
          effects: { xp: 150, items: ['oven_blessing'], flags: { bakery_reopened: true }, bond: { goblins: 10 },
            chronicle: 'reopened Grammy\'s Bakery and shared the pies with anyone who came', remember: true } },
        { text: 'Take your share and go. The wizard is waiting.',
          goto: 'tower_return_intro',
          effects: { xp: 60, flags: { kept_it_quiet: true },
            chronicle: 'left with the pie without opening the doors', remember: true } }
      ]
    },

    bakery_reopens: {
      title: "Grammy's, Open",
      art: 'bakery',
      text: (S) => {
        const l = [];
        if (S.flags.town_told) {
          l.push(`Pot-Helmet and Skritch did their job. There are eleven people standing in the road outside, and they have been standing there for an hour, and not one of them is entirely sure why they came.`);
          l.push(`They came because the smell reached the town and something in them was nine years old again.`);
        } else {
          l.push(`Nobody was told. It does not matter. The smell goes down the valley on its own and does the telling.`);
          l.push(`The first arrival is an old woman who stands in the doorway and does not come in for a long moment.`);
          l.push(`"It smells right," she says. "It hasn't smelled right since I was a girl."`);
        }
        l.push(`Goblins serve. Actual goblins, in aprons, handing pie to actual villagers, and the strangest part is how quickly everybody stops finding it strange.`);
        if (S.flags.promised_trees_pie) l.push(`Somebody carries two slices out to the orchard and leaves them at the roots. You do not see who.`);
        if (S.flags.grammy_present) l.push(`By the flour bins, where only you can see her, Grammy Smithwick is watching her shop full of people and she is not saying anything at all.`);
        return l;
      },
      choices: [
        { text: 'Take a pie to the old man who started all this.',
          goto: 'tower_return_intro',
          effects: { xp: 120, items: ['free_pie_forever'], bond: { goblins: 6 },
            chronicle: 'was promised free pie at Grammy\'s forever', remember: true } }
      ]
    },

    /* ============== THE TOWER FINALE ============== */
    tower_return_intro: {
      title: 'The Long Walk Back',
      art: 'tower',
      text: (S) => {
        const l = [];
        l.push(`Two days back the way you came, with a pie in a box and a recipe in your pocket.`);
        l.push(`Crimp opens the door before you knock. He looks at the box. He looks at you.`);
        l.push(`"He's been asking since you left," the imp says. "Every day. Twice on Tuesday." A pause. "He's upstairs."`);
        if (S.flags.copied_recipe) l.push(`The copied recipe is folded in your breast pocket. You have been aware of it the entire walk.`);
        return l;
      },
      choices: [
        { text: 'Go up.', goto: 'tower_recipe_choice', effects: {} }
      ]
    },

    tower_recipe_choice: {
      title: 'What the Recipe Is For',
      art: 'tower',
      text: (S) => {
        const l = [];
        l.push(`Tyndareus the Green is exactly where you left him, in a chair that has moulded to seventy years of him, and when he sees the box his whole face does something complicated.`);
        l.push(`"You found it," he says. "You actually found it."`);
        l.push(`He puts out a hand for the recipe.`);
        l.push(`And here is the thing you have been turning over for two days: if you give him this, he will have it. He will have the words. He will read them in this room, alone, with an imp who is not allowed to sit down.`);
        return l;
      },
      choices: [
        { text: 'Hand it over. It is what he paid for.',
          goto: 'tower_handed_over',
          effects: { xp: 80, gold: 1500, flags: { gave_recipe: true },
            chronicle: 'handed Tyndareus the recipe and took the fee', remember: true } },
        { text: 'Tear it up. If he wants the pie, he comes to the bakery.',
          if: (S) => !!S.flags.copied_recipe,
          goto: 'tower_torn',
          effects: { xp: 200, flags: { tore_recipe: true },
            chronicle: 'tore up the recipe in front of Tyndareus and told him to come to the bakery himself', remember: true } },
        { text: 'Hand it over — and invite him to the bakery anyway.',
          goto: 'tower_handed_over',
          effects: { xp: 140, gold: 1500, flags: { gave_recipe: true, invited_anyway: true },
            chronicle: 'gave Tyndareus the recipe and invited him to the bakery all the same', remember: true } },
        { text: 'Offer terms: the recipe stays at Grammy\'s, and he funds the bakery.',
          check: { stat: 'CHA', skill: 'persuasion', dc: 14, label: 'Persuasion' },
          success: { goto: 'tower_patron',
            effects: { xp: 180, gold: 1500, flags: { bakery_patron: true },
              chronicle: 'talked Tyndareus into becoming Grammy\'s patron', remember: true } },
          fail: { goto: 'tower_recipe_choice_failed', effects: {} } },
        { text: 'Let Crimp decide. He has earned a say.',
          goto: 'tower_crimp_decides',
          effects: { xp: 160, flags: { crimp_decided: true },
            chronicle: 'let Crimp the imp decide what happened to the recipe', remember: true } }
      ]
    },

    tower_recipe_choice_failed: {
      title: '"I Am Paying You For a Recipe"',
      art: 'tower',
      text: [
        `The old man listens to your proposal with the expression of someone who has been negotiated at by better people than you, in rooms with higher ceilings.`,
        `"I am dying," he says, "and you are pitching me an investment."`,
        `His hand is still out.`
      ],
      choices: [
        { text: 'Hand it over.',
          goto: 'tower_handed_over', effects: { gold: 1500, flags: { gave_recipe: true },
            chronicle: 'handed Tyndareus the recipe and took the fee', remember: true } },
        { text: 'Tear it up anyway.',
          if: (S) => !!S.flags.copied_recipe,
          goto: 'tower_torn', effects: { xp: 150, flags: { tore_recipe: true },
            chronicle: 'tore up the recipe in front of Tyndareus', remember: true } }
      ]
    },

    tower_torn: {
      title: 'Paper',
      art: 'tower',
      text: [
        `You take the recipe out of your pocket, and you tear it in half.`,
        `The sound it makes in that quiet room is enormous.`,
        `Crimp inhales. Tyndareus's hand stays exactly where it is, out, open, for several long seconds.`,
        `"That was mine," he says.`,
        `"No," you say. "That was a piece of paper. The pie is at the bakery. It is hot, there are goblins arguing about crust, and there's a chair." You put the pieces in his open hand anyway. "If you want it again, you come with me in the morning."`,
        `The old wizard looks down at the two halves of seventy years of wanting.`,
        `"In the morning," he repeats.`
      ],
      choices: [
        { text: 'Open the box. There is still a pie in it.', goto: 'first_slice', effects: { xp: 60 } }
      ]
    },

    tower_handed_over: {
      title: 'The Transaction',
      art: 'tower',
      text: (S) => {
        const l = [];
        l.push(`You put the recipe in his hand and he closes both of his around it.`);
        l.push(`He reads it twice, there and then, mouthing the ingredients. At the last line — *and one thing more, which I shall never write down* — he stops.`);
        l.push(`"What does that mean?" he says.`);
        if (S.flags.invited_anyway) {
          l.push(`"It means come to the bakery in the morning," you say. "It's not a line. It's a room full of people."`);
          l.push(`He looks up at you over the paper for a long moment.`);
        } else {
          l.push(`You could tell him. You have stood in that kitchen and you know exactly what it means.`);
          l.push(`He is already reading it again, alone, in a chair he has not left in years.`);
        }
        l.push(`Crimp counts out fifteen hundred gold pieces without being asked, and does not look at either of you.`);
        return l;
      },
      choices: [
        { text: 'Open the box.', goto: 'first_slice', effects: {} }
      ]
    },

    tower_patron: {
      title: 'An Arrangement',
      art: 'tower',
      text: [
        `"The recipe stays where it was written," you say. "In the kitchen it came out of. And you pay to keep that kitchen open."`,
        `"And what do I get?"`,
        `"A standing order. Pie, every week, carried up those stairs by whichever goblin drew the short straw. Forever, or for as long as you've got — whichever runs out first."`,
        `Tyndareus the Green, who has not made a new arrangement with anybody in thirty years, laughs. It turns into a cough and back into a laugh.`,
        `"Write it up," he tells Crimp. "Before he changes his mind."`
      ],
      choices: [
        { text: 'Open the box.', goto: 'first_slice', effects: { xp: 60, flags: { bakery_funded: true } } }
      ]
    },

    tower_crimp_decides: {
      title: 'Nobody Has Ever Asked Crimp Anything',
      art: 'tower',
      text: [
        `You turn to the imp in the red waistcoat, who has been standing by the door of this room for longer than you have been alive.`,
        `"Crimp. You've watched him want this for seventy years. What should I do with it?"`,
        `The silence goes on a beat too long, and you realise, with some horror, that nobody has ever asked him anything.`,
        `Crimp looks at the recipe. Then at his master, who is watching him with an expression that has gone strange and soft.`,
        `"Don't give it to him," the imp says. "He'll read it and he'll put it in a drawer and he'll be exactly as lonely on Thursday as he was on Wednesday." A pause. "Take him to the bakery. Make him get up."`
      ],
      choices: [
        { text: 'Do as Crimp says. Tear it up.',
          if: (S) => !!S.flags.copied_recipe,
          goto: 'tower_torn',
          effects: { xp: 120, flags: { tore_recipe: true, crimp_honoured: true },
            chronicle: 'tore up the recipe because Crimp asked you to', remember: true } },
        { text: 'Hand it over, but promise the morning.',
          goto: 'tower_handed_over',
          effects: { xp: 100, gold: 1500, flags: { gave_recipe: true, invited_anyway: true } } }
      ]
    },

    first_slice: {
      title: 'The First Slice',
      art: 'tower',
      text: (S) => {
        const l = [];
        l.push(`You open the box, and seventy years leaves that old man's face all at once.`);
        l.push(`Crimp appears with plates. Crimp always appears with plates; it is, as far as you can tell, the entire content of Crimp's life.`);
        l.push(`You pick up the knife. The first slice comes away clean.`);
        l.push(`And everyone in the room watches to see where it goes.`);
        return l;
      },
      choices: [
        { text: 'Give it to Crimp.',
          goto: 'first_slice_crimp',
          effects: { xp: 200, flags: { slice_to: 'crimp' }, bond: { crimp: 10 },
            chronicle: 'gave the first slice to Crimp', remember: true } },
        { text: 'Give it to Tyndareus. He is the one who waited.',
          goto: 'first_slice_wizard',
          effects: { xp: 100, flags: { slice_to: 'wizard' },
            chronicle: 'gave the first slice to Tyndareus', remember: true } },
        { text: 'Cut it into enough pieces for everyone in the room, at once.',
          goto: 'first_slice_all',
          effects: { xp: 170, flags: { slice_to: 'everyone' },
            chronicle: 'cut the first slice into pieces so everyone ate at the same moment', remember: true } },
        { text: 'Eat it yourself. You walked four days for this.',
          goto: 'first_slice_self',
          effects: { xp: 60, flags: { slice_to: 'self' },
            chronicle: 'ate the first slice personally', remember: true } }
      ]
    },

    first_slice_crimp: {
      title: 'The Imp in the Red Waistcoat',
      art: 'tower',
      text: [
        `You hold the plate out to the imp.`,
        `Crimp does not take it. Crimp looks at the plate, and then at you, and then at his master, and his hands stay exactly where they are.`,
        `"That's his," he says.`,
        `"He's had seventy years of wanting it," you say. "You've had seventy years of carrying his tea up those stairs. Take the plate, Crimp."`,
        `Tyndareus the Green, who has waited a lifetime for this pie, says — quietly, and without any hesitation at all —`,
        `"Take the plate, Crimp."`,
        `The imp takes the plate. He eats standing up, because he does not know how to do it any other way, and about halfway through he has to stop and put it down for a second.`
      ],
      choices: [
        { text: 'Say the thing you have been thinking for two days.', goto: 'tower_last_words', effects: { xp: 80 } }
      ]
    },

    first_slice_wizard: {
      title: 'Seventy Years',
      art: 'tower',
      text: [
        `You put the plate in front of Tyndareus, and he takes a bite of his own childhood.`,
        `He does not say anything for a while. His eyes are shut and his hands are shaking slightly and the room has the good sense to wait.`,
        `"Yes," he says eventually. "That's it. That's exactly it."`,
        `Behind him, Crimp fetches a napkin, sets it down, and returns to his place by the door, where he stands and does not eat.`
      ],
      choices: [
        { text: 'Say the thing you have been thinking for two days.', goto: 'tower_last_words', effects: {} },
        { text: 'Cut a second slice and hand it to Crimp before you say anything.',
          goto: 'tower_last_words',
          effects: { xp: 90, flags: { crimp_second_slice: true }, bond: { crimp: 6 },
            chronicle: 'made sure Crimp got a slice too', remember: true } }
      ]
    },

    first_slice_all: {
      title: 'All At Once',
      art: 'tower',
      text: [
        `You cut the slice into three and hand them round, and the three of you eat at the same moment: a dying wizard, an overworked imp, and you.`,
        `Nobody says anything. There is a long communal silence of the specific kind that only happens over very good food.`,
        `"Oh," says Crimp, to himself.`,
        `Tyndareus looks over at his servant eating pie in his study, and something crosses his face that is not about the pie at all.`
      ],
      choices: [
        { text: 'Say the thing you have been thinking for two days.', goto: 'tower_last_words', effects: { xp: 60 } }
      ]
    },

    first_slice_self: {
      title: 'Your Slice',
      art: 'tower',
      text: [
        `You eat it. You walked four days, you talked a bakery full of goblins out of a war, and you have earned a slice of pie.`,
        `It is astonishing.`,
        `It is also, you notice, quieter than you expected — two other people in the room, watching you eat, waiting politely for their turn.`
      ],
      choices: [
        { text: 'Cut the next two and hand them over.', goto: 'tower_last_words', effects: {} }
      ]
    },

    tower_last_words: {
      title: 'What You Say To Him',
      art: 'tower',
      text: (S) => {
        const l = [];
        l.push(`The pie is going. The room is warm. In a day or a month or a year this old man is going to die, and you are probably the last stranger who will ever come up these stairs.`);
        l.push(`He knows it too. He is looking at the window.`);
        return l;
      },
      choices: [
        { text: '"Not everyone you knew is here anymore. Don\'t forget the ones who are."',
          goto: 'tower_morning',
          effects: { xp: 250, flags: { said_the_words: true }, bond: { crimp: 8 },
            chronicle: 'told Tyndareus not to forget the people still around him', remember: true } },
        { text: 'Ask him about wizard college. Be his friend, not his contractor.',
          goto: 'tower_morning',
          effects: { xp: 200, flags: { became_friend: true },
            chronicle: 'stayed and asked Tyndareus about his life', remember: true } },
        { text: 'Ask him to teach the goblins a little magic.',
          goto: 'tower_morning',
          effects: { xp: 190, flags: { wizard_teaches_goblins: true },
            chronicle: 'asked Tyndareus to teach the goblins magic', remember: true } },
        { text: 'Say nothing. Let the pie do the talking.',
          goto: 'tower_morning',
          effects: { xp: 120, chronicle: 'said nothing at the end, and let the pie do the talking', remember: true } }
      ]
    },

    tower_morning: {
      title: 'The Next Morning',
      art: 'bakery',
      text: (S) => {
        const l = [];
        if (S.flags.tore_recipe || S.flags.invited_anyway || S.flags.bakery_patron || S.flags.bakery_funded) {
          l.push(`He comes.`);
          l.push(`It takes most of the morning to get him down the stairs and into a cart, and Crimp complains the entire way with enormous happiness.`);
          l.push(`Tyndareus the Green, who has not left his tower in thirty years, stands in the doorway of Grammy's Bakery in a cloud of cinnamon and cannot speak.`);
          l.push(`Grubnash wipes his hand on his apron and puts it out. "You're the boy," he says. "The one from the story. The one who remembered."`);
          l.push(`And they put an apron on a dying wizard and they teach him to roll crust, badly, while Pot-Helmet shouts encouragement and Nib corrects his technique.`);
          if (S.flags.wizard_teaches_goblins) l.push(`In the afternoon he pays them back: five goblins learning Dancing Lights in a bakery, and the resulting fire is small and quickly dealt with.`);
          l.push(`He does not get one last taste of the past. He gets a place to come back to, which is better, and which nobody had thought to offer him in thirty years.`);
        } else {
          l.push(`You leave in the morning with your fee.`);
          l.push(`Behind you, up a winding stair, an old man reads a recipe in an empty room, and an imp in a red waistcoat carries up a tea he did not ask for.`);
          l.push(`Down the valley, a bakery full of goblins is arguing about crust, and the smell of it reaches almost — almost — to the tower.`);
        }
        return l;
      },
      choices: [
        { text: 'End the episode.', goto: 'epilogue', effects: {} }
      ]
    }
  };

  Object.keys(ADD).forEach(k => { S_[k] = ADD[k]; });

  /* ------------------------------------------------------------------
     REWIRE existing scenes so the new content is reachable
     ------------------------------------------------------------------ */
  function addChoice(sceneId, choice, index) {
    const sc = S_[sceneId];
    if (!sc || !sc.choices) return false;
    if (sc.choices.some(c => c.goto === choice.goto && c.text === choice.text)) return true;
    if (typeof index === 'number') sc.choices.splice(index, 0, choice);
    else sc.choices.push(choice);
    return true;
  }

  // The arguing trees, off the orchard
  addChoice('orchard', { text: 'Two trees are shouting at each other further in. Go and look.', goto: 'trees_argue', effects: {} }, 0);
  // One return trip only. Without the `revisited_trees` latch this and the
  // "leave them to it" choice form an infinite orchard loop.
  addChoice('orchard_hub', {
    text: 'Go back to the two arguing trees.',
    if: (S) => !S.flags.has_tree_apples && !S.flags.trees_hostile
            && !S.flags.tree_feud_worse && !S.flags.revisited_trees,
    goto: 'trees_argue',
    effects: { flags: { revisited_trees: true } }
  });

  // The oven, off the bakery floor
  addChoice('bakery_floor', { text: 'The great oven at the back is lit. Nobody lit it.', if: (S) => !S.flags.spoke_to_oven && !S.flags.avoided_oven, goto: 'oven_awake', effects: {} }, 0);
  addChoice('floor_ovens', { text: 'Speak to it.', if: (S) => !S.flags.spoke_to_oven, goto: 'oven_awake', effects: {} }, 0);

  // Grammy's spirit guards the recipe in the office
  addChoice('office', { text: 'Take the recipe book down off the shelf.', if: (S) => !S.flags.met_grammy && !S.flags.copied_recipe && !S.flags.took_book, goto: 'grammy_spirit', effects: {} }, 0);

  // The peaceful route can lead into the full bake
  addChoice('chief_together', { text: 'Then let us bake it properly — all of us, today.', if: (S) => !!S.flags.copied_recipe || !!S.flags.oven_pact, goto: 'trial_intro', effects: {} }, 0);
  addChoice('bake_together', { text: 'Do it properly: the whole crew, the whole day, the oven\'s three demands.', if: (S) => !!S.flags.oven_pact, goto: 'trial_intro', effects: {} }, 0);
  addChoice('reading', { text: 'Ask the oven what it wants first.', if: (S) => !S.flags.spoke_to_oven, goto: 'oven_awake', effects: {} }, 0);

  if (TDM.engine && TDM.engine.validateEpisode) { /* validated by tools/validate.js */ }
})();
