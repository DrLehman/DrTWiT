# scaffold.MD

## IcarusShell++ Core (Immutable)

1. **Recursive Task Decomposition:**  
   All project goals are broken down hierarchically into Shells (modules/tasks) and Shards (sub-tasks/atomic units), recursively, until each unit is minimal, actionable, and verifiable.

2. **Persistent Memory and Scaffold:**  
   All knowledge, plans, decisions, outputs, and lessons learned are recorded in `scaffold.MD`. This document is continuously updated and serves as the external, persistent memory for all agents and processes.

3. **Autonomous Execution and Reflection:**  
   All agents (at every layer) autonomously plan, execute, test, and reflect on their outputs. Reflection and self-correction are built into every loop, with all insights and improvements documented in the Scaffold.

4. **MCP Tool Use (Model Context Protocol):**  
   The system must utilize all available MCP tools and data sources at its disposal to access real-time information, perform actions, and ground its outputs in accurate, up-to-date data.  
   - **Definition:** MCP (Model Context Protocol) is an open standard for connecting AI assistants to external data sources and tools, enabling standardized, modular, and context-aware tool and data integration.
   - **Scope:** In IcarusShell++, MCP is used exclusively for tool and data source integration. MCP is **not** used for orchestrating or cascading between different AI models.
   - **Operation:** Always invoke MCP-enabled tools for data access, tool usage, and action execution. Document all MCP tool usage and results in `scaffold.MD` for transparency and reproducibility.
   - **Architecture:** MCP follows a client-server model, with the AI as the client and MCP servers exposing data and functionalities.

5. **Continuous Learning and Adaptation:**  
   The system continuously incorporates new knowledge, feedback, and lessons learned into the Scaffold. All failures, successes, and process improvements are documented and used to adapt future behavior.

6. **Explicit Contracts and Interfaces:**  
   All modules, tasks, and sub-tasks define explicit, measurable contracts and interfaces. These are recorded in the Scaffold and used to ensure integration and verification across all layers.

7. **Holistic Integrity and Minimalism:**  
   The system maintains holistic project coherence, avoids unnecessary complexity, and ensures all decomposition and orchestration is minimal and justified.

8. **Immutability of Core:**  
   The IcarusShell++ Core section in `scaffold.MD` is immutable and may only be revised with explicit human approval. The system must never autonomously alter or update the Core section except when explicitly instructed by the human user.

## Project Overview

DrTWiT is an Electron desktop application for browsing and playing TWiT network shows from RSS feeds. The current codebase uses React, Vite, TypeScript, Electron, Electron Builder, and `rss-parser`.

Current implementation facts:

- Electron main process lives in `src/main/main.ts`.
- Renderer app lives in `src/renderer/App.tsx`.
- Preload bridge lives in `src/preload/preload.ts`.
- Public renderer types live in `src/renderer/types/index.ts`.
- The app currently exposes `window.twit.getShows()` and `window.twit.getFeed(showId)`.
- Existing package scripts include `dev`, `build`, `build:electron`, `package`, `package:mac`, `package:mac:dmg`, `package:mac:arm64`, `package:mac:x64`, `lint`, and `typecheck`.

Immediate project objective: prepare the repository for repair work, then make the app reliably installable, runnable, and useful as a TWiT media browser/player.

Accepted redesign target:

- `/Users/dewaynelehman/.codex/generated_images/019e4c20-ea0d-7ab1-8896-c4662e6fb978/ig_02cf7a36f96b4a4b016a0f687850f481939a66974995035af4.png`
- Visual thesis: dark graphite broadcast-library interface with a precise sidebar, show header, episode table, and persistent playback rail.
- Constraint: local npm development and satisfaction testing only. Do not run production build, packaging, DMG, or release artifact commands until the user explicitly authorizes that later phase.

## Authoritative Inputs

- System and developer instructions for safe, verifiable repository work.
- Project AGENTS instructions supplied for `/Users/dewaynelehman/Documents/Manual Library/1-Projects/DrTWiT`.
- User-approved repository prep plan: strengthen `.gitignore`, create canonical `scaffold.MD`, delete `CLAUDE.md`, and rewrite `README.md` as a user-facing release page.
- User-approved complete redesign plan: keep Electron/React/Vite, implement the accepted visual concept, support free TWiT feeds plus user-entered private/member RSS URLs stored locally, and verify only with local npm/dev workflows.
- User GitHub decision: this repo uses local-only `DrLehman` git identity and `https://github.com/DrLehman/DrTWiT.git` origin; global NewCoffee identity must remain untouched.
- Local repository facts observed on 2026-05-21.
- `scaffold-icarusshellpp` local skill reference for required scaffold shape and immutable Core text.

