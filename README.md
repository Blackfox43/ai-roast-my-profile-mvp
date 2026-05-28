# AI Roast My Profile — MVP Edition

A viral AI bio/profile roasting app built with React, Vite, Express, and Gemini. This version has been upgraded from prototype status into a stronger MVP foundation.

## What changed in the MVP upgrade

- Persistent production storage through `DATABASE_URL` using PostgreSQL.
- Local development fallback using `roasts.local.json`.
- Server-side input validation and 1,000-character hard limit.
- Simple IP-based API rate limiting to protect AI credits.
- Strong random share IDs using Node crypto.
- Optional public Wall of Shame sharing. Public listing is off by default.
- Emails, phone numbers, and links are redacted before AI generation/storage.
- Delete-token flow so the creating browser can delete its own roast.
- Safer roast prompt: satire without medical diagnosis wording, hate speech, threats, or private-info amplification.
- Privacy and Terms summaries in the UI.
- Cleaner package name, environment variables, and deployment notes.

## Tech stack

- React 19
- Vite
- Express
- Gemini API via `@google/genai`
- PostgreSQL via `postgres`
- Tailwind CSS v4

## Local setup

```bash
npm install
cp .env.example .env
# Add your GEMINI_API_KEY to .env
npm run dev
```

Open the local URL shown in your terminal. To test without spending AI credits, set `MOCK_AI="true"` in `.env`.

## Production setup

1. Create a PostgreSQL database with Neon, Supabase, Railway, Vercel Postgres, or another provider.
2. Add these environment variables to your host:
   - `GEMINI_API_KEY`
   - `DATABASE_URL`
   - `ROAST_MODEL` if you want to override the default
3. Deploy the app.

The server automatically creates the required `roasts` table on startup. You can also run `docs/database.sql` manually.

## Important production checklist

Before marketing heavily or applying for ads, add:

- Full legal Privacy Policy and Terms pages tailored to your business/entity.
- Abuse/report button for public roasts.
- Stronger distributed rate limiting, such as Upstash Redis, if traffic grows.
- CAPTCHA on `/api/roast` if bots attack your AI credits.
- Real analytics such as Plausible, PostHog, or Google Analytics.
- Domain-specific brand assets, favicon, Open Graph preview image, and SEO metadata.

## API routes

- `GET /api/health` — health check and storage mode.
- `POST /api/roast` — create roast.
- `GET /api/roasts` — recent public roasts only.
- `GET /api/roast/:id` — fetch a shareable roast.
- `POST /api/roast/:id/share` — increment share count.
- `DELETE /api/roast/:id` — delete with browser-held delete token.

## Notes

This is an entertainment product. The AI output should be treated as satirical parody, not factual analysis, psychological advice, or a serious judgment of a person.
