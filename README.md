# DrTWiT

DrTWiT is a desktop app for browsing, downloading, and playing shows from the TWiT podcast network. It is built with Electron, React, Vite, TypeScript, and RSS feeds.

The goal is simple: open the app, pick a show, play audio or video, and keep episodes available offline when you want them.

## What Works Today

- Current public TWiT show list with show artwork.
- Audio and HD video RSS feed loading.
- Private/member RSS feed URLs stored locally on your device.
- Search across show names, episode titles, and episode page text.
- Audio/video playback controls.
- Download controls and a downloads view.
- Early subscription settings for automatic audio/video downloads.

This project is still in active development. Expect sharp edges. Build it locally, test it, improve it.

## For AI Coding Agents

If you are using Claude Code, OpenAI Codex, or another coding agent, give it this repository and say:

```text
Clone https://github.com/DrLehman/DrTWiT.git, install the required Node.js/npm tooling, run npm ci, run npm run typecheck, and build/package DrTWiT for my operating system using the README instructions. Do not change source code unless a setup failure requires a small documented fix.
```

For local development only, use:

```text
Clone https://github.com/DrLehman/DrTWiT.git, install Node.js 20 LTS or newer, run npm ci, run npm run typecheck, then run npm run dev for browser UI work. Do not run package commands unless I ask for an installer.
```

## Requirements

You need:

- Git
- Node.js 20 LTS or newer
- npm, included with Node.js
- A terminal

Recommended Node version:

```bash
node --version
npm --version
```

If `node` or `npm` is missing, install Node.js from [nodejs.org](https://nodejs.org/) or use the platform instructions below.

## Download the Source

```bash
git clone https://github.com/DrLehman/DrTWiT.git
cd DrTWiT
```

Install dependencies:

```bash
npm ci
```

Check TypeScript:

```bash
npm run typecheck
```

## Run for Development

Browser-only UI development:

```bash
npm run dev
```

Open:

```text
http://localhost:5173/
```

Desktop Electron development:

```bash
npm run dev:desktop
```

Use `npm run dev` for quick interface work. Use `npm run dev:desktop` when testing Electron-only features such as pop-out windows, managed downloads, or show-in-folder actions.

## Build the App

Build the renderer and Electron main/preload code:

```bash
npm run build
npm run build:electron
```

Package for the current platform:

```bash
npm run package
```

Packaged files are written to:

```text
release/
```

## Build on macOS

1. Install Xcode Command Line Tools:

```bash
xcode-select --install
```

2. Install Node.js 20 LTS or newer.

Using Homebrew:

```bash
brew install node
```

Or install from:

```text
https://nodejs.org/
```

3. Clone and install:

```bash
git clone https://github.com/DrLehman/DrTWiT.git
cd DrTWiT
npm ci
```

4. Verify:

```bash
npm run typecheck
```

5. Build the app:

```bash
npm run build
npm run build:electron
```

6. Create a macOS package:

```bash
npm run package:mac
```

For a DMG only:

```bash
npm run package:mac:dmg
```

For Apple Silicon:

```bash
npm run package:mac:arm64
```

For Intel Mac:

```bash
npm run package:mac:x64
```

Look in:

```text
release/
```

Important macOS note: local builds are usually unsigned unless you configure Apple Developer signing credentials. macOS may warn that the app is from an unidentified developer. That is expected for a local unsigned build.

## Build on Windows

1. Install Git for Windows:

```text
https://git-scm.com/download/win
```

2. Install Node.js 20 LTS or newer:

```text
https://nodejs.org/
```

3. Open PowerShell.

4. Clone and install:

```powershell
git clone https://github.com/DrLehman/DrTWiT.git
cd DrTWiT
npm ci
```

5. Verify:

```powershell
npm run typecheck
```

6. Build the app:

```powershell
npm run build
npm run build:electron
```

7. Create a Windows package:

```powershell
npm run package
```

Look in:

```text
release\
```

Important Windows note: local builds are usually unsigned unless you configure a code-signing certificate. Windows SmartScreen may warn about the app. That is expected for a local unsigned build.

## Build Script Reference

| Command | What it does |
| --- | --- |
| `npm ci` | Installs exact dependencies from `package-lock.json`. |
| `npm run dev` | Starts the Vite browser development server. |
| `npm run dev:desktop` | Starts Vite, watches Electron TypeScript, and launches Electron. |
| `npm run typecheck` | Runs TypeScript checks for renderer and Electron code. |
| `npm run build` | Builds the renderer. |
| `npm run build:electron` | Compiles Electron main/preload code. |
| `npm run package` | Packages for the current platform through Electron Builder. |
| `npm run package:mac` | Packages macOS targets. |
| `npm run package:mac:dmg` | Creates a macOS DMG. |
| `npm run package:mac:arm64` | Creates an Apple Silicon macOS package. |
| `npm run package:mac:x64` | Creates an Intel macOS package. |

## Troubleshooting

If install fails, delete dependencies and retry:

```bash
rm -rf node_modules
npm ci
```

On Windows PowerShell:

```powershell
Remove-Item -Recurse -Force node_modules
npm ci
```

If `npm run package` fails because an icon is missing, check:

```text
build/README.md
```

If Electron does not launch in development, make sure the Vite server is running and that port `5173` is available:

```bash
npm run dev
```

Then in another terminal:

```bash
npm run dev:main
npm run dev:electron
```

## Project Notes

- `scaffold.MD` is the canonical project roadmap and working memory.
- Private/member RSS URLs stay in local app storage.
- Generated folders such as `node_modules/`, `dist/`, and `release/` are ignored.
- Build assets live under `build/`.
- The app is MIT licensed.
