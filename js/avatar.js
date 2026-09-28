/* ============================================================
   TALES OF THE DM — Avatar builder
   Layered SVG portrait assembled from a "look" object.
   Runs in browser AND node (pure string building) so it can be
   tested and rendered headlessly.
   ============================================================ */
(function () {
  const TDM = (typeof window !== 'undefined')
    ? (window.TDM = window.TDM || {})
    : (global.TDM = global.TDM || {});
  const OPT = TDM.CHAR_OPTIONS;
  const APP = OPT.APPEARANCE;
  const MIRROR = 'translate(240,0) scale(-1,1)';

  /* ---------- color helpers ---------- */
  function clamp(n) { return Math.max(0, Math.min(255, Math.round(n))); }
  function hexToRgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(v => clamp(v).toString(16).padStart(2, '0')).join('');
  }
  function shade(hex, amt) { // amt: -100..100
    const [r, g, b] = hexToRgb(hex);
    if (amt >= 0) return rgbToHex(r + (255 - r) * (amt / 100), g + (255 - g) * (amt / 100), b + (255 - b) * (amt / 100));
    const k = 1 + amt / 100;
    return rgbToHex(r * k, g * k, b * k);
  }
  function isLight(hex) { const [r, g, b] = hexToRgb(hex); return (r * 0.299 + g * 0.587 + b * 0.114) > 170; }

  const pick = (list, id, fb) => (list.find(x => x.id === id) || list.find(x => x.id === fb) || list[0]);
  const raw = (id, list, fb) => (typeof id === 'string' && id.startsWith('#')) ? id : pick(list, id, fb).hex;
  const skinHex = id => raw(id, APP.skinTones, 'golden');
  const hairHex = id => raw(id, APP.hairColors, 'chestnuthair');
  const eyeHex = id => raw(id, APP.eyeColors, 'brown');
  const outfitHex = id => raw(id, APP.outfitColors, 'forest');

  /* ---------- static geometry ---------- */

  // Soft egg head. Left/right symmetrical around x=120.
  const HEAD = 'M 120,56 C 87,56 71,83 71,110 C 71,139 88,163 120,171 C 152,163 169,139 169,110 C 169,83 153,56 120,56 Z';

  const EARS = {
    round: (s) => `<ellipse cx="71" cy="113" rx="7.5" ry="10.5" fill="${s}"/><ellipse cx="169" cy="113" rx="7.5" ry="10.5" fill="${s}"/>`,
    slight: (s) => `<path d="M 71,104 C 64,98 61,90 63,82 C 70,88 74,97 74.5,107 Z" fill="${s}"/><path d="M 169,104 C 176,98 179,90 177,82 C 170,88 166,97 165.5,107 Z" fill="${s}"/>`,
    pointed: (s) => `<path d="M 71,106 C 63,99 58,88 61,77 C 66,80 72,88 74,96 C 74.6,102 74,106 74,106 Z" fill="${s}"/><path d="M 169,106 C 177,99 182,88 179,77 C 174,80 168,88 166,96 C 165.4,102 166,106 166,106 Z" fill="${s}"/>`
  };

  // Hair: front (over head) and back (behind everything) layers.
  // Designed for head top y≈50, temples x≈71/169, chin y≈171.
  const HAIR = {
    bald:     { front: null, back: null },
    buzz:     { front: 'M 71,112 C 68,72 92,52 120,52 C 148,52 172,72 169,112 C 169,90 150,74 120,74 C 90,74 71,90 71,112 Z', back: null },
    short:    { front: 'M 71,114 C 67,70 92,49 120,49 C 148,49 173,70 169,114 C 166,96 158,88 150,92 C 143,80 128,77 116,83 C 102,79 87,88 82,99 C 76,102 72,107 71,114 Z', back: null },
    sidepart: { front: 'M 71,114 C 67,68 93,48 120,48 C 149,48 173,70 169,114 C 167,95 161,86 152,90 C 150,74 132,66 114,74 C 98,78 84,86 78,97 C 74,102 72,107 71,114 Z', back: null },
    messy:    { front: 'M 71,114 C 68,68 92,48 120,48 C 150,48 173,70 169,114 C 166,98 162,92 156,96 L 150,84 L 142,96 L 134,82 L 124,95 L 114,82 L 106,96 L 96,86 L 90,100 L 84,94 C 78,98 73,105 71,114 Z', back: null },
    bob:      { front: 'M 71,150 C 66,140 68,60 92,50 C 110,43 130,43 148,50 C 172,60 174,140 169,150 C 166,120 162,104 152,98 C 150,82 132,74 116,80 C 100,82 88,90 84,102 C 76,108 73,128 71,150 Z', back: 'M 66,150 C 62,80 90,44 120,44 C 150,44 178,80 174,150 C 170,132 158,124 120,124 C 82,124 70,132 66,150 Z' },
    longstraight: { front: 'M 71,158 C 66,150 68,60 92,50 C 110,43 130,43 148,50 C 172,60 174,150 169,158 C 165,120 160,106 152,100 C 150,82 132,74 116,80 C 100,82 88,90 84,104 C 76,110 73,132 71,158 Z', back: 'M 63,180 C 58,80 88,42 120,42 C 152,42 182,80 177,180 C 172,236 168,244 156,246 L 84,246 C 72,244 68,236 63,180 Z' },
    longwavy: { front: 'M 71,156 C 66,148 68,60 92,50 C 110,43 130,43 148,50 C 172,60 174,148 169,156 C 166,124 158,108 150,102 C 148,84 132,74 116,80 C 100,82 88,92 84,106 C 76,112 73,134 71,156 Z', back: 'M 62,180 C 57,84 88,42 120,42 C 152,42 183,84 178,180 C 180,208 170,224 162,238 C 156,248 146,242 142,230 C 136,244 124,248 118,234 C 112,248 98,248 94,232 C 86,244 74,240 74,226 C 66,212 60,198 62,180 Z' },
    curly:    { front: 'M 71,116 C 66,106 66,96 70,88 C 68,78 74,66 82,62 C 86,52 96,46 106,47 C 114,40 128,40 136,46 C 146,44 156,50 158,60 C 168,66 172,78 168,88 C 172,98 172,108 168,116 C 164,104 158,96 150,98 C 146,86 134,80 122,84 C 110,80 96,86 92,98 C 84,96 76,104 71,116 Z', back: 'M 60,150 C 52,120 56,84 76,64 C 86,48 108,40 120,42 C 134,40 154,48 164,64 C 184,84 188,120 180,150 C 178,166 168,176 154,176 C 146,176 140,170 138,162 C 134,172 126,176 120,176 C 112,176 106,170 102,162 C 100,172 92,178 84,176 C 70,174 62,166 60,150 Z' },
    ponytail: { front: 'M 71,114 C 67,70 92,49 120,49 C 148,49 173,70 169,114 C 166,96 158,88 150,92 C 143,80 128,77 116,83 C 102,79 87,88 82,99 C 76,102 72,107 71,114 Z', back: 'M 66,120 C 62,74 90,46 120,46 C 150,46 178,74 174,120 C 172,132 166,138 158,138 L 150,138 C 160,160 162,190 154,214 C 150,228 142,236 134,234 C 128,232 126,222 130,212 C 138,192 138,166 128,150 C 122,142 116,140 110,140 C 96,140 70,138 66,120 Z' },
    highponytail: { front: 'M 71,114 C 67,70 92,49 120,49 C 148,49 173,70 169,114 C 166,96 158,88 150,92 C 143,80 128,77 116,83 C 102,79 87,88 82,99 C 76,102 72,107 71,114 Z', back: 'M 66,120 C 62,74 90,46 120,46 C 150,46 178,74 174,120 C 172,134 164,140 154,140 L 108,140 C 96,138 70,138 66,120 Z' },
    twinbraids: { front: 'M 71,114 C 67,70 92,49 120,49 C 148,49 173,70 169,114 C 166,96 158,88 150,92 C 143,80 128,77 116,83 C 102,79 87,88 82,99 C 76,102 72,107 71,114 Z', back: 'M 66,120 C 62,74 90,46 120,46 C 150,46 178,74 174,120 C 172,134 164,140 154,140 L 86,140 C 76,140 70,132 66,120 Z', deco: (c) => braid(c, 68, 150, -8) + braid(c, 172, 150, 8) },
    braid:    { front: 'M 71,114 C 67,70 92,49 120,49 C 148,49 173,70 169,114 C 166,96 158,88 150,92 C 143,80 128,77 116,83 C 102,79 87,88 82,99 C 76,102 72,107 71,114 Z', back: 'M 66,120 C 62,74 90,46 120,46 C 150,46 178,74 174,120 C 172,134 164,140 154,140 L 100,140 C 88,140 70,136 66,120 Z', deco: (c) => braid(c, 150, 150, 6) },
    bun:      { front: 'M 71,114 C 67,70 92,49 120,49 C 148,49 173,70 169,114 C 166,96 158,88 150,92 C 143,80 128,77 116,83 C 102,79 87,88 82,99 C 76,102 72,107 71,114 Z', back: 'M 66,118 C 62,72 90,44 120,44 C 150,44 178,72 174,118 C 172,130 164,136 154,137 L 86,137 C 76,136 70,130 66,118 Z M 120,22 C 104,22 94,34 94,47 C 94,60 104,70 120,70 C 136,70 146,60 146,47 C 146,34 136,22 120,22 Z' },
    pigtails: { front: 'M 71,114 C 67,70 92,49 120,49 C 148,49 173,70 169,114 C 166,96 158,88 150,92 C 143,80 128,77 116,83 C 102,79 87,88 82,99 C 76,102 72,107 71,114 Z', back: 'M 66,120 C 62,74 90,46 120,46 C 150,46 178,74 174,120 C 172,134 164,140 154,140 L 86,140 C 76,140 70,132 66,120 Z' , deco: (c) => pigtail(c, 60) + pigtail(c, 180, true) },
    mohawk:   { front: 'M 100,114 C 96,76 104,46 120,42 C 136,46 144,76 140,114 C 138,92 132,78 120,74 C 108,78 102,92 100,114 Z', back: null }
  };

  function braid(c, x, y, dir) {
    const seg = (cy) => `<ellipse cx="${x}" cy="${cy}" rx="9" ry="8" fill="${c}"/>`;
    let s = seg(y) + seg(y + 16) + seg(y + 32);
    s += `<path d="M ${x - 5},${y + 38} C ${x - 2},${y + 50} ${x + 2},${y + 50} ${x + 5},${y + 38} Z" fill="${c}"/>`;
    return `<g>${s}</g>`;
  }
  function pigtail(c, x, right) {
    return `<path d="M ${x},110 C ${x - 18},116 ${x - 22},138 ${x - 12},152 C ${x - 6},142 ${x - 8},124 ${x + 4},116 Z" fill="${c}"/>`;
  }

  // Beard (dwarf). Inner edge hugs cheeks; covers jaw.
  function beard(c) {
    return `<path d="M 73,116 C 74,146 88,166 104,174 C 96,178 92,184 92,190 C 100,199 110,203 120,203 C 130,203 140,199 148,190 C 148,184 144,178 136,174 C 152,166 166,146 167,116 C 167,150 148,172 120,176 C 92,172 73,150 73,116 Z" fill="${c}"/>` +
      `<path d="M 76,120 C 78,148 94,168 120,170 C 146,168 162,148 164,120 C 164,152 146,176 120,178 C 94,176 76,152 76,120 Z" fill="${c}"/>` +
      `<path d="M 104,136 C 108,132 116,131 120,134 C 124,131 132,132 136,136 C 132,146 126,150 120,150 C 114,150 108,146 104,136 Z" fill="${c}"/>`;
  }

  const TUSKS = 'M 109,144 L 113,132 L 117,144 Z M 123,144 L 127,132 L 131,144 Z';

  function horns(style, c) {
    const bone = c || '#d9cfc0';
    if (style === 'swept') return `<path d="M 92,62 C 78,58 64,60 54,70 C 66,72 82,74 94,80 C 97,72 96,66 92,62 Z" fill="${bone}"/><path d="M 148,62 C 162,58 176,60 186,70 C 174,72 158,74 146,80 C 143,72 144,66 148,62 Z" fill="${bone}"/>`;
    if (style === 'crown') return `<path d="M 98,58 L 102,38 L 110,56 Z" fill="${bone}"/><path d="M 114,54 L 120,32 L 126,54 Z" fill="${bone}"/><path d="M 130,56 L 138,38 L 142,58 Z" fill="${bone}"/>`;
    return `<path d="M 88,66 C 76,54 72,38 80,24 C 84,40 92,52 100,60 C 96,64 92,66 88,66 Z" fill="${bone}"/><path d="M 152,66 C 164,54 168,38 160,24 C 156,40 148,52 140,60 C 144,64 148,66 152,66 Z" fill="${bone}"/>`;
  }

  /* Dragonborn custom head */
  function dragonHead(look, ancestry) {
    const s = ancestry.scale, horn = ancestry.horn;
    const light = shade(s, 22), dark = shade(s, -18);
    let out = '';
    // skull
    out += `<path d="M 120,50 C 90,50 73,76 73,106 C 73,122 78,136 88,145 L 94,162 C 99,176 108,181 120,181 C 132,181 141,176 146,162 L 152,145 C 162,136 167,122 167,106 C 167,76 150,50 120,50 Z" fill="${s}"/>`;
    // muzzle
    out += `<path d="M 98,126 C 98,152 106,172 120,172 C 134,172 142,152 142,126 C 142,120 134,117 120,117 C 106,117 98,120 98,126 Z" fill="${light}"/>`;
    // brow ridges
    out += `<path d="M 86,98 C 92,92 106,92 112,98" stroke="${dark}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    out += `<path d="M 128,98 C 134,92 148,92 154,98" stroke="${dark}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    // scales
    out += `<path d="M 78,120 a 7,7 0 0 1 12,0 M 82,132 a 7,7 0 0 1 12,0 M 150,120 a 7,7 0 0 1 12,0 M 146,132 a 7,7 0 0 1 12,0 M 112,58 a 8,8 0 0 1 16,0" stroke="${dark}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    // nostrils + teeth
    out += `<circle cx="111" cy="134" r="2.2" fill="${dark}"/><circle cx="129" cy="134" r="2.2" fill="${dark}"/>`;
    out += `<path d="M 106,152 L 109,158 L 112,152 Z M 115,155 L 118,161 L 121,155 Z M 124,155 L 127,161 L 130,155 Z M 133,152 L 136,158 L 139,152 Z" fill="#f4efe2"/>`;
    // horns swept back
    out += `<path d="M 90,58 C 76,50 62,50 52,58 C 64,62 78,66 90,72 C 93,66 92,61 90,58 Z" fill="${horn}"/><path d="M 150,58 C 164,50 178,50 188,58 C 176,62 162,66 150,72 C 147,66 148,61 150,58 Z" fill="${horn}"/>`;
    // crest options
    if (look.crest === 'fin') out += `<path d="M 108,52 C 110,30 114,22 120,18 C 126,22 130,30 132,52 C 128,48 124,46 120,46 C 116,46 112,48 108,52 Z" fill="${shade(horn, 14)}"/>`;
    if (look.crest === 'frills') out += `<path d="M 84,84 C 72,84 64,92 62,102 C 72,100 80,98 88,96 Z" fill="${shade(horn, 14)}"/><path d="M 156,84 C 168,84 176,92 178,102 C 168,100 160,98 152,96 Z" fill="${shade(horn, 14)}"/>`;
    return { head: out, isDragon: true };
  }

  /* ---------- faces ---------- */

  function eyes(look, opts) {
    const ec = eyeHex(look.eyes);
    const o = '';
    const eye = (cx) =>
      `<ellipse cx="${cx}" cy="113" rx="8.4" ry="7.2" fill="#fff"/>` +
      `<circle cx="${cx}" cy="113.5" r="5.2" fill="${ec}"/>` +
      `<circle cx="${cx}" cy="113.5" r="2.5" fill="#1c1a24"/>` +
      `<circle cx="${cx - 1.8}" cy="111.2" r="1.5" fill="#fff" opacity="0.95"/>`;
    return o + eye(100) + eye(140) +
      `<path d="M 91,108 C 95,105 105,105 109,108" stroke="#2a2833" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.75"/>` +
      `<path d="M 131,108 C 135,105 145,105 149,108" stroke="#2a2833" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.75"/>`;
  }

  function brows(hc, bald) {
    const c = bald ? '#4a4038' : shade(hc, -22);
    return `<path d="M 90,100 C 95,96 105,96 110,100" stroke="${c}" stroke-width="4.2" fill="none" stroke-linecap="round"/>` +
           `<path d="M 130,100 C 135,96 145,96 150,100" stroke="${c}" stroke-width="4.2" fill="none" stroke-linecap="round"/>`;
  }

  function mouth(style) {
    switch (style) {
      case 'smile': return `<path d="M 109,141 Q 120,151 131,141" stroke="#8a4a42" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 113,147 Q 120,152 127,147" stroke="#c98a86" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.7"/>`;
      case 'grin':  return `<path d="M 107,140 Q 120,154 133,140 Z" fill="#8a4a42"/><path d="M 110,141.5 L 130,141.5" stroke="#fff" stroke-width="3"/>`;
      case 'smirk': return `<path d="M 110,144 Q 121,149 130,141" stroke="#8a4a42" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      case 'neutral': return `<path d="M 112,144 L 128,144" stroke="#8a4a42" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      default: return `<path d="M 112,142 Q 120,148 128,142" stroke="#8a4a42" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    }
  }

  function faceExtras(look, sHex) {
    let o = '';
    const dotc = shade(sHex, -14);
    if (look.freckles !== 'none') {
      const n = look.freckles === 'bold';
      const pts = [[92,126],[97,130],[103,127],[137,126],[142,130],[148,127],[112,130],[128,130],[88,120],[152,120]];
      o += pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${n ? 1.8 : 1.3}" fill="${dotc}" opacity="${n ? 0.8 : 0.55}"/>`).join('');
    }
    if (look.blush) o += `<ellipse cx="88" cy="128" rx="9" ry="5" fill="#e78a8a" opacity="0.32"/><ellipse cx="152" cy="128" rx="9" ry="5" fill="#e78a8a" opacity="0.32"/>`;
    if (look.scar === 'brow') o += `<path d="M 148,92 L 154,104" stroke="#a06a5a" stroke-width="2.4" stroke-linecap="round"/>`;
    if (look.scar === 'cheek') o += `<path d="M 86,122 L 94,136" stroke="#a06a5a" stroke-width="2.4" stroke-linecap="round"/>`;
    return o;
  }

  function glasses(style) {
    if (style === 'round') return `<g stroke="#3a3540" stroke-width="2.6" fill="none"><circle cx="100" cy="113" r="12"/><circle cx="140" cy="113" r="12"/><path d="M 112,113 L 128,113"/><path d="M 88,112 L 76,109"/><path d="M 152,112 L 164,109"/></g>`;
    if (style === 'sharp') return `<g stroke="#3a3540" stroke-width="2.6" fill="none"><rect x="87" y="102" width="26" height="20" rx="4" transform="rotate(-4 100 112)"/><rect x="127" y="102" width="26" height="20" rx="4" transform="rotate(4 140 112)"/><path d="M 113,111 L 127,111"/><path d="M 87,109 L 76,106"/><path d="M 153,109 L 164,106"/></g>`;
    return '';
  }

  function earrings(style) {
    if (style === 'studs') return `<circle cx="71" cy="124" r="2.4" fill="#e3c987"/><circle cx="169" cy="124" r="2.4" fill="#e3c987"/>`;
    if (style === 'hoops') return `<circle cx="71" cy="129" r="4.5" fill="none" stroke="#e3c987" stroke-width="2.2"/><circle cx="169" cy="129" r="4.5" fill="none" stroke="#e3c987" stroke-width="2.2"/>`;
    if (style === 'dangles') return `<path d="M 71,120 L 71,126" stroke="#e3c987" stroke-width="1.6"/><circle cx="71" cy="130" r="3" fill="#c95c74"/><path d="M 169,120 L 169,126" stroke="#e3c987" stroke-width="1.6"/><circle cx="169" cy="130" r="3" fill="#c95c74"/>`;
    return '';
  }

  function warpaint(look) {
    const wp = pick(APP.warpaints, look.warpaint, 'none');
    if (!wp.hex) return '';
    return `<path d="M 74,105 C 90,101 150,101 166,105 L 166,123 C 150,119 90,119 74,123 Z" fill="${wp.hex}" opacity="0.55"/>`;
  }

  /* ---------- torso / outfits ---------- */

  const TORSOS = {
    petite: 'M 58,280 C 60,230 88,197 120,197 C 152,197 180,230 182,280 Z',
    lithe:   'M 51,280 C 53,226 83,193 120,193 C 157,193 187,226 189,280 Z',
    average: 'M 45,280 C 47,223 79,191 120,191 C 161,191 193,223 195,280 Z',
    sturdy:  'M 38,280 C 40,217 72,187 120,187 C 168,187 200,217 202,280 Z',
    tall:    'M 47,280 C 49,219 81,189 120,189 C 159,189 191,219 193,280 Z'
  };

  function outfitDetails(id, p, a) {
    switch (id) {
      case 'plate':
        return `<path d="M 45,236 C 47,223 79,191 120,191 C 161,191 193,223 195,236 C 176,244 148,248 120,248 C 92,248 64,244 45,236 Z" fill="${shade(p, -12)}"/>` +
          `<path d="M 47,214 C 60,200 74,193 88,191 C 80,206 72,220 68,240 C 58,236 51,226 47,214 Z" fill="${shade(p, 14)}"/>` +
          `<path d="M 193,214 C 180,200 166,193 152,191 C 160,206 168,220 172,240 C 182,236 189,226 193,214 Z" fill="${shade(p, 14)}"/>` +
          `<path d="M 100,192 C 108,202 132,202 140,192 L 136,184 C 128,190 112,190 104,184 Z" fill="${a}"/>` +
          `<circle cx="120" cy="212" r="5" fill="${a}"/>`;
      case 'shadow':
        return `<path d="M 98,191 C 106,203 134,203 142,191 L 138,183 C 130,190 110,190 102,183 Z" fill="${shade(p, -18)}"/>` +
          `<path d="M 60,224 L 176,268 L 182,252 L 70,210 Z" fill="${shade(p, -8)}"/>` +
          `<rect x="112" y="238" width="16" height="13" rx="3" fill="${a}"/>`;
      case 'arcanist':
        return `<path d="M 92,191 C 100,206 140,206 148,191 L 144,181 C 134,190 106,190 96,181 Z" fill="${shade(p, 18)}"/>` +
          `<path d="M 116,196 L 124,196 L 126,280 L 114,280 Z" fill="${a}" opacity="0.9"/>` +
          `<circle cx="120" cy="207" r="6.5" fill="${a}" stroke="${shade(a, -30)}" stroke-width="2"/>` +
          `<path d="M 52,232 C 66,222 80,236 94,228" stroke="${shade(p, 20)}" stroke-width="3" fill="none" opacity="0.6"/>` +
          `<path d="M 146,228 C 160,236 174,222 188,232" stroke="${shade(p, 20)}" stroke-width="3" fill="none" opacity="0.6"/>`;
      case 'vestment':
        return `<path d="M 104,192 L 112,280 L 100,280 L 96,192 Z" fill="${a}"/>` +
          `<path d="M 136,192 L 128,280 L 140,280 L 144,192 Z" fill="${a}"/>` +
          `<circle cx="120" cy="216" r="8" fill="${a}" opacity="0.85"/>` +
          `<path d="M 98,191 C 106,202 134,202 142,191 L 138,183 C 130,190 110,190 102,183 Z" fill="${shade(p, -10)}"/>`;
      case 'finery':
        return `<path d="M 100,191 L 120,214 L 140,191 L 132,185 C 126,192 114,192 108,185 Z" fill="${shade(p, -16)}"/>` +
          `<path d="M 100,191 L 114,246 L 104,250 L 88,206 Z" fill="${shade(p, -16)}"/>` +
          `<path d="M 140,191 L 126,246 L 136,250 L 152,206 Z" fill="${shade(p, -16)}"/>` +
          `<path d="M 113,212 C 117,220 123,220 127,212 L 125,228 C 122,232 118,232 115,228 Z" fill="${a}"/>` +
          `<circle cx="120" cy="248" r="3" fill="${a}"/><circle cx="120" cy="262" r="3" fill="${a}"/>`;
      case 'wayfinder':
        return `<path d="M 62,222 L 172,262 L 166,276 L 56,238 Z" fill="${shade(p, -14)}"/>` +
          `<rect x="106" y="238" width="15" height="12" rx="2" fill="${a}"/>` +
          `<path d="M 100,192 C 108,204 132,204 140,192 L 136,184 C 128,191 112,191 104,184 Z" fill="${shade(p, 10)}"/>` +
          `<path d="M 96,214 L 110,214 M 96,226 L 110,226" stroke="${shade(p, 20)}" stroke-width="2.4"/>`;
      case 'warchief':
        return `<path d="M 46,238 C 60,224 74,218 88,214 C 78,230 72,246 70,262 C 60,256 51,248 46,238 Z" fill="${shade(p, 26)}"/>` +
          `<path d="M 46,238 C 58,232 70,228 84,226 M 50,252 C 60,246 70,242 80,240" stroke="${shade(p, -12)}" stroke-width="2.6" fill="none"/>` +
          `<path d="M 140,200 C 156,208 172,224 182,244 C 172,250 162,252 152,252 C 150,234 146,216 140,200 Z" fill="${a}" opacity="0.9"/>` +
          `<path d="M 100,196 C 108,206 132,206 140,196 L 136,188 C 128,195 112,195 104,188 Z" fill="${shade(p, -8)}"/>`;
      case 'verdant':
        return leaves('#3f6b4a') + leaves('#6fa25c', true) +
          `<path d="M 102,193 C 110,204 130,204 138,193 L 134,185 C 127,191 113,191 106,185 Z" fill="${a}"/>` +
          `<path d="M 96,214 C 108,224 132,224 144,214" stroke="#6fa25c" stroke-width="3.4" fill="none"/>`;
      case 'oathplate':
        return `<path d="M 45,238 C 47,224 79,192 120,192 C 161,192 193,224 195,238 C 176,246 148,250 120,250 C 92,250 64,246 45,238 Z" fill="${shade(p, -10)}"/>` +
          `<path d="M 104,196 L 136,196 L 132,280 L 108,280 Z" fill="${a}"/>` +
          `<circle cx="120" cy="220" r="10" fill="${shade(p, 12)}" stroke="${shade(a, -20)}" stroke-width="2"/>` +
          `<path d="M 47,214 C 60,200 74,194 88,192 C 80,206 72,220 68,240 C 58,236 51,226 47,214 Z" fill="${shade(p, 16)}"/>` +
          `<path d="M 193,214 C 180,200 166,194 152,192 C 160,206 168,220 172,240 C 182,236 189,226 193,214 Z" fill="${shade(p, 16)}"/>`;
      case 'gi':
        return `<path d="M 100,191 L 120,232 L 140,191 L 132,185 C 126,192 114,192 108,185 Z" fill="${shade(p, -14)}"/>` +
          `<path d="M 100,191 L 120,232 L 112,236 L 92,198 Z" fill="${shade(p, -6)}"/>` +
          `<path d="M 140,191 L 120,232 L 128,236 L 148,198 Z" fill="${shade(p, -6)}"/>` +
          `<path d="M 92,246 C 104,254 136,254 148,246 L 148,262 C 136,270 104,270 92,262 Z" fill="${a}"/>` +
          `<path d="M 114,254 L 126,254 L 124,268 L 116,268 Z" fill="${shade(a, -18)}"/>`;
      case 'pactweave':
        return `<path d="M 94,191 C 102,206 138,206 146,191 L 142,181 C 132,190 108,190 98,181 Z" fill="${shade(p, 24)}"/>` +
          `<path d="M 96,196 L 100,206 M 108,200 L 112,210 M 128,200 L 132,210 M 140,196 L 144,206" stroke="${a}" stroke-width="2.6" stroke-linecap="round"/>` +
          `<path d="M 116,198 L 124,198 L 128,280 L 112,280 Z" fill="${a}" opacity="0.35"/>`;
      case 'stormcaller':
        return `<path d="M 100,191 C 110,204 132,202 142,192 L 138,183 C 130,190 110,190 104,184 Z" fill="${shade(p, 20)}"/>` +
          `<path d="M 142,192 C 162,206 176,232 184,262 L 160,280 L 138,280 Z" fill="${shade(p, -12)}"/>` +
          `<path d="M 148,210 C 160,226 168,246 172,266" stroke="${a}" stroke-width="3" fill="none" opacity="0.8"/>` +
          `<circle cx="120" cy="208" r="4" fill="${a}"/><circle cx="110" cy="222" r="3" fill="${a}"/><circle cx="132" cy="222" r="3" fill="${a}"/>`;
      default: // traveler
        return `<path d="M 100,192 C 108,204 132,204 140,192 L 136,184 C 128,191 112,191 104,184 Z" fill="${a}"/>` +
          `<path d="M 110,200 C 116,206 124,206 130,200 L 128,214 C 124,218 116,218 112,214 Z" fill="${a}"/>` +
          `<path d="M 116,213 L 124,213 L 128,244 L 118,252 L 112,244 Z" fill="${shade(a, -14)}"/>`;
    }
  }

  function leaves(c, alt) {
    const y = alt ? 216 : 206;
    const l = (x, r) => `<ellipse cx="${x}" cy="${y}" rx="11" ry="5.5" fill="${c}" transform="rotate(${r} ${x} ${y})"/>`;
    return l(58, -28) + l(76, -14) + `<ellipse cx="182" cy="${y}" rx="11" ry="5.5" fill="${c}" transform="rotate(28 182 ${y})"/>` + `<ellipse cx="164" cy="${y}" rx="11" ry="5.5" fill="${c}" transform="rotate(14 164 ${y})"/>`;
  }

  /* ---------- weapons (drawn behind torso, right side) ---------- */

  function weapon(kind, a) {
    const g = (inner) => `<g transform="rotate(26 188 140)">${inner}</g>`;
    switch (kind) {
      case 'sword': return g(`<rect x="183" y="34" width="10" height="86" rx="2" fill="#c9cdd6"/><path d="M 183,34 L 188,26 L 193,34 Z" fill="#c9cdd6"/><rect x="171" y="118" width="34" height="8" rx="3" fill="#c9a13f"/><rect x="184" y="126" width="8" height="26" rx="3" fill="#7a5236"/><circle cx="188" cy="155" r="5" fill="#c9a13f"/>`);
      case 'twin_daggers': return `<g transform="rotate(-24 56 140)"><rect x="52" y="96" width="8" height="44" rx="2" fill="#c9cdd6"/><path d="M 52,96 L 56,88 L 60,96 Z" fill="#c9cdd6"/><rect x="46" y="138" width="20" height="6" rx="2" fill="#c9a13f"/><rect x="52" y="144" width="8" height="20" rx="3" fill="#5a3a2a"/></g>` + g(`<rect x="184" y="96" width="8" height="44" rx="2" fill="#c9cdd6"/><path d="M 184,96 L 188,88 L 192,96 Z" fill="#c9cdd6"/><rect x="178" y="138" width="20" height="6" rx="2" fill="#c9a13f"/><rect x="184" y="144" width="8" height="20" rx="3" fill="#5a3a2a"/>`);
      case 'staff': return g(`<rect x="184" y="30" width="7" height="176" rx="3" fill="#7a5236"/><circle cx="187.5" cy="26" r="11" fill="${a}" opacity="0.35"/><circle cx="187.5" cy="26" r="7" fill="${a}"/>`);
      case 'mace': return g(`<rect x="185" y="60" width="7" height="140" rx="3" fill="#5a4030"/><circle cx="188.5" cy="52" r="14" fill="#8a8f99"/><path d="M 174,52 L 180,44 M 203,52 L 197,44 M 174,52 L 180,60 M 203,52 L 197,60 M 188.5,38 L 188.5,42" stroke="#8a8f99" stroke-width="4" stroke-linecap="round"/>`);
      case 'lute': return `<g><ellipse cx="186" cy="150" rx="26" ry="22" fill="#a9743f"/><circle cx="186" cy="150" r="8" fill="#5a4030"/><path d="M 176,132 L 200,110 L 208,118 L 186,138 Z" fill="#7a5236"/><path d="M 182,136 L 204,114 M 190,138 L 206,122" stroke="#e0d0a6" stroke-width="1.4"/></g>`;
      case 'bow': return `<path d="M 200,44 C 232,96 232,178 200,232" stroke="#7a5236" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M 200,44 L 200,232" stroke="#e0d0a6" stroke-width="2" opacity="0.8"/>`;
      case 'greataxe': return g(`<rect x="184" y="40" width="8" height="176" rx="3" fill="#5a4030"/><path d="M 192,52 C 216,58 224,80 220,102 C 208,90 196,84 188,84 Z" fill="#b8bcc4"/><path d="M 184,52 C 160,58 152,80 156,102 C 168,90 180,84 188,84 Z" fill="#b8bcc4"/>`);
      case 'sickle': return g(`<rect x="185" y="50" width="6" height="160" rx="3" fill="#7a5236"/><path d="M 188,56 C 210,54 224,68 226,88 C 214,74 200,68 188,70 Z" fill="#b8bcc4"/><path d="M 186,64 C 196,62 206,66 212,74" stroke="#6fa25c" stroke-width="3" fill="none"/>`);
      case 'swordshield': return g(`<rect x="184" y="60" width="8" height="70" rx="2" fill="#c9cdd6"/><rect x="175" y="128" width="26" height="7" rx="3" fill="#c9a13f"/><rect x="184" y="135" width="8" height="22" rx="3" fill="#7a5236"/>`) + `<circle cx="55" cy="160" r="26" fill="${shade(a, -25)}"/><circle cx="55" cy="160" r="26" fill="none" stroke="${shade(a, -45)}" stroke-width="3"/><circle cx="55" cy="160" r="8" fill="#c9a13f"/>`;
      case 'quarterstaff': return g(`<rect x="185" y="26" width="7" height="184" rx="3" fill="#a9743f"/><rect x="182" y="90" width="13" height="18" rx="4" fill="${a}"/>`);
      case 'wand': return g(`<rect x="185" y="86" width="7" height="72" rx="3" fill="#5a4030"/><path d="M 188.5,74 L 191,81 L 198,83 L 191,85 L 188.5,92 L 186,85 L 179,83 L 186,81 Z" fill="${a}"/>`);
      case 'revolver': return `<g transform="rotate(-8 190 150)">
        <rect x="178" y="138" width="34" height="9" rx="2.5" fill="#6d7179"/>
        <rect x="205" y="139" width="26" height="6.5" rx="2" fill="#8a8f99"/>
        <circle cx="200" cy="145" r="7.5" fill="#5a5e66"/>
        <circle cx="200" cy="145" r="3" fill="#33363c"/>
        <path d="M 182,147 C 178,156 179,166 185,171 L 191,163 C 187,159 186,152 188,147 Z" fill="#7a5236"/>
        <rect x="176" y="136" width="8" height="5" rx="1.5" fill="#8a8f99"/>
        <path d="M 192,148 L 192,154 L 196,154" stroke="#4a4e55" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      </g>`;
      case 'orb': return `<circle cx="198" cy="120" r="17" fill="${a}" opacity="0.3"/><circle cx="198" cy="120" r="12" fill="${a}"/><path d="M 191,114 a 8,8 0 0 1 8,-4" stroke="#fff" stroke-width="2.4" fill="none" opacity="0.8"/><path d="M 206,98 L 208,104 M 214,118 L 208,117 M 192,96 L 196,102" stroke="${a}" stroke-width="2.4" stroke-linecap="round"/>`;
      default: return '';
    }
  }

  /* ---------- backdrops ---------- */

  function backdrop(id, plain) {
    if (plain) return `<rect x="0" y="0" width="240" height="280" rx="18" fill="#efe6d2"/>`;
    switch (id) {
      case 'dusk':
        return `<defs><linearGradient id="bgd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3a6b"/><stop offset="1" stop-color="#e89a6b"/></linearGradient></defs>` +
          `<rect x="0" y="0" width="240" height="280" rx="18" fill="url(#bgd)"/>` +
          `<circle cx="186" cy="52" r="17" fill="#f7ecc9"/><circle cx="179" cy="47" r="15" fill="#e89a6b" opacity="0.55"/>` +
          `<circle cx="40" cy="36" r="2" fill="#fff" opacity="0.8"/><circle cx="70" cy="60" r="1.6" fill="#fff" opacity="0.7"/><circle cx="30" cy="88" r="1.6" fill="#fff" opacity="0.6"/><circle cx="204" cy="106" r="1.8" fill="#fff" opacity="0.7"/><circle cx="96" cy="30" r="1.4" fill="#fff" opacity="0.6"/>`;
      case 'arcane':
        return `<defs><linearGradient id="bga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d2a4a"/><stop offset="1" stop-color="#5a4a8a"/></linearGradient></defs>` +
          `<rect x="0" y="0" width="240" height="280" rx="18" fill="url(#bga)"/>` +
          `<circle cx="120" cy="150" r="86" fill="none" stroke="#b06bc9" stroke-width="1.4" opacity="0.4"/><circle cx="120" cy="150" r="98" fill="none" stroke="#4fa8b8" stroke-width="1" opacity="0.3"/>` +
          `<path d="M 36,50 L 39,58 L 47,61 L 39,64 L 36,72 L 33,64 L 25,61 L 33,58 Z" fill="#e3c987" opacity="0.8"/><path d="M 200,190 L 202.4,197 L 209,199 L 202.4,201 L 200,208 L 197.6,201 L 191,199 L 197.6,197 Z" fill="#b06bc9" opacity="0.8"/><circle cx="210" cy="60" r="2.2" fill="#e3c987" opacity="0.7"/><circle cx="30" cy="210" r="2" fill="#4fa8b8" opacity="0.8"/>`;
      case 'parchment':
        return `<defs><linearGradient id="bgp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2e5c8"/><stop offset="1" stop-color="#e3cd9e"/></linearGradient></defs>` +
          `<rect x="0" y="0" width="240" height="280" rx="18" fill="url(#bgp)"/>` +
          `<path d="M 20,20 h 16 M 20,20 v 16 M 220,260 h -16 M 220,260 v -16 M 220,20 h -16 M 220,20 v 16 M 20,260 h 16 M 20,260 v -16" stroke="#b09468" stroke-width="2.4" opacity="0.6" fill="none"/>`;
      default: // meadow
        return `<defs><linearGradient id="bgm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8ecf5"/><stop offset="1" stop-color="#cfe8c2"/></linearGradient></defs>` +
          `<rect x="0" y="0" width="240" height="280" rx="18" fill="url(#bgm)"/>` +
          `<circle cx="52" cy="48" r="15" fill="#f7e8a0" opacity="0.9"/>` +
          `<path d="M 0,214 C 50,192 110,208 240,188 L 240,280 L 0,280 Z" fill="#9caf88"/><path d="M 0,240 C 70,224 160,244 240,228 L 240,280 L 0,280 Z" fill="#839a72"/>` +
          `<circle cx="200" cy="70" r="3" fill="#fff" opacity="0.7"/><circle cx="182" cy="84" r="2.4" fill="#fff" opacity="0.6"/>`;
    }
  }

  function cape(kind, c) {
    if (kind === 'none' || !c) return '';
    if (kind === 'short')
      return `<path d="M 64,212 C 44,232 36,244 34,252 L 100,252 L 116,240 L 124,240 L 140,252 L 206,252 C 204,244 196,232 176,212 C 158,196 82,196 64,212 Z" fill="${c}"/>` +
        `<path d="M 176,212 C 196,232 204,244 206,252 L 140,252 C 152,236 164,222 176,212 Z" fill="${shade(c, -16)}"/>`;
    return `<path d="M 64,212 C 42,246 34,266 32,280 L 208,280 C 206,266 198,246 176,212 C 158,196 82,196 64,212 Z" fill="${c}"/>` +
      `<path d="M 176,212 C 198,246 206,266 208,280 L 158,280 C 160,252 166,230 176,212 Z" fill="${shade(c, -16)}"/>`;
  }

  /* ---------- main render ---------- */

  function svg(look, opts) {
    opts = opts || {};
    const race = OPT.RACES.find(r => r.id === look.race) || OPT.RACES[0];
    const ancestry = (race.ancestries || []).find(x => x.id === look.ancestry) || (race.ancestries || [])[0];
    const sHex = skinHex(look.skin);
    const sDark = shade(sHex, -10);
    const hHex = hairHex(look.hairColor);
    const primary = outfitHex(look.outfitPrimary);
    const accent = outfitHex(look.outfitAccent);
    const isDragon = !!race.look.customHead;
    const torso = TORSOS[look.build] || TORSOS.average;
    const small = race.look.small;

    let layers = [];

    layers.push(backdrop(look.backdrop, opts.plain));

    // cape behind everything
    layers.push(cape(look.cape, look.capeColor ? outfitHex(look.capeColor) : accent));

    // weapon behind torso
    if (look.weapon !== false && !opts.hideWeapon) layers.push(weapon(look.weaponKind || 'sword', accent));

    // hair back layer
    const hair = HAIR[look.hairStyle] || HAIR.short;
    if (!isDragon && hair.back) layers.push(`<path d="${hair.back}" fill="${shade(hHex, -8)}"/>`);
    if (!isDragon && hair.deco) layers.push(hair.deco(shade(hHex, -8)));

    // tiefling tail
    if (race.look.tail) layers.push(`<path d="M 176,246 C 208,240 226,258 224,278 C 216,266 204,258 186,260 C 180,261 176,256 176,246 Z" fill="${shade(sHex, -12)}"/><path d="M 216,262 C 222,266 224,272 222,278 C 218,272 212,268 206,268 Z" fill="${shade(sHex, 8)}"/>`);

    // torso in outfit primary
    layers.push(`<path d="${torso}" fill="${primary}"/>`);

    // neck
    layers.push(`<path d="M 105,158 L 105,192 L 135,192 L 135,158 Z" fill="${sHex}"/><path d="M 105,160 C 112,170 128,170 135,160 L 135,166 C 128,174 112,174 105,166 Z" fill="${sDark}" opacity="0.55"/>`);

    // outfit details over torso
    layers.push(outfitDetails(look.outfit, primary, accent));

    // head
    if (isDragon) {
      layers.push(dragonHead(look, ancestry).head);
    } else {
      layers.push(`<path d="${HEAD}" fill="${sHex}"/>`);
      layers.push((EARS[race.look.ears] || EARS.round)(sHex));
    }

    // face zone
    if (isDragon) {
      layers.push(warpaint(look));
      layers.push(eyes(look));
      layers.push(brows(hHex, look.hairStyle === 'bald'));
    } else {
      layers.push(warpaint(look));
      layers.push(eyes(look));
      layers.push(brows(hHex, look.hairStyle === 'bald'));
      layers.push(`<path d="M 120,117 C 117.4,122 116.6,126 120,128" stroke="${sDark}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`);
      layers.push(mouth(look.mouth || 'soft'));
      layers.push(faceExtras(look, sHex));
      if (race.look.tusks) layers.push(`<path d="${TUSKS}" fill="#f2ede2"/>`);
      if (look.beard && race.look.beardOption) { layers.push(beard(hHex)); layers.push(mouth(look.mouth || 'soft')); }
    }

    // horns for tiefling
    if (race.look.horns) layers.push(horns(look.horns, '#d9cfc0'));

    // hair front
    if (!isDragon && hair.front) {
      layers.push(`<path d="${hair.front}" fill="${hHex}"/>`);
      layers.push(`<path d="${hair.front}" fill="#fff" opacity="0.10"/>`);
      layers.push(`<path d="M 92,64 C 100,56 112,52 122,54" stroke="#fff" stroke-width="4" opacity="0.18" fill="none" stroke-linecap="round"/>`);
    }

    // small race: slightly smaller overall presence
    // (kept subtle via shoulders already chosen; nothing needed here)

    // earrings & glasses last
    if (!isDragon) layers.push(earrings(look.earrings));
    layers.push(glasses(look.glasses));

    const w = opts.width || 240;
    return `<svg class="tdm-avatar" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 280" width="${w}" height="${Math.round(w * 280 / 240)}" role="img">` +
      `<rect x="0" y="0" width="240" height="280" rx="18" fill="none"/>` + layers.join('') +
      `<rect x="2" y="2" width="236" height="276" rx="16" fill="none" stroke="#2e2620" stroke-opacity="0.25" stroke-width="3"/>` +
      `</svg>`;
  }

  /* ---------- look helpers ---------- */

  function defaultsFor(raceId, classId) {
    const race = OPT.RACES.find(r => r.id === raceId) || OPT.RACES[0];
    const cls = OPT.CLASSES.find(c => c.id === classId) || OPT.CLASSES[0];
    const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)].id;
    const look = {
      race: race.id,
      ancestry: race.ancestries ? race.ancestries[0].id : null,
      skin: rnd(APP.skinTones),
      hairStyle: race.look.customHead ? null : rnd(['short', 'longstraight', 'bob', 'curly', 'ponytail', 'messy', 'longwavy']),
      hairColor: rnd(APP.hairColors),
      eyes: rnd(APP.eyeColors),
      mouth: rnd(['soft', 'smile', 'smirk']),
      build: rnd(APP.builds),
      freckles: rnd(APP.freckles),
      blush: false,
      scar: 'none',
      glasses: 'none',
      earrings: 'none',
      warpaint: 'none',
      cape: 'none',
      capeColor: 'forest',
      outfit: cls.outfit,
      outfitPrimary: (cls.colors && cls.colors.primary) || 'forest',
      outfitAccent: (cls.colors && cls.colors.accent) || 'butter',
      weapon: true,
      weaponKind: cls.weapon,
      beard: false,
      horns: 'curved',
      crest: 'none',
      backdrop: rnd(APP.backdrops)
    };
    if (race.look.customHead) look.crest = rnd(['none', 'fin', 'frills']);
    return look;
  }

  function colorIdFromHex(hex) {
    const hit = APP.outfitColors.find(c => c.hex === hex);
    return hit ? hit.id : null;
  }

  function randomLook(raceId, classId) {
    const look = defaultsFor(raceId, classId);
    const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)].id;
    look.skin = rnd(APP.skinTones);
    look.hairColor = rnd(APP.hairColors);
    look.eyes = rnd(APP.eyeColors);
    look.outfit = rnd(APP.outfits).id;
    look.outfitPrimary = rnd(APP.outfitColors);
    look.outfitAccent = rnd(APP.outfitColors);
    look.blush = Math.random() < 0.35;
    look.earrings = rnd(APP.earrings);
    look.freckles = rnd(APP.freckles);
    if (look.race === 'tiefling') look.horns = rnd([{ id: 'curved' }, { id: 'swept' }, { id: 'crown' }]).id;
    return look;
  }

  TDM.avatar = { svg, defaultsFor, randomLook, shade, HAIR, _internal: { HEAD, TORSOS } };
})();
