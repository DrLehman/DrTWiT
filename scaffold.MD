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
- Evidence: README was expanded with macOS and Windows self-build instructions, exact package commands, troubleshooting notes, and copy-paste guidance for Claude Code/OpenAI Codex agents.

#### Shard S6.1: Rewrite README

- Scope: replace origin-story README with release-facing project overview, developer setup, and platform build instructions.
- Dependencies: `package.json`, current app features.
- Status: completed and updated.
- Contract: README is user-facing first and uses the existing script names.
- Failure conditions: stale origin story remains, unsupported claims of release stability, or missing setup commands.
- Tests: compare commands in README to `package.json`.

#### Shard S6.2: Add self-build instructions

- Scope: document exact local build/package steps for macOS and Windows, including tool installation, cloning from GitHub, dependency install, typecheck, package output location, and unsigned-app warnings.
- Dependencies: `package.json` scripts, current repository URL, Electron Builder configuration.
- Status: completed.
- Contract: a user or AI coding agent can follow README steps to install tools, clone `https://github.com/DrLehman/DrTWiT.git`, run checks, and create local packages for their platform.
- Failure conditions: README references missing scripts, omits `npm ci`, hides OS signing warnings, or suggests production release verification that has not happened.
- Tests: command-name check against `package.json`; `git diff --check -- README.md`.

### Shell S7: UI Layout and Branding

- Objective: align the redesigned interface with the user's current visual direction: show/feed branding uses real images, the hero keeps show artwork, and video renders as its own large player above the hero only in video mode.
- Dependencies: renderer component structure, shared feed/source types, built-in TWiT source catalog, loaded feed image metadata, browser QA.
- Interactions: `ShowHeader` owns the show artwork hero; `Sidebar` owns source branding; the top video player belongs above the hero; playback state from Shell S4 must remain independent enough to avoid accidental playback starts.
- Status: active.
- Contracts:
  - In audio mode, the hero media slot shows the current show/feed logo or artwork.
  - In video mode, the video player appears above the hero/header section.
  - The hero artwork remains visible in both audio and video modes.
  - The top video block is hidden when Audio mode is selected.
  - The separate large video block below header/actions is removed.
  - Built-in sidebar source rows show real show logo/branding images instead of initials.
  - Local/private feed rows show feed-provided branding after that feed has loaded, with RSS fallback only while no image is known.
  - Episode media indicators are clear audio/video availability markers, not ambiguous square or half-circle glyphs.
- Tests:
  - Browser QA at `http://localhost:5173/` confirms audio mode has hero art and no top or below-header video block.
  - Browser QA confirms video mode has the video player above the hero, hero artwork still present, and no duplicate video region below the controls.
  - Browser QA confirms sidebar built-in shows and loaded local feeds render logo images.
  - Narrow viewport QA around `1049x862` confirms header actions, media slot, mode toggle, and list columns do not overlap.

#### Shard S7.1: Move video above the hero

- Scope: move video rendering above the hero/header section and remove the below-header `video-stage` placement.
- Dependencies: current playback state separation between browsing mode and player mode.
- Status: completed.
- Contract: Video mode displays one top video player above the hero; Audio mode hides the top video player; the hero always retains show artwork.
- Failure conditions: video replaces hero artwork, video appears below header/actions, video remains visible in Audio mode, or audio mode loses show artwork.
- Tests: audio-to-video and video-to-audio browser playback persistence smoke tests.
- Evidence: Browser QA on 2026-05-22 confirmed Video mode `topVideoCount=1` with hero image present and Audio mode `topVideoCount=0` with hero image present; no console errors.

#### Shard S7.2: Add real feed branding images

- Scope: extend source/feed display data so built-in shows and local feeds can render logo images in the sidebar and hero.
- Dependencies: shared source catalog, feed image metadata, custom feed local state.
- Status: completed for built-in sources; active for custom feed image adoption.
- Contract: built-in source rows have static logo art; custom feed rows adopt `FeedResult.image` after the feed loads.
- Failure conditions: initials remain for built-in shows, loaded custom feeds keep RSS tiles despite having images, or private feed URLs are exposed while deriving labels/art.
- Tests: source list visual QA before and after loading built-in and custom feeds.
- Evidence: Browser QA on 2026-05-22 confirmed current built-in source rows render 13 show images and no stale `FLOSS Weekly` entry.

#### Shard S7.3: Verify current TWiT show catalog

