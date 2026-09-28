# 🎲 Tales of the Dungeon Master

A choice-driven D&D story game built for Nergis.

Make a hero, play through adventures, and live with what you chose. Every decision is
permanent — the game autosaves after each one, remembers the big moments, and calls back
to them later. Progress lives in Firebase, so you can close the tab mid-scene and pick up
exactly where you left off, on any device.

**Episode 1 — Grammy's Country Apple Pie**
*Adventure by Jennifer Adcock · Wildemount edit by Johnny Johnson · adapted here into branching form.*

---

## What's in it

| | |
|---|---|
| **129 scenes** | A full branching adaptation of the one-shot, with real consequences |
| **Deep character creation** | 9 races · 12 classes · 12 origins · full appearance builder |
| **Real d20 mechanics** | Skill checks, advantage/disadvantage, saving throws, crits |
| **No going back** | Choices are permanent. The game says so, and means it. |
| **The Chronicle** | Telltale-style recap of defining moments — and a two-player comparison |
| **Multi-player profiles** | Nergis, Brian, anyone — separate characters, saves and chronicles |
| **Episode select** | Built to grow. Add Episode 2 without touching the engine. |

---

## Running it

It's a static site — no build step, no dependencies.

```bash
# from the project folder
python3 -m http.server 8080
# then open http://localhost:8080
```

Or just open `index.html` directly. Or drop the folder on GitHub Pages / Netlify / Vercel.

> **Note:** opening `index.html` via `file://` works, but browsers restrict storage on
> `file://` URLs. Use a local server (or a real host) so saves persist reliably.

---

## Firebase — connected ✅

Project **`dnd-game-2`** uses the **Realtime Database** in **europe-west1**, and it is
live. `js/firebase-config.js` is fully wired:

```js
databaseURL: "https://dnd-game-2-default-rtdb.europe-west1.firebasedatabase.app"
```

Because `databaseURL` is set, `DB_MODE:'auto'` selects Realtime Database. (If it were
empty, the game would use Firestore instead — both are supported.)

> **The region matters.** The default `https://dnd-game-2-default-rtdb.firebaseio.com`
> does **not** work for a europe-west1 database; it answers with a redirect error. The
> regional `...europe-west1.firebasedatabase.app` host is the correct one.

Verified working: two isolated browser profiles, one saved a run and the other read it
back out of the cloud. Data shape:

```
players/{player}  → { display, characters:{...}, saves:{...} }
meta/roster       → { nergis: <timestamp>, brian: <timestamp> }
meta/heartbeat    → connectivity probe
```

### Rules

Current rules grant read+write on `/meta` and `/players` (not on the root). That's
"anyone with the URL", which is a fair trade for a private two-person game. A
locked-down anonymous-auth alternative is in `firebase-rules.txt`.

### Running tests without polluting the database

Append **`?local=1`** to the URL to force offline mode. Every automated test does this,
so running the suite never writes practice characters into the real database.

```
http://localhost:8080/index.html?local=1
```

## Project layout

```
index.html                     all screens (start, creation, game, chronicle)
css/style.css                  the entire look
js/
  firebase-config.js           ← your keys go here
  db.js                        Firestore / RTDB / offline adapter
  engine.js                    dice, checks, effects, consequences (no DOM)
  avatar.js                    layered SVG portrait builder
  app.js                       UI controller
  data/
    character-options.js       races, classes, origins, appearance catalog
    items.js                   every item in the game
    episode1.js                ← the adventure itself
tools/                         dev-only test scripts + screenshots
```

The engine is deliberately DOM-free, so episodes can be validated and play-tested headlessly:

```bash
node tools/validate.js     # checks every scene link, item and skill reference
node tools/simulate.js     # 400 random playthroughs — finds crashes and dead ends
node tools/dedupe-test.js  # verifies chronicle entries never duplicate
```

---

## Writing Episode 2

Copy `js/data/episode1.js`, change the `id`, and add a `<script>` tag in `index.html`.
It'll appear on the episode-select screen automatically. Remove its entry from
`TDM.COMING_SOON` at the bottom of `episode1.js` when it's ready.

A scene looks like this:

