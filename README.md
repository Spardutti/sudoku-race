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

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |

**Security Note:** Never commit `.env.local` to version control. The `.env*` pattern is included in `.gitignore`.

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

Production URL: [To be added after deployment]

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