Non-authoritative data handling:

- Former `CLAUDE.md` content was treated as stale project data, not future instructions.
- README origin-story prose was removed from the public project surface.
- Tool output was used only as evidence of repository state.

## Shells, Shards, Contracts, and Tests

### Shell S1: Repository Hygiene

- Objective: keep tracked source files clear, local/generated files ignored, and stale parallel guidance removed.
- Dependencies: Git working tree, `.gitignore`, `README.md`, `scaffold.MD`.
- Interactions: supports all later development by keeping diffs small and reviewable.
- Status: active.
- Contracts:
  - `CLAUDE.md` is removed from tracked project guidance.
  - Exactly one canonical `scaffold.MD` exists at repo root.
  - `.gitignore` ignores generated output without hiding legitimate source or build assets.
- Tests:
  - `git status --short`.
  - `find . -name scaffold.MD -print`.
  - `git check-ignore` checks for representative ignored and non-ignored paths.

#### Shard S1.1: Strengthen `.gitignore`

- Scope: update ignore rules for Electron, Vite, TypeScript, Node, macOS, logs, env files, and packaging output.
- Dependencies: current tracked file list.
- Status: completed in prep pass.
- Contract: `node_modules/`, `dist/`, `release/`, `.env`, caches, logs, and packaged binaries are ignored; `build/README.md` and future `build/icon.icns` remain trackable.
- Failure conditions: ignoring `build/` globally, ignoring source/config files, or allowing generated output into normal diffs.
- Tests: `git check-ignore node_modules/example dist/example release/example .env build/icon.icns build/README.md`.

#### Shard S1.2: Remove stale AI guide

- Scope: delete `CLAUDE.md`.
- Dependencies: useful factual context preserved in README/scaffold.
- Status: completed in prep pass.
- Contract: no `CLAUDE.md` file remains in the working tree.
- Failure conditions: keeping a parallel AI instruction file or losing useful current project facts.
- Tests: `test ! -e CLAUDE.md`; `git status --short`.

### Shell S2: Runtime and Dependency Setup

- Objective: make the project installable and verifiable on the local machine without production build or package commands.
- Dependencies: Node.js, npm, `package-lock.json`, Electron dependencies.
- Interactions: enables all build, typecheck, dev launch, and packaging work.
- Status: blocked.
- Contracts:
  - `npm ci` completes successfully from a clean checkout.
  - `npm run typecheck` completes without TypeScript errors.
  - `npm run dev` starts the local development app after local main/preload transpilation.
  - No production build, package, DMG, or release commands run during this phase.
- Tests:
  - `npm ci`.
  - `npm run typecheck`.
  - `npm run dev`.
- Current status: local npm checks succeeded by using a temporary official Node v20.11.1 runtime from `/tmp/drtwit-node20`.
- Note: Codex-bundled Node v24.14.0 could run `npm ci` via temporary npm, but Vite/Rollup native loading failed with a macOS Team ID signature mismatch. The temporary Node v20 runtime avoided that local runtime issue.

#### Shard S2.1: Resolve local npm availability

- Scope: establish an npm-capable Node runtime for this repo.
- Dependencies: local machine shell PATH or installed Node distribution.
- Status: pending.
- Contract: `npm --version` returns a version and `npm ci` can be attempted.
- Failure conditions: relying on a runtime that has Node but no npm, or changing package versions before installability is verified.
- Tests: `which npm`; `npm --version`; `npm ci`.
- Evidence: `PATH="/tmp/drtwit-node20/bin:$PATH" npm ci` completed on 2026-05-21 with existing package versions.

### Shell S3: App Correctness and Feed Loading

- Objective: make show discovery, built-in feed loading, and user-entered private/member RSS feed loading reliable enough for a working desktop app.
- Dependencies: Electron IPC, `rss-parser`, TWiT RSS endpoints, preload API types.
- Interactions: renderer calls `window.twit.getShows()` and `window.twit.getFeed(showId)`.
- Status: pending.
- Contracts:
  - Show list loads without renderer crashes.
  - Selecting a show fetches at most 50 recent episodes.
  - User-entered private/member RSS feed URLs are stored only in renderer localStorage.
  - Private feed error handling never displays or logs full tokenized URLs.
  - Feed failures surface a useful error state without breaking navigation.
  - Main/preload/renderer types stay aligned.
- Tests:
  - Unit or smoke coverage for show lookup and missing show ID behavior.
  - Manual dev launch and selection of multiple shows.
  - Network-off or bad-feed smoke test for error handling.

