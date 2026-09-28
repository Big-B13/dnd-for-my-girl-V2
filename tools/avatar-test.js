/* Headless avatar contact-sheet generator (node). */
global.window = undefined;
require('../js/data/character-options.js');
require('../js/avatar.js');
const fs = require('fs');

const TDM = global.TDM;
const looks = [
  { name: 'Elf fighter', look: { race: 'elf', skin: 'golden', hairStyle: 'longstraight', hairColor: 'raven', eyes: 'forest', mouth: 'smile', build: 'average', freckles: 'none', blush: true, scar: 'none', glasses: 'none', earrings: 'hoops', warpaint: 'none', cape: 'long', capeColor: 'wine', outfit: 'plate', outfitPrimary: 'charcoal', outfitAccent: 'butter', weapon: true, weaponKind: 'sword', backdrop: 'meadow' } },
  { name: 'Human bard', look: { race: 'human', skin: 'honey', hairStyle: 'curly', hairColor: 'copper', eyes: 'amber', mouth: 'grin', build: 'lithe', freckles: 'bold', blush: false, scar: 'none', glasses: 'none', earrings: 'studs', warpaint: 'none', cape: 'short', capeColor: 'forest', outfit: 'finery', outfitPrimary: 'wine', outfitAccent: 'butter', weapon: true, weaponKind: 'lute', backdrop: 'dusk' } },
  { name: 'Dwarf cleric', look: { race: 'dwarf', skin: 'sienna', hairStyle: 'bun', hairColor: 'espresso', eyes: 'brown', mouth: 'soft', build: 'sturdy', freckles: 'none', blush: false, scar: 'cheek', glasses: 'round', earrings: 'dangles', warpaint: 'none', cape: 'none', capeColor: 'forest', outfit: 'vestment', outfitPrimary: 'cream', outfitAccent: 'gold' in {} ? 'butter' : 'butter', weapon: true, weaponKind: 'mace', beard: true, backdrop: 'parchment' } },
  { name: 'Tiefling warlock', look: { race: 'tiefling', skin: 'rose', hairStyle: 'highponytail', hairColor: 'orchid', eyes: 'crimson', mouth: 'smirk', build: 'average', freckles: 'none', blush: false, scar: 'none', glasses: 'none', earrings: 'studs', warpaint: 'none', cape: 'short', capeColor: 'ink', outfit: 'pactweave', outfitPrimary: 'ink', outfitAccent: 'plum', weapon: true, weaponKind: 'wand', horns: 'curved', backdrop: 'arcane' } },
  { name: 'Dragonborn paladin', look: { race: 'dragonborn', ancestry: 'gold', skin: 'golden', hairStyle: null, crest: 'fin', hairColor: 'raven', eyes: 'gold', mouth: 'soft', build: 'sturdy', freckles: 'none', blush: false, scar: 'none', glasses: 'none', earrings: 'none', warpaint: 'none', cape: 'long', capeColor: 'cream', outfit: 'oathplate', outfitPrimary: 'stormblue', outfitAccent: 'butter', weapon: true, weaponKind: 'swordshield', backdrop: 'dusk' } },
  { name: 'Halfling rogue', look: { race: 'halfling', skin: 'ivory', hairStyle: 'pigtails', hairColor: 'honeyblonde', eyes: 'sky', mouth: 'grin', build: 'petite', freckles: 'light', blush: true, scar: 'none', glasses: 'sharp', earrings: 'none', warpaint: 'none', cape: 'none', capeColor: 'forest', outfit: 'shadow', outfitPrimary: 'charcoal', outfitAccent: 'brick', weapon: true, weaponKind: 'twin_daggers', backdrop: 'meadow' } },
  { name: 'Half-orc barbarian', look: { race: 'half_orc', skin: 'deepumber', hairStyle: 'mohawk', hairColor: 'crimson', eyes: 'moss', mouth: 'smile', build: 'tall', freckles: 'none', blush: false, scar: 'brow', glasses: 'none', earrings: 'hoops', warpaint: 'scar', cape: 'none', capeColor: 'forest', outfit: 'warchief', outfitPrimary: 'umber', outfitAccent: 'brick', weapon: true, weaponKind: 'greataxe', backdrop: 'parchment' } },
  { name: 'Gnome wizard', look: { race: 'gnome', skin: 'porcelain', hairStyle: 'twinbraids', hairColor: 'silver', eyes: 'violet', mouth: 'soft', build: 'petite', freckles: 'light', blush: true, scar: 'none', glasses: 'round', earrings: 'none', warpaint: 'none', cape: 'none', capeColor: 'forest', outfit: 'arcanist', outfitPrimary: 'midnight', outfitAccent: 'butter', weapon: true, weaponKind: 'staff', backdrop: 'arcane' } },
  { name: 'Half-elf druid', look: { race: 'half_elf', skin: 'verdant', hairStyle: 'braid', hairColor: 'moss', eyes: 'seagreen', mouth: 'soft', build: 'average', freckles: 'light', blush: false, scar: 'none', glasses: 'none', earrings: 'dangles', warpaint: 'none', cape: 'none', capeColor: 'forest', outfit: 'verdant', outfitPrimary: 'deeppine', outfitAccent: 'sage', weapon: true, weaponKind: 'sickle', backdrop: 'meadow' } },
  { name: 'Human monk', look: { race: 'human', skin: 'amber', hairStyle: 'buzz', hairColor: 'espresso', eyes: 'darkbrown', mouth: 'neutral', build: 'lithe', freckles: 'none', blush: false, scar: 'none', glasses: 'none', earrings: 'none', warpaint: 'dusk', cape: 'none', capeColor: 'forest', outfit: 'gi', outfitPrimary: 'cream', outfitAccent: 'wine', weapon: true, weaponKind: 'quarterstaff', backdrop: 'parchment' } },
  { name: 'Elf sorcerer', look: { race: 'elf', skin: 'moonstone', hairStyle: 'longwavy', hairColor: 'teal', eyes: 'storm', mouth: 'smirk', build: 'average', freckles: 'none', blush: false, scar: 'none', glasses: 'none', earrings: 'studs', warpaint: 'none', cape: 'long', capeColor: 'duskpurple', outfit: 'stormcaller', outfitPrimary: 'duskpurple', outfitAccent: 'riverteal', weapon: true, weaponKind: 'orb', backdrop: 'arcane' } },
  { name: 'Dwarf ranger', look: { race: 'dwarf', skin: 'chestnut', hairStyle: 'sidepart', hairColor: 'russet', eyes: 'hazel', mouth: 'smile', build: 'sturdy', freckles: 'none', blush: false, scar: 'brow', glasses: 'none', earrings: 'none', warpaint: 'none', cape: 'short', capeColor: 'olive', outfit: 'wayfinder', outfitPrimary: 'forest', outfitAccent: 'saddle', weapon: true, weaponKind: 'bow', beard: false, backdrop: 'meadow' } }
];

const cols = 4, rows = Math.ceil(looks.length / cols), cw = 260, chh = 340;
let cells = '';
looks.forEach((e, i) => {
  const x = (i % cols) * cw + 10, y = Math.floor(i / cols) * chh + 10;
  const s = TDM.avatar.svg(e.look, { width: 240 }).replace('width="240" height="280"', 'width="240" height="280"');
  cells += `<g transform="translate(${x},${y})">${s}<text x="120" y="300" text-anchor="middle" font-family="Georgia" font-size="16" fill="#2e2620">${e.name}</text></g>`;
});
const sheet = `<svg xmlns="http://www.w3.org/2000/svg" width="${cols * cw}" height="${rows * chh}"><rect width="100%" height="100%" fill="#f4efe2"/>${cells}</svg>`;
fs.writeFileSync('/tmp/avatar-sheet.svg', sheet);
console.log('written');
