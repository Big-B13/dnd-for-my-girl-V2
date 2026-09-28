/* ============================================================
   EPISODE ONE — assembly
   Merges the three acts into the episode the engine plays.
   Loaded after episode1.js, episode1-crew.js, episode1-bake.js.
   ============================================================ */
(function () {
  const TDM = (typeof window !== 'undefined')
    ? (window.TDM = window.TDM || {})
    : (global.TDM = global.TDM || {});

  const scenes = Object.assign({},
    TDM.EP1_SCENES_A || {},
    TDM.EP1_SCENES_B || {},
    TDM.EP1_SCENES_C || {});

  TDM.EPISODES = TDM.EPISODES || {};
  TDM.EPISODES.ep1_apple_pie = {
    id: 'ep1_apple_pie',
    number: 1,
    title: "Grammy's Country Apple Pie",
    subtitle: 'The kinder road',
    blurb: 'An old wizard wants one last taste of his childhood. Two days south there is a bakery full of goblins who have been trying to bake it for forty years. Nobody has to get hurt.',
    credit: 'After the one-shot by Jennifer Adcock — retold from Perry\'s run, DM: Rex.',
    levels: '1st — 2nd',
    length: 'about an hour',
    cover: '🥧',
    available: true,
    start: 'tower',
    koScene: 'ko',
    endScene: 'epilogue',
    scenes: scenes
  };

  TDM.EPISODE_ORDER = TDM.EPISODE_ORDER || [];
  if (!TDM.EPISODE_ORDER.includes('ep1_apple_pie')) TDM.EPISODE_ORDER.push('ep1_apple_pie');

  /* The two locked ??? cards on the episode-select screen. */
  TDM.COMING_SOON = TDM.COMING_SOON || [
    { number: 2, title: '???', blurb: '???', eta: 'Not yet written' },
    { number: 3, title: '???', blurb: '???', eta: 'Not yet written' }
  ];
})();