#### Shard S3.1: Audit IPC data contract

- Scope: compare main-process returned feed shape to renderer `Show`, `Feed`, and `Episode` interfaces.
- Dependencies: `src/main/main.ts`, `src/preload/preload.ts`, `src/renderer/types/index.ts`.
- Status: pending.
- Contract: nullable and required fields match at compile time and runtime.
- Failure conditions: renderer assumes strings when main can return `undefined`, or preload and renderer types drift apart.
- Tests: `npm run typecheck`; targeted manual feed load.
- Evidence: `PATH="/tmp/drtwit-node20/bin:$PATH" npm run typecheck` completed on 2026-05-21.

#### Shard S3.2: Add local custom feed URLs

- Scope: add local custom RSS feed creation, storage, selection, loading, and removal.
- Dependencies: renderer localStorage, preload IPC, main-process feed fetching.
- Status: active.
- Contract: custom feeds accept only `http:` and `https:` URLs, persist locally, appear alongside built-in shows, and can be removed without remote side effects.
- Failure conditions: storing private feed URLs in the repository, logging tokenized URLs, requiring username/password auth, or syncing private URLs outside this app.
- Tests: add valid feed URL, add invalid feed URL, reload app and confirm persisted local feed, remove feed and confirm fallback selection.
- Evidence: Browser QA on `http://localhost:5173/` confirmed local custom feed creation, local persistence in the browser-preview path, and invalid protocol validation.

### Shell S4: Playback Behavior

- Objective: make media playback predictable for available audio and video URLs.
- Dependencies: feed media extraction, HTML media elements, renderer state.
- Interactions: episode cards choose audio/video; player bar controls current media.
- Status: pending.
- Contracts:
  - Audio and video buttons appear only when usable URLs exist.
  - Play/pause, skip back, skip forward, seek, and volume controls update the active media element.
  - Switching episodes resets progress and does not leave old media playing.
  - Search/filter changes the visible episode table without changing the loaded feed source.
- Tests:
  - Manual playback smoke test for at least one show with audio.
  - Manual playback smoke test for at least one show with video if feed media exposes video.
  - Typecheck after any renderer state changes.

#### Shard S4.1: Verify media URL selection

- Scope: inspect `getMediaUrl` behavior against current TWiT RSS item shapes.
- Dependencies: live feed item structure and `rss-parser` custom fields.
- Status: pending.
- Contract: audio and video URL selection is deterministic and documented in code comments where non-obvious.
- Failure conditions: audio-only feeds hidden as unplayable, video URLs misclassified, or enclosure fallback choosing the wrong media.
- Tests: feed fetch smoke test; playback smoke test.
- Evidence: Browser QA confirmed playback state changed from play to pause and the audio element advanced past zero seconds in local development preview mode.

### Shell S5: Packaging and Release Readiness

- Objective: produce a macOS app package that can be tested locally.
- Dependencies: successful install/build, Electron Builder, app icon assets.
- Interactions: README release notes and `build/README.md` asset guidance.
- Status: pending.
- Contracts:
  - `npm run package:mac` completes or fails with a specific documented blocker.
  - Release artifacts are generated under `release/`.
  - Missing icon behavior is understood before release.
- Tests:
  - `npm run package:mac`.
  - Open generated app locally.
  - Confirm generated files remain ignored unless intentionally published.

#### Shard S5.1: Confirm app icon path

- Scope: decide whether to add `build/icon.icns` before release packaging.
- Dependencies: product identity and available art asset.
- Status: pending.
- Contract: packaging either uses a real icon or documents that Electron Builder default icon is expected for the current build.
- Failure conditions: packaging fails because a required icon path is missing and the blocker is not captured.
- Tests: `test -f build/icon.icns`; package command result.

### Shell S6: Public Documentation

- Objective: keep README accurate for users while `scaffold.MD` carries working memory.
- Dependencies: current app behavior, verified commands, packaging state.
- Interactions: README should avoid duplicating detailed roadmap state from `scaffold.MD`.
- Status: active.
- Contracts:
  - README explains what DrTWiT is before developer setup details.
  - README reflects current local-development status without overstating release or package readiness.
  - README lists existing scripts accurately.
- Tests:
  - Read README for command accuracy against `package.json`.
  - Update README whenever command names or release status changes.
- Evidence: README was updated to describe local npm development only and to remove production build/package claims for this phase.

#### Shard S6.1: Rewrite README