- Scope: keep built-in sources aligned with TWiT's current public show list and available public RSS feeds.
- Dependencies: `https://twit.tv/shows`, `https://feeds.twit.tv/*.xml`, shared catalog.
- Status: completed for current RSS-backed public list.
- Contract: built-in list includes current public RSS-backed shows, renames `This Week in Google` to `Intelligent Machines`, removes inactive/archive-only `FLOSS Weekly`, and does not add shows with unknown/broken public RSS feeds.
- Failure conditions: stale show names remain, retired shows appear as active built-ins, or a listed source has no working audio/video feed.
- Tests: verify show names against `https://twit.tv/shows`; verify RSS and HD video feed URLs for added sources; browser reload source-list QA.
- Evidence: 2026-05-22 verification added `iOS Today`, `This Week in Space`, `Home Theater Geeks`, `Hands-On Apple`, `Hands-On Windows`, and `Untitled Linux Show`; `AI Inside` was not added because no public RSS feed was found.

### Shell S8: Search

- Objective: replace the current local title/description filter with useful search ordered by show/source name, episode title, then episode-page transcript/content.
- Dependencies: feed catalog, loaded feed results, trusted main-process network boundary for episode-page fetches, renderer search UI.
- Interactions: search should cooperate with feed loading, source selection, episode list rendering, and privacy rules for custom/private feeds.
- Status: active.
- Contracts:
  - Search priority is show/source name first, episode title second, episode-page transcript/content third.
  - Episode-page transcript/content fetching happens behind the trusted Electron/main-process boundary, not by exposing private URLs or parser details directly in renderer code.
  - Results make the match type clear enough for the user to understand why an item appeared.
  - Search errors do not crash the app and do not reveal tokenized private/member feed URLs.
- Tests:
  - Search by show name selects or surfaces the matching show before episode-title matches.
  - Search by episode title surfaces matching episodes from the current or discovered feed set.
  - Search by term found only on an episode page/transcript surfaces the relevant episode after page content is fetched.
  - Invalid or unavailable transcript pages show a non-fatal search miss/error state.

#### Shard S8.1: Search current catalog and feed metadata

- Scope: implement show/source-name and episode-title search before transcript expansion.
- Dependencies: `FeedSource[]`, loaded `FeedResult`, renderer search state.
- Status: pending.
- Contract: search no longer appears broken when a query does not match the currently selected episode descriptions only.
- Failure conditions: search silently filters everything while a show-name match exists, or search only checks episode descriptions.
- Tests: queries for known show names, known episode titles, and no-match terms.

#### Shard S8.2: Fetch and search episode-page transcript/content

- Scope: fetch linked episode pages or transcript-like page content via the main process and index enough text to satisfy transcript/content search.
- Dependencies: episode `link`, Electron IPC, sanitized network errors, cache policy.
- Status: pending.
- Contract: transcript/page search extends results without logging full private URLs or blocking normal feed browsing.
- Failure conditions: renderer fetches arbitrary episode pages directly, tokenized URLs appear in errors, or transcript fetch failures break feed search.
- Tests: transcript-only query, failed page fetch, custom/private feed with redacted errors.

### Shell S9: Mini Player Pop-Out

- Objective: replace the current CSS-only mini state with a true Electron child-window pop-out for the active player.
- Dependencies: Electron `BrowserWindow`, preload IPC, shared playback state model, renderer player controls.
- Interactions: browser-only dev can expose the control, but final pop-out acceptance requires Electron runtime QA because the target behavior is desktop-window specific.
- Status: active.
- Contracts:
  - Mini opens an Electron child window instead of merely shrinking the footer with CSS.
  - The pop-out shares the current playback session and can dock back without restarting playback.
  - Pop-out controls can play/pause/seek/skip and reflect the same active episode/media mode as the main window.
  - Closing the pop-out returns control cleanly to the main window without losing playback state.
- Tests:
  - Browser QA confirms controls and fallback visual state remain present without Electron.
  - Electron QA confirms child window creation, dock-back behavior, shared controls, and no playback restart.
  - Electron QA confirms window close, main-window close, and app quit paths clean up safely.
- Evidence: Electron child-window IPC and renderer control path were implemented and typechecked; runtime acceptance remains pending because Electron was not launched during browser-focused UI work.

#### Shard S9.1: Define shared player state boundary

- Scope: determine how the main window and pop-out window share active episode, mode, time, duration, volume, and play/pause state.
- Dependencies: existing renderer player state and Electron IPC.
- Status: pending.
- Contract: one authoritative playback session exists; pop-out is not an independent duplicate player that drifts out of sync.
- Failure conditions: two media elements play simultaneously unintentionally, dock-back restarts media, or the pop-out loses selected episode context.
- Tests: pop out during audio playback, pop out during video playback, dock back, close pop-out.

