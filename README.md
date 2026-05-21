# DrTWiT

DrTWiT is a desktop player for browsing and playing shows from the TWiT podcast network. It is built with Electron, React, Vite, and TypeScript.

## Current Status

This project is in active local development. The current focus is getting the redesigned app satisfying in local npm testing before any production build, package, DMG, or release work happens.

## What It Does Today

- Lists a curated set of TWiT shows.
- Loads recent episodes from TWiT RSS feeds.
- Lets you add private/member RSS feed URLs and stores them locally on this device.
- Searches and filters the loaded episode list.
- Shows episode metadata, artwork, dates, descriptions, and durations when available.
- Provides audio and video playback controls when feed items expose usable media URLs.

## Developer Setup

Prerequisites:

- Node.js and npm.
- macOS for the current packaging workflow.

Install dependencies:

```bash
npm ci
```

Run the app in local development mode:

```bash
npm run dev
```

`npm run dev` starts the Vite renderer and locally transpiles the Electron main/preload files needed for the development app. It is not a release build.

Run local verification checks:

```bash
npm run typecheck
```

Do not run production build or packaging commands until the local app is fully satisfactory.

## Project Notes

- The canonical project roadmap and working memory live in `scaffold.MD`.
- Private/member RSS URLs are local app data. They are not account credentials, not synced, and not stored in this repository.
- Build assets live under `build/`; see `build/README.md` for app icon notes.
- Generated folders such as `node_modules/`, `dist/`, and `release/` are intentionally ignored.
