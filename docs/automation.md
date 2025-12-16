# Automation

## Daily Puzzle Generation

The application includes automated daily puzzle generation using Vercel Cron Jobs.

### How It Works

Every day at 23:00 UTC (11 PM), a cron job automatically generates puzzles for the next day across all active difficulty levels (easy, medium).

### Architecture

The system follows serverless best practices:

1. **Shared Utility** (`lib/sudoku/puzzle-generator.ts`): Core puzzle generation logic used by both CLI scripts and API routes
2. **API Route** (`app/api/cron/generate-puzzle/route.ts`): Serverless endpoint that generates tomorrow's puzzles
3. **Cron Configuration** (`vercel.json`): Vercel cron schedule definition

### Configuration

#### Environment Variables

The cron job requires these environment variables in your Vercel project:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (for admin access)
- `CRON_SECRET`: Secret token for authenticating cron requests (optional but recommended)

To set up `CRON_SECRET`:

1. Generate a secure random string (at least 16 characters):
   ```bash
   openssl rand -base64 32
   ```
2. Add it to your Vercel project environment variables
3. Vercel will automatically include this as a Bearer token when calling your cron endpoint

#### Cron Schedule

Defined in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/generate-puzzle",
      "schedule": "0 23 * * *"
    }
  ]
}
```

The schedule `0 23 * * *` means:
- **Minute**: 0
- **Hour**: 23 (11 PM UTC)
- **Day of Month**: * (every day)
- **Month**: * (every month)
- **Day of Week**: * (every day of the week)

To change the schedule, modify the cron expression. Examples:
- `0 0 * * *` - Daily at midnight UTC
- `0 12 * * *` - Daily at noon UTC
- `30 23 * * *` - Daily at 11:30 PM UTC

### Manual Testing

You can manually trigger puzzle generation:

#### Using the API Route (Local Development)

```bash
curl http://localhost:3000/api/cron/generate-puzzle
```

#### Using the API Route (Production)

```bash
curl https://your-domain.com/api/cron/generate-puzzle \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

#### Using the CLI Script

```bash
npm run puzzle:seed:multi 1 2025-12-22
```

This generates puzzles for a specific date (YYYY-MM-DD format).

### Response Format

The API returns a JSON response:

```json
{
  "success": true,
  "date": "2025-12-17",
  "generated": 2,
  "skipped": 0,
  "failed": 0,
  "results": [
    {
      "success": true,
      "puzzleId": "uuid",
      "difficulty": "easy",
      "date": "2025-12-17"
    },
    {
      "success": true,
      "puzzleId": "uuid",
      "difficulty": "medium",
      "date": "2025-12-17"
    }
  ]
}
```

### Monitoring

Monitor cron job execution in the Vercel dashboard:

1. Go to your project in Vercel
2. Navigate to the "Cron Jobs" tab
3. View execution history, logs, and status

### Limitations

- **Hobby Plan**: Maximum 2 cron jobs
- **Pro Plan**: Maximum 40 cron jobs
- **Timeout**: 60 seconds (Hobby), 300 seconds (Pro)
- **Production Only**: Cron jobs only run on production deployments

### Troubleshooting

#### Cron job not running

1. Verify you're on a production deployment (not preview)
2. Check Vercel dashboard for execution logs
3. Ensure `vercel.json` is committed to your repository
4. Verify environment variables are set in Vercel

#### Authentication errors

1. Check that `CRON_SECRET` is set in Vercel environment variables
2. Verify the secret matches between Vercel and your test requests
3. Remember: Vercel automatically adds the `Authorization` header with the `CRON_SECRET`

#### Puzzle generation failures

1. Check Vercel function logs for detailed error messages
2. Verify Supabase credentials are correct
3. Ensure database has the correct schema and permissions
4. Test the seed script locally: `npm run puzzle:seed:multi 1 [date]`

### Future Enhancements

Possible improvements to the automation system:

- Retry logic for failed generations
- Notifications on failure (email, Slack, etc.)
- Generate multiple days ahead as backup
- Analytics and monitoring integration
- Support for scheduling multiple difficulty levels separately
