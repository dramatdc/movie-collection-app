# Hardcopy

A free, self-hosted movie collection tracker/picker. Scan a disc's barcode or
search by title, and it looks up the movie via [TMDb](https://www.themoviedb.org).
Installs to your iPhone home screen as a PWA — no App Store, no Apple
Developer account.

## One-time setup

1. **TMDb API key** (free): sign up at themoviedb.org, then generate a key at
   Settings > API. Copy it into `TMDB_API_KEY` in `.env.local`.
2. **Firebase project** (free): create a project at
   [console.firebase.google.com](https://console.firebase.google.com).
   - Enable **Authentication > Sign-in method > Email/Password**.
   - Enable **Firestore Database** (production mode).
   - In Project settings > General > Your apps, add a Web app and copy the
     config values into the `NEXT_PUBLIC_FIREBASE_*` vars in `.env.local`.
   - Deploy `firestore.rules` from this repo to your project (via the
     Firebase console's Rules tab, or the Firebase CLI: `firebase deploy
     --only firestore:rules`).
3. Copy `.env.example` to `.env.local` and fill in the values from steps 1-2.

## Local development

```bash
npm install
npm run dev
```

Visit http://localhost:3000. Camera access for barcode scanning works on
localhost without HTTPS.

## Deploying (free, on Vercel)

1. Push this repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new).
3. Add the same environment variables from `.env.local` in the Vercel
   project's Settings > Environment Variables.
4. Deploy. Vercel gives you HTTPS automatically, which the camera scanner
   requires in production.

## Installing on your iPhone

Open the deployed URL in **Safari** (not Chrome — iOS PWA install only works
in Safari), tap the Share icon, then **Add to Home Screen**. The app icon
will appear on your home screen and launches full-screen, like a native app.

## Notes

- UPC barcode lookups use a free trial tier (100/day) — results are cached
  so re-scanning the same disc never costs another lookup. If a scan fails or
  the limit is hit, use "Search by title" instead.
- iOS Safari can evict offline storage after long periods of inactivity —
  open the app with a connection occasionally to keep your library synced
  for offline browsing.
