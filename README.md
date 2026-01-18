# MomoMusicQ

A music discovery UI built with React, Tailwind, and Firebase.

## Features
- Multi-page layout with sidebar, player, and lyrics overlay
- Track browsing, search, and playlists (local state)
- Admin upload flow wired to Firebase Storage/Firestore

## Getting Started

```bash
npm install
npm start
```

Open http://localhost:3000

## Environment Variables
Copy `.env.example` to `.env` and fill in Firebase config:

```
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
```

If these values are not provided, the app will fall back to demo tracks.

## Lyrics Format
Lyrics can be either plain strings or time-coded objects:

```js
// Simple lines
lyrics: ["Line one", "Line two"]

// Time-coded (LRC-like)
lyrics: [
  { time: 12.4, text: "First line" },
  { time: 18.9, text: "Second line" }
]
```

Admin upload supports LRC-style input:

```
[00:10.50]First line
[00:20.00]Second line
```

## Scripts
- `npm start` - Run the app in development
- `npm test` - Run tests
- `npm run build` - Create a production build
