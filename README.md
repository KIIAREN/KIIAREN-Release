# KIIAREN - Real-Time Collaboration Platform

## Project Structure

```
KIIAREN/
├── apps/
│   └── web/                 # Next.js application
│       ├── src/             # Source code (app, components, features, hooks, lib)
│       ├── public/          # Static assets
│       ├── package.json     # Web app dependencies
│       ├── tsconfig.json    # TypeScript config
│       ├── next.config.mjs  # Next.js config
│       └── ...config files
├── packages/
│   └── shared/              # Shared types and schemas
│       ├── src/
│       │   ├── types/       # Convex type re-exports
│       │   └── schemas/     # Zod validation schemas
│       ├── package.json
│       └── tsconfig.json
├── convex/                  # Convex backend (at root - standard practice)
│   ├── schema.ts
│   ├── channels.ts
│   ├── messages.ts
│   ├── workspaces.ts
│   └── ...other functions
├── package.json             # Monorepo root with workspaces
├── tsconfig.json            # Root TypeScript config
└── .env.example             # Environment variables template
```

## Setup and Development

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0

### Installation

```bash
# Install all workspace dependencies
npm install

# Or from root
npm install
```

### Environment Setup

1. Copy `.env.example` to `.env` in the project root
2. Fill in your Convex deployment details
3. Set up OAuth credentials (Google, GitHub) if needed

**Note:** All apps use a single `.env` file at the monorepo root. See `ENV_MAPPING.md` for detailed variable documentation.

### Development

```bash
# Run Next.js dev server
npm run dev

# Or explicitly
npm run dev --workspace=@kiiaren/web

# Or from apps/web directory
cd apps/web && npm run dev
```

### Building

```bash
# Build all workspaces
npm run build

# Build web app only
npm run build --workspace=@kiiaren/web
```

### Linting and Formatting

```bash
# Lint all packages
npm run lint

# Fix lint issues
npm run lint:fix

# Format code
npm run format:fix
```

## Convex Setup

The Convex backend remains at the root level, which is the standard monorepo practice for Convex projects.

```bash
# Run Convex dev (from root)
npx convex dev

# Or
bunx convex dev
```

## Architecture

### No Mock Data ✅
All UI components use real Convex backend queries and mutations. No hardcoded or fake data exists in the codebase.

### RBAC Implementation ✅
Comprehensive role-based access control is already implemented:
- Workspace membership checks for all workspace operations
- Channel membership validation for message access  
- Admin-only operations for workspace/channel management
- Message author verification for edit/delete operations

### Features
- **Authentication**: Email/password, Google OAuth, GitHub OAuth
- **Workspaces**: Create, join, manage workspaces
- **Channels**: Create, update, delete channels  
- **Direct Messages**: 1-on-1 conversations
- **Messages**: Rich text editor, image uploads, threads, reactions
- **Real-time**: Live updates via Convex subscriptions

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Convex (serverless backend)
- **Auth**: Convex Auth with OAuth  
- **UI**: Tailwind CSS, Shadcn UI, Radix UI
- **State**: Jotai, Nuqs
- **Editor**: Quill

## Environment Variables

**Single `.env` file** at monorepo root controls all apps (web, convex, docs, whiteboard).

See `.env.example` for required environment variables:
- `CONVEX_DEPLOYMENT` - Your Convex deployment (from dashboard)
- `NEXT_PUBLIC_CONVEX_URL` - Public Convex URL
- `AUTH_GOOGLE_CLIENT_ID` / `AUTH_GOOGLE_CLIENT_SECRET` - Google OAuth (optional)
- `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` - GitHub OAuth (optional)
- `SITE_URL` - Application URL (for auth callbacks)

For detailed variable mapping and validation, see `ENV_MAPPING.md`.

## License

MIT

## Original Author

Sanidhya Kumar Verma - [GitHub](https://github.com/sanidhyy)

## Monorepo Refactor

This project was refactored into a monorepo structure to improve maintainability and code organization while maintaining 100% feature compatibility.