### Shell S10: Offline Downloads and Subscriptions

- Objective: make Downloads a real offline library with per-episode downloads, feed subscriptions, retention controls, and OS file access/sharing.
- Dependencies: Electron main process filesystem access, app data path, IPC contracts, download queue, feed refresh, playback state, settings UI.
- Interactions: episode rows expose download actions; show/feed pages expose subscription settings; Settings owns global storage and retention; Downloads view lists local files and job state.
- Status: planned.
- Contracts:
  - Downloads view shows queued, downloading, available, failed, and listened states.
  - Each episode row exposes download actions for available audio/video media.
  - Show/feed subscription settings support audio, video, or both.
  - Download storage defaults to a managed Electron app-data `Downloads` folder and is editable in Settings.
  - Retention enforces both maximum episode count and maximum disk space by deleting oldest eligible downloads until both limits are satisfied.
  - Delete-after-listen runs after playback completion/listened state, and manual "mark listened" is also available.
  - Every downloaded episode supports offline play, show in folder, share/open file through OS capabilities, delete local file, and retry failed download.
- Tests:
  - Electron QA confirms manual audio download, manual video download, failed download retry, offline playback, delete local file, show in folder, and share/open file.
  - Electron QA confirms subscription refresh downloads new episodes according to audio/video/both settings.
  - Electron QA confirms retention cleanup for count cap, disk cap, and both caps together.
  - Electron QA confirms delete-after-listen and manual mark-listened cleanup.
- Evidence: Browser QA confirmed download buttons, subscription controls, Downloads view, and preview download item creation; real filesystem actions remain pending Electron QA.

#### Shard S10.1: Download storage and IPC contract

- Scope: define and implement managed download paths, download metadata, progress reporting, file deletion, show-in-folder, and share/open actions.
- Dependencies: Electron `app.getPath`, `shell.showItemInFolder`, safe filesystem paths, renderer IPC API.
- Status: pending.
- Contract: renderer never writes arbitrary files directly; main process validates paths and owns filesystem side effects.
- Failure conditions: path traversal, unmanaged files outside the selected download root, missing progress/error reporting, or inability to locate a downloaded file on disk.
- Tests: path validation, download success, show-in-folder, share/open, delete, retry.

#### Shard S10.2: Subscription rules and retention

- Scope: add per-feed subscription settings, automatic new-episode checks, media-type selection, and retention cleanup.
- Dependencies: feed refresh logic, download queue, settings persistence, playback listened state.
- Status: pending.
- Contract: subscriptions download only selected media types and cleanup respects both count and disk-space limits.
- Failure conditions: duplicate downloads, cleanup deletes active playback unexpectedly, count and disk caps conflict without deterministic resolution, or private feed URLs leak in logs/errors.
- Tests: subscribe audio-only, video-only, both; simulate new episode; enforce caps; protect currently playing file.

## Ambiguities and Open Questions

- Local npm availability is unresolved in the current Codex shell. The project cannot be fully verified until `npm ci` can run.
- The current release icon state is unknown until packaging is attempted or `build/icon.icns` is added.
- Membership feed support for v1 means user-entered tokenized RSS URLs only. Username/password authentication and Keychain storage are out of scope until explicitly prioritized.
- Live TWiT RSS item media shapes should be verified before changing playback logic.
- Browser QA uses a deterministic preview API when loading the Vite app outside Electron; Electron IPC remains the real RSS path for the desktop app.
- True mini-player pop-out and download filesystem behavior cannot be fully accepted in browser-only QA; they require Electron QA without running production build/package commands.
- Episode-page transcript/content search needs a conservative page-fetch/cache strategy so it is useful without making search feel slow or leaking private feed details.
- `AI Inside` appears on TWiT's public shows page, but no public RSS URL was found during 2026-05-22 verification. It should stay out of the built-in RSS-backed sidebar until a working feed URL is identified.
- Browser plugin text entry hit a virtual clipboard failure during search QA; search compiled and app loaded cleanly, but typed search interaction still needs manual or alternate automation verification.

## Decisions and Rationales

