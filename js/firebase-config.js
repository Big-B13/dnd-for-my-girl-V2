/* ============================================================
   TALES OF THE DM — Firebase configuration
   ============================================================
   1) Go to https://console.firebase.google.com → your project
   2) Project Settings → General → "Your apps" → Web app
      → SDK setup and configuration → Config
   3) Copy the missing values below (apiKey, authDomain,
      projectId, and databaseURL if you use Realtime Database).

   The values you already gave me are filled in. The apiKey is
   found in the same config box — it is a PUBLIC web key, safe
   to ship in a website.

   DB_MODE:
     'auto'      → uses Realtime Database if databaseURL is set,
                   otherwise Cloud Firestore (recommended)
     'firestore' → force Cloud Firestore
     'rtdb'      → force Realtime Database
     'local'     → never use the cloud (progress stays on this
                   device only, in localStorage)

   Until apiKey/projectId are filled in, the game automatically
   plays in "offline mode" and keeps saves on the device. As soon
   as you complete the config, everything syncs — and any local
   progress is uploaded to the cloud the first time it connects.
   ============================================================ */

window.TDM = window.TDM || {};
window.TDM_CONFIG = {
  DB_MODE: 'auto',

  FIREBASE: {
    apiKey:            "AIzaSyAg2skPlSIqAkWT8nsNi-Az9uQ4mP7mFv8",
    authDomain:        "dnd-game-2.firebaseapp.com",
    projectId:         "dnd-game-2",
    storageBucket:     "dnd-game-2.firebasestorage.app",
    messagingSenderId: "688432397884",
    appId:             "1:688432397884:web:ab8c0cf421081de38c8d39",
    measurementId:     "G-ZEKVRXW4WR",
    // You created a Realtime Database in europe-west1. Because this is filled in,
    // DB_MODE:'auto' selects Realtime Database (it only falls back to Firestore
    // when this is empty). Note the region-specific host — the plain
    // "...firebaseio.com" URL will NOT work for a europe-west1 database.
    databaseURL:       "https://dnd-game-2-default-rtdb.europe-west1.firebasedatabase.app"
  }
};
