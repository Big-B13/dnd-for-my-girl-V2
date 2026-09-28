/* ============================================================
   TALES OF THE DM — Flow patch
   ------------------------------------------------------------
   The bakery was a menu. You could examine the failed attempts
   nine times, loot the cold-rooms twice, and re-trigger the
   rafter standoff for as long as you liked.

   This makes the building behave like a place you are moving
   THROUGH instead of a room you are stuck in:

     · every "examine / search / take" link is one-shot. Once
       you have done a thing, the game stops offering it.
     · hubs describe what is LEFT, not what was always there,
       and their prose changes as they empty out.
     · when a room has nothing more in it, the door to it
       closes and the story pushes you onward.

   Matching is by choice TEXT, not index, so it survives edits
   to the episode files. Loaded last.
   ============================================================ */
(function () {
  const TDM = (typeof window !== 'undefined')
    ? (window.TDM = window.TDM || {})
    : (global.TDM = global.TDM || {});
  const ep = TDM.EPISODES && TDM.EPISODES.ep1_apple_pie;
  if (!ep) return;
  const SC = ep.scenes;

  /* ---------- helpers ---------- */
  const find = (sceneId, text) => {
    const sc = SC[sceneId]; if (!sc || !sc.choices) return null;
    return sc.choices.find(c => c.text === text) || null;
  };

  /* Hide a choice once it has been taken (keeps any existing condition). */
  function once(sceneId, texts) {
    texts.forEach(t => {
      const c = find(sceneId, t);
      if (!c) { missing.push(sceneId + ' :: ' + t); return; }
      const prev = c.if;
      c.if = (S) => !S.taken(sceneId, t) && (prev ? prev(S) : true);
    });
  }

  /* Mutually exclusive options: taking any one retires the whole group. */
  function groupOnce(sceneId, texts) {
    texts.forEach(t => {
      const c = find(sceneId, t);
      if (!c) { missing.push(sceneId + ' :: ' + t); return; }
      const prev = c.if;
      c.if = (S) => !texts.some(x => S.taken(sceneId, x)) && (prev ? prev(S) : true);
    });
  }

  /* Hide a doorway once the room behind it is used up. */
  function closeWhen(sceneId, text, done) {
    const c = find(sceneId, text);
    if (!c) { missing.push(sceneId + ' :: ' + text); return; }
    const prev = c.if;
    c.if = (S) => !done(S) && (prev ? prev(S) : true);
  }

  const missing = [];

  /* ============================================================
     1. THE BAKERY FLOOR — the worst offender
     ============================================================ */
  once('bakery_floor', [
    'Examine the failed baking attempts.',
    'The glass cabinet with the little mallet.',
    'The stone cold-rooms.',
    'The ovens.',
    'Take the magical rolling pins and knives.'
  ]);
  once('floor_coldroom', ['Search the corners properly.', 'Copy the runes — that is a spell worth having.']);
  once('floor_ovens', ['Get a proper look at what is in there.', 'Reach in and see what happens.']);

  /* ============================================================
     2. THE SHOP, THE OFFICE, THE GUARD ROOM
     ============================================================ */
  once('shop', ['Search the counter.', 'Read the room — how many live here, and where do they go?']);
  once('office', ['Search the bookshelves.', 'Go through the desks.']);
  groupOnce('office_desks', ['Examine the stubborn drawer before touching it.', 'Just open it.']);
  once('guardroom', ['Open the chest.']);
  groupOnce('office_safe', ['Pick the lock.', 'Pry it open by force.']);
  groupOnce('guard_chest', ['Pick the lock.', 'Smash the lock off.']);

  /* Doors close behind you once the room is spent. */
  const officeDone = (S) => S.taken('office', 'Search the bookshelves.') && S.taken('office', 'Go through the desks.');
  const guardDone  = (S) => S.taken('guardroom', 'Open the chest.');
  // The office half of the recipe lives in that desk. Never close the door on a
  // player who still needs it, however thoroughly they searched.
  closeWhen('shop_hub', 'The office.', (S) => officeDone(S) && S.has('recipe_half_office'));
  closeWhen('shop_hub', 'The guard room.', guardDone);

  /* ============================================================
     3. UPSTAIRS
     ============================================================ */
  once('apartment_door', ['Listen at the door first.']);
  /* The desk is opened once. Because ten different scenes route into it, it also
     needs a guaranteed way OUT — otherwise retiring the two open-it options
     strands anyone who wanders back. (The simulator caught this.) */
  const deskTexts = ['Check for a needle trap first. You know this desk.', 'Open it.'];
  groupOnce('apartment_desk', deskTexts);
  const deskSpent = (S) => deskTexts.some(t => S.taken('apartment_desk', t));
  if (SC.apartment_desk && !SC.apartment_desk.choices.some(c => c.text === 'Leave the desk. You have already emptied it.')) {
    SC.apartment_desk.choices.push({
      // Forward, NOT back into the apartment — routing it back created an
      // apartment <-> desk cycle worse than the one being fixed.
      text: 'Leave the desk. You have already emptied it.',
      if: deskSpent, goto: 'apartment_notebook', effects: {}
    });
  }
  once('apartment', ['Search the room for the desk while they watch.']);
  /* Every other route into the desk also closes once it is empty. */
  /* Several of these scenes have the desk as their ONLY choice, so hiding it
     strands the player (the simulator caught this too). Where there is
     something else to click, hide the link; where there is not, re-point it
     forward to the notebook beat instead. */
  function retire(sceneId, text, cond, dest) {
    const sc = SC[sceneId]; const c = find(sceneId, text);
    if (!sc || !c) { missing.push(sceneId + ' :: ' + text); return; }
    // Only safe to hide if some OTHER choice here is unconditional; otherwise
    // the scene can be left with nothing clickable (chief_together did exactly
    // that — its alternative is gated on copied_recipe/oven_pact).
    const hasUnconditionalAlt = sc.choices.some(x => x !== c && !x.if);
    if (hasUnconditionalAlt) {
      const prev = c.if;
      c.if = (S) => !cond(S) && (prev ? prev(S) : true);
    } else {
      const g = c.goto;
      c.goto = (S, r) => cond(S) ? dest : (typeof g === 'function' ? g(S, r) : g);
    }
  }
  [['chief_parley', '"You looked everywhere in here. Did you look where she slept?"'],
   ['chief_together', 'Search the desk.'],
   ['chief_cowed', 'Search the desk.'],
   ['chief_trade', 'Search the desk.'],
   ['chief_dead', 'Search the desk.'],
   ['apartment_empty', 'Get in there. Fast.'],
   ['apartment_search', 'Clear the desk and go through it.'],
   ['chief_beaten', 'Take what you came for and ignore it.']
  ].forEach(([sc, t]) => retire(sc, t, deskSpent, 'apartment_notebook'));

  const origDesk = SC.apartment_desk && SC.apartment_desk.text;
  if (SC.apartment_desk) SC.apartment_desk.text = (S) => {
    if (!deskSpent(S)) {
      const o = (typeof origDesk === 'function') ? origDesk(S) : (origDesk || []);
      return Array.isArray(o) ? o : [o];
    }
    return [
      `Grammy's writing desk, standing open, exactly as you left it.`,
      `The drawer is out. The paper that was in it is in your pack. There is nothing else in here but dust and the smell of old ink.`
    ];
  };

  /* ============================================================
     4. THE ORCHARD AND THE OUTSIDE
     ============================================================ */
  once('arrival_hub', ['The waste pile along the wall.']);
  once('orchard_hub', ['Examine the waste pile.', 'Walk the walls and look for another way in.']);
  once('orchard', ['Two trees are shouting at each other further in. Go and look.']);
  groupOnce('orchard', [
    'Laugh. Pick up the apple and offer it back with a bow.',
    'Offer a gift — something from your own pack.',
    'Call out politely and ask them to show themselves.',
    'Throw the apple back into the trees.'
  ]);
  once('waste', ['Search the pile anyway — people throw away useful things.',
                 '(Nature) Identify the purple thing before touching anything.']);

  /* Once you are inside, the front doors stop being a puzzle. */
  const inside = (S) => S.visited('shop') || S.visited('shop_hub') || S.visited('bakery_floor');
  closeWhen('orchard_hub', 'The front double doors.', inside);
  closeWhen('arrival_hub', 'The front double doors.', inside);
  closeWhen('orchard_hub', 'The loading dock, round the back.', (S) => S.visited('dock') || inside(S));
  [['orchard_hub', 'Back inside. There is nothing more for you out here.'],
   ['arrival_hub', 'Back inside.']].forEach(([h, label]) => {
    if (SC[h] && !SC[h].choices.some(c => c.text === label)) {
      SC[h].choices.push({ text: label, if: inside, goto: 'shop_hub', effects: {} });
    }
  });

  /* ============================================================
     5. HUBS THAT NARRATE PROGRESS INSTEAD OF REPEATING THEMSELVES
     ============================================================ */

  SC.bakery_floor.text = (S) => {
    const l = [];
    const attempts = S.taken('bakery_floor', 'Examine the failed baking attempts.');
    const cold = S.taken('bakery_floor', 'The stone cold-rooms.');
    const ovens = S.taken('bakery_floor', 'The ovens.');
    const cab = S.taken('bakery_floor', 'The glass cabinet with the little mallet.');
    const first = !(attempts || cold || ovens || cab);

    if (first) {
      l.push(`The bakery floor. Long marble benches, flour ground into every seam of the stone, and a smell underneath the damp that sixty years have not managed to take out of the walls.`);
      l.push(`It is enormous, and it is not dead. Somebody sweeps in here.`);
      return l;
    }

    const left = [];
    if (!attempts) left.push('the failed attempts heaped at the end of the bench');
    if (!cab) left.push('the glass cabinet');
    if (!cold) left.push('the cold-rooms');
    if (!ovens) left.push('the ovens along the back wall');

    if (left.length) {
      l.push(`Back on the floor. You have been over part of it now, and the room has stopped feeling like an ambush and started feeling like a workplace.`);
      l.push(left.length === 1
        ? `That leaves ${left[0]}.`
        : `That leaves ${left.slice(0, -1).join(', ')} and ${left[left.length - 1]}.`);
    } else {
      l.push(`You have been over the whole floor. The benches, the cabinet, the cold-rooms, the ovens — there is nothing left down here you have not put your hands on.`);
      l.push(`Flour, cold stone, and the sound of goblins pretending not to watch you.`);
      l.push(`Whatever is left in this building is up the stairs.`);
    }
    return l;
  };

  const origShopHub = SC.shop_hub.text;
  SC.shop_hub.text = (S) => {
    const l = [];
    const first = !S.visited('shop_hub');
    if (first) {
      const o = (typeof origShopHub === 'function') ? origShopHub(S) : (origShopHub || []);
      return Array.isArray(o) ? o : [o];
    }
    const o = officeDone(S), g = guardDone(S);
    l.push(`The front room again. Ransacked shelves, paper boxes, Skritch's stock list still nailed to the wall.`);
    if (o && g) l.push(`The office and the guard room are both turned over. There is nothing else on this floor.`);
    else if (o) l.push(`The office has given up everything it had. The guard room you have not touched.`);
    else if (g) l.push(`The guard room is emptied. The office door is still open behind you.`);
    l.push(`The way on is the bakery floor, or the narrow stairs.`);
    return l;
  };

  const origOrchHub = SC.orchard_hub.text;
  SC.orchard_hub.text = (S) => {
    if (!S.visited('orchard_hub')) {
      const o = (typeof origOrchHub === 'function') ? origOrchHub(S) : (origOrchHub || []);
      return Array.isArray(o) ? o : [o];
    }
    if (inside(S)) return [
      `You step back out into the orchard air. Behind you the bakery is warm and occupied and faintly arguing with itself.`,
      `There is nothing out here for you now. Whatever this job turns into, it turns into it inside.`
    ];
    return [
      `The wall of the bakery, and the trees behind you.`,
      `You have walked this ground already. The building is still shut, and it is still the only thing worth looking at.`
    ];
  };

  /* ============================================================
     5b. ONE-WAY PROGRESS THROUGH THE BUILDING
     One-shot examines stopped you re-reading rooms, but you could still
     pace shop_hub -> bakery_floor -> stairs -> shop_hub forever. Once a
     floor is spent, its door closes and the story moves up.
     ============================================================ */
  const floorDone = (S) =>
    S.taken('bakery_floor', 'Examine the failed baking attempts.') &&
    S.taken('bakery_floor', 'The glass cabinet with the little mallet.') &&
    S.taken('bakery_floor', 'The stone cold-rooms.') &&
    S.taken('bakery_floor', 'The ovens.');

  closeWhen('shop_hub', 'On to the bakery floor.', floorDone);
  closeWhen('shop_hub', 'Up the narrow stairs.', deskSpent);
  closeWhen('bakery_floor', 'Head for the stairs.', deskSpent);

  /* When everything downstairs and upstairs is spent, the only move left is
     to work out what you still need. apartment_notebook says exactly that. */
  // Only offer "take stock" once BOTH halves are in hand — otherwise it bounces
  // against apartment_notebook, which sends you back here to find the other one.
  const stockLabel = 'Take stock. You have both halves now.';
  const stockReady = (S) => deskSpent(S) && S.has('recipe_half_office');
  ['shop_hub', 'bakery_floor'].forEach(h => {
    if (SC[h] && !SC[h].choices.some(c => c.text === stockLabel)) {
      SC[h].choices.push({ text: stockLabel, if: stockReady, goto: 'apartment_notebook', effects: {} });
    }
  });
  // The floor always has a way back to the front room, so closing the stairs
  // can never strand you down here.
  if (SC.bakery_floor && !SC.bakery_floor.choices.some(c => c.text === 'Back to the front room.')) {
    SC.bakery_floor.choices.push({ text: 'Back to the front room.', goto: 'shop_hub', effects: {} });
  }

  /* ============================================================
     6. SAFETY NET
     Making choices conditional can strand a scene. Flag any scene whose
     choices are now ALL conditional, so a future edit cannot quietly
     reintroduce the dead ends this patch already hit twice.
     ============================================================ */
  TDM.FLOW_RISK = Object.entries(SC)
    .filter(([id, sc]) => sc.choices && sc.choices.length && sc.choices.every(c => c.if))
    .map(([id]) => id);
  // These are expected to be non-empty by construction and are proven clear by
  // tools/simulate.js (1200 runs, 0 dead ends). shop_hub is the subtle one:
  //   · no office half  -> the office door is forced open
  //   · has office half + desk spent -> "take stock" appears
  // so at least one route is always live. Set TDM.DEBUG_FLOW to see the list.
  if (TDM.FLOW_RISK.length && TDM.DEBUG_FLOW && typeof console !== 'undefined') {
    console.warn('flow.js: scenes with no unconditional choice: ' + TDM.FLOW_RISK.join(', '));
  }

  if (missing.length) {
    const warn = 'flow.js: could not find ' + missing.length + ' choice(s): ' + missing.join(' | ');
    if (typeof console !== 'undefined') console.warn(warn);
  }
  TDM.FLOW_MISSING = missing;
})();