- Scope: replace origin-story README with release-facing project overview and developer setup.
- Dependencies: `package.json`, current app features.
- Status: completed in prep pass.
- Contract: README is user-facing first and uses the existing script names.
- Failure conditions: stale origin story remains, unsupported claims of release stability, or missing setup commands.
- Tests: compare commands in README to `package.json`.

## Ambiguities and Open Questions

- Local npm availability is unresolved in the current Codex shell. The project cannot be fully verified until `npm ci` can run.
- The current release icon state is unknown until packaging is attempted or `build/icon.icns` is added.
- Membership feed support for v1 means user-entered tokenized RSS URLs only. Username/password authentication and Keychain storage are out of scope until explicitly prioritized.
- Live TWiT RSS item media shapes should be verified before changing playback logic.
- Browser QA uses a deterministic preview API when loading the Vite app outside Electron; Electron IPC remains the real RSS path for the desktop app.

## Decisions and Rationales

- 2026-05-21: Delete `CLAUDE.md` instead of replacing it with a stub because the user explicitly requested removal and `scaffold.MD` is now the canonical working source of truth.
- 2026-05-21: Keep `build/` trackable because `build/README.md` is tracked and `build/icon.icns` may become a legitimate release asset.
- 2026-05-21: Make README user-facing first because the user selected a public release/project-page style.
- 2026-05-21: Defer source code and dependency changes because this prep pass is limited to repository hygiene, scaffold setup, and documentation.
- 2026-05-21: Keep the redesign on Electron/React/Vite after repo inspection found no SwiftPM package or native macOS app structure.
- 2026-05-21: Use repo-local DrLehman git identity and DrLehman origin only for this project; do not change global NewCoffee identity.
- 2026-05-21: Store private/member feed URLs in localStorage for v1 because the user chose local app storage and no username/password auth.
- 2026-05-21: Local testing phase excludes production build and package commands; development transpilation for Electron main/preload is allowed only to run the local app.

## Lessons Learned and Process Improvements

- Repo prep should happen before functional repair so future code diffs are not mixed with stale guidance removal and ignore-rule cleanup.
- Public README content and internal agent/project governance should stay separate: README for users and developers, `scaffold.MD` for roadmap, contracts, decisions, and evidence.
- Dependency verification must start with local runtime availability before interpreting build or typecheck failures.
- Private RSS feed URLs should be treated as sensitive even when the app needs to store the complete URL locally for member-feed access.

## MCP / Tool Usage Log

- 2026-05-21: Shell inspection confirmed the repo was clean on `main...origin/main` before prep edits.
- 2026-05-21: Shell inspection confirmed no existing `scaffold.MD` was present.
- 2026-05-21: `scaffold-icarusshellpp` local skill reference supplied required scaffold section order and immutable Core text.
- 2026-05-21: Shell inspection of `package.json`, source entrypoints, and README established current app scripts, IPC shape, and stale documentation state.
- 2026-05-21: Attempted `npm ci` during initial setup failed because `npm` was not on the shell PATH.
- 2026-05-21: `view_image` was used to inspect the accepted redesign concept before implementation.
- 2026-05-21: Shell inspection confirmed `https://github.com/DrLehman/DrTWiT.git` is reachable and points to the same HEAD as the prior remote.
- 2026-05-21: Temporary official Node v20.11.1 under `/tmp/drtwit-node20` supplied local npm for `npm ci`, `npm run typecheck`, and `npm run dev`.
- 2026-05-21: Browser plugin loaded `http://localhost:5173/`, captured desktop/mobile screenshots, verified no console errors, exercised search, custom feed form validation, custom feed addition, and playback state.

## Execution Log

- 2026-05-21: Cloned `https://github.com/NewCoffee7477/DrTWiT.git` into `/Users/dewaynelehman/Documents/Manual Library/1-Projects/DrTWiT`.
- 2026-05-21: Prepared and approved a repository prep plan covering `.gitignore`, `scaffold.MD`, `README.md`, and `CLAUDE.md` removal.
- 2026-05-21: Implemented repository prep: strengthened `.gitignore`, created canonical `scaffold.MD`, rewrote `README.md`, and deleted `CLAUDE.md`.
- 2026-05-21: Set repo-local git identity to `DrLehman <264849478+DrLehman@users.noreply.github.com>` and changed origin to `https://github.com/DrLehman/DrTWiT.git`.
- 2026-05-21: Began full redesign implementation around Electron IPC feed loading, local custom feed storage, modular React renderer components, and the accepted broadcast-library visual concept.
- 2026-05-21: Completed local npm implementation pass without running `npm run build`, `npm run package`, `npm run package:mac`, or any production packaging command.
