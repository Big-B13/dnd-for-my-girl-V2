/* ============================================================
   EPISODE ONE, PART C — The Great Bake, and the Tower Again
   Scenes 14 through 21 of Perry's run.
   Three trials: the organising, the magic, the song.
   Then: the torn recipe, and the first slice to Crimp.
   ============================================================ */
(function () {
  const TDM = (typeof window !== 'undefined')
    ? (window.TDM = window.TDM || {})
    : (global.TDM = global.TDM || {});

  const M = (key, text, extra) => Object.assign({ chronicleKey: key, chronicle: text, remember: true }, extra || {});

  const scenes = {

    /* ---------------- THE GREAT BAKE ---------------- */

    the_great_bake: {
      title: 'The Great Bake',
      art: 'floor',
      text: (S) => {
        const l = [];
        l.push(`One pie. One true Grammy's Country Apple Pie, baked by everybody, with the Oven's blessing.`);
        l.push(`The floor has never been this full. Every goblin in the building is here, and they have all washed their hands, and several of them have put on things they evidently consider formal.`);
        l.push(`The Oven is banked and waiting, the great door open a crack, warmth rolling out across the benches.`);
        l.push(`And it is immediately, obviously, total chaos. Nine goblins who have never once been organised are all trying to help at the same time. Someone has already dropped the flour.`);
        l.push(`Three things stand between this room and a pie: **it has to be organised. It has to have magic in it. And it has to have a song.**`);
        return l;
      },
      choices: [{ text: 'Start with the chaos.', goto: 'trial_one', effects: { xp: 5 } }]
    },

    trial_one: {
      title: 'Trial One — The Organising',
      art: 'floor',
      text: (S) => {
        const l = [];
        l.push(`Nine goblins. One bench each. Forty years of everyone doing everything at once and nothing getting finished.`);
        if (S.isOrigin && S.isOrigin('soldier')) l.push(`You have run a supply line in worse conditions than this, with worse people, under fire.`);
        l.push(`Grubnash is trying to supervise and being ignored. Pot-Helmet is carrying a sack of flour somewhere for reasons nobody has established. Two goblins are arguing over the same bowl.`);
        l.push(`This is not a baking problem. This is a logistics problem.`);
        return l;
      },
      choices: [
        {
          text: 'Take command. Stations, jobs, a line — run it like a company.',
          check: { stat: 'STR', skill: 'athletics', dc: 12, label: 'Athletics' },
          success: { goto: 'trial_one_done', effects: Object.assign({ xp: 15, bond: { goblins: 10, grubnash: 6 }, flags: { organised: true } }, M('organised_crew', 'turned a chaotic goblin kitchen into a working production line')) },
          fail: { goto: 'trial_one_scrape', effects: { note: 'It takes three goes and a lot of shouting. It works in the end.', flags: { organised: true } } }
        },
        {
          text: 'Put Grubnash in command and back him up.',
          goto: 'trial_one_grubnash',
          effects: Object.assign({ xp: 15, bond: { grubnash: 15, goblins: 8 }, flags: { organised: true, grubnash_led: true } },
            M('grubnash_led', 'put Chief Grubnash in command of his own kitchen and backed him up'))
        },
        {
          text: 'Let them sort themselves out. Don\'t interfere.',
          goto: 'trial_one_chaos',
          effects: Object.assign({ xp: 10, bond: { goblins: 4 }, flags: { let_them_lead: true } },
            M('let_them_organise', 'let the goblins organise themselves'))
        },
        {
          text: 'Do the whole thing yourself. It\'s faster.',
          goto: 'trial_one_alone',
          effects: Object.assign({ xp: 5, bond: { goblins: -8 }, flags: { did_it_alone: true } },
            M('baked_it_alone', 'shouldered the goblins aside and did the work alone'))
        }
      ]
    },

    trial_one_done: {
      title: 'Stations',
      art: 'floor',
      text: [
        `You put them in a line.`,
        `Apples at one end, Oven at the other, and every goblin in between with exactly one job and a clear idea of who they hand to. Nib on butter, obviously, and nobody argues. Rolling-Pin on crust, which he receives as a battlefield commission. Skritch counting everything in and out. Grubnash on the filling, with the spoon.`,
        `It takes eleven minutes and it transforms the room.`,
        `The noise changes. It stops being nine people flailing and becomes the particular busy rhythm of a kitchen that is actually working — the sound this building used to make every morning at four.`,
        `Grubnash stands in the middle of it, turning slowly round, looking at his own crew.`,
        `"They're *good*," he says. "Look at them. They were good the whole time."`
      ],
      choices: [
        {
          text: 'Send Pot-Helmet and Skritch into town to tell everyone pies are coming.',
          goto: 'town_run',
          effects: Object.assign({ xp: 15, bond: { pot_helmet: 15, skritch: 12 }, flags: { town_told: true } },
            M('town_told', 'sent Pot-Helmet and Skritch running into town to announce that Grammy\'s was baking again'))
        },
        {
          text: 'Keep it quiet until you know it works.',
          goto: 'trial_two',
          effects: Object.assign({ xp: 5, flags: { kept_quiet: true } },
            M('kept_it_quiet', 'kept the bake secret from the town until it was proven'))
        }
      ]
    },

    trial_one_scrape: {
      title: 'Three Goes',
      art: 'floor',
      text: [
        `Your first attempt at a production line collapses immediately because you put Pot-Helmet on a job requiring silence.`,
        `Your second attempt collapses because two goblins both believe they are on butter, and Nib has to be physically restrained.`,
        `Your third attempt works.`,
        `It is not elegant and there is a great deal of shouting, most of it yours, but by the end of it there is a line from the apples to the Oven and every goblin on it knows where they hand to.`,
        `"That," says Grubnash, breathing hard, "was horrible. Do it again tomorrow."`
      ],
      choices: [
        { text: 'Send Pot-Helmet and Skritch to town.', goto: 'town_run', effects: Object.assign({ xp: 15, bond: { pot_helmet: 15, skritch: 12 }, flags: { town_told: true } }, M('town_told', 'sent Pot-Helmet and Skritch running into town to announce that Grammy\'s was baking again')) },
        { text: 'Get straight on with the bake.', goto: 'trial_two', effects: { xp: 5 } }
      ]
    },

    trial_one_grubnash: {
      title: 'The Chief\'s Kitchen',
      art: 'floor',
      text: [
        `"It's your kitchen," you tell him. "You've been running it forty years. Run it."`,
        `Grubnash looks at you as if you have handed him something breakable.`,
        `Then he turns round, and puts two fingers in his mouth, and produces a whistle that stops every goblin in the building.`,
        `"STATIONS," he bellows. "Nib — butter. Rolling-Pin — crust, and I don't want to hear about it. Skritch, count. Pot-Helmet, you are *not* on ovens, you are on apples, and if you sing I will end you."`,
        `It is immediate and total. They have been waiting forty years for somebody to tell them where to stand.`,
        `He catches your eye across the room, mortified and delighted in equal measure.`,
        `"I've had that whistle since I was nine," he says. "Never had cause."`
      ],
      choices: [
        { text: 'Send Pot-Helmet and Skritch to town with the news.', goto: 'town_run', effects: Object.assign({ xp: 15, bond: { pot_helmet: 15, skritch: 12 }, flags: { town_told: true } }, M('town_told', 'sent Pot-Helmet and Skritch running into town to announce that Grammy\'s was baking again')) },
        { text: 'On to the magic.', goto: 'trial_two', effects: { xp: 5 } }
      ]
    },

    trial_one_chaos: {
      title: 'Let Them',
      art: 'floor',
      text: [
        `You step back against the wall and let nine goblins work it out.`,
        `It takes forty minutes and it is agony to watch. There are three separate arguments. Somebody cries. At one point Rolling-Pin and Pot-Helmet have to be separated over a disagreement about the definition of "folding".`,
        `And then — slowly, badly, entirely on their own — they arrive at almost exactly the right arrangement. Nib ends up on butter. Skritch ends up counting. They get there.`,
        `"We did that," says Grubnash, astonished. "You didn't do anything."`,
        `"No."`,
        `"...Right." He looks at his crew with something new in his face. "Right."`
      ],
      choices: [{ text: 'On to the magic.', goto: 'trial_two', effects: { xp: 10, bond: { goblins: 6 } } }]
    },

    trial_one_alone: {
      title: 'Faster Alone',
      art: 'floor',
      text: [
        `You take over.`,
        `It is faster. That much is true. You are better at this than any of them and within the hour the benches are in order, the apples are prepped, the crust is resting, and everything is exactly where it should be.`,
        `The goblins have drifted to the edges of the room. They are watching you work with the expression of people who have been told, very politely, that they are the problem.`,
        `Nib has put the butter down on the bench and stepped away from it.`,
        `The Oven, you notice, has gone quiet.`
      ],
      choices: [
        { text: 'Notice. Stop, and hand the work back to them.', goto: 'trial_one_chaos', effects: Object.assign({ xp: 10, bond: { goblins: 10 }, flags: { handed_it_back: true } }, M('handed_it_back', 'realised he had taken the bake away from the goblins, and gave it back')) },
        { text: 'Keep going. It needs to be right.', goto: 'trial_two', effects: Object.assign({ bond: { goblins: -6 }, flags: { cold_kitchen: true } }, M('baked_it_alone', 'did the whole bake himself while the goblins watched from the walls')) }
      ]
    },

    town_run: {
      title: 'Pies Are Coming',
      art: 'road',
      text: [
        `"Town," you tell Pot-Helmet. "Both of you. Tell them Grammy's is baking."`,
        `There is a pause of about a second and a half while Pot-Helmet's entire life arrives at its purpose.`,
        `"*I'VE GOT SIGNS,*" it says.`,
        `"Take the signs."`,
        `It is gone. Skritch goes after it at a dead run with the clipboard and an expression of profound alarm, shouting something about needing to record who was told.`,
        `They are small, and the road is long, and they run the whole way.`,
        `By evening, three miles off, a farmer will tell another farmer, and a boy will be sent to tell his grandmother, and a very old woman in Miller's Crossing who remembers the smell of that chimney will sit down very suddenly in her kitchen.`
      ],
      choices: [{ text: 'Back to the bake.', goto: 'trial_two', effects: { xp: 10 } }]
    },

    trial_two: {
      title: 'Trial Two — The Magic',
      art: 'floor',
      text: [
        `The second thing the pie needs is magic, and the room has gone slightly awkward about it, because the goblins do not have any and are trying not to mind.`,
        `The filling is in the bowl. The crust is resting under a cloth. The apples — the orchard's own, red and green — are cut and waiting.`,
        `And there is the cinnamon question.`,
        `Grammy's recipe says a quantity. It says it clearly, in an old woman's handwriting, with a note in the margin. Grubnash is holding the tin and looking at you, because you are the one with the copy, and this is the moment where somebody decides.`
      ],
      choices: [
        {
          text: 'Put light in the room first — drifting autumn colours over the benches.',
          goto: 'trial_two_lights',
          effects: Object.assign({ xp: 15, bond: { goblins: 10, oven: 6 }, flags: { cast_lights: true } },
            M('cast_lights', 'filled the bakery with drifting autumn lights while the crew worked'))
        },
        {
          text: 'Skip the theatrics. Get the cinnamon right.',
          goto: 'trial_two_cinnamon',
          effects: { xp: 5 }
        }
      ]
    },

    trial_two_lights: {
      title: 'Autumn, Indoors',
      art: 'floor',
      text: [
        `You put lights up over the benches. Not bright ones — drifting ones, gold and red and orange, turning slowly in the warm air coming off the Oven, like leaves going down in a wind that never quite arrives.`,
        `Nine goblins stop working at exactly the same moment.`,
        `Pot-Helmet has flour on its face and its mouth is open. Nib has both hands full of butter and has forgotten about them entirely. Rolling-Pin is standing very straight, the way you do at something solemn.`,
        `"Is it *autumn*?" says somebody, in Goblin, and somebody else says, "It's autumn. He's put autumn in."`,
        `Behind them, for the first time, the Oven makes a sound that is not a word. It is lower, and longer, and it is unmistakably content.`
      ],
      choices: [{ text: 'Now — the cinnamon.', goto: 'trial_two_cinnamon', effects: { xp: 5 } }]
    },

    trial_two_cinnamon: {
      title: 'The Cinnamon',
      art: 'floor',
      text: [
        `Grubnash holds out the tin.`,
        `"How much?" he says. "You've got the paper."`,
        `You do have the paper. The paper says a quantity, and the quantity is probably right, because it was written by a woman who did this for fifty-one years.`,
        `But nine goblins have been guessing at this exact question for forty years, every week, and getting it wrong, and writing it down, and guessing again. They know the smell of this kitchen better than you ever will.`,
        `The whole room is waiting.`
      ],
      choices: [
        {
          text: '"You decide."',
          goto: 'cinnamon_goblins',
          effects: Object.assign({ xp: 25, bond: { goblins: 20, grubnash: 12, oven: 8 }, flags: { goblins_chose_spice: true } },
            M('goblins_chose_spice', 'handed the cinnamon tin back and let the goblins decide how much'))
        },
        {
          text: 'Read out exactly what the recipe says.',
          goto: 'cinnamon_recipe',
          effects: Object.assign({ xp: 10, bond: { goblins: 2 }, flags: { followed_recipe: true } },
            M('followed_the_recipe', 'measured the cinnamon exactly as the recipe specified'))
        },
        {
          text: 'Split it — the recipe\'s amount, then let them adjust by taste.',
          goto: 'cinnamon_goblins',
          effects: Object.assign({ xp: 20, bond: { goblins: 12, grubnash: 6 }, flags: { goblins_chose_spice: true, split_decision: true } },
            M('shared_the_decision', 'measured the cinnamon by the book, then let the goblins adjust it by taste'))
        }
      ]
    },

    cinnamon_goblins: {
      title: 'Their Art',
      art: 'floor',
      text: (S) => {
        const l = [];
        l.push(`"You decide," you say, and you put the tin in Grubnash's hands.`);
        l.push(`He looks at it as though you have handed him the crown jewels and asked him to guess their weight.`);
        l.push(`"...Me?"`);
        l.push(`"All of you."`);
        l.push(`What follows is the single most serious conversation you have ever witnessed. Nine goblins, heads together over a tin of cinnamon, arguing in fierce whispers. Skritch is consulting the ledger. Nib is smelling the bowl with his eyes shut. Rolling-Pin votes twice and is caught.`);
        l.push(`They arrive at an amount. Grubnash measures it out with a shaking hand.`);
        l.push(`It is more than the recipe says. Noticeably more.`);
        l.push(`It goes in. The smell that comes up off the bowl stops the argument dead, and every goblin in that huddle turns and looks at you with the same expression, and it is the expression of people who have just found out they were right about something for the first time in forty years.`);
        return l;
      },
      choices: [{ text: 'On to the last thing.', goto: 'trial_three', effects: { xp: 10 } }]
    },

    cinnamon_recipe: {
      title: 'By the Book',
      art: 'floor',
      text: [
        `You read out the quantity and Grubnash measures it precisely, twice, and levels it off with the back of a knife.`,
        `It is correct. It is exactly, provably correct.`,
        `"Right," he says. And then, after a moment, not quite looking at you: "We'd have put more in."`,
        `"The recipe says this much."`,
        `"Aye. The recipe says." He tips it in. "She'd have known her apples, mind. These aren't her apples."`,
        `Nobody argues with you. That is somehow the problem.`
      ],
      choices: [
        { text: 'Change your mind. Let them add what they think.', goto: 'cinnamon_goblins', effects: Object.assign({ xp: 20, bond: { goblins: 16, grubnash: 10 }, flags: { goblins_chose_spice: true } }, M('goblins_chose_spice', 'thought again, and let the goblins decide the cinnamon after all')) },
        { text: 'Stick with the recipe.', goto: 'trial_three', effects: { xp: 5 } }
      ]
    },

    trial_three: {
      title: 'Trial Three — The Song',
      art: 'floor',
      text: [
        `Everything is ready. The filling is in. The crust is over it and crimped — by Rolling-Pin, who took four minutes and would not be hurried and whose hands did not shake once.`,
        `The pie goes into the Oven. The great door swings to.`,
        `And nothing happens.`,
        `The room waits. Forty years of waiting, concentrated into ninety seconds, and the fires do not change and the Oven does not speak.`,
        `Because it asked for three things. It asked for apples, and it has them. It asked for truth, and there is nothing but truth in this room tonight.`,
        `It asked for **SONG**.`,
        `Nobody here has sung in forty years. Every goblin in the building is looking at the floor.`
      ],
      choices: [
        {
          text: 'Sing. An old soldiers\' song, the kind for marching in the dark.',
          check: { stat: 'CHA', skill: 'performance', dc: 12, label: 'Performance' },
          success: { goto: 'the_song', effects: Object.assign({ xp: 30, bond: { goblins: 20, oven: 20, grubnash: 10 }, flags: { sang: true } }, M('sang', 'sang an old soldiers\' song over the Oven, and the goblins joined in one by one')) },
          fail: { goto: 'the_song', effects: Object.assign({ xp: 20, bond: { goblins: 16, oven: 14 }, flags: { sang: true, sang_badly: true } }, M('sang', 'sang badly and without shame, and the goblins joined in anyway')) }
        },
        {
          text: 'Give them a speech instead.',
          goto: 'the_speech',
          effects: Object.assign({ xp: 10, bond: { goblins: 6 }, flags: { gave_speech: true } },
            M('gave_a_speech', 'made a speech to the goblins instead of singing'))
        },
        {
          text: 'Ask Grubnash to start. It should be one of theirs.',
          goto: 'grubnash_sings',
          effects: Object.assign({ xp: 25, bond: { grubnash: 20, goblins: 16, oven: 14 }, flags: { sang: true, grubnash_sang: true } },
            M('grubnash_sang', 'asked Chief Grubnash to sing first, so the song would be theirs'))
        },
        {
          text: 'Wait. Let the silence do it.',
          goto: 'the_silence',
          effects: Object.assign({ xp: 10, flags: { stayed_silent: true } },
            M('stayed_silent', 'said nothing and waited, and let the silence stand'))
        }
      ]
    },

    the_song: {
      title: 'One by One by One',
      art: 'floor',
      text: (S) => {
        const l = [];
        if (S.flags.sang_badly) {
          l.push(`You are not a singer. You establish this within about four notes.`);
          l.push(`You keep going anyway, which is the whole of it.`);
        } else {
          l.push(`You sing.`);
        }
        l.push(`It is an old one — a campfire song, a marching song, the kind that gets sung at two in the morning by people who are cold and a long way from home and would rather not think about tomorrow. It is not about victory. None of the good ones are. It is about the people either side of you.`);
        l.push(`The first verse goes out into a completely silent bakery.`);
        l.push(`Halfway through the second, Grubnash comes in. He does not know the words. He hums it, badly, an octave down.`);
        l.push(`Then Pot-Helmet, at a volume that is frankly inappropriate and absolutely correct.`);
        l.push(`Then Rolling-Pin, who has a surprisingly good voice and is clearly embarrassed about it.`);
        l.push(`Then Skritch, still holding the clipboard.`);
        l.push(`Then Nib — last, and very quietly, and only because Nib has been waiting to be sure it was allowed.`);
        l.push(`One by one by one, until it is not your song any more. It is one voice, in one room, and the room is a bakery, and the bakery is *working*.`);
        l.push(`And the Oven opens.`);
        return l;
      },
      choices: [{ text: 'Look inside.', goto: 'share', effects: { xp: 15 } }]
    },

    grubnash_sings: {
      title: 'One of Theirs',
      art: 'floor',
      text: [
        `"It shouldn't be me," you tell him. "It's your kitchen. You start."`,
        `"I can't *sing*."`,
        `"Neither can most people who do."`,
        `Grubnash stands there in front of his whole crew with a wooden spoon in his hand, and goes red, and looks at the floor, and then — quietly, and horribly out of tune — begins a goblin song.`,
        `You do not know it. It is not a marching song or a drinking song. From the way the others react, it is something much older: a work song, the kind you sing to get through a long job, and every goblin in that room knows it and none of them have sung it in forty years because there was nothing to sing it over.`,
        `They come in one at a time. Pot-Helmet. Rolling-Pin. Skritch. Nib last, as ever.`,
        `And you stand at the back of somebody else's kitchen and let them have it.`,
        `The Oven opens before they reach the end of the first verse.`
      ],
      choices: [{ text: 'Look inside.', goto: 'share', effects: { xp: 20, bond: { grubnash: 10 } } }]
    },

    the_speech: {
      title: 'Words',
      art: 'floor',
      text: [
        `You give them a speech. It is a good speech — that they are bakers, that they were always bakers, that forty years of failure was forty years of trying.`,
        `They listen. Some of them stand a little straighter.`,
        `And the Oven does not open.`,
        `It asked for a song. It has been very clear about this. It asked four times in forty years and every time it used the same word.`,
        `"It's not enough," says Grubnash quietly. "Is it."`,
        `The pie is in there. The heat is going out of the room.`
      ],
      choices: [
        { text: 'Sing. Badly, if that\'s what\'s on offer.', goto: 'the_song', effects: Object.assign({ xp: 25, bond: { goblins: 16, oven: 16 }, flags: { sang: true, sang_badly: true } }, M('sang', 'gave up on the speech and sang instead')) },
        { text: 'Ask Grubnash to sing.', goto: 'grubnash_sings', effects: Object.assign({ xp: 25, bond: { grubnash: 16, oven: 14 }, flags: { sang: true, grubnash_sang: true } }, M('grubnash_sang', 'asked Grubnash to sing when the speech was not enough')) }
      ]
    },

    the_silence: {
      title: 'Nothing',
      art: 'floor',
      text: [
        `You wait.`,
        `The room waits with you. A minute. Two. The fires go down and down, and the warmth starts leaving the stone, and somewhere at the back a goblin makes a small sound and is hushed.`,
        `It asked for a song.`,
        `"It's all right," says Grubnash, eventually, and it is the worst thing he has said all day, because he means it. "It's all right. We're used to it."`,
        `Nib puts the butter down on the bench and goes to sit on the step.`
      ],
      choices: [
        { text: 'No. Sing.', goto: 'the_song', effects: Object.assign({ xp: 25, bond: { goblins: 18, oven: 16 }, flags: { sang: true, sang_badly: true } }, M('sang', 'broke the silence and sang')) },
        { text: 'Ask Grubnash to sing.', goto: 'grubnash_sings', effects: Object.assign({ xp: 25, bond: { grubnash: 18, oven: 14 }, flags: { sang: true, grubnash_sang: true } }, M('grubnash_sang', 'asked Grubnash to break the silence and sing')) }
      ]
    },

    share: {
      title: 'SHARE',
      art: 'floor',
      text: (S) => {
        const l = [];
        l.push(`The Oven glows white-gold and the whole building smells, all at once, like every good autumn that ever happened.`);
        l.push(`And they come out in rows. Not one pie. Rows of them — perfect, shining, impossible, golden-lidded and crimped, steam going up through the vents in curls.`);
        l.push(`Nobody moves. Nobody dares.`);
        l.push(`Then the Oven speaks for the last time, and it is not loud, and it shakes the flour out of the rafters anyway.`);
        l.push(`> **"SHARE."**`);
        return l;
      },
      choices: [
        {
          text: 'Everyone. The crew, the town, the trees, anyone who comes.',
          goto: 'the_reopening',
          effects: Object.assign({ xp: 35, bond: { goblins: 20, oven: 20, grammy: 15 }, flags: { shared: true } },
            M('shared_the_pies', 'shared the pies with the goblins, the town, and the orchard'))
        },
        {
          text: 'The crew first. They earned it.',
          goto: 'the_reopening',
          effects: Object.assign({ xp: 30, bond: { goblins: 24, grubnash: 12 }, flags: { shared: true, crew_first: true } },
            M('crew_first', 'gave the first pies to the goblin crew'))
        },
        {
          text: 'Box one for the wizard and be on the road before dark.',
          goto: 'the_reopening',
          effects: Object.assign({ xp: 10, bond: { goblins: -6, oven: -8 }, flags: { took_and_left: true } },
            M('took_a_pie_and_left', 'took a pie for the client and left the bakery the same evening'))
        }
      ]
    },

    the_reopening: {
      title: 'Grammy\'s Bakery',
      art: 'shop',
      text: (S) => {
        const l = [];
        if (S.flags.took_and_left) {
          l.push(`You take a pie, and you go, and behind you the crew stands in a bakery full of perfect pies and no one to give them to.`);
          l.push(`Pot-Helmet's signs are still stacked under their clean cloth in the front room.`);
          return l;
        }
        l.push(`They come that evening, because Pot-Helmet ran three miles and shouted at everybody it saw.`);
        l.push(`A farmer first, standing in the doorway with his hat in his hands, not quite able to say what he has come for. Then his wife. Then eleven people from the village at once, then a cart, then somebody's grandmother who is helped down off it and who takes one bite standing in the yard and has to be held up by two of her grandchildren.`);
        l.push(`The goblins serve. That is the thing nobody quite gets over — the goblins of Grammy's Bakery, in aprons, behind a counter, serving pie to the town that has been afraid of this building for forty years.`);
        l.push(`Skritch takes the money and gives correct change and writes down every single transaction.`);
        l.push(`Rolling-Pin eats a slice of his own crust, standing at the back bench, and has to put the plate down.`);
        if (S.flags.promised_signs || S.flags.saw_the_signs) l.push(`And out on the road, eleven charcoal signs are doing exactly the job they were made for, thirty-nine years late.`);
        l.push(`**Grammy's Bakery is open.**`);
        return l;
      },
      choices: [
        { text: 'Take a pie, and ride back to the tower.', goto: 'return_tower', effects: Object.assign({ xp: 15, item: 'grammys_pie', flags: { reopened: true } }, M('reopened', 'reopened Grammy\'s Bakery')) }
      ]
    },

    /* ---------------- THE TOWER AGAIN ---------------- */

    return_tower: {
      title: 'Back Up the Winding Stair',
      art: 'tower',
      text: (S) => {
        const l = [];
        l.push(`Two days back the other way, and Crimp opens the door before you knock.`);
        if (S.bond('crimp') >= 4) {
          l.push(`"You're back," he says, and something happens at the corner of his mouth that on Crimp constitutes an embrace. "He's been up every night. Every night. Pretending to read."`);
        } else {
          l.push(`"Upstairs," says Crimp. "He's been waiting."`);
        }
        l.push(`Tyndareus is out of his chair before you are through the door, which cannot be a thing he does often, because Crimp moves to catch him.`);
        l.push(`"You went," he says. "You *went*. And—?"`);
        if (S.flags.copied_recipe) l.push(`You have three sheets of paper in your coat, copied in your own hand, with an old woman's marginal notes carried across word for word.`);
        else if (S.flags.has_book) l.push(`You have Grammy Smithwick's green cloth-bound book under your arm, taken out of the bakery it has sat in for forty years.`);
        if (S.flags.reopened) l.push(`You also have a pie, still faintly warm, in a box on your hip.`);
        l.push(`The craving of a lifetime is standing in front of you with its hands out.`);
        return l;
      },
      choices: [
        {
          text: 'Tear up the recipe in front of him.',
          if: (S) => !!S.flags.copied_recipe,
          goto: 'tore_recipe',
          effects: Object.assign({ xp: 35, flags: { tore_recipe: true } },
            M('tore_recipe', 'tore up the copied recipe in front of Tyndareus'))
        },
        {
          text: 'Hand it over. It\'s what he paid for.',
          goto: 'handed_it_over',
          effects: Object.assign({ xp: 10, gold: 25, flags: { handed_over: true } },
            M('handed_it_over', 'handed Tyndareus the recipe and took the twenty-five gold'))
        },
        {
          text: 'Hand it over — and tell him to come to the bakery anyway.',
          goto: 'handed_and_invited',
          effects: Object.assign({ xp: 25, gold: 25, flags: { handed_over: true, invited: true } },
            M('handed_and_invited', 'gave Tyndareus the recipe and invited him to the bakery all the same'))
        }
      ]
    },

    tore_recipe: {
      title: 'Paper',
      art: 'tower',
      text: [
        `You take the three sheets out of your coat.`,
        `Tyndareus reaches for them with both hands, seventy years of wanting in his face.`,
        `And you tear them in half.`,
        `The silence is enormous. Crimp, by the door, has gone absolutely still.`,
        `"What—" says Tyndareus. "What have you— that was— do you know what you have just—"`,
        `You tear them again, and put the pieces on his desk among the bubbling potions and the ink-stained scraps.`
      ],
      choices: [
        {
          text: '"If you really want to find this pie again, you come with me to the bakery in the morning."',
          goto: 'the_words',
          effects: Object.assign({ xp: 35, bond: { tyndareus: 15 }, flags: { said_the_words: true } },
            M('said_the_words', 'told Tyndareus: "If he ever really wants to find this pie again, he goes with me to the bakery in the morning"'))
        },
        {
          text: 'Say nothing. Put the pie box on the desk instead.',
          goto: 'the_words',
          effects: Object.assign({ xp: 25, bond: { tyndareus: 10 }, flags: { pie_on_desk: true } },
            M('put_the_pie_down', 'tore up the recipe and put a whole pie on the wizard\'s desk without a word'))
        }
      ]
    },

    handed_it_over: {
      title: 'The Transaction',
      art: 'tower',
      text: [
        `You give him the recipe.`,
        `Tyndareus takes it in both hands and reads it standing up, and his face as he reads it is worth a great deal more than twenty-five gold pieces.`,
        `"Crimp," he says, hoarse. "Crimp, we shall need apples."`,
        `"We have apples," says Crimp.`,
        `"Then we shall need— I don't know what we shall need. You'll know. You always know."`,
        `He counts out your gold without looking at it, still reading. The job is done. It is exactly the job you were hired for, completed exactly as specified.`,
        `Crimp shows you to the door, and at the door he stops, and looks at you for a second longer than he needs to.`,
        `"He'll eat it in that chair," he says, "on his own, and then he'll want another one. That's how it goes with him."`
      ],
      choices: [
        { text: 'Leave it there.', goto: 'crimp_slice', effects: {} },
        { text: '"Then bring him to the bakery. Both of you."', goto: 'the_words', effects: Object.assign({ xp: 20, bond: { tyndareus: 10, crimp: 8 }, flags: { invited: true } }, M('invited_them_both', 'invited Tyndareus and Crimp to the bakery')) }
      ]
    },

    handed_and_invited: {
      title: 'Both',
      art: 'tower',
      text: [
        `You give him the recipe. And while he is still reading it, before he has got to the bottom of the first sheet, you tell him about the bakery.`,
        `About the chimney smoking. About nine goblins in aprons and a chief with a necklace of measuring spoons. About the Oven that has been lit for forty years because nobody told it to stop waiting.`,
        `"It's open," you tell him. "It opened yesterday. You could go."`,
        `Tyndareus lowers the paper very slowly.`,
        `"It's *open*," he says.`
      ],
      choices: [{ text: '"Come in the morning."', goto: 'the_words', effects: Object.assign({ xp: 25, bond: { tyndareus: 12 }, flags: { said_the_words: true } }, M('said_the_words', 'told Tyndareus to come to the bakery in the morning')) }]
    },

    the_words: {
      title: 'The Morning',
      art: 'tower',
      text: (S) => {
        const l = [];
        if (S.flags.said_the_words) {
          l.push(`"It's not the paper," you tell him. "It was never going to be the paper. You'd have got Crimp to bake it and you'd have eaten it in that chair and it would have been very good and it would not have been *it*."`);
          l.push(`"Then what—"`);
          l.push(`"It's a building with people in it. It's two miles of road and a chimney you can smell from the top of the hill. If you really want to find this pie again, you come with me to the bakery in the morning."`);
        } else {
          l.push(`You put the box on the desk among the potions and you open it.`);
          l.push(`Tyndareus looks at the pie for a long time without touching it.`);
        }
        l.push(`The old man sits down rather suddenly in the cosy chair with his shape worn into it.`);
        l.push(`"I'm ninety-six," he says.`);
        l.push(`"It's two days' ride. You've got a horse and a servant and nothing else to do."`);
        l.push(`Behind him, very quietly, Crimp says: "I'll get the cloak."`);
        return l;
      },
      choices: [{ text: 'Cut the pie.', goto: 'crimp_slice', effects: { xp: 15 } }]
    },

    crimp_slice: {
      title: 'The First Slice',
      art: 'tower',
      text: (S) => {
        const l = [];
        if (S.flags.reopened) l.push(`There is a whole Grammy's Country Apple Pie on the desk, and it is still warm, because it came out of an oven that has been waiting forty years to be worth the wait.`);
        else l.push(`Crimp has baked it. He read the recipe once, and vanished, and came back in eleven minutes with a Grammy's Country Apple Pie, because that is the sort of thing Crimp can do and nobody has ever once remarked on it.`);
        l.push(`You cut it. The crust goes through like paper — Rolling-Pin was right about the crust — and the smell that comes up out of it stops the conversation.`);
        l.push(`The first slice goes onto a plate.`);
        l.push(`Tyndareus the Green is sitting forward in his chair with his hands on his knees, seventy years of wanting, waiting for it.`);
        l.push(`And by the door, holding a cloak he has just been sent to fetch, is an imp in a red waistcoat who has answered that door ten thousand times.`);
        return l;
      },
      choices: [
        {
          text: 'Give the first slice to Crimp.',
          goto: 'crimp_given',
          effects: Object.assign({ xp: 40, bond: { crimp: 25, tyndareus: 10 }, flags: { slice_to_crimp: true } },
            M('slice_to_crimp', 'gave the first slice of Grammy\'s pie to Crimp, not to the wizard'))
        },
        {
          text: 'Give it to Tyndareus. He has waited seventy years.',
          goto: 'tyndareus_given',
          effects: Object.assign({ xp: 20, bond: { tyndareus: 15 }, flags: { slice_to_wizard: true } },
            M('slice_to_tyndareus', 'gave the first slice to Tyndareus'))
        },
        {
          text: 'Cut it for the whole room at once.',
          goto: 'crimp_given',
          effects: Object.assign({ xp: 25, bond: { crimp: 12, tyndareus: 12 }, flags: { slice_for_all: true } },
            M('slice_for_everyone', 'cut the pie for the whole room at once'))
        }
      ]
    },

    crimp_given: {
      title: 'For Once, No Sarcasm',
      art: 'tower',
      text: (S) => {
        const l = [];
        if (S.flags.slice_for_all) {
          l.push(`You cut it for the room — all three of you — and you put Crimp's plate down first, in front of the imp, before the wizard's.`);
        } else {
          l.push(`You turn away from the great wizard and you hold the plate out to the imp by the door.`);
        }
        l.push(`Crimp looks at it.`);
        l.push(`He does not take it immediately. He looks at the plate, and then at you, and then — briefly, and this is the part that matters — at Tyndareus, to check.`);
        l.push(`"...It's yours," you tell him. "First slice."`);
        l.push(`Four hundred years of answering the door. Ten thousand requests, and a sigh for every one of them.`);
        l.push(`Crimp takes the plate in both hands. He does not say anything sarcastic. He does not say anything at all, and his face does something complicated that he would deny under oath.`);
        l.push(`And Tyndareus the Green, watching from his chair, sees it.`);
        l.push(`You can see the exact moment he sees it.`);
        return l;
      },
      choices: [
        {
          text: '"Maybe not everyone that you knew is here anymore, but don\'t forget about the people you do have around you."',
          goto: 'last_words',
          effects: Object.assign({ xp: 40, bond: { tyndareus: 20, crimp: 10 }, flags: { said_last_words: true } },
            M('said_last_words', 'told Tyndareus: "don\'t forget about the people you do have around you"'))
        },
        { text: 'Say nothing. He got there on his own.', goto: 'last_words', effects: { xp: 25, bond: { tyndareus: 10 } } }
      ]
    },

    tyndareus_given: {
      title: 'Seventy Years',
      art: 'tower',
      text: [
        `You give the first slice to the old man, which is what you were paid to do, and which is fair.`,
        `Tyndareus eats it slowly, with his eyes shut, and somewhere in the middle of it he stops being ninety-six for a moment.`,
        `"Yes," he says. "Oh, yes. That's it. That's *it*."`,
        `By the door, Crimp holds the cloak and watches him eat, and waits to be needed, and does not expect a plate, because nobody has ever given him one.`,
        `There is a great deal of pie left.`
      ],
      choices: [
        { text: 'Cut a second slice and give it to Crimp.', goto: 'crimp_given', effects: Object.assign({ xp: 35, bond: { crimp: 20 }, flags: { slice_to_crimp: true } }, M('slice_to_crimp', 'gave Crimp a slice of the pie')) },
        { text: 'Leave them to it.', goto: 'last_words', effects: { xp: 10 } }
      ]
    },

    last_words: {
      title: 'The People You Do Have',
      art: 'tower',
      text: (S) => {
        const l = [];
        if (S.flags.said_last_words) {
          l.push(`"Maybe not everyone that you knew is here anymore," you tell him, "but don't forget about the people you do have around you."`);
          l.push(`Tyndareus the Green does not answer for a while.`);
          l.push(`Then he looks at Crimp — properly looks, in a way that four hundred years have not previously required of him — and says, "Crimp."`);
          l.push(`"Sir."`);
          l.push(`"Sit down and eat that."`);
          l.push(`"I'll stand, sir."`);
          l.push(`"*Sit down*, Crimp."`);
          l.push(`Crimp sits down. In a chair. In the study. With a plate.`);
        } else {
          l.push(`You don't say anything. You don't have to.`);
          l.push(`The old man looks at his imp for a long moment, and then says, "Crimp — sit down and eat that, would you," and Crimp, after a pause of enormous duration, sits.`);
        }
        l.push(`Outside, it has gone dark. Somewhere two days south, a bakery is shut for the night with nine goblins asleep above it and an Oven banked low and warm and no longer waiting for anything.`);
        return l;
      },
      choices: [{ text: 'Get some sleep. There\'s a ride in the morning.', goto: 'next_morning', effects: { xp: 15 } }]
    },

    next_morning: {
      title: 'The Next Morning',
      art: 'road',
      text: (S) => {
        const l = [];
        if (!S.flags.said_the_words && !S.flags.invited) {
          l.push(`You ride out at first light, alone, with twenty-five gold in your pack and the job done exactly as it was asked.`);
          l.push(`Two days south, a bakery opens at four in the morning, and nine goblins work a line that somebody showed them once, and the chimney smokes, and the town comes.`);
          l.push(`And in a tower two days north, an old man reads a recipe in a cosy chair, on his own.`);
          return l;
        }
        l.push(`He comes.`);
        l.push(`It takes two days and he complains for most of both of them, and Crimp has brought four blankets and a folding stool and a great deal of opinion about the state of the roads.`);
        l.push(`And then they come round the shoulder of the hill and the valley opens up, and the orchard is below them, and the chimney of Grammy's Bakery is smoking into a cold blue morning, and Tyndareus the Green stops talking.`);
        l.push(`He is seventy years old again and about four feet tall and standing in a lane with his mother telling him not to run.`);
        l.push(`"It's the same," he says. "Crimp. It's *exactly the same*."`);
        l.push(`They have been up since four. Pot-Helmet spots the horses first and the shouting starts before they are through the gate.`);
        l.push(`And by nine o'clock that morning there is an ancient wizard in the middle of Grammy's bakery floor with flour on his robes to the elbow, being taught to crimp a lid by a goblin who takes the crust extremely seriously, while Skritch counts him in as a volunteer and Nib — without being asked — portions out an extra share of butter.`);
        l.push(`Crimp sits on the step in the sun with a cup of tea and does not help with anything and is not asked to, and watches the old man laugh, and says nothing sarcastic for almost an hour.`);
        return l;
      },
      choices: [{ text: 'Stay for the morning.', goto: 'epilogue', effects: { xp: 25, flags: { came_back: true } } }]
    },

    epilogue: {
      title: 'Pie',
      art: 'bakery',
      // Perry's reward: 25 gold. Not doubled if he already took it at the desk.
      onEnter: (S) => ({ flags: { completed: true }, gold: S.flags.handed_over ? 0 : 25 }),
      text: (S) => {
        const l = [];
        l.push(`**Grammy's Country Apple Pie.** Adventure One.`);
        l.push(``);
        if (S.flags.reopened) l.push(`Grammy's Bakery is open. It opens at four. It has nine staff, a chief with a wooden spoon, an Assistant Crust Commander, and a sign outside that reads COME IN — WE ARE NOT DANGEROUS ANYMORE, which nobody has had the heart to change.`);
        if (S.flags.slice_to_crimp) l.push(`An imp in a red waistcoat received the first slice of a pie, and sat down in a chair in a study, and will deny that any of it meant anything.`);
        if (S.flags.came_back) l.push(`An old wizard found something better than a recipe, which was a place to come back to.`);
        if (S.flags.reconciled_trees) l.push(`In the orchard, two ancient apple trees are speaking to each other for the first time in forty years, mostly about the weather.`);
        if (S.bond('nib') >= 10) l.push(`Nib was given the first slice of the second pie, because he held the butter for forty years, and he ate it very slowly with both hands.`);
        if (S.flags.promised_rolling_pin || S.flags.praised_the_fold) l.push(`Rolling-Pin has eaten a proper crust. He has opinions about it. He is writing them down, with help.`);
        if (S.flags.town_told) l.push(`Pot-Helmet ran three miles to tell a town that pies were coming, and was believed, which it had not expected.`);
        l.push(``);
        l.push(`**No one was hurt. No one was driven away.**`);
        l.push(`The secret was never the apples.`);
        return l;
      },
      choices: [{ text: 'End the episode.', goto: null, effects: {} }]
    },

    /* ---------------- OTHER ENDINGS ---------------- */

    heist_ending: {
      title: 'The Job, Done',
      art: 'road',
      text: [
        `You go out of the window with Grammy Smithwick's recipe book under your coat, and nobody follows you, because nobody in that building is the sort of person who chases.`,
        `Two days north. Tyndareus is delighted. He pays you twenty-five gold pieces and reads the book in his chair with tea going cold at his elbow, and Crimp bakes the pie that evening, and it is, by every measure that can be written down, correct.`,
        `The old man eats it and his face does not do the thing you were expecting.`,
        `"It's right," he says slowly. "Every bit of it's right."`,
        `He puts the fork down.`,
        `"I don't know what I thought it would be," he says. "I suppose I thought there'd be more of it."`,
        `Two days south, in a bakery, nine goblins get up at four in the morning out of habit, and find a gap on a shelf, and do not say anything to each other about it for a long time.`
      ],
      choices: [{ text: 'Take the gold.', goto: 'epilogue', effects: Object.assign({ gold: 25, flags: { heist: true, completed: true } }, M('the_heist_ending', 'stole the recipe, delivered it, and was paid')) }]
    },

    ko: {
      title: 'Down',
      art: 'ko',
      text: [
        `The floor comes up to meet you.`,
        `Somewhere a long way off there is shouting, and then hands — small ones, a lot of them — and somebody saying *mind his head, MIND HIS HEAD*.`,
        `You come round on a flour sack in the warm, with a folded apron under your neck and a very small goblin sitting nearby holding a bowl of water and looking extremely worried.`,
        `"You fell over," says Nib.`
      ],
      choices: [{ text: 'Get up.', goto: 'the_great_bake', effects: { hp: 4 } }]
    }
  };

  TDM.EP1_SCENES_C = scenes;
})();
