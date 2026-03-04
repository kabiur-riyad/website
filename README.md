# Photography Portfolio (Next.js + Sanity)

Minimalist portfolio for street, travel, and documentary photography.

## Quick Start
1. Install dependencies:
```bash
pnpm install
```
1. Create `.env.local` from `.env.example` and add your Sanity project info.
1. Run the Next.js app:
```bash
pnpm dev
```

## Sanity Studio
1. Start the studio locally:
```bash
pnpm sanity dev
```
1. Open the studio at `http://localhost:3333/studio`.

### Hosted Studio
Deploy the Studio once:
```bash
npx sanity deploy
```
Then access it at `https://<your-hostname>.sanity.studio`.

## Content Model
- `Photo`: image, caption
- `Project`: cover image, series of photos, description
- `Site Settings`: bio, portrait, email, contact blurb, favicon, Instagram URL

## Contact Form
The contact form posts to `app/api/contact/route.ts` and sends email via Resend.
Set `RESEND_API_KEY` in environment variables and verify `messages@riyad.pro.bd`.

## Deploy
- Push to GitHub and import in Vercel.
- Set environment variables:
  - `NEXT_PUBLIC_SANITY_PROJECT_ID`
  - `NEXT_PUBLIC_SANITY_DATASET`
  - `RESEND_API_KEY`
  - `NEXT_PUBLIC_SANITY_STUDIO_URL` (optional: hosted studio URL)
- Deploy.
