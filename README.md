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
1. Start the studio:
```bash
pnpm sanity dev
```
1. Open the studio at `http://localhost:3333/studio` by default.

## Content Model
- `Category`: Street, Travel, Documentary
- `Photo`: image, caption, categories
- `Project`: cover image, series of photos, description
- `Site Settings`: bio, portrait, email, contact form toggle

## Contact Form
The contact form posts to `app/api/contact/route.ts` and logs requests.
Replace it with an email provider (Resend, Postmark, etc.) when ready.

## Deploy
- Push to GitHub and import in Vercel.
- Set environment variables (`NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`).
- Deploy.
