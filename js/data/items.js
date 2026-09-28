/* ============================================================
   TALES OF THE DM — Master item registry
   Character starting gear (from character-options) + everything
   findable in the adventures. TDM.ITEMS is the single lookup.
   ============================================================ */
(function () {
  const TDM = (typeof window !== 'undefined')
    ? (window.TDM = window.TDM || {})
    : (global.TDM = global.TDM || {});

  const ADVENTURE_ITEMS = {
    /* --- Episode 1: Grammy's Country Apple Pie --- */
  map: {
    name: "Tyndareus's Map",
    icon: "🗺️",
    kind: "quest",
    desc: "Old and soft as cloth, folded so many times the creases have gone furry. Two days south and west, into apple country."
  },
  recipe_copy: {
    name: "The Recipe, Copied",
    icon: "📜",
    kind: "quest",
    desc: "Three sheets in your own hand, carried across word for word from Grammy Smithwick's originals — marginal notes and all. 'Less sugar if the apples are Rootilda's. More if Barktholomew's. He sulks.'"
  },
  recipe_book: {
    name: "Grammy's Recipe Book",
    icon: "📗",
    kind: "quest",
    desc: "Fat, bound in green cloth, a faded apple stamped on the spine. It sat on a shelf in that office for forty years and nobody felt it was theirs to take."
  },
  grammys_pie: {
    name: "A Grammy's Country Apple Pie",
    icon: "🥧",
    kind: "quest",
    desc: "Golden-lidded, crimped by an Assistant Crust Commander who would not be hurried. Still warm."
  },
    red_apple: { name: "Barktholomew's Red Apple", icon: '🍎', kind: 'quest',
      desc: 'A gift from a grumpy old tree who had not been apologised to in three hundred years. It has not bruised. It does not seem inclined to.' },
    green_apple: { name: "Rootilda's Green Apple", icon: '🍏', kind: 'quest',
      desc: 'Tart enough to make your jaw ache, and given freely — which is rarer than the apple.' },
    copied_recipe: { name: "Grammy's Recipe, Copied Out", icon: '📝', kind: 'quest',
      desc: 'You wrote it out yourself, word for word, and left the original where it belonged. The last line still refuses to explain itself.' },
    oven_blessing: { name: 'The Oven\'s Regard', icon: '🔥', kind: 'treasure',
      desc: 'Not an object. A fact. The great oven of Grammy\'s knows your name now, and ovens are longer-lived than people.' },
    free_pie_forever: { name: 'Free Pie at Grammy\'s — Forever', icon: '🥧', kind: 'treasure',
      desc: 'Grubnash shook on it with flour on his hand. Goblin contracts are unbreakable when sealed with flour; he was very clear about this.' },
    tyndareus_map: { name: "Tyndareus's Map", icon: '🗺️', kind: 'quest',
      desc: 'A hand-drawn map to a bakery that fell silent a lifetime ago. The old gnome has annotated it with small, hopeful notes.' },
    recipe_half_office: { name: 'Recipe — Left Half', icon: '📜', kind: 'quest',
      desc: 'Torn parchment in a careful, floury hand. Apples, butter, and a list of spices that stops mid-sentence.' },
    recipe_half_apartment: { name: 'Recipe — Right Half', icon: '📜', kind: 'quest',
      desc: 'The other half. The last line reads: "and one thing more, which I shall never write down."' },
    recipe_complete: { name: "Grammy's Complete Recipe", icon: '🥧', kind: 'quest',
      desc: 'Both halves, together at last. Somehow the paper still smells faintly of cinnamon.' },
    grammy_spellbook: { name: "Grammy's Spell Notebook", icon: '📗', kind: 'treasure',
      desc: 'A kitchen notebook of small green magics: Druidcraft, Entangle, Purify Food and Drink, Speak with Plants.' },
    shillelagh_oil: { name: 'Shillelagh Oil', icon: '🫙', kind: 'treasure',
      desc: 'Rub it on a club or staff and the wood remembers it was once a living, furious tree.' },
    healing_potion: { name: 'Potion of Healing', icon: '🧪', kind: 'consumable', usable: true, heal: '2d4+2',
      desc: 'Red as a summer apple, and tastes surprisingly like one.' },
    exotic_spices: { name: 'Bag of Exotic Spices', icon: '🌰', kind: 'treasure', value: 20,
      desc: 'Cinnamon, nutmeg, ginger, cloves. Worth good coin — and worth rather more than coin to the right baker.' },
    silver_signet: { name: 'Silver Signet Ring', icon: '💍', kind: 'treasure', value: 10,
      desc: 'A small silver ring stamped with a pie lattice. Grammy took her branding seriously.' },
    velvet_curtains: { name: 'Velvet Curtains', icon: '🧵', kind: 'treasure', value: 10,
      desc: 'Heavy, dusty, and genuinely valuable. Carrying them is its own small heroism.' },
    chill_rune: { name: 'Copied Chill Rune', icon: '❄️', kind: 'treasure',
      desc: 'A second-level variation on Cone of Cold that only chills food. Useless in a fight; priceless in a kitchen.' },
    bag_of_tricks: { name: 'Bag of Tricks', icon: '🎒', kind: 'legendary',
      desc: 'A rust-colored bag. Reach in, pull out a fuzzy ball, throw it, and something alive and indignant appears.' },
    apple_of_mac: { name: "Mac's Apple", icon: '🍎', kind: 'treasure',
      desc: 'Given, not taken, from the oldest tree in the orchard. It never seems to bruise.' },
    dryad_token: { name: "Dryad's Braid", icon: '🌸', kind: 'treasure',
      desc: 'Three strands of green-gold hair woven into a ring. The orchard will know you by it.' },
    goblin_charm: { name: 'Goblin Friendship Charm', icon: '🦷', kind: 'treasure',
      desc: 'A tooth on a string, pressed into your hand with great ceremony. To the goblins, this is a treaty.' },
    pie_slice: { name: 'Slice of the Legendary Pie', icon: '🥧', kind: 'treasure',
      desc: 'Still warm. You are saving it for someone, and you know exactly who.' },
    cashbox_coin: { name: 'Old Shop Takings', icon: '🪙', kind: 'treasure',
      desc: 'Copper, silver and a few gold, all of it stamped with a bakery crest.' }
  };

  const ITEMS = Object.assign({}, (TDM.CHAR_OPTIONS && TDM.CHAR_OPTIONS.ITEMS) || {}, ADVENTURE_ITEMS);
  TDM.ITEMS = ITEMS;
  TDM.ADVENTURE_ITEMS = ADVENTURE_ITEMS;
})();
