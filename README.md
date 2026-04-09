# React Router v7 Boilerplate

A minimal, production-ready starter template for building full-stack React applications with server-side rendering (SSR), file-system based routing, and TypeScript.

**Features**: React 19 + React Router 7.14 + Vite + Tailwind CSS v4 + SSR + TypeScript strict mode + Docker ready

---

## Quick Start

### Prerequisites
- Node.js 20+ or Bun
- npm, yarn, or bun package manager

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/react-router-v7-boilerplate.git
cd react-router-v7-boilerplate

# Install dependencies
npm install
# or
bun install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

**Hot Module Replacement (HMR)** enabled — changes reflect instantly without page reload.

### Type Checking

```bash
npm run typecheck
```

Generates route types and runs TypeScript compiler.

### Production Build

```bash
npm run build
```

Outputs optimized build to `build/` directory.

### Serve Locally

```bash
npm run start
```

Runs built app on [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
app/
├── root.tsx                       # Root layout, HTML scaffold, error boundary
├── app.css                        # Global styles (imports tailwindcss)
├── routes.ts                      # Route configuration (auto-generated from files)
├── modules/                       # Modular pages and APIs
│   ├── __root.tsx                # Shared layout for all module pages
│   └── __homepage.tsx            # Homepage component (renders at /)
└── api/
    └── health.ts                  # Health check endpoint (GET /api/health)
```

## Architecture

### File-System Based Routing

Routes are **automatically generated** from file structure:

- **Pages**: `app/modules/**/pages/**/*.tsx` → routes
  - `app/modules/__homepage.tsx` → `/`
  - `app/modules/pages/about.tsx` → `/about`

- **APIs**: `app/api/**/*.ts` and `app/modules/**/api/**/*.ts` → `/api/**`
  - `app/api/health.ts` → `GET /api/health`
  - `app/modules/auth/api/login.ts` → `POST /api/auth/login`

### Module Structure

Each feature is a self-contained module:

```
app/modules/auth/
├── pages/
│   ├── login-page.tsx
│   └── register-page.tsx
├── api/
│   ├── login.ts
│   └── register.ts
├── hooks/
│   └── use-auth.ts
└── types/
    └── auth.types.ts
```

### Server-Side Rendering (SSR)

- HTML is rendered on server before sent to client (faster first paint, SEO-friendly)
- Disable in `react-router.config.ts` if building SPA-only app
- Data loading via `loader` functions happens before page renders

---

## Documentation

Comprehensive documentation is available in the `docs/` directory:

| Document | Purpose |
|----------|---------|
| [project-overview-pdr.md](docs/project-overview-pdr.md) | Project overview, tech stack, architecture decisions, PDR |
| [codebase-summary.md](docs/codebase-summary.md) | Directory structure, file descriptions, dependencies |
| [code-standards.md](docs/code-standards.md) | TypeScript, React, file naming, security, testing |
| [system-architecture.md](docs/system-architecture.md) | High-level architecture, data flow, routing, build pipeline |
| [project-roadmap.md](docs/project-roadmap.md) | Phases 2-7 (auth, forms, testing, DevOps, hardening, scale) |
| [deployment-guide.md](docs/deployment-guide.md) | Docker, Node.js DIY, cloud platforms (AWS, GCP, Azure, Railway, Fly.io) |

**Start here**: Read `docs/project-overview-pdr.md` for project purpose and tech decisions.

---

## Key Technologies

| Tech | Version | Why |
|------|---------|-----|
| React | 19.2.4 | Latest stable with improvements |
| React Router | 7.14.0 | Full-stack routing with built-in SSR |
| TypeScript | 5.9.3 | Strict mode for type safety |
| Vite | 8.0.3 | Fast build tool and dev server |
| Tailwind CSS | 4.2.2 | Latest, with Vite plugin |
| modules-page-routing | 0.1.22 | Convention-based file routing |
| react-router-define-api | 0.1.7 | Type-safe API declarations |

---

## Development Guidelines

### Code Standards

All code must follow standards in [docs/code-standards.md](docs/code-standards.md):

- **TypeScript**: Strict mode mandatory
- **Files**: kebab-case names
- **Components**: Function components only
- **Styling**: Tailwind CSS utilities
- **Error Handling**: Always use Error objects
- **Security**: Validate inputs, use `rel="noopener"`, avoid `dangerouslySetInnerHTML`

### Formatting & Linting

Uses **Ultracite** (Biome preset) for automated code quality:

```bash
# Format code
npm exec -- ultracite fix

# Check for issues
npm exec -- ultracite check
```

### Adding New Features

1. **New Page**:
   ```bash
   touch app/modules/pages/my-page.tsx
   ```
   Export a default React component. Route automatically created at `/my-page`.

2. **New Module**:
   ```bash
   mkdir -p app/modules/my-feature/pages
   mkdir -p app/modules/my-feature/api
   ```
   Create pages and APIs inside. Routes auto-generated.

3. **New API Endpoint**:
   ```typescript
   // app/modules/auth/api/login.ts
   import { defineApi } from 'react-router-define-api';
   
   export const { action } = defineApi()
     .post(async (req) => {
       const { email, password } = await req.json();
       // validate and authenticate
       return { ok: true, token: '...' };
     })
     .build();
   ```
   Endpoint available at `POST /api/auth/login`.

---

## Deployment

### Docker (Recommended)

```bash
# Build
docker build -t my-app:latest .

# Run
docker run -p 3000:3000 my-app:latest
```

Supports all major cloud platforms (AWS ECS, Google Cloud Run, Azure, Fly.io, Railway, etc.).

See [deployment-guide.md](docs/deployment-guide.md) for detailed instructions for each platform.

### Node.js DIY

Deploy the `build/` directory output:

```bash
npm run build
npm install --production  # Install only prod deps
npm run start  # Start server on port 3000
```

Requires Node.js 20+ on your server.

### Environment Variables

Create `.env.production` (never commit):

```bash
DATABASE_URL=postgresql://...
API_KEY=...
```

Pass to container via `-e` flag or platform secrets.

---

## Health Check

The boilerplate includes a built-in health check endpoint:

```bash
curl http://localhost:3000/api/health
# { "status": "ok" }
```

Use this for load balancers, Kubernetes probes, or uptime monitoring.

---

## Project Roadmap

**Phase 1** (Current): MVP boilerplate ✓

**Phase 2-7** planned in [docs/project-roadmap.md](docs/project-roadmap.md):
- Phase 2: Authentication & Database
- Phase 3: Form Handling & Validation
- Phase 4: Testing Suite
- Phase 5: Enhanced DX & DevOps
- Phase 6: Production Hardening
- Phase 7: Scalability & Enterprise Features

---

## Troubleshooting

### Port already in use
```bash
# Change dev port
PORT=5174 npm run dev

# Change start port
PORT=3001 npm run start
```

### TypeScript errors
```bash
npm run typecheck
```

### Build fails
```bash
# Clear caches
rm -rf build/ .react-router/
npm run build
```

### Routes not working
Ensure files follow naming convention:
- Pages: `app/modules/pages/*.tsx` or nested in modules
- APIs: `app/api/*.ts` or `app/modules/*/api/*.ts`

Check `app/routes.ts` for glob patterns.

---

## Community & Resources

- **React Router Docs**: [reactrouter.com](https://reactrouter.com/)
- **Vite Guide**: [vitejs.dev](https://vitejs.dev/)
- **Tailwind Docs**: [tailwindcss.com](https://tailwindcss.com/)
- **TypeScript Handbook**: [typescriptlang.org](https://www.typescriptlang.org/)

---

## License

MIT — Feel free to use this template for any project.

---

**Last Updated**: 2026-04-09  
**Status**: MVP (Phase 1 Complete)  
**Version**: 1.0.0
