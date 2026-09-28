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

## Episode 1 — Perry's run, retold

Episode 1 is no longer an invented dungeon crawl. It is **the actual playthrough**,
rebuilt scene for scene from `uploads/perry-grammys-everything-overview.txt`:
Perry, Elf Fighter, DM'd by Rex. The kind road, because that is the one that
happened.

**The spine (21 beats, ~107 scenes):**

| Act | Beats |
|---|---|
| The tower | Crimp at the door · the wizard's tale · saying yes |
| The orchard | the failed Stealth roll · **the apology** · two apples |
| The door | the front door · *"I come here to buy a recipe book"* · the apple exchange |
| The crew | Grubnash · **meeting all four, one at a time** · the Oven · the search |
| Grammy | three questions · *"Yes."* · what happened to her · the copy |
| The bake | the organising · the lights and the cinnamon · **the song** · SHARE |
| The tower again | the torn recipe · **the first slice to Crimp** · the next morning |

**Every choice Perry turned down is in the game too.** The crossroads log in the
source document listed the roads not taken at each scene, so those are the
alternatives: threaten the trees, take a side, sneak the loading dock, demand the
book, lie to Grammy, follow the recipe to the gram, hand the paper over and take
the gold. They are real, they are remembered, and they are never the warm one.

### The warm road is verifiable — `npm run perry`

`tools/perry-path-test.js` plays the episode always choosing what Perry actually
chose, and feeds it **his real dice** — including the famous Stealth 10 that
failed and forced the apology:

```
🎲 Stealth 10 vs DC 13 → FAILURE
🎲 Persuasion 13 vs DC 12 → success
🎲 Investigation 19 vs DC 14 → success
🎲 Athletics 15 vs DC 12 → success
🎲 Performance 20 vs DC 12 → success

Perry beats hit : 27/27
level 2 | xp 850 | gold 25
✅ Perry's exact run is reproducible end to end.
```

It lands on **Fighter 2 with 25 gold**, which is exactly where Perry's character
sheet ends. Across 1500 random runs nobody ever exceeds level 2.

### The crew

They are in the story from the beginning now, not as scenery. Each gets his own
introduction scene and his own bond track:

| | Who | His scene |
|---|---|---|
| 🥘 | **Pot-Helmet** — chaotic marketer, enthusiasm weaponised | the eleven charcoal signs he has been repainting for thirty-nine years |
| 🥖 | **Rolling-Pin** — self-appointed Assistant Crust Commander | lamination he taught himself from pictures, aiming at a crust he has never tasted |
| 🧈 | **Nib** — tiny, careful, trusted with the butter and sugar | the tally scratched into the crock, and why he is the only one allowed near it |
| 📋 | **Skritch** — lanky, paperwork and inventory, permanently nervous | forty years of entries, every one ending *it was wrong* |

`effects.bond` takes any key, so each has his own standing, shown on the end
screen by `TDM.crewStanding()` — *is afraid of you* → *would follow you anywhere*.

### Comparing with Perry

Perry is seeded as a read-only third profile (`js/data/perry-run.js`) with his 27
defining choices. Because Nergis now plays the same story, the end-of-episode
screen shows **You both did this** alongside **Only Perry did this** and **Only
you did this** — so she can see exactly where she walked his road and where she
stepped off it.

### Files

- `js/data/episode1.js` — Act I–III: the tower, the orchard, the door
- `js/data/episode1-crew.js` — Act IV–V: the crew, the Oven, Grammy
- `js/data/episode1-bake.js` — Act VI–VII: the three trials, the tower again
- `js/data/episode1-assemble.js` — merges the acts into `TDM.EPISODES.ep1_apple_pie`
- `archive/` — the old invented branching episode, kept but **not loaded**

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