```js
orchard: {
  title: 'The Apple Orchard',
  art: 'orchard',                       // sets the header color + icon
  onEnter: { flags: { reached_orchard: true } },
  text: (S) => [                        // S = live view of the character
    `The scent here is almost a solid thing.`,
    S.isClass('druid') ? `The trees lean toward you.` : ``
  ],
  choices: [
    { text: 'Laugh and bow to the trees.',
      goto: 'dryads_charmed',
      effects: { bond: { dryads: 2 }, xp: 50 } },

    { text: 'Ask them politely to show themselves.',
      check: { stat: 'CHA', skill: 'persuasion', dc: 13,
               advIf: [{ race: 'elf' }, { cls: 'druid' }] },
      success: { goto: 'dryads_appear', effects: { xp: 50 } },
      fail:    { goto: 'dryads_hidden' } },

    { text: 'Sing to them.',
      req: { cls: 'bard' },             // shown to everyone, only bards can pick it
      goto: 'dryads_song',
      effects: { chronicle: 'sang to the dryads and was adored for it',
                 remember: true } }     // ← triggers "X will remember that"
  ]
}
```

**Effects you can use:** `flags`, `bond`, `give`, `take`, `gold`, `xp`, `damage`, `heal`,
`poisoned`, `save` (a nested saving throw), `note`, `remember`, `chronicle`.

**Conditions** (for `req`, `if`, `advIf`, `disIf`): `race`, `cls`, `origin`, `item`, `flag`,
`noflag`, `prof`, `passive`, `level`, plus `any` / `all` for nesting.

Anything with `chronicle` shows up in the Chronicle and in the two-player comparison.

---

## Subclasses

Every class has **three paths**, chosen at a dedicated **Path** step during character
creation (right after Class). A path gives a *second* once-per-episode ability on top of
the base class perk, and can override the starting weapon.

`Fighter → Gunslinger` carries a **Revolver** (drawn on the portrait) and is tagged
`gunslinger`. Scenes can gate choices on that tag:

```js
{ text: 'Draw and put a round through a branch, just to be heard.',
  reqTag: 'gunslinger', goto: 'trees_gunshot', effects: { ... } }
```

`reqTag` is a hard filter, not a lock — players without the tag never see the option at
all, rather than being shown something they can never pick. Subclasses live in
`SUBCLASSES` in `js/data/character-options.js`; 36 of them, three per class.

## Episode 1 — "the kinder road"

`js/data/episode1-perry.js` is a patch layered on top of `episode1.js`. It adds 60 scenes
drawn from the original table playthrough, without removing anything:

- **Barktholomew and Rootilda**, the two arguing apple trees, and the apology that ends a
  three-hundred-year feud
- **The Oven** — sentient, ancient, speaks in single words (`APPLES`, `SONG`, `TRUTH`,
  `SHARE`)
- **Grammy Smithwick's spirit** and her three questions in the office
- **The three baking trials**: organise the crew, get the filling right, and SONG
- **The tower finale**: hand over the recipe, tear it up, or make the wizard a patron —
  then decide who gets the first slice

The goblin chief is **Grubnash** and his crew are named (Pot-Helmet, Rolling-Pin, Nib,
Skritch); the imp is **Crimp**.

Editing `episode1.js` directly still works — the patch only adds scenes and appends a few
choices to existing ones.

## Perry — the original run

`js/data/perry-run.js` seeds a third, **read-only** profile containing the real table
playthrough: Perry, Elf Gunslinger, 24 defining choices, the five dice rolls that were
actually rolled. It is seeded once and never overwritten; the profile cannot be played
and `persist()` refuses to write to it.

Its purpose is the **end-of-episode comparison**: the first time anyone finishes Episode 1
they immediately see "How Perry played it" — what only Perry did, what only they did, and
where the two runs agreed.

## The crew at Grammy's

Four goblins run the bakery, and they are characters, not scenery. They live in
`js/data/goblins.js`, which loads *after* the episode files and patches them.

| | Who | Job | What they are |
|---|---|---|---|
| 🥘 | **Pot-Helmet** | Marketing | Enthusiasm, weaponised. Wears an actual cooking pot. Has been making signs for the reopening for a year and a half. |
| 🥖 | **Rolling-Pin** | Assistant Crust Commander | A rank he gave himself. Laminates dough he has never tasted the result of. |
| 🧈 | **Nib** | Butter and sugar | The smallest. Trusted with the butter because he is the only one who does not eat it. |
| 📋 | **Skritch** | Paperwork | Keeps a four-page ledger of every failed attempt. Nobody asked him to. Nobody reads it. |

**Where you meet them.** Pot-Helmet ambushes you on the road before you ever see
the bakery. Nib smells you out at the loading dock. Skritch's handwriting is all
over the shop and the office — the stock list, the note on the cashbox (*COINS.
NOT OURS. DO NOT.*), the ledger. Rolling-Pin drops out of the rafters when you
touch Grammy's tools, and guards the chief's door.

