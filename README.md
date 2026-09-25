# generic asf yahtzee

a deliberately simple, two-player yahtzee-style game for static hosting.

## run it

Serve the folder with any static server (ES modules do not run from `file://`):

```sh
python3 -m http.server 8080
```

Then open `http://localhost:8080`. With no configuration the game uses `localStorage` and `BroadcastChannel`, which is useful for testing by opening two tabs on the same browser.

## enable online multiplayer

Create a Firebase project, enable Realtime Database, and add a `config.js` before `app.js` in `index.html`:

```js
globalThis.YAHTZEE_FIREBASE_CONFIG = {
  apiKey: "...",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  appId: "..."
};
```

These are Firebase's intended-to-be-public client identifiers, not admin secrets. For a small private deployment, apply Realtime Database rules that validate the room shape and only permit five-character room keys. For a public deployment, enable Firebase anonymous authentication and extend `multiplayer.js` to sign in, then restrict writes to authenticated users. Never place service-account credentials in this repository.

## deploy to GitHub Pages

In the repository settings, choose **Pages → Deploy from a branch**, select the branch containing these files and the root folder. No build step or server is required.

The realtime provider is isolated in `multiplayer.js`; replace the exported `rooms` adapter to use Supabase or another hosted service.
