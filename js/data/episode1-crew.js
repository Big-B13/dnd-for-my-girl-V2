/* ============================================================
   EPISODE ONE, PART B — The Crew, the Oven, and Grammy
   Scenes 8 through 13 of Perry's run.
   "He met each of them as crewmates, not creatures."
   ============================================================ */
(function () {
  const TDM = (typeof window !== 'undefined')
    ? (window.TDM = window.TDM || {})
    : (global.TDM = global.TDM || {});

  const M = (key, text, extra) => Object.assign({ chronicleKey: key, chronicle: text, remember: true }, extra || {});
  const met = (S) => ['pot_helmet', 'rolling_pin', 'nib', 'skritch'].filter(g => S.flags['met_' + g]).length;

  const scenes = {

    /* ---------------- MEETING THE CREW ---------------- */

    crew: {
      title: 'The Crew',
      art: 'floor',
      text: (S) => {
        const n = met(S);
        if (n === 0) return [
          `"This lot," says Grubnash, with the air of a man introducing his family and bracing for it, "are the crew."`,
          `Four of them have detached from the general flour-covered mass of the room and arranged themselves in what is very nearly a line. They have clearly been waiting for this. One of them has been practising.`,
          `They are: a goblin wearing a cooking pot as a helmet, vibrating. An enormous one holding a rolling pin like a sword. A very small one holding a butter crock with both arms. And a tall thin nervous one with a clipboard, who has already started writing.`,
          `"Go on then," says Grubnash. "Say hello. They'll not settle till you do."`
        ];
        if (n === 4) return [
          `Pot-Helmet, Rolling-Pin, Nib and Skritch. The whole crew of Grammy's Bakery, such as it is.`,
          `They have gone back to their benches, mostly, and are working, and every thirty seconds one of them looks over to check that you are still there.`,
          `Grubnash watches them, and then watches you watching them.`,
          `"They like you," he says, quietly. "Don't muck it up."`
        ];
        return [
          `The rest of the crew are still waiting, with varying degrees of patience.`,
          `You have met ${n} of the four.`
        ];
      },
      choices: [
        { text: 'The one in the cooking pot, who is about to burst.', if: (S) => !S.flags.met_pot_helmet, goto: 'meet_pot_helmet', effects: {} },
        { text: 'The big one with the rolling pin.', if: (S) => !S.flags.met_rolling_pin, goto: 'meet_rolling_pin', effects: {} },
        { text: 'The very small one holding the butter.', if: (S) => !S.flags.met_nib, goto: 'meet_nib', effects: {} },
        { text: 'The thin nervous one with the clipboard.', if: (S) => !S.flags.met_skritch, goto: 'meet_skritch', effects: {} },
        {
          text: 'That\'s all of them. Ask Grubnash about the Oven.',
          if: (S) => met(S) === 4,
          goto: 'the_oven',
          effects: Object.assign({ xp: 10, bond: { goblins: 6 }, flags: { met_the_crew: true } },
            M('met_the_crew', 'met Pot-Helmet, Rolling-Pin, Nib and Skritch as crewmates, one by one'))
        },
        {
          text: 'You have met enough of them. Get on with the job.',
          if: (S) => met(S) >= 1 && met(S) < 4,
          goto: 'the_oven',
          effects: Object.assign({ flags: { met_the_crew: false, rushed_past_crew: true } },
            M('rushed_past_the_crew', 'did not stop to meet the whole crew'))
        }
      ]
    },

    meet_pot_helmet: {
      title: 'Pot-Helmet',
      art: 'floor',
      text: [
        `The goblin in the cooking pot does not wait to be introduced. It has been holding this in for the entire conversation and something has to give.`,
        `"POT-HELMET," it announces, at a volume suitable for addressing a parade ground from the back. "That's me. That's my name. It's because of the—" it knocks on the pot, twice, producing a deep and satisfying bong "—yes."`,
        `"Is it for protection?"`,
        `"It's for MORALE."`,
        `It leans in, conspiratorially, which for Pot-Helmet means lowering its voice to a shout.`,
        `"I do the MARKETING," it says. "For when we open. I've made signs. Eleven signs. Do you want to see the signs?"`,
        `Behind it, Grubnash mouths *please say no* at you with real desperation.`
      ],
      choices: [
        {
          text: '"Show me the signs."',
          goto: 'pot_helmet_signs',
          effects: Object.assign({ xp: 10, bond: { pot_helmet: 12 }, flags: { met_pot_helmet: true, saw_the_signs: true } },
            M('saw_the_signs', 'asked to see the eleven signs Pot-Helmet had made for the reopening'))
        },
        {
          text: '"Later. But I want to see them."',
          goto: 'crew',
          effects: { xp: 5, bond: { pot_helmet: 6 }, flags: { met_pot_helmet: true } }
        },
        {
          text: 'Shake its hand and move on.',
          goto: 'crew',
          effects: { xp: 5, bond: { pot_helmet: 2 }, flags: { met_pot_helmet: true } }
        }
      ]
    },

    pot_helmet_signs: {
      title: 'Eleven Signs',
      art: 'shop',
      text: [
        `There are eleven of them. Boards, charcoal, stacked against the wall of the front room under a cloth, and the cloth has been kept clean.`,
        `They say:`,
        `**PIE SOON.** — **GRAMMY IS BACK (NOT REALLY).** — **WE HAVE APPLES.** — **THE OVEN IS FINE.** — **COME IN WE ARE NOT DANGEROUS ANYMORE.**`,
        `And six more, in the same careful, wobbling charcoal capitals.`,
        `"I started them the first year," says Pot-Helmet, at something close to a normal volume for the first time. "For when we got good. So we'd be ready. You have to be ready."`,
        `It straightens one that was not crooked.`,
        `"That was thirty-nine years ago," it says. "I do them again when they fade."`
      ],
      choices: [
        {
          text: '"We\'re going to need these."',
          goto: 'crew',
          effects: Object.assign({ xp: 10, bond: { pot_helmet: 12 }, flags: { met_pot_helmet: true, promised_signs: true } },
            M('promised_the_signs', 'promised Pot-Helmet that the eleven signs would go up'))
        },
        {
          text: 'Gently suggest editing "NOT DANGEROUS ANYMORE".',
          goto: 'crew',
          effects: Object.assign({ xp: 5, bond: { pot_helmet: 5 }, flags: { met_pot_helmet: true, edited_sign: true } },
            M('edited_the_sign', 'talked Pot-Helmet out of the sign reading COME IN WE ARE NOT DANGEROUS ANYMORE'))
        }
      ]
    },

    meet_rolling_pin: {
      title: 'Rolling-Pin',
      art: 'floor',
      text: [
        `The big one steps forward and salutes. It is not a good salute. It has clearly been assembled from a description of a salute given by somebody who also had never seen one.`,
        `"ROLLING-PIN," it says. "Assistant Crust Commander."`,
        `"Who's the Crust Commander?"`,
        `A pause.`,
        `"There isn't one," says Rolling-Pin. "Yet. I'm assistant *pending*." It draws itself up. "You don't give yourself the top job. That'd be arrogant."`,
        `It is holding the rolling pin across its body like a ceremonial weapon. The wood is worn pale and smooth in two places where its hands go.`
      ],
      choices: [
        {
          text: 'Ask what the Assistant Crust Commander actually does.',
          goto: 'rolling_pin_crust',
          effects: Object.assign({ xp: 10, bond: { rolling_pin: 10 }, flags: { met_rolling_pin: true } },
            M('asked_about_the_crust', 'asked the Assistant Crust Commander what the job involved'))
        },
        {
          text: 'Salute back. Properly.',
          goto: 'crew',
          effects: Object.assign({ xp: 10, bond: { rolling_pin: 12 }, flags: { met_rolling_pin: true, saluted: true } },
            M('saluted_rolling_pin', 'returned Rolling-Pin\'s salute properly'))
        },
        {
          text: 'Move on down the line.',
          goto: 'crew',
          effects: { xp: 5, bond: { rolling_pin: 1 }, flags: { met_rolling_pin: true } }
        }
      ]
    },

    rolling_pin_crust: {
      title: 'The Crust',
      art: 'floor',
      text: [
        `"The CRUST," says Rolling-Pin, in the tone of a man who has waited his whole life to be asked, "is the part everyone gets wrong."`,
        `It takes you to the far bench, where there is a lump of dough, and begins — without asking whether you want to see this — to fold it. Fold, turn. Fold, turn. Quarter turn each time, edges square, and the hands are very sure.`,
        `It is lamination. Nobody taught it lamination. It worked it out, over forty years, from the pictures in a book it cannot read.`,
        `"They all think it's the filling," it says, folding. "It's not the filling. It's this. You do this right, three hundred times, and it comes out like paper."`,
        `It stops and looks at the dough.`,
        `"I've never eaten one," it says. "A right one. So I don't know what I'm aiming for. I just know it's not what we keep making."`
      ],
      choices: [
        {
          text: '"The fold is right. I can see it from here."',
          goto: 'crew',
          effects: Object.assign({ xp: 10, bond: { rolling_pin: 14 }, flags: { met_rolling_pin: true, praised_the_fold: true } },
            M('praised_the_fold', 'told Rolling-Pin his lamination was right — the first praise he had ever had'))
        },
        {
          text: '"Before I leave, you\'re going to taste a proper one."',
          goto: 'crew',
          effects: Object.assign({ xp: 10, bond: { rolling_pin: 15 }, flags: { met_rolling_pin: true, promised_rolling_pin: true } },
            M('promised_rolling_pin', 'promised Rolling-Pin he would taste a proper crust before the day was out'))
        }
      ]
    },

    meet_nib: {
      title: 'Nib',
      art: 'floor',
      text: [
        `The smallest one does not step forward. It stays exactly where it is, holding a butter crock with both arms, and looks up at you.`,
        `"Nib," says Grubnash, "say hello."`,
        `"Hello," says Nib.`,
        `And that is all. It keeps hold of the butter.`,
        `"He's got the butter and the sugar," says Grubnash. "Only one allowed. He's the only one who doesn't eat it."`,
        `"Everyone eats it," says Nib, to you, quietly. It is the longest sentence he has produced. "That's why there's never enough for the baking. So I hold it."`
      ],
      choices: [
        {
          text: '"That\'s the most important job in the building."',
          goto: 'nib_butter',
          effects: Object.assign({ xp: 10, bond: { nib: 14 }, flags: { met_nib: true, honoured_nib: true } },
            M('honoured_nib', 'told Nib that holding the butter was the most important job in the bakery'))
        },
        {
          text: 'Crouch down so you\'re not looming, and ask how much is left.',
          goto: 'nib_butter',
          effects: Object.assign({ xp: 10, bond: { nib: 12 }, flags: { met_nib: true, crouched_for_nib: true } },
            M('crouched_for_nib', 'crouched down to talk to Nib at his own height'))
        },
        {
          text: 'Nod, and move on.',
          goto: 'crew',
          effects: { xp: 5, flags: { met_nib: true } }
        }
      ]
    },

    nib_butter: {
      title: 'What Nib Is Holding',
      art: 'floor',
      text: (S) => {
        const l = [];
        if (S.flags.crouched_for_nib) l.push(`You crouch. It takes Nib a moment to adjust to being spoken to at eye level; it is plainly not a thing that happens.`);
        l.push(`"Two crocks," he says. "There was nine. It has to last."`);
        l.push(`He turns the crock around and shows you the side, where somebody has scratched a row of small careful marks into the glaze — a tally, going back years, getting further apart.`);
        l.push(`"I do the portions," he says. "For when we get it right. Everyone gets the same. I've got it worked out." A pause. "I did it again last week. In case anyone new came."`);
        l.push(`He looks at you, and then very quickly back down at the butter.`);
        if (S.flags.honoured_nib) l.push(`He does not say anything about what you told him. But he does not go back to the bench, either. He stays near you for the rest of the afternoon, at a distance of about four feet, holding the butter.`);
        return l;
      },
      choices: [{ text: 'Back to the line.', goto: 'crew', effects: { xp: 5 } }]
    },

    meet_skritch: {
      title: 'Skritch',
      art: 'floor',
      text: [
        `The tall thin one has been writing since you came in.`,
        `"Skritch," it says, without looking up. "Paperwork and inventory. I'm recording your arrival. Do you have a — sorry — do you have a *name*, or shall I put 'the person'?"`,
        `You give it your name. It writes it down, and then spells it back to you, and corrects itself, and writes it again.`,
        `"Right," it says. "Good. That's — yes. That's the first entry this year that isn't flour."`,
        `Its hand is shaking very slightly. It notices you notice, and grips the clipboard harder.`
      ],
      choices: [
        {
          text: 'Ask what else is in the ledger.',
          goto: 'skritch_ledger',
          effects: Object.assign({ xp: 10, bond: { skritch: 10 }, flags: { met_skritch: true } },
            M('asked_about_the_ledger', 'asked Skritch what was in his ledger'))
        },
        {
          text: '"You\'ve been keeping records for forty years and nobody asked you to."',
          goto: 'skritch_ledger',
          effects: Object.assign({ xp: 10, bond: { skritch: 14 }, flags: { met_skritch: true, saw_skritch: true } },
            M('saw_skritch', 'noticed that Skritch had been keeping the bakery\'s records for forty years unasked'))
        },
        {
          text: 'Let it get back to work.',
          goto: 'crew',
          effects: { xp: 5, flags: { met_skritch: true } }
        }
      ]
    },

    skritch_ledger: {
      title: 'Every Attempt',
      art: 'floor',
      text: (S) => {
        const l = [];
        l.push(`Skritch turns the clipboard round, and it is not a clipboard. It is the top sheet of something much larger — a stack of paper four inches thick, squared off, tied with string.`);
        l.push(`**THINGS WE HAVE TRIED.**`);
        l.push(`Every attempt. Every single one, for forty years. Dated. Described. What went in, who did it, what came out. Hundreds of pages in three different inks, the handwriting getting smaller as the paper ran short.`);
        l.push(`And every entry, all the way down, ends in the same three words.`);
        l.push(`*It was wrong.*`);
        if (S.flags.saw_skritch) l.push(`"Nobody reads it," says Skritch. "I know nobody reads it. I write it because if we ever do it right, we'll want to know which thing was the thing."`);
        l.push(`"Have you ever worked out what's missing?"`);
        l.push(`"It's not an ingredient," says Skritch immediately. "I've checked. I've checked *everything*. It's not an ingredient and I don't know what else there is."`);
        return l;
      },
      choices: [
        {
          text: '"We\'ll find out. And you\'ll write that one down too."',
          goto: 'crew',
          effects: Object.assign({ xp: 10, bond: { skritch: 14 }, flags: { skritch_promise: true } },
            M('promised_skritch', 'promised Skritch he would get to write down the attempt that finally worked'))
        },
        { text: 'Read a few pages properly before handing it back.', goto: 'crew', effects: Object.assign({ xp: 10, bond: { skritch: 11 } }, M('read_the_ledger', 'read Skritch\'s ledger of forty years of failures')) }
      ]
    },

    /* ---------------- THE OVEN ---------------- */

    the_oven: {
      title: 'The Oven',
      art: 'floor',
      text: (S) => {
        const l = [];
        l.push(`At the back of the bakery floor, taking up the entire end wall, is the Oven.`);
        l.push(`It is the size of a cottage. Iron and brick and a door like a bank vault, and it is lit, and nobody lit it. Above it, the great chimney goes up into the dark.`);
        l.push(`And the room around it is *working*. Rolling pins roll themselves along the benches. Dulled knives rise and chop at a board where there have been no apples for forty years. A ladle stirs an empty bowl, patiently, endlessly.`);
        l.push(`The goblins have all gone quiet and moved back a step, in unison, without seeming to notice they did it.`);
        l.push(`Then the Oven speaks. It is one word, and it comes up through the floor and the soles of your boots, and flour comes down out of the rafters.`);
        l.push(`> **"APPLES."**`);
        if (S.flags.has_apples) l.push(`The two apples in your pack suddenly feel very conspicuous.`);
        return l;
      },
      choices: [
        {
          text: 'Walk up to it and ask what it needs.',
          goto: 'oven_help',
          effects: Object.assign({ xp: 15, bond: { oven: 10 }, flags: { approached_oven: true } },
            M('helped_oven', 'walked up to the living Oven and offered to help it'))
        },
        {
          text: 'Ask the goblins about it first.',
          goto: 'oven_goblin_brief',
          effects: Object.assign({ xp: 5, bond: { grubnash: 3 }, flags: { asked_about_oven: true } },
            M('asked_about_the_oven', 'asked the goblins about the Oven before speaking to it'))
        },
        {
          text: 'Offer it the apples the trees gave you.',
          if: (S) => !!S.flags.has_apples,
          goto: 'oven_apples',
          effects: Object.assign({ xp: 10, bond: { oven: 8 }, flags: { fed_oven: true } },
            M('fed_the_oven', 'offered the orchard\'s apples to the Oven'))
        },
        {
          text: 'Keep well back. It is a burning thing the size of a house.',
          goto: 'oven_backed_off',
          effects: Object.assign({ xp: 5, bond: { oven: -4 } }, M('kept_back_from_oven', 'kept well back from the Oven'))
        }
      ]
    },

    oven_goblin_brief: {
      title: 'What the Goblins Know',
      art: 'floor',
      text: [
        `"It talks," says Grubnash, unhelpfully.`,
        `"We know it talks," says Skritch, writing. "It's in the ledger. Four words. It's always the same four words."`,
        `"APPLES," says Pot-Helmet, counting on its fingers. "SONG. TRUTH. And SHARE, but it only ever said SHARE the once and it was very loud and Nib hid."`,
        `"I didn't hide," says Nib.`,
        `"He hid."`,
        `"What do the words mean?" you ask.`,
        `Five goblins look at each other. Forty years, and it has plainly never once occurred to any of them that the words might be *instructions*.`,
        `"We thought it was just... what it says," says Grubnash slowly. "Like a bird."`
      ],
      choices: [
        { text: 'Go and talk to it.', goto: 'oven_help', effects: Object.assign({ xp: 10, bond: { oven: 8 }, flags: { approached_oven: true, knows_four_words: true } }, M('helped_oven', 'worked out the Oven\'s words were instructions, and went to talk to it')) }
      ]
    },

    oven_apples: {
      title: 'Apples',
      art: 'floor',
      text: [
        `You take out the red apple and the green apple and you hold them up in front of the Oven's great iron door.`,
        `The fires behind the grate change colour.`,
        `> **"APPLES."**`,
        `It says it differently this time. Not a demand. Something much closer to recognition — the way you'd say the name of someone you had not seen in a very long time.`,
        `The door swings open a hand's breadth. Heat rolls out, and with it a smell that stops every goblin in the room dead: cinnamon and butter and browning pastry, out of an oven that has baked nothing good in forty years.`,
        `"It's never done that," whispers Grubnash. "In forty years it has never once done that."`
      ],
      choices: [
        { text: 'Ask it what it wants.', goto: 'oven_help', effects: Object.assign({ xp: 15, bond: { oven: 12 }, flags: { approached_oven: true, oven_opened: true } }, M('helped_oven', 'showed the Oven the orchard\'s apples, and it opened for the first time in forty years')) }
      ]
    },

    oven_backed_off: {
      title: 'A Safe Distance',
      art: 'floor',
      text: [
        `You stay where you are. It is, after all, a burning thing the size of a house that talks.`,
        `The Oven waits. The rolling pins roll. The knives chop nothing, patiently.`,
        `After a while the fires bank down a little, and the room gets colder, and Grubnash says, very quietly, "It does that when it's given up on someone."`,
        `Nobody says anything else for a moment.`
      ],
      choices: [
        { text: 'Change your mind. Go and talk to it.', goto: 'oven_help', effects: Object.assign({ xp: 10, bond: { oven: 6 }, flags: { approached_oven: true } }, M('helped_oven', 'thought better of it, and went to speak to the Oven after all')) },
        { text: 'Leave it. Get on with finding the recipe.', goto: 'the_search', effects: Object.assign({ flags: { ignored_oven: true } }, M('ignored_the_oven', 'left the Oven alone and went looking for the recipe')) }
      ]
    },

    oven_help: {
      title: 'The Question',
      art: 'floor',
      text: (S) => {
        const l = [];
        l.push(`You walk up to the Oven. Close to, the heat is enormous and the iron is scored with forty years of goblin attempts to make it happy.`);
        l.push(`Behind you the whole room has stopped.`);
        l.push(`And you ask it the question nobody has asked it — not the goblins, who feared it and obeyed it, and not Grammy, who never had to.`);
        l.push(`**"What do you want?"**`);
        l.push(`The fires go very still.`);
        l.push(`It is a magical thing that has been alone for forty years. It has been used. It has been feared. It has been shouted at, and prayed to, and fed things that were not food, and in all that time nobody has once asked it what it wanted.`);
        return l;
      },
      choices: [
        {
          text: '"I want to help everyone here. Including you."',
          goto: 'oven_lessons',
          effects: Object.assign({ xp: 20, bond: { oven: 20, goblins: 6 }, flags: { oven_pact: true } },
            M('oven_promise', 'told the Oven: "I want to help everyone here, including you"'))
        },
        {
          text: '"I want the recipe. Tell me what it takes."',
          goto: 'oven_lessons',
          effects: Object.assign({ xp: 5, bond: { oven: 3 }, flags: { oven_transactional: true } },
            M('bargained_with_the_oven', 'asked the Oven for the recipe rather than offering it anything'))
        },
        {
          text: 'Say nothing. Wait and see what it does.',
          goto: 'oven_lessons',
          effects: Object.assign({ xp: 5, bond: { oven: 1 } }, M('waited_on_the_oven', 'said nothing, and let the Oven speak first'))
        }
      ]
    },

    oven_lessons: {
      title: 'The Secret Is Not the Apples',
      art: 'floor',
      text: (S) => {
        const l = [];
        if (S.flags.oven_pact) {
          l.push(`The Oven rumbles — and it is *warm*. Not hot. Warm, the way a room is warm. The blaze behind the grate settles down into a deep steady glow, and the whole bakery seems to let its shoulders down at once.`);
          l.push(`Behind you, somebody sits down on the floor rather suddenly. It is Grubnash.`);
        } else {
          l.push(`The fires consider you. Then, evenly, without any particular warmth, the Oven begins to teach.`);
        }
        l.push(`It speaks the way it always has — one word at a time, each one shaking flour out of the rafters — but now the words are in an order, and the order is the whole thing.`);
        l.push(`> **"APPLES."** — real ones. The orchard's own. Not what you can get. What is actually *here*.`);
        l.push(`> **"SONG."** — joy, while the work is done. A kitchen worked in silence bakes silence.`);
        l.push(`> **"TRUTH."** — whatever you bring to it is what comes out. Fear makes a frightened pie. Misery makes a miserable one. Forty years of goblins who were ashamed of themselves made four thousand ashamed pies.`);
        l.push(`And then, last, loud enough to rattle the boarded windows:`);
        l.push(`> **"THE SECRET IS NOT THE APPLES."**`);
        l.push(`Skritch has gone absolutely white. He is writing as fast as his hand will go.`);
        return l;
      },
      choices: [
        { text: 'Turn round and tell the goblins what that means.', goto: 'oven_explained', effects: Object.assign({ xp: 15, bond: { goblins: 10, grubnash: 8 }, flags: { explained_to_goblins: true } }, M('explained_the_secret', 'turned round and explained to the goblins that their pies were sad because they were')) },
        { text: 'Keep it to yourself for now. Go and find the recipe.', goto: 'the_search', effects: Object.assign({ xp: 5, flags: { kept_secret: true } }, M('kept_the_secret', 'kept the Oven\'s secret to himself')) }
      ]
    },

    oven_explained: {
      title: 'Forty Years of Sad Pies',
      art: 'floor',
      text: [
        `You turn round and you tell them.`,
        `That it was never the flour, or the fat, or the oven temperature, or the thousand things in Skritch's ledger. That the Oven bakes what you bring it. That for forty years a crew of goblins who believed they were squatters and thieves and no good at anything have been pouring exactly that into every single pie.`,
        `"So they came out sad," says Skritch, "because *we* were."`,
        `"Yes."`,
        `Nobody says anything.`,
        `"Well that's—" Grubnash's voice does something. He starts again. "That's a *stupid* reason. That's the stupidest reason I ever heard. Forty years."`,
        `"Can we fix it?" says Nib.`,
        `Every goblin in the room turns to look at you.`
      ],
      choices: [
        { text: '"Yes. Today."', goto: 'the_search', effects: Object.assign({ xp: 15, bond: { goblins: 12, grubnash: 10, nib: 6 }, flags: { promised_today: true } }, M('promised_today', 'promised a room full of goblins that they would fix it today')) }
      ]
    },

    /* ---------------- THE SEARCH ---------------- */

    the_search: {
      title: 'The Search',
      art: 'floor',
      text: [
        `Somewhere in this building is Grammy Smithwick's actual recipe.`,
        `It is a big building. Forty years of goblin occupation have not made it tidier. There is the office, the cold-rooms, the shop front, the cellars, a great deal of shelving, and roughly nine hundred places a small book could be.`,
        `You could take it apart yourself and it would take until nightfall.`,
        `Or there are ten people here who have lived in this building for four decades.`
      ],
      choices: [
        {
          text: 'Ask Grubnash. He\'s been looking for forty years — start where he left off.',
          check: { stat: 'INT', skill: 'investigation', dc: 14, label: 'Investigation' },
          success: { goto: 'search_success', effects: Object.assign({ xp: 15, bond: { grubnash: 8 }, flags: { asked_for_help: true } }, M('investigated', 'searched the bakery with Grubnash\'s help, and found it')) },
          fail: { goto: 'search_slow', effects: { note: 'Between you, you rule out most of the building. Most.', flags: { asked_for_help: true } } }
        },
        {
          text: 'Ask Skritch. Forty years of records have to be good for something.',
          goto: 'search_skritch',
          effects: Object.assign({ xp: 15, bond: { skritch: 12 }, flags: { asked_skritch: true } },
            M('asked_skritch_to_search', 'used Skritch\'s forty years of records to narrow the search'))
        },
        {
          text: 'Search it alone. Quietly.',
          check: { stat: 'INT', skill: 'investigation', dc: 17, label: 'Investigation' },
          success: { goto: 'search_success', effects: Object.assign({ xp: 10, flags: { searched_alone: true } }, M('searched_alone', 'found the recipe by searching the bakery alone')) },
          fail: { goto: 'search_slow', effects: { note: 'You work through it room by room and come up with nothing but dust.', flags: { searched_alone: true } } }
        }
      ]
    },

    search_skritch: {
      title: 'What the Records Say',
      art: 'office',
      text: [
        `Skritch goes very still when you ask, the way people do when the thing they are for is finally required.`,
        `"Right," he says. "Right. Yes."`,
        `He unties the string. He works backwards through forty years at enormous speed, muttering, and about four minutes in he stops and puts his finger on a line.`,
        `"There. Year six. *'Searched the office. Nothing on the shelves.'*" He looks up. "But that's the thing — we searched the *shelves*. Nobody searched the office. We were looking for a book. The book's been on the shelf the whole time. It's the loose pages that aren't."`,
        `"Loose pages?"`,
        `"She wrote in the margins," says Skritch. "All the good bakers do. It's in the *book*, but the real one — the one she actually used — she'd have kept that where she worked."`
      ],
      choices: [
        { text: 'Go to the office.', goto: 'search_success', effects: { xp: 10, flags: { skritch_solved_it: true } } }
      ]
    },

    search_slow: {
      title: 'The Long Way',
      art: 'office',
      text: [
        `It takes most of the afternoon and it is not elegant.`,
        `You rule out the cellars, the cold-rooms, the shop front and four of the five storerooms. Goblins bring you things at intervals — a ledger, a tin, a bird's nest, a boot — with enormous hope, and take them away again.`,
        `By the time the light starts going, you have not found it. But you have narrowed it to one room, which everybody has always called Grammy's office, and which nobody has properly been into for forty years because — as Pot-Helmet puts it, cheerfully — "it's got a *feeling*."`
      ],
      choices: [
        { text: 'Go into the office.', goto: 'search_success', effects: { xp: 5 } }
      ]
    },

    search_success: {
      title: 'The Bargain',
      art: 'office',
      text: (S) => {
        const l = [];
        l.push(`The office door is at the top of three steps behind the shop front, and it is colder in there than it has any right to be.`);
        l.push(`A desk. A chair too small for you. A shelf of ledgers — and on it, a fat book bound in green cloth with a faded apple stamped on the spine.`);
        l.push(`**Grammy's recipe book.**`);
        l.push(`Grubnash has come as far as the doorway and stopped, the way you stop at the edge of somebody else's grief.`);
        l.push(`"That's it," he says. "That's been there the whole time. We never—" He stops. "It didn't feel like ours to take."`);
        return l;
      },
      choices: [
        {
          text: 'Ask Grubnash\'s permission before you touch it — and ask that all the goblins help bake.',
          goto: 'the_bargain',
          effects: Object.assign({ xp: 20, bond: { grubnash: 15, goblins: 12 }, flags: { asked_permission: true, all_goblins_bake: true } },
            M('all_goblins_bake', 'asked permission to take the recipe, and asked that every goblin help bake'))
        },
        {
          text: 'Ask his permission to take it.',
          goto: 'the_bargain',
          effects: Object.assign({ xp: 10, bond: { grubnash: 8 }, flags: { asked_permission: true } },
            M('asked_permission', 'asked Grubnash\'s permission before taking the recipe book'))
        },
        {
          text: 'Take it off the shelf. It\'s what you came for.',
          goto: 'grammy_office',
          effects: Object.assign({ xp: 5, bond: { grubnash: -6 }, flags: { took_without_asking: true } },
            M('took_without_asking', 'took the recipe book down without asking anyone'))
        }
      ]
    },

    the_bargain: {
      title: 'Not Watch. Help.',
      art: 'office',
      text: (S) => {
        const l = [];
        l.push(`Grubnash stares at you.`);
        l.push(`"You're *asking* me," he says. "It's not mine. None of it's mine. We just— we live here."`);
        l.push(`"You've lived here forty years. I'm asking."`);
        l.push(`It takes him a moment.`);
        l.push(`"...Then yes," he says. "Yes. Take it."`);
        if (S.flags.all_goblins_bake) {
          l.push(`"One condition," you say. "Everybody bakes. Not watching. Not fetching. Every one of them, hands in it."`);
          l.push(`Grubnash looks past you at the door, where — it turns out — the entire crew has been standing in the corridor listening, and has been for some time.`);
          l.push(`"You hear that?" he says, in a voice that isn't quite steady. "Get your hands washed."`);
        }
        return l;
      },
      choices: [{ text: 'Take the book down off the shelf.', goto: 'grammy_office', effects: { xp: 5 } }]
    },

    /* ---------------- GRAMMY ---------------- */

    grammy_office: {
      title: 'Grammy Smithwick',
      art: 'office',
      text: [
        `The moment your hand closes on the book, the room gets colder, and the door swings shut behind you without touching anything.`,
        `The dust in the air stops moving. Then it begins, very gently, to move the other way.`,
        `There is an old woman standing at the window. She was not there. She is not entirely there now — you can see the boarded glass through her — but she is quite clearly an old woman in an apron with flour on her hands, and she is looking at you with her head slightly on one side.`,
        `She does not look frightening. She looks like she is deciding something.`,
        `**"Are you going to do this properly?"** says Grammy Smithwick.`
      ],
      choices: [
        {
          text: '"Yes."',
          goto: 'grammy_test',
          effects: Object.assign({ xp: 15, bond: { grammy: 12 }, flags: { said_yes: true } },
            M('grammy_yes', 'answered Grammy Smithwick\'s spirit with one word: "Yes"'))
        },
        {
          text: '"I don\'t know. I\'m going to try."',
          goto: 'grammy_test',
          effects: Object.assign({ xp: 15, bond: { grammy: 10 }, flags: { said_honest: true } },
            M('grammy_honest', 'told Grammy\'s spirit the honest answer: "I don\'t know. I\'m going to try"'))
        },
        {
          text: 'Tell her what she wants to hear.',
          goto: 'grammy_lie',
          effects: Object.assign({ xp: 5, bond: { grammy: -10 }, flags: { lied_to_grammy: true } },
            M('lied_to_grammy', 'lied to Grammy Smithwick\'s spirit'))
        }
      ]
    },

    grammy_lie: {
      title: 'She Has Been Lied To Before',
      art: 'office',
      text: [
        `You say the right words in the right order.`,
        `Grammy Smithwick listens to all of it. Then she sighs, and it is the most disappointed sound you have ever heard.`,
        `"I ran a shop for fifty-one years," she says. "Do you know how many people have stood in this room and told me exactly what I wanted to hear?"`,
        `The cold goes out of the room. So does she — fading not dramatically but simply, like someone leaving a conversation that has stopped being worth having.`,
        `**"Take it, then,"** she says, from somewhere further off. **"It's only paper."**`,
        `You are alone with a book, and the room feels like any other room.`
      ],
      choices: [
        { text: 'Take the book and go.', goto: 'grammy_done', effects: Object.assign({ flags: { no_blessing: true } }, M('lost_the_blessing', 'took the recipe without Grammy\'s blessing')) }
      ]
    },

    grammy_test: {
      title: 'Three Questions',
      art: 'office',
      text: [
        `Grammy Smithwick nods once, as though a small matter has been settled, and comes away from the window.`,
        `"Right," she says. "Then I've got questions, and you'll answer them honest, and then we'll see."`,
        `She looks you up and down.`,
        `"First one. There's a crew of goblins out there who've been in my bakery forty years, burning my flour and crying over it."`,
        `**"What are you going to do about them?"**`
      ],
      choices: [
        {
          text: '"Bake with them."',
          goto: 'grammy_q2',
          effects: Object.assign({ xp: 15, bond: { grammy: 12, goblins: 8 } },
            M('grammy_bake_with_them', 'told Grammy\'s spirit he was going to bake with the goblins'))
        },
        {
          text: '"Teach them. Properly. And then leave them to it."',
          goto: 'grammy_q2',
          effects: Object.assign({ xp: 15, bond: { grammy: 10, goblins: 6 } },
            M('grammy_teach_them', 'promised Grammy\'s spirit he would teach the goblins properly'))
        },
        {
          text: '"Nothing. They live here. It\'s their bakery now."',
          goto: 'grammy_q2',
          effects: Object.assign({ xp: 15, bond: { grammy: 11, goblins: 10 } },
            M('grammy_its_theirs', 'told Grammy\'s spirit that the bakery belonged to the goblins now'))
        }
      ]
    },

    grammy_q2: {
      title: 'The Second Question',
      art: 'office',
      text: [
        `Something in her face eases.`,
        `"Second," she says. "There's an old man sent you. Wants a pie he had when he was a boy. Wants to taste it one more time before he goes."`,
        `**"What's he actually after, do you think?"**`,
        `It is not a trick question. She genuinely wants to know whether you have thought about it.`
      ],
      choices: [
        {
          text: '"The pie. And everything he was when he last ate one."',
          goto: 'grammy_q3',
          effects: Object.assign({ xp: 15, bond: { grammy: 12 }, flags: { understood_tyndareus: true } },
            M('understood_tyndareus', 'understood that Tyndareus wanted his childhood back, not a pie'))
        },
        {
          text: '"A pie. People are allowed to just want a pie."',
          goto: 'grammy_q3',
          effects: Object.assign({ xp: 10, bond: { grammy: 8 } },
            M('grammy_just_a_pie', 'told Grammy that sometimes a man just wants a pie'))
        }
      ]
    },

    grammy_q3: {
      title: 'The Third Question',
      art: 'office',
      text: [
        `Grammy Smithwick laughs — a short dry sound, quite warm.`,
        `"Last one," she says, "and it's the only one that counts."`,
        `She puts one flour-dusted hand flat on the desk.`,
        `**"Who gets to eat it?"**`
      ],
      choices: [
        {
          text: '"Everyone. The goblins, the old man, anyone who turns up hungry."',
          goto: 'grammy_blessing',
          effects: Object.assign({ xp: 25, bond: { grammy: 20, goblins: 8 }, flags: { promised_to_share: true } },
            M('promised_to_share', 'promised Grammy Smithwick to share the pie with the goblins and with Tyndareus'))
        },
        {
          text: '"The man who paid for it."',
          goto: 'grammy_blessing',
          effects: Object.assign({ xp: 5, bond: { grammy: 2 }, flags: { promised_client_only: true } },
            M('pie_for_the_client', 'told Grammy the pie was for the man who paid for it'))
        },
        {
          text: '"The goblins. They\'ve waited forty years."',
          goto: 'grammy_blessing',
          effects: Object.assign({ xp: 20, bond: { grammy: 14, goblins: 14 }, flags: { promised_goblins: true } },
            M('pie_for_the_goblins', 'told Grammy the pie belonged to the goblins first'))
        }
      ]
    },

    grammy_blessing: {
      title: 'What Happened to Grammy',
      art: 'office',
      text: (S) => {
        const l = [];
        if (S.flags.promised_to_share) {
          l.push(`Grammy Smithwick closes her eyes for a moment.`);
          l.push(`"Fifty-one years," she says, "and that's the right answer. That was always the right answer."`);
        } else {
          l.push(`She considers your answer for a long moment, and then nods slowly, accepting it.`);
        }
        l.push(`The cold has gone out of the room. The dust is drifting normally again.`);
        return l;
      },
      choices: [
        {
          text: 'Ask her what happened to her.',
          goto: 'grammy_what_happened',
          effects: Object.assign({ xp: 20, bond: { grammy: 15 }, flags: { asked_about_grammy: true } },
            M('asked_about_grammy', 'asked Grammy Smithwick what had happened to her'))
        },
        {
          text: 'Thank her, and get on with it.',
          goto: 'grammy_done',
          effects: { xp: 5, bond: { grammy: 4 } }
        }
      ]
    },

    grammy_what_happened: {
      title: 'Fifty-One Years',
      art: 'office',
      text: [
        `"What happened to you?" you ask her.`,
        `Nobody has asked her that either. It is becoming a theme in this building.`,
        `"I got old," says Grammy Smithwick, "which is what's meant to happen, and I died upstairs in the winter of a year you'd not have heard of, which is also what's meant to happen."`,
        `She looks round the little office.`,
        `"What wasn't meant to happen is that it *shut*. I hadn't anybody to leave it to. Fifty-one years of getting up at four, and then one morning nobody got up at all, and the Oven sat there lit and waiting and nobody came."`,
        `"It's been lit the whole time?"`,
        `"Of course it has," she says. "It's *waiting*. It's not a stove, love, it's a promise. Somebody made it a promise a very long time ago and it's not the sort to let it drop."`,
        `She looks at you, and then at the door, where ten goblins are very obviously listening on the other side.`,
        `"They kept it lit," she says quietly. "Forty years of burnt rubbish and not one of them ever let it go out. I've watched them. Little sods."`,
        `She is crying. You would not have thought a ghost could.`
      ],
      choices: [
        { text: 'Tell her they\'ve been trying to make her pie the whole time.', goto: 'grammy_done', effects: Object.assign({ xp: 20, bond: { grammy: 20, goblins: 10 }, flags: { told_grammy_about_goblins: true } }, M('told_grammy_about_the_goblins', 'told Grammy Smithwick that the goblins had been trying to bake her pie for forty years')) },
        { text: 'Say nothing. Let her have the moment.', goto: 'grammy_done', effects: { xp: 10, bond: { grammy: 10 } } }
      ]
    },

    grammy_done: {
      title: 'The Copy',
      art: 'office',
      text: (S) => {
        const l = [];
        l.push(`The recipe is not in the book. Or rather it is, but the book is the neat version — the one for customers and for show.`);
        l.push(`The real one is three loose sheets folded into the back, in a much older hand, corrected and re-corrected and stained with fifty-one years of use. Margins full of notes. *Less sugar if the apples are Rootilda's. More if Barktholomew's. He sulks.*`);
        if (!S.flags.no_blessing) l.push(`"Go on then," says Grammy. "It's no good to anybody in a drawer."`);
        l.push(`You have paper and ink. You have a decision.`);
        return l;
      },
      choices: [
        {
          text: 'Copy it out. Leave the book where it belongs.',
          goto: 'copied_recipe',
          effects: Object.assign({ xp: 25, item: 'recipe_copy', bond: { grammy: 15, goblins: 12, grubnash: 8 }, flags: { copied_recipe: true } },
            M('copied_recipe', 'copied the recipe out by hand and left Grammy\'s book at the bakery'))
        },
        {
          text: 'Take the book. It\'s what you were hired for.',
          goto: 'took_the_book',
          effects: Object.assign({ xp: 10, item: 'recipe_book', bond: { grammy: -10, goblins: -10 }, flags: { took_the_book: true } },
            M('took_the_book', 'took Grammy\'s recipe book out of the bakery'))
        },
        {
          text: 'Copy it — and copy a second one for the goblins.',
          goto: 'copied_recipe',
          effects: Object.assign({ xp: 25, item: 'recipe_copy', bond: { grammy: 15, goblins: 16, skritch: 8 }, flags: { copied_recipe: true, copy_for_goblins: true } },
            M('copied_twice', 'made two copies of the recipe — one to carry, one for the goblins to keep'))
        }
      ]
    },

    took_the_book: {
      title: 'Only Paper',
      art: 'office',
      text: [
        `You put the book under your arm.`,
        `Grubnash, in the doorway, does not say anything. He steps out of your way.`,
        `Behind you, in a room that is now just a room, an old woman's voice says, with enormous tiredness: **"It's only paper. It was never the paper."**`,
        `The office door is open and ten goblins are standing in the corridor, and not one of them tries to stop you.`
      ],
      choices: [
        { text: 'Put it back. Copy it instead.', goto: 'copied_recipe', effects: Object.assign({ xp: 20, item: 'recipe_copy', bond: { grammy: 10, goblins: 10 }, flags: { copied_recipe: true, nearly_took_it: true } }, M('copied_recipe', 'put Grammy\'s book back on the shelf and copied the recipe instead')) },
        { text: 'Keep walking.', goto: 'the_great_bake', effects: Object.assign({ flags: { has_book: true } }, M('kept_the_book', 'walked out of the office with Grammy\'s book under his arm')) }
      ]
    },

    copied_recipe: {
      title: 'In Your Own Hand',
      art: 'office',
      text: (S) => {
        const l = [];
        l.push(`You sit at a desk too small for you and you copy out three sheets of an old woman's handwriting by the light of a lamp Nib brought without being asked.`);
        l.push(`It takes a while. Nobody hurries you. At some point you become aware that the office door is open and most of the crew is sitting in the corridor outside, not talking, just there.`);
        if (S.flags.copy_for_goblins) l.push(`You do it twice. The second copy goes to Skritch, who receives it with both hands and does not trust himself to speak.`);
        l.push(`When you are done you fold the original back into the green book and put the book back on the shelf where it has been for forty years.`);
        l.push(`"Leaving it?" says Grubnash.`);
        l.push(`"It's yours. It lives here."`);
        if (!S.flags.no_blessing) {
          l.push(`And somewhere behind you, very quietly, in a room that is empty: **"Good lad. Good."**`);
        }
        return l;
      },
      choices: [{ text: 'Now bake it.', goto: 'the_great_bake', effects: { xp: 10 } }]
    }
  };

  TDM.EP1_SCENES_B = scenes;
})();
