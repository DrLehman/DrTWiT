# CLAUDE.md - AI Assistant Guide for DrTWiT

## Project Overview

**DrTWiT** is an Electron desktop application for accessing TWiT (This Week in Tech), a video/audio podcast network. The app supports both free and membership-based feeds.

**Current State**: Early development - repository contains only README and LICENSE files. The codebase needs to be scaffolded and built out.

## Intended Tech Stack

- **Framework**: Electron (desktop app)
- **Frontend**: React (minimal)
- **Content**: TWiT video/audio feeds (free + membership)

## Repository Structure

```
DrTWiT/
├── CLAUDE.md          # This file - AI assistant guide
├── LICENSE            # MIT License
└── README.md          # Project overview and development notes
```

### Planned Structure (When Built Out)

```
DrTWiT/
├── src/
│   ├── main/          # Electron main process
│   │   └── main.ts    # Main entry point
│   ├── renderer/      # React renderer process
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.tsx
│   └── preload/       # Preload scripts for IPC
├── public/            # Static assets
├── dist/              # Build output
├── package.json
├── tsconfig.json
├── electron-builder.json
└── vite.config.ts     # or webpack.config.js
```

## Development Workflow

### Prerequisites (When Implemented)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Package the Electron app
npm run package
```

### Key Commands (Planned)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Electron in dev mode with hot reload |
| `npm run build` | Build the React app |
| `npm run package` | Package as distributable Electron app |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests |

## Code Conventions

### General Guidelines

1. **Keep it minimal** - This is a "vibe coded" project; simplicity is preferred
2. **React components** - Use functional components with hooks
3. **TypeScript** - Prefer TypeScript for type safety when scaffolding
4. **File naming** - Use PascalCase for components, camelCase for utilities

### Electron Best Practices

1. **Process separation** - Keep main and renderer process code separate
2. **IPC communication** - Use contextBridge for secure IPC between processes
3. **Security** - Enable contextIsolation, disable nodeIntegration in renderer

### Feed Handling

- Support both free and membership-based TWiT feeds
- Handle authentication for membership feeds
- Cache feed data appropriately for offline access

## AI Assistant Instructions

### When Working on This Project

1. **Check current state first** - The project may still be minimal
2. **Scaffold incrementally** - When building out, add one feature at a time
3. **Keep README updated** - Document any major changes or new setup steps
4. **Test before committing** - Ensure builds succeed

### Development Priorities

1. Set up Electron + React boilerplate
2. Implement TWiT feed fetching and parsing
3. Create basic UI for browsing shows/episodes
4. Add media playback functionality
5. Implement membership feed authentication (optional)

### Code Style

- Use modern ES6+ syntax
- Prefer async/await over raw Promises
- Keep components small and focused
- Document complex logic with comments

## Project Philosophy

From the README:
> "I vibe coded this, so I won't be issuing bug fixes unless it bugs me. Feel free to fork and go nuts!"

This project embraces experimental, informal development. Contributions should maintain this spirit while keeping the code functional.

## License

MIT License - See LICENSE file for details.

---

*Last updated: January 2026*
