# Sudoku Race

A competitive daily Sudoku puzzle game with real-time leaderboards and social sharing features.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **React:** 19.2.0
- **TypeScript:** 5.x (Strict mode enabled)
- **Styling:** Tailwind CSS 4
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel
- **Code Quality:** ESLint + Prettier

## Getting Started

### Prerequisites

- Node.js 20.x or later
- npm or yarn package manager

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/sudoku-race.git
cd sudoku-race
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Note:** Supabase credentials will be obtained in Story 1.2 when the database is set up.

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

**Available Routes:**
- `/` - Home page
- `/puzzle` - Today's puzzle (production-ready)
- `/demo/grid` - Grid component demo
- `/demo/input` - Input system demo (deprecated - use `/puzzle` instead)

### Database Migrations

This project uses **Supabase CLI** for version-controlled database migrations. All schema changes must go through migrations to ensure reproducibility across environments.

#### Quick Start

```bash
# Start local Supabase (includes PostgreSQL, Auth, Realtime)
npm run db:start

# Apply all migrations to local database
npm run db:reset

# Create a new migration
npm run migration:new add_new_feature

# Test application with local database
npm run dev
```

**Local Supabase Studio:** http://localhost:54323 (database management UI)

#### Migration Workflow

```
Create → Test Locally → Review → Deploy to Production
```

1. **Create** migration: `npm run migration:new <description>`
2. **Edit** migration file in `supabase/migrations/`
3. **Test** locally: `npm run db:reset`
4. **Verify** schema: `npm run db:diff`
5. **Commit** migration file to git
6. **Deploy** to production: `npm run db:push`

#### Important Notes

- ✅ **Always test migrations locally** before deploying
- ✅ **All migrations must be idempotent** (use `IF NOT EXISTS`)
- ✅ **Include rollback steps** in migration comments
- ✅ **Never make manual schema changes** in Supabase Dashboard
- ⚠️ **Deploy during low-traffic windows** (2-4am UTC recommended)

📖 **Full documentation:** [Database Migrations Guide](./docs/database-migrations.md)

### Available Scripts

**Development:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

**Testing:**
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

**Database Migrations:**
- `npm run db:start` - Start local Supabase instance
- `npm run db:stop` - Stop local Supabase instance
- `npm run db:reset` - Reset database and apply all migrations
- `npm run db:diff` - Show schema differences between local and remote
- `npm run db:push` - Deploy migrations to production
- `npm run migration:new` - Create new migration file

**Puzzle Management:**
- `npm run puzzle:seed` - Generate and seed today's daily puzzle

### Daily Puzzle Seeding

The application requires daily Sudoku puzzles to be seeded into the database. Use the puzzle seed script to generate and store puzzles.

#### Quick Start

```bash
# Add service role key to .env.local (one-time setup)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Seed today's puzzle
npm run puzzle:seed
```

#### Expected Output

```
🎲 Generating daily Sudoku puzzle...

✅ Valid puzzle generated with unique solution
📅 Puzzle date: 2025-11-16
🧩 Difficulty: medium
📊 Empty cells: 52

✅ Puzzle successfully inserted into database
   ID: 550e8400-e29b-41d4-a716-446655440000
   Date: 2025-11-16
   Difficulty: medium
```

#### Troubleshooting

**Error: Missing Supabase environment variables**
- Ensure `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set in `.env.local`
- Get the service role key from: Supabase Dashboard → Project Settings → API → service_role key

**Warning: Puzzle for today already exists**
- This is expected if you've already seeded today's puzzle
- The script gracefully exits without error
- To seed a different date, you'll need to manually modify the script (future enhancement)

**Error: Row-level security policy violation**
- Verify you're using the `SUPABASE_SERVICE_ROLE_KEY`, not the anon key
- The service role key bypasses RLS (required for inserting puzzles)

#### Production Deployment

For MVP, puzzles are seeded manually. Future enhancements will add automated daily seeding via Vercel cron jobs.

```bash
# Manual seeding workflow (run daily at 00:00 UTC)
npm run puzzle:seed
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (client-side) | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only, for puzzle seeding) | Yes* |

**Required for:**
- `*` Service role key is required for puzzle seeding (`npm run puzzle:seed`). Not needed for running the application.

**Security Note:** Never commit `.env.local` to version control. The `.env*` pattern is included in `.gitignore`. The service role key bypasses Row Level Security - keep it secret and never expose it to the client.

## Project Structure

```
/app                    # Next.js App Router
  /layout.tsx          # Root layout
  /page.tsx            # Home page
  /globals.css         # Global styles with Tailwind

/components            # React components
  /layout/             # Header, Footer
  /ui/                 # Design system components

/lib                   # Utility functions
  /supabase.ts         # Supabase client
  /utils.ts            # Helper functions

/types                 # TypeScript type definitions
  /database.ts         # Supabase types
  /index.ts            # App-wide types

/public                # Static assets
  /fonts/              # Custom fonts
  /images/             # Logos, OG images

/docs                  # Project documentation
```

## Deployment

This application is deployed on Vercel with automatic deployments:

- **Production:** Deployed from `main` branch
- **Preview:** Automatic preview deployments for feature branches

Production URL: https://sudoku-race.vercel.app/

## Code Quality

This project uses:

- **TypeScript Strict Mode** for type safety
- **ESLint** with Next.js recommended rules
- **Prettier** for consistent code formatting

Run quality checks before committing:

```bash
npm run lint
npm run format
```

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run linting and formatting
4. Commit your changes
5. Push and create a Pull Request

## License

MIT