- 2026-05-21: Delete `CLAUDE.md` instead of replacing it with a stub because the user explicitly requested removal and `scaffold.MD` is now the canonical working source of truth.
- 2026-05-21: Keep `build/` trackable because `build/README.md` is tracked and `build/icon.icns` may become a legitimate release asset.
- 2026-05-21: Make README user-facing first because the user selected a public release/project-page style.
- 2026-05-21: Defer source code and dependency changes because this prep pass is limited to repository hygiene, scaffold setup, and documentation.
- 2026-05-21: Keep the redesign on Electron/React/Vite after repo inspection found no SwiftPM package or native macOS app structure.
- 2026-05-21: Use repo-local DrLehman git identity and DrLehman origin only for this project; do not change global NewCoffee identity.
- 2026-05-21: Store private/member feed URLs in localStorage for v1 because the user chose local app storage and no username/password auth.
- 2026-05-21: Local testing phase excludes production build and package commands; development transpilation for Electron main/preload is allowed only to run the local app.
- 2026-05-22: Video belongs in the hero media slot in video mode; the separate below-header video block should be removed.
- 2026-05-22: User corrected the video placement: the show logo/artwork must remain in the hero, while the video player belongs above the hero and must hide when Audio mode is selected.
- 2026-05-22: Sidebar source tiles should use real show/feed branding images instead of initials or permanent RSS placeholders.
- 2026-05-22: Built-in shows should track the current public TWiT show list where working public RSS feeds exist; stale/archive shows should not appear as active built-ins.
- 2026-05-22: Search priority is show/source name, then episode title, then episode-page transcript/content.
- 2026-05-22: Mini player means a true Electron child-window pop-out, not a CSS-only compact footer.
- 2026-05-22: Download storage defaults to managed Electron app data under a `Downloads` folder, with a user-editable location in Settings.
- 2026-05-22: Download retention enforces both configured episode-count and disk-space caps; delete-after-listen is based on playback completion/listened state and also supports manual mark-listened cleanup.
- 2026-05-22: README should include explicit macOS and Windows self-build instructions plus agent-friendly prompts for Claude Code/OpenAI Codex.

## Lessons Learned and Process Improvements

- Repo prep should happen before functional repair so future code diffs are not mixed with stale guidance removal and ignore-rule cleanup.
- Public README content and internal agent/project governance should stay separate: README for users and developers, `scaffold.MD` for roadmap, contracts, decisions, and evidence.
- Dependency verification must start with local runtime availability before interpreting build or typecheck failures.
- Private RSS feed URLs should be treated as sensitive even when the app needs to store the complete URL locally for member-feed access.
- Browser QA is appropriate for layout, search UI, and non-filesystem controls, but Electron QA is required for child windows and managed local file operations.
- Downloads and transcript search should stay behind trusted main-process boundaries because they involve network and filesystem side effects.
- Current-show catalog updates should verify both the TWiT shows page and the actual RSS feed URLs; page presence alone is not enough if no feed is exposed.
- User language around placement is literal: "above the hero" means a separate region above the hero, not replacing the hero image.

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
- 2026-05-22: Shell inspection of renderer header, sidebar, player, search, main IPC, preload bridge, and package scripts grounded the plans for hero video placement, branding images, search, Electron pop-out, and downloads.
- 2026-05-22: Web and RSS verification used `https://twit.tv/shows` plus `feeds.twit.tv` RSS/HD video endpoints to update current built-in show names and remove stale entries.
- 2026-05-22: Browser plugin QA verified current show logos, video above hero, Audio mode hiding the video block, and no console errors.
- 2026-05-22: Shell checks verified `npm run typecheck`, `git diff --check`, README command-name consistency, and scaffold diff hygiene after recent updates.

## Execution Log

- 2026-05-21: Cloned `https://github.com/NewCoffee7477/DrTWiT.git` into `/Users/dewaynelehman/Documents/Manual Library/1-Projects/DrTWiT`.
- 2026-05-21: Prepared and approved a repository prep plan covering `.gitignore`, `scaffold.MD`, `README.md`, and `CLAUDE.md` removal.
- 2026-05-21: Implemented repository prep: strengthened `.gitignore`, created canonical `scaffold.MD`, rewrote `README.md`, and deleted `CLAUDE.md`.
- 2026-05-21: Set repo-local git identity to `DrLehman <264849478+DrLehman@users.noreply.github.com>` and changed origin to `https://github.com/DrLehman/DrTWiT.git`.
- 2026-05-21: Began full redesign implementation around Electron IPC feed loading, local custom feed storage, modular React renderer components, and the accepted broadcast-library visual concept.
- 2026-05-21: Completed local npm implementation pass without running `npm run build`, `npm run package`, `npm run package:mac`, or any production packaging command.
- 2026-05-22: Updated scaffold roadmap with planned Shells for UI layout/branding, ordered search with episode-page transcript/content fetching, Electron mini-player pop-out, and offline downloads/subscriptions.
- 2026-05-22: Implemented visible redesign updates for current show branding, ordered search plumbing, download/subscription UI, Electron pop-out IPC, README self-build guide, and corrected video placement above the hero.