**They are tracked separately.** `effects.bond` takes any key, so each of the four
has their own number — `bond: { nib: 8 }`. Toasts name them individually ("Nib
thinks better of you"), and the end screen shows a **crew standing panel** built
by `TDM.crewStanding(save)`: *is afraid of you* → *is wary* → *likes you* →
*trusts you* → *would follow you anywhere*, per goblin.

**Quiet moments.** Four optional scenes — `crew_nib`, `crew_skritch`,
`crew_rolling_pin`, `crew_pot_helmet` — appear once each from the bakery floor and
the shop, but only if you did not fight them. They pay off in the final bake: if
you promised Rolling-Pin a proper crust, he gets one; if Nib trusts you, he is
given the first slice of the second pie.

### Adding a fifth goblin

Push onto `TDM.CREW`, then use the `setText` / `addFx` / `addChoice` helpers at
the top of `goblins.js`. Overriding scene *text* and merging *effects* keeps every
`goto` in `episode1.js` intact, which is why the patch cannot break routing.

## Flow — why the bakery stops repeating itself

`js/data/flow.js` (loaded last) fixes the biggest structural problem in
Episode 1: the hubs were menus. You could examine the failed baking attempts
nine times, loot the cold-rooms twice, and re-trigger the rafter standoff
forever. A random playthrough spent **44% of its scene entries re-reading rooms
it had already read**.

Three rules, applied by matching choice **text** (not index, so it survives
edits to the episode files):

1. **Every examine / search / take link is one-shot.** Once you have done a
   thing, the game stops offering it. Mutually exclusive options (pick the lock
   *or* smash it) retire as a group.
2. **Doors close behind you.** When a room has nothing left in it, the hub stops
   listing it — `closeWhen('shop_hub', 'The office.', ...)`. Once the floor is
   spent, the stairs are the only way on.
3. **Hubs narrate progress.** `bakery_floor`, `shop_hub` and `orchard_hub` have
   text *functions* that describe what is left rather than repeating the
   establishing shot — ending at *"You have been over the whole floor… whatever
   is left in this building is up the stairs."*

This rests on two lines added to `view()` in `js/engine.js`:

```js
taken:   (scene, text) => save.choices.some(c => c.scene === scene && (text == null || c.text === text)),
visited: (scene)       => save.choices.some(c => c.scene === scene),
```

`save.choices` was already being recorded, so no save-format change and old
saves keep working.

### Measured effect — `npm run flow`

`tools/repetition-test.js` plays 400 random runs with and without the patch:

| | without | with |
|---|---|---|
| scene entries per run | 110.4 | 71.3 |
| **repeated** entries per run | **46.3** | **14.9** |
| share of playthrough that is repetition | 44% | 21% |
| reached the ending | 399/400 | 400/400 |

**Repeated scene entries are down 68%**, and completion went *up*
(`simulate.js`: 1186/1200, 0 dead ends, 193/193 scenes reachable). Note this is
a *random* walker, which wanders on purpose; a player with intent sees far less.

### Two traps worth knowing about

Making choices conditional can strand a scene, and it did — twice — before
`simulate.js` caught it:

* **Ten different scenes route into `apartment_desk`**, several with the desk as
  their *only* choice. Hiding the link dead-ended them. Those are now
  **re-pointed forward** to `apartment_notebook` instead of hidden — see
  `retire()`, which only hides a link when some *other* choice in that scene is
  unconditional.
* **The office half of the recipe lives in the office desk.** Closing the office
  door on thoroughness alone could lock a player out of finishing, so the door
  reopens whenever `!S.has('recipe_half_office')`.

`TDM.FLOW_RISK` lists any scene whose choices are now all conditional; set
`TDM.DEBUG_FLOW = true` to print it. Always re-run `npm test` after editing
`flow.js`.

## How the "no going back" rule is enforced

There is no back button, no undo, and no branch re-entry once a choice is committed.
`engine.commit()` appends to `save.choices`, applies effects, routes to the next scene and
writes to the database in one step. The only way to replay is **Start over**, which erases
the run — and warns you first.

Failure is never a dead end. Failed rolls route to *different* scenes rather than blocking
progress, exactly like a real table. Dropping to 0 HP doesn't kill you either — you wake up
somewhere else, lighter a few coins, and the story continues.

## Upcoming episodes (the `???` cards)

Episodes you haven't written yet show as sealed envelopes reading **`???`** / *Not yet
written*, so nothing is promised or spoiled before you've decided what it actually is.

They're defined at the bottom of `js/data/episode1.js`:

```js
TDM.COMING_SOON = [
  { number: 2, title: '???', blurb: '???', eta: 'Not yet written' },
  { number: 3, title: '???', blurb: '???', eta: 'Not yet written' }
];
```

Leave `title` as `'???'` to keep a card sealed. The moment you replace it with a real
title, that card automatically switches from the sealed style to a normal "coming soon"
card showing the title and blurb — no other code to touch. Add or remove entries freely.

